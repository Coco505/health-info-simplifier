import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct mailto link
    // Addressing the email to Coco Jiang as requested
    const emailTo = "cocojiang@example.com"; 
    const subject = `Feedback from HealthInfoSimplifier: ${name}`;
    const body = `Hi Coco Jiang,\n\nName: ${name}\n\nFeedback:\n${message}`;
    
    window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Close and reset
    onClose();
    setName('');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all" 
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-teal-900">Send Feedback</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              placeholder="Your Name"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea
              id="message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
              placeholder="Share your thoughts, suggestions, or report issues..."
            />
          </div>

          <p className="text-xs text-slate-500 italic">
            Note: This will open your default email client to send the message to Coco Jiang.
          </p>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg mr-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};