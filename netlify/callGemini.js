// File: netlify/functions/callGemini.js

// This function will be triggered when you call /.netlify/functions/callGemini
exports.handler = async function (event, context) {
  // 1. Get the secret API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  const API_MODEL = 'gemini-1.5-flash-latest';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${apiKey}`;

  // 2. Get the prompt data sent from your frontend
  // The 'body' of the request from the frontend is a string, so we need to parse it as JSON
  const requestBody = JSON.parse(event.body);

  // 3. Prepare the payload for the Google API
  const payload = {
    contents: Array.isArray(requestBody.promptOrHistory) 
        ? requestBody.promptOrHistory 
        : [{ parts: [{ text: requestBody.promptOrHistory }] }]
  };

  if (requestBody.isJson) {
      payload.generationConfig = { responseMimeType: "application/json" };
  }

  try {
    // 4. Make the secure request to the Google Gemini API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // If Google's API returns an error, pass it along
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Google API Error: ${response.statusText}` }),
      };
    }

    const result = await response.json();

    // 5. Send the result back to your frontend
    return {
      statusCode: 200,
      body: JSON.stringify(result), // Send the full Gemini response back
    };

  } catch (error) {
    // Handle network errors or other issues
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};