
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Trophy, Clock, Target, RotateCcw, Home, Brain } from 'lucide-react';
import { InterviewResults } from './Interview';

interface ResultsProps {
  results: InterviewResults;
  onRetry: () => void;
  onNewInterview: () => void;
}

const Results: React.FC<ResultsProps> = ({ results, onRetry, onNewInterview }) => {
  const { aiFeedback, timeSpent, config, questions, userAnswers } = results;
  
  const score = aiFeedback.score;
  const timeFormatted = `${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}`;
  
  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return { color: "text-green-600", icon: Trophy };
    if (score >= 75) return { color: "text-blue-600", icon: Target };
    if (score >= 60) return { color: "text-yellow-600", icon: Target };
    return { color: "text-red-600", icon: Target };
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
              Score: {score}%
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{score}%</div>
                <div className="text-gray-600">AI Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{questions.length}</div>
                <div className="text-gray-600">Questions Attempted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{timeFormatted}</div>
                <div className="text-gray-600">Time Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              AI Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <p className="text-gray-800 leading-relaxed">{aiFeedback.overallFeedback}</p>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Question Review */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Question Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {aiFeedback.questionFeedbacks.map((feedback, index) => {
              const question = questions.find(q => q.id === feedback.questionId);
              if (!question) return null;
              
              return (
                <div key={feedback.questionId} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {feedback.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 mb-2">
                        {index + 1}. {question.question}
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Badge variant={feedback.isCorrect ? "default" : "destructive"}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {question.type}
                        </Badge>
                        <Badge variant="outline">
                          {question.topic}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-8 space-y-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Your answer:</span>
                      <div className="mt-1 p-3 bg-gray-50 rounded">
                        {userAnswers[question.id] || 'No answer provided'}
                      </div>
                    </div>
                    
                    {feedback.correctAnswer && (
                      <div className="text-sm">
                        <span className="font-medium text-green-600">Correct answer:</span>
                        <div className="mt-1 p-3 bg-green-50 rounded">
                          {feedback.correctAnswer}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm">
                      <span className="font-medium text-blue-600">AI Feedback:</span>
                      <div className="mt-1 p-3 bg-blue-50 rounded">
                        {feedback.feedback}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
