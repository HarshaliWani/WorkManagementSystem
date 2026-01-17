import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle, LucideIcon } from 'lucide-react';
import { ContextMenu } from './ContextMenu';

interface StatusSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  statusData: Record<string, number>;
  total: number;
  items: Array<{
    key: string;
    label: string;
    color: 'good' | 'pending' | 'stalled' | 'info';
    icon: LucideIcon;
    clickable?: boolean;
    navigateTo?: string;
    filterKey?: string;
    filterValue?: any;
  }>;
  onItemClick?: (navigateTo: string, filterKey: string, filterValue?: any) => void;
  onContextMenu?: (navigateTo: string, filterKey: string, filterValue?: any) => Array<{ label: string; onClick: () => void }>;
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

const getPercentageLabel = (key: string, label: string): string => {
  if (key.includes('stage')) {
    return 'in ' + label.toLowerCase();
  }
  if (key.includes('pending')) {
    return 'pending';
  }
  if (key.includes('completed') || key.includes('issued')) {
    return 'completed';
  }
  if (key.includes('verification')) {
    return 'in ' + label.toLowerCase();
  }
  return '';
};

export const StatusSection: React.FC<StatusSectionProps> = ({
  title,
  icon: Icon,
  iconColor,
  statusData,
  total,
  items,
  onItemClick,
  onContextMenu,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: Array<{ label: string; onClick: () => void }> } | null>(null);

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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 pt-2">
          <div className={`grid grid-cols-1 md:grid-cols-2 ${items.length > 2 ? 'lg:grid-cols-3' : ''} gap-4`}>
            {items.map((item) => {
              const count = statusData[item.key] || 0;
              const percentage = calculatePercentage(count, total);
              const colors = getStatusColor(item.color);
              const ItemIcon = item.icon;
              const isClickable = item.clickable && onItemClick && item.navigateTo && item.filterKey && count > 0;
              const hasContextMenu = onContextMenu && item.clickable && item.navigateTo && item.filterKey && count > 0;

              const handleContextMenu = (e: React.MouseEvent) => {
                e.preventDefault();
                if (hasContextMenu) {
                  const menuItems = onContextMenu(item.navigateTo!, item.filterKey!, item.filterValue);
                  if (menuItems.length > 0) {
                    setContextMenu({ x: e.clientX, y: e.clientY, items: menuItems });
                  }
                }
              };
              
              const ItemWrapper = isClickable ? 'button' : 'div';
              const itemProps = isClickable
                ? {
                    onClick: () => onItemClick(item.navigateTo!, item.filterKey!, item.filterValue),
                    onContextMenu: handleContextMenu,
                    className: `p-4 rounded-lg border transition-all duration-200 ${colors.bg} ${colors.border} hover:shadow-md hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`,
                    title: `Click to view ${item.label}${hasContextMenu ? ' | Right-click for options' : ''}`,
                  }
                : {
                    className: `p-4 rounded-lg border ${colors.bg} ${colors.border}`,
                  };

              return (
                <ItemWrapper key={item.key} {...itemProps}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${colors.text}`}>{item.label}</p>
                    <ItemIcon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <p className={`text-2xl font-bold ${colors.text} mb-1`}>{count}</p>
                  <p className={`text-xs ${colors.text} opacity-75`}>
                    {percentage}% {getPercentageLabel(item.key, item.label)}
                  </p>
                  {isClickable && (
                    <p className={`text-xs ${colors.text} opacity-60 mt-2 italic`}>
                      Click to view →{hasContextMenu && ' | Right-click for options'}
                    </p>
                  )}
                </ItemWrapper>
              );
            })}
          </div>
        </div>
      )}
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

