
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
  const totalQuestions = theoryCount + codingCount;
  const timestamp = Date.now();
  const randomSeed = Math.random().toString(36).substring(7);
  
  const prompt = `Generate EXACTLY ${totalQuestions} UNIQUE technical interview questions for ${topic === 'All' ? 'web development (React, JavaScript, CSS, HTML, Node.js)' : topic}.

CRITICAL REQUIREMENTS:
- Generate EXACTLY ${theoryCount} theory questions and EXACTLY ${codingCount} coding questions
- Each theory question MUST have exactly 4 multiple choice options
- Use timestamp seed: ${timestamp}-${randomSeed} for uniqueness
- Generate completely NEW questions each time
- Focus on practical, real-world scenarios
- Questions should test actual problem-solving skills

EXACT DISTRIBUTION:
- Theory Questions: ${theoryCount} (multiple choice with 4 options each)
- Coding Questions: ${codingCount} (problem statements with expected solutions)
- Total: ${totalQuestions} questions (NO MORE, NO LESS)
- Difficulty: ${difficulty === 'all' ? 'mix of easy, medium, hard' : difficulty}

Return ONLY a valid JSON array with EXACTLY ${totalQuestions} questions in this format:
[
  {
    "id": "unique-id-${timestamp}-1",
    "type": "theory",
    "question": "What is the difference between useEffect and useLayoutEffect in React?",
    "options": ["useEffect runs after DOM updates, useLayoutEffect runs before", "They are identical", "useLayoutEffect is deprecated", "useEffect is for class components only"],
    "expectedAnswer": "useEffect runs after DOM updates, useLayoutEffect runs before",
    "difficulty": "medium",
    "topic": "${topic}"
  },
  {
    "id": "unique-id-${timestamp}-2",
    "type": "coding",
    "question": "Write a function that debounces user input with a delay of 500ms",
    "expectedAnswer": "function debounce(func, delay) { let timeoutId; return function(...args) { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(this, args), delay); }; }",
    "difficulty": "medium",
    "topic": "${topic}"
  }
]

IMPORTANT: Generate EXACTLY ${totalQuestions} questions - ${theoryCount} theory + ${codingCount} coding questions.`;

  try {
    console.log(`Generating exactly ${totalQuestions} questions (${theoryCount} theory + ${codingCount} coding)...`);
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
    
    // Ensure we have exactly the requested number of questions
    if (questions.length !== totalQuestions) {
      throw new Error(`Generated ${questions.length} questions, but requested ${totalQuestions}. Please try again.`);
    }
    
    // Verify we have the right distribution
    const theoryQuestions = questions.filter(q => q.type === 'theory');
    const codingQuestions = questions.filter(q => q.type === 'coding');
    
    if (theoryQuestions.length !== theoryCount || codingQuestions.length !== codingCount) {
      throw new Error(`Incorrect question distribution. Expected ${theoryCount} theory and ${codingCount} coding questions.`);
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
