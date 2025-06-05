
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Trophy, Clock, Target, RotateCcw, Home } from 'lucide-react';
import { InterviewResults } from './Interview';
import { theoryQuestions, codingQuestions } from '@/data/questions';

interface ResultsProps {
  results: InterviewResults;
  onRetry: () => void;
  onNewInterview: () => void;
}

const Results: React.FC<ResultsProps> = ({ results, onRetry, onNewInterview }) => {
  const { answers, timeSpent, totalQuestions, correctAnswers, config } = results;
  
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const timeFormatted = `${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}`;
  
  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return { message: "Outstanding! You're interview-ready!", color: "text-green-600", icon: Trophy };
    if (score >= 75) return { message: "Great job! You're on the right track.", color: "text-blue-600", icon: Target };
    if (score >= 60) return { message: "Good effort! Keep practicing.", color: "text-yellow-600", icon: Target };
    return { message: "Keep studying and try again!", color: "text-red-600", icon: Target };
  };

  const performance = getPerformanceMessage(score);
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <PerformanceIcon className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Interview Complete!</CardTitle>
            <p className={`text-xl font-semibold ${performance.color}`}>
              {performance.message}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{score}%</div>
                <div className="text-gray-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{correctAnswers}/{totalQuestions}</div>
                <div className="text-gray-600">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{timeFormatted}</div>
                <div className="text-gray-600">Time Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Question Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theory Questions */}
            {answers.theory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Theory Questions</h3>
                <div className="space-y-4">
                  {answers.theory.map((answer, index) => {
                    const question = theoryQuestions.find(q => q.id === answer.questionId);
                    if (!question) return null;
                    
                    return (
                      <div key={answer.questionId} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          {answer.correct ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 mb-2">
                              {index + 1}. {question.question}
                            </div>
                            <Badge variant={answer.correct ? "default" : "destructive"} className="mb-2">
                              {question.difficulty}
                            </Badge>
                          </div>
                        </div>
                        
                        {!answer.correct && (
                          <div className="ml-8 space-y-2">
                            <div className="text-sm">
                              <span className="font-medium text-red-600">Your answer:</span> {answer.answer || 'No answer'}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-green-600">Correct answer:</span> {question.answer}
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              <span className="font-medium">Explanation:</span> {question.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coding Questions */}
            {answers.coding.length > 0 && (
              <div>
                <Separator className="my-6" />
                <h3 className="text-lg font-semibold mb-4 text-purple-600">Coding Questions</h3>
                <div className="space-y-4">
                  {answers.coding.map((answer, index) => {
                    const question = codingQuestions.find(q => q.id === answer.questionId);
                    if (!question) return null;
                    
                    return (
                      <div key={answer.questionId} className="border rounded-lg p-4">
                        <div className="mb-3">
                          <div className="font-medium text-gray-800 mb-2">
                            {index + 1}. {question.problem}
                          </div>
                          <Badge variant="outline" className="mb-2">
                            {question.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <span className="font-medium text-gray-700">Your Solution:</span>
                            <pre className="bg-gray-50 p-3 rounded mt-2 text-sm overflow-x-auto">
                              <code>{answer.answer || 'No solution provided'}</code>
                            </pre>
                          </div>
                          
                          <div>
                            <span className="font-medium text-green-600">Sample Solution:</span>
                            <pre className="bg-green-50 p-3 rounded mt-2 text-sm overflow-x-auto">
                              <code>{question.solution}</code>
                            </pre>
                          </div>
                          
                          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                            <span className="font-medium">Explanation:</span> {question.explanation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Same Config
          </Button>
          <Button
            onClick={onNewInterview}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            New Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
