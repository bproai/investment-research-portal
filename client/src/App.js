// App.js
import React from 'react';
import QuestionViewer from './components/QuestionViewer';

function App() {
 return (
   <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
     <header className="bg-white shadow-md">
       <div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-4 flex flex-col md:flex-row items-center justify-between gap-2">
         <div className="flex items-center gap-3">
           <img src="/logo.svg" alt="Company Logo" className="w-8 h-8 md:w-10 md:h-10" />
           <div>
             <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
               Investment Research
             </h1>
             <p className="text-sm text-gray-500">Analysis & Insights</p>
           </div>
         </div>
         <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
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