// src/components/DemoBanner.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Info, LogIn } from 'lucide-react';

interface DemoBannerProps {
  className?: string;
}

const DemoBanner: React.FC<DemoBannerProps> = ({ className = '' }) => {
  return (
    <div className={`bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-blue-700">
            <strong>You are viewing test/demo data.</strong> Log in to see the real system and live data.
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <Link
            to="/login"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;

