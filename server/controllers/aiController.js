import { generateDescriptionFromAI } from '../services/aiService.js';

/**
 * @desc    Generate AI task description for a given task title
 * @route   POST /api/ai/generate-description (and POST /ai/generate-description)
 * @access  Public / Optional Bearer Token
 *
 * Practical 13 Requirements:
 * - Accepts task title
 * - Returns a short, actionable description using OpenAI gpt-4o-mini
 * - Returns visible disclaimer text: "AI-generated suggestion. Review before using."
 * - Returns clear, explicit error message on missing key or API failure
 */
export const generateTaskDescriptionController = async (req, res, _next) => {
  try {
    const { title } = req.body;

    // Validate title presence and type
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title is required to generate a description',
        data: null,
      });
    }

    const aiResult = await generateDescriptionFromAI(title);

    return res.status(200).json({
      success: true,
      description: aiResult.description,
      model: aiResult.model || 'gpt-4o-mini',
      disclaimer: aiResult.disclaimer || 'AI-generated suggestion. Review before using.',
      message: 'Description generated successfully with gpt-4o-mini',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      code: error.code || 'AI_GENERATION_FAILED',
      message: error.message || 'Failed to generate AI task description',
      data: null,
    });
  }
};
