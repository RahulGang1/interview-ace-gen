
const API_KEY = "AIzaSyClhA0IupF8uw_Da4yUNtJiLC96oS8DJQE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export interface AIQuestion {
  id: string;
  type: 'theory' | 'coding';
  question: string;
  options?: string[];
  expectedAnswer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface AIFeedback {
  score: number;
  overallFeedback: string;
  questionFeedbacks: {
    questionId: string;
    isCorrect: boolean;
    feedback: string;
    correctAnswer?: string;
  }[];
  focusAreas: string[];
  recommendedTopics: string[];
}

export async function generateQuestions(
  topic: string,
  difficulty: string,
  theoryCount: number,
  codingCount: number
): Promise<AIQuestion[]> {
  // Generate unique timestamp to ensure different questions each time
  const timestamp = Date.now();
  const randomSeed = Math.random().toString(36).substring(7);
  
  const prompt = `Generate ${theoryCount + codingCount} UNIQUE technical interview questions for ${topic === 'All' ? 'web development (React, JavaScript, CSS, HTML, Node.js)' : topic}.

IMPORTANT: 
- Use this seed for uniqueness: ${timestamp}-${randomSeed}
- Generate completely NEW and UNIQUE questions each time
- Avoid common/basic questions, focus on practical scenarios
- Questions should test real-world problem-solving skills

Requirements:
- ${theoryCount} theory questions (multiple choice with 4 options each)
- ${codingCount} coding questions (problem statements with expected solutions)
- Difficulty: ${difficulty === 'all' ? 'mix of easy, medium, hard' : difficulty}
- Minimum 10 questions total
- Each question should be unique and relevant to ${topic}
- Focus on current industry practices and latest standards

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "unique-id-${timestamp}-1",
    "type": "theory",
    "question": "Explain the concept of React Server Components and their benefits over traditional client components",
    "options": ["Only for SEO optimization", "Reduces bundle size and improves performance", "Just for server-side rendering", "Same as regular components"],
    "expectedAnswer": "Reduces bundle size and improves performance",
    "difficulty": "medium",
    "topic": "${topic}"
  },
  {
    "id": "unique-id-${timestamp}-2", 
    "type": "coding",
    "question": "Create a custom React hook that debounces user input for search functionality",
    "expectedAnswer": "function useDebounce(value, delay) { const [debouncedValue, setDebouncedValue] = useState(value); useEffect(() => { const handler = setTimeout(() => setDebouncedValue(value), delay); return () => clearTimeout(handler); }, [value, delay]); return debouncedValue; }",
    "difficulty": "medium",
    "topic": "${topic}"
  }
]`;

  try {
    console.log('Making API request to Gemini for unique questions...');
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
        }]
      })
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);

    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from AI');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    console.log('AI Response text:', aiResponse);
    
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI - no JSON found');
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    console.log('Parsed questions:', questions);
    
    // Ensure minimum 10 questions
    if (questions.length < 10) {
      throw new Error(`Generated only ${questions.length} questions, need at least 10`);
    }
    
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    if (error.message.includes('overloaded')) {
      throw new Error('AI service is temporarily overloaded. Please try again in a few moments.');
    }
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

export async function evaluateAnswers(
  questions: AIQuestion[],
  userAnswers: Record<string, string>
): Promise<AIFeedback> {
  const prompt = `Evaluate these interview answers and provide detailed feedback with focus areas for improvement:

Questions and User Answers:
${questions.map(q => `
Question: ${q.question}
Type: ${q.type}
Topic: ${q.topic}
Difficulty: ${q.difficulty}
${q.options ? `Options: ${q.options.join(', ')}` : ''}
Expected Answer: ${q.expectedAnswer}
User Answer: ${userAnswers[q.id] || 'No answer provided'}
`).join('\n')}

Please evaluate each answer and provide:
1. Overall score (0-100)
2. General feedback message
3. Individual question feedback with correct answers for wrong answers
4. Top 3 focus areas where the candidate needs improvement
5. Recommended topics to study based on weak areas

Return ONLY valid JSON in this format:
{
  "score": 85,
  "overallFeedback": "Great performance! You showed strong understanding of React concepts. However, you need to focus more on advanced JavaScript concepts and algorithm optimization.",
  "questionFeedbacks": [
    {
      "questionId": "question-id",
      "isCorrect": true,
      "feedback": "Excellent! Your answer demonstrates clear understanding of the concept.",
      "correctAnswer": "Only include if answer was wrong"
    }
  ],
  "focusAreas": [
    "JavaScript ES6+ features and async programming",
    "React performance optimization techniques", 
    "Algorithm time complexity analysis"
  ],
  "recommendedTopics": [
    "Study Promise.all() and async/await patterns",
    "Learn React.memo and useMemo for optimization",
    "Practice data structures and algorithms"
  ]
}`;

  try {
    console.log('Evaluating answers with AI...');
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
        }]
      })
    });

    const data = await response.json();
    console.log('Evaluation response:', data);

    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from AI');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid feedback format from AI');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error evaluating answers:', error);
    if (error.message.includes('overloaded')) {
      throw new Error('AI service is temporarily overloaded. Please try again in a few moments.');
    }
    throw new Error(`Failed to evaluate answers: ${error.message}`);
  }
}
