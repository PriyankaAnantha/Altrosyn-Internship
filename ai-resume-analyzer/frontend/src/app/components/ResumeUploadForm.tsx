
// frontend/src/app/components/ResumeUploadForm.tsx
'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { formatBytes } from '@/lib/utils';
import { DocumentArrowUpIcon, InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, LightBulbIcon, BoltIcon } from '@heroicons/react/24/outline'; // More icons

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES_MIME = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
const ALLOWED_FILE_TYPES_DISPLAY = ".pdf, .doc, .docx";

// ... (Interfaces: TruncationInfo, AIAnalysis, UploadResponse - remain the same as in your Day 2 final code) ...
interface TruncationInfo {
    resumeTruncated?: boolean;
    jdTruncated?: boolean;
    message?: string;
}
interface AIAnalysis {
    overallImpression?: string;
    strengths?: string[];
    areasForImprovement?: string[];
    atsFriendliness?: { score?: number | string; suggestions?: string[]; };
    relevantSkills?: string[];
    formattingAndStructure?: { clarity?: string; suggestions?: string[]; };
    jobDescriptionMatch?: { matchScore?: number | string; matchingKeywords?: string[]; missingKeywords?: string[]; alignmentFeedback?: string; };
    error?: string; rawResponse?: string; truncationInfo?: TruncationInfo;
}
interface UploadResponse {
    message: string; fileName?: string; analysis?: AIAnalysis; logId?: string;
    errorType?: string; details?: string;
}


export default function ResumeUploadForm() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<UploadResponse | null>(null);
    const [fileNameDisplay, setFileNameDisplay] = useState<string>('');

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => { /* Same as before */
        const file = event.target.files?.[0];
        setAnalysisResult(null); setError(null);
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setError(`File is too large (max ${MAX_FILE_SIZE_MB}MB). Your file: ${formatBytes(file.size)}.`);
                setResumeFile(null); setFileNameDisplay(''); event.target.value = ''; return;
            }
            if (!ALLOWED_FILE_TYPES_MIME.includes(file.type)) {
                setError(`Invalid file type. Please upload ${ALLOWED_FILE_TYPES_DISPLAY}. You uploaded: ${file.type || 'unknown'}`);
                setResumeFile(null); setFileNameDisplay(''); event.target.value = ''; return;
            }
            setResumeFile(file); setFileNameDisplay(file.name);
        } else {
            setResumeFile(null); setFileNameDisplay('');
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => { /* Same as before */
        event.preventDefault();
        if (!resumeFile) { setError('Please select a resume file.'); return; }
        setError(null); setIsLoading(true); setAnalysisResult(null);
        const formData = new FormData();
        formData.append('resumeFile', resumeFile);
        formData.append('jobDescription', jobDescription);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
            const response = await fetch(`${backendUrl}/upload`, { method: 'POST', body: formData });
            const data: UploadResponse = await response.json();
            if (!response.ok) {
                setError(data.message || `Error: ${response.statusText} (Status: ${response.status})`);
            } else {
                setAnalysisResult(data);
                 // Smooth scroll to results after a short delay to allow rendering
                setTimeout(() => {
                    document.getElementById('analysis-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Upload failed. Network error or server issue. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const Section = ({ title, children, icon: Icon, iconBgColor = "bg-gradient-purple-pink" }: { title: string, children: React.ReactNode, icon?: React.ElementType, iconBgColor?: string }) => (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden">
            <div className={`flex items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 ${Icon ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-slate-100 dark:bg-slate-700/50'}`}>
                {Icon && (
                    <div className={`mr-4 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg ${iconBgColor} text-white`}>
                        <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                )}
                <h4 className="font-heading text-xl font-semibold text-slate-800 dark:text-white">{title}</h4>
            </div>
            <div className="p-6 space-y-4">
                {children}
            </div>
        </div>
    );

    const ListItem = ({ item, type = 'default' }: { item: string, type?: 'strength' | 'improvement' | 'default' }) => {
        let iconColor = "text-slate-400 dark:text-slate-500";
        let IconComponent = InformationCircleIcon; // Default icon

        if (type === 'strength') {
            iconColor = "text-green-500 dark:text-green-400";
            IconComponent = CheckCircleIcon;
        } else if (type === 'improvement') {
            iconColor = "text-yellow-500 dark:text-yellow-400"; // Changed from amber to yellow for better contrast
            IconComponent = LightBulbIcon; // Or ExclamationTriangleIcon for more critical
        }

        return (
            <div className="flex items-start text-slate-600 dark:text-slate-300">
                <IconComponent className={`flex-shrink-0 h-5 w-5 ${iconColor} mr-2 mt-0.5`} aria-hidden="true" />
                <span>{item}</span>
            </div>
        );
    };


    return (
        <div className="w-full max-w-2xl mx-auto"> {/* Reduced max-width for form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
                <div>
                    <label htmlFor="resume-upload-input" className="block text-lg font-semibold font-heading text-slate-800 dark:text-white mb-2">
                        1. Upload Your Resume
                    </label>
                    <label htmlFor="resume-upload-input" // Make the whole area clickable
                        className={`mt-1 flex flex-col items-center justify-center w-full px-6 py-10 border-2 ${error && !resumeFile ? 'border-red-500 hover:border-red-600' : 'border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-pink-400'} border-dashed rounded-xl transition-colors duration-200 cursor-pointer bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50`}
                    >
                        <input id="resume-upload-input" name="resumeFile" type="file" className="sr-only" onChange={handleFileChange} accept={ALLOWED_FILE_TYPES_DISPLAY} />
                        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            <span className="text-gradient-purple-pink font-semibold">Click to browse</span> or drag & drop
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {ALLOWED_FILE_TYPES_DISPLAY.toUpperCase()} (MAX. {MAX_FILE_SIZE_MB}MB)
                        </p>
                        {fileNameDisplay && (
                            <div className="mt-4 text-sm font-medium text-purple-700 dark:text-pink-400 bg-purple-50 dark:bg-pink-900/20 px-4 py-2 rounded-lg shadow-sm">
                                Selected: {fileNameDisplay}
                            </div>
                        )}
                    </label>
                </div>

                <div>
                    <label htmlFor="jobDescription" className="block text-lg font-semibold font-heading text-slate-800 dark:text-white mb-2">
                        2. Add Job Description <span className="text-sm font-normal text-slate-500 dark:text-slate-400">(Optional)</span>
                    </label>
                    <textarea
                        id="jobDescription"
                        name="jobDescription"
                        rows={7}
                        className="shadow-sm focus:ring-pink-500 focus:border-pink-500 mt-1 block w-full sm:text-sm border border-slate-300 dark:border-slate-600 rounded-xl p-4 bg-slate-50 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder-slate-400 transition-colors duration-150"
                        placeholder="Pasting a job description here provides highly tailored feedback and keyword analysis..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="flex items-start p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-md shadow-md">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-600 mr-3 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-red-700 dark:text-red-200">An Error Occurred</p>
                            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                        </div>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading || !resumeFile}
                        className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base sm:text-lg font-semibold text-white bg-gradient-purple-pink hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing Your Resume...
                            </>
                        ) : 'Get My AI Analysis'}
                    </button>
                </div>
            </form>

            {/* Loading State - more playful */}
            {isLoading && (
                <div className="mt-12 p-8 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
                    <div className="animate-bounce mb-4">
                        {/* You can use a more playful SVG or even a Lottie animation here */}
                        <svg className="mx-auto h-16 w-16 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75M17 13.75L15.75 15M17 13.75L18.25 15M15.75 15L17 16.25M17 16.25L18.25 15M17 16.25L15.75 17.5M17 16.25L18.25 17.5" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25L9.813 2.404a4.5 4.5 0 013.09-3.09L15.75 0M9 5.25L6.187 2.404a4.5 4.5 0 00-3.09-3.09L0 0" />
                        </svg>
                    </div>
                    <p className="font-heading text-2xl font-semibold text-gradient-purple-pink">
                        Conjuring AI Insights...
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-sm mx-auto">
                        Our AI is meticulously reviewing your resume. This magical process usually takes 10-30 seconds. Please wait!
                    </p>
                     <div className="mt-6 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-gradient-purple-pink h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div> {/* Simple pulse or indeterminate bar */}
                    </div>
                </div>
            )}

            {/* Results Section */}
            {analysisResult && analysisResult.analysis && !isLoading && (
                <div id="analysis-results-section" className="mt-12 space-y-8">
                    <div className="text-center">
                        <h3 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">
                            Here's Your AI Feedback!
                        </h3>
                        {analysisResult.fileName && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Analysis for: <span className="font-medium">{analysisResult.fileName}</span>
                            </p>
                        )}
                    </div>

                    {analysisResult.analysis.truncationInfo?.message && (
                        <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-md shadow">
                            <InformationCircleIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mr-3 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-yellow-700 dark:text-yellow-200">Content Notice</p>
                                <p className="text-sm text-yellow-600 dark:text-yellow-300">{analysisResult.analysis.truncationInfo.message}</p>
                            </div>
                        </div>
                    )}

                    {analysisResult.analysis.error && (
                        <Section title="Analysis Error" icon={ExclamationTriangleIcon} iconBgColor="bg-red-500">
                            <p className="text-red-600 dark:text-red-300 font-medium">{analysisResult.analysis.error}</p>
                            {analysisResult.analysis.rawResponse && ( /* Same raw response details as before */
                                <details className="mt-3 text-xs">
                                    <summary className="cursor-pointer text-slate-500 dark:text-slate-400 hover:underline">Show raw AI response</summary>
                                    <pre className="mt-1 p-3 bg-slate-100 dark:bg-slate-700/50 rounded text-slate-500 dark:text-slate-400 text-xs whitespace-pre-wrap break-all overflow-x-auto">
                                        {analysisResult.analysis.rawResponse}
                                    </pre>
                                </details>
                            )}
                        </Section>
                    )}

                    {analysisResult.analysis.overallImpression && (
                        <Section title="Overall Impression" icon={LightBulbIcon}>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">{analysisResult.analysis.overallImpression}</p>
                        </Section>
                    )}
                    {analysisResult.analysis.strengths && analysisResult.analysis.strengths.length > 0 && (
                        <Section title="Key Strengths" icon={CheckCircleIcon} iconBgColor="bg-green-500">
                            <ul className="space-y-2">
                                {analysisResult.analysis.strengths.map((item, index) => <ListItem key={`strength-${index}`} item={item} type="strength"/>)}
                            </ul>
                        </Section>
                    )}
                    {analysisResult.analysis.areasForImprovement && analysisResult.analysis.areasForImprovement.length > 0 && (
                        <Section title="Areas for Improvement" icon={ExclamationTriangleIcon} iconBgColor="bg-yellow-500">
                             <ul className="space-y-2">
                                {analysisResult.analysis.areasForImprovement.map((item, index) => <ListItem key={`improvement-${index}`} item={item} type="improvement" />)}
                            </ul>
                        </Section>
                    )}
                    {/* ... Other sections (Relevant Skills, ATS, Formatting, JD Match) - Style similarly ... */}
                    {/* Example for Relevant Skills: */}
                     {analysisResult.analysis.relevantSkills && analysisResult.analysis.relevantSkills.length > 0 && (
                        <Section title="Relevant Skills Identified" icon={BoltIcon}>
                            <div className="flex flex-wrap gap-2.5">
                                {analysisResult.analysis.relevantSkills.map((skill, index) => (
                                    <span key={`skill-${index}`} className="font-medium text-sm px-3.5 py-1.5 rounded-full shadow-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-700/30 dark:to-pink-700/30 dark:text-pink-300 transition-transform hover:scale-105">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* ATS Friendliness */}
                    {analysisResult.analysis.atsFriendliness && (
                        <Section title="ATS Friendliness & Optimization" icon={DocumentArrowUpIcon}>
                            {typeof analysisResult.analysis.atsFriendliness.score !== 'undefined' && (
                                <div className="mb-4 text-center">
                                   <span className="block text-slate-600 dark:text-slate-400 text-sm">ATS Compatibility Score</span>
                                   <strong className="font-heading block text-5xl font-bold text-gradient-purple-pink mt-1">
                                     {analysisResult.analysis.atsFriendliness.score}
                                     {typeof analysisResult.analysis.atsFriendliness.score === 'number' ? <span className="text-2xl text-slate-500 dark:text-slate-400">/100</span> : ''}
                                   </strong>
                                </div>
                            )}
                            {analysisResult.analysis.atsFriendliness.suggestions && analysisResult.analysis.atsFriendliness.suggestions.length > 0 && (
                                <>
                                    <h5 className="font-heading text-lg font-semibold text-slate-700 dark:text-slate-200 mt-4 mb-2">Optimization Tips:</h5>
                                    <ul className="space-y-2">
                                        {analysisResult.analysis.atsFriendliness.suggestions.map((item, index) => <ListItem key={`ats-${index}`} item={item} />)}
                                    </ul>
                                </>
                            )}
                        </Section>
                    )}

                    {/* Formatting & Structure */}
                     {analysisResult.analysis.formattingAndStructure && (
                        <Section title="Formatting & Structure" icon={LightBulbIcon}>
                            {analysisResult.analysis.formattingAndStructure.clarity && (
                                 <p className="text-slate-600 dark:text-slate-300 mb-3">
                                    Clarity & Readability: <strong className="font-semibold">{analysisResult.analysis.formattingAndStructure.clarity}</strong>
                                </p>
                            )}
                            {analysisResult.analysis.formattingAndStructure.suggestions && analysisResult.analysis.formattingAndStructure.suggestions.length > 0 && (
                                <>
                                    <h5 className="font-heading text-lg font-semibold text-slate-700 dark:text-slate-200 mt-2 mb-2">Suggestions:</h5>
                                    <ul className="space-y-2">
                                        {analysisResult.analysis.formattingAndStructure.suggestions.map((item, index) => <ListItem key={`format-${index}`} item={item} />)}
                                    </ul>
                                </>
                            )}
                        </Section>
                    )}

                    {/* Job Description Match */}
                    {analysisResult.analysis.jobDescriptionMatch && (
                        <Section title="Job Description Alignment" icon={CheckCircleIcon} iconBgColor="bg-gradient-to-r from-purple-500 to-pink-500">
                             {typeof analysisResult.analysis.jobDescriptionMatch.matchScore !== 'undefined' && (
                                <div className="mb-4 text-center">
                                    <span className="block text-slate-600 dark:text-slate-400 text-sm">Job Fit Score</span>
                                    <strong className="font-heading block text-5xl font-bold text-gradient-purple-pink mt-1">
                                        {analysisResult.analysis.jobDescriptionMatch.matchScore}
                                        {typeof analysisResult.analysis.jobDescriptionMatch.matchScore === 'number' ? <span className="text-2xl text-slate-500 dark:text-slate-400">/100</span> : ''}
                                    </strong>
                                </div>
                            )}
                            {analysisResult.analysis.jobDescriptionMatch.alignmentFeedback && (
                                <p className="text-slate-600 dark:text-slate-300 my-4 leading-relaxed text-base">{analysisResult.analysis.jobDescriptionMatch.alignmentFeedback}</p>
                            )}
                            {analysisResult.analysis.jobDescriptionMatch.matchingKeywords && analysisResult.analysis.jobDescriptionMatch.matchingKeywords.length > 0 && (
                                <div className="my-3">
                                    <h5 className="font-heading text-lg font-semibold text-green-600 dark:text-green-400 mb-2">Matching Keywords:</h5>
                                    <div className="flex flex-wrap gap-2.5">
                                        {analysisResult.analysis.jobDescriptionMatch.matchingKeywords.map((skill, index) => (
                                            <span key={`jd-match-${index}`} className="font-medium text-sm px-3 py-1.5 rounded-full shadow-sm bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {analysisResult.analysis.jobDescriptionMatch.missingKeywords && analysisResult.analysis.jobDescriptionMatch.missingKeywords.length > 0 && (
                                <div className="my-3">
                                    <h5 className="font-heading text-lg font-semibold text-red-500 dark:text-red-400 mb-2">Missing Keywords:</h5>
                                    <div className="flex flex-wrap gap-2.5">
                                        {analysisResult.analysis.jobDescriptionMatch.missingKeywords.map((skill, index) => (
                                            <span key={`jd-miss-${index}`} className="font-medium text-sm px-3 py-1.5 rounded-full shadow-sm bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Section>
                    )}


                    {analysisResult.logId && (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-6 pb-2">
                            Analysis ID: {analysisResult.logId}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}