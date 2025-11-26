import React, { useState, ReactNode } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-academic-700',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-academic-700',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-academic-700',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-academic-700'
    };

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
                className="cursor-help"
            >
                {children}
            </div>

            {isVisible && (
                <div className={`absolute z-50 ${positionClasses[position]} animate-fadeIn w-64`}>
                    <div className="bg-academic-700 text-academic-50 text-xs rounded px-3 py-2 shadow-xl border border-academic-600 whitespace-normal text-left leading-relaxed">
                        {content}
                    </div>
                    <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}></div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;
