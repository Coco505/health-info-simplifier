import React from 'react';
import { X, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { ReadabilityMetrics, getGradeLabel } from '../utils/readability';

export interface HistoryItem {
  id: string;
  original: string;
  simplified: string;
  timestamp: Date;
  inputMetrics: ReadabilityMetrics;
  outputMetrics: ReadabilityMetrics;
  language: string;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect,
  onClear 
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-teal-50/50">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-700" />
              <h2 className="text-lg font-bold text-gray-900">History</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Clock className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No history yet</p>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                       {item.language}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-2 mb-2 font-medium">
                    {item.original}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      Grade {item.outputMetrics.fleschKincaidGrade}
                      <ChevronRight className="w-3 h-3 mx-1" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {history.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={onClear}
                className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};