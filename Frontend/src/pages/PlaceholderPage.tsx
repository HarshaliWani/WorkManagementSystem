import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  onBack: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  onBack
}) => {
  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <Construction className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          {description}
        </p>
        <div className="mt-8 bg-blue-50 rounded-lg p-4 max-w-sm mx-auto">
          <p className="text-sm text-blue-800">
            This section will be implemented in the next stage of development.
          </p>
        </div>
      </div>
    </div>
  );
};