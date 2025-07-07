
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, RotateCcw, Home, Volume2, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConversationMessage {
  type: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  questionNumber?: number;
  audioUrl?: string;
}

interface InterviewSimulatorProps {
  onBack: () => void;
}

const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({ onBack }) => {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Sample interview questions with voice-friendly prompts
  const sampleQuestions = [
    "Please tell me about yourself and your professional background. Take your time to speak clearly.",
    "Why are you interested in this particular position? I'd like to hear your thoughts.",
    "What would you say is your greatest professional strength? Please elaborate with examples.",
    "Can you describe a challenging situation you faced at work and how you handled it? Please speak in detail.",
    "Where do you see yourself professionally in the next 5 years? Share your career aspirations.",
    "What motivates you most in your work? I'm interested in your perspective.",
    "How do you typically handle working under pressure or tight deadlines? Please explain your approach.",
    "Tell me about your approach to learning new technologies or skills in your field.",
    "Can you share an experience about working effectively in a team environment?",
    "Do you have any questions about our company or this role? Feel free to speak your mind."
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
          description: "Could not access microphone for live transcription. You can still record audio.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const startInterview = () => {
    setInterviewStarted(true);
    setQuestionCount(1);
    const firstQuestion = sampleQuestions[0];
    
    setConversation([{
      type: 'interviewer',
      content: `Let's begin your interview practice. Here's your first question:\n\n${firstQuestion}`,
      timestamp: new Date(),
      questionNumber: 1
    }]);

    // Speak the first question
    speakText(`Let's begin your interview practice. Here's your first question: ${firstQuestion}`);
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
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your answer clearly. Click stop when finished.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Your audio has been recorded. You can play it back or submit your answer.",
      });
    }
  };

  const playRecordedAudio = () => {
    if (recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      audio.play();
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support live speech recognition. Please use the recording feature instead.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim() && !recordedAudioUrl) {
      toast({
        title: "No Answer Provided",
        description: "Please provide an answer by typing, speaking, or recording audio.",
        variant: "destructive"
      });
      return;
    }

    // Add candidate's answer to conversation
    const candidateMessage: ConversationMessage = {
      type: 'candidate',
      content: currentAnswer || "Audio response recorded",
      timestamp: new Date(),
      audioUrl: recordedAudioUrl || undefined
    };

    setConversation(prev => [...prev, candidateMessage]);
    setCurrentAnswer('');
    setRecordedAudioUrl(null);
    setIsWaitingForResponse(true);

    // Enhanced feedback based on answer analysis
    setTimeout(() => {
      let feedback = "Thank you for your response. ";
      
      // Analyze the answer for better feedback
      if (currentAnswer) {
        const wordCount = currentAnswer.split(' ').length;
        const hasExamples = currentAnswer.toLowerCase().includes('example') || currentAnswer.toLowerCase().includes('instance');
        const isStructured = currentAnswer.includes('first') || currentAnswer.includes('second') || currentAnswer.includes('initially');
        
        if (wordCount < 20) {
          feedback += "Consider providing more detailed responses in actual interviews. ";
        } else if (wordCount > 100) {
          feedback += "Good detailed response! In interviews, try to be concise while covering key points. ";
        } else {
          feedback += "Well-structured response with good detail. ";
        }
        
        if (hasExamples) {
          feedback += "Excellent use of specific examples - this strengthens your answer significantly. ";
        } else if (questionCount <= 4) {
          feedback += "In future responses, consider adding specific examples to make your answers more compelling. ";
        }
        
        if (isStructured) {
          feedback += "I appreciate the structured approach to your answer. ";
        }
      } else {
        feedback += "I heard your audio response. In interviews, speaking clearly and at a moderate pace is important. ";
      }

      // Determine if we should ask next question or end interview
      const shouldContinue = questionCount < sampleQuestions.length && questionCount < 5;
      
      if (shouldContinue) {
        const nextQuestion = sampleQuestions[questionCount];
        const nextQuestionNumber = questionCount + 1;
        
        const interviewerResponse: ConversationMessage = {
          type: 'interviewer',
          content: `${feedback}\n\nNext question:\n\n${nextQuestion}`,
          timestamp: new Date(),
          questionNumber: nextQuestionNumber
        };
        
        setConversation(prev => [...prev, interviewerResponse]);
        setQuestionCount(nextQuestionNumber);
        
        // Speak the feedback and next question
        speakText(`${feedback} Next question: ${nextQuestion}`);
      } else {
        // End interview
        const finalFeedback = `${feedback}\n\nThat concludes our interview practice session. You did well! Here are some key takeaways:\n\n• Practice articulating your thoughts clearly\n• Use specific examples to support your answers\n• Structure your responses logically\n• Maintain good eye contact and professional demeanor\n\nGood luck with your real interviews!`;
        
        const interviewerResponse: ConversationMessage = {
          type: 'interviewer',
          content: finalFeedback,
          timestamp: new Date()
        };
        
        setConversation(prev => [...prev, interviewerResponse]);
        speakText("That concludes our interview practice session. You did well! Good luck with your real interviews!");
      }
      
      setIsWaitingForResponse(false);
    }, 2000);
  };

  const resetInterview = () => {
    setConversation([]);
    setCurrentAnswer('');
    setQuestionCount(0);
    setInterviewStarted(false);
    setIsWaitingForResponse(false);
    setRecordedAudioUrl(null);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if (isRecording) {
      stopRecording();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Voice Interview Simulator
            </Badge>
            {interviewStarted && (
              <Button variant="outline" onClick={resetInterview} className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Voice Interview Practice
                  {questionCount > 0 && (
                    <Badge variant="secondary">Question {questionCount}/5</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {!interviewStarted ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">🎤</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Ready for Voice Interview Practice?
                      </h2>
                      <p className="text-gray-600 max-w-md">
                        I'll ask you questions and you can respond by typing, speaking live, 
                        or recording your voice. Perfect for practicing real interview scenarios!
                      </p>
                      <Button 
                        onClick={startInterview}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                      >
                        Start Voice Interview Practice
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    {/* Conversation History */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {conversation.map((message, index) => (
                        <div key={index} className={`flex ${message.type === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-lg ${
                            message.type === 'candidate' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <div className="font-semibold text-sm mb-1">
                                  {message.type === 'candidate' ? 'You' : 'Interviewer'}
                                  {message.questionNumber && ` (Q${message.questionNumber})`}
                                </div>
                                <div className="whitespace-pre-wrap">{message.content}</div>
                                {message.audioUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const audio = new Audio(message.audioUrl);
                                      audio.play();
                                    }}
                                    className="mt-2 text-white hover:text-gray-200"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Play Recording
                                  </Button>
                                )}
                              </div>
                              {message.type === 'interviewer' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => speakText(message.content)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isWaitingForResponse && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-800 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <span className="ml-2 text-sm">Interviewer is analyzing your response...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={conversationEndRef} />
                    </div>

                    {/* Answer Input */}
                    {interviewStarted && !isWaitingForResponse && questionCount <= 5 && (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Type your answer here, or use voice input options below..."
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          className="min-h-[100px]"
                        />
                        
                        {/* Voice Input Controls */}
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={toggleSpeechRecognition}
                              className={`flex items-center gap-2 ${isListening ? 'bg-red-50 border-red-300' : ''}`}
                            >
                              {isListening ? (
                                <>
                                  <MicOff className="w-4 h-4" />
                                  Stop Live
                                </>
                              ) : (
                                <>
                                  <Mic className="w-4 h-4" />
                                  Live Speech
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
                                onClick={playRecordedAudio}
                                className="flex items-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                Play Back
                              </Button>
                            )}
                          </div>
                          
                          <Button
                            onClick={submitAnswer}
                            disabled={(!currentAnswer.trim() && !recordedAudioUrl) || isWaitingForResponse}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Submit Answer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Voice Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <p className="text-sm text-gray-700"><strong>Live Speech:</strong> Real-time speech-to-text conversion</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <p className="text-sm text-gray-700"><strong>Record Audio:</strong> Record and playback your responses</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <p className="text-sm text-gray-700"><strong>Text Input:</strong> Traditional typing option</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <p className="text-sm text-gray-700"><strong>Audio Feedback:</strong> Hear questions and feedback spoken aloud</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Voice Interview Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• <strong>Speak clearly</strong> and at a moderate pace</p>
                  <p>• <strong>Use the pause</strong> to think before answering</p>
                  <p>• <strong>Practice eye contact</strong> while speaking</p>
                  <p>• <strong>Include specific examples</strong> in your responses</p>
                  <p>• <strong>Structure your answers</strong> logically</p>
                  <p>• <strong>Listen to playback</strong> to self-evaluate</p>
                </div>
              </CardContent>
            </Card>

            {(isListening || isRecording) && (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">
                      {isListening ? 'Live Speech Active...' : 'Recording Audio...'}
                    </span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    {isListening 
                      ? 'Speak clearly - your words will appear in the text box' 
                      : 'Speak your answer - click Stop Recording when finished'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulator;
