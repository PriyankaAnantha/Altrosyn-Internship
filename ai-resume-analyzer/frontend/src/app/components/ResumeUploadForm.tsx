
  // frontend/src/app/components/ResumeUploadForm.tsx
  'use client'; // This component uses client-side hooks (useState, etc.)

  import React, { useState, ChangeEvent, FormEvent } from 'react';
  import { formatBytes } from '@/lib/utils'; // Helper for formatting file size

  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']; // PDF and DOCX

  // Define a type for the analysis result (placeholder for Day 1)
  interface AnalysisResult {
      message: string;
      fileName?: string;
      fileSize?: number;
      jobDescriptionProvided?: boolean;
      jobDescriptionPreview?: string;
      analysis?: {
          atsScore: string;
          overallFeedback: string;
      };
      logId?: string;
      // Add more fields as your AI analysis evolves
  }

  export default function ResumeUploadForm() {
      const [resumeFile, setResumeFile] = useState<File | null>(null);
      const [jobDescription, setJobDescription] = useState<string>('');
      const [isLoading, setIsLoading] = useState<boolean>(false);
      const [error, setError] = useState<string | null>(null);
      const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
      const [fileName, setFileName] = useState<string>('');

      const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (file) {
              // Client-side validation
              if (file.size > MAX_FILE_SIZE_BYTES) {
                  setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB. Your file is ${formatBytes(file.size)}.`);
                  setResumeFile(null);
                  setFileName('');
                  event.target.value = ''; // Reset file input
                  return;
              }
              if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                  setError('Invalid file type. Please upload a PDF or DOCX file.');
                  setResumeFile(null);
                  setFileName('');
                  event.target.value = ''; // Reset file input
                  return;
              }
              setResumeFile(file);
              setFileName(file.name);
              setError(null); // Clear previous errors
              setAnalysisResult(null); // Clear previous results
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
                  // Headers are not strictly necessary for FormData with fetch,
                  // as the browser will set Content-Type to multipart/form-data automatically.
              });

              const data: AnalysisResult = await response.json();

              if (!response.ok) {
                  setError(data.message || `Error: ${response.statusText}`);
                  setAnalysisResult(null);
              } else {
                  setAnalysisResult(data); // Store the static analysis from Day 1
              }
          } catch (err) {
              console.error('Upload failed:', err);
              setError('Upload failed. Please check your connection or try again later.');
              setAnalysisResult(null);
          } finally {
              setIsLoading(false);
          }
      };

      return (
          <div className="w-full max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Upload Your Resume</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                      <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-700 mb-1">
                          Resume File (PDF or DOCX, Max {MAX_FILE_SIZE_MB}MB)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                  <label
                                      htmlFor="resume-upload-input"
                                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                  >
                                      <span>Upload a file</span>
                                      <input id="resume-upload-input" name="resumeFile" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx" />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PDF, DOCX up to {MAX_FILE_SIZE_MB}MB</p>
                              {fileName && <p className="text-sm text-green-600 pt-2">Selected: {fileName}</p>}
                          </div>
                      </div>
                  </div>

                  <div>
                      <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
                          Job Description (Optional)
                      </label>
                      <div className="mt-1">
                          <textarea
                              id="jobDescription"
                              name="jobDescription"
                              rows={6}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                              placeholder="Paste the job description here for tailored feedback and job matching analysis..."
                              value={jobDescription}
                              onChange={(e) => setJobDescription(e.target.value)}
                          />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                          Providing a job description helps the AI give more specific feedback.
                      </p>
                  </div>

                  {error && (
                      <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                          <p>{error}</p>
                      </div>
                  )}

                  <div>
                      <button
                          type="submit"
                          disabled={isLoading || !resumeFile}
                          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                          {isLoading ? (
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                          ) : 'Upload and Analyze'}
                      </button>
                  </div>
              </form>

              {/* Results Section (Placeholder for Day 1, will be expanded in Day 2) */}
              {isLoading && (
                  <div className="mt-8 p-4 text-center">
                      <p className="text-lg text-blue-600">Processing your resume... Please wait.</p>
                      {/* You can add a more sophisticated loader here later */}
                  </div>
              )}

              {analysisResult && !isLoading && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow">
                      <h3 className="text-xl font-semibold text-gray-700 mb-4">Analysis Results (Placeholder)</h3>
                      <div className="space-y-3 text-sm text-gray-600">
                          <p><strong>Status:</strong> {analysisResult.message}</p>
                          {analysisResult.fileName && <p><strong>File Name:</strong> {analysisResult.fileName}</p>}
                          {analysisResult.fileSize && <p><strong>File Size:</strong> {formatBytes(analysisResult.fileSize)}</p>}
                          <p><strong>Job Description Provided:</strong> {analysisResult.jobDescriptionProvided ? 'Yes' : 'No'}</p>
                          {analysisResult.jobDescriptionPreview && <p><strong>JD Preview:</strong> {analysisResult.jobDescriptionPreview}</p>}
                          {analysisResult.analysis && (
                              <>
                                  <p><strong>Overall Feedback:</strong> {analysisResult.analysis.overallFeedback}</p>
                                  <p><strong>ATS Score (Placeholder):</strong> {analysisResult.analysis.atsScore}</p>
                              </>
                          )}
                          {analysisResult.logId && <p className="text-xs text-gray-500">Log ID: {analysisResult.logId}</p>}
                      </div>
                  </div>
              )}
          </div>
      );
  }
 