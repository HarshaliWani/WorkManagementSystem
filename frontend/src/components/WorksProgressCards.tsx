import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ContextMenu } from './ContextMenu';

interface WorksProgressCardsProps {
  works_status: Record<string, number>;
  active_works: number;
  tenders: number;
  bills: number;
  onCardClick?: (type: string, filterKey: string, filterValue?: any) => void;
  grFilter?: number;
  onContextMenu?: (type: string, filterKey: string, filterValue?: any) => Array<{ label: string; onClick: () => void }>;
}

const getStatusColor = (status: string): { bg: string; border: string; text: string; icon: string } => {
  const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    good: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: 'text-green-600',
    },
    pending: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      icon: 'text-yellow-600',
    },
    stalled: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: 'text-red-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
    },
  };
  return colors[status] || colors.info;
};

const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const WorksProgressCards: React.FC<WorksProgressCardsProps> = ({
  works_status,
  active_works,
  tenders,
  bills,
  onCardClick,
  grFilter,
  onContextMenu,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: Array<{ label: string; onClick: () => void }> } | null>(null);
  const cards = [
    {
      key: 'no_ts_yet',
      label: 'No TS Yet',
      count: works_status.no_ts_yet || 0,
      percentage: calculatePercentage(works_status.no_ts_yet || 0, active_works),
      percentageLabel: 'of works',
      color: 'stalled',
      icon: AlertCircle,
      clickable: false,
      type: null as string | null,
      filterKey: null as string | null,
    },
    {
      key: 'ts_created',
      label: 'TS Created',
      count: works_status.ts_created || 0,
      percentage: calculatePercentage(works_status.ts_created || 0, active_works),
      percentageLabel: 'of works',
      color: 'pending',
      icon: Clock,
      clickable: false,
      type: null as string | null,
      filterKey: null as string | null,
    },
    {
      key: 'tenders_open',
      label: 'Tenders Open',
      count: works_status.tenders_open || 0,
      percentage: calculatePercentage(works_status.tenders_open || 0, tenders),
      percentageLabel: 'of tenders',
      color: 'pending',
      icon: Clock,
      clickable: true,
      type: 'tenders',
      filterKey: 'tenders_open',
    },
    {
      key: 'tenders_awarded',
      label: 'Tenders Awarded',
      count: works_status.tenders_awarded || 0,
      percentage: calculatePercentage(works_status.tenders_awarded || 0, tenders),
      percentageLabel: 'of tenders',
      color: 'info',
      icon: CheckCircle2,
      clickable: true,
      type: 'tenders',
      filterKey: 'tenders_awarded',
    },
    {
      key: 'bills_pending',
      label: 'Bills Pending',
      count: works_status.bills_pending || 0,
      percentage: calculatePercentage(works_status.bills_pending || 0, bills),
      percentageLabel: 'of bills',
      color: 'pending',
      icon: Clock,
      clickable: true,
      type: 'bills',
      filterKey: 'bills_pending',
    },
    {
      key: 'completed',
      label: 'Completed',
      count: works_status.completed || 0,
      percentage: calculatePercentage(works_status.completed || 0, bills),
      percentageLabel: 'of bills',
      color: 'good',
      icon: CheckCircle2,
      clickable: true,
      type: 'bills',
      filterKey: 'payment_completed',
    },
  ];

  const handleContextMenu = (e: React.MouseEvent, card: typeof cards[0]) => {
    e.preventDefault();
    if (onContextMenu && card.clickable && card.type && card.filterKey) {
      const menuItems = onContextMenu(card.type, card.filterKey);
      if (menuItems.length > 0) {
        setContextMenu({ x: e.clientX, y: e.clientY, items: menuItems });
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-4">
        {cards.map((card) => {
          const colors = getStatusColor(card.color);
          const Icon = card.icon;
          const isClickable = card.clickable && onCardClick && card.count > 0;
          const hasContextMenu = onContextMenu && card.clickable && card.type && card.filterKey;
          
          const CardWrapper = isClickable ? 'button' : 'div';
          const cardProps = isClickable
            ? {
                onClick: () => onCardClick!(card.type!, card.filterKey!),
                onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, card),
                className: `min-w-[200px] p-6 rounded-lg border transition-all duration-200 ${colors.bg} ${colors.border} hover:shadow-md hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`,
                title: `Click to view ${card.label}${hasContextMenu ? ' | Right-click for options' : ''}`,
              }
            : {
                className: `min-w-[200px] p-6 rounded-lg border ${colors.bg} ${colors.border}`,
              };

          return (
            <CardWrapper key={card.key} {...cardProps}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-medium ${colors.text}`}>{card.label}</p>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <p className={`text-3xl font-bold ${colors.text} mb-1`}>{card.count}</p>
              <p className={`text-xs ${colors.text} opacity-75`}>
                {card.percentage}% {card.percentageLabel}
              </p>
              {isClickable && (
                <p className={`text-xs ${colors.text} opacity-60 mt-2 italic`}>
                  Click to view →{hasContextMenu && ' | Right-click for options'}
                </p>
              )}
            </CardWrapper>
          );
        })}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

