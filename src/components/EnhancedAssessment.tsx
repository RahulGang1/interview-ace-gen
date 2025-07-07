import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Code, Mic, Home, RotateCcw, Trophy } from 'lucide-react';
import { generateQuestions } from '@/services/aiService';
import VoiceInput from './VoiceInput';
import LoadingState from './LoadingState';

interface EnhancedAssessmentProps {
  onBack: () => void;
}

interface Question {
  id: string;
  type: 'mcq' | 'coding' | 'voice';
  question: string;
  options?: string[];
  codeTemplate?: string;
  difficulty: string;
}

interface Results {
  score: number;
  feedback: string;
}

const EnhancedAssessment: React.FC<EnhancedAssessmentProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    loadQuestions();

    const intervalId = setInterval(() => {
      setTimeSpent(prevTime => prevTime + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Replace with actual question generation logic
      const generatedQuestions = await generateQuestions(
        'All',
        'all',
        7,
        2
      );

      const assessmentQuestions: Question[] = [
        ...generatedQuestions.slice(0, 7).map(q => ({ ...q, type: 'mcq' })),
        ...generatedQuestions.slice(7, 9).map(q => ({ ...q, type: 'coding' })),
        ...generatedQuestions.slice(9, 12).map(q => ({ ...q, type: 'voice' })),
      ];
      setQuestions(assessmentQuestions as Question[]);
    } catch (e: any) {
      setError(e.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceAnswer = (questionId: string, transcript: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: transcript
    }));
  };

  const handleMCQAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleCodeAnswer = (questionId: string, code: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: code
    }));
  };

  const handleWrittenAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    // Calculate score and provide feedback
    let correctAnswers = 0;
    questions.forEach(question => {
      const userAnswer = answers[question.id] || '';
      // Implement actual answer checking logic based on question type
      if (question.type === 'mcq' && question.options && question.options[0] === userAnswer) {
        correctAnswers++;
      } else if (question.type === 'coding' && userAnswer.length > 10) {
        correctAnswers++;
      } else if (question.type === 'voice' && userAnswer.length > 5) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    let feedback = 'Good job!';
    if (score < 50) {
      feedback = 'Needs improvement.';
    } else if (score > 80) {
      feedback = 'Excellent!';
    }

    setResults({ score, feedback });
    setShowResults(true);
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return <LoadingState message="Loading assessment questions..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardTitle className="text-xl font-semibold mb-4">Error</CardTitle>
          <CardContent>{error}</CardContent>
          <Button onClick={onBack}>Go Back</Button>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">Assessment Complete!</CardTitle>
              <p className="text-xl font-semibold text-green-600">
                Score: {results?.score}%
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{results?.score}%</div>
                  <div className="text-gray-600">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{questions.length}</div>
                  <div className="text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
                  <div className="text-gray-600">Time Taken</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">AI Feedback:</h3>
                  <p className="text-green-700">{results?.feedback}</p>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => {
                      setShowResults(false);
                      setCurrentQuestionIndex(0);
                      setAnswers({});
                      setTimeSpent(0);
                      setResults(null);
                      loadQuestions();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Take Again
                  </Button>
                  <Button onClick={onBack} variant="outline">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={onBack}>
          Back to Home
        </Button>
        <div className="text-gray-600">Time Spent: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardContent className="p-4">
            <Progress value={(currentQuestionIndex / questions.length) * 100} />
            <div className="text-sm text-gray-500 mt-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {currentQuestion.type === 'mcq' && <CheckCircle className="w-6 h-6 text-blue-600" />}
              {currentQuestion.type === 'coding' && <Code className="w-6 h-6 text-purple-600" />}
              {currentQuestion.type === 'voice' && <Mic className="w-6 h-6 text-green-600" />}
              <span>Question {currentQuestionIndex + 1}</span>
              <Badge variant="outline">{currentQuestion.type.toUpperCase()}</Badge>
              <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium">{currentQuestion.question}</div>
            
            {currentQuestion.type === 'mcq' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleMCQAnswer(currentQuestion.id, value)}
              >
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {currentQuestion.type === 'coding' && (
              <div className="space-y-4">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
                  <pre className="text-sm">{currentQuestion.codeTemplate}</pre>
                </div>
                <Textarea
                  placeholder="Write your code here..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleCodeAnswer(currentQuestion.id, e.target.value)}
                  className="min-h-[200px] font-mono"
                />
              </div>
            )}
            
            {currentQuestion.type === 'voice' && (
              <VoiceInput
                onTranscript={(transcript) => handleVoiceAnswer(currentQuestion.id, transcript)}
                currentTranscript={answers[currentQuestion.id] || ''}
              />
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit}>Submit</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAssessment;
