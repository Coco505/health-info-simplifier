import React from 'react';
import { LucideIcon, Info } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
  description?: string;
  onInfoClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  subValue, 
  icon: Icon, 
  colorClass,
  description,
  onInfoClick
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start space-x-4 hover:shadow-md transition-shadow relative group">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-black">{label}</h3>
          {onInfoClick && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick();
              }}
              className="text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
              title="Learn more about this score"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-black">{value}</span>
          {subValue && <span className="text-xs text-gray-600 font-medium">{subValue}</span>}
        </div>
        {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
      </div>
    </div>
  );
};