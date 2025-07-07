
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Send, Play, Square, Code, FileText, CheckCircle, Volume2, Loader2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateAssessmentQuestions, 
  evaluateAnswer, 
  generateOverallAssessment,
  EnhancedQuestion, 
  AssessmentConfig, 
  EvaluationResult,
  AssessmentResults 
} from '@/services/enhancedAiService';

interface EnhancedAssessmentProps {
  onBack: () => void;
}

const EnhancedAssessment: React.FC<EnhancedAssessmentProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<EnhancedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [finalResults, setFinalResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentQuestion = questions[currentQuestionIndex];
  
  const codingLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setCurrentAnswer(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not access microphone for voice typing.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  const startAssessment = async () => {
    setLoading(true);
    try {
      const config: AssessmentConfig = {
        mcqCount: 7,
        codingCount: 2,
        voiceCount: 3,
        topics: ['Programming', 'Web Development', 'Algorithms', 'General Knowledge'],
        difficulty: 'mixed'
      };
      
      const generatedQuestions = await generateAssessmentQuestions(config);
      setQuestions(generatedQuestions);
      setAssessmentStarted(true);
      
      toast({
        title: "Assessment Started",
        description: `Generated ${generatedQuestions.length} diverse questions for your assessment.`
      });
    } catch (error) {
      console.error('Failed to generate questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate assessment questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Typing Not Available",
        description: "Your browser doesn't support voice typing.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Voice Typing Started",
        description: "Speak clearly and your words will appear in the text area."
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your answer clearly."
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim() && !recordedAudioUrl) {
      toast({
        title: "No Answer Provided",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }

    setEvaluating(true);
    try {
      const isVoiceAnswer = currentQuestion.voiceEnabled && (recordedAudioUrl || isListening);
      const result = await evaluateAnswer(currentQuestion, currentAnswer, isVoiceAnswer);
      
      setEvaluationResults(prev => [...prev, result]);
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: currentAnswer
      }));

      // Show immediate feedback
      toast({
        title: result.isCorrect ? "Correct!" : "Incorrect",
        description: result.feedback.substring(0, 100) + "...",
        variant: result.isCorrect ? "default" : "destructive"
      });

      // Move to next question or complete assessment
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
        setRecordedAudioUrl(null);
      } else {
        // Complete assessment
        const allResults = [...evaluationResults, result];
        const finalAssessment = await generateOverallAssessment(allResults);
        setFinalResults(finalAssessment);
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      toast({
        title: "Evaluation Error",
        description: "Failed to evaluate your answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setEvaluating(false);
    }
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'coding':
        return <Code className="w-4 h-4 text-purple-600" />;
      case 'mcq':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'voice':
        return <Volume2 className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  if (finalResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
              <div className="text-4xl font-bold text-blue-600 mt-4">
                {finalResults.overallScore}%
              </div>
              <p className="text-gray-600">
                {finalResults.correctAnswers} out of {finalResults.totalQuestions} questions correct
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Progress value={finalResults.overallScore} className="h-4" />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Overall Feedback</h3>
                <p>{finalResults.feedback}</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Recommended Areas for Improvement</h3>
                <ul className="list-disc list-inside space-y-1">
                  {finalResults.recommendedAreas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finalResults.detailedResults.map((result, index) => (
                  <Card key={result.questionId} className={`${result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Question {index + 1}</span>
                        <Badge variant={result.isCorrect ? "default" : "destructive"}>
                          {result.score}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{result.feedback}</p>
                      {result.codeAnalysis && (
                        <div className="text-xs space-y-1">
                          <div>Syntax: {result.codeAnalysis.syntax ? '✓' : '✗'}</div>
                          <div>Logic: {result.codeAnalysis.logic ? '✓' : '✗'}</div>
                          <div>Efficiency: {result.codeAnalysis.efficiency}</div>
                        </div>
                      )}
                      {result.voiceAnalysis && (
                        <div className="text-xs space-y-1">
                          <div>Transcription: {result.voiceAnalysis.transcriptionAccuracy}%</div>
                          <div>Content Match: {result.voiceAnalysis.contentMatch}%</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!assessmentStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>

          <Card className="text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🧠</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">AI-Powered Assessment</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Take a comprehensive assessment with AI-generated questions including:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">7 MCQ Questions</h3>
                <p className="text-sm text-gray-600">Multiple choice questions on various topics</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <Code className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">2 Coding Questions</h3>
                <p className="text-sm text-gray-600">Programming challenges with AI evaluation</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Volume2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">3 Voice Questions</h3>
                <p className="text-sm text-gray-600">Speak your answers with real-time transcription</p>
              </div>
            </div>

            <Button 
              onClick={startAssessment}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                'Start AI Assessment'
              )}
            </Button>
          </Card>
        </div>
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
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getQuestionIcon(currentQuestion.type)}
              <span className="capitalize">{currentQuestion.type} Question</span>
              <Badge variant="outline">{currentQuestion.difficulty}</Badge>
              {currentQuestion.voiceEnabled && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Voice Enabled
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium text-gray-800">
              {currentQuestion.question}
            </div>

            {/* MCQ Options */}
            {currentQuestion.type === 'mcq' && currentQuestion.options && (
              <RadioGroup
                value={currentAnswer}
                onValueChange={setCurrentAnswer}
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
            )}

            {/* Coding Question */}
            {currentQuestion.type === 'coding' && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-purple-800">Code Template:</h4>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-[140px] h-8">
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
                  {currentQuestion.codeTemplate && (
                    <pre className="text-sm bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                      {currentQuestion.codeTemplate}
                    </pre>
                  )}
                </div>
                <Textarea
                  placeholder="Write your solution here..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            )}

            {/* Voice/Text Answer */}
            {(currentQuestion.type === 'voice' || (!currentQuestion.options && currentQuestion.type !== 'coding')) && (
              <div className="space-y-4">
                <Textarea
                  placeholder={currentQuestion.voiceEnabled ? "Type your answer or use voice input..." : "Type your answer here..."}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="min-h-[120px]"
                />
                
                {currentQuestion.voiceEnabled && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={toggleSpeechRecognition}
                      className={`flex items-center gap-2 ${isListening ? 'bg-green-50 border-green-300 text-green-700' : ''}`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          Stop Voice Typing
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          Start Voice Typing
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex items-center gap-2 ${isRecording ? 'bg-red-50 border-red-300 text-red-700' : ''}`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          Record Audio
                        </>
                      )}
                    </Button>
                    
                    {recordedAudioUrl && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const audio = new Audio(recordedAudioUrl);
                          audio.play();
                        }}
                        className="flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Play Back
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                onClick={submitAnswer}
                disabled={(!currentAnswer.trim() && !recordedAudioUrl) || evaluating}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Answer
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice Status */}
        {(isListening || isRecording) && (
          <Card className={`border-2 ${isListening ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className={`flex items-center gap-2 ${isListening ? 'text-green-700' : 'text-red-700'}`}>
                <div className={`w-3 h-3 rounded-full animate-pulse ${isListening ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">
                  {isListening ? 'Voice Typing Active...' : 'Recording Audio...'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedAssessment;
