// backend/services/aiAnalysisService.js
require('dotenv').config();
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// For Mixtral based models, context window is usually 32k.
// nousresearch/nous-hermes-2-mixtral-8x7b-dpo is a good Mixtral model, but not free.
// Let's stick with a free one that has a decent window if possible or be mindful of limits.
// mistralai/mistral-7b-instruct (via OpenRouter :free or regular) has ~8k context.
// Some other free models might have smaller windows (e.g. 4k).
// For this example, let's assume an effective model context window of around 7000 tokens for input + output.
// We'll budget for prompt instructions, and the variable resume/JD text.
const OPENROUTER_MODEL_NAME = process.env.OPENROUTER_MODEL_NAME || 'mistralai/mistral-7b-instruct:free';
const YOUR_SITE_URL = "http://localhost:3000"; // Or your deployed frontend URL
const YOUR_APP_NAME = "AI Resume Analyzer";

// Rough estimate: 1 token ~ 4 characters.
// Let's set a max character limit for resume + JD combined, aiming for ~5000-6000 tokens.
// This leaves ~1000-2000 tokens for the prompt itself and the JSON response.
// Adjust this based on the model you primarily use and observe its limits.
// For Mixtral 8x7B (32k context), you could make this much larger, e.g., 100,000 chars (approx 25k tokens)
// For mistralai/mistral-7b-instruct (8k context), let's target ~20,000 characters (~5k tokens) for content.
const MAX_CONTENT_CHARACTERS = 20000; // Max characters for (resumeText + jobDescriptionText)
const MAX_RESUME_CHARACTERS = 15000; // Max characters for resume if JD is also long
const MAX_JD_CHARACTERS = 5000;   // Max characters for JD

if (!OPENROUTER_API_KEY) {
    console.error("FATAL ERROR: OPENROUTER_API_KEY is not set in .env file.");
}

/**
 * Truncates text to a maximum number of characters, trying to preserve meaningful content.
 * For resumes, it tries to keep the beginning and end.
 * @param {string} text The text to truncate.
 * @param {number} maxLength The maximum character length.
 * @param {boolean} isResume Whether the text is a resume (for smarter truncation).
 * @returns {{truncatedText: string, wasTruncated: boolean}}
 */
function smartTruncate(text, maxLength, isResume = false) {
    if (text.length <= maxLength) {
        return { truncatedText: text, wasTruncated: false };
    }

    if (isResume) {
        // Keep, for example, the first 60% and the last 30%
        const beginningLength = Math.floor(maxLength * 0.6);
        const endLength = Math.floor(maxLength * 0.3);
        const beginning = text.substring(0, beginningLength);
        const end = text.substring(text.length - endLength);
        return {
            truncatedText: `${beginning}\n\n... [Resume content truncated due to length] ...\n\n${end}`,
            wasTruncated: true
        };
    } else {
        // Simple truncation for JD or other texts
        return {
            truncatedText: text.substring(0, maxLength - 30) + "\n... [Content truncated] ...", // -30 for the message
            wasTruncated: true
        };
    }
}


/**
 * Analyzes resume text using OpenRouter LLM.
 * @param {string} resumeText - The extracted text from the resume.
 * @param {string} [jobDescriptionTextParam] - Optional: The text of the job description.
 * @returns {Promise<Object>} The structured AI analysis.
 * @throws {Error} If the AI analysis fails.
 */
async function analyzeResumeWithAI(resumeText, jobDescriptionTextParam) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("AI Service is not configured. Missing API Key.");
    }

    let finalResumeText = resumeText;
    let finalJdText = jobDescriptionTextParam || '';
    let resumeWasTruncated = false;
    let jdWasTruncated = false;

    // Truncate JD if it's too long
    if (finalJdText.length > MAX_JD_CHARACTERS) {
        const truncationResult = smartTruncate(finalJdText, MAX_JD_CHARACTERS, false);
        finalJdText = truncationResult.truncatedText;
        jdWasTruncated = truncationResult.wasTruncated;
        console.warn(`Job description was truncated to ${MAX_JD_CHARACTERS} characters.`);
    }

    // Calculate remaining character budget for resume
    const remainingCharsForResume = MAX_CONTENT_CHARACTERS - finalJdText.length;
    const currentMaxResumeChars = Math.min(MAX_RESUME_CHARACTERS, remainingCharsForResume);

    // Truncate resume if it's too long or exceeds combined budget
    if (finalResumeText.length > currentMaxResumeChars) {
        const truncationResult = smartTruncate(finalResumeText, currentMaxResumeChars, true);
        finalResumeText = truncationResult.truncatedText;
        resumeWasTruncated = truncationResult.wasTruncated;
        console.warn(`Resume text was truncated to ${currentMaxResumeChars} characters.`);
    }


    let prompt;
    // Base prompt structure (same as before)
    const basePrompt = `You are an expert AI resume analyzer. Analyze the following resume text.
Provide a detailed, structured analysis in JSON format. The JSON output MUST be a single, valid JSON object and nothing else. Do not include any markdown formatting (like \`\`\`json) around the JSON output.

The JSON structure should include:
- "overallImpression": "string (1-2 sentences summary)"
- "strengths": ["string array of key strengths"]
- "areasForImprovement": ["string array of specific, actionable suggestions"]
- "atsFriendliness": { "score": "number (0-100, estimate)", "suggestions": ["string array for ATS optimization"] }
- "relevantSkills": ["string array of skills extracted from the resume relevant to general job applications"]
- "formattingAndStructure": { "clarity": "string (e.g., Good, Fair, Needs Improvement)", "suggestions": ["string array for formatting improvements"] }`;

    // Add truncation notes to the prompt if applicable
    let truncationMessage = "";
    if (resumeWasTruncated) {
        truncationMessage += "Note: The provided resume text was long and has been truncated to fit processing limits. Focus your analysis on the provided text, but be aware some details might be missing. ";
    }
    if (jdWasTruncated) {
        truncationMessage += "Note: The provided job description text was long and has been truncated. Base your job-fit analysis on the provided portion. ";
    }
    if (truncationMessage) {
        // Add to system message or user prompt. Let's add to user prompt for visibility.
        truncationMessage = `\n\nIMPORTANT PROCESSING NOTE: ${truncationMessage.trim()}\n`;
    }

    if (finalJdText && finalJdText.trim() !== '') {
        prompt = `${basePrompt}
- "jobDescriptionMatch": {
    "matchScore": "number (0-100, estimate of how well the resume matches the JD)",
    "matchingKeywords": ["string array of keywords from JD found in resume"],
    "missingKeywords": ["string array of important keywords from JD NOT found in resume"],
    "alignmentFeedback": "string (feedback on how well the resume aligns with the JD and suggestions for improvement)"
  }
${truncationMessage}
Resume Text:
---
${finalResumeText}
---

Job Description:
---
${finalJdText}
---
`;
    } else {
        prompt = `${basePrompt}
${truncationMessage}
Resume Text:
---
${finalResumeText}
---
Provide general feedback as no job description was provided.
`;
    }

    try {
        console.log(`Sending request to OpenRouter with model: ${OPENROUTER_MODEL_NAME}. Estimated content length (chars): Resume=${finalResumeText.length}, JD=${finalJdText.length}`);
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: OPENROUTER_MODEL_NAME,
            messages: [
                { "role": "system", "content": "You are an expert AI resume analyzer. Output only valid JSON. Do not add any explanatory text outside the JSON structure itself." },
                { "role": "user", "content": prompt }
            ],
            response_format: { type: "json_object" } // Request JSON output
            // temperature: 0.5, // Lower temperature for more deterministic JSON output
            // max_tokens: 3000, // Max tokens for the *response*. Adjust if your JSON is very large.
                              // Be careful with this, as it can cut off valid JSON.
                              // Models like Mixtral usually handle large JSON outputs well if the input context allows.
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': YOUR_SITE_URL,
                'X-Title': YOUR_APP_NAME
            },
            timeout: 90000 // Increase timeout to 90 seconds for potentially longer processing
        });

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const messageContent = response.data.choices[0].message.content;
            // console.log("Raw AI Response:", messageContent); // Log for debugging if needed

            try {
                let analysisResult = JSON.parse(messageContent);
                // Add a flag if content was truncated so frontend can inform user
                if (resumeWasTruncated || jdWasTruncated) {
                    analysisResult.truncationInfo = {
                        resumeTruncated: resumeWasTruncated,
                        jdTruncated: jdWasTruncated,
                        message: "Note: Some content was truncated due to length. Analysis is based on the abridged text."
                    };
                }
                return analysisResult;

            } catch (parseError) {
                console.error('Error parsing AI JSON response:', parseError);
                console.error('Problematic AI Response (first 500 chars):', messageContent.substring(0,500));
                // Try to find JSON within markdown-like fences
                const jsonMatch = messageContent.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch && jsonMatch[1]) {
                    try {
                        console.log("Attempting to parse JSON from markdown block.");
                        let analysisResult = JSON.parse(jsonMatch[1]);
                        if (resumeWasTruncated || jdWasTruncated) {
                           analysisResult.truncationInfo = { /* ... as above ... */ };
                        }
                        return analysisResult;
                    } catch (nestedParseError) {
                        console.error('Error parsing JSON from markdown block:', nestedParseError);
                        throw new Error(`AI response was not valid JSON, even after attempting to extract from markdown. Raw (start): ${messageContent.substring(0,200)}`);
                    }
                }
                throw new Error(`AI response was not valid JSON. Raw response (start): ${messageContent.substring(0,200)}`);
            }
        } else {
            console.error('Invalid or empty response from OpenRouter:', response.data);
            throw new Error('No analysis content received from AI service.');
        }
    } catch (error) {
        // ... (rest of the error handling, same as before)
        console.error('Error calling OpenRouter API:', error.response ? (error.response.data || error.response.statusText) : error.message);
        let errorMessage = 'Failed to get analysis from AI service.';
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
            errorMessage += ` Details: ${error.response.data.error.message}`;
        } else if (error.message) {
             errorMessage += ` Details: ${error.message}`;
        }
        // Check for context length exceeded errors specifically if the API provides such info
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.code === 'context_length_exceeded') {
            errorMessage = "The resume or job description is too long for the AI model to process, even after attempting to shorten it. Please try with a more concise version.";
        }
        throw new Error(errorMessage);
    }
}

module.exports = {
    analyzeResumeWithAI,
};