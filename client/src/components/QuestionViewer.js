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
  const [searchQuery, setSearchQuery] = useState('');
  const [newStock, setNewStock] = useState('');
  const [stockData, setStockData] = useState(null);
  const [hoveredStock, setHoveredStock] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [noteColor, setNoteColor] = useState('#FEF3C7'); // Default light yellow
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showStockInput, setShowStockInput] = useState(false);
  const [showRelatedInput, setShowRelatedInput] = useState(false);
  const [questionFilter, setQuestionFilter] = useState('');
  const [serverInfo, setServerInfo] = useState(null);

  // Fetch server info on mount
  useEffect(() => {
    async function fetchServerInfo() {
      try {
        // First try server info endpoint
        const response = await fetch('http://localhost:5001/api/server-info');
        const info = await response.json();
        setServerInfo(info);
      } catch (error) {
        console.error('Error fetching server info:', error);
        // If REACT_APP_HOST is defined, use it as fallback
        if (process.env.REACT_APP_HOST) {
          setServerInfo({
            ip: process.env.REACT_APP_HOST,
            port: 5001
          });
        } else {
          // Last resort: use URL hostname
          setServerInfo({
            ip: window.location.hostname,
            port: 5001
          });
        }
      }
    }
    fetchServerInfo();
  }, []);

  // Fetch questions after getting server info and refresh periodically
  useEffect(() => {
    const REFRESH_INTERVAL = 30000; // 30 seconds
    let intervalId;

    async function fetchData() {
      if (!serverInfo) return;
      
      try {
        const baseUrl = `http://${serverInfo.ip}:${serverInfo.port}`;
        const response = await fetch(`${baseUrl}/api/questions`);
        const data = await response.json();
        
        // Update questions list
        setQuestions(data);
        
        // Update selected question with fresh data if one is selected
        if (selectedQuestion) {
          const updatedSelectedQuestion = data.find(q => q._id === selectedQuestion._id);
          if (updatedSelectedQuestion) {
            setSelectedQuestion(updatedSelectedQuestion);
          }
        } else {
          setSelectedQuestion(data[0]);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch
    fetchData();

    // Set up periodic refresh
    if (serverInfo) {
      intervalId = setInterval(fetchData, REFRESH_INTERVAL);
    }

    // Cleanup interval on unmount or when serverInfo changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [serverInfo, selectedQuestion?._id]);

  // Clear newStock when changing questions
  useEffect(() => {
    setNewStock('');
    setNewNote('');
    setNoteColor('#FEF3C7'); // Reset color to default
  }, [selectedQuestion?._id]);

  const fetchStockData = async (symbol) => {
    try {
      console.log('Fetching data for symbol:', symbol);
      if (!serverInfo) return;
      const baseUrl = `http://${serverInfo.ip}:${serverInfo.port}`;
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
    // return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });    
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!newStock.trim()) return;

    try {
      if (!serverInfo) return;
      const baseUrl = `http://${serverInfo.ip}:${serverInfo.port}`;
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
      if (!serverInfo) return;
      const baseUrl = `http://${serverInfo.ip}:${serverInfo.port}`;
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
      if (!serverInfo) return;
      const baseUrl = `http://${serverInfo.ip}:${serverInfo.port}`;
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
      if (!serverInfo) return;
      const baseUrl = `http://${serverInfo.ip}:${serverInfo.port}`;
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

  const handleAddRelatedQuestion = async (relatedId) => {
    try {
      if (!serverInfo) return;
      const baseUrl = `http://${serverInfo.ip}:${serverInfo.port}`;
      const response = await fetch(
        `${baseUrl}/api/questions/${selectedQuestion._id}/related/${relatedId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
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
      setShowRelatedInput(false);
    } catch (error) {
      console.error('Error adding related question:', error);
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
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
        <ScrollArea className="h-[calc(100vh-250px)] overflow-auto">
          {questions && questions
            .filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((q) => (
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
                  <section className="group">
                    <div className="flex justify-between items-center mb-3 relative">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Sticky Notes</h3>
                      {!showNoteInput && (
                        <button
                          onClick={() => setShowNoteInput(true)}
                          className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                    text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {showNoteInput ? (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleAddNote(e);
                          setShowNoteInput(false);
                        }} className="space-y-3">
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a note..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                      min-h-[100px]"
                            autoFocus
                          />
                          <div className="flex gap-3">
                            <input
                             type="color"
                             value={noteColor}
                             onChange={(e) => setNoteColor(e.target.value)}
                             className="h-8 w-8 !p-0.5 rounded cursor-pointer"
                           />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg
                                      hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                            >
                              Add Note
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowNoteInput(false)}
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg
                                      hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : null}
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
                  <section className="group">
                    <div className="flex justify-between items-center mb-3 relative">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Related Stocks</h3>
                      {!showStockInput && (
                        <button
                          onClick={() => setShowStockInput(true)}
                          className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                    text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {showStockInput ? (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleAddStock(e);
                            setShowStockInput(false);
                          }} 
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={newStock}
                            onChange={(e) => setNewStock(e.target.value)}
                            placeholder="Add stock symbol..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg
                                    hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowStockInput(false)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg
                                    hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.related_stocks?.map((symbol, idx) => (
                          <div key={idx} className="group/stock relative inline-block !opacity-100">
                            <Badge
                              className="bg-purple-700 hover:bg-purple-800 dark:bg-purple-200 dark:hover:bg-purple-300
                                      text-white dark:text-black font-medium
                                      pr-8 group-hover/stock:pr-8 cursor-pointer shadow-sm"
                              onMouseEnter={() => handleStockHover(symbol)}
                              onMouseLeave={handleStockLeave}
                            >
                              {symbol}
                              <button
                                onClick={() => handleRemoveStock(symbol)}
                                className="absolute right-2 top-1/2 -translate-y-1/2
                                        text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200
                                        opacity-0 group-hover/stock:opacity-100 transition-opacity"
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
                                <div className="h-[150px] w-full transition-all duration-300">
                                  <ResponsiveContainer width="100%" height="100%" debounce={0}>
                                    <AreaChart
                                      data={stockData.data}
                                      animationDuration={500}
                                    >
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
                                        animationDuration={300}
                                      />
                                      <YAxis
                                        domain={['dataMin', 'dataMax']}
                                        stroke="#888888"
                                        fontSize={10}
                                        animationDuration={300}
                                      />
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                          border: 'none',
                                          borderRadius: '4px',
                                          fontSize: '12px',
                                          transition: 'all 0.2s ease'
                                        }}
                                        labelFormatter={formatDate}
                                        animationDuration={300}
                                        animationBegin={0}
                                      />
                                      <Area
                                        type="monotone"
                                        dataKey="close"
                                        stroke="#8884d8"
                                        fillOpacity={1}
                                        fill="url(#colorPrice)"
                                        dot={{ r: 3, fill: "#8884d8" }}
                                        activeDot={{ r: 5, fill: "#8884d8", stroke: "white", strokeWidth: 2 }}
                                        isAnimationActive={true}
                                        animationDuration={300}
                                        animationBegin={0}
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
                  <section className="group">
                    <div className="flex justify-between items-center mb-3 relative">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Related Questions</h3>
                      {!showRelatedInput && (
                        <button
                          onClick={() => setShowRelatedInput(true)}
                          className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                    text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {showRelatedInput && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={questionFilter}
                            onChange={(e) => setQuestionFilter(e.target.value)}
                            placeholder="Search questions..."
                            className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                          />
                          <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                    [&>option]:py-2 [&>option]:px-3 [&>option]:cursor-pointer"
                            size="6"
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddRelatedQuestion(e.target.value);
                              }
                            }}
                            value=""
                          >
                            <option value="">Select a question...</option>
                            {questions
                              .filter(q =>
                                q._id !== selectedQuestion._id &&
                                !selectedQuestion.related_questions?.includes(q._id) &&
                                q.title.toLowerCase().includes(questionFilter.toLowerCase())
                              )
                              .map((q) => (
                                <option key={q._id} value={q._id}>
                                  {q.title}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowRelatedInput(false)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg
                                    hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      <div className="space-y-2">
                        {selectedQuestion.related_questions?.map((relatedId) => {
                          const relatedQuestion = questions.find(q => q._id === relatedId);
                          if (!relatedQuestion) return null;
                          
                          return (
                            <div
                              key={relatedId}
                              className="relative p-3 border border-gray-300 dark:border-gray-600 rounded-lg group/item dark:bg-gray-800/50"
                            >
                              <p
                                className="text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => setSelectedQuestion(relatedQuestion)}
                              >
                                {relatedQuestion.title}
                              </p>
                              <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      if (!serverInfo) return;
                                      const baseUrl = `http://${serverInfo.ip}:${serverInfo.port}`;
                                      const response = await fetch(
                                        `${baseUrl}/api/questions/${selectedQuestion._id}/related/${relatedId}`,
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
                                  className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  ×
                                </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
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