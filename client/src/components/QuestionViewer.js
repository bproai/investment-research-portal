import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import StickyNote from "./ui/sticky-note";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const QuestionViewer = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showList, setShowList] = useState(true);
  const [newStock, setNewStock] = useState('');
  const [stockData, setStockData] = useState(null);
  const [hoveredStock, setHoveredStock] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [noteColor, setNoteColor] = useState('#FEF3C7'); // Default light yellow

  useEffect(() => {
    async function fetchData() {
      try {
        let response;
        try {
          response = await fetch('http://localhost:5001/api/questions');
        } catch {
          response = await fetch('http://192.168.1.232:5001/api/questions');
        }
        const data = await response.json();
        setQuestions(data);
        setSelectedQuestion(data[0]);
        setError(null);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Clear newStock when changing questions
  useEffect(() => {
    setNewStock('');
    setNewNote('');
    setNoteColor('#FEF3C7'); // Reset color to default
  }, [selectedQuestion?._id]);

  const fetchStockData = async (symbol) => {
    try {
      console.log('Fetching data for symbol:', symbol);
      const baseUrl = window.location.hostname === 'localhost' ? 
        'http://localhost:5001' : 
        'http://192.168.1.232:5001';

      const response = await fetch(`${baseUrl}/api/stock-price/${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      const data = await response.json();
      console.log('Received stock data:', data);
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setStockData(null);
    }
  };

  const handleStockHover = (symbol) => {
    console.log('Stock hovered:', symbol);
    setHoveredStock(symbol);
    fetchStockData(symbol);
  };

  const handleStockLeave = () => {
    console.log('Stock hover ended');
    setHoveredStock(null);
    setStockData(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!newStock.trim()) return;

    try {
      const baseUrl = window.location.hostname === 'localhost' ? 
        'http://localhost:5001' : 
        'http://192.168.1.232:5001';

      const response = await fetch(
        `${baseUrl}/api/questions/${selectedQuestion._id}/stocks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: newStock.trim() })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedQuestion = await response.json();
      setSelectedQuestion(updatedQuestion);
      setQuestions(questions.map(q =>
        q._id === updatedQuestion._id ? updatedQuestion : q
      ));
      setNewStock('');
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const baseUrl = window.location.hostname === 'localhost' ?
        'http://localhost:5001' :
        'http://192.168.1.232:5001';

      const response = await fetch(
        `${baseUrl}/api/questions/${selectedQuestion._id}/sticky-notes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newNote.trim(), color: noteColor })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedQuestion = await response.json();
      setSelectedQuestion(updatedQuestion);
      setQuestions(questions.map(q =>
        q._id === updatedQuestion._id ? updatedQuestion : q
      ));
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleRemoveNote = async (noteId) => {
    try {
      const baseUrl = window.location.hostname === 'localhost' ?
        'http://localhost:5001' :
        'http://192.168.1.232:5001';

      const response = await fetch(
        `${baseUrl}/api/questions/${selectedQuestion._id}/sticky-notes/${noteId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedQuestion = await response.json();
      setSelectedQuestion(updatedQuestion);
      setQuestions(questions.map(q =>
        q._id === updatedQuestion._id ? updatedQuestion : q
      ));
    } catch (error) {
      console.error('Error removing note:', error);
    }
  };

  const handleRemoveStock = async (symbol) => {
    try {
      const baseUrl = window.location.hostname === 'localhost' ? 
        'http://localhost:5001' : 
        'http://192.168.1.232:5001';

      const response = await fetch(
        `${baseUrl}/api/questions/${selectedQuestion._id}/stocks/${symbol}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedQuestion = await response.json();
      setSelectedQuestion(updatedQuestion);
      setQuestions(questions.map(q =>
        q._id === updatedQuestion._id ? updatedQuestion : q
      ));
    } catch (error) {
      console.error('Error removing stock:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-xl text-gray-500 dark:text-gray-400">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-xl text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Questions List */}
      <div className={`md:block ${showList ? 'block' : 'hidden'}`}>
        <ScrollArea className="h-[calc(100vh-200px)] overflow-auto">
          {questions && questions.map((q) => (
            <Card 
              key={q._id} 
              className={`mb-3 cursor-pointer transition-all duration-200 
                hover:scale-[1.02] hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500
                ${selectedQuestion?._id === q._id ? 'border-blue-700 dark:border-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/50 scale-[1.02]' : 'dark:bg-gray-800 dark:border-gray-700'}`}
              onClick={() => {
                setSelectedQuestion(q);
                setShowList(false);
              }}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">{q.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>

      {/* Question Detail */}
      {selectedQuestion && (
        <div className={`md:col-span-2 ${showList ? 'hidden' : 'block'} md:block`}>
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowList(true)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ← Back to list
            </button>
          </div>
          <Card className="h-[calc(100vh-200px)] shadow-lg border-gray-200 dark:border-gray-700 overflow-auto dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{selectedQuestion.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900">{selectedQuestion.stage}</Badge>
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-100">P{selectedQuestion.priority}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-6">
                  {/* Description */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{selectedQuestion.description}</p>
                  </section>

                  {/* Sticky Notes */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Sticky Notes</h3>
                    <div className="space-y-4">
                      <form onSubmit={handleAddNote} className="space-y-3">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                   min-h-[100px]"
                        />
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={noteColor}
                            onChange={(e) => setNoteColor(e.target.value)}
                            className="h-10 w-20 rounded cursor-pointer"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg
                                     hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                          >
                            Add Note
                          </button>
                        </div>
                      </form>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedQuestion.sticky_notes?.map((note) => (
                          <StickyNote
                            key={note.id}
                            note={note}
                            onDelete={handleRemoveNote}
                          />
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Related Stocks */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Related Stocks</h3>
                    <div className="space-y-4">
                      <form onSubmit={handleAddStock} className="flex gap-2">
                        <input
                          type="text"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          placeholder="Add stock symbol..."
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg
                                   hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                          Add
                        </button>
                      </form>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.related_stocks?.map((symbol, idx) => (
                          <div key={idx} className="group relative inline-block">
                            <Badge
                              className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100
                                       pr-8 group-hover:pr-8 cursor-pointer"
                              onMouseEnter={() => handleStockHover(symbol)}
                              onMouseLeave={handleStockLeave}
                            >
                              {symbol}
                              <button
                                onClick={() => handleRemoveStock(symbol)}
                                className="absolute right-2 top-1/2 -translate-y-1/2
                                         text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200
                                         opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </Badge>
                            {hoveredStock === symbol && stockData && (
                              <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4
                                          border border-gray-200 dark:border-gray-700 whitespace-nowrap min-w-[300px]">
                                <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                  Latest Price: {stockData.data[stockData.data.length - 1].close.toFixed(2)}
                                </div>
                                <div className="h-[150px] w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stockData.data}>
                                      <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <XAxis 
                                        dataKey="date" 
                                        tickFormatter={formatDate}
                                        stroke="#888888"
                                        fontSize={10}
                                      />
                                      <YAxis 
                                        domain={['dataMin', 'dataMax']}
                                        stroke="#888888"
                                        fontSize={10}
                                      />
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                          border: 'none',
                                          borderRadius: '4px',
                                          fontSize: '12px'
                                        }}
                                        labelFormatter={formatDate}
                                      />
                                      <Area 
                                        type="monotone" 
                                        dataKey="close" 
                                        stroke="#8884d8" 
                                        fillOpacity={1} 
                                        fill="url(#colorPrice)" 
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Categories */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuestion.categories?.map((category, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-100">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  {/* Tags */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuestion.tags?.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  {/* Team */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Team</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuestion.team?.map((member, idx) => (
                        <Badge key={idx} className="bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-100">
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  {/* Source and Originator */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Origin</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Created by:</span>
                        <Badge variant="outline" className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500">{selectedQuestion.created_by}</Badge>
                      </div>
                      {selectedQuestion.originator && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-300 font-medium">Source:</span>
                          <Badge variant="outline" className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500">{selectedQuestion.originator}</Badge>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Related Questions */}
                  {selectedQuestion.related_questions && selectedQuestion.related_questions.length > 0 && (
                    <section>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Related Questions</h3>
                      <div className="space-y-2">
                        {questions
                          .filter(q => selectedQuestion.related_questions.includes(q._id))
                          .map((q, idx) => (
                            <div
                              key={idx}
                              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg group dark:bg-gray-800/50"
                            >
                              <div className="flex justify-between items-center group">
                                <p
                                  className="text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-grow"
                                  onClick={() => setSelectedQuestion(q)}
                                >
                                  {q.title}
                                </p>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const baseUrl = window.location.hostname === 'localhost' ? 
                                        'http://localhost:5001' : 
                                        'http://192.168.1.232:5001';

                                      const response = await fetch(
                                        `${baseUrl}/api/questions/${selectedQuestion._id}/related/${q._id}`,
                                        { method: 'DELETE' }
                                      );

                                      if (!response.ok) {
                                        throw new Error(`HTTP error! status: ${response.status}`);
                                      }

                                      const updatedQuestion = await response.json();
                                      setSelectedQuestion(updatedQuestion);
                                      setQuestions(questions.map(question =>
                                        question._id === updatedQuestion._id ? updatedQuestion : question
                                      ));
                                    } catch (error) {
                                      console.error('Error removing related question:', error);
                                    }
                                  }}
                                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </section>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuestionViewer;