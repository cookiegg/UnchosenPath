import React, { useState } from 'react';
import { GameScenario, GameOption } from '../types';
import Button from './Button';

interface ScenarioCardProps {
  scenario: GameScenario;
  onOptionSelect: (choiceText: string) => void;
  isLoading: boolean;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onOptionSelect, isLoading }) => {
  const [customInput, setCustomInput] = useState('');

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onOptionSelect(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto bg-academic-800 border border-academic-600 rounded-xl shadow-2xl overflow-hidden fade-in flex flex-col md:flex-row">
      {/* Left Column: Content (60%) */}
      <div className="md:w-[60%] flex flex-col border-b md:border-b-0 md:border-r border-academic-700">
        {/* Header */}
        <div className="bg-academic-950 p-4 border-b border-academic-700 flex justify-between items-center">
          <span className="text-amber-500 font-serif tracking-widest text-sm uppercase">人生模拟 · 抉择时刻</span>
          <span className="bg-academic-800 text-academic-300 text-xs px-2 py-1 rounded border border-academic-600">
            {scenario.phase}
          </span>
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
  );
};

export default ScenarioCard;