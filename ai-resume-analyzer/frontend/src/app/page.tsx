// frontend/src/app/page.tsx
import ResumeUploadForm from './components/ResumeUploadForm';
import { CheckCircleIcon, LightBulbIcon, BoltIcon } from '@heroicons/react/24/outline'; // Example icons

const features = [
  {
    name: 'Instant AI Analysis',
    description: 'Get comprehensive feedback on your resume content, structure, and ATS compatibility within seconds.',
    icon: BoltIcon,
  },
  {
    name: 'Keyword Optimization',
    description: 'Identify crucial keywords and ensure your resume aligns perfectly with job descriptions.',
    icon: CheckCircleIcon,
  },
  {
    name: 'Actionable Insights',
    description: 'Receive clear, practical suggestions to improve your resume and boost your chances.',
    icon: LightBulbIcon,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-slate-800 overflow-hidden">
        <div className="absolute inset-0">
          {/* Optional: Subtle background pattern or gradient mesh */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-transparent dark:from-purple-900/10 dark:via-pink-900/10"></div> */}
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="block text-slate-900 dark:text-white">Unlock Your Resume's</span>
            <span className="block text-gradient-purple-pink mt-1 sm:mt-2">Full Potential with AI</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-300">
            Stop guessing what recruiters want. InsightfulCV analyzes your resume, providing
            expert feedback to help you stand out and land your dream job.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <a
              href="#upload-form" // Link to the upload form section
              className="rounded-lg bg-gradient-purple-pink px-6 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
            >
              Analyze My Resume Now
            </a>
            <a
              href="#features" // Link to features section
              className="rounded-lg px-6 py-3 text-base font-semibold leading-7 text-slate-700 dark:text-slate-200 ring-1 ring-slate-300 dark:ring-slate-700 hover:ring-slate-400 dark:hover:ring-slate-600 transition-all duration-200"
            >
              Learn More <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-base font-semibold leading-7 text-purple-600 dark:text-purple-400">
              How It Works
            </h2>
            <p className="mt-2 font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Simple Steps to a Better Resume
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our AI-powered platform makes resume optimization easy. Get personalized feedback and
              actionable advice in minutes.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:gap-y-16 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-200">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-purple-pink text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-xl font-semibold leading-7 text-slate-900 dark:text-white">{feature.name}</h3>
                <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Form Section Wrapper */}
      <section id="upload-form" className="py-16 sm:py-24 bg-white dark:bg-slate-800"> {/* New wrapper */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Ready to Elevate Your Resume?
                </h2>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                    Upload your resume below. Add a job description for even more targeted insights.
                </p>
            </div>
            <ResumeUploadForm />
        </div>
      </section>
    </>
  );
}