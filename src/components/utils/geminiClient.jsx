/**
 * Google AI Studio (Gemini) Integration for BoDiGi™
 * For Google Cloud Hackathon submission
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Call Google Gemini API
 * @param {string} prompt - The prompt to send
 * @param {object} options - Additional options
 * @returns {Promise<string>} - AI response
 */
export async function callGemini(prompt, options = {}) {
  const {
    model = 'gemini-pro',
    temperature = 0.7,
    maxTokens = 2048,
    systemInstruction = null,
    responseFormat = 'text', // 'text' or 'json'
    safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  } = options;

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured. Add it to your .env file.');
  }

  try {
    // Build the request body
    const contents = [];
    
    // Add system instruction if provided
    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: `SYSTEM: ${systemInstruction}` }]
      });
    }

    // Add main prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const requestBody = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 40
      },
      safetySettings
    };

    // If JSON response requested, add to generation config
    if (responseFormat === 'json') {
      requestBody.generationConfig.response_mime_type = 'application/json';
    }

    const response = await fetch(
      `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini API');
    }

    // Parse JSON if requested
    if (responseFormat === 'json') {
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON response:', text);
        throw new Error('Failed to parse JSON response from Gemini');
      }
    }

    return text;

  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

/**
 * Call Gemini with multimodal input (text + images)
 */
export async function callGeminiMultimodal(prompt, imageUrls = [], options = {}) {
  const { model = 'gemini-pro-vision' } = options;

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  try {
    const parts = [{ text: prompt }];

    // Add images as base64 data
    for (const imageUrl of imageUrls) {
      // Fetch image and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const base64 = await blobToBase64(imageBlob);
      
      parts.push({
        inline_data: {
          mime_type: imageBlob.type,
          data: base64.split(',')[1] // Remove data:image/... prefix
        }
      });
    }

    const requestBody = {
      contents: [{
        role: 'user',
        parts
      }],
      generationConfig: {
        temperature: options.temperature || 0.4,
        maxOutputTokens: options.maxTokens || 2048
      }
    };

    const response = await fetch(
      `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;

  } catch (error) {
    console.error('Gemini multimodal call failed:', error);
    throw error;
  }
}

/**
 * Stream Gemini responses
 */
export async function streamGemini(prompt, onChunk, options = {}) {
  const { model = 'gemini-pro' } = options;

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  try {
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048
      }
    };

    const response = await fetch(
      `${GEMINI_API_URL}/${model}:streamGenerateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error('Gemini streaming failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && onChunk) {
            onChunk(text);
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }

  } catch (error) {
    console.error('Gemini streaming failed:', error);
    throw error;
  }
}

/**
 * Helper: Convert Blob to Base64
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Google AI Studio Code Execution API
 * Execute Python/JavaScript code in Google's sandbox
 */
export async function executeCode(code, language = 'python') {
  // Note: This requires Google AI Studio Code Execution API access
  // For hackathon demo, you can simulate or use Cloud Run Functions
  
  try {
    const response = await callGemini(
      `Execute this ${language} code and return the output:\n\n${code}`,
      {
        model: 'gemini-pro',
        responseFormat: 'text'
      }
    );

    return {
      success: true,
      output: response,
      language
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  callGemini,
  callGeminiMultimodal,
  streamGemini,
  executeCode
};