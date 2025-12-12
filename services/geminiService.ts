
import { GoogleGenAI, Modality } from "@google/genai";
import { AppMode, Message, UrgencyLevel, GeminiResponseSchema, GroundingChunk, UserProfile } from '../types';

const METADATA_SEPARATOR = "---METADATA---";

// Updated schema to exclude 'advice' as it will be streamed as plain text
const JSON_SCHEMA_STR = `
{
  "urgency": "LOW" | "MEDIUM" | "HIGH",
  "reasoning": "string",
  "followUpQuestions": ["string", "string"]
}
`;

const getSystemInstruction = (mode: AppMode, language: string, userProfile?: UserProfile): string => {
  const userContext = userProfile ? `
    USER CONTEXT:
    Name: ${userProfile.name}
    Age: ${userProfile.age}
    Gender: ${userProfile.gender}
    Medical History: ${userProfile.medicalHistory}
    
    ADAPTATION INSTRUCTIONS:
    - Tailor your language and tone to the user's age.
    - Take their medical history into account when assessing risk.
    - Address them by name occasionally.
  ` : '';

  let followUpStrategy = "";
  let modeInstruction = "";

  switch (mode) {
    case AppMode.SKIN:
      modeInstruction = `
        You are an AI Dermatological Triage Assistant.
        
        IF AN IMAGE IS PROVIDED:
        1. **Visual Analysis**: Describe the lesion's appearance in detail.
        2. **Potential Causes**: List 2-3 common conditions consistent with the visuals.
        3. **Medication & Care**: 
           - Suggest specific OTC (Over-the-Counter) treatments (e.g., "Hydrocortisone cream 1% for itching", "Clotrimazole for fungal suspicion", "Benzoyl Peroxide for acne").
           - Provide home remedies (cold compress, keeping dry, aloe vera).
        4. **Urgency Assessment**: High urgency ONLY for infection (spreading redness, heat, pus) or melanoma signs (ABCDE rule).

        IF NO IMAGE IS PROVIDED:
        Ask for a photo or detailed description, but still offer general skin soothing advice and OTC anti-itch suggestions immediately.
      `;
      followUpStrategy = `
        FOLLOW-UP STRATEGY (SKIN):
        - "How long have you had this?"
        - "Does it itch, burn, or hurt?"
        - "Has it changed recently?"
      `;
      break;
    case AppMode.MEDICINE:
      modeInstruction = `
        You are an expert Medical Analyst. 
        Goal: Analyze Pharmaceutical Products or Lab Reports.
        
        **[MEDICINE LOGIC]**
        1. **Identify**: Name and form.
        2. **Usage**: Extract instructions.
        3. **Refills**: Identify Pack Size for reminders.
        4. **Advice**: Explain what it treats. If this medication is usually taken with others, mention standard interactions to watch for.

        **[LAB REPORT LOGIC]**
        1. **Analyze**: Identify abnormal values.
        2. **Explain**: What the test measures.
        3. **Improvement**: Suggest lifestyle changes and supplements (e.g., "Vitamin D supplements", "Iron supplements") if results suggest a deficiency.

        **CRITICAL**: If the image is blurry, refuse to guess.
      `;
      followUpStrategy = `
        FOLLOW-UP STRATEGY (MEDICINE/LAB):
        - "Are you taking this currently?"
        - "Do you have any known allergies?"
      `;
      break;
    case AppMode.MENTAL_HEALTH:
      modeInstruction = `
        You are a supportive mental health companion.
        Goal: Provide comfort, coping strategies, and mindfulness techniques.
        
        **Actionable Advice**: Suggest specific breathing exercises (e.g., 4-7-8 breathing), grounding techniques (5-4-3-2-1), or journaling prompts.
        
        **Medication**: Do NOT suggest specific psychiatric medications. You may suggest natural sleep aids (like Melatonin or Chamomile tea) if insomnia is a symptom, but refer to a professional for anxiety/depression medication.
        
        CRITICAL SAFETY: If self-harm/suicide is implied, set urgency HIGH and direct to emergency services immediately.
      `;
      followUpStrategy = `
        FOLLOW-UP STRATEGY (MENTAL HEALTH):
        - "How long have you been feeling this way?"
        - "Is this affecting your sleep or appetite?"
        - "Do you have someone to talk to?"
      `;
      break;
    case AppMode.SYMPTOM:
    default:
      modeInstruction = `
        You are a helpful home-health assistant.
        
        **PRIMARY GOAL**: Provide immediate, practical relief and triage.
        
        1. **Analyze Symptoms**: Identify the likely cause (cold, flu, migraine, muscle strain, etc.).
        2. **OTC Medication Suggestions (REQUIRED)**: 
           - Explicitly suggest relevant Over-The-Counter medications.
           - Examples: "For fever/pain: Acetaminophen (Tylenol) or Ibuprofen (Advil)." "For congestion: Pseudoephedrine or Phenylephrine." "For allergies: Cetirizine (Zyrtec) or Loratadine (Claritin)."
           - Always use GENERIC names but mention common BRAND names for clarity.
        3. **Home Remedies**: List non-medicinal steps (hydration, rest, steam, positioning).
        4. **Urgency Check**: Only suggest a doctor visit if symptoms are severe, unusual, or persistent. For common issues, focus on management.
      `;
      followUpStrategy = `
        FOLLOW-UP STRATEGY (SYMPTOM CHECKER):
        - "How long has this been happening?"
        - "How severe is it (1-10)?"
        - "Do you have any known allergies to medications?"
      `;
      break;
  }

  const baseInstruction = `
    You are MediGuide, a caring and helpful AI health assistant.
    
    **CRITICAL BEHAVIORAL RULES**:
    1. **MINIMIZE DISCLAIMERS**: Do NOT start your response with "I am not a doctor" or "As an AI". The user has already accepted a disclaimer to use this app and knows you are an AI.
       - Your goal is to be USEFUL and ACTIONABLE.
       - If you must include a medical disclaimer, place it at the very end of the response or weave it subtly into the advice.
    
    2. **MEDICATION POLICY**: You ARE authorized to suggest specific Over-The-Counter (OTC) medications.
       - Suggest specific names (e.g., "Tylenol", "Advil", "Benadryl") alongside generic names.
       - Provide standard usage context (e.g., "helps with inflammation", "take with food").
       - Do NOT prescribe prescription-only drugs, but you can mention them as something a doctor might consider.
    
    3. **DETAILED HOME CARE**: The user wants to know what to do *at home*.
       - Provide actionable steps (e.g., "Apply ice for 15 mins", "Elevate the leg", "Drink ginger tea").
       - Be specific. Don't just say "rest"; say "avoid screens and lie in a dark room" (for migraines) or "keep the limb elevated above heart level" (for swelling).
    
    4. **TRIAGE INTELLIGENTLY**: 
       - Do NOT recommend a doctor for every minor symptom.
       - Reserve "See a doctor" for: High fever (>103F), difficulty breathing, chest pain, uncontrolled bleeding, confusion, or symptoms lasting >1 week.
       - For everything else, assume self-care is the primary path and guide them through it.
    
    5. **USE TOOLS**: Use Google Search to find the latest treatments and interactions.

    6. **LOCATION QUERIES**: If the user asks for nearby places (pharmacies, hospitals, clinics), use the Google Maps tool.
    
    LANGUAGE REQUIREMENT:
    You MUST reply in the following language: ${language}.
    
    ${userContext}
    
    ${modeInstruction}

    ${followUpStrategy}

    OUTPUT FORMAT:
    1. First, provide your main helpful advice (Medication suggestions, Home cures, remedies) in Markdown. Use bolding and lists for readability.
    2. Then, output exactly this separator on a new line: ${METADATA_SEPARATOR}
    3. Finally, output a valid JSON object for metadata matching this schema:
    ${JSON_SCHEMA_STR}

    SAFETY:
    If symptoms suggest a life-threatening emergency (Chest pain, difficulty breathing, severe bleeding, stroke signs), set urgency to HIGH and tell them to seek help immediately.
    For everything else, assume the role of a knowledgeable home nurse guiding them through self-care.
  `;
  
  return baseInstruction;
};

// Retry helper to handle intermittent network errors
const retryRequest = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
        return await fn();
    } catch (err: any) {
        // Retry on network errors or 503s
        if (retries > 0 && (err.message?.includes('Network') || err.message?.includes('fetch') || err.status === 503)) {
            console.warn(`Retrying request... Attempts left: ${retries}`);
            await new Promise(res => setTimeout(res, delay));
            return retryRequest(fn, retries - 1, delay * 2);
        }
        throw err;
    }
};

export const sendMessageToGemini = async (
  history: Message[],
  currentText: string,
  currentImage: string | undefined,
  imageMimeType: string | undefined,
  mode: AppMode,
  language: string = 'English',
  userProfile?: UserProfile,
  onStreamUpdate?: (text: string) => void,
  isFocus: boolean = false,
  userLocation?: { latitude: number; longitude: number }
): Promise<{ structured: GeminiResponseSchema, groundingChunks?: GroundingChunk[] }> => {
  
  // Initialize AI client
  if (!process.env.API_KEY) {
      console.error("API_KEY is missing from environment");
      return {
          structured: {
              advice: "Configuration Error: API Key is missing. Please contact support.",
              urgency: UrgencyLevel.UNKNOWN,
              reasoning: "Missing credentials",
              followUpQuestions: []
          }
      };
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = getSystemInstruction(mode, language, userProfile);
  
  let contextString = "PREVIOUS CONTEXT:\n";
  history.forEach(msg => {
    if (msg.role === 'user') {
      contextString += `User: ${msg.text || '[Image Uploaded]'}\n`;
    } else {
      contextString += `Assistant: ${msg.structuredResponse?.advice}\n`;
    }
  });

  let prompt = `${contextString}\n\nCURRENT USER QUERY: ${currentText}`;
  
  // Logic for Focus Mode
  if (isFocus) {
    prompt += `
    
    *** IMPORTANT INSTRUCTION: DEEP FOCUS MODE ACTIVE ***
    The user has explicitly requested a DEEP FOCUS analysis on the specific topic provided in the query above: "${currentText}".
    
    1. Prioritize depth and specificity over breadth. 
    2. Explain the 'Why' and 'How' regarding this specific symptom or condition.
    3. If it's a symptom, detail potential pathophysiological causes (in simple terms), differentiating factors, and specific red flags.
    4. Ignore unrelated tangential context from previous history unless it directly impacts this specific focus area.
    5. Be thorough but clear.
    `;
  }
  
  const parts: any[] = [{ text: prompt }];
  
  if (currentImage) {
    parts.push({
      inlineData: {
        mimeType: imageMimeType || 'image/jpeg',
        data: currentImage
      }
    });
  }

  // Consolidated Tool Configuration
  const tools: any[] = [];
  const activeTools: any = { googleSearch: {} };
  let toolConfig: any = undefined;

  // Add Maps tool capability if location is available
  if (userLocation) {
    activeTools.googleMaps = {};
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        }
      }
    };
  }
  tools.push(activeTools);

  try {
    const responseStream: any = await retryRequest(() => ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5, // Slightly increased for more natural conversational tone
        tools: tools,
        toolConfig: toolConfig
      }
    }));

    let fullText = "";
    let accumulatedGroundingChunks: GroundingChunk[] = [];

    for await (const chunk of responseStream) {
      const textChunk = chunk.text || "";
      fullText += textChunk;
      
      // Accumulate grounding metadata
      if (chunk.groundingMetadata?.groundingChunks) {
        accumulatedGroundingChunks = [
            ...accumulatedGroundingChunks, 
            ...(chunk.groundingMetadata.groundingChunks as GroundingChunk[])
        ];
      }

      // Handle stream update
      if (onStreamUpdate) {
        const separatorIndex = fullText.indexOf(METADATA_SEPARATOR);
        if (separatorIndex !== -1) {
             const textToDisplay = fullText.substring(0, separatorIndex);
             onStreamUpdate(textToDisplay);
        } else {
             // Handle partial separator to avoid flickering
             let textToDisplay = fullText;
             for (let i = METADATA_SEPARATOR.length - 1; i > 0; i--) {
                const partialSeparator = METADATA_SEPARATOR.substring(0, i);
                if (fullText.endsWith(partialSeparator)) {
                    textToDisplay = fullText.substring(0, fullText.length - i);
                    break;
                }
             }
             onStreamUpdate(textToDisplay);
        }
      }
    }

    // Processing Final Output
    const separatorIndex = fullText.indexOf(METADATA_SEPARATOR);
    let adviceText = "";
    let jsonPart = "{}";

    if (separatorIndex !== -1) {
       adviceText = fullText.substring(0, separatorIndex).trim();
       jsonPart = fullText.substring(separatorIndex + METADATA_SEPARATOR.length).trim();
    } else {
       adviceText = fullText.trim();
    }

    let parsedMetadata: any = {};
    try {
        const cleanJson = jsonPart
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/, '')
            .replace(/```\s*$/, '');
        
        if (cleanJson) {
            parsedMetadata = JSON.parse(cleanJson);
        }
    } catch (e) {
        console.warn("Metadata JSON parse failed", e);
    }

    const structured: GeminiResponseSchema = {
        advice: adviceText,
        urgency: parsedMetadata.urgency || UrgencyLevel.UNKNOWN,
        reasoning: parsedMetadata.reasoning || "Analysis complete",
        followUpQuestions: parsedMetadata.followUpQuestions || []
    };

    return { structured, groundingChunks: accumulatedGroundingChunks };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      structured: {
        advice: "I am having trouble connecting to the service. Please check your internet connection and try again.",
        urgency: UrgencyLevel.UNKNOWN,
        reasoning: "Network/API Error",
        followUpQuestions: []
      }
    };
  }
};

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: audioBase64 } }, 
          { text: "Transcribe this audio exactly as spoken." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "";
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: {
        parts: [{ text: text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });
    
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const generateDoctorSummary = async (history: Message[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contextString = history.map(msg => {
    const role = msg.role === 'user' ? 'Patient' : 'AI Assistant';
    const content = msg.text || (msg.structuredResponse ? msg.structuredResponse.advice : '');
    return `${role}: ${content}`;
  }).join('\n\n');

  const prompt = `
    Analyze the following conversation between a patient and an AI medical assistant.
    Generate a professional "Doctor Handover Summary" formatted for a physician to read quickly.
    
    You MUST output the report using the following markdown structure exactly:

    ### Patient Symptoms
    [List the key symptoms reported by the patient]

    ### Time Duration
    [State how long the symptoms have persisted, or "Not specified" if unknown]

    ### Possible Causes
    [List potential causes discussed by the AI based on symptoms]

    ### Red Flags
    [List any warning signs, high urgency indicators, or risk factors identified]

    ### Suggested Next Steps
    [Summarize the advice given to the patient regarding care or consultation, including any OTC medications suggested]
    
    Be concise, objective, and clinical.
    
    CONVERSATION LOG:
    ${contextString}
  `;

  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] }
     });
     return response.text || "Unable to generate summary.";
  } catch (e) {
     console.error("Summary Generation Error", e);
     return "An error occurred while generating the summary.";
  }
};
