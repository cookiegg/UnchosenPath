import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { GameScenario } from '../types';
import tagPng from '../assets/tag-square.png';

const DEMO_URL = 'https://cookiegg.github.io/UnchosenPath';
const PROJECT_URL = 'https://github.com/cookiegg/UnchosenPath';

interface ShareCardProps {
  scenario: GameScenario;
  lastChoice?: string;
  playerName?: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ scenario, lastChoice, playerName }, ref) => {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en-US';
    
    return (
      <div
        ref={ref}
        className="w-[400px] bg-gradient-to-b from-academic-900 to-academic-950 text-white font-sans"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header */}
        <div className="bg-academic-950 px-5 py-4 flex items-center justify-between border-b border-academic-700">
          <div className="flex items-center gap-2">
            <img src={tagPng} alt="logo" className="h-12 w-auto" />
            <div>
              <div className="text-amber-500 font-bold text-sm">
                {t('app.title')}
              </div>
              <div className="text-academic-400 text-xs">
                {isEnglish ? 'Life Simulation' : '人生推演'}
              </div>
            </div>
          </div>
          {playerName && (
            <div className="text-academic-400 text-xs">
              {t('share.playerLife', { name: playerName })}
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
            <div className="text-academic-500 text-xs mb-1">💬 {t('share.myChoice')}</div>
            <div className="text-academic-200 text-sm leading-relaxed bg-academic-800/50 p-3 rounded border-l-2 border-amber-600">
              「{lastChoice}」
            </div>
          </div>
        )}

        {/* Feedback */}
        {scenario.feedback && (
          <div className="px-5 py-4 border-b border-academic-700">
            <div className="text-academic-500 text-xs mb-1">📖 {t('evaluation.result')}</div>
            <div className="text-academic-300 text-sm italic leading-relaxed">
              "{scenario.feedback}"
            </div>
          </div>
        )}

        {/* Description */}
        <div className="px-5 py-4 border-b border-academic-700">
          <div className="text-academic-500 text-xs mb-2">📜 {t('share.currentSituation')}</div>
          <div className="text-academic-100 text-sm leading-relaxed">
            {scenario.description.length > 300
              ? scenario.description.slice(0, 300) + '...'
              : scenario.description}
          </div>
        </div>

        {/* Options Preview */}
        <div className="px-5 py-4 border-b border-academic-700">
          <div className="text-academic-500 text-xs mb-2">🎯 {t('share.facingChoices')}</div>
          <div className="space-y-1.5">
            {scenario.options.slice(0, 3).map((option) => (
              <div key={option.id} className="text-academic-300 text-xs flex items-start gap-2">
                <span className="text-amber-500">❧</span>
                <span>{option.text.length > 40 ? option.text.slice(0, 40) + '...' : option.text}</span>
              </div>
            ))}
            {scenario.options.length > 3 && (
              <div className="text-academic-500 text-xs">{t('share.moreChoices')}</div>
            )}
          </div>
        </div>

        {/* Footer with two QR codes */}
        <div className="px-5 py-4 bg-academic-950">
          <div className="flex items-start justify-between gap-4">
            {/* Demo QR Code */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-white rounded p-1 flex items-center justify-center relative">
                <QRCodeSVG
                  value={DEMO_URL}
                  size={48}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#1a1a2e"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={tagPng} alt="logo" className="w-3 h-3 bg-white p-0.5 rounded-sm" />
                </div>
              </div>
              <div className="text-amber-500 text-[10px] mt-1 text-center">{t('share.tryDemo')}</div>
            </div>
            
            {/* Center text */}
            <div className="flex-1 text-center pt-2">
              <div className="text-academic-400 text-[10px] leading-tight">
                {t('app.title')}
              </div>
              <div className="text-academic-500 text-[9px] mt-0.5">
                {isEnglish ? 'Life Simulation' : '人生推演模拟器'}
              </div>
              {/* Text Links */}
              <div className="mt-2 space-y-0.5">
                <div className="text-amber-500 text-[8px] break-all">
                  🎮 {DEMO_URL}
                </div>
                <div className="text-academic-400 text-[8px] break-all">
                  💻 {PROJECT_URL}
                </div>
              </div>
            </div>
            
            {/* Project QR Code */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-white rounded p-1 flex items-center justify-center relative">
                <QRCodeSVG
                  value={PROJECT_URL}
                  size={48}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#1a1a2e"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={tagPng} alt="logo" className="w-3 h-3 bg-white p-0.5 rounded-sm" />
                </div>
              </div>
              <div className="text-academic-400 text-[10px] mt-1 text-center">{t('share.viewProject')}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;
