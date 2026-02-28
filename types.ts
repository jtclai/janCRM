
export interface PersonalAttribute {
  id: string;
  label: string;
  value: string;
}

export interface Interaction {
  id: string;
  date: string;
  notes: string;
  aiSummary?: string[];
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  
  // Basic
  personalPhone?: string;
  birthday?: string; // YYYY-MM-DD
  instagram?: string;
  twitter?: string;
  
  // Relationship Context
  firstMet?: string; // Date
  occasion?: string; // Context
  
  // Professional Information
  title?: string;
  company?: string;
  workEmail?: string;
  workPhone?: string;
  linkedin?: string;
  
  // Custom Personal Attributes
  attributes: PersonalAttribute[];
  
  // Classification
  category: string;
  tags: string[];
  
  // Sync Preferences
  syncPlatform: 'LinkedIn' | 'Instagram' | 'Twitter' | 'N/A';
  generateAIResponses: boolean;
  
  // Management
  catchUpFrequency?: string;
  nextCatchUpDate?: string; // YYYY-MM-DD
  notes: string;
  interactions: Interaction[];
}

export interface AIAdviceResponse {
  subject?: string;
  content: string;
}
