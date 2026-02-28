import React, { useState } from 'react';
import { Contact } from '../types';
import { summarizeMeeting } from '../services/geminiService';
import { Save, ArrowLeft, Sparkles, Calendar, FileText } from 'lucide-react';

interface MeetingNotesProps {
  contact: Contact;
  onSave: (notes: string, summary: string[], nextDate: string) => void;
  onCancel: () => void;
}

const MeetingNotes: React.FC<MeetingNotesProps> = ({ contact, onSave, onCancel }) => {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState<string[]>([]);
  const [nextDate, setNextDate] = useState(contact.nextCatchUpDate || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!notes.trim()) return;
    setIsAnalyzing(true);
    
    const result = await summarizeMeeting(notes, `${contact.firstName} ${contact.lastName}`);
    setSummary(result.summary);
    
    // Calculate date from offset
    const date = new Date();
    date.setDate(date.getDate() + result.suggestedDateOffsetDays);
    setNextDate(date.toISOString().split('T')[0]);
    
    setHasAnalyzed(true);
    setIsAnalyzing(false);
  };

  const handleSave = () => {
    onSave(notes, summary.length > 0 ? summary : [notes], nextDate);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
            <button onClick={onCancel} className="text-slate-500 hover:bg-slate-200 p-2 rounded-full transition">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-xl font-semibold text-slate-800">Log Interaction</h2>
                <p className="text-xs text-slate-500">with {contact.firstName} {contact.lastName}</p>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Meeting Notes / Rough Thoughts</label>
            <textarea 
                className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700 leading-relaxed"
                placeholder="Type your raw notes here... e.g., 'Met for coffee, discussed the new project, mentioned he is moving to London in September. Wants to catch up again before he leaves.'"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
                <button 
                    onClick={handleAnalyze} 
                    disabled={!notes.trim() || isAnalyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50 text-sm font-medium"
                >
                    <Sparkles size={16} className={isAnalyzing ? "animate-spin" : ""} />
                    {isAnalyzing ? 'Analyzing...' : 'Summarize & Plan with AI'}
                </button>
            </div>
        </div>

        {hasAnalyzed && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <FileText size={16} /> AI Summary
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                        {summary.map((point, i) => (
                            <li key={i} className="text-slate-700">{point}</li>
                        ))}
                    </ul>
                </div>

                <div className="border-t border-slate-200 pt-6">
                     <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <Calendar size={16} /> Suggested Next Catch Up
                    </h3>
                    <div className="flex items-center gap-4">
                        <input 
                            type="date" 
                            value={nextDate} 
                            onChange={(e) => setNextDate(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <span className="text-sm text-slate-500 italic">
                            AI suggested this based on your notes.
                        </span>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all">
          <Save size={16} />
          Save Log
        </button>
      </div>
    </div>
  );
};

export default MeetingNotes;