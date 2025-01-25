import React from 'react';
import QuestionViewer from './components/QuestionViewer';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Company Logo" 
              className="w-10 h-10"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              Investment Research Questions
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            Research Portal
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