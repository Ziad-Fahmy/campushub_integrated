const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Load university data from JSON file
let universityData = {};
try {
  const dataPath = path.join(__dirname, '..', 'data.json');
  if (fs.existsSync(dataPath)) {
    universityData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log('✅ University data loaded successfully');
    console.log(`📊 Loaded ${Object.keys(universityData).length} data categories`);
  } else {
    console.log('⚠️ data.json not found, using default responses');
  }
} catch (error) {
  console.error('❌ Error loading university data:', error.message);
}

// Prepare context from JSON data
const prepareContext = () => {
  if (Object.keys(universityData).length === 0) {
    return "I am a CampusHub assistant for King Salman International University. I can help with general university questions, but I don't have specific data loaded. Please contact the university directly for detailed information.";
  }
  
  return Object.entries(universityData)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');
};

// Validate environment configuration
const validateConfig = () => {
  const issues = [];
  
  if (!process.env.GEMINI_API_KEY) {
    issues.push('GEMINI_API_KEY environment variable is not set');
  }
  
  if (Object.keys(universityData).length === 0) {
    issues.push('University data could not be loaded from data.json');
  }
  
  return issues;
};

// Chat endpoint using Gemini API
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message is required',
        response: 'Please enter a message to chat with me!',
        timestamp: new Date().toISOString()
      });
    }

    // Check configuration
    const configIssues = validateConfig();
    if (configIssues.length > 0) {
      console.error('Configuration issues:', configIssues);
      return res.status(500).json({
        error: 'Service configuration error',
        response: 'Sorry, the chatbot service is not properly configured. Please contact the administrator.',
        details: configIssues,
        timestamp: new Date().toISOString()
      });
    }

    // Prepare context and prompt
    const context = prepareContext();
    const prompt = `You are a helpful assistant for King Salman International University. Use ONLY the information provided below to answer the user's question. If the information is not available in the provided data, politely say you don't have that specific information and suggest contacting the university directly.

University Information:
${context}

User Question: ${message.trim()}

Please provide a helpful and accurate response based only on the information above:`;

    console.log(`🤖 Processing chat request: "${message.trim().substring(0, 50)}..."`);

    // Call Gemini API with improved error handling
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Validate response structure
    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    console.log('✅ Chat response generated successfully');
    
    res.json({ 
      response: aiResponse,
      timestamp: new Date().toISOString(),
      source: 'Gemini AI',
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Chatbot error:', error.response?.data || error.message);
    
    // Provide helpful fallback response based on error type
    let fallbackMessage = 'Sorry, I\'m having trouble processing your request right now. Please try again later.';
    let statusCode = 500;
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      fallbackMessage = 'The request timed out. Please try asking a simpler question or try again later.';
      statusCode = 408;
    } else if (error.response?.status === 400) {
      fallbackMessage = 'I couldn\'t understand your question. Could you please rephrase it?';
      statusCode = 400;
    } else if (error.response?.status === 403) {
      fallbackMessage = 'The chatbot service is temporarily unavailable due to API limitations. Please contact support.';
      statusCode = 503;
    } else if (error.response?.status === 429) {
      fallbackMessage = 'Too many requests. Please wait a moment and try again.';
      statusCode = 429;
    }
    
    res.status(statusCode).json({ 
      error: 'Chatbot service error',
      response: fallbackMessage,
      timestamp: new Date().toISOString(),
      status: 'error'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  const hasData = Object.keys(universityData).length > 0;
  const configIssues = validateConfig();
  
  res.json({ 
    status: configIssues.length === 0 ? 'healthy' : 'configuration_needed',
    gemini_api_configured: hasApiKey,
    university_data_loaded: hasData,
    data_entries: Object.keys(universityData).length,
    configuration_issues: configIssues,
    service: 'CampusHub Gemini Chatbot',
    version: '1.1.0',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for development
router.get('/test', (req, res) => {
  const contextPreview = prepareContext();
  res.json({
    message: 'Chatbot service is running',
    context_preview: contextPreview.length > 200 ? contextPreview.substring(0, 200) + '...' : contextPreview,
    context_length: contextPreview.length,
    data_categories: Object.keys(universityData),
    timestamp: new Date().toISOString()
  });
});

// Get available data categories
router.get('/categories', (req, res) => {
  res.json({
    categories: Object.keys(universityData),
    total_categories: Object.keys(universityData).length,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
