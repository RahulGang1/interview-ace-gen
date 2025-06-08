import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Code, BookOpen, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { InterviewConfig } from './InterviewSetup';
import { generateQuestions, evaluateAnswers, AIQuestion, AIFeedback } from '@/services/aiService';
import LoadingState from './LoadingState';

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
  const [selectedLanguage, setSelectedLanguage] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(config.timeLimit * 60);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isTheoryQuestion = currentQuestion?.type === 'theory';

  const codingLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' }
  ];

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

  const handleLanguageChange = (questionId: string, language: string) => {
    setSelectedLanguage(prev => ({
      ...prev,
      [questionId]: language
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
      <LoadingState 
        onRetry={loadQuestions}
        message="Creating your personalized interview questions with AI. This may take a moment..."
      />
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
        <Card className={`mb-6 ${isTheoryQuestion ? 'border-blue-200 bg-blue-50/30' : 'border-purple-200 bg-purple-50/30'}`}>
          <CardHeader className={isTheoryQuestion ? 'bg-blue-50' : 'bg-purple-50'}>
            <CardTitle className="flex items-center gap-3">
              {isTheoryQuestion ? (
                <BookOpen className="w-6 h-6 text-blue-600" />
              ) : (
                <Code className="w-6 h-6 text-purple-600" />
              )}
              <span className={isTheoryQuestion ? 'text-blue-800' : 'text-purple-800'}>
                {isTheoryQuestion ? 'Theory Question' : 'Coding Question'}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                isTheoryQuestion ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
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
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-purple-800">Coding Instructions:</h4>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-purple-700">Language:</Label>
                      <Select 
                        value={selectedLanguage[currentQuestion.id] || 'javascript'} 
                        onValueChange={(value) => handleLanguageChange(currentQuestion.id, value)}
                      >
                        <SelectTrigger className="w-[140px] h-8 bg-white border-purple-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {codingLanguages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-purple-700">
                    Write your solution in {codingLanguages.find(l => l.value === (selectedLanguage[currentQuestion.id] || 'javascript'))?.label}. 
                    Focus on clean, working code with proper syntax.
                  </p>
                </div>
                <Textarea
                  placeholder={`Write your ${codingLanguages.find(l => l.value === (selectedLanguage[currentQuestion.id] || 'javascript'))?.label} solution here...`}
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  className="min-h-[200px] font-mono text-sm bg-gray-900 text-green-400 border-purple-300 placeholder:text-green-600"
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
