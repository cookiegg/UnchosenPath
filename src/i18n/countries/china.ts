/**
 * China Country Context Module
 * Provides Chinese-specific data for life simulation
 * Requirements: 3.2, 4.1, 4.3, 4.5, 4.7
 */

import { SupportedLanguage } from '../types';
import { CountryContext, CountryContextModule } from './types';

/**
 * Chinese provinces and major cities
 */
const getLocations = (language: SupportedLanguage) => ({
  provinces: [
    {
      name: language === 'zh-CN' ? '北京' : 'Beijing',
      cities: language === 'zh-CN' ? ['北京市'] : ['Beijing City']
    },
    {
      name: language === 'zh-CN' ? '上海' : 'Shanghai',
      cities: language === 'zh-CN' ? ['上海市'] : ['Shanghai City']
    },
    {
      name: language === 'zh-CN' ? '广东' : 'Guangdong',
      cities: language === 'zh-CN' 
        ? ['广州', '深圳', '东莞', '佛山', '珠海'] 
        : ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan', 'Zhuhai']
    },
    {
      name: language === 'zh-CN' ? '江苏' : 'Jiangsu',
      cities: language === 'zh-CN' 
        ? ['南京', '苏州', '无锡', '常州', '南通'] 
        : ['Nanjing', 'Suzhou', 'Wuxi', 'Changzhou', 'Nantong']
    },
    {
      name: language === 'zh-CN' ? '浙江' : 'Zhejiang',
      cities: language === 'zh-CN' 
        ? ['杭州', '宁波', '温州', '绍兴', '嘉兴'] 
        : ['Hangzhou', 'Ningbo', 'Wenzhou', 'Shaoxing', 'Jiaxing']
    },
    {
      name: language === 'zh-CN' ? '四川' : 'Sichuan',
      cities: language === 'zh-CN' 
        ? ['成都', '绵阳', '德阳', '宜宾', '南充'] 
        : ['Chengdu', 'Mianyang', 'Deyang', 'Yibin', 'Nanchong']
    },
    {
      name: language === 'zh-CN' ? '湖北' : 'Hubei',
      cities: language === 'zh-CN' 
        ? ['武汉', '宜昌', '襄阳', '荆州', '黄石'] 
        : ['Wuhan', 'Yichang', 'Xiangyang', 'Jingzhou', 'Huangshi']
    },
    {
      name: language === 'zh-CN' ? '湖南' : 'Hunan',
      cities: language === 'zh-CN' 
        ? ['长沙', '株洲', '湘潭', '衡阳', '岳阳'] 
        : ['Changsha', 'Zhuzhou', 'Xiangtan', 'Hengyang', 'Yueyang']
    },
    {
      name: language === 'zh-CN' ? '山东' : 'Shandong',
      cities: language === 'zh-CN' 
        ? ['济南', '青岛', '烟台', '潍坊', '临沂'] 
        : ['Jinan', 'Qingdao', 'Yantai', 'Weifang', 'Linyi']
    },
    {
      name: language === 'zh-CN' ? '河南' : 'Henan',
      cities: language === 'zh-CN' 
        ? ['郑州', '洛阳', '开封', '新乡', '安阳'] 
        : ['Zhengzhou', 'Luoyang', 'Kaifeng', 'Xinxiang', 'Anyang']
    },
    {
      name: language === 'zh-CN' ? '河北' : 'Hebei',
      cities: language === 'zh-CN' 
        ? ['石家庄', '唐山', '保定', '邯郸', '秦皇岛'] 
        : ['Shijiazhuang', 'Tangshan', 'Baoding', 'Handan', 'Qinhuangdao']
    },
    {
      name: language === 'zh-CN' ? '天津' : 'Tianjin',
      cities: language === 'zh-CN' ? ['天津市'] : ['Tianjin City']
    },
    {
      name: language === 'zh-CN' ? '重庆' : 'Chongqing',
      cities: language === 'zh-CN' ? ['重庆市'] : ['Chongqing City']
    },
    {
      name: language === 'zh-CN' ? '陕西' : 'Shaanxi',
      cities: language === 'zh-CN' 
        ? ['西安', '咸阳', '宝鸡', '渭南', '汉中'] 
        : ['Xi\'an', 'Xianyang', 'Baoji', 'Weinan', 'Hanzhong']
    },
    {
      name: language === 'zh-CN' ? '福建' : 'Fujian',
      cities: language === 'zh-CN' 
        ? ['福州', '厦门', '泉州', '漳州', '莆田'] 
        : ['Fuzhou', 'Xiamen', 'Quanzhou', 'Zhangzhou', 'Putian']
    },
    {
      name: language === 'zh-CN' ? '安徽' : 'Anhui',
      cities: language === 'zh-CN' 
        ? ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山'] 
        : ['Hefei', 'Wuhu', 'Bengbu', 'Huainan', 'Ma\'anshan']
    },
    {
      name: language === 'zh-CN' ? '辽宁' : 'Liaoning',
      cities: language === 'zh-CN' 
        ? ['沈阳', '大连', '鞍山', '抚顺', '本溪'] 
        : ['Shenyang', 'Dalian', 'Anshan', 'Fushun', 'Benxi']
    },
    {
      name: language === 'zh-CN' ? '吉林' : 'Jilin',
      cities: language === 'zh-CN' 
        ? ['长春', '吉林市', '四平', '通化', '白山'] 
        : ['Changchun', 'Jilin City', 'Siping', 'Tonghua', 'Baishan']
    },
    {
      name: language === 'zh-CN' ? '黑龙江' : 'Heilongjiang',
      cities: language === 'zh-CN' 
        ? ['哈尔滨', '齐齐哈尔', '牡丹江', '佳木斯', '大庆'] 
        : ['Harbin', 'Qiqihar', 'Mudanjiang', 'Jiamusi', 'Daqing']
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
