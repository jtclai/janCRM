import { GoogleGenAI, Type } from "@google/genai";
import { Contact } from '../types';

const MODEL_NAME = 'gemini-2.0-flash';

// Lazy init: avoid crashing app on load when API key is missing or invalid
let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (_ai) return _ai;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  if (!apiKey) return null;
  try {
    _ai = new GoogleGenAI({ apiKey });
    return _ai;
  } catch {
    return null;
  }
}

export const generateIceBreakers = async (contact: Contact): Promise<string[]> => {
  const customAttributes = contact.attributes.map(a => `${a.label}: ${a.value}`).join(', ');
  
  const prompt = `
    I need 3 personalized conversation starters for my contact, ${contact.firstName} ${contact.lastName}.
    
    Info:
    - Meeting context: ${contact.occasion}
    - Tags: ${contact.tags.join(', ')}
    - Role: ${contact.title} at ${contact.company}
    - Personal Details: ${customAttributes}
  `;

  const ai = getAI();
  if (!ai) return ["How have you been?", "Working on anything exciting?", "Long time no see!"];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            iceBreakers: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{"iceBreakers": []}');
    return json.iceBreakers || [];
  } catch (error) {
    console.error("Error generating ice breakers:", error);
    return ["How have you been?", "Working on anything exciting?", "Long time no see!"];
  }
};

export const generateDiscussionTopics = async (contact: Contact, socialUpdate?: string): Promise<string[]> => {
  const interactionsSummary = contact.interactions?.map(i => `Date: ${i.date}\nNotes: ${i.notes}`).join('\n---\n') || 'No previous meetings.';
  const generalNotes = contact.notes || 'None.';
  
  const prompt = `
    I am preparing for a meeting with ${contact.firstName} ${contact.lastName}. 
    Suggest 3-5 specific, high-quality discussion topics or follow-up questions.
    
    Base your suggestions on:
    1. Interaction History: ${interactionsSummary}
    2. General Background: ${generalNotes}
    3. Contact Tags: ${contact.tags.join(', ')}
    ${socialUpdate ? `4. Recent Social Media Activity (incorporate these insights): ${socialUpdate}` : ''}
    
    Objective: Find "open loops" from previous talks, follow up on their recent achievements or posts, and reference personal interests.
    
    Return JSON with 'topics' as an array of 3 to 5 strings. Each string should be a concise bullet point.
  `;

  const ai = getAI();
  if (!ai) return ["Follow up on previous projects", "Ask about recent work updates", "General catch up on personal interests"];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    const json = JSON.parse(response.text || '{"topics": []}');
    return json.topics || [];
  } catch (error) {
    console.error("Error generating discussion topics:", error);
    return ["Follow up on previous projects", "Ask about recent work updates", "General catch up on personal interests"];
  }
};

export const generateDraftEmail = async (contact: Contact, intent: string): Promise<{ subject: string; body: string }> => {
  const prompt = `
    Draft a short email to ${contact.firstName} ${contact.lastName}. Intent: ${intent}.
    Context: Met at ${contact.occasion}, Tags: ${contact.tags.join(', ')}.
    Return JSON with 'subject' and 'body'.
  `;

  const ai = getAI();
  if (!ai) return { subject: "Hello", body: "Hi, just reaching out." };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      subject: json.subject || "Hello",
      body: json.body || "Hi, just reaching out."
    };
  } catch (error) {
    return { subject: "Error", body: "Could not generate draft." };
  }
};

export const summarizeMeeting = async (notes: string, contactName: string): Promise<{ summary: string[], suggestedDateOffsetDays: number }> => {
  const prompt = `
    Summarize these meeting notes with ${contactName}: "${notes}"
    Return JSON with 'summary' (array) and 'suggestedDateOffsetDays' (number).
  `;

  const ai = getAI();
  if (!ai) return { summary: ["Could not summarize."], suggestedDateOffsetDays: 30 };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedDateOffsetDays: { type: Type.NUMBER }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      summary: json.summary || [],
      suggestedDateOffsetDays: json.suggestedDateOffsetDays || 30
    };
  } catch (error) {
    return { summary: ["Could not summarize."], suggestedDateOffsetDays: 30 };
  }
};

export const getContactUpdate = async (contact: Contact): Promise<{ summary: string; suggestions: string[]; sources: string[]; hasUpdate: boolean }> => {
  if (contact.syncPlatform === 'N/A') {
    return { hasUpdate: false, summary: "No updates today.", suggestions: [], sources: [] };
  }

  const platform = contact.syncPlatform || 'LinkedIn';
  const responseAddon = contact.generateAIResponses 
    ? "In the SUGGESTIONS section, please provide a specific DRAFT REPLY I can use to respond to this update."
    : "In the SUGGESTIONS section, provide 1-2 brief actionable follow-up ideas.";

  const prompt = `Search for any recent public updates, posts, or news specifically on ${platform} from the last 7 days for ${contact.firstName} ${contact.lastName} (${contact.title} at ${contact.company}).
  
  Please provide the information in exactly this format:
  HAS_UPDATE: [YES or NO]
  SUMMARY: [A concise 2-3 line summary of their latest activity. If HAS_UPDATE is NO, say "No updates today."]
  SUGGESTIONS: [${responseAddon} If HAS_UPDATE is NO, leave this empty.]
  
  Be very strict. If you cannot find a specific post or change from the last week, set HAS_UPDATE to NO.`;

  const ai = getAI();
  if (!ai) return { hasUpdate: false, summary: "No updates found.", suggestions: [], sources: [] };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const fullText = response.text || "";
    
    let hasUpdate = false;
    let summary = "No updates found.";
    let suggestions: string[] = [];
    
    const hasUpdateMatch = fullText.match(/HAS_UPDATE:\s*(YES|NO)/i);
    const summaryMatch = fullText.match(/SUMMARY:\s*([\s\S]*?)(?=SUGGESTIONS:|$)/i);
    const suggestionsMatch = fullText.match(/SUGGESTIONS:\s*([\s\S]*?)$/i);
    
    if (hasUpdateMatch) hasUpdate = hasUpdateMatch[1].toUpperCase() === 'YES';
    if (summaryMatch) summary = summaryMatch[1].trim();
    if (suggestionsMatch && hasUpdate) {
      suggestions = suggestionsMatch[1]
        .split(/\n|\*|-/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = chunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: string | undefined): uri is string => !!uri);

    return {
      hasUpdate,
      summary,
      suggestions: suggestions.slice(0, 3),
      sources: Array.from(new Set(urls))
    };
  } catch (error) {
    console.error("Error fetching updates:", error);
    return { hasUpdate: false, summary: "No updates found.", suggestions: [], sources: [] };
  }
};
