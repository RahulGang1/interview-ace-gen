
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
}

export async function generateQuestions(
  topic: string,
  difficulty: string,
  theoryCount: number,
  codingCount: number
): Promise<AIQuestion[]> {
  const prompt = `Generate ${theoryCount + codingCount} technical interview questions for ${topic === 'All' ? 'web development (React, JavaScript, CSS, HTML, Node.js)' : topic}.

Requirements:
- ${theoryCount} theory questions (multiple choice with 4 options each)
- ${codingCount} coding questions (problem statements with expected solutions)
- Difficulty: ${difficulty === 'all' ? 'mix of easy, medium, hard' : difficulty}
- Minimum 10 questions total
- Each question should be unique and relevant to ${topic}

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "unique-id-1",
    "type": "theory",
    "question": "What is the purpose of useEffect in React?",
    "options": ["For state management", "For side effects", "For styling", "For routing"],
    "expectedAnswer": "For side effects",
    "difficulty": "medium",
    "topic": "${topic}"
  },
  {
    "id": "unique-id-2", 
    "type": "coding",
    "question": "Write a function to reverse a string in JavaScript",
    "expectedAnswer": "function reverseString(str) { return str.split('').reverse().join(''); }",
    "difficulty": "easy",
    "topic": "${topic}"
  }
]`;

  try {
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
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    
    // Ensure minimum 10 questions
    if (questions.length < 10) {
      throw new Error('Generated less than 10 questions');
    }
    
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate questions');
  }
}

export async function evaluateAnswers(
  questions: AIQuestion[],
  userAnswers: Record<string, string>
): Promise<AIFeedback> {
  const prompt = `Evaluate these interview answers and provide detailed feedback:

Questions and User Answers:
${questions.map(q => `
Question: ${q.question}
Type: ${q.type}
${q.options ? `Options: ${q.options.join(', ')}` : ''}
Expected Answer: ${q.expectedAnswer}
User Answer: ${userAnswers[q.id] || 'No answer provided'}
`).join('\n')}

Please evaluate each answer and provide:
1. Overall score (0-100)
2. General feedback message
3. Individual question feedback with correct answers for wrong answers

Return ONLY valid JSON in this format:
{
  "score": 85,
  "overallFeedback": "Great performance! You showed strong understanding of React concepts...",
  "questionFeedbacks": [
    {
      "questionId": "question-id",
      "isCorrect": true,
      "feedback": "Excellent! Your answer demonstrates...",
      "correctAnswer": "Only include if answer was wrong"
    }
  ]
}`;

  try {
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
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid feedback format from AI');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error evaluating answers:', error);
    throw new Error('Failed to evaluate answers');
  }
}
