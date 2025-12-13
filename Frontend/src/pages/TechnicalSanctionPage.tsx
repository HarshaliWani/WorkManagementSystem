import React from 'react';
import { ArrowLeft } from 'lucide-react';
import TechnicalSanctions from '../components/TechnicalSanctions';

interface TechnicalSanctionPageProps {
  onBack: () => void;
  isEditMode?: boolean;
}

export const TechnicalSanctionPage: React.FC<TechnicalSanctionPageProps> = ({
  onBack,
  isEditMode,
}) => {
  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Technical Sanctions</h1>
      <p className="text-gray-600 mb-6">
        Manage technical sanctions for all government works with detailed TS management capabilities.
      </p>
      
      <TechnicalSanctions  />
    </div>
  );
};
