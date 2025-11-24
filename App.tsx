import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  BookOpen, 
  Activity, 
  Type, 
  Feather, 
  Info, 
  AlertTriangle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Check, 
  List,
  Copy,
  History,
  Globe,
  Settings,
  User,
  Languages
} from 'lucide-react';
import { calculateReadability, ReadabilityMetrics, getGradeLabel } from './utils/readability';
import { simplifyText } from './services/geminiService';
import { MetricCard } from './components/MetricCard';
import { ReadabilityChart } from './components/ReadabilityChart';
import { ScoreReferenceModal } from './components/ScoreReference';
import { HistorySidebar, HistoryItem } from './components/HistorySidebar';

// Initial state for metrics
const initialMetrics: ReadabilityMetrics = {
  fleschKincaidGrade: 0,
  fleschReadingEase: 0,
  wordCount: 0,
  sentenceCount: 0,
  avgSentenceLength: 0,
  complexWordCount: 0,
};

const SAMPLE_TEXT = `Hypertension, also known as high blood pressure, is a long-term medical condition in which the blood pressure in the arteries is persistently elevated. High blood pressure usually does not cause symptoms. Long-term high blood pressure, however, is a major risk factor for coronary artery disease, stroke, heart failure, atrial fibrillation, peripheral arterial disease, vision loss, and chronic kidney disease.`;

const LANGUAGES = [
  "Spanish",
  "French",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Vietnamese",
  "Tagalog",
  "Arabic",
  "Portuguese (Brazil)",
  "Portuguese (Portugal)",
  "German",
  "Italian",
  "Japanese",
  "Korean",
  "Russian",
  "Hindi",
  "Bengali",
  "Turkish",
  "Polish",
  "Dutch",
  "Greek",
  "Hebrew",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Thai",
  "Indonesian"
];

export default function App() {
  const [inputText, setInputText] = useState<string>('');
  const [simplifiedText, setSimplifiedText] = useState<string>('');
  const [useBullets, setUseBullets] = useState<boolean>(true);
  
  // Translation State
  const [selectedTranslationLang, setSelectedTranslationLang] = useState<string>("Spanish");
  const [currentResultLang, setCurrentResultLang] = useState<string>("Original");
  
  // Text Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [inputMetrics, setInputMetrics] = useState<ReadabilityMetrics>(initialMetrics);
  const [outputMetrics, setOutputMetrics] = useState<ReadabilityMetrics>(initialMetrics);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Clipboard state
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Modal State
  const [activeModal, setActiveModal] = useState<'grade' | 'ease' | null>(null);

  // Update metrics whenever input text changes
  useEffect(() => {
    const metrics = calculateReadability(inputText);
    setInputMetrics(metrics);
  }, [inputText]);

  // Update output metrics whenever simplified text changes
  useEffect(() => {
    if (simplifiedText) {
      const metrics = calculateReadability(simplifiedText);
      setOutputMetrics(metrics);
    } else {
      setOutputMetrics(initialMetrics);
    }
  }, [simplifiedText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setError(null);
  };

  const addToHistory = (original: string, simplified: string, inMet: ReadabilityMetrics, outMet: ReadabilityMetrics, lang: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      original,
      simplified,
      timestamp: new Date(),
      inputMetrics: inMet,
      outputMetrics: outMet,
      language: lang
    };
    setHistory(prev => [newItem, ...prev]);
  };

 const processText = async (instruction: string, lang: string = 'Original', sourceText?: string) => {
    // Use provided sourceText or default to inputText
    const textToProcess = sourceText || inputText;
    
    if (!textToProcess.trim()) {
      setError("Please enter some text first.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setIsCopied(false);

    try {
      const result = await simplifyText(textToProcess, instruction, useBullets, lang);
      setSimplifiedText(result);
      setCurrentResultLang(lang);

      // We need to calculate metrics for the new result immediately to save to history correctly
      const resultMetrics = calculateReadability(result);
      addToHistory(textToProcess, result, calculateReadability(textToProcess), resultMetrics, lang);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitialSimplify = () => {
    // Default to 'Original' language which means "Same as Input"
    processText("Simplify this text to a Grade 6 reading level. Use simple vocabulary and short sentences.", 'Original');
  };

  const handleTranslate = () => {
    // Re-run simplification but with translation instruction
    processText("Simplify this text to a Grade 6 reading level. Use simple vocabulary and short sentences.", selectedTranslationLang);
  };

  const handleMakeSimpler = () => {
    // Process the CURRENT simplified text, not the original input
    processText(
      "Simplify this text further to a Grade 4 reading level. Use very basic vocabulary and very short sentences. Explain complex terms simply.", 
      currentResultLang,
      simplifiedText  // Pass the current simplified text as source
    );
  };

  const handleMakeComplex = () => {
    // Process the CURRENT simplified text, not the original input
    processText(
      "Rewrite this text to a Grade 9-10 level. Maintain professional medical terminology but ensure it is clearly explained. Provide more detail.", 
      currentResultLang,
      simplifiedText  // Pass the current simplified text as source
    );
  };

  const handleCopy = async () => {
    if (!simplifiedText) return;
    try {
      await navigator.clipboard.writeText(simplifiedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSample = () => {
    setInputText(SAMPLE_TEXT);
    setError(null);
  };

  const restoreHistoryItem = (item: HistoryItem) => {
    setInputText(item.original);
    setSimplifiedText(item.simplified);
    setCurrentResultLang(item.language);
    // Metrics will update automatically via useEffect
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <ScoreReferenceModal type={activeModal} onClose={() => setActiveModal(null)} />
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onSelect={restoreHistoryItem}
        onClear={() => setHistory([])}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-teal-600 to-teal-500 p-2 rounded-lg shadow-md">
              <Feather className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">HealthInfoSimplifier</h1>
              <p className="text-xs text-teal-600 font-semibold tracking-wide uppercase mt-0.5">Patient Education Aid</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <span className="hidden sm:inline-block text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-100">Beta</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro / Instructions - White Box */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 opacity-50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl font-bold mb-3 tracking-tight text-slate-900">Make health info accessible to everyone.</h2>
            {/* Consistent font styling applied here */}
            <p className="text-slate-600 mb-6 text-lg leading-relaxed">
              Transform complex medical terminology into clear, culturally appropriate, and easy-to-understand language for health literacy.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <Activity className="w-4 h-4 mr-2 text-teal-600" />
                <span className="text-sm font-medium text-slate-700">Readability Analysis</span>
              </div>
              <div className="flex items-center bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <Sparkles className="w-4 h-4 mr-2 text-teal-600" />
                <span className="text-sm font-medium text-slate-700">AI Simplification</span>
              </div>
              <div className="flex items-center bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <Globe className="w-4 h-4 mr-2 text-teal-600" />
                <span className="text-sm font-medium text-slate-700">Multi-language Translation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* LEFT COLUMN: Input & Controls */}
          <div className="space-y-6">
            
            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-md font-bold flex items-center text-slate-800">
                  <FileText className="w-4 h-4 mr-2 text-teal-600" />
                  Source Text
                </h3>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={loadSample}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Load Sample
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start">
                   <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                   <p className="text-xs text-amber-800 leading-snug">
                     <strong>Note:</strong> Currently supports English inputs only as the Flesch readability scoring formulas were designed specifically for the English language and are not accurate for other languages.
                   </p>
                </div>
                
                <div className="relative group">
                  <textarea
                    className="w-full h-80 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none text-slate-800 leading-relaxed text-base transition-all placeholder:text-slate-400"
                    placeholder="Paste your patient education text here..."
                    value={inputText}
                    onChange={handleTextChange}
                  />
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md text-xs font-medium bg-white/80 text-slate-500 border border-slate-200 backdrop-blur-sm">
                    {inputText.length} characters
                  </div>
                </div>

                {/* Input Metrics Mini-Dashboard */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between hover:border-teal-200 transition-colors cursor-help" onClick={() => setActiveModal('grade')}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grade Level</span>
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                      {inputMetrics.fleschKincaidGrade > 0 ? inputMetrics.fleschKincaidGrade : '-'}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between hover:border-teal-200 transition-colors cursor-help" onClick={() => setActiveModal('ease')}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reading Ease</span>
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                      {inputMetrics.fleschReadingEase > 0 ? inputMetrics.fleschReadingEase : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                <Settings className="w-4 h-4" />
                <span>Configuration</span>
              </div>
              
              <div className="flex flex-col space-y-4">
                {/* Format Toggle */}
                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors bg-white">
                  <div className="flex items-center text-sm font-medium text-slate-700">
                    <List className="w-4 h-4 mr-2 text-slate-500" />
                    Use Bullet Points
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={useBullets} 
                      onChange={() => setUseBullets(!useBullets)}
                    />
                    <div className={`block w-9 h-5 rounded-full transition-colors ${useBullets ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform transform ${useBullets ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleInitialSimplify}
                  disabled={isProcessing || !inputText.trim()}
                  className={`w-full group relative flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-lg shadow-teal-500/20
                    ${isProcessing || !inputText.trim() 
                      ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                      : 'bg-teal-600 hover:bg-teal-700 hover:-translate-y-0.5'
                    }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Simplifying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Simplify Text
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center border border-red-100 animate-fade-in">
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Output & Analytics */}
          <div className="space-y-6">
             <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${!simplifiedText ? 'min-h-[500px]' : ''}`}>
               <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-md font-bold flex items-center text-slate-800">
                    <BookOpen className="w-4 h-4 mr-2 text-teal-600" />
                    Simplified Result
                  </h3>
                  
                  {/* Result Header Controls */}
                  <div className="flex items-center space-x-2">
                    {/* History Button Moved Here */}
                    <button 
                      onClick={() => setIsHistoryOpen(true)}
                      className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-200 rounded-lg transition-colors relative"
                      title="View History"
                    >
                      <History className="w-4 h-4" />
                      {history.length > 0 && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-teal-500 rounded-full border border-white"></span>
                      )}
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-1"></div>

                    {simplifiedText && currentResultLang !== 'Original' && currentResultLang !== 'English' && (
                       <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                         {currentResultLang}
                       </span>
                    )}
                    {simplifiedText && (
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                         {getGradeLabel(outputMetrics.fleschKincaidGrade)}
                       </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 relative flex flex-col">
                  {simplifiedText ? (
                    <>
                      <textarea
                        readOnly
                        className="w-full h-96 p-6 resize-none text-slate-900 leading-relaxed text-base focus:outline-none bg-white font-medium"
                        value={simplifiedText}
                      />
                      
                      {/* Translation Bar */}
                      <div className="bg-white border-t border-slate-100 p-3 flex items-center space-x-3">
                         <div className="flex-1 flex items-center space-x-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                            <div className="pl-2 pr-1 text-slate-400">
                              <Languages className="w-4 h-4" />
                            </div>
                            <select
                              value={selectedTranslationLang}
                              onChange={(e) => setSelectedTranslationLang(e.target.value)}
                              className="bg-transparent border-none text-sm text-slate-700 font-medium focus:ring-0 w-full cursor-pointer py-1"
                            >
                              {LANGUAGES.map(lang => (
                                <option key={lang} value={lang}>Translate to {lang}</option>
                              ))}
                            </select>
                            <button
                              onClick={handleTranslate}
                              disabled={isProcessing}
                              className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-teal-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800 transition-colors shadow-sm"
                            >
                              Go
                            </button>
                         </div>
                      </div>

                      <div className="bg-slate-50 border-t border-slate-100 p-3 flex flex-wrap gap-2 justify-between items-center">
                        <button
                          onClick={handleCopy}
                          className="flex items-center px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-sm"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-2 text-green-600" />
                              <span className="text-green-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-2 text-slate-500" />
                              Copy Text
                            </>
                          )}
                        </button>
                        <div className="flex gap-2">
                           <button 
                             onClick={handleMakeSimpler}
                             disabled={isProcessing}
                             className="flex items-center px-3 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                             title="Reduce complexity further"
                           >
                             <ArrowDownCircle className="w-3.5 h-3.5 mr-1.5" />
                             Simpler
                           </button>
                           <button 
                             onClick={handleMakeComplex}
                             disabled={isProcessing}
                             className="flex items-center px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                             title="Add more detail and complexity"
                           >
                             <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" />
                             Detailed
                           </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white h-full">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                         <Sparkles className="w-8 h-8 text-slate-300" />
                       </div>
                       <p className="font-bold text-slate-900 text-lg">Ready to simplify</p>
                       <p className="text-sm mt-2 text-slate-500 max-w-xs mx-auto">Upload a document or paste text to generate a simplified patient-friendly version.</p>
                    </div>
                  )}
                </div>
            </div>

             {/* Output Metrics Dashboard */}
             {simplifiedText && (
               <div className="animate-fade-in space-y-6">
                 {currentResultLang !== 'Original' && currentResultLang !== 'English' && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800 flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      Readability metrics (Flesch-Kincaid) are designed for English. Scores for translated text may not be accurate.
                    </div>
                 )}
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard 
                      label="Grade Level"
                      value={outputMetrics.fleschKincaidGrade}
                      subValue={`was ${inputMetrics.fleschKincaidGrade}`}
                      icon={Type}
                      colorClass={inputMetrics.fleschKincaidGrade > outputMetrics.fleschKincaidGrade ? "bg-green-500" : "bg-yellow-500"}
                      description="Approx. school grade required."
                      onInfoClick={() => setActiveModal('grade')}
                    />
                    <MetricCard 
                      label="Reading Ease"
                      value={outputMetrics.fleschReadingEase}
                      subValue={`was ${inputMetrics.fleschReadingEase}`}
                      icon={Activity}
                      colorClass={outputMetrics.fleschReadingEase > inputMetrics.fleschReadingEase ? "bg-green-500" : "bg-yellow-500"}
                      description="Higher is easier to read."
                      onInfoClick={() => setActiveModal('ease')}
                    />
                 </div>

                 {/* Charts */}
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center">
                     <Activity className="w-4 h-4 mr-2" />
                     Improvement Visualizer
                   </h4>
                   <ReadabilityChart originalMetrics={inputMetrics} simplifiedMetrics={outputMetrics} />
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Disclaimer & Footer */}
        <div className="border-t border-slate-200 pt-8 mt-12 pb-8">
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 flex items-start shadow-sm mb-8">
             <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
             <div className="text-sm text-orange-800 leading-relaxed">
               <span className="font-bold block mb-1 text-orange-900">Medical Disclaimer</span>
               This tool uses artificial intelligence to simplify and translate health information. While we strive for accuracy, AI models can occasionally produce errors or miss critical medical nuances. 
               All generated content <strong>must be reviewed and verified by a qualified healthcare professional</strong> before being used for patient care. 
               This tool is an aid, not a replacement for professional medical advice.
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-xs">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
               <span className="flex items-center">
                 <User className="w-3 h-3 mr-1" />
                 Created by Coco Jiang
               </span>
               <span>&bull;</span>
               <span>&copy; {new Date().getFullYear()} HealthInfoSimplifier</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}