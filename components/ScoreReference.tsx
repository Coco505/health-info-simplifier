import React from 'react';
import { X, BookOpen, Activity, ExternalLink } from 'lucide-react';

interface ScoreModalProps {
  type: 'grade' | 'ease' | null;
  onClose: () => void;
}

export const ScoreReferenceModal: React.FC<ScoreModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {type === 'grade' ? <BookOpen className="w-5 h-5 text-teal-700" /> : <Activity className="w-5 h-5 text-teal-700" />}
            <h3 className="font-bold text-teal-900">
              {type === 'grade' ? 'Flesch-Kincaid Grade Level' : 'Flesch Reading Ease'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {type === 'grade' ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                This score corresponds to the U.S. school grade level required to understand the text. Lower is generally better for mass communication.
                <br /><br />
                <strong>Target: Grade 6 or lower</strong> for general public health information.
              </p>
              <div className="space-y-2 text-sm border border-gray-100 rounded-lg overflow-hidden mb-4">
                <div className="flex justify-between p-3 bg-teal-50 border-b border-gray-100">
                  <span className="text-black font-medium">Grade 5 or lower</span>
                  <span className="text-teal-700 font-bold">Very Easy</span>
                </div>
                <div className="flex justify-between p-3 bg-blue-50 border-b border-gray-100">
                  <span className="text-black font-medium">Grade 6 - 8</span>
                  <span className="text-blue-700 font-bold">Standard</span>
                </div>
                <div className="flex justify-between p-3 bg-yellow-50 border-b border-gray-100">
                  <span className="text-black font-medium">Grade 9 - 12</span>
                  <span className="text-yellow-700 font-bold">Complex</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50">
                  <span className="text-black font-medium">College Level</span>
                  <span className="text-red-700 font-bold">Very Complex</span>
                </div>
              </div>
              <a 
                href="https://psycnet.apa.org/doiLanding?doi=10.1037%2Fh0057532" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Learn more... <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                A 0-100 scale where higher numbers indicate easier reading.
                <br /><br />
                <strong>Target: 60 or higher</strong> for standard readability.
              </p>
              <div className="space-y-2 text-sm border border-gray-100 rounded-lg overflow-hidden mb-4">
                <div className="flex justify-between p-3 bg-teal-50 border-b border-gray-100">
                  <span className="text-black font-medium">90 - 100</span>
                  <span className="text-teal-700 font-bold">Very Easy</span>
                </div>
                <div className="flex justify-between p-3 bg-blue-50 border-b border-gray-100">
                  <span className="text-black font-medium">60 - 90</span>
                  <span className="text-blue-700 font-bold">Standard</span>
                </div>
                <div className="flex justify-between p-3 bg-yellow-50 border-b border-gray-100">
                  <span className="text-black font-medium">30 - 60</span>
                  <span className="text-yellow-700 font-bold">Difficult</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50">
                  <span className="text-black font-medium">0 - 30</span>
                  <span className="text-red-700 font-bold">Very Confusing</span>
                </div>
              </div>
              <a 
                href="https://psycnet.apa.org/doiLanding?doi=10.1037%2Fh0062427" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                 Learn more... <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-3 text-right">
          <button 
            onClick={onClose}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};