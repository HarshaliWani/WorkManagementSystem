import React, { useState } from 'react';
import { Work } from '../data/mockData';

interface StageCardProps {
  title: string;
  count: number;
  works: Work[];
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  onClick: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    icon: 'text-blue-600',
    hover: 'hover:bg-blue-100'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    icon: 'text-green-600',
    hover: 'hover:bg-green-100'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-900',
    icon: 'text-yellow-600',
    hover: 'hover:bg-yellow-100'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    icon: 'text-purple-600',
    hover: 'hover:bg-purple-100'
  }
};

export const StageCard: React.FC<StageCardProps> = ({ 
  title, 
  count, 
  works, 
  icon, 
  color, 
  onClick 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = colorClasses[color];

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`w-full p-6 rounded-xl border-2 transition-all duration-200 ${colors.bg} ${colors.border} ${colors.hover} hover:shadow-md transform hover:scale-105`}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className={`text-sm font-medium ${colors.text} opacity-80`}>
              {title}
            </p>
            <p className={`text-3xl font-bold mt-2 ${colors.text}`}>
              {count}
            </p>
          </div>
          <div className={`${colors.icon} opacity-80`}>
            {icon}
          </div>
        </div>
      </button>

      {showTooltip && works.length > 0 && (
        <div className="absolute z-20 top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-60 overflow-y-auto">
          <h4 className="font-semibold text-gray-900 mb-2">{title} Works</h4>
          <div className="space-y-2">
            {works.slice(0, 10).map((work, index) => (
              <div
                key={index}
                className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {work.workName}
                </p>
                <p className="text-xs text-gray-500">
                  AA: ₹{(work.AA / 100000).toFixed(1)}L | RA: ₹{(work.RA / 100000).toFixed(1)}L
                </p>
              </div>
            ))}
            {works.length > 10 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                +{works.length - 10} more works
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};