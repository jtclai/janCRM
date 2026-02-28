
import React, { useState, useMemo, useEffect } from 'react';
import { Contact } from './types';
import ContactForm from './components/ContactForm';
import ContactDetail from './components/ContactDetail';
import Dashboard from './components/Dashboard';
import MeetingNotes from './components/MeetingNotes';
import Settings, { SortOption } from './components/Settings';
import { Search, Plus, Users, Menu, ArrowLeft, LayoutDashboard, Filter, Settings as SettingsIcon, Star } from 'lucide-react';

const DEFAULT_CATEGORIES = ['Personal', 'Professional', 'Family & Friends', 'VIP', 'Others'];

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Chen',
    category: 'Professional',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    personalPhone: '+1 555 0192',
    birthday: '1990-05-15',
    twitter: '@sarahchen_tech',
    firstMet: '2023-11-15',
    occasion: 'React Summit Conference, San Francisco',
    title: 'Product Director',
    company: 'TechFlow Inc',
    workEmail: 'sarah.c@techflow.com',
    linkedin: 'linkedin.com/in/sarahchen',
    attributes: [
        { id: '1a', label: 'Spouse', value: 'Tom' },
        { id: '1b', label: 'Kids', value: 'Emma (5), Leo (2)' }
    ],
    tags: ['AI', 'Product Management', 'Hiking'],
    syncPlatform: 'LinkedIn',
    generateAIResponses: true,
    catchUpFrequency: 'Monthly',
    nextCatchUpDate: '2024-06-15',
    notes: 'Remember to ask about her trip to Japan.',
    interactions: []
  },
  {
    id: '2',
    firstName: 'Marcus',
    lastName: 'Reynolds',
    category: 'VIP',
    firstMet: '2024-01-20',
    occasion: 'Introduced by David at the networking mixer.',
    title: 'Senior Architect',
    company: 'BuildRight',
    workEmail: 'marcus@buildright.com',
    linkedin: 'linkedin.com/in/marcusreynolds-arch',
    attributes: [
        { id: '2a', label: 'Car', value: 'Tesla Model Y' },
        { id: '2b', label: 'Hobby', value: 'Golf' }
    ],
    tags: ['Architecture', 'Sustainable Design'],
    syncPlatform: 'LinkedIn',
    generateAIResponses: false,
    catchUpFrequency: 'Quarterly',
    nextCatchUpDate: '2023-12-01',
    notes: 'Looking for contractors for the downtown project.',
    interactions: []
  },
  {
    id: '3',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    category: 'Family & Friends',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    personalPhone: '+1 555 0831',
    birthday: '1992-08-24',
    instagram: '@elena.designs',
    firstMet: '2020-05-10',
    occasion: 'Design 101 Class at University',
    attributes: [
        { id: '3a', label: 'Pets', value: 'Luna (Golden Retriever)' }
    ],
    tags: ['Photography', 'Travel', 'Indie Music'],
    syncPlatform: 'Instagram',
    generateAIResponses: true,
    catchUpFrequency: 'Bi-Annually',
    nextCatchUpDate: '2024-07-01',
    notes: 'Birthday is coming up in August.',
    interactions: []
  }
];

function App() {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // View states
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoggingInteraction, setIsLoggingInteraction] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<SortOption>('lastName');

  const processedContacts = useMemo(() => {
    let result = [...contacts];

    // Search & Filter
    result = result.filter(c => {
        const matchesSearch = `${c.firstName} ${c.lastName} ${c.company}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Sorting
    result.sort((a, b) => {
        if (sortOrder === 'firstName') return a.firstName.localeCompare(b.firstName);
        if (sortOrder === 'lastName') return a.lastName.localeCompare(b.lastName);
        if (sortOrder === 'category') return a.category.localeCompare(b.category);
        if (sortOrder === 'recent') {
            const dateA = a.interactions?.[0]?.date || '0';
            const dateB = b.interactions?.[0]?.date || '0';
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        }
        return 0;
    });

    return result;
  }, [contacts, searchQuery, filterCategory, sortOrder]);

  const selectedContact = contacts.find(c => c.id === selectedId);

  const handleSave = (contact: Contact) => {
    if (isCreating) {
      setContacts([contact, ...contacts]);
      setIsCreating(false);
    } else {
      setContacts(contacts.map(c => c.id === contact.id ? contact : c));
      setIsEditing(false);
    }
    setSelectedId(contact.id);
    setMobileMenuOpen(false); 
  };

  const handleUpdateContact = (updatedContact: Contact) => {
      setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== id));
      setSelectedId(null);
      setMobileMenuOpen(true);
    }
  };

  const handleGoHome = () => {
      setSelectedId(null);
      setIsCreating(false);
      setIsEditing(false);
      setIsLoggingInteraction(false);
      setIsSettingsOpen(false);
      setMobileMenuOpen(false);
  };

  const handleAddCategory = (name: string) => {
    setCategories([...categories, name]);
  };

  const handleRemoveCategory = (name: string) => {
    setCategories(categories.filter(c => c !== name));
  };

  const saveInteraction = (notes: string, summary: string[], nextDate: string) => {
    if (selectedContact) {
        const newInteraction = {
            id: crypto.randomUUID(),
            date: new Date().toLocaleDateString(),
            notes: notes,
            aiSummary: summary
        };
        const updatedContact = {
            ...selectedContact,
            nextCatchUpDate: nextDate,
            interactions: [newInteraction, ...(selectedContact.interactions || [])]
        };
        handleUpdateContact(updatedContact);
        setIsLoggingInteraction(false);
    }
  };

  // Aligned with ContactDetail.tsx
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'VIP': return 'bg-amber-400';
      case 'Professional': return 'bg-blue-400';
      case 'Client': return 'bg-purple-400';
      case 'Family & Friends': return 'bg-emerald-400';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100">
      
      {/* Sidebar List */}
      <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 h-full z-20 absolute md:relative shadow-xl md:shadow-none`}>
        <div className="p-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4 text-indigo-600 cursor-pointer" onClick={handleGoHome}>
            <span className="p-1 bg-indigo-50 rounded-lg text-indigo-600"><Users size={20} /></span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Nexus CRM</h1>
          </div>
          
          <div className="flex gap-1 mb-3">
              <button 
                onClick={handleGoHome}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm font-medium ${selectedId === null && !isCreating && !isSettingsOpen ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button 
                onClick={() => {
                    setIsSettingsOpen(true);
                    setSelectedId(null);
                    setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg transition text-sm font-medium ${isSettingsOpen ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                title="Settings"
              >
                <SettingsIcon size={18} />
              </button>
          </div>

          <div className="space-y-2">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <Filter size={14} className="text-slate-400 flex-shrink-0" />
                <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-transparent text-xs font-medium text-slate-600 border-none outline-none focus:ring-0 cursor-pointer"
                >
                    <option value="All">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {processedContacts.length === 0 ? (
             <div className="text-center p-8 text-slate-400">
               <p className="text-sm">No contacts found</p>
             </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {processedContacts.map(contact => (
                <button 
                  key={contact.id}
                  onClick={() => {
                    setSelectedId(contact.id);
                    setIsCreating(false);
                    setIsEditing(false);
                    setIsLoggingInteraction(false);
                    setIsSettingsOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition text-left group relative ${selectedId === contact.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.firstName}+${contact.lastName}`} 
                      alt="" 
                      className="w-10 h-10 rounded-full bg-slate-200 object-cover"
                    />
                    {/* Category Dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${getCategoryColor(contact.category)}`} title={contact.category}></div>
                  </div>
                  
                  <div className="min-w-0 flex-1 relative">
                    <div className="flex justify-between items-start">
                        <p className={`font-semibold truncate pr-1 ${selectedId === contact.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {sortOrder === 'lastName' ? `${contact.lastName}, ${contact.firstName}` : `${contact.firstName} ${contact.lastName}`}
                        </p>
                        
                        {/* VIP Flag - Small, orange frame, top right of the name area */}
                        {contact.category === 'VIP' && (
                          <div className="flex-shrink-0 bg-amber-50 text-amber-600 text-[8px] px-1.5 py-0.5 rounded border border-amber-200 font-black tracking-tighter shadow-xs">
                            VIP
                          </div>
                        )}
                    </div>
                    
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {contact.title ? `${contact.title} at ${contact.company}` : contact.category}
                    </p>
                  </div>
                  {contact.nextCatchUpDate && new Date(contact.nextCatchUpDate) < new Date() && (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse ml-2" title="Overdue catch-up" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <button 
            onClick={() => {
              setIsCreating(true);
              setIsEditing(false);
              setIsLoggingInteraction(false);
              setIsSettingsOpen(false);
              setSelectedId(null);
              setMobileMenuOpen(false);
            }}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-sm"
          >
            <Plus size={18} /> Add New Contact
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`${!mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full overflow-hidden relative`}>
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 bg-white border-b border-slate-200">
           <button onClick={() => setMobileMenuOpen(true)} className="mr-3 text-slate-600">
              <ArrowLeft size={20} />
           </button>
           <span className="font-semibold text-slate-800">
              {isCreating ? 'New Contact' : isEditing ? 'Edit Contact' : isLoggingInteraction ? 'Log Meeting' : isSettingsOpen ? 'Settings' : selectedId ? 'Details' : 'Dashboard'}
           </span>
        </div>

        <div className="flex-1 overflow-hidden">
          {isSettingsOpen ? (
             <div className="h-full p-4 md:p-6 lg:p-8">
                <Settings 
                    currentSort={sortOrder} 
                    onSortChange={(opt) => setSortOrder(opt)} 
                    categories={categories}
                    onAddCategory={handleAddCategory}
                    onRemoveCategory={handleRemoveCategory}
                    onClose={() => setIsSettingsOpen(false)} 
                />
             </div>
          ) : isCreating ? (
             <div className="h-full p-4 md:p-6 lg:p-8">
                <ContactForm 
                categories={categories}
                onSave={handleSave} 
                onCancel={() => {
                    setIsCreating(false);
                    if (!selectedId) setMobileMenuOpen(true);
                }} 
                />
             </div>
          ) : isEditing && selectedContact ? (
            <div className="h-full p-4 md:p-6 lg:p-8">
                <ContactForm 
                categories={categories}
                initialData={selectedContact}
                onSave={handleSave} 
                onCancel={() => setIsEditing(false)} 
                />
            </div>
          ) : isLoggingInteraction && selectedContact ? (
             <div className="h-full p-4 md:p-6 lg:p-8">
                <MeetingNotes 
                    contact={selectedContact}
                    onSave={saveInteraction}
                    onCancel={() => setIsLoggingInteraction(false)}
                />
             </div>
          ) : selectedContact ? (
            <div className="h-full p-4 md:p-6 lg:p-8">
                <ContactDetail 
                contact={selectedContact} 
                onEdit={() => setIsEditing(true)}
                onDelete={() => handleDelete(selectedContact.id)}
                onUpdate={handleUpdateContact}
                onLogInteraction={() => setIsLoggingInteraction(true)}
                />
            </div>
          ) : (
            <Dashboard contacts={contacts} categories={categories} onSelectContact={(id) => setSelectedId(id)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
