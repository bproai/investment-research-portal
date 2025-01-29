import React from 'react';
import QuestionViewer from './components/QuestionViewer';
import ThemeToggle from './components/ui/theme-toggle';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Company Logo" 
              className="w-8 h-8 md:w-10 md:h-10" 
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Investment Research
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Analysis & Insights</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
              Research Portal
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <QuestionViewer />
      </main>
    </div>
  );
}

export default App;