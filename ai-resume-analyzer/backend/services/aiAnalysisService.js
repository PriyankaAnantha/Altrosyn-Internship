// This service will handle communication with the OpenRouter API and basic prompt construction.

// backend/services/aiAnalysisService.js
require('dotenv').config();
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL_NAME = process.env.OPENROUTER_MODEL_NAME || 'mistralai/mistral-7b-instruct:free';
const YOUR_SITE_URL = "http://localhost:3000"; // Or your deployed frontend URL
const YOUR_APP_NAME = "AI Resume Analyzer";

if (!OPENROUTER_API_KEY) {
    console.error("FATAL ERROR: OPENROUTER_API_KEY is not set in .env file.");
    // Potentially exit or throw an error that stops the app from starting
    // For now, we'll let requests fail if the key is missing
}

/**
 * Analyzes resume text using OpenRouter LLM.
 * @param {string} resumeText - The extracted text from the resume.
 * @param {string} [jobDescriptionText] - Optional: The text of the job description.
 * @returns {Promise<Object>} The structured AI analysis.
 * @throws {Error} If the AI analysis fails.
 */
async function analyzeResumeWithAI(resumeText, jobDescriptionText) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("AI Service is not configured. Missing API Key.");
    }

    let prompt;
    const basePrompt = `You are an expert AI resume analyzer. Analyze the following resume text.
Provide a detailed, structured analysis in JSON format. The JSON output MUST be a single, valid JSON object and nothing else. Do not include any markdown formatting (like \`\`\`json) around the JSON output.

The JSON structure should include:
- "overallImpression": "string (1-2 sentences summary)"
- "strengths": ["string array of key strengths"]
- "areasForImprovement": ["string array of specific, actionable suggestions"]
- "atsFriendliness": { "score": "number (0-100, estimate)", "suggestions": ["string array for ATS optimization"] }
- "relevantSkills": ["string array of skills extracted from the resume relevant to general job applications"]
- "formattingAndStructure": { "clarity": "string (e.g., Good, Fair, Needs Improvement)", "suggestions": ["string array for formatting improvements"] }`;

    if (jobDescriptionText && jobDescriptionText.trim() !== '') {
        prompt = `${basePrompt}
- "jobDescriptionMatch": {
 "matchScore": "number (0-100, estimate of how well the resume matches the JD)",
 "matchingKeywords": ["string array of keywords from JD found in resume"],
 "missingKeywords": ["string array of important keywords from JD NOT found in resume"],
 "alignmentFeedback": "string (feedback on how well the resume aligns with the JD and suggestions for improvement)"
}

Resume Text:
---
${resumeText}
---

Job Description:
---
${jobDescriptionText}
---
`;
    } else {
        prompt = `${basePrompt}
Resume Text:
---
${resumeText}
---
Provide general feedback as no job description was provided.
`;
    }

    try {
        console.log(`Sending request to OpenRouter with model: ${OPENROUTER_MODEL_NAME}`);
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: OPENROUTER_MODEL_NAME,
            messages: [
                { "role": "system", "content": "You are an expert AI resume analyzer. Output only valid JSON." },
                { "role": "user", "content": prompt }
            ],
            // Optional: Add temperature, max_tokens, etc. if needed
            // temperature: 0.7,
            // max_tokens: 2000, // Adjust based on expected output size and model limits
            response_format: { type: "json_object" } // Some models support this for enforcing JSON output
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                // Recommended headers by OpenRouter
                'HTTP-Referer': YOUR_SITE_URL,
                'X-Title': YOUR_APP_NAME
            }
        });

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const messageContent = response.data.choices[0].message.content;
            console.log("Raw AI Response:", messageContent);

            try {
                // Attempt to parse the JSON directly
                let analysisResult = JSON.parse(messageContent);

                // Basic validation of structure (can be expanded)
                if (typeof analysisResult.overallImpression !== 'string') {
                    console.warn("AI response might not be in the expected JSON format. Falling back to text.");
                    // Fallback or more robust parsing might be needed if models are inconsistent
                    return { error: "AI response format unexpected", rawResponse: messageContent };
                }
                return analysisResult;

            } catch (parseError) {
                console.error('Error parsing AI JSON response:', parseError);
                console.error('Problematic AI Response:', messageContent);
                // Try to find JSON within markdown-like fences if the model didn't strictly follow instructions
                const jsonMatch = messageContent.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch && jsonMatch[1]) {
                    try {
                        console.log("Attempting to parse JSON from markdown block.");
                        return JSON.parse(jsonMatch[1]);
                    } catch (nestedParseError) {
                        console.error('Error parsing JSON from markdown block:', nestedParseError);
                        throw new Error(`AI response was not valid JSON, even after attempting to extract from markdown. Raw: ${messageContent.substring(0,500)}`);
                    }
                }
                throw new Error(`AI response was not valid JSON. Raw response: ${messageContent.substring(0,500)}`);
            }
        } else {
            console.error('Invalid or empty response from OpenRouter:', response.data);
            throw new Error('No analysis content received from AI service.');
        }
    } catch (error) {
        console.error('Error calling OpenRouter API:', error.response ? error.response.data : error.message);
        let errorMessage = 'Failed to get analysis from AI service.';
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
            errorMessage += ` Details: ${error.response.data.error.message}`;
        } else if (error.message) {
             errorMessage += ` Details: ${error.message}`;
        }
        throw new Error(errorMessage);
    }
}

module.exports = {
    analyzeResumeWithAI,
};