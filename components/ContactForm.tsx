
import React, { useState, useEffect } from 'react';
import { Contact, PersonalAttribute } from '../types';
import { Save, X, Plus, Trash2, Instagram, Twitter, Linkedin, RefreshCw, AlertCircle, Sparkles, Building2, Briefcase, Calendar, Tag, UserPlus } from 'lucide-react';

interface ContactFormProps {
  categories: string[];
  initialData?: Contact | null;
  onSave: (contact: Contact) => void;
  onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ categories, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Contact>({
    id: crypto.randomUUID(),
    firstName: '',
    lastName: '',
    avatarUrl: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
    
    // Basic
    personalPhone: '',
    birthday: '',
    instagram: '',
    twitter: '',
    
    // Relationship
    firstMet: '',
    occasion: '',
    
    // Professional
    title: '',
    company: '',
    workEmail: '',
    workPhone: '',
    linkedin: '',
    
    // Attributes - Start with one empty attribute if creating new
    attributes: [{ id: crypto.randomUUID(), label: '', value: '' }],
    
    // Classification
    category: categories[0] || 'Others',
    tags: [],
    
    // Sync
    syncPlatform: 'LinkedIn',
    generateAIResponses: true,
    
    // Management
    catchUpFrequency: 'Monthly',
    nextCatchUpDate: '',
    notes: '',
    interactions: []
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Ensure at least one attribute field is shown even if empty
        attributes: initialData.attributes.length > 0 
          ? initialData.attributes 
          : [{ id: crypto.randomUUID(), label: '', value: '' }]
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (id: string, field: 'label' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map(attr => attr.id === id ? { ...attr, [field]: value } : attr)
    }));
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { id: crypto.randomUUID(), label: '', value: '' }]
    }));
  };

  const removeAttribute = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter(attr => attr.id !== id)
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: string[] = [];
    
    // Validation: Ensure selected platform has a link
    if (formData.syncPlatform === 'LinkedIn' && !formData.linkedin?.trim()) {
      newErrors.push("Please provide a LinkedIn URL to enable LinkedIn Daily Sync.");
    }
    if (formData.syncPlatform === 'Instagram' && !formData.instagram?.trim()) {
      newErrors.push("Please provide an Instagram handle to enable Instagram Daily Sync.");
    }
    if (formData.syncPlatform === 'Twitter' && !formData.twitter?.trim()) {
      newErrors.push("Please provide a Twitter handle to enable Twitter Daily Sync.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Filter out completely empty custom attributes before saving
    const cleanedData = {
      ...formData,
      attributes: formData.attributes.filter(a => a.label.trim() || a.value.trim())
    };

    onSave(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-800">
          {initialData ? 'Edit Contact' : 'New Contact'}
        </h2>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-red-700 font-medium">
              <p className="font-bold mb-1 text-xs uppercase tracking-wider">Validation Error</p>
              <ul className="list-disc pl-4 space-y-1">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
            <button type="button" onClick={() => setErrors([])} className="ml-auto text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Section 1: Basic Info & Category */}
        <section>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Basic Information</h3>
             <div className="w-1/3">
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-medium">
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">First Name <span className="text-red-500">*</span></label>
              <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Personal Phone</label>
              <input type="tel" name="personalPhone" value={formData.personalPhone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Birthday</label>
              <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
        </section>

        {/* Section 2: Relationship Context */}
        <section className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Relationship Context</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">First Met</label>
              <input type="date" name="firstMet" value={formData.firstMet} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
             <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Occasion / Context</label>
              <input type="text" name="occasion" placeholder="e.g. Design Conference 2023" value={formData.occasion} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            {/* Tags moved here */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Tag size={12} /> Tags (Interests, Skills, Keywords - press Enter)
              </label>
              <div className="flex flex-col gap-2">
                <input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="e.g. Golf, AI, Design, Coffee"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900 transition-colors">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Professional & Social Info */}
        <section className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Professional & Social</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Building2 size={12} /> Company
              </label>
              <input name="company" placeholder="Organization name" value={formData.company || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Briefcase size={12} /> Title
              </label>
              <input name="title" placeholder="Job title" value={formData.title || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Linkedin size={12} /> LinkedIn URL
              </label>
              <input name="linkedin" placeholder="linkedin.com/in/..." value={formData.linkedin || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Instagram size={12} /> Instagram Handle
              </label>
              <input name="instagram" placeholder="@username" value={formData.instagram || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
             <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Twitter size={12} /> Twitter Handle
              </label>
              <input name="twitter" placeholder="@username" value={formData.twitter || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
        </section>

        {/* Section 4: AI Daily Sync Preferences */}
        <section className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <RefreshCw size={14} /> AI Daily Sync Preferences
          </h3>
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">Preferred Monitoring Platform</label>
              <div className="flex flex-wrap gap-2">
                {['LinkedIn', 'Instagram', 'Twitter', 'N/A'].map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => {
                        setFormData(prev => ({ ...prev, syncPlatform: platform as any }));
                        setErrors([]); 
                    }}
                    className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                      formData.syncPlatform === platform 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {platform === 'LinkedIn' && <Linkedin size={14} />}
                    {platform === 'Instagram' && <Instagram size={14} />}
                    {platform === 'Twitter' && <Twitter size={14} />}
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {formData.syncPlatform !== 'N/A' && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-500" />
                        <div>
                            <p className="text-sm font-bold text-slate-700">AI Suggested Responses</p>
                            <p className="text-xs text-slate-500">Automatically generate draft replies for found updates.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={formData.generateAIResponses}
                            onChange={(e) => setFormData(prev => ({ ...prev, generateAIResponses: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
              </div>
            )}
            
            <p className="text-[11px] text-slate-500 italic bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
              {formData.syncPlatform === 'N/A' 
                ? "Daily monitoring is disabled for this contact." 
                : `AI will scan ${formData.syncPlatform} daily for milestones and ${formData.generateAIResponses ? 'draft suggested replies.' : 'provide follow-up suggestions.'}`}
            </p>
          </div>
        </section>

        {/* Section 5: Other Personal Info */}
        <section className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Other Personal Info</h3>
            <button type="button" onClick={addAttribute} className="text-xs flex items-center gap-1 text-indigo-600 font-bold">
              <Plus size={14} /> Add Field
            </button>
          </div>
          <div className="space-y-3">
            {formData.attributes.map((attr) => (
              <div key={attr.id} className="flex gap-2">
                <input 
                  placeholder="e.g. Spouse" 
                  value={attr.label}
                  onChange={(e) => handleAttributeChange(attr.id, 'label', e.target.value)}
                  className="w-1/3 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 placeholder-slate-300"
                />
                <input 
                  placeholder="e.g. Jennifer" 
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(attr.id, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-300"
                />
                <button type="button" onClick={() => removeAttribute(attr.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Management */}
        <section className="pt-4 border-t border-slate-100">
           <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Management</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Next Catch Up
                </label>
                <input type="date" name="nextCatchUpDate" value={formData.nextCatchUpDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                   <RefreshCw size={12} /> Frequency
                </label>
                <select 
                    name="catchUpFrequency" 
                    value={formData.catchUpFrequency || 'Monthly'} 
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Bi-Annually">Bi-Annually</option>
                    <option value="Yearly">Yearly</option>
                </select>
              </div>
           </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">General Notes</label>
            <textarea rows={3} name="notes" value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Add some background context..." />
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-md hover:bg-indigo-700 shadow-sm flex items-center gap-2">
          <Save size={16} />
          Save Contact
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
