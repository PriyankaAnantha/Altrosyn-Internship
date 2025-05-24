  //This is the root layout.


  // frontend/src/app/layout.tsx
  import type { Metadata } from "next";
  import { Inter } from "next/font/google";
  import "./globals.css";

  const inter = Inter({ subsets: ["latin"] });

  export const metadata: Metadata = {
    title: "AI Resume Analyzer",
    description: "Upload your resume and get instant AI-powered analysis.",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body className={`${inter.className} min-h-screen flex flex-col`}>
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">AI Resume Analyzer</h1>
            </div>
          </header>
          <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>
          <footer className="bg-gray-800 text-white p-4 text-center">
            <p>© {new Date().getFullYear()} AI Resume Analyzer. Built for demo.</p>
          </footer>
        </body>
      </html>
    );
  }
