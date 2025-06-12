const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const chrono = require('chrono-node');
const taskItemService = require('../services/taskService');

function convertToMySQLDateTime(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

function legacyTaskItemParser(inputText) {
    // Enhanced assignee extraction: look for patterns like "by" or "for"
    const assigneePattern = inputText.match(/\b(?:by|for)\s+(\w+)\b/i);
    const assignedTo = assigneePattern ? assigneePattern[1] : 'Unknown';

    // Enhanced deadline extraction using chrono-node
    const chronoParsedDate = chrono.parseDate(inputText);
    const deadlineText = chronoParsedDate ? convertToMySQLDateTime(chronoParsedDate) : null;

    // Extract item title: remove assignee and date components
    let itemTitle = inputText;
    if (assigneePattern) {
        itemTitle = itemTitle.replace(assigneePattern[0], '').trim();
    }
    if (chronoParsedDate) {
        itemTitle = itemTitle.replace(chronoParsedDate.toString(), '').trim();
    }

    // Enhanced urgency level detection with default P3
    let urgencyLevel = 'P3';
    if (inputText.match(/\bP1\b/i)) urgencyLevel = 'P1';
    else if (inputText.match(/\bP2\b/i)) urgencyLevel = 'P2';
    else if (inputText.match(/\bP4\b/i)) urgencyLevel = 'P4';

    return { itemTitle, assignedTo, deadlineText, urgencyLevel };
}

// Retrieve all task items with enhanced sorting
router.get('/task-items', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM task_items ORDER BY deadline_text ASC, urgency_level ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching task items:', error);
        res.status(500).json({ error: 'Failed to retrieve task items' });
    }
});

// Process natural language request and create task item
router.post('/process-request', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Missing input text for processing' });
        }
        // Use enhanced task item service for processing
        const taskItems = await taskItemService.processAndCreateTaskItems(text);
        res.status(201).json(taskItems[0]);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Failed to process request and create task item' });
    }
});

// Modify an existing task item
router.put('/task-items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { item_title, assigned_to, deadline_text, urgency_level } = req.body;

        const formattedDeadline = convertToMySQLDateTime(deadline_text);
        if (!formattedDeadline) {
            return res.status(400).json({ error: 'Invalid deadline_text format' });
        }

        const [result] = await pool.query(
            'UPDATE task_items SET item_title = ?, assigned_to = ?, deadline_text = ?, urgency_level = ? WHERE id = ?',
            [item_title, assigned_to, formattedDeadline, urgency_level, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task item not found' });
        }

        res.json({
            id,
            item_title,
            assigned_to,
            deadline_text: formattedDeadline,
            urgency_level
        });
    } catch (error) {
        console.error('Error modifying task item:', error);
        res.status(500).json({ error: 'Failed to modify task item' });
    }
});

// Remove a task item
router.delete('/task-items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM task_items WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task item not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error removing task item:', error);
        res.status(500).json({ error: 'Failed to remove task item' });
    }
});

module.exports = router;