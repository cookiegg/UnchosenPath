/**
 * USA Country Context Module
 * Provides American-specific data for life simulation
 * Requirements: 3.3, 4.2, 4.4, 4.6, 4.8
 */

import { SupportedLanguage } from '../types';
import { CountryContext, CountryContextModule } from './types';

/**
 * US states and major cities
 */
const getLocations = (language: SupportedLanguage) => ({
  provinces: [
    {
      name: language === 'zh-CN' ? '加利福尼亚' : 'California',
      cities: language === 'zh-CN' 
        ? ['洛杉矶', '旧金山', '圣地亚哥', '圣何塞', '萨克拉门托'] 
        : ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento']
    },
    {
      name: language === 'zh-CN' ? '纽约' : 'New York',
      cities: language === 'zh-CN' 
        ? ['纽约市', '布法罗', '奥尔巴尼', '罗切斯特', '锡拉丘兹'] 
        : ['New York City', 'Buffalo', 'Albany', 'Rochester', 'Syracuse']
    },
    {
      name: language === 'zh-CN' ? '德克萨斯' : 'Texas',
      cities: language === 'zh-CN' 
        ? ['休斯顿', '达拉斯', '奥斯汀', '圣安东尼奥', '沃斯堡'] 
        : ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth']
    },
    {
      name: language === 'zh-CN' ? '佛罗里达' : 'Florida',
      cities: language === 'zh-CN' 
        ? ['迈阿密', '奥兰多', '坦帕', '杰克逊维尔', '塔拉哈西'] 
        : ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee']
    },
    {
      name: language === 'zh-CN' ? '伊利诺伊' : 'Illinois',
      cities: language === 'zh-CN' 
        ? ['芝加哥', '斯普林菲尔德', '皮奥里亚', '罗克福德', '内珀维尔'] 
        : ['Chicago', 'Springfield', 'Peoria', 'Rockford', 'Naperville']
    },
    {
      name: language === 'zh-CN' ? '宾夕法尼亚' : 'Pennsylvania',
      cities: language === 'zh-CN' 
        ? ['费城', '匹兹堡', '哈里斯堡', '阿伦敦', '伊利'] 
        : ['Philadelphia', 'Pittsburgh', 'Harrisburg', 'Allentown', 'Erie']
    },
    {
      name: language === 'zh-CN' ? '俄亥俄' : 'Ohio',
      cities: language === 'zh-CN' 
        ? ['哥伦布', '克利夫兰', '辛辛那提', '托莱多', '阿克伦'] 
        : ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron']
    },
    {
      name: language === 'zh-CN' ? '乔治亚' : 'Georgia',
      cities: language === 'zh-CN' 
        ? ['亚特兰大', '奥古斯塔', '萨凡纳', '哥伦布', '梅肯'] 
        : ['Atlanta', 'Augusta', 'Savannah', 'Columbus', 'Macon']
    },
    {
      name: language === 'zh-CN' ? '北卡罗来纳' : 'North Carolina',
      cities: language === 'zh-CN' 
        ? ['夏洛特', '罗利', '格林斯伯勒', '达勒姆', '温斯顿-塞勒姆'] 
        : ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem']
    },
    {
      name: language === 'zh-CN' ? '密歇根' : 'Michigan',
      cities: language === 'zh-CN' 
        ? ['底特律', '大急流城', '沃伦', '斯特林海茨', '安阿伯'] 
        : ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor']
    },
    {
      name: language === 'zh-CN' ? '新泽西' : 'New Jersey',
      cities: language === 'zh-CN' 
        ? ['纽瓦克', '泽西城', '帕特森', '伊丽莎白', '特伦顿'] 
        : ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton']
    },
    {
      name: language === 'zh-CN' ? '弗吉尼亚' : 'Virginia',
      cities: language === 'zh-CN' 
        ? ['弗吉尼亚海滩', '诺福克', '里士满', '纽波特纽斯', '亚历山大'] 
        : ['Virginia Beach', 'Norfolk', 'Richmond', 'Newport News', 'Alexandria']
    },
    {
      name: language === 'zh-CN' ? '华盛顿' : 'Washington',
      cities: language === 'zh-CN' 
        ? ['西雅图', '斯波坎', '塔科马', '温哥华', '贝尔维尤'] 
        : ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue']
    },
    {
      name: language === 'zh-CN' ? '亚利桑那' : 'Arizona',
      cities: language === 'zh-CN' 
        ? ['凤凰城', '图森', '梅萨', '钱德勒', '斯科茨代尔'] 
        : ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale']
    },
    {
      name: language === 'zh-CN' ? '马萨诸塞' : 'Massachusetts',
      cities: language === 'zh-CN' 
        ? ['波士顿', '伍斯特', '斯普林菲尔德', '剑桥', '洛厄尔'] 
        : ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell']
    },
    {
      name: language === 'zh-CN' ? '科罗拉多' : 'Colorado',
      cities: language === 'zh-CN' 
        ? ['丹佛', '科罗拉多斯普林斯', '奥罗拉', '柯林斯堡', '莱克伍德'] 
        : ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood']
    },
    {
      name: language === 'zh-CN' ? '马里兰' : 'Maryland',
      cities: language === 'zh-CN' 
        ? ['巴尔的摩', '弗雷德里克', '罗克维尔', '盖瑟斯堡', '银泉'] 
        : ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Silver Spring']
    },
    {
      name: language === 'zh-CN' ? '华盛顿特区' : 'Washington D.C.',
      cities: language === 'zh-CN' ? ['华盛顿特区'] : ['Washington D.C.']
    }
  ]
});

/**
 * Education levels in USA
 */
const getEducationLevels = (language: SupportedLanguage): string[] => {
  return language === 'zh-CN'
    ? ['无', '高中', '副学士', '学士', '硕士', '博士']
    : ['None', 'High School', 'Associate', 'Bachelor\'s', 'Master\'s', 'PhD'];
};

/**
 * University tiers in USA
 */
const getUniversityTiers = (language: SupportedLanguage): string[] => {
  return language === 'zh-CN'
    ? ['常春藤联盟', 'Top 20 名校', 'Top 50 大学', '州立大学', '社区学院', '其他']
    : ['Ivy League', 'Top 20', 'Top 50', 'State University', 'Community College', 'Other'];
};

/**
 * Family background options in USA
 */
const getFamilyBackgrounds = (language: SupportedLanguage): string[] => {
  return language === 'zh-CN'
    ? ['富裕 (上层阶级)', '中上阶层', '中产阶级', '工薪阶层', '低收入']
    : ['Wealthy (Upper Class)', 'Upper Middle Class', 'Middle Class', 'Working Class', 'Low Income'];
};

/**
 * Parent occupation options in USA
 */
const getParentsOccupations = (language: SupportedLanguage): string[] => {
  return language === 'zh-CN'
    ? ['蓝领工人', '服务业', '白领', '政府雇员', '管理层', '企业主', '专业人士', '其他']
    : ['Blue Collar', 'Service Industry', 'White Collar', 'Government', 'Management', 'Business Owner', 'Professional', 'Other'];
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
 * USA country context module
 */
export const usaContext: CountryContextModule = {
  getContext: (language: SupportedLanguage): CountryContext => ({
    id: 'US',
    name: language === 'zh-CN' ? '美国' : 'United States',
    flag: '🇺🇸',
    locations: getLocations(language),
    educationLevels: getEducationLevels(language),
    universityTiers: getUniversityTiers(language),
    familyBackgrounds: getFamilyBackgrounds(language),
    parentsOccupations: getParentsOccupations(language),
    currentStatuses: getCurrentStatuses(language)
  })
};
