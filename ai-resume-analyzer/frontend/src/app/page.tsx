
  // frontend/src/app/page.tsx
  import ResumeUploadForm from './components/ResumeUploadForm';

  export default function HomePage() {
    return (
      <div className="flex flex-col items-center justify-center py-2">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white sm:text-5xl md:text-6xl">
            Get Instant <span className="text-blue-600 dark:text-blue-400">AI Feedback</span> on Your Resume
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
            Upload your resume (and optionally a job description) to receive
            AI-powered insights, helping you land your dream job.
          </p>
        </div>
        <ResumeUploadForm />
      </div>
    );
  }
 