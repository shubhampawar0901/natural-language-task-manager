const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const openaiService = require('./openaiService');
// Enhanced task item processing service with AI-powered natural language parsing

async function intelligentTextAnalysis(inputText) {
  try {
    // Use OpenAI for intelligent text analysis
    const result = await openaiService.parseTaskFromText(inputText);
    console.log('AI-powered text analysis result:', result);
    return result;
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);

    // Fallback to basic analysis if AI fails
    let urgencyLevel = 'P3';
    if (/\bp1\b|critical|urgent|emergency|asap/i.test(inputText)) urgencyLevel = 'P1';
    else if (/\bp2\b|high|important|priority/i.test(inputText)) urgencyLevel = 'P2';
    else if (/\bp4\b|low|minor|whenever/i.test(inputText)) urgencyLevel = 'P4';

    return {
      itemTitle: inputText.length > 100 ? inputText.substring(0, 100) + '...' : inputText,
      assignedTo: 'Unassigned',
      deadlineText: '',
      urgencyLevel
    };
  }
}

// Helper functions removed - now using OpenAI for intelligent parsing

class TaskItemService {
  parseDeadlineText(deadlineString) {
    try {
      const currentDate = new Date();
      let targetYear = currentDate.getFullYear();
      let targetMonth, targetDay, targetHour = 23, targetMinute = 59; // Default end of day
      let parseSuccessful = false;
      let normalizedString = deadlineString.toLowerCase();

      // Enhanced pattern matching for '11pm 20th June' or '20th June 11pm'
      let timeMatch = normalizedString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)/i);
      if (timeMatch) {
        // Extract time components
        targetHour = parseInt(timeMatch[1], 10);
        targetMinute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const meridiem = timeMatch[3];
        targetDay = parseInt(timeMatch[4], 10);
        targetMonth = timeMatch[5];

        if (meridiem) {
          if (meridiem.toLowerCase() === 'pm' && targetHour < 12) targetHour += 12;
          if (meridiem.toLowerCase() === 'am' && targetHour === 12) targetHour = 0;
        }
        parseSuccessful = true;
      } else {
        // Fallback to date-only pattern '20th June'
        timeMatch = normalizedString.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)/i);
        if (timeMatch) {
          targetDay = parseInt(timeMatch[1], 10);
          targetMonth = timeMatch[2];
          targetHour = 23;
          targetMinute = 59;
          parseSuccessful = true;
        }
      }

      if (parseSuccessful) {
        // Convert month name to numeric index
        const monthMapping = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december'
        ];
        let monthIndex = monthMapping.indexOf(targetMonth.toLowerCase());
        if (monthIndex === -1) monthIndex = currentDate.getMonth(); // Fallback to current month

        let constructedDate = new Date(targetYear, monthIndex, targetDay, targetHour, targetMinute, 0, 0);

        // If the constructed date is in the past, move to next year
        if (constructedDate < currentDate) {
          constructedDate.setFullYear(targetYear + 1);
        }
        return constructedDate.toISOString().slice(0, 19).replace('T', ' ');
      }

      // Enhanced relative date processing
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      let referenceDate = null;
      let timePattern = null;

      if (/tomorrow/.test(normalizedString)) {
        referenceDate = nextDay;
        timePattern = normalizedString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      } else if (/today/.test(normalizedString)) {
        referenceDate = currentDate;
        timePattern = normalizedString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      }

      if (referenceDate && timePattern) {
        let extractedHour = parseInt(timePattern[1], 10);
        let extractedMinute = timePattern[2] ? parseInt(timePattern[2], 10) : 0;
        let extractedMeridiem = timePattern[3];

        if (extractedMeridiem) {
          if (extractedMeridiem.toLowerCase() === 'pm' && extractedHour < 12) extractedHour += 12;
          if (extractedMeridiem.toLowerCase() === 'am' && extractedHour === 12) extractedHour = 0;
        }

        referenceDate.setHours(extractedHour, extractedMinute, 0, 0);
        return referenceDate.toISOString().slice(0, 19).replace('T', ' ');
      }

      // Handle common relative time expressions
      const relativeTimeMap = {
        'today': currentDate,
        'tomorrow': nextDay,
        'end of week': (() => {
          const weekEnd = new Date(currentDate);
          weekEnd.setDate(currentDate.getDate() + (5 - currentDate.getDay())); // Friday
          weekEnd.setHours(23, 59, 59, 999);
          return weekEnd;
        })(),
        'next week': (() => {
          const nextWeek = new Date(currentDate);
          nextWeek.setDate(currentDate.getDate() + 7);
          return nextWeek;
        })()
      };

      let finalDate = new Date(deadlineString);
      if (isNaN(finalDate) || !deadlineString.includes('-')) {
        for (const [keyword, dateValue] of Object.entries(relativeTimeMap)) {
          if (normalizedString.includes(keyword)) {
            finalDate = dateValue;
            break;
          }
        }
      }

      if (isNaN(finalDate)) {
        currentDate.setHours(23, 59, 59, 999);
        return currentDate.toISOString().slice(0, 19).replace('T', ' ');
      }

      return finalDate.toISOString().slice(0, 19).replace('T', ' ');
    } catch (error) {
      console.error('Error parsing deadline text:', error);
      const fallbackDate = new Date();
      fallbackDate.setHours(23, 59, 59, 999);
      return fallbackDate.toISOString().slice(0, 19).replace('T', ' ');
    }
  }

  async processAndCreateTaskItems(inputText) {
    try {
      // Use AI-powered intelligent text analysis
      let taskItem = await intelligentTextAnalysis(inputText);

      const validateUrgencyLevel = (urgency) => {
        const validUrgencyLevels = ['P1', 'P2', 'P3', 'P4'];
        return validUrgencyLevels.includes(urgency) ? urgency : 'P3';
      };

      taskItem.urgencyLevel = validateUrgencyLevel(taskItem.urgencyLevel);
      const itemId = uuidv4();
      const deadlineText = taskItem.deadlineText || '';
      console.log('Storing deadline text:', deadlineText);
      const assignedTo = taskItem.assignedTo || "Unassigned";

      await pool.execute(
        'INSERT INTO task_items (id, item_title, assigned_to, deadline_text, urgency_level) VALUES (?, ?, ?, ?, ?)',
        [itemId, taskItem.itemTitle, assignedTo, deadlineText, taskItem.urgencyLevel]
      );

      const [rows] = await pool.execute('SELECT * FROM task_items WHERE id = ?', [itemId]);
      return rows;
    } catch (error) {
      console.error('Error in processAndCreateTaskItems:', error);
      throw error;
    }
  }

  async retrieveAllTaskItems() {
    try {
      const [taskItems] = await pool.execute(
        'SELECT * FROM task_items ORDER BY created_at DESC'
      );
      return taskItems;
    } catch (error) {
      console.error('Error in retrieveAllTaskItems:', error);
      throw error;
    }
  }

  async modifyTaskItem(itemId, modifications) {
    try {
      const { item_title, assigned_to, deadline_text, urgency_level } = modifications;
      await pool.execute(
        'UPDATE task_items SET item_title = ?, assigned_to = ?, deadline_text = ?, urgency_level = ? WHERE id = ?',
        [item_title, assigned_to, deadline_text, urgency_level, itemId]
      );

      // Retrieve the updated task item
      const [rows] = await pool.execute('SELECT * FROM task_items WHERE id = ?', [itemId]);
      return rows[0];
    } catch (error) {
      console.error('Error in modifyTaskItem:', error);
      throw error;
    }
  }

  async removeTaskItem(itemId) {
    try {
      await pool.execute('DELETE FROM task_items WHERE id = ?', [itemId]);
      return true;
    } catch (error) {
      console.error('Error in removeTaskItem:', error);
      throw error;
    }
  }
}

module.exports = new TaskItemService();
