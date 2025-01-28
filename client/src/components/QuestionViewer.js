import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

const QuestionViewer = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-xl text-gray-500">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-xl text-red-500">{error}</div>
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
                hover:scale-[1.02] hover:shadow-lg hover:border-blue-400 
                ${selectedQuestion?._id === q._id ? 'border-blue-700 shadow-lg bg-blue-50 scale-[1.02]' : ''}`}
              onClick={() => {
                setSelectedQuestion(q);
                setShowList(false);
              }}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-gray-900">{q.title}</CardTitle>
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
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to list
            </button>
          </div>
          <Card className="h-[calc(100vh-200px)] shadow-lg border-gray-200 overflow-auto">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-xl text-gray-900">{selectedQuestion.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-600 text-white">{selectedQuestion.stage}</Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">P{selectedQuestion.priority}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-6">
                  {/* Description */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Description</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedQuestion.description}</p>
                  </section>

                  {/* Categories */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuestion.categories?.map((category, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  {/* Tags */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuestion.tags?.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-gray-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  {/* Team */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Team</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuestion.team?.map((member, idx) => (
                        <Badge key={idx} className="bg-green-100 text-green-800">
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  {/* Source and Originator */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Origin</h3>
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

                  {/* Related Questions */}
                  {selectedQuestion.related_questions && selectedQuestion.related_questions.length > 0 && (
                    <section>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Related Questions</h3>
                      <div className="space-y-2">
                        {questions
                          .filter(q => selectedQuestion.related_questions.includes(q._id))
                          .map((q, idx) => (
                            <div
                              key={idx}
                              className="p-3 border border-gray-300 rounded-lg group"
                            >
                              <div className="flex justify-between items-center group">
                                <p
                                  className="text-gray-800 cursor-pointer hover:text-blue-600 flex-grow"
                                  onClick={() => setSelectedQuestion(q)}
                                >
                                  {q.title}
                                </p>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const response = await fetch(
                                        `http://localhost:5001/api/questions/${selectedQuestion._id}/related/${q._id}`,
                                        { method: 'DELETE' }
                                      );
                                      const updatedQuestion = await response.json();
                                      setSelectedQuestion(updatedQuestion);
                                      // Update the questions array with the updated question
                                      setQuestions(questions.map(question =>
                                        question._id === updatedQuestion._id ? updatedQuestion : question
                                      ));
                                    } catch (error) {
                                      console.error('Error removing related question:', error);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
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