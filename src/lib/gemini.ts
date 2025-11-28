import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface GeminiResponse {
  text: string;
  success: boolean;
  error?: string;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  async generateDailyScripture(): Promise<GeminiResponse> {
    try {
      console.log('[Gemini] Generating daily scripture...');
      const prompt = `Provide a short Bible verse from the Amplified Bible (AMP) that encourages:
- Consistency and discipline
- Spiritual growth
- Taking care of one's body (temple of God)
- Perseverance and commitment

Format the response as:
"[Verse text]" - Book Chapter:Verse (AMP)

Example: "So, whether you eat or drink, or whatever you do, do all to the glory of God." - 1 Corinthians 10:31 (AMP)

Provide ONLY the verse and reference, nothing else. Make sure it's from the Amplified Bible version.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      return { text, success: true };
    } catch (error: unknown) {
      console.error('Gemini API error:', error);
      return {
        text: '"Do you not know that your body is a temple of the Holy Spirit who is within you, whom you have [received as a gift] from God, and that you are not your own [property]?" - 1 Corinthians 6:19 (AMP)',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateNutritionTip(params?: {
    userGoals?: string;
    country?: string;
  }): Promise<GeminiResponse> {
    try {
      console.log('[Gemini] Generating nutrition tip for country:', params?.country || 'not specified');
      const prompt = `Generate a practical, evidence-based nutrition tip for a health-focused app user${
        params?.country ? ` in ${params.country}` : ''
      }${
        params?.userGoals ? ` with goals: ${params.userGoals}` : ''
      }.

IMPORTANT REQUIREMENTS:
- Must be based on peer-reviewed scientific research
- Should reference specific nutrients, vitamins, or minerals with proven benefits
- If country is specified, suggest locally available foods from that region
- Actionable and specific
- Under 150 characters
- Format: Just the tip text, no title or formatting
- ONLY include scientifically proven facts, no pseudoscience

Example for Nigeria: "Include moringa leaves in soups for vitamin A, calcium, and iron - proven to boost immunity."
Example for USA: "Add chia seeds to yogurt for omega-3 fatty acids - reduces inflammation and supports heart health."`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      return { text, success: true };
    } catch (error: unknown) {
      console.error('Gemini API error:', error);
      return {
        text: 'Stay hydrated! Aim for 8 glasses of water daily to support metabolism and energy levels.',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateMealSuggestions(params: {
    calorieTarget: number;
    dietType: string;
    mealType?: string;
    restrictions?: string[];
  }): Promise<GeminiResponse> {
    try {
      const prompt = `Generate 4 meal suggestions for:
- Calorie target: ${params.calorieTarget} calories per day
- Diet type: ${params.dietType}
${params.mealType ? `- Meal type: ${params.mealType}` : ''}
${params.restrictions?.length ? `- Dietary restrictions: ${params.restrictions.join(', ')}` : ''}

For each meal, provide in this exact JSON format:
{
  "name": "Meal name",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fats": number (in grams),
  "prepTime": number (in minutes),
  "difficulty": "Easy|Medium|Hard",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"]
}

Return ONLY a valid JSON array of 4 meals, nothing else.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      return { text, success: true };
    } catch (error: unknown) {
      console.error('Gemini API error:', error);
      return {
        text: '[]',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateJournalPrompt(mood?: string): Promise<GeminiResponse> {
    try {
      const prompt = `Generate a thoughtful journal prompt for a health and wellness app user${
        mood ? ` who is feeling ${mood}` : ''
      }.

The prompt should:
- Encourage self-reflection
- Be health/wellness focused
- Be open-ended
- Under 100 characters
- Format: Just the question, no formatting

Example: "What made you feel strong and capable today?"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      return { text, success: true };
    } catch (error: unknown) {
      console.error('Gemini API error:', error);
      return {
        text: 'What made you feel strong and capable today?',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async analyzeMealPhoto(imageBase64: string): Promise<GeminiResponse> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = `Analyze this food image and provide nutritional estimates in JSON format:
{
  "name": "meal name",
  "estimatedCalories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fats": number (grams),
  "description": "brief description"
}

Return ONLY valid JSON, nothing else.`;

      const imageParts = [
        {
          inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: 'image/jpeg',
          },
        },
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text().trim();

      return { text, success: true };
    } catch (error: unknown) {
      console.error('Gemini API error:', error);
      return {
        text: '{"error": "Unable to analyze image"}',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateWorkoutPlan(params: {
    fitnessLevel: string;
    goals: string;
    availableTime: number;
  }): Promise<GeminiResponse> {
    try {
      const prompt = `Create a workout plan for:
- Fitness level: ${params.fitnessLevel}
- Goals: ${params.goals}
- Available time: ${params.availableTime} minutes per session

Provide a week-long plan in JSON format:
{
  "plan": [
    {
      "day": "Monday",
      "focus": "area",
      "exercises": ["exercise 1", "exercise 2"],
      "duration": number,
      "intensity": "Low|Medium|High"
    }
  ]
}

Return ONLY valid JSON, nothing else.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      return { text, success: true };
    } catch (error: unknown) {
      console.error('Gemini API error:', error);
      return {
        text: '{"plan": []}',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const geminiService = new GeminiService();
