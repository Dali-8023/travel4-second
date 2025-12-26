// 使用豆包API生成旅游攻略
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // 超时处理：8秒内必须完成
    const timeout = setTimeout(() => {
        console.log('函数执行超时，返回备用攻略');
        const fallbackGuide = generateFallbackGuide(req.body || {});
        res.status(200).json({
            success: true,
            data: fallbackGuide,
            note: '由于生成时间较长，返回简化版攻略',
            generatedAt: new Date().toISOString()
        });
    }, 8000);
    
    try {
        const { city, month, duration = 3, amapKey, doubaoKey } = req.body;
        
        if (!city || !month) {
            clearTimeout(timeout);
            return res.status(400).json({
                success: false,
                error: '缺少必要参数：city和month'
            });
        }
        
        console.log(`快速生成攻略：${city}，${month}月，${duration}天`);
        
        // 1. 并行获取城市信息和景点数据
        let cityInfo, attractions;
        try {
            [cityInfo, attractions] = await Promise.all([
                getCityInfoFast(city, amapKey),
                getAttractionsFast(city, amapKey)
            ]);
        } catch (error) {
            console.warn('获取基础数据失败，使用默认值:', error);
            cityInfo = { name: city, coordinates: '116.4074,39.9042' };
            attractions = [];
        }
        
        // 2. 尝试获取AI攻略，但设置超时
        let aiGuide = null;
        if (doubaoKey) {
            try {
                aiGuide = await Promise.race([
                    generateAIGuideFast(city, month, duration, doubaoKey),
                    new Promise(resolve => setTimeout(() => resolve(null), 5000))
                ]);
            } catch (error) {
                console.warn('AI生成失败:', error.message);
            }
        }
        
        // 3. 生成完整攻略数据（快速版）
        const completeGuide = buildCompleteGuideFast(
            city, 
            month, 
            duration, 
            cityInfo, 
            aiGuide, 
            attractions
        );
        
        clearTimeout(timeout);
        res.status(200).json({
            success: true,
            data: completeGuide,
            generatedAt: new Date().toISOString(),
            source: aiGuide ? '豆包AI + 高德地图' : '高德地图 + 本地算法'
        });
        
    } catch (error) {
        clearTimeout(timeout);
        console.error('生成攻略失败:', error);
        res.status(200).json({  // 返回200而不是500，避免前端错误
            success: true,
            data: generateFallbackGuide(req.body || {}),
            note: '生成过程中出现错误，返回备用攻略'
        });
    }
};

// 快速获取城市信息
async function getCityInfoFast(cityName, amapKey) {
    if (!amapKey) {
        return {
            name: cityName,
            coordinates: '116.4074,39.9042',
            level: 'city'
        };
    }
    
    try {
        const url = `https://restapi.amap.com/v3/geocode/geo?key=${amapKey}&address=${encodeURIComponent(cityName)}`;
        const response = await fetch(url, { timeout: 3000 });
        const data = await response.json();
        
        if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
            const geo = data.geocodes[0];
            return {
                name: geo.formatted_address || cityName,
                coordinates: geo.location,
                adcode: geo.adcode,
                citycode: geo.citycode,
                level: geo.level
            };
        }
    } catch (error) {
        console.warn('快速获取城市信息失败:', error.message);
    }
    
    return {
        name: cityName,
        coordinates: '116.4074,39.9042',
        level: 'city'
    };
}

// 快速获取景点数据
async function getAttractionsFast(city, amapKey) {
    if (!amapKey) return [];
    
    try {
        const types = '风景名胜|公园广场|博物馆';
        const url = `https://restapi.amap.com/v3/place/text?key=${amapKey}&keywords=${encodeURIComponent(city)}&types=${encodeURIComponent(types)}&city=${encodeURIComponent(city)}&offset=10&page=1`;
        
        const response = await fetch(url, { timeout: 3000 });
        const data = await response.json();
        
        if (data.status === '1' && data.pois && data.pois.length > 0) {
            return data.pois.slice(0, 5).map(poi => ({
                name: poi.name,
                type: poi.type,
                coordinates: poi.location,
                address: poi.address,
                rating: parseFloat(poi.biz_ext?.rating || '4.0')
            }));
        }
    } catch (error) {
        console.warn('快速获取景点数据失败:', error.message);
    }
    
    return [];
}

// 快速生成AI攻略
async function generateAIGuideFast(city, month, duration, apiKey) {
    const monthName = getChineseMonthName(month);
    const season = getSeason(month);
    
    // 简化的提示词
    const prompt = `请为${city}的${monthName}（${season}季）${duration}天旅行生成一份简洁攻略。

只需JSON格式，结构如下：
{
  "overview": "100字概况",
  "attractions": [
    {"name": "景点", "description": "50字描述"}
  ],
  "itinerary": [
    {"day": 1, "activities": [
      {"time": "09:00", "activity": "活动"}
    ]}
  ]
}`;

    try {
        const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'doubao-1-5-lite-32k-250115',
                messages: [
                    {
                        role: 'system',
                        content: '生成简洁旅游攻略'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 800,
                timeout: 5000
            }),
            timeout: 5000
        });

        const rawText = await response.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            console.warn('AI响应非JSON格式');
            return null;
        }
        
        if (data.choices?.[0]?.message?.content) {
            const content = data.choices[0].message.content;
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1] || jsonMatch[0]);
            }
        }
    } catch (error) {
        console.warn('快速AI生成失败:', error.message);
    }
    
    return null;
}

// 快速构建完整攻略
function buildCompleteGuideFast(city, month, duration, cityInfo, aiGuide, attractions) {
    const monthName = getChineseMonthName(month);
    const season = getSeason(month);
    
    // 合并AI生成的内容和本地数据
    const mergedAttractions = aiGuide?.attractions || attractions.slice(0, 5).map(att => ({
        name: att.name,
        description: `${att.name} - ${att.address || '热门景点'}`
    }));
    
    const itinerary = aiGuide?.itinerary || generateSimpleItinerary(city, duration);
    
    return {
        city: city,
        month: month,
        month_name: monthName,
        season: season,
        duration: duration,
        coordinates: cityInfo.coordinates,
        overview: aiGuide?.overview || `${city}在${monthName}是个不错的旅行选择。`,
        attractions: mergedAttractions,
        itinerary: itinerary,
        food_recommendations: generateSimpleFood(city),
        budget: generateSimpleBudget(duration),
        quick_stats: {
            attractions_count: mergedAttractions.length,
            food_count: 3,
            duration_days: duration
        },
        generated_at: new Date().toISOString()
    };
}

// 以下辅助函数保持不变...
function getSeason(month) {
    if (month >= 3 && month <= 5) return '春季';
    if (month >= 6 && month <= 8) return '夏季';
    if (month >= 9 && month <= 11) return '秋季';
    return '冬季';
}

function getChineseMonthName(month) {
    const months = ['一月', '二月', '三月', '四月', '五月', '六月',
                   '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months[month - 1] || months[0];
}

function generateSimpleItinerary(city, duration) {
    return Array.from({ length: duration }, (_, i) => ({
        day: i + 1,
        title: `第${i + 1}天：${city}探索`,
        activities: [
            { time: '09:00', activity: '早餐' },
            { time: '10:00', activity: '参观景点' },
            { time: '12:00', activity: '午餐' },
            { time: '14:00', activity: '继续游览' },
            { time: '18:00', activity: '晚餐' }
        ]
    }));
}

function generateSimpleFood(city) {
    return [
        { name: `${city}特色菜`, description: '当地著名美食' },
        { name: `${city}小吃`, description: '传统风味小吃' }
    ];
}

function generateSimpleBudget(duration) {
    return {
        total: duration * 800,
        breakdown: {
            transportation: duration * 200,
            accommodation: duration * 400,
            food: duration * 150,
            activities: duration * 50
        }
    };
}

// 备用攻略函数保持不变
function generateFallbackGuide(params) {
    const { city = '北京', month = 5, duration = 3 } = params;
    const monthName = getChineseMonthName(month);
    const season = getSeason(month);
    
    return {
        city: city,
        month: month,
        month_name: monthName,
        season: season,
        duration: duration,
        coordinates: '116.4074,39.9042',
        overview: `${city}在${monthName}是个不错的旅行目的地，适合${duration}天游玩。`,
        attractions: [
            { name: `${city}地标`, description: '城市标志性建筑' },
            { name: `${city}公园`, description: '适合散步休闲' }
        ],
        itinerary: generateSimpleItinerary(city, duration),
        budget: generateSimpleBudget(duration),
        food_recommendations: generateSimpleFood(city),
        quick_stats: {
            attractions_count: 2,
            food_count: 2,
            duration_days: duration
        },
        generated_at: new Date().toISOString(),
        note: '这是快速生成的备用攻略'
    };
}
