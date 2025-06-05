
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Clock, Code, BookOpen, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { InterviewConfig } from './InterviewSetup';
import { generateQuestions, evaluateAnswers, AIQuestion, AIFeedback } from '@/services/aiService';

interface InterviewProps {
  config: InterviewConfig;
  onComplete: (results: InterviewResults) => void;
  onBack: () => void;
}

export interface InterviewResults {
  config: InterviewConfig;
  questions: AIQuestion[];
  userAnswers: Record<string, string>;
  aiFeedback: AIFeedback;
  timeSpent: number;
}

const Interview: React.FC<InterviewProps> = ({ config, onComplete, onBack }) => {
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(config.timeLimit * 60);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isTheoryQuestion = currentQuestion?.type === 'theory';

  useEffect(() => {
    loadQuestions();
  }, [config]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0 && !loading) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, loading]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const generatedQuestions = await generateQuestions(
        config.topic,
        config.difficulty,
        config.theoryCount,
        config.codingCount
      );
      setQuestions(generatedQuestions);
      console.log('Generated questions:', generatedQuestions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      alert('Failed to generate questions. Please try again.');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsActive(false);
    setSubmitting(true);
    
    try {
      const aiFeedback = await evaluateAnswers(questions, userAnswers);
      const timeSpent = (config.timeLimit * 60) - timeLeft;

      const results: InterviewResults = {
        config,
        questions,
        userAnswers,
        aiFeedback,
        timeSpent
      };

      onComplete(results);
    } catch (error) {
      console.error('Failed to evaluate answers:', error);
      alert('Failed to evaluate answers. Please try again.');
      setIsActive(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Generating Interview Questions</h2>
          <p className="text-gray-600">Please wait while AI creates your personalized questions...</p>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No questions available</h2>
          <Button onClick={onBack}>Back to Setup</Button>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Setup
          </Button>
          <div className="flex items-center gap-4 text-lg font-semibold">
            <Clock className="w-5 h-5 text-red-500" />
            <span className={timeLeft < 300 ? 'text-red-500' : 'text-gray-700'}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {isTheoryQuestion ? (
                <BookOpen className="w-6 h-6 text-blue-600" />
              ) : (
                <Code className="w-6 h-6 text-purple-600" />
              )}
              <span>{isTheoryQuestion ? 'Theory Question' : 'Coding Question'}</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {currentQuestion.difficulty}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium text-gray-800">
              {currentQuestion.question}
            </div>

            {isTheoryQuestion && currentQuestion.options ? (
              <RadioGroup
                value={userAnswers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer text-base">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-4">
                {currentQuestion.expectedAnswer && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">Instructions:</h4>
                    <p className="text-gray-600">Write your solution in the text area below. Focus on clean, working code.</p>
                  </div>
                )}
                <Textarea
                  placeholder="Write your solution here..."
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-4">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  'Submit Interview'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
