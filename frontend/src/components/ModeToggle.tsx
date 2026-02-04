import React from 'react';
import { Edit3, Eye } from 'lucide-react';

interface ModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ isEditMode, onToggle }) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={onToggle}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          !isEditMode
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Eye className="w-4 h-4 mr-2" />
        View Mode
      </button>
      <button
        onClick={onToggle}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          isEditMode
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Edit3 className="w-4 h-4 mr-2" />
        Edit Mode
      </button>
    </div>
  );
};