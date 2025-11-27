import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportedLanguage } from '../src/i18n/types';

interface ProfessionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  mode?: 'profession' | 'major';
}

// 职业分类数据（双语）
const getProfessionCategories = (language: SupportedLanguage): Record<string, string[]> => {
  if (language === 'en-US') {
    return {
      'Tech & Internet': [
        'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Engineer',
        'Data Analyst', 'AI Engineer', 'Product Manager', 'UI/UX Designer', 'QA Engineer',
        'DevOps Engineer', 'Algorithm Engineer', 'Architect'
      ],
      'Healthcare': [
        'Doctor', 'Nurse', 'Pharmacist', 'Medical Researcher', 'Therapist',
        'Nutritionist', 'Psychologist', 'Dentist'
      ],
      'Education': [
        'Teacher', 'Professor', 'Trainer', 'Education Consultant', 'Counselor', 'Principal'
      ],
      'Finance': [
        'Accountant', 'Auditor', 'Financial Analyst', 'Investment Advisor',
        'Bank Clerk', 'Securities Analyst', 'Insurance Agent', 'Risk Manager'
      ],
      'Business & Sales': [
        'Sales Manager', 'Marketing', 'Business Development', 'Account Manager',
        'E-commerce Operations', 'Brand Manager', 'Channel Manager'
      ],
      'Manufacturing': [
        'Mechanical Engineer', 'Electrical Engineer', 'Quality Engineer',
        'Production Supervisor', 'Process Engineer', 'Equipment Engineer', 'Technician'
      ],
      'Construction': [
        'Architect', 'Civil Engineer', 'Cost Engineer', 'Project Manager',
        'Real Estate Agent', 'Interior Designer', 'Construction Worker'
      ],
      'Media & Arts': [
        'Journalist', 'Editor', 'Photographer', 'Video Producer', 'Graphic Designer',
        'Animator', 'Streamer', 'Director', 'Screenwriter'
      ],
      'Service Industry': [
        'Chef', 'Waiter', 'Hotel Manager', 'Tour Guide', 'Beautician',
        'Hairdresser', 'Fitness Coach', 'Driver'
      ],
      'Legal & Government': [
        'Lawyer', 'Legal Counsel', 'Civil Servant', 'Police Officer',
        'Judge', 'Prosecutor', 'Social Worker'
      ],
      'Entrepreneurship': [
        'Entrepreneur', 'Freelancer', 'Self-employed', 'Online Store Owner',
        'Content Creator', 'Independent Consultant', 'Investor'
      ],
      'Other': [
        'Unemployed', 'Retired', 'Homemaker', 'Volunteer', 'Freelance'
      ]
    };
  }
  
  return {
    '科技互联网': [
      '软件工程师', '前端开发', '后端开发', '全栈工程师', '数据分析师', 'AI工程师',
      '产品经理', 'UI/UX设计师', '测试工程师', '运维工程师', '算法工程师', '架构师'
    ],
    '医疗健康': [
      '医生', '护士', '药剂师', '医学研究员', '康复师', '营养师', '心理咨询师', '牙医'
    ],
    '教育培训': [
      '教师', '大学教授', '培训讲师', '教育顾问', '辅导员', '教研员', '校长'
    ],
    '金融财会': [
      '会计', '审计师', '财务分析师', '投资顾问', '银行职员', '证券分析师', '保险代理', '风控专员'
    ],
    '商业销售': [
      '销售经理', '市场营销', '商务拓展', '客户经理', '电商运营', '品牌经理', '渠道经理'
    ],
    '制造工程': [
      '机械工程师', '电气工程师', '质量工程师', '生产主管', '工艺工程师', '设备工程师', '技术员'
    ],
    '建筑房地产': [
      '建筑师', '土木工程师', '造价工程师', '项目经理', '房地产经纪', '室内设计师', '施工员'
    ],
    '传媒艺术': [
      '记者', '编辑', '摄影师', '视频制作', '平面设计师', '动画师', '主播', '导演', '编剧'
    ],
    '服务行业': [
      '厨师', '服务员', '酒店管理', '导游', '美容师', '理发师', '健身教练', '司机'
    ],
    '法律政务': [
      '律师', '法务专员', '公务员', '警察', '法官', '检察官', '社区工作者'
    ],
    '创业自由职业': [
      '创业者', '自由职业者', '个体户', '网店店主', '自媒体', '独立顾问', '投资人'
    ],
    '其他': [
      '待业', '退休', '家庭主妇/主夫', '志愿者', '自由职业'
    ]
  };
};

// 专业分类数据（双语）
const getMajorCategories = (language: SupportedLanguage): Record<string, string[]> => {
  if (language === 'en-US') {
    return {
      'Science': [
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Psychology',
        'Statistics', 'Geography', 'Astronomy'
      ],
      'Engineering (CS/EE)': [
        'Computer Science', 'Software Engineering', 'Electronic Engineering',
        'Communications', 'Automation', 'Artificial Intelligence', 'IoT Engineering'
      ],
      'Engineering (Traditional)': [
        'Mechanical Engineering', 'Civil Engineering', 'Architecture',
        'Electrical Engineering', 'Chemical Engineering', 'Materials Science',
        'Automotive Engineering', 'Bioengineering'
      ],
      'Medicine': [
        'Clinical Medicine', 'Dentistry', 'Preventive Medicine', 'Traditional Medicine',
        'Pharmacy', 'Nursing', 'Medical Imaging'
      ],
      'Economics': [
        'Economics', 'Finance', 'International Trade', 'Public Finance',
        'Financial Engineering', 'Insurance'
      ],
      'Management': [
        'Business Administration', 'Accounting', 'Marketing',
        'Human Resources', 'Public Administration', 'E-commerce', 'Logistics'
      ],
      'Law & Politics': [
        'Law', 'Political Science', 'Sociology', 'International Relations', 'Social Work'
      ],
      'Literature & Languages': [
        'Literature', 'Journalism', 'English', 'Japanese', 'Translation',
        'Advertising', 'New Media'
      ],
      'Arts': [
        'Visual Design', 'Environmental Design', 'Product Design',
        'Music', 'Fine Arts', 'Film & TV', 'Animation'
      ],
      'Education & Humanities': [
        'Education', 'History', 'Philosophy', 'Early Childhood Education', 'Physical Education'
      ]
    };
  }
  
  return {
    '理学': [
      '数学与应用数学', '物理学', '化学', '生物科学', '心理学', '统计学', '地理科学', '天文学'
    ],
    '工学 (计算机/电子)': [
      '计算机科学与技术', '软件工程', '电子信息工程', '通信工程', '自动化', '人工智能', '物联网工程'
    ],
    '工学 (传统)': [
      '机械设计制造', '土木工程', '建筑学', '电气工程', '化学工程', '材料科学', '车辆工程', '生物工程'
    ],
    '医学': [
      '临床医学', '口腔医学', '预防医学', '中医学', '药学', '护理学', '医学影像学'
    ],
    '经济学': [
      '经济学', '金融学', '国际经济与贸易', '财政学', '金融工程', '保险学'
    ],
    '管理学': [
      '工商管理', '会计学', '市场营销', '人力资源管理', '行政管理', '电子商务', '物流管理'
    ],
    '法学/政治': [
      '法学', '政治学与行政学', '社会学', '国际政治', '社会工作'
    ],
    '文学/外语': [
      '汉语言文学', '新闻学', '英语', '日语', '翻译', '广告学', '网络与新媒体'
    ],
    '艺术': [
      '视觉传达设计', '环境设计', '产品设计', '音乐表演', '美术学', '广播电视编导', '动画'
    ],
    '教育/历史/哲学': [
      '教育学', '历史学', '哲学', '学前教育', '体育教育'
    ]
  };
};

const ProfessionAutocomplete: React.FC<ProfessionAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  mode = 'profession'
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 根据模式和语言选择数据源
  const categories = mode === 'major' 
    ? getMajorCategories(currentLanguage) 
    : getProfessionCategories(currentLanguage);
  const allItems = Object.values(categories).flat();

  // 默认 placeholder
  const defaultPlaceholder = mode === 'major' 
    ? t('form.majorPlaceholder') 
    : t('form.professionPlaceholder');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);

    if (inputValue.trim()) {
      const filtered = allItems.filter(item =>
        item.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredItems(filtered.slice(0, 20));
      setIsOpen(true);
    } else {
      setFilteredItems([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (item: string) => {
    onChange(item);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (!value) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm disabled:opacity-50"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        placeholder={placeholder || defaultPlaceholder}
        disabled={disabled}
        autoComplete="off"
      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-academic-800 border border-academic-600 rounded shadow-2xl max-h-80 overflow-y-auto custom-scrollbar">
          {value.trim() ? (
            filteredItems.length > 0 ? (
              <div className="p-2">
                {filteredItems.map((item, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-academic-700 cursor-pointer rounded text-sm text-academic-100 transition-colors"
                    onClick={() => handleSelect(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-academic-500 text-sm">
                {t('form.noMatchHint', '未找到匹配项，可直接输入自定义内容')}
              </div>
            )
          ) : (
            <div className="p-2">
              {Object.entries(categories).map(([category, items]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <div className="text-xs font-bold text-amber-500 uppercase tracking-wider px-2 py-1">
                    {category}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 hover:bg-academic-700 cursor-pointer rounded text-sm text-academic-100 transition-colors"
                        onClick={() => handleSelect(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionAutocomplete;
