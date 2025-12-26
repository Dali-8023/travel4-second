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
    
    try {
        const { city, month, duration = 3, amapKey, doubaoKey } = req.body;
        
        if (!city || !month) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数：city和month'
            });
        }
        
        console.log(`生成攻略：${city}，${month}月，${duration}天`);
        
        // 1. 获取城市基本信息
        const cityInfo = await getCityInfo(city, amapKey);
        
        // 2. 使用豆包API生成智能攻略
        const aiGuide = await generateAIGuide(city, month, duration, doubaoKey);
        
        // 3. 获取景点数据
        const attractions = await getAttractions(city, amapKey);
        
        // 4. 生成完整攻略数据
        const completeGuide = await buildCompleteGuide(
            city, 
            month, 
            duration, 
            cityInfo, 
            aiGuide, 
            attractions
        );
        
        res.status(200).json({
            success: true,
            data: completeGuide,
            generatedAt: new Date().toISOString(),
            source: '豆包AI + 高德地图'
        });
        
    } catch (error) {
        console.error('生成攻略失败:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: generateFallbackGuide(req.body) // 返回备用攻略
        });
    }
};

// 获取城市信息
async function getCityInfo(cityName, amapKey) {
    try {
        const url = `https://restapi.amap.com/v3/geocode/geo?key=${amapKey}&address=${encodeURIComponent(cityName)}`;
        const response = await fetch(url);
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
        console.warn('获取城市信息失败:', error);
    }
    
    // 返回默认信息
    return {
        name: cityName,
        coordinates: '116.4074,39.9042', // 默认北京
        adcode: '110000',
        level: 'city'
    };
}

// 使用豆包API生成智能攻略
async function generateAIGuide(city, month, duration, apiKey) {
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                       '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const season = getSeason(month);
    const monthName = monthNames[month - 1] || monthNames[0];
    
    // 构建提示词
    const prompt = `作为专业旅游规划师，请为${city}的${monthName}（${season}季）${duration}天${duration-1}晚旅行生成一份详细攻略。

要求生成JSON格式数据，包含以下结构：

{
  "overview": "${city}${monthName}旅行概况（100字内）",
  "weather_info": {
    "temperature": "平均温度范围",
    "precipitation": "降水情况",
    "wind": "风力风向",
    "dressing_tips": "穿衣建议"
  },
  "attractions": [
    {
      "name": "景点名称",
      "type": "自然/历史/文化/娱乐",
      "description": "景点特色描述（50字内）",
      "recommended_time": "建议游览时长",
      "best_time": "最佳游览时间",
      "ticket_price": "门票价格范围"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "行程标题",
      "distance": "当日行程距离（公里）",
      "duration": "建议游览时间",
      "activities": [
        {
          "time": "时间点",
          "activity": "活动内容",
          "description": "活动描述"
        }
      ]
    }
  ],
  "budget": {
    "total": "总预算（元）",
    "breakdown": {
      "transportation": "交通费用",
      "accommodation": "住宿费用",
      "food": "餐饮费用",
      "activities": "活动门票",
      "shopping": "购物及其他"
    },
    "details": {
      "transportation": "交通费用明细",
      "accommodation": "住宿费用明细",
      "food": "餐饮费用明细"
    }
  },
  "food_recommendations": [
    {
      "name": "美食名称",
      "description": "美食特色",
      "recommended_restaurants": "推荐店铺",
      "price_range": "价格范围"
    }
  ],
  "accommodation_suggestions": [
    "住宿建议1",
    "住宿建议2",
    "住宿建议3"
  ],
  "local_tips": [
    "当地实用贴士1",
    "当地实用贴士2",
    "当地实用贴士3"
  ],
  "weather_tips": [
    "天气相关贴士1",
    "天气相关贴士2"
  ],
  "transportation_tips": [
    "交通出行贴士1",
    "交通出行贴士2"
  ],
  "food_tips": [
    "美食相关贴士1",
    "美食相关贴士2"
  ],
  "photo_tips": [
    "摄影拍照贴士1",
    "摄影拍照贴士2"
  ],
  "luggage_list": [
    "必备物品1",
    "必备物品2",
    "必备物品3"
  ],
  "ai_recommendations": [
    {
      "title": "推荐主题",
      "description": "推荐理由"
    }
  ],
  "quick_stats": {
    "attractions_count": "景点数量",
    "food_count": "美食推荐数量",
    "photo_spots": "最佳拍照点数量"
  }
}

注意：
1. 基于真实旅游数据和用户评价
2. 价格参考2024年市场行情
3. 提供实用的本地人建议
4. 考虑${season}季的气候特点
5. 包含抖音/小红书热门打卡点`;

    try {
        // 豆包API调用
        // ========== 【新增调试日志：检查请求】==========
        console.log('【豆包调试】准备调用API，密钥（前8位）:', (apiKey || process.env.DOUBAO_KEY || '').substring(0, 8) + '...');
        const requestUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
        console.log('【豆包调试】请求URL:', requestUrl);
        // ========== 【调试日志结束】==========

        const doubaoResponse = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey || process.env.DOUBAO_KEY}`
            },
            body: JSON.stringify({
                model: 'doubao-seed-1-8-251215',
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的旅游规划师，精通中国各地旅游攻略。请提供准确、实用、详细的旅行建议。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        // ========== 【新增调试日志：检查HTTP响应】==========
        console.log('【豆包调试】HTTP状态码:', doubaoResponse.status, doubaoResponse.statusText);
        const rawResponseText = await doubaoResponse.text(); // 先以文本形式读取
        console.log('【豆包调试】原始响应文本（前500字符）:', rawResponseText.substring(0, 500));
        // ========== 【调试日志结束】==========

        // *** 核心修改点：以下整个 try-catch 块用于解析JSON，它代替了原来的 .json() 调用，并且只声明一次 data ***
        let data; // 这是整个try块中唯一的 data 变量声明
        try {
            data = JSON.parse(rawResponseText);
        } catch (parseError) {
            console.error('【豆包调试】响应不是有效JSON! 错误信息:', parseError.message);
            // 如果连JSON都不是，说明API返回了错误页面或明文错误信息
            throw new Error(`豆包API返回了非JSON数据，状态码: ${doubaoResponse.status}，内容: ${rawResponseText.substring(0, 200)}`);
        }

        // ========== 【新增调试日志：检查解析后的数据】==========
        console.log('【豆包调试】解析后数据 keys:', Object.keys(data));
        if (data.error) {
            console.error('【豆包调试】API返回错误对象:', JSON.stringify(data.error, null, 2));
        }
        if (data.choices) {
            console.log('【豆包调试】choices 数组长度:', data.choices.length);
        }
        // ========== 【调试日志结束】==========
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const content = data.choices[0].message.content;
            
            // 尝试解析JSON
            try {
                // 提取JSON部分
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                                  content.match(/{[\s\S]*}/);
                
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
                }
            } catch (parseError) {
                console.warn('解析AI响应失败:', parseError);
            }
            
            // 如果解析失败，使用结构化处理
            return structureAIResponse(content, city, month, duration);
        }
        
        throw new Error('豆包API响应格式错误');
        
    } catch (error) {
        console.error('调用豆包API失败:', error);
        // 返回模拟数据
        return generateMockGuide(city, month, duration);
    }
}

// 结构化处理AI响应
function structureAIResponse(content, city, month, duration) {
    const monthName = getChineseMonthName(month);
    const season = getSeason(month);
    
    // 这是一个简化的解析器
    const sections = content.split(/\n\n+/);
    
    return {
        overview: `${city}在${monthName}（${season}季）是一个理想的旅行目的地。这里气候适宜，风景优美，适合进行${duration}天的深度游。`,
        weather_info: {
            temperature: getTemperatureBySeason(season),
            precipitation: getPrecipitationBySeason(season),
            wind: '微风',
            dressing_tips: getDressingTips(season)
        },
        attractions: generateMockAttractions(city, 5),
        itinerary: generateMockItinerary(city, duration),
        budget: generateMockBudget(city, duration),
        food_recommendations: generateMockFood(city),
        accommodation_suggestions: [
            `${city}市中心酒店`,
            `${city}特色民宿`,
            `${city}景区附近住宿`
        ],
        local_tips: [
            `在${city}旅行，建议使用公共交通`,
            `${city}本地人喜欢早睡早起，注意作息时间`,
            `尝试与${city}当地人交流，了解更多文化`
        ],
        weather_tips: getWeatherTips(season),
        transportation_tips: [
            '下载当地交通APP',
            '避开早晚高峰',
            '使用网约车更方便'
        ],
        food_tips: [
            '尝试当地特色小吃',
            '注意食品卫生',
            '询问当地人推荐'
        ],
        photo_tips: [
            '早晚光线最适合拍照',
            '寻找特色建筑作为背景',
            '捕捉当地人生活瞬间'
        ],
        luggage_list: getLuggageList(season),
        ai_recommendations: [
            {
                title: '深度文化体验',
                description: '建议参观当地博物馆和历史遗迹'
            },
            {
                title: '美食探索',
                description: '不要错过当地特色美食'
            }
        ],
        quick_stats: {
            attractions_count: 5,
            food_count: 3,
            photo_spots: 5
        }
    };
}

// 获取景点数据
async function getAttractions(city, amapKey) {
    try {
        const types = '风景名胜|公园广场|博物馆|展览馆|美术馆|纪念馆|寺庙道观|旅游景点';
        const url = `https://restapi.amap.com/v3/place/text?key=${amapKey}&keywords=${encodeURIComponent(city)}&types=${encodeURIComponent(types)}&city=${encodeURIComponent(city)}&offset=20&page=1&extensions=all`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === '1' && data.pois && data.pois.length > 0) {
            return data.pois.map(poi => ({
                name: poi.name,
                type: poi.type,
                coordinates: poi.location,
                address: poi.address,
                rating: parseFloat(poi.biz_ext?.rating || '4.0'),
                cost: estimateCost(poi.type)
            }));
        }
    } catch (error) {
        console.warn('获取景点数据失败:', error);
    }
    
    return [];
}

// 构建完整攻略
async function buildCompleteGuide(city, month, duration, cityInfo, aiGuide, attractions) {
    const monthName = getChineseMonthName(month);
    const season = getSeason(month);
    
    return {
        city: city,
        month: month,
        month_name: monthName,
        season: season,
        duration: duration,
        coordinates: cityInfo.coordinates,
        
        // AI生成的内容
        overview: aiGuide.overview || `${city}${monthName}旅行攻略`,
        weather_info: aiGuide.weather_info || {
            temperature: '20-25°C',
            precipitation: '较少',
            wind: '微风',
            dressing_tips: '舒适休闲装'
        },
        
        // 景点数据
        attractions: mergeAttractions(aiGuide.attractions, attractions),
        
        // 行程安排
        itinerary: aiGuide.itinerary || generateMockItinerary(city, duration),
        
        // 预算信息
        budget: aiGuide.budget || generateMockBudget(city, duration),
        
        // 美食推荐
        food_recommendations: aiGuide.food_recommendations || generateMockFood(city),
        
        // 住宿建议
        accommodation_suggestions: aiGuide.accommodation_suggestions || [
            `${city}市中心酒店`,
            `${city}特色民宿`
        ],
        
        // 实用贴士
        local_tips: aiGuide.local_tips || [
            `在${city}旅行，建议使用公共交通`
        ],
        weather_tips: aiGuide.weather_tips || getWeatherTips(season),
        transportation_tips: aiGuide.transportation_tips || [
            '下载当地交通APP'
        ],
        food_tips: aiGuide.food_tips || [
            '尝试当地特色小吃'
        ],
        photo_tips: aiGuide.photo_tips || [
            '早晚光线最适合拍照'
        ],
        
        // 行李清单
        luggage_list: aiGuide.luggage_list || getLuggageList(season),
        
        // AI推荐
        ai_recommendations: aiGuide.ai_recommendations || [
            {
                title: '深度体验',
                description: '建议深入了解当地文化'
            }
        ],
        
        // 统计数据
        quick_stats: aiGuide.quick_stats || {
            attractions_count: attractions.length || 5,
            food_count: 3,
            photo_spots: 5
        },
        
        // 生成时间
        generated_at: new Date().toISOString()
    };
}

// 辅助函数
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

function getTemperatureBySeason(season) {
    const temps = {
        '春季': '15-25°C',
        '夏季': '25-35°C',
        '秋季': '10-20°C',
        '冬季': '-5-10°C'
    };
    return temps[season] || '15-25°C';
}

function getPrecipitationBySeason(season) {
    const precip = {
        '春季': '较少',
        '夏季': '较多',
        '秋季': '适中',
        '冬季': '较少'
    };
    return precip[season] || '适中';
}

function getDressingTips(season) {
    const tips = {
        '春季': '薄外套、长袖衬衫',
        '夏季': '短袖、防晒衣、太阳镜',
        '秋季': '外套、长裤、围巾',
        '冬季': '羽绒服、毛衣、帽子手套'
    };
    return tips[season] || '舒适休闲装';
}

function getWeatherTips(season) {
    const tips = {
        '春季': ['春季温差大，注意增减衣物', '注意花粉过敏'],
        '夏季': ['注意防晒防暑', '多喝水，预防中暑'],
        '秋季': ['秋季干燥，注意保湿', '早晚温差大，注意保暖'],
        '冬季': ['注意防寒保暖', '雪天注意防滑']
    };
    return tips[season] || ['注意天气变化'];
}

function getLuggageList(season) {
    const base = ['身份证', '手机充电器', '常用药品', '雨伞'];
    const seasonal = {
        '春季': ['薄外套', '过敏药'],
        '夏季': ['防晒霜', '太阳镜', '泳衣'],
        '秋季': ['外套', '保湿霜'],
        '冬季': ['厚外套', '手套', '围巾']
    };
    return [...base, ...(seasonal[season] || [])];
}

function estimateCost(type) {
    if (type.includes('公园') || type.includes('广场')) return 0;
    if (type.includes('博物馆') || type.includes('展览馆')) return 0;
    if (type.includes('风景名胜')) return 80;
    if (type.includes('寺庙')) return 50;
    return 40;
}

// 生成模拟数据函数
function generateMockAttractions(city, count) {
    const types = ['自然风光', '历史文化', '主题公园', '博物馆', '寺庙'];
    return Array.from({ length: count }, (_, i) => ({
        name: `${city}景点${i + 1}`,
        type: types[i % types.length],
        description: `${city}著名旅游景点，值得一游`,
        recommended_time: '2-3小时',
        best_time: '全天',
        ticket_price: i % 3 === 0 ? '免费' : '50-100元'
    }));
}

function generateMockItinerary(city, duration) {
    return Array.from({ length: duration }, (_, i) => ({
        day: i + 1,
        title: `第${i + 1}天：探索${city}`,
        distance: Math.floor(Math.random() * 40) + 20,
        duration: '8-10小时',
        activities: [
            { time: '09:00', activity: '早餐', description: '当地特色早餐' },
            { time: '10:00', activity: '景点游览', description: '参观主要景点' },
            { time: '12:00', activity: '午餐', description: '品尝当地美食' },
            { time: '14:00', activity: '继续游览', description: '探索更多地方' },
            { time: '18:00', activity: '晚餐', description: '享受当地晚餐' }
        ]
    }));
}

function generateMockBudget(city, duration) {
    const total = duration * 1000;
    return {
        total: total,
        breakdown: {
            transportation: Math.floor(total * 0.3),
            accommodation: Math.floor(total * 0.4),
            food: Math.floor(total * 0.2),
            activities: Math.floor(total * 0.08),
            shopping: Math.floor(total * 0.02)
        },
        details: {
            transportation: '往返交通及市内交通',
            accommodation: `${duration - 1}晚住宿`,
            food: '每日三餐及小吃'
        }
    };
}

function generateMockFood(city) {
    return [
        {
            name: `${city}特色菜1`,
            description: '当地著名美食',
            recommended_restaurants: '老字号餐厅',
            price_range: '50-100元'
        },
        {
            name: `${city}特色菜2`,
            description: '传统风味',
            recommended_restaurants: '小吃街',
            price_range: '20-50元'
        }
    ];
}

function mergeAttractions(aiAttractions, mapAttractions) {
    if (!aiAttractions || aiAttractions.length === 0) {
        return mapAttractions.slice(0, 5).map(att => ({
            name: att.name,
            type: att.type,
            description: `${att.name}是${att.address || '当地著名景点'}`,
            recommended_time: '2-3小时',
            best_time: '全天',
            ticket_price: att.cost ? `${att.cost}元` : '免费'
        }));
    }
    return aiAttractions;
}

function generateFallbackGuide(params) {
    const { city, month, duration = 3 } = params;
    const monthName = getChineseMonthName(month);
    const season = getSeason(month);
    
    return {
        city: city,
        month: month,
        month_name: monthName,
        season: season,
        duration: duration,
        coordinates: '116.4074,39.9042',
        overview: `${city}在${monthName}是一个美丽的旅行目的地。这里有着丰富的旅游资源，适合${duration}天的深度游玩。`,
        weather_info: {
            temperature: getTemperatureBySeason(season),
            precipitation: getPrecipitationBySeason(season),
            wind: '微风',
            dressing_tips: getDressingTips(season)
        },
        attractions: generateMockAttractions(city, 5),
        itinerary: generateMockItinerary(city, duration),
        budget: generateMockBudget(city, duration),
        food_recommendations: generateMockFood(city),
        accommodation_suggestions: [
            `${city}市中心酒店`,
            `${city}特色民宿`
        ],
        local_tips: [
            `在${city}旅行，建议提前规划行程`,
            '尊重当地风俗习惯',
            '注意人身和财物安全'
        ],
        weather_tips: getWeatherTips(season),
        transportation_tips: [
            '使用导航APP',
            '了解公共交通线路',
            '合理安排出行时间'
        ],
        food_tips: [
            '尝试当地特色',
            '注意饮食卫生',
            '适量品尝小吃'
        ],
        photo_tips: [
            '选择合适的光线',
            '捕捉特色瞬间',
            '注意构图'
        ],
        luggage_list: getLuggageList(season),
        ai_recommendations: [
            {
                title: '文化探索',
                description: '深入了解当地历史文化'
            },
            {
                title: '自然风光',
                description: '欣赏美丽的自然景观'
            }
        ],
        quick_stats: {
            attractions_count: 5,
            food_count: 3,
            photo_spots: 5
        },
        generated_at: new Date().toISOString(),
        note: '这是备用攻略，实际数据可能有所不同'
    };
}
