
import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { Edit2, Trash2, Mail, Phone, Briefcase, Calendar, Gift, Sparkles, MessageSquare, Copy, Check, MapPin, Tag, Linkedin, Instagram, Twitter, ExternalLink, Clock, PlusCircle, FileText, User, Building2, History, Lightbulb, Loader2 } from 'lucide-react';
import { generateDraftEmail, generateIceBreakers, generateDiscussionTopics, getContactUpdate } from '../services/geminiService';

interface ContactDetailProps {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updatedContact: Contact) => void;
  onLogInteraction: () => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contact, onEdit, onDelete, onUpdate, onLogInteraction }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [discussionTopics, setDiscussionTopics] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<{ type: 'email' | 'icebreaker'; content: any } | null>(null);
  const [copied, setCopied] = useState(false);

  // We only show suggestions if there's an upcoming catch-up or it's overdue
  const hasUpcomingCatchUp = contact.nextCatchUpDate && new Date(contact.nextCatchUpDate) >= new Date(new Date().setHours(0,0,0,0));
  const isOverdue = contact.nextCatchUpDate && new Date(contact.nextCatchUpDate) < new Date();
  const shouldShowTopics = hasUpcomingCatchUp || isOverdue;

  const lastInteraction = contact.interactions && contact.interactions.length > 0 ? contact.interactions[0] : null;

  useEffect(() => {
    if (shouldShowTopics) {
      fetchTopics();
    } else {
      setDiscussionTopics([]);
    }
  }, [contact.id, shouldShowTopics]);

  const fetchTopics = async () => {
    setTopicsLoading(true);
    let socialSummary = "";
    
    // Attempt to pull latest social updates for grounding
    if (contact.syncPlatform !== 'N/A') {
      try {
        const socialResult = await getContactUpdate(contact);
        if (socialResult.hasUpdate) {
          socialSummary = socialResult.summary;
        }
      } catch (e) {
        console.error("Failed to fetch social update for topics", e);
      }
    }

    const result = await generateDiscussionTopics(contact, socialSummary);
    setDiscussionTopics(result);
    setTopicsLoading(false);
  };

  const handleGenerateIceBreakers = async () => {
    setAiLoading(true);
    setGeneratedContent(null);
    const result = await generateIceBreakers(contact);
    setGeneratedContent({ type: 'icebreaker', content: result });
    setAiLoading(false);
  };

  const handleGenerateEmail = async () => {
    setAiLoading(true);
    setGeneratedContent(null);
    const intent = prompt("What is the goal of this email?", "Catch up and discuss new opportunities");
    if (!intent) {
      setAiLoading(false);
      return;
    }
    const result = await generateDraftEmail(contact, intent);
    setGeneratedContent({ type: 'email', content: result });
    setAiLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateFrequency = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ ...contact, catchUpFrequency: e.target.value });
  };

  const updateNextDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...contact, nextCatchUpDate: e.target.value });
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
        case 'VIP': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'Professional': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Client': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'Family & Friends': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const renderSocialLink = (url: string | undefined, icon: React.ReactNode) => {
    if (!url) return null;
    const href = url.startsWith('http') ? url : `https://${url.startsWith('@') ? `twitter.com/${url.substring(1)}` : url}`;
    const displayUrl = url.replace(/^https?:\/\/(www\.)?/, '');
    
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition group w-full">
            <span className="text-slate-400 group-hover:text-indigo-500 transition">{icon}</span>
            <span className="truncate text-sm underline decoration-slate-200 hover:decoration-indigo-500">{displayUrl}</span>
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
        </a>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50/50">
        <div className="flex items-center gap-6">
             <img 
                src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.firstName}+${contact.lastName}`} 
                alt={contact.firstName} 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-slate-200"
            />
            <div className="flex-1">
                 <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold text-slate-900">{contact.firstName} {contact.lastName}</h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getCategoryColor(contact.category)}`}>
                        {contact.category}
                    </span>
                 </div>
                 <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-3">
                    {(contact.title || contact.company) && (
                        <span className="flex items-center gap-1.5 font-medium text-slate-600"><Briefcase size={14}/> {contact.title} {contact.company && `at ${contact.company}`}</span>
                    )}
                 </div>
                 <div className="flex flex-wrap gap-1.5">
                    {contact.tags.slice(0, 5).map((tag, i) => (
                        <span key={i} className="bg-white text-indigo-600 text-[10px] px-2 py-0.5 rounded border border-indigo-100 font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Tag size={10} /> {tag}
                        </span>
                    ))}
                    {contact.tags.length > 5 && (
                        <span className="text-[10px] text-slate-400 font-medium self-center ml-1">+{contact.tags.length - 5} more</span>
                    )}
                 </div>
            </div>
        </div>
        <div className="flex gap-2 self-start md:self-center">
             <button onClick={onEdit} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition shadow-sm">
                <Edit2 size={18} />
            </button>
            <button onClick={onDelete} className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg hover:bg-red-50 transition shadow-sm">
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        
        {/* Management Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-6 w-full md:w-auto">
                 <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1"><History size={12}/> Last Catch Up</label>
                    <div className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-md px-2 py-1 min-w-[100px]">
                        {lastInteraction ? lastInteraction.date : 'Never'}
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1"><Clock size={12}/> Frequency</label>
                    <select 
                        value={contact.catchUpFrequency || 'Monthly'} 
                        onChange={updateFrequency}
                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Bi-Annually">Bi-Annually</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                 </div>
                 <div>
                     <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1"><Calendar size={12}/> Next Catch Up</label>
                     <input 
                        type="date" 
                        value={contact.nextCatchUpDate || ''}
                        onChange={updateNextDate}
                        className={`bg-white border text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none ${isOverdue ? 'border-red-300 text-red-600' : 'border-slate-300 text-slate-700'}`}
                     />
                 </div>
             </div>
             
             <button 
                onClick={onLogInteraction}
                className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition"
             >
                 <PlusCircle size={18} /> Log Meeting Notes
             </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Details */}
            <div className="space-y-8">
                
                {/* 0. Suggested Discussion Topics (AI) - PLACED AS REQUESTED */}
                {shouldShowTopics && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
                            <Lightbulb size={16} className="text-amber-500" /> Suggested Topics for Catch Up
                        </h3>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 rounded text-[9px] font-bold text-amber-800 uppercase">
                            <Sparkles size={10} /> AI Enhanced
                        </div>
                    </div>
                    {topicsLoading ? (
                      <div className="flex items-center gap-3 py-2 text-sm text-amber-600">
                        <Loader2 size={16} className="animate-spin" /> 
                        <span>Synthesizing interaction history and LinkedIn updates...</span>
                      </div>
                    ) : discussionTopics.length > 0 ? (
                      <div className="space-y-3">
                          <p className="text-[11px] text-amber-800/70 italic mb-2">Based on previous meeting notes and latest social insights:</p>
                          <ul className="space-y-2.5">
                            {discussionTopics.map((topic, i) => (
                              <li key={i} className="text-sm text-slate-800 flex items-start gap-2.5 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
                                <span className="leading-relaxed">{topic}</span>
                              </li>
                            ))}
                          </ul>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific follow-up topics identified. Start logging meeting notes to enable AI insights.</p>
                    )}
                  </div>
                )}

                {/* 1. Basic Information */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <User size={14} /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                        {contact.personalPhone && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-1">Personal Phone</p>
                                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                    <Phone size={14} className="text-slate-400" />
                                    {contact.personalPhone}
                                </div>
                            </div>
                        )}
                        {contact.birthday && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-1">Birthday</p>
                                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                    <Gift size={14} className="text-slate-400" />
                                    {contact.birthday}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Professional & Social Information */}
                <div>
                     <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <Briefcase size={14} /> Professional & Social
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                        {contact.company && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-1">Company</p>
                                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                    <Building2 size={14} className="text-slate-400" />
                                    {contact.company}
                                </div>
                            </div>
                        )}
                        {contact.title && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-1">Role / Title</p>
                                <div className="text-slate-700 font-medium text-sm">
                                    {contact.title}
                                </div>
                            </div>
                        )}
                        
                        {contact.workEmail && (
                            <div className="sm:col-span-2">
                                <p className="text-xs text-slate-400 font-semibold mb-1">Work Email</p>
                                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm truncate">
                                    <Mail size={14} className="text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{contact.workEmail}</span>
                                </div>
                            </div>
                        )}
                        
                         {contact.linkedin && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-1">LinkedIn</p>
                                {renderSocialLink(contact.linkedin, <Linkedin size={14} />)}
                            </div>
                        )}

                        {contact.instagram && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-1">Instagram</p>
                                {renderSocialLink(contact.instagram, <Instagram size={14} />)}
                            </div>
                        )}

                        {contact.twitter && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-1">Twitter</p>
                                {renderSocialLink(contact.twitter, <Twitter size={14} />)}
                            </div>
                        )}

                        {contact.workPhone && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-1">Work Phone</p>
                                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                    <Phone size={14} className="text-slate-400" />
                                    {contact.workPhone}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Relationship History */}
                <div>
                     <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <MapPin size={14} /> Relationship Context
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                        {contact.firstMet && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold mb-1">First Met</p>
                                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                    <Calendar size={14} className="text-slate-400" />
                                    {contact.firstMet}
                                </div>
                            </div>
                        )}
                        {contact.occasion && (
                             <div>
                                <p className="text-xs text-slate-400 font-semibold mb-1">Context / Occasion</p>
                                <div className="text-slate-700 font-medium text-sm italic line-clamp-2">
                                    "{contact.occasion}"
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                 {/* 4. Personal Attributes */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <Tag size={14} /> Other Personal Details
                    </h3>
                    {contact.attributes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {contact.attributes.map(attr => (
                                <div key={attr.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{attr.label}</p>
                                    <p className="text-slate-800 font-medium text-sm truncate">{attr.value}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm italic">No custom attributes.</p>
                    )}
                </div>

            </div>

            {/* Right Column: Interactions & AI */}
            <div className="space-y-6">
                
                {/* Recent Interaction Log */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <FileText size={16} /> Recent Notes
                        </h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {contact.interactions && contact.interactions.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {contact.interactions.map((interaction) => (
                                    <div key={interaction.id} className="p-4 hover:bg-slate-50 transition">
                                        <p className="text-xs font-bold text-slate-400 mb-2">{interaction.date}</p>
                                        {interaction.aiSummary ? (
                                            <ul className="list-disc pl-4 space-y-1">
                                                {interaction.aiSummary.map((point, i) => (
                                                    <li key={i} className="text-sm text-slate-700">{point}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-slate-700 line-clamp-3">{interaction.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-slate-400 text-sm italic">
                                No meetings logged yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Assistant */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-indigo-800">
                        <Sparkles size={18} />
                        <h3 className="font-semibold">AI Assistant</h3>
                    </div>
                    
                    <div className="space-y-2">
                        <button 
                            onClick={handleGenerateIceBreakers}
                            disabled={aiLoading}
                            className="w-full text-left px-3 py-2 bg-white hover:bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            <MessageSquare size={14} />
                            Generate Ice Breakers
                        </button>
                         <button 
                            onClick={handleGenerateEmail}
                            disabled={aiLoading}
                            className="w-full text-left px-3 py-2 bg-white hover:bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            <Mail size={14} />
                            Draft Follow-up Email
                        </button>
                    </div>

                    {aiLoading && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-indigo-600 animate-pulse">
                            <Sparkles size={14} className="animate-spin" /> Thinking...
                        </div>
                    )}

                    {generatedContent && !aiLoading && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-100 shadow-inner">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                    {generatedContent.type === 'email' ? 'Draft Email' : 'Ice Breakers'}
                                </span>
                                <button onClick={() => copyToClipboard(
                                    generatedContent.type === 'email' 
                                    ? `Subject: ${generatedContent.content.subject}\n\n${generatedContent.content.body}`
                                    : generatedContent.content.join('\n')
                                )} className="text-slate-400 hover:text-indigo-600 transition">
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            
                            <div className="text-sm text-slate-700 space-y-2 max-h-48 overflow-y-auto">
                                {generatedContent.type === 'email' ? (
                                    <>
                                        <p className="font-medium text-slate-900">Subject: {generatedContent.content.subject}</p>
                                        <p className="whitespace-pre-line">{generatedContent.content.body}</p>
                                    </>
                                ) : (
                                    <ul className="list-disc pl-4 space-y-1">
                                        {generatedContent.content.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
