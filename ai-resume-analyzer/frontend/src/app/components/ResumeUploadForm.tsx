// frontend/src/app/components/ResumeUploadForm.tsx
'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { formatBytes } from '@/lib/utils';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

// Interface for truncation information from backend
interface TruncationInfo {
    resumeTruncated?: boolean;
    jdTruncated?: boolean;
    message?: string;
}

// Define the detailed analysis result type based on AI output
interface AIAnalysis {
    overallImpression?: string;
    strengths?: string[];
    areasForImprovement?: string[];
    atsFriendliness?: {
        score?: number | string;
        suggestions?: string[];
    };
    relevantSkills?: string[];
    formattingAndStructure?: {
        clarity?: string;
        suggestions?: string[];
    };
    jobDescriptionMatch?: {
        matchScore?: number | string;
        matchingKeywords?: string[];
        missingKeywords?: string[];
        alignmentFeedback?: string;
    };
    error?: string; // In case AI service itself indicates an error in its structured response
    rawResponse?: string; // For debugging AI's raw output
    truncationInfo?: TruncationInfo; // To inform user about content truncation
}

// Interface for the overall response from our backend /upload endpoint
interface UploadResponse {
    message: string; // General status message from backend
    fileName?: string;
    analysis?: AIAnalysis; // The core AI analysis object
    logId?: string;
    errorType?: string; // Backend-defined error type for client differentiation
    details?: string; // Potentially more error details in dev mode
}

export default function ResumeUploadForm() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null); // For client-side or backend-returned errors
    const [analysisResult, setAnalysisResult] = useState<UploadResponse | null>(null);
    const [fileName, setFileName] = useState<string>('');

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setAnalysisResult(null); // Clear previous results on new file selection
        setError(null); // Clear previous errors

        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB. Your file is ${formatBytes(file.size)}.`);
                setResumeFile(null); setFileName(''); event.target.value = ''; // Reset input
                return;
            }
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
                setResumeFile(null); setFileName(''); event.target.value = ''; // Reset input
                return;
            }
            setResumeFile(file);
            setFileName(file.name);
        } else {
            setResumeFile(null);
            setFileName('');
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!resumeFile) {
            setError('Please select a resume file to upload.');
            return;
        }

        setError(null);
        setIsLoading(true);
        setAnalysisResult(null);

        const formData = new FormData();
        formData.append('resumeFile', resumeFile);
        formData.append('jobDescription', jobDescription);

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
            const response = await fetch(`${backendUrl}/upload`, {
                method: 'POST',
                body: formData,
            });

            const data: UploadResponse = await response.json();

            if (!response.ok) {
                setError(data.message || `Error: ${response.statusText} (Status: ${response.status})`);
            } else {
                setAnalysisResult(data);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Upload failed due to a network error or server issue. Please check your connection or try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const ListItem = ({ item }: { item: string }) => (
        <li className="text-gray-700 dark:text-gray-300 py-1">{item}</li>
    );

    const Section = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
        <div className={`mb-6 p-4 bg-white dark:bg-gray-800 shadow rounded-lg ${className}`}>
            <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">{title}</h4>
            {children}
        </div>
    );

    return (
        <div className="w-full max-w-3xl mx-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                Analyze Your Resume
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md mb-8">
                <div>
                    <label htmlFor="resumeFile-input" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Resume File (PDF, DOC, DOCX - Max {MAX_FILE_SIZE_MB}MB)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                               <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                             </svg>
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label
                                    htmlFor="resume-upload-input" // Corrected: This should match the input id
                                    className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:focus-within:ring-offset-gray-700"
                                >
                                    <span>Upload a file</span>
                                    <input id="resume-upload-input" name="resumeFile" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX up to {MAX_FILE_SIZE_MB}MB</p>
                            {fileName && <p className="text-sm text-green-600 dark:text-green-400 pt-2">Selected: {fileName}</p>}
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Job Description (Optional)
                    </label>
                    <div className="mt-1">
                        <textarea
                            id="jobDescription"
                            name="jobDescription"
                            rows={8}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                            placeholder="Paste the job description here for tailored feedback..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>
                </div>

                {error && ( // Display general errors from file validation or backend
                    <div className="p-3 my-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">
                        <p className="font-semibold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading || !resumeFile}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </div>
                        ) : 'Get AI Analysis'}
                    </button>
                </div>
            </form>

            {isLoading && (
                <div className="mt-8 p-6 text-center bg-white dark:bg-gray-700 rounded-lg shadow-md">
                    <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                        Analyzing your resume, please wait...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        This might take a moment, especially for detailed analysis.
                    </p>
                     <div role="status" className="mt-4 flex justify-center">
                         <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                             <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                             <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                         </svg>
                         <span className="sr-only">Loading...</span>
                     </div>
                </div>
            )}

            {/* Results Section START */}
            {analysisResult && analysisResult.analysis && !isLoading && (
                <div className="mt-10">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
                        Your AI Resume Analysis
                    </h3>
                    {analysisResult.fileName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            For file: <span className="font-medium">{analysisResult.fileName}</span>
                        </p>
                    )}

                    {/* THIS IS WHERE THE TRUNCATION NOTICE IS ADDED */}
                    {analysisResult.analysis.truncationInfo && analysisResult.analysis.truncationInfo.message && (
                        <div className="mb-6 p-3 bg-yellow-100 dark:bg-yellow-800 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-100 rounded-md">
                            <p className="font-semibold">Content Notice:</p>
                            <p>{analysisResult.analysis.truncationInfo.message}</p>
                        </div>
                    )}
                    {/* TRUNCATION NOTICE END */}


                    {analysisResult.analysis.error && ( // Display specific AI analysis errors
                        <Section title="AI Analysis Error" className="border-l-4 border-red-500">
                            <p className="text-red-600 dark:text-red-400">{analysisResult.analysis.error}</p>
                            {analysisResult.analysis.rawResponse && (
                                <details className="mt-2 text-xs">
                                    <summary className="cursor-pointer hover:underline">Raw AI Response (for debugging)</summary>
                                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs whitespace-pre-wrap break-all">
                                        {analysisResult.analysis.rawResponse}
                                    </pre>
                                </details>
                            )}
                        </Section>
                    )}

                    {analysisResult.analysis.overallImpression && (
                        <Section title="Overall Impression">
                            <p className="text-gray-700 dark:text-gray-300">{analysisResult.analysis.overallImpression}</p>
                        </Section>
                    )}

                    {analysisResult.analysis.strengths && analysisResult.analysis.strengths.length > 0 && (
                        <Section title="Key Strengths">
                            <ul className="list-disc list-inside space-y-1">
                                {analysisResult.analysis.strengths.map((item, index) => <ListItem key={`strength-${index}`} item={item} />)}
                            </ul>
                        </Section>
                    )}

                    {analysisResult.analysis.areasForImprovement && analysisResult.analysis.areasForImprovement.length > 0 && (
                        <Section title="Areas for Improvement">
                            <ul className="list-disc list-inside space-y-1">
                                {analysisResult.analysis.areasForImprovement.map((item, index) => <ListItem key={`improvement-${index}`} item={item} />)}
                            </ul>
                        </Section>
                    )}

                    {analysisResult.analysis.relevantSkills && analysisResult.analysis.relevantSkills.length > 0 && (
                        <Section title="Relevant Skills Identified">
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.analysis.relevantSkills.map((skill, index) => (
                                    <span key={`skill-${index}`} className="bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </Section>
                    )}

                    {analysisResult.analysis.atsFriendliness && (
                        <Section title="ATS Friendliness">
                            {typeof analysisResult.analysis.atsFriendliness.score !== 'undefined' && (
                                <p className="text-gray-700 dark:text-gray-300 mb-2">
                                    Estimated Score: <strong className="text-lg text-indigo-600 dark:text-indigo-400">{analysisResult.analysis.atsFriendliness.score}</strong>
                                    {typeof analysisResult.analysis.atsFriendliness.score === 'number' && '/100'}
                                </p>
                            )}
                            {analysisResult.analysis.atsFriendliness.suggestions && analysisResult.analysis.atsFriendliness.suggestions.length > 0 && (
                                <>
                                    <h5 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-1">Suggestions:</h5>
                                    <ul className="list-disc list-inside space-y-1">
                                        {analysisResult.analysis.atsFriendliness.suggestions.map((item, index) => <ListItem key={`ats-${index}`} item={item} />)}
                                    </ul>
                                </>
                            )}
                        </Section>
                    )}

                    {analysisResult.analysis.formattingAndStructure && (
                        <Section title="Formatting & Structure">
                            {analysisResult.analysis.formattingAndStructure.clarity && (
                                 <p className="text-gray-700 dark:text-gray-300 mb-2">
                                    Clarity: <strong className="font-semibold">{analysisResult.analysis.formattingAndStructure.clarity}</strong>
                                </p>
                            )}
                            {analysisResult.analysis.formattingAndStructure.suggestions && analysisResult.analysis.formattingAndStructure.suggestions.length > 0 && (
                                <>
                                    <h5 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-1">Suggestions:</h5>
                                    <ul className="list-disc list-inside space-y-1">
                                        {analysisResult.analysis.formattingAndStructure.suggestions.map((item, index) => <ListItem key={`format-${index}`} item={item} />)}
                                    </ul>
                                </>
                            )}
                        </Section>
                    )}

                    {analysisResult.analysis.jobDescriptionMatch && (
                        <Section title="Job Description Alignment">
                            {typeof analysisResult.analysis.jobDescriptionMatch.matchScore !== 'undefined' && (
                                <p className="text-gray-700 dark:text-gray-300 mb-2">
                                    Estimated Match Score: <strong className="text-lg text-teal-600 dark:text-teal-400">{analysisResult.analysis.jobDescriptionMatch.matchScore}</strong>
                                    {typeof analysisResult.analysis.jobDescriptionMatch.matchScore === 'number' && '/100'}
                                </p>
                            )}
                            {analysisResult.analysis.jobDescriptionMatch.alignmentFeedback && (
                                <p className="text-gray-700 dark:text-gray-300 my-2">{analysisResult.analysis.jobDescriptionMatch.alignmentFeedback}</p>
                            )}
                            {analysisResult.analysis.jobDescriptionMatch.matchingKeywords && analysisResult.analysis.jobDescriptionMatch.matchingKeywords.length > 0 && (
                                <div className="my-3">
                                    <h5 className="text-md font-semibold text-green-700 dark:text-green-400 mb-1">Matching Keywords:</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.analysis.jobDescriptionMatch.matchingKeywords.map((skill, index) => (
                                            <span key={`jd-match-${index}`} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {analysisResult.analysis.jobDescriptionMatch.missingKeywords && analysisResult.analysis.jobDescriptionMatch.missingKeywords.length > 0 && (
                                <div className="my-3">
                                    <h5 className="text-md font-semibold text-red-700 dark:text-red-400 mb-1">Missing Keywords:</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.analysis.jobDescriptionMatch.missingKeywords.map((skill, index) => (
                                            <span key={`jd-miss-${index}`} className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Section>
                    )}

                    {analysisResult.logId && (
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
                            Analysis Log ID: {analysisResult.logId}
                        </p>
                    )}
                </div>
            )}
            {/* Results Section END */}
        </div>
    );
}