import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

export default function QuestionViewer() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(true);

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
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
   }, []);
  // Rest of your code remains the same...
  // [Previous code continues unchanged from line 21 to the end]

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      setQuestions(data);
      setSelectedQuestion(data[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const formatDescription = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.match(/^\d\./)) {
        return <h4 key={i} className="font-semibold mt-4 mb-2">{line}</h4>;
      }
      if (line.match(/^-/)) {
        return <li key={i} className="ml-6">{line.substring(2)}</li>;
      }
      return <p key={i} className="mb-2">{line}</p>;
    });
  };

  if (loading) {
    return <div className="p-4">Loading questions...</div>;
  }

  return (
    <div className="p-2 md:p-4 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Mobile Toggle */}
      <div className="md:hidden mb-4 flex justify-between items-center">
        <button 
          onClick={() => setShowList(!showList)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          {showList ? 'Show Details' : 'Show List'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Questions List */}
        <div className={`md:col-span-4 ${!showList && 'hidden md:block'}`}>
          <h2 className="text-xl font-bold mb-4">Investment Questions</h2>
          <ScrollArea className="h-[calc(100vh-200px)]">
            {questions.map((q) => (
              <Card 
                key={q._id} 
                className={`mb-3 cursor-pointer transition-all hover:shadow-md ${
                  selectedQuestion?._id === q._id ? 'border-blue-500 shadow-md' : ''
                }`}
                onClick={() => {
                  setSelectedQuestion(q);
                  setShowList(false);
                }}
              >
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">{q.title}</CardTitle>
                  <CardDescription className="flex gap-2 mt-2">
                    <Badge variant="outline">{q.stage}</Badge>
                    <Badge variant="secondary">P{q.priority}</Badge>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </ScrollArea>
        </div>

        {/* Detail View */}
        {selectedQuestion && (
          <div className={`md:col-span-8 ${showList && 'hidden md:block'}`}>
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex flex-col gap-2">
                  <CardTitle className="text-xl">{selectedQuestion.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{selectedQuestion.stage}</Badge>
                    <Badge variant="secondary">Priority {selectedQuestion.priority}</Badge>
                    <Badge variant="outline">
                      {(selectedQuestion.confidence_score * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <div className="text-gray-600">
                        {formatDescription(selectedQuestion.description)}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Hypothesis</h3>
                      <p className="text-gray-600">{selectedQuestion.hypothesis}</p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.category.map((cat, idx) => (
                          <Badge key={idx} variant="outline">{cat}</Badge>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Team</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.assigned_to.map((analyst, idx) => (
                          <Badge key={idx} variant="outline">{analyst}</Badge>
                        ))}
                      </div>
                    </section>

                    {/* Inside CardContent, after the Team section */}
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Origin</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 font-medium">Created by:</span>
                          <Badge variant="outline">{selectedQuestion.created_by}</Badge>
                        </div>
                        {selectedQuestion.originator && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-medium">Source:</span>
                            <Badge variant="outline">{selectedQuestion.originator}</Badge>
                          </div>
                        )}
                      </div>
                    </section>

                    {selectedQuestion.source && (
                      <section>
                        <h3 className="text-lg font-semibold mb-3">Sources</h3>
                        <div className="space-y-2">
                          {selectedQuestion.source.map((src, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <span className="text-sm text-gray-600">{src.type}</span>
                              {src.url && (
                                <a href={src.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                  {src.name || src.url}
                                </a>
                              )}
                              {!src.url && src.name && <span>{src.name}</span>}
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
    </div>
  );
}
