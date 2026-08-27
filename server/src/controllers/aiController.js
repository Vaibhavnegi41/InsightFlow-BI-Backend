import { askAiAssistant } from '../services/aiService.js';
import { getGcpStatus } from '../config/gcp.js';

export async function askQuestion(req, res) {
  try {
    const { question, datasetId } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Please provide a natural-language data question.' });
    }

    const userId = req.user ? req.user.id : 'guest_user';
    const response = await askAiAssistant({ question, datasetId, userId });

    return res.json(response);
  } catch (err) {
    console.error('AI Assistant error:', err);
    return res.status(500).json({ error: err.message || 'AI Assistant encountered an error processing your question.' });
  }
}

export function checkStatus(req, res) {
  try {
    const status = getGcpStatus();
    return res.json(status);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve system status.' });
  }
}
