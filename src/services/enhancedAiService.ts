
const API_KEY = "AIzaSyClhA0IupF8uw_Da4yUNtJiLC96oS8DJQE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export interface EnhancedQuestion {
  id: string;
  type: 'mcq' | 'coding' | 'voice';
  question: string;
  options?: string[];
  correctAnswer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  voiceEnabled?: boolean;
  codeTemplate?: string;
  expectedOutput?: string[];
}

export interface AssessmentConfig {
  mcqCount: number;
  codingCount: number;
  voiceCount: number;
  topics: string[];
  difficulty: string;
}

export interface EvaluationResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  codeAnalysis?: {
    syntax: boolean;
    logic: boolean;
    efficiency: string;
    testCases: boolean;
  };
  voiceAnalysis?: {
    transcriptionAccuracy: number;
    contentMatch: number;
    speechErrors: string[];
  };
}

export interface AssessmentResults {
  overallScore: number;
  totalQuestions: number;
  correctAnswers: number;
  categoryScores: Record<string, number>;
  detailedResults: EvaluationResult[];
  feedback: string;
  recommendedAreas: string[];
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      if (error.message.includes('overloaded') || error.message.includes('503')) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
}

export async function generateAssessmentQuestions(config: AssessmentConfig): Promise<EnhancedQuestion[]> {
  const timestamp = Date.now();
  const randomSeed = Math.random().toString(36).substring(7);
  
  const prompt = `Generate EXACTLY ${config.mcqCount + config.codingCount + config.voiceCount} unique assessment questions with the following distribution:

- ${config.mcqCount} MCQ questions (multiple choice with 4 options each)
- ${config.codingCount} coding questions (with code templates and expected outputs)  
- ${config.voiceCount} voice-enabled questions (can be MCQ or theoretical)

Topics: ${config.topics.join(', ')}
Difficulty: ${config.difficulty}
Timestamp: ${timestamp}-${randomSeed}

Requirements:
- Questions should be diverse and test different aspects
- MCQ questions must have exactly 4 options with one correct answer
- Coding questions should include starter code templates and expected outputs
- Voice questions should be suitable for spoken responses
- Mix of categories: technical concepts, problem-solving, general knowledge

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "q-${timestamp}-1",
    "type": "mcq",
    "question": "What is the time complexity of binary search?",
    "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
    "correctAnswer": "O(log n)",
    "category": "Algorithms",
    "difficulty": "medium",
    "voiceEnabled": false
  },
  {
    "id": "q-${timestamp}-2", 
    "type": "coding",
    "question": "Write a function to reverse a string without using built-in methods",
    "correctAnswer": "function reverseString(str) { let result = ''; for(let i = str.length - 1; i >= 0; i--) { result += str[i]; } return result; }",
    "category": "Programming",
    "difficulty": "easy",
    "codeTemplate": "function reverseString(str) {\n  // Your code here\n  return '';\n}",
    "expectedOutput": ["input: 'hello' -> output: 'olleh'", "input: 'world' -> output: 'dlrow'"]
  },
  {
    "id": "q-${timestamp}-3",
    "type": "voice", 
    "question": "Explain how HTTP works in simple terms",
    "correctAnswer": "HTTP is a protocol for transferring data between web browsers and servers using request-response model",
    "category": "Web Technology",
    "difficulty": "medium",
    "voiceEnabled": true
  }
]`;

  try {
    console.log('Generating assessment questions...');
    
    const result = await retryWithBackoff(async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 503) {
          throw new Error('overloaded');
        }
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      return response.json();
    });

    const aiResponse = result.candidates[0].content.parts[0].text;
    console.log('AI Response:', aiResponse);
    
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI - no JSON found');
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    
    // Validate question distribution
    const mcqCount = questions.filter(q => q.type === 'mcq').length;
    const codingCount = questions.filter(q => q.type === 'coding').length;
    const voiceCount = questions.filter(q => q.type === 'voice').length;
    
    console.log(`Generated: ${mcqCount} MCQ, ${codingCount} coding, ${voiceCount} voice questions`);
    
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

export async function evaluateAnswer(question: EnhancedQuestion, userAnswer: string, isVoiceTranscription: boolean = false): Promise<EvaluationResult> {
  const prompt = `Evaluate this answer comprehensively:

Question: ${question.question}
Type: ${question.type}
Expected Answer: ${question.correctAnswer}
User Answer: ${userAnswer}
Is Voice Transcription: ${isVoiceTranscription}

${question.type === 'coding' ? `
Code Template: ${question.codeTemplate}
Expected Outputs: ${question.expectedOutput?.join(', ')}
` : ''}

Provide detailed evaluation with:
1. Correctness (0-100 score)
2. Specific feedback
${question.type === 'coding' ? '3. Code analysis (syntax, logic, efficiency)' : ''}
${isVoiceTranscription ? '4. Voice transcription accuracy analysis' : ''}

Return ONLY valid JSON:
{
  "isCorrect": true/false,
  "score": 85,
  "feedback": "Detailed feedback here...",
  ${question.type === 'coding' ? `"codeAnalysis": {
    "syntax": true,
    "logic": true, 
    "efficiency": "Good - O(n) complexity",
    "testCases": true
  },` : ''}
  ${isVoiceTranscription ? `"voiceAnalysis": {
    "transcriptionAccuracy": 95,
    "contentMatch": 80,
    "speechErrors": ["minor pronunciation issue with 'algorithm'"]
  }` : ''}
}`;

  try {
    const result = await retryWithBackoff(async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 503) {
          throw new Error('overloaded');
        }
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      return response.json();
    });

    const aiResponse = result.candidates[0].content.parts[0].text;
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid evaluation format from AI');
    }
    
    const evaluation = JSON.parse(jsonMatch[0]);
    
    return {
      questionId: question.id,
      userAnswer,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      feedback: evaluation.feedback,
      codeAnalysis: evaluation.codeAnalysis,
      voiceAnalysis: evaluation.voiceAnalysis
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw new Error(`Failed to evaluate answer: ${error.message}`);
  }
}

export async function generateOverallAssessment(results: EvaluationResult[]): Promise<AssessmentResults> {
  const totalQuestions = results.length;
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const overallScore = Math.round((results.reduce((sum, r) => sum + r.score, 0) / totalQuestions));
  
  const categoryScores: Record<string, number> = {};
  const categoryGroups: Record<string, EvaluationResult[]> = {};
  
  // Group by categories (we'll need to enhance this based on question categories)
  results.forEach(result => {
    const category = 'General'; // Default category, should be enhanced
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }
    categoryGroups[category].push(result);
  });
  
  // Calculate category scores
  Object.keys(categoryGroups).forEach(category => {
    const categoryResults = categoryGroups[category];
    categoryScores[category] = Math.round(
      categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length
    );
  });

  const prompt = `Generate comprehensive assessment feedback based on these results:

Total Questions: ${totalQuestions}
Correct Answers: ${correctAnswers}
Overall Score: ${overallScore}%

Individual Results:
${results.map(r => `- ${r.questionId}: ${r.score}% (${r.isCorrect ? 'Correct' : 'Incorrect'})`).join('\n')}

Provide:
1. Overall performance feedback
2. Top 3 recommended improvement areas
3. Strengths identified
4. Next steps for learning

Return ONLY valid JSON:
{
  "feedback": "Comprehensive feedback paragraph...",
  "recommendedAreas": ["Area 1", "Area 2", "Area 3"]
}`;

  try {
    const result = await retryWithBackoff(async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 503) {
          throw new Error('overloaded');
        }
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      return response.json();
    });

    const aiResponse = result.candidates[0].content.parts[0].text;
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid assessment format from AI');
    }
    
    const assessment = JSON.parse(jsonMatch[0]);
    
    return {
      overallScore,
      totalQuestions,
      correctAnswers,
      categoryScores,
      detailedResults: results,
      feedback: assessment.feedback,
      recommendedAreas: assessment.recommendedAreas
    };
  } catch (error) {
    console.error('Error generating assessment:', error);
    return {
      overallScore,
      totalQuestions,
      correctAnswers,
      categoryScores,
      detailedResults: results,
      feedback: `Assessment completed with ${correctAnswers}/${totalQuestions} correct answers (${overallScore}%). Continue practicing to improve your skills.`,
      recommendedAreas: ['Continue practicing', 'Review incorrect answers', 'Focus on weak areas']
    };
  }
}
