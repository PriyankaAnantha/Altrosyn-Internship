// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google"; // Added Lexend for headings
import "./globals.css";

// Using Inter for body text and Lexend for headings for a modern feel
const inter = Inter({ subsets: ["latin"], variable: '--font-inter', display: 'swap' });
const lexend = Lexend({ subsets: ["latin"], variable: '--font-lexend', weight: ['400', '500', '600', '700', '800'], display: 'swap' });


export const metadata: Metadata = {
  title: "InsightfulCV - AI Resume Analyzer",
  description: "Transform your resume with AI. Get instant analysis, keyword optimization, and job-fit insights to land your dream job.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${lexend.variable} font-sans min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900`}>
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            <a href="/" className="text-2xl font-bold font-heading tracking-tight text-gradient-purple-pink">
              InsightfulCV
            </a>
            {/* Can add a "How it Works" or "Features" link here later */}
            <a
              href="#upload-form" // Points to the form section
              className="hidden sm:inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-purple-pink hover:from-purple-700 hover:to-pink-700 transition-all duration-150"
            >
              Analyze Resume
            </a>
          </div>
        </header>

        <main className="flex-grow"> {/* Remove container mx-auto from here, apply it per-page section if needed */}
          {children}
        </main>

        <footer className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            <p>© {new Date().getFullYear()} InsightfulCV. All rights reserved.</p>
            <p className="mt-1">Made with ❤️ by Priyanka A</p>
            <p className="mt-1">(using a lot of passion and a little bit of AI!)</p>
          </div>
        </footer>
      </body>
    </html>
  );
}