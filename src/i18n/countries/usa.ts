/**
 * USA Country Context Module
 * Provides American-specific data for life simulation
 * Requirements: 3.3, 4.2, 4.4, 4.6, 4.8
 */

import { SupportedLanguage } from '../types';
import { CountryContext, CountryContextModule } from './types';

/**
 * US states and major cities (50 states + DC)
 */
const getLocations = (language: SupportedLanguage) => ({
  provinces: [
    {
      name: language === 'zh-CN' ? '阿拉巴马' : 'Alabama',
      cities: language === 'zh-CN' 
        ? ['伯明翰', '蒙哥马利', '莫比尔', '亨茨维尔', '塔斯卡卢萨'] 
        : ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa']
    },
    {
      name: language === 'zh-CN' ? '阿拉斯加' : 'Alaska',
      cities: language === 'zh-CN' 
        ? ['安克雷奇', '费尔班克斯', '朱诺', '锡特卡', '凯奇坎'] 
        : ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan']
    },
    {
      name: language === 'zh-CN' ? '亚利桑那' : 'Arizona',
      cities: language === 'zh-CN' 
        ? ['凤凰城', '图森', '梅萨', '钱德勒', '斯科茨代尔', '格伦代尔', '坦佩'] 
        : ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Tempe']
    },
    {
      name: language === 'zh-CN' ? '阿肯色' : 'Arkansas',
      cities: language === 'zh-CN' 
        ? ['小石城', '史密斯堡', '费耶特维尔', '斯普林代尔', '琼斯伯勒'] 
        : ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro']
    },
    {
      name: language === 'zh-CN' ? '加利福尼亚' : 'California',
      cities: language === 'zh-CN' 
        ? ['洛杉矶', '旧金山', '圣地亚哥', '圣何塞', '萨克拉门托', '弗雷斯诺', '长滩', '奥克兰', '贝克斯菲尔德', '阿纳海姆'] 
        : ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim']
    },
    {
      name: language === 'zh-CN' ? '科罗拉多' : 'Colorado',
      cities: language === 'zh-CN' 
        ? ['丹佛', '科罗拉多斯普林斯', '奥罗拉', '柯林斯堡', '莱克伍德', '博尔德'] 
        : ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder']
    },
    {
      name: language === 'zh-CN' ? '康涅狄格' : 'Connecticut',
      cities: language === 'zh-CN' 
        ? ['布里奇波特', '纽黑文', '斯坦福', '哈特福德', '沃特伯里'] 
        : ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Waterbury']
    },
    {
      name: language === 'zh-CN' ? '特拉华' : 'Delaware',
      cities: language === 'zh-CN' 
        ? ['威尔明顿', '多佛', '纽瓦克', '米德尔敦', '斯迈尔纳'] 
        : ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna']
    },
    {
      name: language === 'zh-CN' ? '佛罗里达' : 'Florida',
      cities: language === 'zh-CN' 
        ? ['迈阿密', '奥兰多', '坦帕', '杰克逊维尔', '塔拉哈西', '圣彼得堡', '好莱坞', '珊瑚角', '盖恩斯维尔'] 
        : ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee', 'St. Petersburg', 'Hollywood', 'Cape Coral', 'Gainesville']
    },
    {
      name: language === 'zh-CN' ? '乔治亚' : 'Georgia',
      cities: language === 'zh-CN' 
        ? ['亚特兰大', '奥古斯塔', '萨凡纳', '哥伦布', '梅肯', '雅典'] 
        : ['Atlanta', 'Augusta', 'Savannah', 'Columbus', 'Macon', 'Athens']
    },
    {
      name: language === 'zh-CN' ? '夏威夷' : 'Hawaii',
      cities: language === 'zh-CN' 
        ? ['火奴鲁鲁', '希洛', '凯卢阿', '珍珠城', '怀帕胡'] 
        : ['Honolulu', 'Hilo', 'Kailua', 'Pearl City', 'Waipahu']
    },
    {
      name: language === 'zh-CN' ? '爱达荷' : 'Idaho',
      cities: language === 'zh-CN' 
        ? ['博伊西', '南帕', '梅里迪恩', '爱达荷福尔斯', '波卡特洛'] 
        : ['Boise', 'Nampa', 'Meridian', 'Idaho Falls', 'Pocatello']
    },
    {
      name: language === 'zh-CN' ? '伊利诺伊' : 'Illinois',
      cities: language === 'zh-CN' 
        ? ['芝加哥', '斯普林菲尔德', '皮奥里亚', '罗克福德', '内珀维尔', '奥罗拉'] 
        : ['Chicago', 'Springfield', 'Peoria', 'Rockford', 'Naperville', 'Aurora']
    },
    {
      name: language === 'zh-CN' ? '印第安纳' : 'Indiana',
      cities: language === 'zh-CN' 
        ? ['印第安纳波利斯', '韦恩堡', '埃文斯维尔', '南本德', '卡梅尔'] 
        : ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel']
    },
    {
      name: language === 'zh-CN' ? '艾奥瓦' : 'Iowa',
      cities: language === 'zh-CN' 
        ? ['得梅因', '锡达拉皮兹', '达文波特', '苏城', '艾奥瓦城'] 
        : ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City']
    },
    {
      name: language === 'zh-CN' ? '堪萨斯' : 'Kansas',
      cities: language === 'zh-CN' 
        ? ['威奇托', '欧弗兰帕克', '堪萨斯城', '托皮卡', '奥拉西'] 
        : ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe']
    },
    {
      name: language === 'zh-CN' ? '肯塔基' : 'Kentucky',
      cities: language === 'zh-CN' 
        ? ['路易斯维尔', '列克星敦', '鲍灵格林', '欧文斯伯勒', '科温顿'] 
        : ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington']
    },
    {
      name: language === 'zh-CN' ? '路易斯安那' : 'Louisiana',
      cities: language === 'zh-CN' 
        ? ['新奥尔良', '巴吞鲁日', '什里夫波特', '拉斐特', '莱克查尔斯'] 
        : ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles']
    },
    {
      name: language === 'zh-CN' ? '缅因' : 'Maine',
      cities: language === 'zh-CN' 
        ? ['波特兰', '刘易斯顿', '班戈', '南波特兰', '奥本'] 
        : ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn']
    },
    {
      name: language === 'zh-CN' ? '马里兰' : 'Maryland',
      cities: language === 'zh-CN' 
        ? ['巴尔的摩', '弗雷德里克', '罗克维尔', '盖瑟斯堡', '银泉', '安纳波利斯'] 
        : ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Silver Spring', 'Annapolis']
    },
    {
      name: language === 'zh-CN' ? '马萨诸塞' : 'Massachusetts',
      cities: language === 'zh-CN' 
        ? ['波士顿', '伍斯特', '斯普林菲尔德', '剑桥', '洛厄尔', '布罗克顿'] 
        : ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton']
    },
    {
      name: language === 'zh-CN' ? '密歇根' : 'Michigan',
      cities: language === 'zh-CN' 
        ? ['底特律', '大急流城', '沃伦', '斯特林海茨', '安阿伯', '兰辛'] 
        : ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing']
    },
    {
      name: language === 'zh-CN' ? '明尼苏达' : 'Minnesota',
      cities: language === 'zh-CN' 
        ? ['明尼阿波利斯', '圣保罗', '罗切斯特', '德卢斯', '布卢明顿'] 
        : ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington']
    },
    {
      name: language === 'zh-CN' ? '密西西比' : 'Mississippi',
      cities: language === 'zh-CN' 
        ? ['杰克逊', '格尔夫波特', '南港', '哈蒂斯堡', '比洛克西'] 
        : ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi']
    },
    {
      name: language === 'zh-CN' ? '密苏里' : 'Missouri',
      cities: language === 'zh-CN' 
        ? ['堪萨斯城', '圣路易斯', '斯普林菲尔德', '哥伦比亚', '独立城'] 
        : ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence']
    },
    {
      name: language === 'zh-CN' ? '蒙大拿' : 'Montana',
      cities: language === 'zh-CN' 
        ? ['比林斯', '米苏拉', '大瀑布城', '博兹曼', '比尤特'] 
        : ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte']
    },
    {
      name: language === 'zh-CN' ? '内布拉斯加' : 'Nebraska',
      cities: language === 'zh-CN' 
        ? ['奥马哈', '林肯', '贝尔维尤', '大岛', '凯尔尼'] 
        : ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney']
    },
    {
      name: language === 'zh-CN' ? '内华达' : 'Nevada',
      cities: language === 'zh-CN' 
        ? ['拉斯维加斯', '亨德森', '里诺', '北拉斯维加斯', '斯帕克斯'] 
        : ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks']
    },
    {
      name: language === 'zh-CN' ? '新罕布什尔' : 'New Hampshire',
      cities: language === 'zh-CN' 
        ? ['曼彻斯特', '纳舒厄', '康科德', '多佛', '罗切斯特'] 
        : ['Manchester', 'Nashua', 'Concord', 'Dover', 'Rochester']
    },
    {
      name: language === 'zh-CN' ? '新泽西' : 'New Jersey',
      cities: language === 'zh-CN' 
        ? ['纽瓦克', '泽西城', '帕特森', '伊丽莎白', '特伦顿', '大西洋城'] 
        : ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton', 'Atlantic City']
    },
    {
      name: language === 'zh-CN' ? '新墨西哥' : 'New Mexico',
      cities: language === 'zh-CN' 
        ? ['阿尔伯克基', '拉斯克鲁塞斯', '圣菲', '里奥兰乔', '罗斯韦尔'] 
        : ['Albuquerque', 'Las Cruces', 'Santa Fe', 'Rio Rancho', 'Roswell']
    },
    {
      name: language === 'zh-CN' ? '纽约' : 'New York',
      cities: language === 'zh-CN' 
        ? ['纽约市', '布法罗', '奥尔巴尼', '罗切斯特', '锡拉丘兹', '扬克斯'] 
        : ['New York City', 'Buffalo', 'Albany', 'Rochester', 'Syracuse', 'Yonkers']
    },
    {
      name: language === 'zh-CN' ? '北卡罗来纳' : 'North Carolina',
      cities: language === 'zh-CN' 
        ? ['夏洛特', '罗利', '格林斯伯勒', '达勒姆', '温斯顿-塞勒姆', '费耶特维尔'] 
        : ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville']
    },
    {
      name: language === 'zh-CN' ? '北达科他' : 'North Dakota',
      cities: language === 'zh-CN' 
        ? ['法戈', '俾斯麦', '大福克斯', '迈诺特', '西法戈'] 
        : ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo']
    },
    {
      name: language === 'zh-CN' ? '俄亥俄' : 'Ohio',
      cities: language === 'zh-CN' 
        ? ['哥伦布', '克利夫兰', '辛辛那提', '托莱多', '阿克伦', '代顿'] 
        : ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton']
    },
    {
      name: language === 'zh-CN' ? '俄克拉荷马' : 'Oklahoma',
      cities: language === 'zh-CN' 
        ? ['俄克拉荷马城', '塔尔萨', '诺曼', '断箭', '劳顿'] 
        : ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton']
    },
    {
      name: language === 'zh-CN' ? '俄勒冈' : 'Oregon',
      cities: language === 'zh-CN' 
        ? ['波特兰', '塞勒姆', '尤金', '格雷舍姆', '希尔斯伯勒'] 
        : ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro']
    },
    {
      name: language === 'zh-CN' ? '宾夕法尼亚' : 'Pennsylvania',
      cities: language === 'zh-CN' 
        ? ['费城', '匹兹堡', '哈里斯堡', '阿伦敦', '伊利', '雷丁'] 
        : ['Philadelphia', 'Pittsburgh', 'Harrisburg', 'Allentown', 'Erie', 'Reading']
    },
    {
      name: language === 'zh-CN' ? '罗德岛' : 'Rhode Island',
      cities: language === 'zh-CN' 
        ? ['普罗维登斯', '沃威克', '克兰斯顿', '波塔基特', '东普罗维登斯'] 
        : ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence']
    },
    {
      name: language === 'zh-CN' ? '南卡罗来纳' : 'South Carolina',
      cities: language === 'zh-CN' 
        ? ['查尔斯顿', '哥伦比亚', '北查尔斯顿', '芒特普莱森特', '罗克希尔'] 
        : ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill']
    },
    {
      name: language === 'zh-CN' ? '南达科他' : 'South Dakota',
      cities: language === 'zh-CN' 
        ? ['苏福尔斯', '拉皮德城', '阿伯丁', '布鲁金斯', '沃特敦'] 
        : ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown']
    },
    {
      name: language === 'zh-CN' ? '田纳西' : 'Tennessee',
      cities: language === 'zh-CN' 
        ? ['纳什维尔', '孟菲斯', '诺克斯维尔', '查塔努加', '克拉克斯维尔'] 
        : ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville']
    },
    {
      name: language === 'zh-CN' ? '德克萨斯' : 'Texas',
      cities: language === 'zh-CN' 
        ? ['休斯顿', '达拉斯', '奥斯汀', '圣安东尼奥', '沃斯堡', '埃尔帕索', '阿灵顿', '科珀斯克里斯蒂', '普莱诺'] 
        : ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano']
    },
    {
      name: language === 'zh-CN' ? '犹他' : 'Utah',
      cities: language === 'zh-CN' 
        ? ['盐湖城', '西瓦利城', '普罗沃', '西乔丹', '奥勒姆'] 
        : ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem']
    },
    {
      name: language === 'zh-CN' ? '佛蒙特' : 'Vermont',
      cities: language === 'zh-CN' 
        ? ['伯灵顿', '南伯灵顿', '拉特兰', '埃塞克斯', '科尔切斯特'] 
        : ['Burlington', 'South Burlington', 'Rutland', 'Essex', 'Colchester']
    },
    {
      name: language === 'zh-CN' ? '弗吉尼亚' : 'Virginia',
      cities: language === 'zh-CN' 
        ? ['弗吉尼亚海滩', '诺福克', '里士满', '纽波特纽斯', '亚历山大', '切萨皮克'] 
        : ['Virginia Beach', 'Norfolk', 'Richmond', 'Newport News', 'Alexandria', 'Chesapeake']
    },
    {
      name: language === 'zh-CN' ? '华盛顿' : 'Washington',
      cities: language === 'zh-CN' 
        ? ['西雅图', '斯波坎', '塔科马', '温哥华', '贝尔维尤', '肯特', '埃弗里特'] 
        : ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett']
    },
    {
      name: language === 'zh-CN' ? '西弗吉尼亚' : 'West Virginia',
      cities: language === 'zh-CN' 
        ? ['查尔斯顿', '亨廷顿', '摩根敦', '帕克斯堡', '惠灵'] 
        : ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling']
    },
    {
      name: language === 'zh-CN' ? '威斯康星' : 'Wisconsin',
      cities: language === 'zh-CN' 
        ? ['密尔沃基', '麦迪逊', '格林贝', '基诺沙', '拉辛'] 
        : ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine']
    },
    {
      name: language === 'zh-CN' ? '怀俄明' : 'Wyoming',
      cities: language === 'zh-CN' 
        ? ['夏延', '卡斯珀', '拉勒米', '吉列', '罗克斯普林斯'] 
        : ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs']
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
