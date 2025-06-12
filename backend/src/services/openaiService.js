const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

class OpenAIService {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('OpenAI API Key loaded:', apiKey ? 'Yes' : 'No');

    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async parseTaskFromText(inputText) {
    try {
      const prompt = `
You are a task extraction AI. Extract task information from the following text and return ONLY a valid JSON object with these exact fields:

{
  "taskTitle": "Brief, clear task description (max 100 chars)",
  "assignedTo": "Person who should handle the task",
  "deadlineText": "Extracted date/time or empty string",
  "urgencyLevel": "P1, P2, P3, or P4"
}

Rules:
1. taskTitle: Extract the main action/issue that needs to be addressed. Remove greetings, context, and details.
2. assignedTo: 
   - If text starts with "Hi [Name]" or "Dear [Name]", that person is the assignee
   - If no clear assignee, use "Unassigned"
   - Don't use customer names as assignees
3. deadlineText: Extract actual dates/times. For relative dates like "20th June", assume current year (2025). Format as "11pm 20th June" or "2025-06-20 23:00". Ignore random numbers.
4. urgencyLevel: P1 (critical/urgent), P2 (high/important), P3 (normal), P4 (low). Default to P3.

Examples:
Input: "Hi John, please fix the payment issue by tomorrow 5pm P1"
Output: {"taskTitle": "Fix payment issue", "assignedTo": "John", "deadlineText": "tomorrow 5pm", "urgencyLevel": "P1"}

Input: "Call client about project status"
Output: {"taskTitle": "Call client about project status", "assignedTo": "Unassigned", "deadlineText": "", "urgencyLevel": "P3"}

Now extract from this text:
"${inputText}"

Return ONLY the JSON object, no other text:`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      });

      const content = response.choices[0].message.content.trim();
      console.log('OpenAI raw response:', content);
      
      // Parse the JSON response
      const parsedResult = JSON.parse(content);
      
      // Validate the response structure
      const validatedResult = {
        itemTitle: parsedResult.taskTitle || inputText.substring(0, 100),
        assignedTo: parsedResult.assignedTo || 'Unassigned',
        deadlineText: parsedResult.deadlineText || '',
        urgencyLevel: ['P1', 'P2', 'P3', 'P4'].includes(parsedResult.urgencyLevel) ? parsedResult.urgencyLevel : 'P3'
      };

      console.log('OpenAI parsed result:', validatedResult);
      return validatedResult;

    } catch (error) {
      console.error('OpenAI parsing error:', error);
      
      // Fallback to basic parsing if OpenAI fails
      return {
        itemTitle: inputText.length > 100 ? inputText.substring(0, 100) + '...' : inputText,
        assignedTo: 'Unassigned',
        deadlineText: '',
        urgencyLevel: 'P3'
      };
    }
  }
}

module.exports = new OpenAIService();
