
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Contact } from '../types';
import { Calendar, Users, Star, Clock, Linkedin, Sparkles, ExternalLink, RefreshCw, CheckCircle2, Loader2, Lightbulb, Instagram, Twitter, Ghost } from 'lucide-react';
import { getContactUpdate } from '../services/geminiService';

interface DashboardProps {
  contacts: Contact[];
  categories: string[];
  onSelectContact: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ contacts, onSelectContact }) => {
  const [loadingUpdates, setLoadingUpdates] = useState<Record<string, boolean>>({});
  const [updates, setUpdates] = useState<Record<string, { summary: string; suggestions: string[]; sources: string[]; timestamp: number; hasUpdate: boolean }>>({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const syncInitiated = useRef(false);

  const totalContacts = contacts.length;
  const catchUpsDue = contacts.filter(c => c.nextCatchUpDate && new Date(c.nextCatchUpDate) <= new Date()).length;
  
  const upcomingCatchUps = [...contacts]
    .filter(c => c.nextCatchUpDate)
    .sort((a, b) => new Date(a.nextCatchUpDate!).getTime() - new Date(b.nextCatchUpDate!).getTime())
    .slice(0, 5);

  const syncableContacts = useMemo(() => contacts.filter(c => {
    if (c.syncPlatform === 'LinkedIn' && c.linkedin) return true;
    if (c.syncPlatform === 'Instagram' && c.instagram) return true;
    if (c.syncPlatform === 'Twitter' && c.twitter) return true;
    return false;
  }), [contacts]);

  const contactsWithInsights = useMemo(() => {
    return syncableContacts.filter(contact => {
        return loadingUpdates[contact.id] || updates[contact.id]?.hasUpdate === true;
    });
  }, [syncableContacts, loadingUpdates, updates]);

  useEffect(() => {
    if (!syncInitiated.current && syncableContacts.length > 0) {
      syncInitiated.current = true;
      handleSyncAll();
    }
  }, [syncableContacts.length]);

  const handleFetchUpdate = async (contact: Contact) => {
    if (loadingUpdates[contact.id]) return;
    
    setLoadingUpdates(prev => ({ ...prev, [contact.id]: true }));
    try {
      const result = await getContactUpdate(contact);
      setUpdates(prev => ({ 
        ...prev, 
        [contact.id]: { ...result, timestamp: Date.now() } 
      }));
    } catch (error) {
      console.error("Sync failed for", contact.firstName, error);
    } finally {
      setLoadingUpdates(prev => ({ ...prev, [contact.id]: false }));
    }
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    const targets = syncableContacts.slice(0, 8);
    await Promise.all(targets.map(c => handleFetchUpdate(c)));
    setIsSyncingAll(false);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': return <Instagram size={10} />;
      case 'Twitter': return <Twitter size={10} />;
      default: return <Linkedin size={10} />;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-slate-50">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Your automated morning relationship briefing.</p>
        </div>
        <div className="flex items-center gap-3">
            {isSyncingAll && (
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 animate-pulse bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                    <Loader2 size={14} className="animate-spin" /> Network Scan Active
                </div>
            )}
            <button 
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            >
            <RefreshCw size={16} className={`${isSyncingAll ? 'animate-spin' : ''} text-indigo-600`} />
            Refresh Daily Sync
            </button>
        </div>
      </div>

      {/* Stats Grid - Single Row Layout with Correct Labels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all hover:border-indigo-100">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Total Network</p>
            <p className="text-xl font-bold text-slate-900 leading-none">{totalContacts}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all hover:border-red-100">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Catch-ups Due</p>
            <p className="text-xl font-bold text-slate-900 leading-none">{catchUpsDue}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all hover:border-emerald-100">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Today's Update</p>
            <p className="text-xl font-bold text-slate-900 leading-none">
                {Object.values(updates).filter((u: any) => u.hasUpdate).length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-slate-400" />
            Upcoming Catch-ups
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {upcomingCatchUps.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {upcomingCatchUps.map(contact => {
                  const isOverdue = new Date(contact.nextCatchUpDate!) < new Date();
                  return (
                    <div key={contact.id} onClick={() => onSelectContact(contact.id)} className="p-4 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <img 
                          src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.firstName}+${contact.lastName}`} 
                          className="w-10 h-10 rounded-full bg-slate-200 object-cover" 
                          alt="" 
                        />
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{contact.firstName} {contact.lastName}</p>
                          <p className="text-xs text-slate-500">{contact.company || contact.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                           {new Date(contact.nextCatchUpDate!).toLocaleDateString()}
                         </p>
                         <p className="text-xs text-slate-400">Target Date</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p>No catch-ups scheduled.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-500" />
              Relationship Insights
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {contactsWithInsights.length > 0 ? (
                contactsWithInsights.map(contact => (
                    <div key={contact.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group animate-in fade-in slide-in-from-right-2 duration-300">
                        {loadingUpdates[contact.id] && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 size={24} className="animate-spin text-indigo-600" />
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Scanning {contact.syncPlatform}...</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img 
                                        src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.firstName}+${contact.lastName}`} 
                                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-50" 
                                        alt="" 
                                    />
                                    {updates[contact.id]?.hasUpdate && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-base leading-none">{contact.firstName} {contact.lastName}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                            {getPlatformIcon(contact.syncPlatform)} 
                                            {contact.syncPlatform}
                                        </div>
                                        {updates[contact.id] && (
                                            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                                Synced {new Date(updates[contact.id].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="min-h-[40px] space-y-3">
                            {updates[contact.id] ? (
                                <>
                                    <div className="text-sm text-slate-700 leading-relaxed bg-indigo-50/20 p-4 rounded-xl border border-indigo-100/50">
                                        <p className="italic font-medium">"{updates[contact.id].summary}"</p>
                                    </div>
                                    
                                    {updates[contact.id].suggestions.length > 0 && (
                                        <div className="bg-amber-50/50 border border-amber-100/50 p-3 rounded-xl">
                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <Lightbulb size={12} /> Suggested Actions
                                            </p>
                                            <ul className="space-y-1.5">
                                                {updates[contact.id].suggestions.map((s, i) => (
                                                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                                        <span className="text-amber-400 mt-0.5">•</span>
                                                        {s}
                                                    </li>
                                                  ))}
                                              </ul>
                                          </div>
                                      )}

                                      {updates[contact.id].sources.length > 0 && (
                                          <div className="flex flex-wrap gap-2 pt-1">
                                              {updates[contact.id].sources.map((src, i) => (
                                                  <a key={i} href={src} target="_blank" rel="noreferrer" className="text-[9px] bg-white border border-slate-200 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1 hover:border-indigo-300 hover:text-indigo-600 transition shadow-sm">
                                                      <ExternalLink size={8} /> Source {i + 1}
                                                  </a>
                                              ))}
                                          </div>
                                      )}
                                </>
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                    <p className="text-sm text-slate-400">Scan in progress...</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 border-dashed animate-in fade-in duration-500">
                    <div className="flex flex-col items-center gap-3">
                        {isSyncingAll ? (
                            <>
                                <Loader2 size={32} className="text-indigo-300 animate-spin" />
                                <p className="font-medium text-slate-600">Scanning network links...</p>
                                <p className="text-xs text-slate-400">We're checking for updates from your connections.</p>
                            </>
                        ) : (
                            <>
                                <Ghost size={32} className="text-slate-300" />
                                <p className="font-bold text-slate-600">No updates found today.</p>
                                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                    {syncableContacts.length > 0 
                                        ? "We've scanned your network's preferred platforms, and no significant public milestones were detected in the last 7 days."
                                        : "Link your contacts' LinkedIn, Instagram, or Twitter profiles to receive automated relationship insights here."
                                    }
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
