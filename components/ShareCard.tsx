import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { GameScenario } from '../types';

const PROJECT_URL = 'https://github.com/cookiegg/UnchosenPath';

interface ShareCardProps {
  scenario: GameScenario;
  lastChoice?: string;
  playerName?: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ scenario, lastChoice, playerName }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[400px] bg-gradient-to-b from-academic-900 to-academic-950 text-white font-sans"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header */}
        <div className="bg-academic-950 px-5 py-4 flex items-center justify-between border-b border-academic-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <div>
              <div className="text-amber-500 font-bold text-sm">未择之路</div>
              <div className="text-academic-400 text-xs">人生推演</div>
            </div>
          </div>
          {playerName && (
            <div className="text-academic-400 text-xs">
              {playerName} 的人生
            </div>
          )}
        </div>

        {/* Phase */}
        <div className="px-5 py-3 bg-amber-600/20 border-b border-academic-700">
          <div className="text-amber-500 font-bold text-lg">{scenario.phase}</div>
        </div>

        {/* Last Choice */}
        {lastChoice && (
          <div className="px-5 py-4 border-b border-academic-700">
            <div className="text-academic-500 text-xs mb-1">💬 我的选择</div>
            <div className="text-academic-200 text-sm leading-relaxed bg-academic-800/50 p-3 rounded border-l-2 border-amber-600">
              「{lastChoice}」
            </div>
          </div>
        )}

        {/* Feedback */}
        {scenario.feedback && (
          <div className="px-5 py-4 border-b border-academic-700">
            <div className="text-academic-500 text-xs mb-1">📖 结果</div>
            <div className="text-academic-300 text-sm italic leading-relaxed">
              "{scenario.feedback}"
            </div>
          </div>
        )}

        {/* Description */}
        <div className="px-5 py-4 border-b border-academic-700">
          <div className="text-academic-500 text-xs mb-2">📜 当前情境</div>
          <div className="text-academic-100 text-sm leading-relaxed">
            {scenario.description.length > 300
              ? scenario.description.slice(0, 300) + '...'
              : scenario.description}
          </div>
        </div>

        {/* Options Preview */}
        <div className="px-5 py-4 border-b border-academic-700">
          <div className="text-academic-500 text-xs mb-2">🎯 面临的选择</div>
          <div className="space-y-1.5">
            {scenario.options.slice(0, 3).map((option, idx) => (
              <div key={option.id} className="text-academic-300 text-xs flex items-start gap-2">
                <span className="text-amber-500">❧</span>
                <span>{option.text.length > 40 ? option.text.slice(0, 40) + '...' : option.text}</span>
              </div>
            ))}
            {scenario.options.length > 3 && (
              <div className="text-academic-500 text-xs">...还有更多选择</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-academic-950 flex items-center justify-between">
          <div>
            <div className="text-academic-400 text-xs mb-1">扫码查看项目</div>
            <div className="text-amber-500 text-[10px] font-mono break-all max-w-[200px]">
              github.com/cookiegg/UnchosenPath
            </div>
          </div>
          <div className="w-16 h-16 bg-white rounded p-1 flex items-center justify-center">
            <QRCodeSVG
              value={PROJECT_URL}
              size={56}
              level="M"
              bgColor="#ffffff"
              fgColor="#1a1a2e"
            />
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;
