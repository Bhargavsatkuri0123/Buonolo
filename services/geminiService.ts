import { GoogleGenAI, Type } from "@google/genai";
import { InfoCategory, GroundingSource, VisaDetails, SafetyData, CommunityData, NewsItem, UserLocation, VisaReport, FeedPost, InfoItem, NearbyService } from "../types";

// Persistent localStorage-backed cache
const CACHE_KEY = 'buonolo_cache_v3';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours for localization data

const getCacheStore = (): Record<string, { data: any; timestamp: number }> => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};

const getCached = (key: string) => {
  const store = getCacheStore();
  const cached = store[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  return null;
};

const setCache = (key: string, data: any) => {
  try {
    const store = getCacheStore();
    store[key] = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch (e) {
    localStorage.removeItem(CACHE_KEY);
  }
};

/**
 * Stale-While-Revalidate Wrapper
 */
const swrFetch = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  const cached = getCached(key);
  if (cached) {
    // Revalidate in background
    fetcher().then(freshData => {
      if (freshData) setCache(key, freshData);
    }).catch(() => {});
    return cached;
  }
  const data = await fetcher();
  if (data) setCache(key, data);
  return data;
};

const safeParseJson = (text: string | undefined | null) => {
  if (!text) return null;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(cleaned);
  } catch (e) {}
  try {
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try { return JSON.parse(arrayMatch[0]); } catch (e) {}
    }
  } catch (e) {}
  return null;
};

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractSources = (response: any): GroundingSource[] => {
  const sources: GroundingSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) sources.push({ title: chunk.web.title || "Official Source", uri: chunk.web.uri });
      if (chunk.maps) sources.push({ title: chunk.maps.title || "Location Link", uri: chunk.maps.uri });
    });
  }
  return Array.from(new Map(sources.map(item => [item.uri, item])).values());
};

export const identifyLocationFromCoords = async (lat: number, lng: number): Promise<{ country: string; city: string } | null> => {
  const cacheKey = `loc-ident-${lat.toFixed(2)}-${lng.toFixed(2)}`;
  return swrFetch(cacheKey, async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Location Coords: ${lat}, ${lng}. Return JSON: {"country": "Name", "city": "Name"}.`,
      config: { temperature: 0, responseMimeType: "application/json" },
    });
    return safeParseJson(response.text);
  });
};

export const fetchNewsItems = async (query: string, limit: number = 10, excludeList: string[] = []): Promise<NewsItem[]> => {
  return [
    { id: "news-dummy-1", headline: "Warwick District Council Announces New Settlement Workshops", summary: "Free workshops in Leamington Spa and Warwick to help new residents navigate local services, taxes, and healthcare registration.", url: "#", date: "Today", sourceName: "Warwickshire Local" },
    { id: "news-dummy-2", headline: "Updates to Student Visas for University of Warwick Students", summary: "New post-study work visa terms specifically beneficial for international students studying at the University of Warwick.", url: "#", date: "Yesterday", sourceName: "UK Home Office Updates" },
    { id: "news-dummy-3", headline: "New Bus Routes Connecting Warwick Campus to Coventry", summary: "Stagecoach introduces additional services making the commute for students and workers seamlessly efficient.", url: "#", date: "2 days ago", sourceName: "Coventry Transport" }
  ];
};

export const fetchNearbyServices = async (serviceType: string, location: UserLocation, radius: number = 10, unit: string = 'km', limit: number = 10): Promise<NearbyService[]> => {
  return [
    { name: "Warwick Hospital", address: "Lakin Rd, Warwick CV34 5BW, UK", uri: "#" },
    { name: "Warwick Police Station", address: "Priory Rd, Warwick CV34 4NA, UK", uri: "#" },
    { name: "South Warwickshire NHS Foundation Trust", address: "Warwick CV34 5BW", uri: "#" },
    { name: "Post Office - Warwick", address: "Shire Hall, Market Place, Warwick", uri: "#" }
  ];
};

// Fixed signature to accept 4 arguments (including excludeList) as requested by callers
export const fetchExpatData = async (countryName: string, category: InfoCategory, limit: number = 10, excludeList: string[] = []): Promise<{ items: InfoItem[]; sources: GroundingSource[] }> => {
  return {
    items: [
      { id: "expat-1", title: `Understanding Taxes in Warwick`, summary: "Overview of Council Tax and UK Income tax for new residents in Warwick.", fullContent: "Council tax bands vary by property value...", date: "Today", source: "Local Gov", url: "#", category: category },
      { id: "expat-2", title: `Healthcare Registration`, summary: "How to register with a GP in the NHS Coventry and Warwickshire area.", fullContent: "Find a local surgery and provide your BRP...", date: "Yesterday", source: "NHS", url: "#", category: category }
    ],
    sources: []
  };
};

export const fetchSafetyData = async (countryName: string): Promise<SafetyData | null> => {
  return {
    generalAdvice: "Warwick and the surrounding areas (including Leamington Spa) are generally very safe. Normal precautions in town centers at night apply. The University of Warwick campus has its own 24/7 dedicated security.",
    emergencyNumbers: [
      { service: "General Emergency", number: "999", color: "bg-red-600", icon: "fa-phone" },
      { service: "Non-Emergency Police", number: "101", color: "bg-blue-600", icon: "fa-shield-halved" },
      { service: "NHS Medical Advice", number: "111", color: "bg-green-600", icon: "fa-notes-medical" }
    ]
  };
};

// Fixed signature to accept 2 arguments (countryName and location) as requested by callers
export const fetchGovernmentResources = async (countryName: string, location?: UserLocation) => {
  return {
    portals: [
      { name: "Warwick District Council", description: "Register for council tax, bin collections, and local voting options.", url: "https://www.warwickdc.gov.uk", category: "Local Admin" },
      { name: "Warwickshire Police", description: "Local policing, safety advice, and reporting non-emergencies.", url: "https://www.warwickshire.police.uk", category: "Safety" },
      { name: "NHS Coventry and Warwickshire", description: "Find a local GP and understand healthcare services in the area.", url: "https://www.happyhealthylives.uk", category: "Healthcare" }
    ],
    sources: []
  };
};

export const fetchCommunityData = async (countryName: string): Promise<CommunityData> => {
  const cacheKey = `community-${countryName}`;
  return swrFetch(cacheKey, async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `3 active immigrant groups and 3 networking events in ${countryName}. Return JSON.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return safeParseJson(response.text) || { groups: [], events: [], sources: [] };
  });
};

export const getVisaAdvice = async (details: VisaDetails): Promise<VisaReport> => {
  return {
    overview: "As a prospective resident looking to move to Warwick, United Kingdom, the primary pathways include the Skilled Worker Visa (supported by the area's robust tech and automotive industries) and the Student or Graduate Route due to the presence of the University of Warwick.",
    options: [
      {
        title: "Skilled Worker Visa",
        estimatedTime: "3 to 8 weeks",
        icon: "fa-user-tie",
        requirements: ["Job offer from Home Office approved sponsor", "Salary above minimum threshold", "Proved English proficiency"],
        pros: ["Direct path to Indefinite Leave to Remain (ILR)", "Can bring dependents"],
        cons: ["Tied to your specific employer", "High application and NHS surcharge fees"]
      },
      {
        title: "Student Route",
        estimatedTime: "3 weeks",
        icon: "fa-user-graduate",
        requirements: ["Confirmation of Acceptance for Studies (CAS) from University of Warwick/Coventry", "Proof of financial maintenance"],
        pros: ["Can work part-time during term", "Eligible for Post-Study Graduate Route"],
        cons: ["Time-limited to your course length", "Does not directly lead to settlement"]
      }
    ],
    recommendedSteps: [
      "Translate and legalize all necessary identity and academic documents.",
      "Pass an approved English Language proficiency test (e.g., IELTS UKVI).",
      "Secure your CoS (Certificate of Sponsorship) or CAS.",
      "Submit the online UKVI application and pay the Immigration Health Surcharge.",
      "Attend a biometrics appointment at your local visa application center."
    ],
    officialResourceLinks: [
      { title: "UK Visas and Immigration (Gov.uk)", uri: "https://www.gov.uk/browse/visas-immigration" }
    ],
    disclaimer: "This is a UK/Warwick template. Consult official UKVI guidance for your individual circumstances."
  };
};

export const fetchLocalFeedData = async (location: UserLocation): Promise<FeedPost[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 realistic community news briefs for ${location.city || 'this area'}. Return JSON array.`,
    config: { temperature: 0.5, responseMimeType: "application/json" },
  });
  return safeParseJson(response.text) || [];
};

export const createExpatChat = (countryName?: string) => {
  const ai = getAIClient();
  return ai.chats.create({ 
    model: 'gemini-3-flash-preview', 
    config: { systemInstruction: `You are Bona for residents in ${countryName}. Be brief.`, tools: [{ googleSearch: {} }] } 
  });
};

export const fetchLocalImmigrantInfo = async (location: UserLocation): Promise<{ city: string; sources: GroundingSource[] }> => {
  return {
    city: "Warwick",
    sources: [
      { title: "Warwick New Residents Guide", uri: "https://www.warwickdc.gov.uk" },
      { title: "Warwickshire Integration Support", uri: "https://www.warwickshire.gov.uk/migration" }
    ]
  };
};

export const fetchLocalResources = async (countryName: string, category: string, location?: UserLocation, radius: number = 10, unit: string = 'km', limit: number = 10, excludeList: string[] = []): Promise<NearbyService[]> => {
  return [
    { id: "res-1", name: "Warwick Jobcenter Plus", address: "Local office for employment resources", uri: "#" },
    { id: "res-2", name: "Warwickshire CAVA", address: "Volunteering & Community Action in Warwickshire", uri: "#" },
    { id: "res-3", name: "Leamington Spa Integration Center", address: "Support for language classes and settlement", uri: "#" }
  ];
};