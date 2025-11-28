/**
 * China Country Context Module
 * Provides Chinese-specific data for life simulation
 * Requirements: 3.2, 4.1, 4.3, 4.5, 4.7
 */

import { SupportedLanguage } from '../types';
import { CountryContext, CountryContextModule } from './types';

/**
 * Chinese provinces and all prefecture-level cities (34 provincial-level divisions)
 * 包含所有地级市、自治州、地区、盟等二级行政区
 */
const getLocations = (language: SupportedLanguage) => ({
  provinces: [
    // 4 Municipalities (直辖市)
    {
      name: language === 'zh-CN' ? '北京' : 'Beijing',
      cities: language === 'zh-CN' ? ['北京市'] : ['Beijing']
    },
    {
      name: language === 'zh-CN' ? '上海' : 'Shanghai',
      cities: language === 'zh-CN' ? ['上海市'] : ['Shanghai']
    },
    {
      name: language === 'zh-CN' ? '天津' : 'Tianjin',
      cities: language === 'zh-CN' ? ['天津市'] : ['Tianjin']
    },
    {
      name: language === 'zh-CN' ? '重庆' : 'Chongqing',
      cities: language === 'zh-CN' ? ['重庆市'] : ['Chongqing']
    },
    // 23 Provinces (省)
    {
      name: language === 'zh-CN' ? '河北' : 'Hebei',
      cities: language === 'zh-CN' 
        ? ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'] 
        : ['Shijiazhuang', 'Tangshan', 'Qinhuangdao', 'Handan', 'Xingtai', 'Baoding', 'Zhangjiakou', 'Chengde', 'Cangzhou', 'Langfang', 'Hengshui']
    },
    {
      name: language === 'zh-CN' ? '山西' : 'Shanxi',
      cities: language === 'zh-CN' 
        ? ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'] 
        : ['Taiyuan', 'Datong', 'Yangquan', 'Changzhi', 'Jincheng', 'Shuozhou', 'Jinzhong', 'Yuncheng', 'Xinzhou', 'Linfen', 'Lüliang']
    },
    {
      name: language === 'zh-CN' ? '辽宁' : 'Liaoning',
      cities: language === 'zh-CN' 
        ? ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'] 
        : ['Shenyang', 'Dalian', 'Anshan', 'Fushun', 'Benxi', 'Dandong', 'Jinzhou', 'Yingkou', 'Fuxin', 'Liaoyang', 'Panjin', 'Tieling', 'Chaoyang', 'Huludao']
    },
    {
      name: language === 'zh-CN' ? '吉林' : 'Jilin',
      cities: language === 'zh-CN' 
        ? ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'] 
        : ['Changchun', 'Jilin', 'Siping', 'Liaoyuan', 'Tonghua', 'Baishan', 'Songyuan', 'Baicheng', 'Yanbian Korean Autonomous Prefecture']
    },
    {
      name: language === 'zh-CN' ? '黑龙江' : 'Heilongjiang',
      cities: language === 'zh-CN' 
        ? ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'] 
        : ['Harbin', 'Qiqihar', 'Jixi', 'Hegang', 'Shuangyashan', 'Daqing', 'Yichun', 'Jiamusi', 'Qitaihe', 'Mudanjiang', 'Heihe', 'Suihua', 'Daxing\'anling']
    },
    {
      name: language === 'zh-CN' ? '江苏' : 'Jiangsu',
      cities: language === 'zh-CN' 
        ? ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'] 
        : ['Nanjing', 'Wuxi', 'Xuzhou', 'Changzhou', 'Suzhou', 'Nantong', 'Lianyungang', 'Huai\'an', 'Yancheng', 'Yangzhou', 'Zhenjiang', 'Taizhou', 'Suqian']
    },
    {
      name: language === 'zh-CN' ? '浙江' : 'Zhejiang',
      cities: language === 'zh-CN' 
        ? ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'] 
        : ['Hangzhou', 'Ningbo', 'Wenzhou', 'Jiaxing', 'Huzhou', 'Shaoxing', 'Jinhua', 'Quzhou', 'Zhoushan', 'Taizhou', 'Lishui']
    },
    {
      name: language === 'zh-CN' ? '安徽' : 'Anhui',
      cities: language === 'zh-CN' 
        ? ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'] 
        : ['Hefei', 'Wuhu', 'Bengbu', 'Huainan', 'Ma\'anshan', 'Huaibei', 'Tongling', 'Anqing', 'Huangshan', 'Chuzhou', 'Fuyang', 'Suzhou', 'Lu\'an', 'Bozhou', 'Chizhou', 'Xuancheng']
    },
    {
      name: language === 'zh-CN' ? '福建' : 'Fujian',
      cities: language === 'zh-CN' 
        ? ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'] 
        : ['Fuzhou', 'Xiamen', 'Putian', 'Sanming', 'Quanzhou', 'Zhangzhou', 'Nanping', 'Longyan', 'Ningde']
    },
    {
      name: language === 'zh-CN' ? '江西' : 'Jiangxi',
      cities: language === 'zh-CN' 
        ? ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'] 
        : ['Nanchang', 'Jingdezhen', 'Pingxiang', 'Jiujiang', 'Xinyu', 'Yingtan', 'Ganzhou', 'Ji\'an', 'Yichun', 'Fuzhou', 'Shangrao']
    },
    {
      name: language === 'zh-CN' ? '山东' : 'Shandong',
      cities: language === 'zh-CN' 
        ? ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'] 
        : ['Jinan', 'Qingdao', 'Zibo', 'Zaozhuang', 'Dongying', 'Yantai', 'Weifang', 'Jining', 'Tai\'an', 'Weihai', 'Rizhao', 'Linyi', 'Dezhou', 'Liaocheng', 'Binzhou', 'Heze']
    },
    {
      name: language === 'zh-CN' ? '河南' : 'Henan',
      cities: language === 'zh-CN' 
        ? ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市', '济源市'] 
        : ['Zhengzhou', 'Kaifeng', 'Luoyang', 'Pingdingshan', 'Anyang', 'Hebi', 'Xinxiang', 'Jiaozuo', 'Puyang', 'Xuchang', 'Luohe', 'Sanmenxia', 'Nanyang', 'Shangqiu', 'Xinyang', 'Zhoukou', 'Zhumadian', 'Jiyuan']
    },
    {
      name: language === 'zh-CN' ? '湖北' : 'Hubei',
      cities: language === 'zh-CN' 
        ? ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '恩施土家族苗族自治州', '仙桃市', '潜江市', '天门市', '神农架林区'] 
        : ['Wuhan', 'Huangshi', 'Shiyan', 'Yichang', 'Xiangyang', 'Ezhou', 'Jingmen', 'Xiaogan', 'Jingzhou', 'Huanggang', 'Xianning', 'Suizhou', 'Enshi', 'Xiantao', 'Qianjiang', 'Tianmen', 'Shennongjia']
    },
    {
      name: language === 'zh-CN' ? '湖南' : 'Hunan',
      cities: language === 'zh-CN' 
        ? ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西土家族苗族自治州'] 
        : ['Changsha', 'Zhuzhou', 'Xiangtan', 'Hengyang', 'Shaoyang', 'Yueyang', 'Changde', 'Zhangjiajie', 'Yiyang', 'Chenzhou', 'Yongzhou', 'Huaihua', 'Loudi', 'Xiangxi']
    },
    {
      name: language === 'zh-CN' ? '广东' : 'Guangdong',
      cities: language === 'zh-CN' 
        ? ['广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'] 
        : ['Guangzhou', 'Shaoguan', 'Shenzhen', 'Zhuhai', 'Shantou', 'Foshan', 'Jiangmen', 'Zhanjiang', 'Maoming', 'Zhaoqing', 'Huizhou', 'Meizhou', 'Shanwei', 'Heyuan', 'Yangjiang', 'Qingyuan', 'Dongguan', 'Zhongshan', 'Chaozhou', 'Jieyang', 'Yunfu']
    },
    {
      name: language === 'zh-CN' ? '海南' : 'Hainan',
      cities: language === 'zh-CN' 
        ? ['海口市', '三亚市', '三沙市', '儋州市', '五指山市', '琼海市', '文昌市', '万宁市', '东方市', '定安县', '屯昌县', '澄迈县', '临高县', '白沙黎族自治县', '昌江黎族自治县', '乐东黎族自治县', '陵水黎族自治县', '保亭黎族苗族自治县', '琼中黎族苗族自治县'] 
        : ['Haikou', 'Sanya', 'Sansha', 'Danzhou', 'Wuzhishan', 'Qionghai', 'Wenchang', 'Wanning', 'Dongfang', 'Ding\'an', 'Tunchang', 'Chengmai', 'Lingao', 'Baisha', 'Changjiang', 'Ledong', 'Lingshui', 'Baoting', 'Qiongzhong']
    },
    {
      name: language === 'zh-CN' ? '四川' : 'Sichuan',
      cities: language === 'zh-CN' 
        ? ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'] 
        : ['Chengdu', 'Zigong', 'Panzhihua', 'Luzhou', 'Deyang', 'Mianyang', 'Guangyuan', 'Suining', 'Neijiang', 'Leshan', 'Nanchong', 'Meishan', 'Yibin', 'Guang\'an', 'Dazhou', 'Ya\'an', 'Bazhong', 'Ziyang', 'Aba', 'Garze', 'Liangshan']
    },
    {
      name: language === 'zh-CN' ? '贵州' : 'Guizhou',
      cities: language === 'zh-CN' 
        ? ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'] 
        : ['Guiyang', 'Liupanshui', 'Zunyi', 'Anshun', 'Bijie', 'Tongren', 'Qianxinan', 'Qiandongnan', 'Qiannan']
    },
    {
      name: language === 'zh-CN' ? '云南' : 'Yunnan',
      cities: language === 'zh-CN' 
        ? ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'] 
        : ['Kunming', 'Qujing', 'Yuxi', 'Baoshan', 'Zhaotong', 'Lijiang', 'Pu\'er', 'Lincang', 'Chuxiong', 'Honghe', 'Wenshan', 'Xishuangbanna', 'Dali', 'Dehong', 'Nujiang', 'Diqing']
    },
    {
      name: language === 'zh-CN' ? '陕西' : 'Shaanxi',
      cities: language === 'zh-CN' 
        ? ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'] 
        : ['Xi\'an', 'Tongchuan', 'Baoji', 'Xianyang', 'Weinan', 'Yan\'an', 'Hanzhong', 'Yulin', 'Ankang', 'Shangluo']
    },
    {
      name: language === 'zh-CN' ? '甘肃' : 'Gansu',
      cities: language === 'zh-CN' 
        ? ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'] 
        : ['Lanzhou', 'Jiayuguan', 'Jinchang', 'Baiyin', 'Tianshui', 'Wuwei', 'Zhangye', 'Pingliang', 'Jiuquan', 'Qingyang', 'Dingxi', 'Longnan', 'Linxia', 'Gannan']
    },
    {
      name: language === 'zh-CN' ? '青海' : 'Qinghai',
      cities: language === 'zh-CN' 
        ? ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'] 
        : ['Xining', 'Haidong', 'Haibei', 'Huangnan', 'Hainan', 'Golog', 'Yushu', 'Haixi']
    },
    {
      name: language === 'zh-CN' ? '台湾' : 'Taiwan',
      cities: language === 'zh-CN' 
        ? ['台北市', '新北市', '桃园市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '嘉义市', '新竹县', '苗栗县', '彰化县', '南投县', '云林县', '嘉义县', '屏东县', '宜兰县', '花莲县', '台东县', '澎湖县', '金门县', '连江县'] 
        : ['Taipei', 'New Taipei', 'Taoyuan', 'Taichung', 'Tainan', 'Kaohsiung', 'Keelung', 'Hsinchu City', 'Chiayi City', 'Hsinchu County', 'Miaoli', 'Changhua', 'Nantou', 'Yunlin', 'Chiayi County', 'Pingtung', 'Yilan', 'Hualien', 'Taitung', 'Penghu', 'Kinmen', 'Lienchiang']
    },
    // 5 Autonomous Regions (自治区)
    {
      name: language === 'zh-CN' ? '内蒙古' : 'Inner Mongolia',
      cities: language === 'zh-CN' 
        ? ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'] 
        : ['Hohhot', 'Baotou', 'Wuhai', 'Chifeng', 'Tongliao', 'Ordos', 'Hulunbuir', 'Bayannur', 'Ulanqab', 'Hinggan', 'Xilingol', 'Alxa']
    },
    {
      name: language === 'zh-CN' ? '广西' : 'Guangxi',
      cities: language === 'zh-CN' 
        ? ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'] 
        : ['Nanning', 'Liuzhou', 'Guilin', 'Wuzhou', 'Beihai', 'Fangchenggang', 'Qinzhou', 'Guigang', 'Yulin', 'Baise', 'Hezhou', 'Hechi', 'Laibin', 'Chongzuo']
    },
    {
      name: language === 'zh-CN' ? '西藏' : 'Tibet',
      cities: language === 'zh-CN' 
        ? ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'] 
        : ['Lhasa', 'Shigatse', 'Chamdo', 'Nyingchi', 'Shannan', 'Nagqu', 'Ngari']
    },
    {
      name: language === 'zh-CN' ? '宁夏' : 'Ningxia',
      cities: language === 'zh-CN' 
        ? ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'] 
        : ['Yinchuan', 'Shizuishan', 'Wuzhong', 'Guyuan', 'Zhongwei']
    },
    {
      name: language === 'zh-CN' ? '新疆' : 'Xinjiang',
      cities: language === 'zh-CN' 
        ? ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区', '石河子市', '阿拉尔市', '图木舒克市', '五家渠市', '北屯市', '铁门关市', '双河市', '可克达拉市', '昆玉市', '胡杨河市'] 
        : ['Urumqi', 'Karamay', 'Turpan', 'Hami', 'Changji', 'Bortala', 'Bayingolin', 'Aksu', 'Kizilsu', 'Kashgar', 'Hotan', 'Ili', 'Tacheng', 'Altay', 'Shihezi', 'Aral', 'Tumxuk', 'Wujiaqu', 'Beitun', 'Tiemenguan', 'Shuanghe', 'Kokdala', 'Kunyu', 'Huyanghe']
    },
    // 2 Special Administrative Regions (特别行政区)
    {
      name: language === 'zh-CN' ? '香港' : 'Hong Kong',
      cities: language === 'zh-CN' ? ['香港'] : ['Hong Kong']
    },
    {
      name: language === 'zh-CN' ? '澳门' : 'Macau',
      cities: language === 'zh-CN' ? ['澳门'] : ['Macau']
    }
  ]
});

/**
 * Education levels in China
 */
const getEducationLevels = (language: SupportedLanguage): string[] => {
  return language === 'zh-CN'
    ? ['无', '高中', '大专', '本科', '硕士', '博士']
    : ['None', 'High School', 'Associate', 'Bachelor\'s', 'Master\'s', 'PhD'];
};

/**
 * University tiers in China
 */
const getUniversityTiers = (language: SupportedLanguage): string[] => {
  return language === 'zh-CN'
    ? ['Top 2 (清北)', 'C9/华五', '985/211', '普通一本/二本', '大专/职业院校', '海外名校', '普通海外高校']
    : ['Top 2 (Tsinghua/Peking)', 'C9/Top Chinese', '985/211 Universities', 'Regular Universities', 'Vocational Colleges', 'Top Overseas', 'Regular Overseas'];
};

/**
 * Family background options in China
 */
const getFamilyBackgrounds = (language: SupportedLanguage): string[] => {
  return language === 'zh-CN'
    ? ['富裕 (家产丰厚/有矿)', '中产 (衣食无忧/城市土著)', '工薪 (普通家庭)', '贫困 (寒门学子)']
    : ['Wealthy', 'Upper Middle Class', 'Working Class', 'Low Income'];
};

/**
 * Parent occupation options in China
 */
const getParentsOccupations = (language: SupportedLanguage): string[] => {
  return language === 'zh-CN'
    ? ['务农', '小生意', '白领', '基层公务员', '中高层管理', '老板/企业家', '专业人士', '其他']
    : ['Farmers', 'Small Business', 'White Collar', 'Civil Servant', 'Management', 'Business Owner', 'Professional', 'Other'];
};

/**
 * Current life status options
 */
const getCurrentStatuses = (language: SupportedLanguage): string[] => {
  return language === 'zh-CN'
    ? ['学生', '在职', '创业', '待业', '自由职业', '退休']
    : ['Student', 'Employed', 'Entrepreneur', 'Unemployed', 'Freelancer', 'Retired'];
};

/**
 * China country context module
 */
export const chinaContext: CountryContextModule = {
  getContext: (language: SupportedLanguage): CountryContext => ({
    id: 'CN',
    name: language === 'zh-CN' ? '中国' : 'China',
    flag: '🇨🇳',
    locations: getLocations(language),
    educationLevels: getEducationLevels(language),
    universityTiers: getUniversityTiers(language),
    familyBackgrounds: getFamilyBackgrounds(language),
    parentsOccupations: getParentsOccupations(language),
    currentStatuses: getCurrentStatuses(language)
  })
};
