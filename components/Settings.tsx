
import React, { useState } from 'react';
import { Settings as SettingsIcon, SortAsc, Layout, ShieldCheck, Plus, Trash2, Tag } from 'lucide-react';

export type SortOption = 'firstName' | 'lastName' | 'category' | 'recent';

interface SettingsProps {
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
  categories: string[];
  onAddCategory: (name: string) => void;
  onRemoveCategory: (name: string) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  currentSort, 
  onSortChange, 
  categories, 
  onAddCategory, 
  onRemoveCategory, 
  onClose 
}) => {
  const [newCat, setNewCat] = useState('');

  const handleAdd = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      onAddCategory(newCat.trim());
      setNewCat('');
    }
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <SettingsIcon size={20} className="text-indigo-600" /> Settings
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full space-y-10">
        {/* Sorting Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <SortAsc size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Organization & Sorting</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'lastName', label: 'Last Name (Default)', desc: 'Order contacts by family name' },
              { id: 'firstName', label: 'First Name', desc: 'Order contacts alphabetically' },
              { id: 'category', label: 'By Category', desc: 'Group contacts by their relationship' },
              { id: 'recent', label: 'Recent Interactions', desc: 'See who you talked to last' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => onSortChange(option.id as SortOption)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  currentSort === option.id 
                  ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <p className={`font-semibold text-sm ${currentSort === option.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {option.label}
                </p>
                <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Tag size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Manage Categories</h3>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="New Category..." 
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={handleAdd}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm">
                  {cat}
                  <button onClick={() => onRemoveCategory(cat)} className="text-slate-400 hover:text-red-500 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layout size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Visual Preferences</h3>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
             <div>
                <p className="text-sm font-semibold text-slate-700">Display Category Indicators</p>
                <p className="text-xs text-slate-500">Show color dots in the sidebar for quick identification.</p>
             </div>
             <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center justify-end px-1">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
             </div>
          </div>
        </section>

        <section className="pt-6 border-t border-slate-100">
           <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <ShieldCheck className="text-amber-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-800 uppercase tracking-tight">Data Privacy</p>
                <p className="text-sm text-amber-700 mt-1">
                   All your contact data is stored locally in this session. Nexus CRM does not upload your personal contact details to external servers, except when using AI tools for summarization and searching.
                </p>
              </div>
           </div>
        </section>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition shadow-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default Settings;
