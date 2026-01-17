import React, { useState } from 'react';

interface WorksProgressBarProps {
  works_status: Record<string, number>;
  active_works: number;
}

const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const WorksProgressBar: React.FC<WorksProgressBarProps> = ({
  works_status,
  active_works,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const stages = [
    {
      key: 'no_ts_yet',
      label: 'No TS Yet',
      count: works_status.no_ts_yet || 0,
      color: 'bg-red-500',
      hoverColor: 'bg-red-600',
      borderColor: 'border-red-600',
    },
    {
      key: 'ts_created',
      label: 'TS Created',
      count: works_status.ts_created || 0,
      color: 'bg-yellow-500',
      hoverColor: 'bg-yellow-600',
      borderColor: 'border-yellow-600',
    },
    {
      key: 'tenders_open',
      label: 'Tenders Open',
      count: works_status.tenders_open || 0,
      color: 'bg-orange-500',
      hoverColor: 'bg-orange-600',
      borderColor: 'border-orange-600',
    },
    {
      key: 'tenders_awarded',
      label: 'Tenders Awarded',
      count: works_status.tenders_awarded || 0,
      color: 'bg-blue-500',
      hoverColor: 'bg-blue-600',
      borderColor: 'border-blue-600',
    },
    {
      key: 'bills_pending',
      label: 'Bills Pending',
      count: works_status.bills_pending || 0,
      color: 'bg-amber-500',
      hoverColor: 'bg-amber-600',
      borderColor: 'border-amber-600',
    },
    {
      key: 'completed',
      label: 'Completed',
      count: works_status.completed || 0,
      color: 'bg-green-500',
      hoverColor: 'bg-green-600',
      borderColor: 'border-green-600',
    },
  ];

  // Calculate widths
  const segments = stages.map((stage) => ({
    ...stage,
    percentage: calculatePercentage(stage.count, active_works),
    width: active_works > 0 ? (stage.count / active_works) * 100 : 0,
  }));

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="relative w-full h-10 sm:h-12 bg-gray-200 rounded-lg overflow-hidden flex">
        {segments.map((segment, index) => {
          const isHovered = hoveredSegment === segment.key;
          const showSegment = segment.width > 0;
          return (
            <div
              key={segment.key}
              className={`relative transition-all duration-200 ${
                showSegment ? (isHovered ? segment.hoverColor : segment.color) : 'bg-transparent'
              } ${showSegment ? 'border-r border-white' : ''} ${
                index === 0 && showSegment ? 'rounded-l-lg' : ''
              } ${
                index === segments.length - 1 && showSegment ? 'rounded-r-lg' : ''
              }`}
              style={{ width: `${segment.width}%`, minWidth: showSegment ? '2px' : '0' }}
              onMouseEnter={() => setHoveredSegment(segment.key)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              {isHovered && showSegment && (
                <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
                  <div className="font-semibold">{segment.label}</div>
                  <div className="text-xs opacity-90">
                    {segment.count} works ({segment.percentage}%)
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage Labels */}
      <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
        {segments.map((segment) => {
          const isHovered = hoveredSegment === segment.key;
          const getHoverBgColor = () => {
            switch (segment.color) {
              case 'bg-red-500':
                return 'bg-red-500 text-white';
              case 'bg-yellow-500':
                return 'bg-yellow-500 text-white';
              case 'bg-orange-500':
                return 'bg-orange-500 text-white';
              case 'bg-blue-500':
                return 'bg-blue-500 text-white';
              case 'bg-amber-500':
                return 'bg-amber-500 text-white';
              case 'bg-green-500':
                return 'bg-green-500 text-white';
              default:
                return 'bg-gray-100 text-gray-700';
            }
          };
          return (
            <div
              key={segment.key}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isHovered ? getHoverBgColor() : 'bg-gray-100 text-gray-700'
              }`}
              onMouseEnter={() => setHoveredSegment(segment.key)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className={`w-3 h-3 rounded-full ${segment.color}`}></div>
              <span className="font-medium">{segment.label}</span>
              <span className={isHovered ? 'opacity-90' : 'text-gray-600'}>({segment.count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

