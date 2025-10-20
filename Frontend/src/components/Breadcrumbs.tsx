import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
      <ol className="flex items-center space-x-2">
        <li>
          <Home className="w-4 h-4 text-gray-500" />
        </li>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  {item.label}
                </span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};