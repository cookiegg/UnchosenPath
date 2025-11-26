import React, { useState, useEffect, useRef, ErrorInfo } from 'react';
import { GameState, PlayerProfile, GameScenario, GameOption, FinalEvaluation, AIConfig, ModelProvider, HistoryItem } from './types';
import { initializeGame, nextTurn, getFinalEvaluation, setAIConfig } from './services/geminiService';
import Button from './components/Button';
import ScenarioCard from './components/ScenarioCard';
import Tooltip from './components/Tooltip';
import LocationCascader from './components/LocationCascader';
import ProfessionAutocomplete from './components/ProfessionAutocomplete';

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
          <span className="text-amber-500 mr-2">⚙</span> 模型配置 (AI Settings)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-academic-300 text-xs font-bold mb-2">服务提供商 (Provider)</label>
            <select
              className="w-full bg-academic-950 border border-academic-700 text-academic-100 p-2 rounded focus:border-amber-600 outline-none"
              value={config.provider}
              onChange={(e) => handleProviderChange(e.target.value as ModelProvider)}
            >
              <option value={ModelProvider.GEMINI}>Google Gemini (推荐)</option>
              <option value={ModelProvider.DEEPSEEK}>DeepSeek (深度求索)</option>
              <option value={ModelProvider.MOONSHOT}>Kimi (月之暗面)</option>
              <option value={ModelProvider.ALIYUN}>Qwen (通义千问)</option>
              <option value={ModelProvider.ZHIPU}>GLM (智谱AI)</option>
              <option value={ModelProvider.OPENAI}>OpenAI / ChatGPT</option>
              <option value={ModelProvider.CUSTOM}>Custom (自定义)</option>
            </select>
          </div>

          <div>
            <label className="block text-academic-300 text-xs font-bold mb-2">API Key {isGemini && "(可选，留空则尝试使用环境变量)"}</label>
            <input
              type="password"
              className="w-full bg-academic-950 border border-academic-700 text-academic-100 p-2 rounded focus:border-amber-600 outline-none"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={isGemini ? "自动使用环境变量 (如有)" : "sk-..."}
            />
          </div>

          {config.provider !== ModelProvider.GEMINI && (
            <div>
              <label className="block text-academic-300 text-xs font-bold mb-2">Base URL</label>
              <input
                type="text"
                className="w-full bg-academic-950 border border-academic-700 text-academic-100 p-2 rounded focus:border-amber-600 outline-none"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="https://api.example.com/v1"
              />
            </div>
          )}

          <div>
            <label className="block text-academic-300 text-xs font-bold mb-2">模型名称 (Model Name)</label>
            <input
              type="text"
              className="w-full bg-academic-950 border border-academic-700 text-academic-100 p-2 rounded focus:border-amber-600 outline-none"
              value={config.modelName}
              onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={() => onSave(config)}>保存设置</Button>
        </div>
        <p className="text-xs text-academic-500 mt-4 text-center">
          配置仅保存在本地浏览器缓存中。
        </p>
      </div>
    </div>
  );
};

const HistoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
}> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm fade-in">
      <div className="bg-academic-900 border border-academic-600 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-academic-700 flex justify-between items-center bg-academic-950 rounded-t-xl">
          <h2 className="text-xl font-serif text-academic-100">人生履历</h2>
          <button onClick={onClose} className="text-academic-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center text-academic-500 py-8">暂无记录</div>
          ) : (
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm fade-in">
      <div className="bg-academic-900 border border-academic-600 rounded-xl max-w-sm w-full shadow-2xl p-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-serif text-academic-100 mb-2">{title}</h3>
        <p className="text-academic-400 mb-6 text-sm">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-900/50 border border-red-800 text-red-200 rounded hover:bg-red-800 transition-colors"
          >
            确认重置
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper to check if grade is university level
const isUniversityStudent = (grade?: string) => {
  if (!grade) return false;
  return grade.includes('大') || grade.includes('研') || grade.includes('博士');
};

const GameContent: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [profile, setProfile] = useState<PlayerProfile>({
    name: '',
    gender: '男',
    age: 25,
    currentStatus: '在职',
    education: '本科',
    grade: '', // 初始化年级
    universityTier: '', // 初始化高校层次
    familyBackground: '中产 (衣食无忧/城市土著)',
    parentsOccupation: '白领',
    hometown: {
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
    skills: ''
  });
  const [currentScenario, setCurrentScenario] = useState<GameScenario | null>(null);
  const [finalResult, setFinalResult] = useState<FinalEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Config State
  const [showConfig, setShowConfig] = useState(false);
  const [aiConfig, setAiConfigState] = useState<AIConfig | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Load Config and Game State on Mount
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
        provider: ModelProvider.GEMINI,
        apiKey: '',
        baseUrl: '',
        modelName: 'gemini-2.5-flash'
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
        }
      } catch (e) { console.error("Failed to load game state"); }
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
      history
    };
    localStorage.setItem('life_sim_game_state', JSON.stringify(stateToSave));
  }, [gameState, profile, currentScenario, finalResult, history]);

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
    if (!profile.name || !profile.hometown.province || !profile.hometown.city || !profile.skills) return;
    if (profile.currentStatus === '学生' && !profile.major) return;
    if (profile.currentStatus !== '学生' && !profile.profession) return;
    if (profile.currentStatus === '学生' && !profile.grade) return;
    if (profile.currentStatus === '学生' && isUniversityStudent(profile.grade) && !profile.universityTier) return;

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
      const scenario = await initializeGame(profile);
      setCurrentScenario(scenario);
      setGameState(GameState.PLAYING);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || JSON.stringify(err);
      setError(`模拟器启动失败: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (choiceText: string) => {
    setLoading(true);
    setError(null);
    try {
      const nextScenario = await nextTurn(choiceText);
      // Record History
      const newHistoryItem: HistoryItem = {
        phase: currentScenario.phase,
        description: currentScenario.description,
        choiceText: choiceText,
        feedback: nextScenario.feedback,
        timestamp: Date.now()
      };
      setHistory(prev => [...prev, newHistoryItem]);

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
      setError(`错误: ${errMsg}。请检查网络或点击重试。`);
    } finally {
      setLoading(false);
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

    const date = new Date().toLocaleDateString();
    let content = `# ${profile.name}的十年人生 (2025-2035)\n\n`;
    content += `> 生成时间: ${date}\n`;
    content += `> 最终评价: ${finalResult.title} (得分: ${finalResult.score})\n\n`;

    content += `## 个人档案\n`;
    content += `- 院校: ${profile.scoreTier}\n`;
    content += `- 专业: ${profile.majorInterest}\n`;
    content += `- MBTI: ${profile.mbti.energySource}${profile.mbti.perception}${profile.mbti.decision}${profile.mbti.lifestyle}\n\n`;

    content += `## 人生履历\n\n`;
    history.forEach(item => {
      content += `### ${item.phase}\n`;
      content += `**情境**: ${item.description}\n\n`;
      content += `**抉择**: ${item.choiceText}\n\n`;
      if (item.feedback) content += `**结果**: ${item.feedback}\n\n`;
      content += `---\n\n`;
    });

    content += `## 最终回顾\n\n`;
    content += `${finalResult.summary}\n\n`;
    content += `## 人生建议\n\n`;
    content += `${finalResult.advice}\n`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name}_人生模拟_${Date.now()}.md`;
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
          title="设置模型 API"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <div className="text-center mb-4">
          <h1 className="text-2xl font-serif text-academic-50 mb-1">十年·未来推演</h1>
          <h2 className="text-sm font-serif text-academic-300 italic">2025 - 2035：当信息变得廉价，什么才是你的核心资产？</h2>
        </div>

        <p className="text-academic-400 mb-4 font-light leading-snug text-xs bg-academic-900/50 p-2 rounded border-l-4 border-amber-600">
          <strong>推演核心：</strong>
          AI让信息生产成本归零，我们模拟在"信息无限、物质稀缺、信任重构"的新时代背景下，一个碳基生命的真实生存博弈。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="col-span-1">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">姓名</label>
            <input
              ref={nameInputRef}
              type="text"
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm"
              placeholder="你的名字"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">性别</label>
            <select
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            >
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">年龄</label>
            <input
              type="number"
              min="18"
              max="65"
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 18 })}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">当前状态</label>
            <select
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
              value={profile.currentStatus}
              onChange={(e) => setProfile({ ...profile, currentStatus: e.target.value })}
            >
              <option value="学生">学生</option>
              <option value="在职">在职</option>
              <option value="创业">创业</option>
              <option value="待业">待业</option>
              <option value="自由职业">自由职业</option>
              <option value="退休">退休</option>
            </select>
          </div>

          {profile.currentStatus === '学生' && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">当前年级</label>
              <select
                className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
                value={profile.grade}
                onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
              >
                <option value="">请选择年级</option>
                <optgroup label="小学">
                  <option value="小学一年级">小学一年级</option>
                  <option value="小学二年级">小学二年级</option>
                  <option value="小学三年级">小学三年级</option>
                  <option value="小学四年级">小学四年级</option>
                  <option value="小学五年级">小学五年级</option>
                  <option value="小学六年级">小学六年级</option>
                </optgroup>
                <optgroup label="初中">
                  <option value="初一">初一</option>
                  <option value="初二">初二</option>
                  <option value="初三">初三</option>
                </optgroup>
                <optgroup label="高中/职高">
                  <option value="高一">高一</option>
                  <option value="高二">高二</option>
                  <option value="高三">高三</option>
                </optgroup>
                <optgroup label="大学/大专">
                  <option value="大一">大一</option>
                  <option value="大二">大二</option>
                  <option value="大三">大三</option>
                  <option value="大四">大四</option>
                  <option value="大五(医/建)">大五</option>
                </optgroup>
                <optgroup label="研究生">
                  <option value="研一">研一</option>
                  <option value="研二">研二</option>
                  <option value="研三">研三</option>
                  <option value="博士在读">博士在读</option>
                </optgroup>
              </select>
            </div>
          )}

          {profile.currentStatus === '学生' && isUniversityStudent(profile.grade) && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">高校层次</label>
              <select
                className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
                value={profile.universityTier}
                onChange={(e) => setProfile({ ...profile, universityTier: e.target.value })}
              >
                <option value="">请选择高校层次</option>
                <option value="Top 2 (清北)">Top 2 (清北)</option>
                <option value="C9/华五">C9/华五</option>
                <option value="985/211重点大学">985/211</option>
                <option value="普通一本/二本">普通本科</option>
                <option value="大专/职业院校">大专/职校</option>
                <option value="海外名校 (QS Top 100)">海外名校</option>
                <option value="普通海外高校">普通海外高校</option>
              </select>
            </div>
          )}

          <div className="col-span-1">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">学历</label>
            <select
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
              value={profile.education}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
            >
              <option value="无">无</option>
              <option value="高中">高中</option>
              <option value="大专">大专</option>
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">家庭背景</label>
            <select
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
              value={profile.familyBackground}
              onChange={(e) => setProfile({ ...profile, familyBackground: e.target.value })}
            >
              <option value="富裕 (家产丰厚/有矿)">富裕</option>
              <option value="中产 (衣食无忧/城市土著)">中产</option>
              <option value="工薪 (普通家庭)">工薪</option>
              <option value="贫困 (寒门学子)">贫困</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">父母职业</label>
            <select
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm"
              value={profile.parentsOccupation}
              onChange={(e) => setProfile({ ...profile, parentsOccupation: e.target.value })}
            >
              <option value="务农">务农</option>
              <option value="小生意">小生意</option>
              <option value="白领">白领</option>
              <option value="基层公务员">公务员</option>
              <option value="中高层管理">管理层</option>
              <option value="老板/企业家">老板</option>
              <option value="专业人士">专业人士</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-4">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">籍贯</label>
            <LocationCascader
              value={profile.hometown}
              onChange={(location) => setProfile({ ...profile, hometown: location })}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">
              {profile.currentStatus === '学生' ? '专业' : '职业'}
            </label>
            {profile.currentStatus === '学生' ? (
              <ProfessionAutocomplete
                value={profile.major || ''}
                onChange={(val) => setProfile({ ...profile, major: val })}
                placeholder="例：计算机科学、临床医学、金融学"
                mode="major"
              />
            ) : (
              <ProfessionAutocomplete
                value={profile.profession || ''}
                onChange={(val) => setProfile({ ...profile, profession: val })}
                placeholder="例：软件工程师、医生、教师"
                mode="profession"
              />
            )}
          </div>

          <div className="col-span-1 md:col-span-4">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">
              MBTI性格
              <span className="ml-2 text-amber-500 font-normal normal-case text-xs">
                {profile.mbti.energySource}{profile.mbti.perception}{profile.mbti.decision}{profile.mbti.lifestyle}
                {' - '}
                {(() => {
                  const mbtiType = `${profile.mbti.energySource}${profile.mbti.perception}${profile.mbti.decision}${profile.mbti.lifestyle}`;
                  const mbtiNames: Record<string, string> = {
                    'INTJ': '建筑师', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
                    'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
                    'ISTJ': '物流师', 'ISFJ': '守卫者', 'ESTJ': '总经理', 'ESFJ': '执政官',
                    'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '表演者'
                  };
                  return mbtiNames[mbtiType] || '';
                })()}
              </span>
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {/* 维度1: 能量来源 */}
              <div>
                <div className="text-academic-400 text-xs mb-1 flex items-center gap-1">
                  能量来源
                  <Tooltip content="外向(E): 从社交中获得能量，喜欢团队合作；内向(I): 从独处中获得能量，需要个人空间">
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
                    <div className="font-semibold">🌟 外向(E)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, energySource: 'I' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.energySource === 'I'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">🌙 内向(I)</div>
                  </button>
                </div>
              </div>

              {/* 维度2: 认知方式 */}
              <div>
                <div className="text-academic-400 text-xs mb-1 flex items-center gap-1">
                  认知方式
                  <Tooltip content="实感(S): 关注具体细节和实际经验；直觉(N): 关注大局和未来可能性">
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
                    <div className="font-semibold">👁️ 实感(S)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, perception: 'N' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.perception === 'N'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">💡 直觉(N)</div>
                  </button>
                </div>
              </div>

              {/* 维度3: 决策方式 */}
              <div>
                <div className="text-academic-400 text-xs mb-1 flex items-center gap-1">
                  决策方式
                  <Tooltip content="思考(T): 基于逻辑分析做决策，追求客观公正；情感(F): 基于价值观和人际关系做决策">
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
                    <div className="font-semibold">🧠 思考(T)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, decision: 'F' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.decision === 'F'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">❤️ 情感(F)</div>
                  </button>
                </div>
              </div>

              {/* 维度4: 生活方式 */}
              <div>
                <div className="text-academic-400 text-xs mb-1 flex items-center gap-1">
                  生活方式
                  <Tooltip content="判断(J): 喜欢计划和结构，追求确定性；感知(P): 灵活应变，保持开放性">
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
                    <div className="font-semibold">📋 判断(J)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, mbti: { ...profile.mbti, lifestyle: 'P' } })}
                    className={`p-1.5 rounded border transition-all text-xs ${profile.mbti.lifestyle === 'P'
                      ? 'bg-amber-600 border-amber-500 text-white font-bold'
                      : 'bg-academic-900 border-academic-600 text-academic-300 hover:border-amber-600 hover:text-academic-100'
                      }`}
                  >
                    <div className="font-semibold">🎲 感知(P)</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-academic-300 text-xs font-bold mb-1.5 uppercase tracking-wider">特长与技能</label>
            <input
              type="text"
              className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm"
              placeholder="例：编程、写作、绘画、运动、音乐、演讲"
              value={profile.skills}
              onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
            />
          </div>
        </div>

        {/* AI Status Indicator */}
        <div className="mt-4 flex justify-center">
          <div
            className={`text-xs px-3 py-1 rounded-full border cursor-pointer flex items-center gap-2 transition-colors ${isConfigured
              ? 'bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/50'
              : 'bg-red-900/30 border-red-800 text-red-400 hover:bg-red-900/50'
              }`}
            onClick={() => setShowConfig(true)}
          >
            <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isConfigured ? `已配置: ${aiConfig?.provider} / ${aiConfig?.modelName}` : '未配置 AI (点击设置)'}
          </div>
        </div>

        {error && <div className="text-red-400 text-sm text-center mt-4 bg-red-900/20 p-2 rounded border border-red-800">{error}</div>}

        <div className="mt-6">
          <div className="mt-8 flex justify-center gap-4">
            <Button
              onClick={handleStartGame}
              disabled={
                !profile.name ||
                !profile.hometown.province ||
                !profile.hometown.city ||
                !profile.skills ||
                (profile.currentStatus === '学生' && !profile.major) ||
                (profile.currentStatus !== '学生' && !profile.profession) ||
                (profile.currentStatus === '学生' && !profile.grade) ||
                (profile.currentStatus === '学生' && isUniversityStudent(profile.grade) && !profile.universityTier) ||
                loading
              }
              isLoading={loading}
            >
              开始模拟人生
            </Button>

            {/* Reset Button (only if there is saved data) */}
            {localStorage.getItem('life_sim_game_state') && (
              <button
                onClick={handleResetGame}
                className="px-4 py-2 text-academic-500 text-sm hover:text-red-400 transition-colors underline"
              >
                清除存档
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGameOver = () => {
    if (!finalResult) return null;

    let scoreColor = "text-red-500";
    if (finalResult.score >= 80) scoreColor = "text-green-500";
    else if (finalResult.score >= 60) scoreColor = "text-amber-500";

    return (
      <div className="max-w-5xl w-full bg-paper text-academic-900 p-8 rounded-sm shadow-2xl border-t-8 border-academic-900 fade-in relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none text-9xl font-serif font-bold whitespace-nowrap rotate-[-15deg]">
          LIFE 2035
        </div>

        <div className="text-center mb-8 border-b-2 border-academic-200 pb-6">
          <h2 className="text-3xl font-serif font-bold mb-2 text-academic-900">2035年·个人档案</h2>
          <div className="text-academic-600 text-sm uppercase tracking-widest">
            {profile.name} | {profile.age + 10}岁 | {profile.education}{profile.universityTier ? ` (${profile.universityTier})` : ''} | {profile.currentStatus === '学生' ? profile.major : profile.profession} | {profile.hometown.province} {profile.hometown.city}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
          <div className="flex-shrink-0 text-center w-full md:w-auto">
            <div className={`text-7xl font-bold font-serif ${scoreColor}`}>
              {finalResult.score}
            </div>
            <div className="text-xs uppercase tracking-widest text-academic-500 mt-2">人生满意度</div>
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
              <span className="text-amber-600 mr-2">●</span> 十年轨迹 (Timeline)
            </h4>
            <p className="text-academic-700 text-sm whitespace-pre-line leading-relaxed">
              {finalResult.timeline}
            </p>
          </div>
          <div className="bg-academic-50 p-5 rounded border border-academic-200">
            <h4 className="font-bold text-academic-800 mb-3 flex items-center text-sm uppercase tracking-wider">
              <span className="text-amber-600 mr-2">●</span> 给2025年的建议
            </h4>
            <p className="text-academic-700 text-sm italic leading-relaxed">
              "{finalResult.advice}"
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => window.location.reload()}>
            再次重启人生
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            📥 导出人生履历
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-academic-950 via-academic-900 to-black text-academic-50 font-sans selection:bg-amber-500/30">

      <header className="fixed top-0 left-0 w-full p-4 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-academic-950/80 backdrop-blur px-6 py-3 rounded-full border border-academic-800 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <h1 className="font-serif text-academic-100 text-lg tracking-wide hidden md:block">
              十年人生 <span className="text-academic-500 text-sm ml-1">2025-2035</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {gameState === GameState.PLAYING && (
              <>
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-academic-900/50 border border-academic-700 text-academic-300 rounded-full hover:bg-academic-800 hover:text-white hover:border-amber-500 transition-all group"
                >
                  <span>📜</span>
                  <span className="hidden sm:inline">人生履历</span>
                </button>
                <button
                  onClick={handleResetGame}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-academic-900/50 border border-academic-700 text-academic-300 rounded-full hover:bg-academic-800 hover:text-white hover:border-red-500 transition-all group"
                  title="重置进度"
                >
                  <span>🔄</span>
                  <span className="hidden sm:inline">重启人生</span>
                </button>
              </>
            )}
            <button
              onClick={() => setShowConfig(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-academic-900/50 border border-academic-700 text-academic-300 rounded-full hover:bg-academic-800 hover:text-white hover:border-amber-500 transition-all"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">设置</span>
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
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        title="重启人生？"
        message="确定要重置当前游戏进度吗？所有未保存的记录将丢失，你将回到角色创建界面。"
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
            />
          </div>
        )}

        {gameState === GameState.LOADING_TURN && (
          <div className="text-center fade-in py-20">
            <div className="inline-block relative w-20 h-20 mb-6">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-academic-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-serif text-academic-200">岁月流转中...</h2>
            <p className="text-academic-500 mt-2 text-sm">正在计算 2025-2035 的世界线变动</p>
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