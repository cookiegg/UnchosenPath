import React, { useState } from 'react';

interface LocationValue {
    province: string;
    city: string;
}

interface LocationCascaderProps {
    value: LocationValue;
    onChange: (value: LocationValue) => void;
    disabled?: boolean;
}

// 中国省市数据（简化版，包含主要城市）
const CHINA_REGIONS: Record<string, string[]> = {
    '北京市': ['北京市'],
    '上海市': ['上海市'],
    '天津市': ['天津市'],
    '重庆市': ['重庆市'],
    '广东省': ['广州市', '深圳市', '珠海市', '东莞市', '佛山市', '中山市', '惠州市', '汕头市', '湛江市', '江门市'],
    '江苏省': ['南京市', '苏州市', '无锡市', '常州市', '南通市', '徐州市', '扬州市', '镇江市', '盐城市', '泰州市'],
    '浙江省': ['杭州市', '宁波市', '温州市', '绍兴市', '嘉兴市', '台州市', '金华市', '湖州市', '衢州市', '丽水市'],
    '山东省': ['济南市', '青岛市', '烟台市', '潍坊市', '临沂市', '淄博市', '济宁市', '泰安市', '威海市', '德州市'],
    '河南省': ['郑州市', '洛阳市', '开封市', '南阳市', '新乡市', '安阳市', '商丘市', '信阳市', '平顶山市', '许昌市'],
    '四川省': ['成都市', '绵阳市', '德阳市', '南充市', '宜宾市', '自贡市', '乐山市', '泸州市', '达州市', '内江市'],
    '湖北省': ['武汉市', '襄阳市', '宜昌市', '荆州市', '黄冈市', '孝感市', '十堰市', '咸宁市', '黄石市', '恩施州'],
    '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市', '常德市', '郴州市', '永州市', '怀化市', '娄底市'],
    '河北省': ['石家庄市', '唐山市', '保定市', '邯郸市', '秦皇岛市', '廊坊市', '沧州市', '承德市', '张家口市', '衡水市'],
    '福建省': ['福州市', '厦门市', '泉州市', '漳州市', '莆田市', '三明市', '南平市', '龙岩市', '宁德市'],
    '安徽省': ['合肥市', '芜湖市', '蚌埠市', '阜阳市', '淮南市', '安庆市', '宿州市', '六安市', '马鞍山市', '滁州市'],
    '陕西省': ['西安市', '宝鸡市', '咸阳市', '渭南市', '汉中市', '榆林市', '延安市', '安康市', '商洛市', '铜川市'],
    '辽宁省': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市'],
    '江西省': ['南昌市', '赣州市', '九江市', '上饶市', '吉安市', '宜春市', '抚州市', '景德镇市', '萍乡市', '新余市'],
    '云南省': ['昆明市', '曲靖市', '玉溪市', '大理州', '红河州', '丽江市', '昭通市', '普洱市', '保山市', '临沧市'],
    '广西壮族自治区': ['南宁市', '柳州市', '桂林市', '玉林市', '梧州市', '北海市', '钦州市', '贵港市', '防城港市', '百色市'],
    '山西省': ['太原市', '大同市', '临汾市', '运城市', '长治市', '晋中市', '晋城市', '阳泉市', '吕梁市', '忻州市'],
    '吉林省': ['长春市', '吉林市', '四平市', '延边州', '通化市', '白城市', '辽源市', '松原市', '白山市'],
    '黑龙江省': ['哈尔滨市', '齐齐哈尔市', '大庆市', '牡丹江市', '佳木斯市', '绥化市', '鸡西市', '双鸭山市', '鹤岗市', '黑河市'],
    '贵州省': ['贵阳市', '遵义市', '六盘水市', '安顺市', '毕节市', '铜仁市', '黔东南州', '黔南州', '黔西南州'],
    '甘肃省': ['兰州市', '天水市', '白银市', '庆阳市', '平凉市', '酒泉市', '张掖市', '武威市', '定西市', '陇南市'],
    '内蒙古自治区': ['呼和浩特市', '包头市', '赤峰市', '鄂尔多斯市', '通辽市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '乌海市'],
    '新疆维吾尔自治区': ['乌鲁木齐市', '昌吉州', '伊犁州', '阿克苏地区', '喀什地区', '哈密市', '克拉玛依市', '巴音郭楞州', '吐鲁番市'],
    '海南省': ['海口市', '三亚市', '儋州市', '琼海市', '文昌市', '万宁市', '东方市', '五指山市'],
    '宁夏回族自治区': ['银川市', '吴忠市', '固原市', '中卫市', '石嘴山市'],
    '青海省': ['西宁市', '海东市', '海北州', '黄南州', '海南州', '果洛州', '玉树州', '海西州'],
    '西藏自治区': ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'],
    '香港特别行政区': ['香港'],
    '澳门特别行政区': ['澳门'],
    '台湾省': ['台北市', '高雄市', '台中市', '台南市', '新北市', '桃园市']
};

const LocationCascader: React.FC<LocationCascaderProps> = ({ value, onChange, disabled = false }) => {
    const [cities, setCities] = useState<string[]>(value.province ? CHINA_REGIONS[value.province] || [] : []);

    const handleProvinceChange = (province: string) => {
        const newCities = CHINA_REGIONS[province] || [];
        setCities(newCities);
        onChange({
            province,
            city: newCities[0] || ''
        });
    };

    const handleCityChange = (city: string) => {
        onChange({
            ...value,
            city
        });
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            <div>
                <select
                    className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm disabled:opacity-50"
                    value={value.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    disabled={disabled}
                >
                    <option value="">选择省份</option>
                    {Object.keys(CHINA_REGIONS).map((province) => (
                        <option key={province} value={province}>
                            {province}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <select
                    className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm disabled:opacity-50"
                    value={value.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    disabled={disabled || !value.province}
                >
                    <option value="">选择城市</option>
                    {cities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LocationCascader;
