import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { GameScenario, GameOption } from '../types';
import Button from './Button';
import ShareCard from './ShareCard';

interface ScenarioCardProps {
  scenario: GameScenario;
  onOptionSelect: (choiceText: string) => void;
  isLoading: boolean;
  lastChoice?: string;
  playerName?: string;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onOptionSelect, isLoading, lastChoice, playerName }) => {
  const [customInput, setCustomInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const handleExportImage = async () => {
    if (!shareCardRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2, // 高清导出
        useCORS: true,
        logging: false,
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setPreviewImage(imageUrl);
    } catch (error) {
      console.error('导出图片失败:', error);
      alert('导出图片失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadImage = () => {
    if (!previewImage) return;
    const link = document.createElement('a');
    link.download = `人生模拟_${scenario.phase.replace(/\s/g, '_')}_${Date.now()}.png`;
    link.href = previewImage;
    link.click();
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onOptionSelect(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <>
    {/* 隐藏的分享卡片，用于导出 */}
    <div className="fixed left-[-9999px] top-0 pointer-events-none">
      <ShareCard
        ref={shareCardRef}
        scenario={scenario}
        lastChoice={lastChoice}
        playerName={playerName}
      />
    </div>

    {/* 图片预览弹窗 - 避开顶部 bar (约 80px) */}
    {previewImage && (
      <div 
        className="fixed left-0 right-0 top-20 bottom-0 z-40 bg-black/80 backdrop-blur-sm overflow-y-auto fade-in"
        onClick={handleClosePreview}
      >
        <div className="min-h-full flex items-center justify-center p-4 py-8">
          <div 
            className="bg-academic-900 rounded-xl border border-academic-600 p-4 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-academic-100 font-serif">分享图片预览</h3>
              <button 
                onClick={handleClosePreview}
                className="text-academic-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="rounded overflow-hidden mb-4 border border-academic-700">
              <img 
                src={previewImage} 
                alt="分享图片" 
                className="w-full h-auto"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleDownloadImage}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 px-4 rounded transition-colors text-sm font-medium"
              >
                💾 保存图片
              </button>
              <button
                onClick={handleClosePreview}
                className="px-4 py-2 bg-academic-800 border border-academic-600 text-academic-300 rounded hover:bg-academic-700 transition-colors text-sm"
              >
                关闭
              </button>
            </div>
            
            <p className="text-academic-500 text-xs text-center mt-3">
              长按图片可直接分享到社交媒体
            </p>
          </div>
        </div>
      </div>
    )}
    
    <div className="max-w-6xl w-full mx-auto bg-academic-800 border border-academic-600 rounded-xl shadow-2xl overflow-hidden fade-in flex flex-col md:flex-row">
      {/* Left Column: Content (60%) */}
      <div className="md:w-[60%] flex flex-col border-b md:border-b-0 md:border-r border-academic-700">
        {/* Header */}
        <div className="bg-academic-950 p-4 border-b border-academic-700 flex justify-between items-center">
          <span className="text-amber-500 font-serif tracking-widest text-sm uppercase">人生模拟 · 抉择时刻</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportImage}
              disabled={isExporting}
              className="text-academic-400 hover:text-amber-500 transition-colors text-xs flex items-center gap-1 px-2 py-1 rounded border border-academic-600 hover:border-amber-600 disabled:opacity-50"
              title="导出为图片分享"
            >
              {isExporting ? '⏳' : '📷'} <span className="hidden sm:inline">分享</span>
            </button>
            <span className="bg-academic-800 text-academic-300 text-xs px-2 py-1 rounded border border-academic-600">
              {scenario.phase}
            </span>
          </div>
        </div>

        {/* Description & Feedback */}
        <div className="p-6 md:p-8 flex-grow flex flex-col justify-center">
          {scenario.feedback && (
            <div className="mb-6 p-4 bg-academic-900/50 border-l-4 border-amber-600 text-academic-300 italic text-sm rounded-r fade-in">
              " {scenario.feedback} "
            </div>
          )}

          <div className="text-lg md:text-xl font-serif text-academic-50 leading-relaxed">
            {scenario.description.split(/\n\n+/).map((paragraph, idx) => (
              paragraph.trim() && (
                <p key={idx} className="mb-5 last:mb-0 text-justify">
                  {paragraph.split('\n').map((line, lineIdx) => (
                    <React.Fragment key={lineIdx}>
                      {line}
                      {lineIdx < paragraph.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Options (40%) */}
      <div className="md:w-[40%] bg-academic-900/30 p-6 md:p-8 flex flex-col justify-center">
        <div className="text-xs font-bold text-academic-500 uppercase tracking-widest mb-4">
          请做出你的选择
        </div>
        <div className="space-y-3">
          {scenario.options.map((option) => (
            <Button
              key={option.id}
              variant="secondary"
              onClick={() => onOptionSelect(option.text)}
              disabled={isLoading}
              className="text-left justify-start h-auto py-4 px-5 hover:translate-x-1 transition-transform"
            >
              <span className="mr-3 text-amber-500 font-serif text-lg">❧</span>
              <span className="text-sm md:text-base">{option.text}</span>
            </Button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-academic-700"></div>
          <span className="px-3 text-academic-500 text-xs font-serif">或者</span>
          <div className="flex-grow border-t border-academic-700"></div>
        </div>

        {/* Custom Input Section */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-academic-500 uppercase tracking-widest mb-2">
            自定义回应
          </div>
          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={isLoading}
            placeholder="输入你自己的想法和决定..."
            className="w-full bg-academic-950 border border-academic-700 text-academic-100 p-3 rounded focus:outline-none focus:border-amber-600 transition-colors text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={4}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleCustomSubmit();
              }
            }}
          />
          <Button
            variant="primary"
            onClick={handleCustomSubmit}
            disabled={isLoading || !customInput.trim()}
            isLoading={isLoading && customInput.trim().length > 0}
            className="w-full"
          >
            <span className="mr-2">✓</span>
            提交自定义回应
          </Button>
          <div className="text-xs text-academic-600 text-center italic">
            提示: Ctrl/Cmd + Enter 快速提交
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ScenarioCard;