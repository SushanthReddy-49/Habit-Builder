import { GoogleGenAI } from '@google/genai';

// Initialize Gemini function
const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({});
};

const categorizeTask = async (taskTitle, taskDescription = '') => {
  try {
    const genAI = getGenAI();
    
    // If Gemini is not available, use fallback categorization
    if (!genAI) {
      console.log('Gemini API key not available, using fallback categorization');
      const fallbackCategory = getFallbackCategory(taskTitle, taskDescription);
      return {
        category: fallbackCategory,
        confidence: 0.5
      };
    }

    const prompt = `
    Categorize the following task into one of these categories: work, health, personal, learning.
    
    Task: ${taskTitle}
    Description: ${taskDescription}
    
    Respond with ONLY a valid JSON object in this exact format: {"category": "category_name", "confidence": 0.95}
    
    Guidelines:
    - work: Professional tasks, job-related activities, business meetings, deadlines
    - health: Exercise, diet, medical appointments, wellness activities
    - personal: Family, relationships, hobbies, entertainment, personal errands
    - learning: Studying, reading, courses, skill development, educational activities
    
    Do not include any markdown formatting, code blocks, or additional text. Only return the JSON object.
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const text = response.text.trim();
    
    // Clean the response to remove any markdown formatting
    let cleanText = text;
    if (text.includes('```json')) {
      cleanText = text.replace(/```json\s*/, '').replace(/\s*```/, '');
    } else if (text.includes('```')) {
      cleanText = text.replace(/```\s*/, '').replace(/\s*```/, '');
    }
    
    // Parse the JSON response
    const parsedResult = JSON.parse(cleanText);
    
    // Validate the response
    const validCategories = ['work', 'health', 'personal', 'learning'];
    if (!validCategories.includes(parsedResult.category)) {
      throw new Error('Invalid category returned from Gemini');
    }
    
    if (typeof parsedResult.confidence !== 'number' || parsedResult.confidence < 0 || parsedResult.confidence > 1) {
      parsedResult.confidence = 0.8; // Default confidence if invalid
    }

    return {
      category: parsedResult.category,
      confidence: parsedResult.confidence
    };
  } catch (error) {
    console.error('Gemini categorization error:', error);
    
    // Fallback categorization based on keywords
    const fallbackCategory = getFallbackCategory(taskTitle, taskDescription);
    
    return {
      category: fallbackCategory,
      confidence: 0.5 // Lower confidence for fallback
    };
  }
};

const getFallbackCategory = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  const keywords = {
    work: ['meeting', 'deadline', 'project', 'client', 'email', 'report', 'presentation', 'work', 'office', 'business'],
    health: ['exercise', 'workout', 'gym', 'run', 'walk', 'diet', 'doctor', 'appointment', 'meditation', 'yoga', 'health'],
    personal: ['family', 'friend', 'movie', 'dinner', 'shopping', 'clean', 'laundry', 'hobby', 'game', 'personal'],
    learning: ['study', 'read', 'course', 'learn', 'practice', 'research', 'book', 'tutorial', 'skill', 'education']
  };
  
  let maxScore = 0;
  let bestCategory = 'personal'; // Default category
  
  Object.entries(keywords).forEach(([category, words]) => {
    const score = words.reduce((acc, word) => {
      return acc + (text.includes(word) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  });
  
  return bestCategory;
};

export { categorizeTask }; 