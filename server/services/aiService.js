import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server/.env is loaded reliably regardless of working directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

// Lazy-initialized OpenAI client
let openaiClient = null;
let mockGenerator = null;

/**
 * Set a mock generator function (used in automated tests)
 */
export const setMockGenerator = (fn) => {
  mockGenerator = fn;
};

/**
 * Reset client instance and mock (used in automated tests)
 */
export const resetOpenAIClient = () => {
  openaiClient = null;
  mockGenerator = null;
};

/**
 * Returns an instance of OpenAI client if OPENAI_API_KEY is configured.
 * Returns null if key is missing, empty, or placeholder.
 */
export const getOpenAIClient = () => {
  // Re-read process.env in case it was updated
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '' || apiKey.trim() === 'your_openai_api_key_here') {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: apiKey.trim() });
  }
  return openaiClient;
};

/**
 * Optional rule-based fallback description generator for offline development
 * @param {string} title - Task title
 * @returns {string} Actionable task description
 */
export const generateFallbackDescription = (title) => {
  const cleanTitle = (title || '').trim();
  if (!cleanTitle) {
    return 'Complete the assigned objectives, track milestones, and review final deliverables.';
  }

  const lower = cleanTitle.toLowerCase();
  if (lower.startsWith('fix') || lower.includes('bug') || lower.includes('issue') || lower.includes('error')) {
    return `Investigate root cause of ${cleanTitle}, implement the necessary fix, and verify resolution with tests.`;
  }
  if (lower.startsWith('implement') || lower.startsWith('build') || lower.startsWith('create') || lower.startsWith('add') || lower.startsWith('develop')) {
    return `Design and implement ${cleanTitle}, ensuring all requirements, edge cases, and documentation are covered.`;
  }
  if (lower.startsWith('review') || lower.startsWith('audit') || lower.startsWith('test') || lower.startsWith('check')) {
    return `Perform a thorough review of ${cleanTitle}, record observations, and validate acceptance criteria.`;
  }
  if (lower.startsWith('buy') || lower.startsWith('purchase') || lower.startsWith('order') || lower.startsWith('get')) {
    return `Procure necessary items for ${cleanTitle}, verify specifications and pricing, and retain receipts.`;
  }
  if (lower.startsWith('meeting') || lower.startsWith('call') || lower.includes('discuss') || lower.includes('sync')) {
    return `Prepare agenda and key discussion points for ${cleanTitle}, and document actionable next steps.`;
  }
  if (lower.startsWith('write') || lower.startsWith('document') || lower.startsWith('draft')) {
    return `Draft clear and comprehensive content for ${cleanTitle}, then review and finalize with stakeholders.`;
  }

  return `Plan and execute all necessary steps to complete: ${cleanTitle}. Review deliverables upon completion.`;
};

/**
 * Generate a task description using OpenAI API (model: gpt-4o-mini)
 * If API key is missing or request fails, throws an error with a clear message
 * instead of returning a generic fallback pretending to be an AI result.
 *
 * @param {string} title - Task title
 * @returns {Promise<{description: string, model: string, disclaimer: string}>}
 */
export const generateDescriptionFromAI = async (title) => {
  if (mockGenerator) {
    return await mockGenerator(title);
  }

  const client = getOpenAIClient();

  if (!client) {
    const error = new Error('OpenAI API key is missing. Please configure OPENAI_API_KEY in server/.env to use AI description generation.');
    error.statusCode = 503;
    error.code = 'OPENAI_API_KEY_MISSING';
    throw error;
  }

  try {
    const completion = await client.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant for a task management application. Given a task title, generate a concise, actionable, single-paragraph task description (1 to 2 sentences) describing what needs to be done. Do not include markdown formatting, quotation marks, bullet points, or prefixes like "Description:".',
          },
          {
            role: 'user',
            content: `Task Title: "${title.trim()}"`,
          },
        ],
        max_tokens: 120,
        temperature: 0.7,
      },
      { timeout: 10000 } // 10 second timeout limit
    );

    const generatedText = completion.choices?.[0]?.message?.content?.trim();
    if (!generatedText) {
      const error = new Error('Received an empty response from OpenAI gpt-4o-mini.');
      error.statusCode = 502;
      error.code = 'EMPTY_RESPONSE';
      throw error;
    }

    return {
      description: generatedText,
      model: 'gpt-4o-mini',
      disclaimer: 'AI-generated suggestion. Review before using.',
    };
  } catch (error) {
    // If it's already a custom error with statusCode, rethrow
    if (error.statusCode && error.code) {
      throw error;
    }

    let statusCode = error.status || error.statusCode || 500;
    let message = error.message || 'An error occurred while communicating with OpenAI.';
    let errorCode = error.code || 'OPENAI_API_ERROR';

    if (error.status === 401 || error.code === 'invalid_api_key') {
      statusCode = 401;
      errorCode = 'INVALID_API_KEY';
      message = 'Invalid OpenAI API key. Please check the OPENAI_API_KEY in server/.env.';
    } else if (error.status === 429) {
      statusCode = 429;
      if (
        error.code === 'credit_balance_exhausted' ||
        error.message?.includes('credits remaining') ||
        error.message?.includes('billing')
      ) {
        errorCode = 'CREDIT_BALANCE_EXHAUSTED';
        message =
          'OpenAI account credit balance is exhausted (HTTP 429). Please add credits to your OpenAI account at https://platform.openai.com/settings/organization/billing to generate AI descriptions.';
      } else if (error.code === 'insufficient_quota') {
        errorCode = 'INSUFFICIENT_QUOTA';
        message = 'OpenAI API quota exceeded (HTTP 429: insufficient_quota). Please check your OpenAI billing and plan limits.';
      } else {
        errorCode = 'OPENAI_RATE_LIMITED';
        message = 'OpenAI API rate limit exceeded. Please wait a moment before trying again.';
      }
    } else if (error.name === 'APIConnectionTimeoutError' || error.code === 'ETIMEDOUT') {
      statusCode = 504;
      errorCode = 'TIMEOUT';
      message = 'OpenAI API request timed out after 10 seconds. Please try again.';
    } else if (error.name === 'APIConnectionError') {
      statusCode = 502;
      errorCode = 'CONNECTION_ERROR';
      message = 'Unable to connect to OpenAI API server. Please check your network connection.';
    }

    // Log warning on backend without printing secrets
    console.warn(`[AI SERVICE WARNING] ${message} (Code: ${errorCode}, Status: ${statusCode})`);

    const customError = new Error(message);
    customError.statusCode = statusCode;
    customError.code = errorCode;
    throw customError;
  }
};
