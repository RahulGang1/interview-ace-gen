
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Clock, Code, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { InterviewConfig } from './InterviewSetup';
import { getRandomQuestions, TheoryQuestion, CodingQuestion } from '@/data/questions';

interface InterviewProps {
  config: InterviewConfig;
  onComplete: (results: InterviewResults) => void;
  onBack: () => void;
}

export interface InterviewResults {
  config: InterviewConfig;
  answers: {
    theory: { questionId: string; answer: string; correct: boolean }[];
    coding: { questionId: string; answer: string }[];
  };
  timeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
}

const Interview: React.FC<InterviewProps> = ({ config, onComplete, onBack }) => {
  const [questions, setQuestions] = useState<{theory: TheoryQuestion[], coding: CodingQuestion[]}>({theory: [], coding: []});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{theory: Record<string, string>, coding: Record<string, string>}>({
    theory: {},
    coding: {}
  });
  const [timeLeft, setTimeLeft] = useState(config.timeLimit * 60); // Convert to seconds
  const [isActive, setIsActive] = useState(true);

  const allQuestions = [...questions.theory, ...questions.coding];
  const currentQuestion = allQuestions[currentQuestionIndex];
  const isTheoryQuestion = currentQuestion && questions.theory.includes(currentQuestion as TheoryQuestion);

  useEffect(() => {
    const selectedQuestions = getRandomQuestions(
      config.topic,
      config.difficulty,
      config.theoryCount,
      config.codingCount
    );
    setQuestions(selectedQuestions);
  }, [config]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string, type: 'theory' | 'coding') => {
    setAnswers(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [questionId]: answer
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsActive(false);
    
    const theoryResults = questions.theory.map(q => ({
      questionId: q.id,
      answer: answers.theory[q.id] || '',
      correct: answers.theory[q.id] === q.answer
    }));

    const codingResults = questions.coding.map(q => ({
      questionId: q.id,
      answer: answers.coding[q.id] || ''
    }));

    const correctAnswers = theoryResults.filter(r => r.correct).length;
    const timeSpent = (config.timeLimit * 60) - timeLeft;

    const results: InterviewResults = {
      config,
      answers: {
        theory: theoryResults,
        coding: codingResults
      },
      timeSpent,
      totalQuestions: allQuestions.length,
      correctAnswers
    };

    onComplete(results);
  };

  if (allQuestions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading questions...</div>;
  }

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">No questions available.</div>;
  }

  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;

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
                Question {currentQuestionIndex + 1} of {allQuestions.length}
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
                {(currentQuestion as any).difficulty}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium text-gray-800">
              {isTheoryQuestion ? (currentQuestion as TheoryQuestion).question : (currentQuestion as CodingQuestion).problem}
            </div>

            {isTheoryQuestion ? (
              <RadioGroup
                value={answers.theory[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value, 'theory')}
                className="space-y-3"
              >
                {(currentQuestion as TheoryQuestion).options.map((option, index) => (
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Expected Output:</h4>
                  <code className="text-green-600 font-mono">
                    {(currentQuestion as CodingQuestion).expectedOutput}
                  </code>
                </div>
                <Textarea
                  placeholder="Write your solution here..."
                  value={answers.coding[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value, 'coding')}
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
            {currentQuestionIndex === allQuestions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                Submit Interview
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
