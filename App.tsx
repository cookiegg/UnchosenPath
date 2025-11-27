import React, { useState, useEffect, useRef, ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { GameState, PlayerProfile, GameScenario, GameOption, FinalEvaluation, AIConfig, ModelProvider, HistoryItem, HistoryNode, GameTree } from './types';
import { initializeGame, nextTurn, getFinalEvaluation, setAIConfig, setTemplate, restoreSession } from './services/geminiService';
import {
  getAllTemplates,
  getTemplateById,
  getSelectedTemplateId,
  setSelectedTemplateId,
  saveCustomTemplate,
  deleteCustomTemplate,
  getTemplateName,
  getTemplateDescription,
  PromptTemplate,
} from './services/systemPrompts';
import Button from './components/Button';
import ScenarioCard from './components/ScenarioCard';
import Tooltip from './components/Tooltip';
import LocationCascader from './components/LocationCascader';
import ProfessionAutocomplete from './components/ProfessionAutocomplete';
import HistoryTree from './components/HistoryTree';
import LanguageSwitcher from './components/LanguageSwitcher';
import CountrySelector from './components/CountrySelector';
import logoImage from './assets/tag-square.png';
import { SupportedCountry, SupportedLanguage, DEFAULT_COUNTRY, COUNTRY_STORAGE_KEY } from './src/i18n/types';
import { getCountryContext } from './src/i18n/countries';
import './src/i18n'; // Initialize i18n

// Helper to check if current status is "Student" (works for both languages)
const isStudentStatus = (status: string): boolean => {
  const studentValues = ['学生', 'Student'];
  return studentValues.includes(status);
};

// --- PRESETS FOR PROVIDERS ---
const PROVIDER_PRESETS: Record<string, Partial<AIConfig>> = {
  [ModelProvider.GEMINI]: {
    baseUrl: '', // Not needed for SDK
    modelName: 'gemini-2.5-flash'
  },
  [ModelProvider.DEEPSEEK]: {
    baseUrl: 'https://api.deepseek.com',
    modelName: 'deepseek-chat'
  },
  [ModelProvider.MOONSHOT]: {
    baseUrl: 'https://api.moonshot.cn/v1',
    modelName: 'moonshot-v1-8k'
  },
  [ModelProvider.ALIYUN]: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    modelName: 'qwen-plus'
  },
  [ModelProvider.ZHIPU]: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    modelName: 'glm-4-flash'
  },
  [ModelProvider.OPENAI]: {
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4o-mini'
  }
};

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

// Error Boundary to catch React crashes
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: ''
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-academic-950 text-red-400 p-4 text-center font-serif">
          <div>
            <h1 className="text-2xl mb-4">Application Error</h1>
            <p className="bg-black/30 p-4 rounded">{this.state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-academic-800 border border-academic-600 rounded text-white hover:bg-academic-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}

const ConfigModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIConfig) => void;
  initialConfig: AIConfig | null;
}> = ({ isOpen, onClose, onSave, initialConfig }) => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<AIConfig>({
    provider: ModelProvider.GEMINI,
    apiKey: '',
    baseUrl: '',
    modelName: 'gemini-2.5-flash'
  });

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig, isOpen]);

  const handleProviderChange = (provider: ModelProvider) => {
    const preset = PROVIDER_PRESETS[provider];
    setConfig(prev => ({
      ...prev,
      provider,
      baseUrl: preset?.baseUrl || '',
      modelName: preset?.modelName || prev.modelName
    }));
  };

  const isGemini = config.provider === ModelProvider.GEMINI;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm fade-in">
      <div className="bg-academic-900 border border-academic-600 p-6 rounded-xl w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-serif text-academic-50 mb-4 flex items-center">
          <span className="text-amber-500 mr-2">⚙</span> {t('config.title')}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-academic-300 text-xs font-bold mb-2">{t('config.provider')}</label>
            <select
              className="w-full bg-academic-950 border border-academic-700 text-academic-100 p-2 rounded focus:border-amber-600 outline-none"
              value={config.provider}
              onChange={(e) => handleProviderChange(e.target.value as ModelProvider)}
            >
              <option value={ModelProvider.GEMINI}>{t('config.providers.gemini')}</option>
              <option value={ModelProvider.DEEPSEEK}>{t('config.providers.deepseek')}</option>
              <option value={ModelProvider.MOONSHOT}>{t('config.providers.moonshot')}</option>
              <option value={ModelProvider.ALIYUN}>{t('config.providers.aliyun')}</option>
              <option value={ModelProvider.ZHIPU}>{t('config.providers.zhipu')}</option>
              <option value={ModelProvider.OPENAI}>{t('config.providers.openai')}</option>
              <option value={ModelProvider.CUSTOM}>{t('config.providers.custom')}</option>
            </select>
          </div>

          <div>
            <label className="block text-academic-300 text-xs font-bold mb-2">{t('config.apiKey')} {isGemini && t('config.apiKeyOptional')}</label>
            <input
              type="password"
              className="w-full bg-academic-950 border border-academic-700 text-academic-100 p-2 rounded focus:border-amber-600 outline-none"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={isGemini ? t('config.apiKeyPlaceholder') : "sk-..."}
            />
          </div>

          {config.provider !== ModelProvider.GEMINI && (
            <div>
              <label className="block text-academic-300 text-xs font-bold mb-2">{t('config.baseUrl')}</label>
              <input
                type="text"
                className="w-full bg-academic-950 border border-academic-700 text-academic-100 p-2 rounded focus:border-amber-600 outline-none"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder={t('config.baseUrlPlaceholder')}
              />
            </div>
          )}

          <div>
            <label className="block text-academic-300 text-xs font-bold mb-2">{t('config.modelName')}</label>
            <input
              type="text"
              className="w-full bg-academic-950 border border-academic-700 text-academic-100 p-2 rounded focus:border-amber-600 outline-none"
              value={config.modelName}
              onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>{t('buttons.cancel')}</Button>
          <Button onClick={() => onSave(config)}>{t('config.saveSettings')}</Button>
        </div>
        <p className="text-xs text-academic-500 mt-4 text-center">
          {t('config.localStorageNote')}
        </p>
      </div>
    </div>
  );
};

const HistoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  gameTree: GameTree;
  onNodeClick?: (nodeId: string) => void;
  currentNodeId?: string | null;
}> = ({ isOpen, onClose, history, gameTree, onNodeClick, currentNodeId }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree');

  if (!isOpen) return null;

  // 获取从根到当前节点的主路径
  const getMainPath = (): HistoryNode[] => {
    if (!gameTree.rootId || Object.keys(gameTree.nodes).length === 0) return [];

    const path: HistoryNode[] = [];
    let nodeId: string | null = gameTree.rootId;

    while (nodeId) {
      const node = gameTree.nodes[nodeId];
      if (!node) break;
      path.push(node);
      // 沿着第一个子节点走（主线）
      nodeId = node.children.length > 0 ? node.children[0] : null;
    }
    return path;
  };

  // 获取节点的所有分支数量
  const getBranchCount = (nodeId: string): number => {
    const node = gameTree.nodes[nodeId];
    return node ? node.children.length : 0;
  };

  const mainPath = getMainPath();
  const hasTree = Object.keys(gameTree.nodes).length > 0;
  const hasBranches = (Object.values(gameTree.nodes) as HistoryNode[]).some(n => n.children.length > 1);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm fade-in">
      <div className="bg-academic-900 border border-academic-600 rounded-xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-academic-700 flex justify-between items-center bg-academic-950 rounded-t-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-serif text-academic-100">{t('history.title')}</h2>
            {hasTree && (
              <div className="flex bg-academic-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${viewMode === 'list'
                    ? 'bg-amber-600 text-white'
                    : 'text-academic-400 hover:text-white'
                    }`}
                >
                  📋 {t('nav.list')}
                </button>
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${viewMode === 'tree'
                    ? 'bg-amber-600 text-white'
                    : 'text-academic-400 hover:text-white'
                    }`}
                >
                  🌳 {t('nav.tree')}
                </button>
              </div>
            )}
            {hasBranches && (
              <span className="text-academic-500 text-xs">{t('nav.clickToBacktrack')}</span>
            )}
          </div>
          <button onClick={onClose} className="text-academic-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {!hasTree && history.length === 0 ? (
            <div className="h-full flex items-center justify-center text-academic-500">{t('history.noRecords')}</div>
          ) : viewMode === 'tree' && hasTree ? (
            // 树形可视化视图
            <HistoryTree
              gameTree={gameTree}
              onNodeClick={(nodeId) => onNodeClick?.(nodeId)}
              currentNodeId={currentNodeId || null}
            />
          ) : (
            // 列表视图
            <div className="p-6 overflow-y-auto h-full space-y-6 custom-scrollbar">
              {hasTree ? (
                mainPath.map((node) => (
                  <div
                    key={node.id}
                    className={`relative pl-6 border-l-2 pb-6 last:pb-0 cursor-pointer transition-all ${currentNodeId === node.id
                      ? 'border-amber-500'
                      : 'border-academic-700 hover:border-academic-500'
                      }`}
                    onClick={() => onNodeClick?.(node.id)}
                  >
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 transition-colors ${currentNodeId === node.id
                      ? 'bg-amber-500 border-amber-400'
                      : 'bg-academic-800 border-amber-600 hover:bg-amber-600'
                      }`}>
                      {getBranchCount(node.id) > 1 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full text-[8px] flex items-center justify-center text-white">
                          {getBranchCount(node.id)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-amber-500 font-bold mb-1 uppercase tracking-wider flex items-center gap-2">
                      {node.phase}
                      {currentNodeId === node.id && (
                        <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded">{t('game.current')}</span>
                      )}
                    </div>
                    <div className="text-academic-300 mb-2 text-sm italic line-clamp-2">
                      {node.description}
                    </div>
                    <div className="bg-academic-950/50 p-3 rounded border border-academic-800">
                      <span className="text-academic-500 text-xs mr-2">{t('history.yourChoice')}</span>
                      <span className="text-academic-100 font-medium">{node.choiceText}</span>
                    </div>
                    {node.feedback && (
                      <div className="mt-2 text-academic-400 text-sm">
                        <span className="text-amber-600/80 mr-1">➤</span> {node.feedback}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // 兼容旧的线性历史
                history.map((item, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-academic-700 pb-6 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-academic-800 border-2 border-amber-600"></div>
                    <div className="text-xs text-amber-500 font-bold mb-1 uppercase tracking-wider">
                      {item.phase}
                    </div>
                    <div className="text-academic-300 mb-2 text-sm italic">
                      {item.description}
                    </div>
                    <div className="bg-academic-950/50 p-3 rounded border border-academic-800">
                      <span className="text-academic-500 text-xs mr-2">你的选择:</span>
                      <span className="text-academic-100 font-medium">{item.choiceText}</span>
                    </div>
                    {item.feedback && (
                      <div className="mt-2 text-academic-400 text-sm">
                        <span className="text-amber-600/80 mr-1">➤</span> {item.feedback}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm fade-in">
      <div className="bg-academic-900 border border-academic-600 rounded-xl max-w-sm w-full shadow-2xl p-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-serif text-academic-100 mb-2">{title}</h3>
        <p className="text-academic-400 mb-6 text-sm">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose}>{t('buttons.cancel')}</Button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-900/50 border border-red-800 text-red-200 rounded hover:bg-red-800 transition-colors"
          >
            {t('buttons.confirmReset')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Prompt Editor Modal - Full template editing support
const PromptEditorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedId: string;
  onSelectTemplate: (id: string, customTemplate?: string) => void;
}> = ({ isOpen, onClose, selectedId, onSelectTemplate }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<string>('');
  const [editingName, setEditingName] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTemplates(getAllTemplates());
      const current = getTemplateById(selectedId);
      if (current) {
        setEditingTemplate(current.template);
        setEditingName(getTemplateName(current, currentLanguage));
      }
    }
  }, [isOpen, selectedId, currentLanguage]);

  const handleSelectTemplate = (id: string) => {
    const template = getTemplateById(id);
    if (template) {
      setEditingTemplate(template.template);
      setEditingName(getTemplateName(template, currentLanguage));
      onSelectTemplate(id);
    }
  };

  const handleSaveCustom = () => {
    const customId = `custom_${Date.now()}`;
    const newTemplate: PromptTemplate = {
      id: customId,
      name: { 'zh-CN': editingName || '自定义模板', 'en-US': editingName || 'Custom Template' },
      description: { 'zh-CN': '用户自定义的提示词模板', 'en-US': 'User-defined prompt template' },
      template: editingTemplate,
      isCustom: true
    };
    saveCustomTemplate(newTemplate);
    setTemplates(getAllTemplates());
    onSelectTemplate(customId);
    setIsEditing(false);
  };

  const handleDeleteCustom = (id: string) => {
    if (id.startsWith('custom_')) {
      deleteCustomTemplate(id);
      setTemplates(getAllTemplates());
      if (selectedId === id) {
        onSelectTemplate('classic');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm fade-in p-2">
      <div className="bg-academic-900 border border-academic-600 rounded-xl w-full max-w-6xl h-[95vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-academic-700 flex justify-between items-center">
          <h3 className="text-xl font-serif text-academic-50 flex items-center">
            <span className="text-amber-500 mr-2">📝</span> {t('promptEditor.title')}
          </h3>
          <button onClick={onClose} className="text-academic-400 hover:text-white">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Template List */}
          <div className="w-1/3 border-r border-academic-700 p-4 overflow-y-auto">
            <div className="text-xs text-academic-500 uppercase tracking-wider mb-3">{t('promptEditor.selectTemplate')}</div>
            <div className="space-y-2">
              {templates.map(tmpl => (
                <div
                  key={tmpl.id}
                  className={`p-3 rounded cursor-pointer transition-colors ${selectedId === tmpl.id
                    ? 'bg-amber-600/20 border border-amber-600'
                    : 'bg-academic-800 border border-academic-700 hover:border-academic-500'
                    }`}
                  onClick={() => handleSelectTemplate(tmpl.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-academic-100 text-sm">{getTemplateName(tmpl, currentLanguage)}</div>
                    {tmpl.isCustom && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCustom(tmpl.id); }}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >🗑</button>
                    )}
                  </div>
                  <div className="text-xs text-academic-500 mt-1">{getTemplateDescription(tmpl, currentLanguage)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Editor */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs text-academic-500 uppercase tracking-wider">
                {isEditing ? t('promptEditor.editing') : t('promptEditor.preview')}
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs px-3 py-1 bg-academic-800 border border-academic-600 rounded text-academic-300 hover:text-white"
              >
                {isEditing ? t('promptEditor.cancelEdit') : `✏️ ${t('promptEditor.edit')}`}
              </button>
            </div>

            {isEditing && (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder={t('promptEditor.templateName')}
                className="mb-2 w-full bg-academic-950 border border-academic-700 text-academic-100 p-2 rounded text-sm"
              />
            )}

            <textarea
              value={editingTemplate}
              onChange={(e) => setEditingTemplate(e.target.value)}
              readOnly={!isEditing}
              className={`flex-1 bg-academic-950 border border-academic-700 text-academic-100 p-4 rounded text-sm font-mono resize-none leading-relaxed ${isEditing ? 'focus:border-amber-600 focus:outline-none' : 'opacity-80'
                }`}
              placeholder={t('promptEditor.templatePlaceholder')}
            />

            <div className="text-xs text-academic-600 mt-2">
              {t('promptEditor.variables')}: {'{{startYear}}'}, {'{{endYear}}'}, {'{{years}}'}, {'{{languageInstruction}}'}, {'{{profileSection}}'}, {'{{countryContext}}'}
            </div>

            {isEditing && (
              <div className="mt-3 flex gap-2">
                <Button onClick={handleSaveCustom}>
                  💾 {t('promptEditor.saveAsNew')}
                </Button>
                <Button variant="secondary" onClick={() => {
                  onSelectTemplate(selectedId, editingTemplate);
                  setIsEditing(false);
                }}>
                  {t('promptEditor.useOnce')}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-academic-700 flex justify-end">
          <Button onClick={onClose}>{t('buttons.confirm')}</Button>
        </div>
      </div>
    </div>
  );
};

// Helper to check if grade is university level (works with new value format)
const isUniversityStudent = (grade?: string) => {
  if (!grade) return false;
  // New format: uni1, uni2, grad1, phd, etc.
  // Old format: 大一, 研一, 博士在读, etc.
  const universityGrades = ['uni1', 'uni2', 'uni3', 'uni4', 'uni5', 'grad1', 'grad2', 'grad3', 'phd'];
  return universityGrades.includes(grade) || grade.includes('大') || grade.includes('研') || grade.includes('博士');
};

const GameContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const currentYear = new Date().getFullYear();
  const currentLanguage = i18n.language as SupportedLanguage;
  
  // Load saved country preference from localStorage
  const getSavedCountry = (): SupportedCountry => {
    try {
      const saved = localStorage.getItem(COUNTRY_STORAGE_KEY);
      if (saved === 'CN' || saved === 'US') return saved;
    } catch (e) {
      console.warn('Failed to load country preference');
    }
    return DEFAULT_COUNTRY;
  };
  
  // Get default profile values based on language
  const getDefaultProfile = (lang: SupportedLanguage, country: SupportedCountry): PlayerProfile => {
    const isEnglish = lang === 'en-US';
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 0-11 -> 1-12
    return {
      name: '',
      gender: isEnglish ? 'Male' : '男',
      age: 25,
      currentStatus: isEnglish ? 'Employed' : '在职',
      education: isEnglish ? "Bachelor's" : '本科',
      grade: '',
      universityTier: '',
      familyBackground: isEnglish ? 'Middle Class' : '中产 (衣食无忧/城市土著)',
      parentsOccupation: isEnglish ? 'White Collar' : '白领',
      hometown: {
        province: '',
        city: ''
      },
      currentLocation: {
        province: '',
        city: ''
      },
      mbti: {
        energySource: 'E',
        perception: 'S',
        decision: 'T',
        lifestyle: 'J'
      },
      profession: '',
      major: '',
      skills: '',
      customBio: '',
      simulationStartYear: currentYear,
      simulationStartMonth: currentMonth,
      simulationEndYear: currentYear + 10,
      simulationEndMonth: currentMonth,
      country: country
    };
  };

  const [profile, setProfile] = useState<PlayerProfile>(() => 
    getDefaultProfile(currentLanguage, getSavedCountry())
  );
  const [currentScenario, setCurrentScenario] = useState<GameScenario | null>(null);
  const [finalResult, setFinalResult] = useState<FinalEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Config State
  const [showConfig, setShowConfig] = useState(false);
  const [aiConfig, setAiConfigState] = useState<AIConfig | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 树形历史状态
  const [gameTree, setGameTree] = useState<GameTree>({
    nodes: {},
    currentNodeId: null,
    rootId: null
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Prompt Template State
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [selectedTemplateId, setSelectedTemplateIdState] = useState<string>('classic');
  const [customTemplateContent, setCustomTemplateContent] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Update document title and lang attribute based on language
  useEffect(() => {
    document.title = t('app.title');
    document.documentElement.lang = currentLanguage === 'zh-CN' ? 'zh-CN' : 'en';
  }, [t, currentLanguage]);

  // Load Config, Profile and Game State on Mount
  useEffect(() => {
    // Load Config
    const savedConfig = localStorage.getItem('life_sim_ai_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setAiConfigState(parsed);
        setAIConfig(parsed);
      } catch (e) { console.error("Failed to load config"); }
    } else {
      const defaultConfig: AIConfig = {
        provider: ModelProvider.DEEPSEEK,
        apiKey: '',
        baseUrl: 'https://api.deepseek.com',
        modelName: 'deepseek-chat'
      };
      setAiConfigState(defaultConfig);
      setAIConfig(defaultConfig);
    }

    // Load Game State
    const savedState = localStorage.getItem('life_sim_game_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Only restore if we have a valid profile and not in INTRO state (or if user wants to resume)
        // For simplicity, we just load it. User can reset if they want.
        if (parsed.gameState && parsed.gameState !== GameState.INTRO) {
          setGameState(parsed.gameState);
          setProfile(parsed.profile);
          setCurrentScenario(parsed.currentScenario);
          setFinalResult(parsed.finalResult);
          setHistory(parsed.history || []);
          // 加载树形历史
          if (parsed.gameTree) {
            setGameTree(parsed.gameTree);
          }
          return; // Don't load saved profile if game is in progress
        }
      } catch (e) { console.error("Failed to load game state"); }
    }

    // Load saved profile (only if no game in progress)
    const savedProfile = localStorage.getItem('life_sim_saved_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(prev => ({ ...prev, ...parsed }));
      } catch (e) { console.error("Failed to load saved profile"); }
    }

    // Load saved template selection
    const savedTemplateId = getSelectedTemplateId();
    if (savedTemplateId) {
      setSelectedTemplateIdState(savedTemplateId);
      setTemplate(savedTemplateId);
    }
  }, []);

  // Save Game State on Change
  useEffect(() => {
    if (gameState === GameState.INTRO) return; // Don't save empty intro state over existing save unless explicit

    const stateToSave = {
      gameState,
      profile,
      currentScenario,
      finalResult,
      history,
      gameTree
    };
    localStorage.setItem('life_sim_game_state', JSON.stringify(stateToSave));
  }, [gameState, profile, currentScenario, finalResult, history, gameTree]);

  useEffect(() => {
    if (gameState === GameState.INTRO && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [gameState]);

  const handleSaveConfig = (config: AIConfig) => {
    setAiConfigState(config);
    setAIConfig(config);
    localStorage.setItem('life_sim_ai_config', JSON.stringify(config));
    setShowConfig(false);
    setError(null);
  };

  const handleStartGame = async () => {
    if (!profile.name || !profile.hometown.province || !profile.hometown.city || !profile.currentLocation.province || !profile.currentLocation.city || !profile.skills) return;
    if (isStudentStatus(profile.currentStatus) && !profile.major) return;
    if (!isStudentStatus(profile.currentStatus) && !profile.profession) return;
    if (isStudentStatus(profile.currentStatus) && !profile.grade) return;
    if (isStudentStatus(profile.currentStatus) && isUniversityStudent(profile.grade) && !profile.universityTier) return;

    // Check config: valid if Gemini (env or key) OR (other provider AND has key)
    // For Gemini, we allow empty key if env var is expected, but we can't easily check env var existence in browser client-side safely without exposing it, 
    // so we just let it proceed. The service will fail if no key.
    if (!aiConfig) {
      setShowConfig(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const scenario = await initializeGame(profile, currentLanguage, selectedTemplateId, customTemplateContent || undefined);
      setCurrentScenario(scenario);
      setGameState(GameState.PLAYING);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || JSON.stringify(err);
      setError(`${t('errors.simulatorStartFailed')}: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (choiceText: string) => {
    setLoading(true);
    setError(null);
    try {
      const nextScenario = await nextTurn(choiceText);

      // Record History (兼容旧格式)
      const newHistoryItem: HistoryItem = {
        phase: currentScenario.phase,
        description: currentScenario.description,
        choiceText: choiceText,
        feedback: nextScenario.feedback,
        timestamp: Date.now()
      };
      setHistory(prev => [...prev, newHistoryItem]);

      // 创建新的树节点
      const newNodeId = `node_${Date.now()}`;
      const newNode: HistoryNode = {
        id: newNodeId,
        parentId: gameTree.currentNodeId,
        phase: currentScenario.phase,
        description: currentScenario.description,
        choiceText: choiceText,
        feedback: nextScenario.feedback,
        scenario: currentScenario,
        children: [],
        timestamp: Date.now()
      };

      setGameTree(prev => {
        const newNodes = { ...prev.nodes, [newNodeId]: newNode };

        // 如果有父节点，更新父节点的 children
        if (prev.currentNodeId && newNodes[prev.currentNodeId]) {
          newNodes[prev.currentNodeId] = {
            ...newNodes[prev.currentNodeId],
            children: [...newNodes[prev.currentNodeId].children, newNodeId]
          };
        }

        return {
          nodes: newNodes,
          currentNodeId: newNodeId,
          rootId: prev.rootId || newNodeId
        };
      });

      setCurrentScenario(nextScenario);

      if (nextScenario.isGameOver) {
        setGameState(GameState.LOADING_TURN);
        const report = await getFinalEvaluation();
        setFinalResult(report);
        setGameState(GameState.GAME_OVER);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || JSON.stringify(err);
      setError(`${t('errors.errorPrefix')}: ${errMsg}。${t('errors.retryHint')}`);
    } finally {
      setLoading(false);
    }
  };

  // 回溯到指定节点
  const handleHistoryNodeClick = async (nodeId: string) => {
    const node = gameTree.nodes[nodeId];
    if (!node) return;

    // 1. 恢复到该节点的场景
    setCurrentScenario(node.scenario);
    setGameTree(prev => ({
      ...prev,
      currentNodeId: nodeId
    }));
    setShowHistory(false);

    // 2. 重建路径并恢复 AI 上下文
    // 从根节点到当前节点的路径
    const path: HistoryNode[] = [];
    let currentId: string | null = nodeId;

    // 自底向上回溯
    while (currentId) {
      const n = gameTree.nodes[currentId];
      if (n) {
        path.unshift(n);
        currentId = n.parentId;
      } else {
        break;
      }
    }

    // 调用服务恢复会话
    try {
      await restoreSession(path, currentLanguage);
      console.log("AI Session restored to node:", nodeId);
    } catch (e) {
      console.error("Failed to restore AI session:", e);
      // 不阻断 UI，但可能导致上下文丢失
    }
  };

  const resetGame = () => {
    setGameState(GameState.INTRO);
    setCurrentScenario(null);
    setFinalResult(null);
    setError(null);
  };

  // --- RENDER HELPERS ---

  const handleResetGame = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    localStorage.removeItem('life_sim_game_state');
    window.location.reload();
  };

  const handleExport = () => {
    if (!finalResult) return;

    const simulationYears = profile.simulationEndYear - profile.simulationStartYear;
    const date = new Date().toLocaleDateString();
    const isEnglish = i18n.language === 'en-US';
    
    // Localized labels
    const labels = {
      yearsLife: isEnglish ? `${profile.name}'s ${simulationYears}-Year Life` : `${profile.name}的${simulationYears}年人生`,
      generatedTime: t('evaluation.generatedTime'),
      finalEvaluation: t('evaluation.finalEvaluation'),
      score: t('evaluation.score'),
      personalProfile: t('evaluation.personalProfile'),
      age: t('form.age'),
      education: t('form.education'),
      major: t('form.major'),
      profession: t('form.profession'),
      lifeHistory: t('evaluation.lifeHistory'),
      situation: t('evaluation.situation'),
      choice: t('evaluation.choice'),
      result: t('evaluation.result'),
      summary: t('evaluation.summary'),
      lifeAdvice: t('evaluation.lifeAdvice'),
      student: t('form.student'),
      lifeSimulation: isEnglish ? 'Life_Simulation' : '人生模拟'
    };
    
    let content = `# ${labels.yearsLife} (${profile.simulationStartYear}-${profile.simulationEndYear})\n\n`;
    content += `> ${labels.generatedTime}: ${date}\n`;
    content += `> ${labels.finalEvaluation}: ${finalResult.title} (${labels.score}: ${finalResult.score})\n\n`;

    content += `## ${labels.personalProfile}\n`;
    content += `- ${labels.age}: ${profile.age}${isEnglish ? '' : '岁'}（${profile.simulationStartYear}${isEnglish ? '' : '年'}）\n`;
    content += `- ${labels.education}: ${profile.education}${profile.universityTier ? ` (${profile.universityTier})` : ''}\n`;
    content += `- ${isStudentStatus(profile.currentStatus) ? `${labels.major}: ${profile.major}` : `${labels.profession}: ${profile.profession}`}\n`;
    content += `- MBTI: ${profile.mbti.energySource}${profile.mbti.perception}${profile.mbti.decision}${profile.mbti.lifestyle}\n\n`;

    content += `## ${labels.lifeHistory}\n\n`;
    history.forEach(item => {
      content += `### ${item.phase}\n`;
      content += `**${labels.situation}**: ${item.description}\n\n`;
      content += `**${labels.choice}**: ${item.choiceText}\n\n`;
      if (item.feedback) content += `**${labels.result}**: ${item.feedback}\n\n`;
      content += `---\n\n`;
    });

    content += `## ${labels.summary}\n\n`;
    content += `${finalResult.summary}\n\n`;
    content += `## ${labels.lifeAdvice}\n\n`;
    content += `${finalResult.advice}\n`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name}_${labels.lifeSimulation}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderIntro = () => {
    const isConfigured = (aiConfig?.provider === ModelProvider.GEMINI) || (aiConfig?.apiKey);

    return (
      <div className="max-w-6xl w-full bg-academic-800 p-5 rounded-xl shadow-2xl border border-academic-600 fade-in relative">

        {/* Config Button */}
        <button
          onClick={() => setShowConfig(true)}
          className="absolute top-4 right-4 text-academic-400 hover:text-amber-500 transition-colors"
          title={t('buttons.configureAI')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <div className="text-center mb-4">
          <h1 className="text-2xl font-serif text-academic-50 mb-1">{t('app.title')}</h1>
          <h2 className="text-sm font-serif text-academic-300 italic">{t('app.subtitle')}</h2>
        </div>

        <p className="text-academic-400 mb-4 font-light leading-snug text-xs bg-academic-900/50 p-2 rounded border-l-4 border-amber-600">
          <strong>{t('app.coreLabel')}</strong>
          {t('app.description')}
          <span className="text-academic-500 ml-1">{t('app.disclaimer')}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Country Selector - First field */}
          <div className="col-span-1 md:col-span-4 bg-academic-900/30 p-3 rounded border border-amber-700/50">
            <label className="block text-amber-500 text-xs font-bold mb-2 uppercase tracking-wider">🌍 {t('form.country')}</label>
            <CountrySelector
              value={profile.country}
              onChange={(country) => {
                // Save country preference
                try {
                  localStorage.setItem(COUNTRY_STORAGE_KEY, country);
                } catch (e) {
                  console.warn('Failed to save country preference');
                }
                // Reset location when country changes
                setProfile({ 
                  ...profile, 
                  country,
                  hometown: { province: '', city: '' },
                  currentLocation: { province: '', city: '' }
                });
              }}
              className="w-full md:w-auto"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.name')}</label>
            <input
              ref={nameInputRef}
              type="text"
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm"
              placeholder={t('form.namePlaceholder')}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.gender')}</label>
            <select
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            >
              <option value={currentLanguage === 'en-US' ? 'Male' : '男'}>{t('form.male')}</option>
              <option value={currentLanguage === 'en-US' ? 'Female' : '女'}>{t('form.female')}</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.age')}</label>
            <input
              type="number"
              min="18"
              max="65"
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 18 })}
            />
            <p className="text-academic-500 text-xs mt-1">{t('form.ageHint')}</p>
          </div>

          <div className="col-span-1 md:col-span-4 bg-academic-900/30 p-3 rounded border border-academic-700">
            <label className="block text-amber-500 text-xs font-bold mb-2 uppercase tracking-wider">⏰ {t('form.simulationPeriod')}</label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-academic-400 text-xs mb-1">{t('form.startYear')}</label>
                <input
                  type="number"
                  min={currentYear}
                  max={2100}
                  className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm"
                  value={profile.simulationStartYear}
                  onChange={(e) => {
                    const startYear = parseInt(e.target.value) || currentYear;
                    // Validate start date is not before current date
                    const now = new Date();
                    const currentMonth = now.getMonth() + 1;
                    let validStartYear = startYear;
                    let validStartMonth = profile.simulationStartMonth;
                    
                    if (startYear < currentYear || (startYear === currentYear && profile.simulationStartMonth < currentMonth)) {
                      validStartYear = currentYear;
                      validStartMonth = currentMonth;
                    }
                    
                    const newEndYear = Math.max(validStartYear + 1, profile.simulationEndYear);
                    const cappedEndYear = Math.min(newEndYear, validStartYear + 100);
                    setProfile({
                      ...profile,
                      simulationStartYear: validStartYear,
                      simulationStartMonth: validStartMonth,
                      simulationEndYear: cappedEndYear
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-academic-400 text-xs mb-1">{t('form.startMonth')}</label>
                <select
                  className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm"
                  value={profile.simulationStartMonth}
                  onChange={(e) => {
                    const startMonth = parseInt(e.target.value);
                    // Validate start date is not before current date
                    const now = new Date();
                    const currentMonth = now.getMonth() + 1;
                    
                    if (profile.simulationStartYear === currentYear && startMonth < currentMonth) {
                      return; // Don't allow past months in current year
                    }
                    
                    setProfile({ ...profile, simulationStartMonth: startMonth });
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                    <option key={month} value={month} disabled={profile.simulationStartYear === currentYear && month < new Date().getMonth() + 1}>
                      {t(`form.${['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'][month - 1]}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-academic-400 text-xs mb-1">{t('form.endYear')}</label>
                <input
                  type="number"
                  min={profile.simulationStartYear + 1}
                  max={Math.min(2100, profile.simulationStartYear + 100)}
                  className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm"
                  value={profile.simulationEndYear}
                  onChange={(e) => {
                    const endYear = parseInt(e.target.value) || profile.simulationStartYear + 10;
                    const validEndYear = Math.max(endYear, profile.simulationStartYear + 1);
                    const cappedEndYear = Math.min(validEndYear, profile.simulationStartYear + 100);
                    setProfile({ 
                      ...profile, 
                      simulationEndYear: cappedEndYear
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-academic-400 text-xs mb-1">{t('form.endMonth')}</label>
                <select
                  className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm"
                  value={profile.simulationEndMonth}
                  onChange={(e) => {
                    setProfile({ ...profile, simulationEndMonth: parseInt(e.target.value) });
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                    <option key={month} value={month}>
                      {t(`form.${['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'][month - 1]}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-academic-500 text-xs mt-2">
              {t('form.simulationYearsHint', { 
                years: profile.simulationEndYear - profile.simulationStartYear + 
                  (profile.simulationEndMonth >= profile.simulationStartMonth ? 0 : 1)
              })}
            </p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.currentStatus')}</label>
            <select
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
              value={profile.currentStatus}
              onChange={(e) => setProfile({ ...profile, currentStatus: e.target.value })}
            >
              {getCountryContext(profile.country, currentLanguage).currentStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {isStudentStatus(profile.currentStatus) && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.grade')}</label>
              <select
                className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
                value={profile.grade}
                onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
              >
                <option value="">{t('form.selectGrade')}</option>
                <optgroup label={t('grades.elementary')}>
                  <option value="elementary1">{t('grades.elementary1')}</option>
                  <option value="elementary2">{t('grades.elementary2')}</option>
                  <option value="elementary3">{t('grades.elementary3')}</option>
                  <option value="elementary4">{t('grades.elementary4')}</option>
                  <option value="elementary5">{t('grades.elementary5')}</option>
                  <option value="elementary6">{t('grades.elementary6')}</option>
                </optgroup>
                <optgroup label={t('grades.middleSchool')}>
                  <option value="middle1">{t('grades.middle1')}</option>
                  <option value="middle2">{t('grades.middle2')}</option>
                  <option value="middle3">{t('grades.middle3')}</option>
                </optgroup>
                <optgroup label={t('grades.highSchool')}>
                  <option value="high1">{t('grades.high1')}</option>
                  <option value="high2">{t('grades.high2')}</option>
                  <option value="high3">{t('grades.high3')}</option>
                </optgroup>
                <optgroup label={t('grades.university')}>
                  <option value="uni1">{t('grades.uni1')}</option>
                  <option value="uni2">{t('grades.uni2')}</option>
                  <option value="uni3">{t('grades.uni3')}</option>
                  <option value="uni4">{t('grades.uni4')}</option>
                  <option value="uni5">{t('grades.uni5')}</option>
                </optgroup>
                <optgroup label={t('grades.graduate')}>
                  <option value="grad1">{t('grades.grad1')}</option>
                  <option value="grad2">{t('grades.grad2')}</option>
                  <option value="grad3">{t('grades.grad3')}</option>
                  <option value="phd">{t('grades.phd')}</option>
                </optgroup>
              </select>
            </div>
          )}

          {isStudentStatus(profile.currentStatus) && isUniversityStudent(profile.grade) && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.universityTier')}</label>
              <select
                className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
                value={profile.universityTier}
                onChange={(e) => setProfile({ ...profile, universityTier: e.target.value })}
              >
                <option value="">{t('form.selectUniversityTier')}</option>
                {getCountryContext(profile.country, currentLanguage).universityTiers.map((tier) => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
          )}

          <div className="col-span-1">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.education')}</label>
            <select
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
              value={profile.education}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
            >
              {getCountryContext(profile.country, currentLanguage).educationLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.familyBackground')}</label>
            <select
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
              value={profile.familyBackground}
              onChange={(e) => setProfile({ ...profile, familyBackground: e.target.value })}
            >
              {getCountryContext(profile.country, currentLanguage).familyBackgrounds.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.parentsOccupation')}</label>
            <select
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
              value={profile.parentsOccupation}
              onChange={(e) => setProfile({ ...profile, parentsOccupation: e.target.value })}
            >
              {getCountryContext(profile.country, currentLanguage).parentsOccupations.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.hometown')}</label>
            <LocationCascader
              value={profile.hometown}
              onChange={(val) => setProfile({ ...profile, hometown: val })}
              country={profile.country}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.currentLocation')}</label>
            <LocationCascader
              value={profile.currentLocation}
              onChange={(val) => setProfile({ ...profile, currentLocation: val })}
              country={profile.country}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">
              {isStudentStatus(profile.currentStatus) ? t('form.major') : t('form.profession')}
            </label>
            {isStudentStatus(profile.currentStatus) ? (
              <ProfessionAutocomplete
                value={profile.major || ''}
                onChange={(val) => setProfile({ ...profile, major: val })}
                placeholder={t('form.majorPlaceholder')}
                mode="major"
              />
            ) : (
              <ProfessionAutocomplete
                value={profile.profession || ''}
                onChange={(val) => setProfile({ ...profile, profession: val })}
                placeholder={t('form.professionPlaceholder')}
                mode="profession"
              />
            )}
          </div>

          <div className="col-span-1 md:col-span-4">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">
              {t('mbti.title')}
              <span className="ml-2 text-amber-500 font-normal normal-case text-xs">
                {profile.mbti.energySource}{profile.mbti.perception}{profile.mbti.decision}{profile.mbti.lifestyle}
                {' - '}
                {(() => {
                  const mbtiType = `${profile.mbti.energySource}${profile.mbti.perception}${profile.mbti.decision}${profile.mbti.lifestyle}`;
                  return t(`mbti.types.${mbtiType}`, '');
                })()}
              </span>
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {/* 维度1: 能量来源 */}
              <div>
                <div className="text-academic-400 text-xs mb-1 flex items-center gap-1">
                  {t('mbti.energySource')}
                  <Tooltip content={t('mbti.energySourceHint')}>
                    <span className="text-academic-500 cursor-help text-[10px]">ℹ️</span>
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, energySource: 'E' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.energySource === 'E'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">🌟 {t('mbti.extrovert')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, energySource: 'I' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.energySource === 'I'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">🌙 {t('mbti.introvert')}</div>
                  </button>
                </div>
              </div>

              {/* 维度2: 认知方式 */}
              <div>
                <div className="text-academic-400 text-xs mb-1 flex items-center gap-1">
                  {t('mbti.perception')}
                  <Tooltip content={t('mbti.perceptionHint')}>
                    <span className="text-academic-500 cursor-help text-[10px]">ℹ️</span>
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, perception: 'S' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.perception === 'S'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">👁️ {t('mbti.sensing')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, perception: 'N' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.perception === 'N'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">💡 {t('mbti.intuition')}</div>
                  </button>
                </div>
              </div>

              {/* 维度3: 决策方式 */}
              <div>
                <div className="text-academic-400 text-xs mb-1 flex items-center gap-1">
                  {t('mbti.decision')}
                  <Tooltip content={t('mbti.decisionHint')}>
                    <span className="text-academic-500 cursor-help text-[10px]">ℹ️</span>
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, decision: 'T' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.decision === 'T'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">🧠 {t('mbti.thinking')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, decision: 'F' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.decision === 'F'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">❤️ {t('mbti.feeling')}</div>
                  </button>
                </div>
              </div>

              {/* 维度4: 生活方式 */}
              <div>
                <div className="text-academic-400 text-xs mb-1 flex items-center gap-1">
                  {t('mbti.lifestyle')}
                  <Tooltip content={t('mbti.lifestyleHint')}>
                    <span className="text-academic-500 cursor-help text-[10px]">ℹ️</span>
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, lifestyle: 'J' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.lifestyle === 'J'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">📋 {t('mbti.judging')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, lifestyle: 'P' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.lifestyle === 'P'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">🎲 {t('mbti.perceiving')}</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-4">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">{t('form.skills')}</label>
            <input
              type="text"
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm"
              value={profile.skills}
              onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
              placeholder={t('form.skillsPlaceholder')}
            />
          </div>

          <div className="col-span-1 md:col-span-4">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">
              {t('form.customBio')} <span className="text-academic-500 font-normal normal-case">{t('form.customBioOptional')}</span>
            </label>
            <textarea
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm h-24 resize-none"
              value={profile.customBio || ''}
              onChange={(e) => setProfile({ ...profile, customBio: e.target.value })}
              placeholder={t('form.customBioPlaceholder')}
            />
          </div>

          {error && <div className="col-span-1 md:col-span-4 text-red-400 text-sm text-center mt-4 bg-red-900/20 p-3 rounded border border-red-800">{error}</div>}

          {/* Bottom Action Bar - 占满4列，内部再分4格 */}
          <div className="col-span-1 md:col-span-4 mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-academic-900/50 rounded-lg border border-academic-700">
            {/* AI配置按钮 */}
            <div
              className={`text-xs px-3 py-2.5 rounded border cursor-pointer flex items-center justify-center gap-2 transition-colors ${isConfigured
                ? 'bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/50'
                : 'bg-red-900/30 border-red-800 text-red-400 hover:bg-red-900/50'
                }`}
              onClick={() => setShowConfig(true)}
            >
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>{isConfigured ? `${aiConfig?.provider}` : t('buttons.configureAI')}</span>
            </div>

            {/* 提示词按钮 */}
            <div
              className="text-xs px-3 py-2.5 rounded border cursor-pointer flex items-center justify-center gap-2 transition-colors bg-academic-800/50 border-academic-600 text-academic-300 hover:bg-academic-700 hover:text-white"
              onClick={() => setShowPromptEditor(true)}
              title={t('promptEditor.systemPromptSettings')}
            >
              <span>📝</span>
              <span>{t('promptEditor.systemPromptSettings')}: {getTemplateName(getTemplateById(selectedTemplateId) || { name: { 'zh-CN': '经典版', 'en-US': 'Classic' } } as PromptTemplate, currentLanguage)}</span>
            </div>

            {/* 保存资料按钮 */}
            <button
              onClick={() => {
                localStorage.setItem('life_sim_saved_profile', JSON.stringify(profile));
                alert(t('profile.savedSuccess'));
              }}
              className="text-xs px-3 py-2.5 rounded border cursor-pointer flex items-center justify-center gap-2 transition-colors bg-academic-800/50 border-academic-600 text-academic-300 hover:bg-academic-700 hover:text-white"
              title={t('buttons.saveProfile')}
            >
              <span>💾</span>
              <span>{t('buttons.saveProfile')}</span>
            </button>

            {/* 开始模拟按钮 */}
            <Button
              onClick={handleStartGame}
              disabled={
                !profile.name ||
                !profile.hometown.province ||
                !profile.hometown.city ||
                !profile.currentLocation.province ||
                !profile.currentLocation.city ||
                !profile.skills ||
                (isStudentStatus(profile.currentStatus) && !profile.major) ||
                (!isStudentStatus(profile.currentStatus) && !profile.profession) ||
                (isStudentStatus(profile.currentStatus) && !profile.grade) ||
                (isStudentStatus(profile.currentStatus) && isUniversityStudent(profile.grade) && !profile.universityTier) ||
                loading
              }
              isLoading={loading}
              className="w-full"
            >
              🚀 {t('buttons.start')}
            </Button>
          </div>

          {/* 清除存档按钮 - 单独一行 */}
          {localStorage.getItem('life_sim_game_state') && (
            <div className="col-span-1 md:col-span-4 mt-2 text-center">
              <button
                onClick={handleResetGame}
                className="text-xs px-3 py-1.5 rounded border border-red-800/50 text-red-400 hover:bg-red-900/30 transition-colors"
              >
                🗑️ {t('buttons.clearSave')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGameOver = () => {
    if (!finalResult) return null;

    let scoreColor = "text-red-500";
    if (finalResult.score >= 80) scoreColor = "text-green-500";
    else if (finalResult.score >= 60) scoreColor = "text-amber-500";

    const simulationYears = profile.simulationEndYear - profile.simulationStartYear;
    const finalAge = profile.age + simulationYears;
    const occupation = profile.currentStatus === '学生' || profile.currentStatus === 'Student' ? profile.major : profile.profession;
    const location = `${profile.currentLocation.province} ${profile.currentLocation.city}`;
    const universityTierDisplay = profile.universityTier ? ` (${profile.universityTier})` : '';

    return (
      <div className="max-w-5xl w-full bg-paper text-academic-900 p-8 rounded-sm shadow-2xl border-t-8 border-academic-900 fade-in relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none text-9xl font-serif font-bold whitespace-nowrap rotate-[-15deg]">
          LIFE {profile.simulationEndYear}
        </div>

        <div className="text-center mb-8 border-b-2 border-academic-200 pb-6">
          <h2 className="text-3xl font-serif font-bold mb-2 text-academic-900">
            {t('evaluation.yearProfile', { year: profile.simulationEndYear })}
          </h2>
          <div className="text-academic-600 text-sm uppercase tracking-widest">
            {t('evaluation.profileInfo', { 
              name: profile.name, 
              age: finalAge, 
              education: profile.education, 
              universityTier: universityTierDisplay, 
              occupation: occupation, 
              location: location 
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
          <div className="flex-shrink-0 text-center w-full md:w-auto">
            <div className={`text-7xl font-bold font-serif ${scoreColor}`}>
              {finalResult.score}
            </div>
            <div className="text-xs uppercase tracking-widest text-academic-500 mt-2">{t('evaluation.score')}</div>
          </div>
          <div className="flex-grow">
            <h3 className="text-2xl font-bold font-serif text-academic-800 mb-3">{finalResult.title}</h3>
            <p className="text-academic-700 leading-relaxed text-base font-serif mb-4 text-justify">
              {finalResult.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-academic-100 p-5 rounded border border-academic-200">
            <h4 className="font-bold text-academic-800 mb-3 flex items-center text-sm uppercase tracking-wider">
              <span className="text-amber-600 mr-2">●</span> {t('evaluation.yearsTimeline', { years: simulationYears })}
            </h4>
            <p className="text-academic-700 text-sm whitespace-pre-line leading-relaxed">
              {finalResult.timeline}
            </p>
          </div>
          <div className="bg-academic-50 p-5 rounded border border-academic-200">
            <h4 className="font-bold text-academic-800 mb-3 flex items-center text-sm uppercase tracking-wider">
              <span className="text-amber-600 mr-2">●</span> {t('evaluation.adviceForYear', { year: profile.simulationStartYear })}
            </h4>
            <p className="text-academic-700 text-sm italic leading-relaxed">
              "{finalResult.advice}"
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => {
            localStorage.removeItem('life_sim_game_state');
            window.location.reload();
          }}>
            {t('evaluation.restartLife')}
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            📥 {t('evaluation.exportHistory')}
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-academic-200 text-center text-xs text-academic-500">
          <p>{t('evaluation.projectTitle')} {t('evaluation.copyright')}</p>
          <p className="mt-1">{t('evaluation.license')}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-academic-950 via-academic-900 to-black text-academic-50 font-sans selection:bg-amber-500/30">

      <header className="fixed top-0 left-0 w-full p-4 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-academic-950/80 backdrop-blur px-6 py-3 rounded-full border border-academic-800 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Logo" className="h-auto w-12" />
            <div className="hidden md:flex md:flex-col">
              <h1 className="font-serif text-academic-100 text-lg tracking-wide">
                未择之路UnchosenPath
                {gameState !== GameState.INTRO && (
                  <span className="text-academic-500 text-sm ml-1">
                    {profile.simulationStartYear}-{profile.simulationEndYear}
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-academic-500 text-xs">@墨渊Transhuman</span>
                <div className="flex items-center gap-1.5">
                  <a
                    href="https://github.com/cookiegg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-academic-500 hover:text-amber-500 transition-colors"
                    title="GitHub"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/XuefW82242"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-academic-500 hover:text-amber-500 transition-colors"
                    title="X (Twitter)"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://v.douyin.com/EvusAOjyPXQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-academic-500 hover:text-amber-500 transition-colors"
                    title="TikTok/Douyin"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {gameState === GameState.PLAYING && (
              <>
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-academic-900/50 border border-academic-700 text-academic-300 rounded-full hover:bg-academic-800 hover:text-white hover:border-amber-500 transition-all group"
                >
                  <span>📜</span>
                  <span className="hidden sm:inline">{t('nav.history')}</span>
                </button>
                <button
                  onClick={handleResetGame}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-academic-900/50 border border-academic-700 text-academic-300 rounded-full hover:bg-academic-800 hover:text-white hover:border-red-500 transition-all group"
                  title={t('nav.restart')}
                >
                  <span>🔄</span>
                  <span className="hidden sm:inline">{t('nav.restart')}</span>
                </button>
              </>
            )}
            <LanguageSwitcher className="rounded-full" />
            <button
              onClick={() => setShowConfig(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-academic-900/50 border border-academic-700 text-academic-300 rounded-full hover:bg-academic-800 hover:text-white hover:border-amber-500 transition-all"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">{t('nav.settings')}</span>
            </button>
          </div>
        </div>
      </header>

      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={handleSaveConfig}
        initialConfig={aiConfig}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        gameTree={gameTree}
        onNodeClick={handleHistoryNodeClick}
        currentNodeId={gameTree.currentNodeId}
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        title={t('reset.title')}
        message={t('reset.message')}
      />

      <PromptEditorModal
        isOpen={showPromptEditor}
        onClose={() => setShowPromptEditor(false)}
        selectedId={selectedTemplateId}
        onSelectTemplate={(id, customTemplate) => {
          setSelectedTemplateIdState(id);
          setSelectedTemplateId(id);
          setTemplate(id, customTemplate);
          if (customTemplate) {
            setCustomTemplateContent(customTemplate);
          } else {
            setCustomTemplateContent(null);
          }
        }}
      />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-academic-800/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-amber-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full flex justify-center py-8 mt-16">
        {gameState === GameState.INTRO && renderIntro()}

        {gameState === GameState.PLAYING && currentScenario && (
          <div className="w-full flex flex-col items-center">
            <ScenarioCard
              scenario={currentScenario}
              onOptionSelect={handleOptionSelect}
              isLoading={loading}
              lastChoice={history.length > 0 ? history[history.length - 1].choiceText : undefined}
              playerName={profile.name}
            />
          </div>
        )}

        {gameState === GameState.LOADING_TURN && (
          <div className="text-center fade-in py-20">
            <div className="inline-block relative w-20 h-20 mb-6">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-academic-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-serif text-academic-200">{t('game.loadingTitle')}</h2>
            <p className="text-academic-500 mt-2 text-sm">{t('game.loadingDesc', { startYear: profile.simulationStartYear, endYear: profile.simulationEndYear })}</p>
          </div>
        )}

        {gameState === GameState.GAME_OVER && renderGameOver()}
      </div>

      <div className="fixed bottom-2 w-full text-center text-academic-700 text-[10px] font-serif opacity-50">
        Life Simulator 2025-2035 | Supports Gemini, DeepSeek, Qwen, GLM, etc.
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GameContent />
    </ErrorBoundary>
  );
};

export default App;