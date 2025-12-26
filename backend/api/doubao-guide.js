// 使用豆包API生成旅游攻略
const fetch = require('node-fetch');

// 中国主要城市列表
const CITIES = [
    "北京市", "天津市", "上海市", "重庆市",
    "石家庄市", "唐山市", "秦皇岛市", "邯郸市", "邢台市", "保定市", 
    "张家口市", "承德市", "沧州市", "廊坊市", "衡水市",
    "太原市", "大同市", "阳泉市", "长治市", "晋城市", "朔州市", 
    "晋中市", "运城市", "忻州市", "临汾市", "吕梁市",
    "呼和浩特市", "包头市", "乌海市", "赤峰市", "通辽市",
    "鄂尔多斯市", "呼伦贝尔市", "巴彦淖尔市", "乌兰察布市",
    "沈阳市", "大连市", "鞍山市", "抚顺市", "本溪市", "丹东市",
    "锦州市", "营口市", "阜新市", "辽阳市", "盘锦市", "铁岭市",
    "朝阳市", "葫芦岛市",
    "长春市", "吉林市", "四平市", "辽源市", "通化市", "白山市",
    "松原市", "白城市",
    "哈尔滨市", "齐齐哈尔市", "鸡西市", "鹤岗市", "双鸭山市",
    "大庆市", "伊春市", "佳木斯市", "七台河市", "牡丹江市",
    "黑河市", "绥化市",
    "南京市", "无锡市", "徐州市", "常州市", "苏州市", "南通市",
    "连云港市", "淮安市", "盐城市", "扬州市", "镇江市", "泰州市", "宿迁市",
    "杭州市", "宁波市", "温州市", "嘉兴市", "湖州市", "绍兴市",
    "金华市", "衢州市", "舟山市", "台州市", "丽水市",
    "合肥市", "芜湖市", "蚌埠市", "淮南市", "马鞍山市", "淮北市",
    "铜陵市", "安庆市", "黄山市", "滁州市", "阜阳市", "宿州市",
    "六安市", "亳州市", "池州市", "宣城市",
    "福州市", "厦门市", "莆田市", "三明市", "泉州市", "漳州市",
    "南平市", "龙岩市", "宁德市",
    "南昌市", "景德镇市", "萍乡市", "九江市", "新余市", "鹰潭市",
    "赣州市", "吉安市", "宜春市", "抚州市", "上饶市",
    "济南市", "青岛市", "淄博市", "枣庄市", "东营市", "烟台市",
    "潍坊市", "济宁市", "泰安市", "威海市", "日照市", "临沂市",
    "德州市", "聊城市", "滨州市", "菏泽市",
    "郑州市", "开封市", "洛阳市", "平顶山市", "安阳市", "鹤壁市",
    "新乡市", "焦作市", "濮阳市", "许昌市", "漯河市", "三门峡市",
    "南阳市", "商丘市", "信阳市", "周口市", "驻马店市",
    "武汉市", "黄石市", "十堰市", "宜昌市", "襄阳市", "鄂州市",
    "荆门市", "孝感市", "荆州市", "黄冈市", "咸宁市", "随州市",
    "长沙市", "株洲市", "湘潭市", "衡阳市", "邵阳市", "岳阳市",
    "常德市", "张家界市", "益阳市", "郴州市", "永州市", "怀化市",
    "娄底市",
    "广州市", "韶关市", "深圳市", "珠海市", "汕头市", "佛山市",
    "江门市", "湛江市", "茂名市", "肇庆市", "惠州市", "梅州市",
    "汕尾市", "河源市", "阳江市", "清远市", "东莞市", "中山市",
    "潮州市", "揭阳市", "云浮市",
    "南宁市", "柳州市", "桂林市", "梧州市", "北海市", "防城港市",
    "钦州市", "贵港市", "玉林市", "百色市", "贺州市", "河池市",
    "来宾市", "崇左市",
    "海口市", "三亚市", "三沙市", "儋州市",
    "成都市", "自贡市", "攀枝花市", "泸州市", "德阳市", "绵阳市",
    "广元市", "遂宁市", "内江市", "乐山市", "南充市", "眉山市",
    "宜宾市", "广安市", "达州市", "雅安市", "巴中市", "资阳市",
    "贵阳市", "六盘水市", "遵义市", "安顺市", "毕节市", "铜仁市",
    "昆明市", "曲靖市", "玉溪市", "保山市", "昭通市", "丽江市",
    "普洱市", "临沧市",
    "拉萨市", "日喀则市", "昌都市", "林芝市", "山南市", "那曲市",
    "西安市", "铜川市", "宝鸡市", "咸阳市", "渭南市", "延安市",
    "汉中市", "榆林市", "安康市", "商洛市",
    "兰州市", "嘉峪关市", "金昌市", "白银市", "天水市", "武威市",
    "张掖市", "平凉市", "酒泉市", "庆阳市", "定西市", "陇南市",
    "西宁市",
    "银川市", "石嘴山市", "吴忠市", "固原市", "中卫市",
    "乌鲁木齐市", "克拉玛依市", "吐鲁番市", "哈密市", "昌吉市",
    "博乐市", "库尔勒市", "阿克苏市", "阿图什市", "喀什市",
    "和田市", "伊宁市", "塔城市", "阿勒泰市"
];

// 随机选择城市
function getRandomCity() {
    return CITIES[Math.floor(Math.random() * CITIES.length)];
}

// 随机选择月份
function getRandomMonth() {
    return Math.floor(Math.random() * 12) + 1;
}

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
    
    // 超时处理：9秒内必须完成（Vercel限制为10秒）
    const timeout = setTimeout(() => {
        console.log('函数执行超时，返回备用攻略');
        // 使用随机生成的参数创建备用攻略
        const randomCity = getRandomCity();
        const randomMonth = getRandomMonth();
        const fallbackGuide = generateFallbackGuide({ city: randomCity, month: randomMonth });
        res.status(200).json({
            success: true,
            data: fallbackGuide,
            note: '由于生成时间较长，返回简化版攻略',
            generatedAt: new Date().toISOString()
        });
    }, 9000);
    
    try {
        const { city, month, duration = 3, amapKey, doubaoKey } = req.body;
        
        // 如果没有提供城市或月份，随机生成
        const randomCity = getRandomCity();
        const randomMonth = getRandomMonth();
        const finalCity = city || randomCity;
        const finalMonth = month || randomMonth;
        
        console.log(`使用的城市：${finalCity}（${city ? '用户提供' : '随机生成'}），月份：${finalMonth}月（${month ? '用户提供' : '随机生成'}）`);
        
        console.log(`快速生成攻略：${finalCity}，${finalMonth}月，${duration}天`);
        
        // 1. 并行获取城市信息和景点数据
        let cityInfo, attractions;
        try {
            [cityInfo, attractions] = await Promise.all([
                getCityInfoFast(finalCity, amapKey),
                getAttractionsFast(finalCity, amapKey)
            ]);
        } catch (error) {
            console.warn('获取基础数据失败，使用默认值:', error);
            cityInfo = { name: finalCity, coordinates: '116.4074,39.9042' };
            attractions = [];
        }
        
        // 2. 尝试获取AI攻略，但设置超时
        let aiGuide = null;
        if (doubaoKey) {
            try {
                aiGuide = await Promise.race([
                    generateAIGuideFast(finalCity, finalMonth, duration, doubaoKey),
                    new Promise(resolve => setTimeout(() => resolve(null), 6000)) // 增加AI请求超时到6秒
                ]);
            } catch (error) {
                console.warn('AI生成失败:', error.message);
            }
        }
        
        // 3. 生成完整攻略数据（快速版）
        const completeGuide = buildCompleteGuideFast(
            finalCity, 
            finalMonth, 
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
        const response = await fetch(url, { timeout: 2500 });
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
        
        const response = await fetch(url, { timeout: 2500 });
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
    
    // 详细提示词 - 更明确地要求非空白内容
    const prompt = `请为${city}的${monthName}（${season}季）${duration}天旅行生成一份详细的旅游攻略。

### 输出要求：
1. 必须返回**完整的JSON格式**，不能包含任何JSON之外的内容（如markdown、解释性文字等）
2. 所有字段必须填充真实、有意义的内容，不能留空或使用占位符
3. 确保每个字段都有符合要求的详细内容

### 必须包含的JSON结构：
{
  "overview": "100字左右的城市旅游概况，介绍当地特色和最佳旅游时间",
  "attractions": [
    {"name": "景点名称", "description": "100字左右的详细景点介绍"}
  ],
  "itinerary": [
    {"day": 1, "activities": [
      {"time": "09:00", "activity": "具体的活动内容"}
    ]}
  ]
}

### 内容要求：
1. overview：包含城市特色、季节特点和旅游亮点，必须有具体描述
2. attractions：至少包含5个主要景点，每个景点的name和description都必须填写详细内容
3. itinerary：为每天安排至少3-5个具体活动，包括时间和具体内容
4. 内容必须真实有效，符合当地实际情况和季节特点
5. 避免使用模板化语言，确保内容具体且有价值`;

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
                        content: '你是一名专业的旅游攻略生成师，请根据用户要求生成详细、实用的旅游攻略'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000, // 增加token数量，确保生成更详细的内容
                top_p: 0.9
            }),
            timeout: 6000 // 延长AI请求超时时间到6秒
        });

        const data = await response.json();
        
        if (data.choices?.[0]?.message?.content) {
            const content = data.choices[0].message.content;
            console.log('AI生成的内容:', content); // 调试输出
            
            // 直接尝试解析JSON
            try {
                const parsed = JSON.parse(content);
                // 验证关键字段是否有内容
                if (parsed.overview && parsed.attractions && parsed.attractions.length > 0 && parsed.itinerary && parsed.itinerary.length > 0) {
                    return parsed;
                } else {
                    console.warn('AI生成的JSON结构不完整:', parsed);
                }
            } catch (e) {
                // 尝试提取JSON内容
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                        if (parsed.overview && parsed.attractions && parsed.attractions.length > 0 && parsed.itinerary && parsed.itinerary.length > 0) {
                            return parsed;
                        } else {
                            console.warn('提取的JSON结构不完整:', parsed);
                        }
                    } catch (parseError) {
                        console.warn('提取JSON后解析失败:', parseError.message);
                    }
                }
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
    
    // 确保attractions始终有内容，即使AI和高德都返回空
    let mergedAttractions;
    if (aiGuide?.attractions && aiGuide.attractions.length > 0) {
        mergedAttractions = aiGuide.attractions;
    } else if (attractions && attractions.length > 0) {
        mergedAttractions = attractions.slice(0, 5).map(att => ({
            name: att.name,
            description: `${att.name} - ${att.address || '热门景点'}`
        }));
    } else {
        // 如果都为空，生成默认景点
        mergedAttractions = [
            { name: `${city}中心广场`, description: `${city}的标志性地标，是游客必到之处` },
            { name: `${city}博物馆`, description: `展示${city}历史文化的重要场所` },
            { name: `${city}公园`, description: `${city}最大的城市公园，适合休闲散步` },
            { name: `${city}美食街`, description: `品尝${city}当地特色美食的最佳地点` },
            { name: `${city}老街`, description: `保存完好的历史街区，感受古城魅力` }
        ];
    }
    
    // 确保itinerary始终有内容
    const itinerary = aiGuide?.itinerary || generateSimpleItinerary(city, duration);
    
    // 确保overview始终有内容
    const overview = aiGuide?.overview || `${city}是中国${season}旅游的理想目的地。${monthName}的${city}气候宜人，${season === '春季' ? '鲜花盛开' : season === '夏季' ? '绿树成荫' : season === '秋季' ? '秋高气爽' : '银装素裹'}，非常适合${duration}天的旅行。这里有丰富的历史文化遗迹和自然景观，让您感受独特的地方魅力。`;
    
    return {
        city: city,
        month: month,
        month_name: monthName,
        season: season,
        duration: duration,
        coordinates: cityInfo.coordinates,
        overview: overview,
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

// 增强的备用攻略函数 - 确保生成有意义的内容
function generateFallbackGuide(params) {
    const { city = '北京', month = 5, duration = 3 } = params;
    const monthName = getChineseMonthName(month);
    const season = getSeason(month);
    
    // 生成详细的备用景点列表
    const fallbackAttractions = [
        { name: `${city}中心广场`, description: `${city}的标志性地标，是游客必到之处，周围环绕着城市的主要建筑和商业中心。` },
        { name: `${city}博物馆`, description: `展示${city}丰富的历史文化遗产，收藏了大量珍贵文物，是了解这座城市的最佳窗口。` },
        { name: `${city}自然公园`, description: `${city}最大的城市公园，${season}时节${season === '春季' ? '百花齐放' : season === '夏季' ? '绿树成荫' : season === '秋季' ? '层林尽染' : '银装素裹'}，适合休闲散步和户外活动。` },
        { name: `${city}美食街`, description: `汇聚了${city}当地特色美食，从传统小吃到正宗菜肴应有尽有，让您品尝地道的${city}味道。` },
        { name: `${city}历史老街`, description: `保存完好的历史街区，古建筑鳞次栉比，漫步其中仿佛穿越时光，感受古城的独特魅力。` }
    ];
    
    // 生成详细的备用行程
    const fallbackItinerary = Array.from({ length: duration }, (_, i) => {
        const day = i + 1;
        return {
            day: day,
            title: `第${day}天：${city}${season}之旅`,
            activities: [
                { time: '09:00', activity: '酒店早餐，准备一天的行程' },
                { time: '10:00', activity: `参观${fallbackAttractions[i % fallbackAttractions.length].name}，感受当地文化` },
                { time: '12:30', activity: `在附近品尝${city}特色午餐` },
                { time: '14:00', activity: `游览${fallbackAttractions[(i + 1) % fallbackAttractions.length].name}，欣赏美丽景色` },
                { time: '16:30', activity: `自由活动，可选择购物或休息` },
                { time: '18:30', activity: `享用${city}晚餐，体验当地夜生活` }
            ]
        };
    });
    
    // 生成详细的备用美食推荐
    const fallbackFoods = [
        { name: `${city}特色菜`, description: `${city}最具代表性的菜肴，口味独特，值得品尝` },
        { name: `${city}传统小吃`, description: `历史悠久的街头美食，体现了当地的饮食文化` },
        { name: `${city}甜品`, description: `香甜可口的当地特色甜品，为旅行增添甜蜜回忆` }
    ];
    
    return {
        city: city,
        month: month,
        month_name: monthName,
        season: season,
        duration: duration,
        coordinates: '116.4074,39.9042',
        overview: `${city}是中国${season}旅游的理想目的地。${monthName}的${city}气候宜人，${season === '春季' ? '鲜花盛开，万物复苏' : season === '夏季' ? '绿树成荫，清凉舒适' : season === '秋季' ? '秋高气爽，风景如画' : '银装素裹，宛如仙境'}，非常适合${duration}天的旅行。这里有丰富的历史文化遗迹、美丽的自然景观和美味的特色美食，让您的旅途充满惊喜和美好回忆。`,
        attractions: fallbackAttractions,
        itinerary: fallbackItinerary,
        food_recommendations: fallbackFoods,
        budget: generateSimpleBudget(duration),
        quick_stats: {
            attractions_count: fallbackAttractions.length,
            food_count: fallbackFoods.length,
            duration_days: duration
        },
        generated_at: new Date().toISOString(),
        note: '由于生成时间较长，返回详细版备用攻略'
    };
}
