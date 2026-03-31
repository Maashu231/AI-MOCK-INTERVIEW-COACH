// This function generates the prompt to create interview questions
const generateQuestionsPrompt = (role, difficulty, round = 'Technical', level = 'Fresher') => {
  return `
    You are a strict and experienced technical interviewer at a top IT company.
    
    Your job is to generate exactly 10 interview questions for a ${role} position
    at ${difficulty} level.

    Candidate Profile:
    - Experience Level: ${level}
    - Interview Round: ${round}
    - Difficulty: ${difficulty}

    Rules you must follow:
    - Questions must be appropriate for the "${round}" interview round:
      * HR Round: Focus on behavioral questions, culture fit, career goals, and soft skills
      * Technical Round: Focus on role-specific technical concepts, architecture, and problem solving
      * Coding Round: Focus on data structures, algorithms, coding patterns, and problem solving
      * Managerial Round: Focus on leadership, project management, decision making, and team dynamics
    - Questions must match the ${difficulty} level strictly
    - Questions should be appropriate for a ${level}-level candidate
    - Questions must be real questions asked in actual company interviews
    - Mix of conceptual, practical and scenario based questions
    - No multiple choice questions
    - Each question must be clear and specific

    Return ONLY a valid JSON array like this example and nothing else:
    [
      "Question 1 here",
      "Question 2 here",
      "Question 3 here"
    ]

    Do not add any explanation, numbering or extra text outside the JSON array.
  `;
};

// This function generates the prompt to evaluate user's answer
const evaluateAnswerPrompt = (question, userAnswer) => {
  return `
    You are a strict and experienced technical interviewer at a top IT company.
    
    A candidate has answered the following interview question:

    Question: "${question}"
    Candidate's Answer: "${userAnswer}"

    Evaluate the answer strictly and return ONLY a valid JSON object like this:
    {
      "score": 7,
      "feedback": "What was good about the answer",
      "improvement": "What was missing or wrong",
      "idealAnswer": "The perfect answer to this question"
    }

    IMPORTANT rules for the "idealAnswer" field:
    - If the question is a CODING question (asking to write code, implement a function, solve a DSA problem):
      * Write clean, well-formatted code with proper indentation
      * Use newline characters (\\n) to separate lines of code
      * Start the code on a new line after a brief one-line explanation
      * Example format: "Use two pointers approach:\\nfunction twoSum(nums, target) {\\n  const map = {};\\n  for (let i = 0; i < nums.length; i++) {\\n    if (map[target - nums[i]] !== undefined) {\\n      return [map[target - nums[i]], i];\\n    }\\n    map[nums[i]] = i;\\n  }\\n}"
    - If the question is a NON-CODING question (conceptual, behavioral, HR, managerial):
      * Keep the ideal answer SHORT — maximum 4 to 6 sentences
      * Write what a smart candidate would say in a real interview, not a textbook essay
      * Be direct and to the point. No filler words or unnecessary elaboration
      * Focus on key points that demonstrate understanding

    Scoring rules:
    - 0 to 3 = Wrong or very incomplete answer
    - 4 to 6 = Partially correct answer
    - 7 to 8 = Good answer with minor gaps
    - 9 to 10 = Perfect and complete answer

    Keep "feedback" to 1-2 sentences.
    Keep "improvement" to 1-2 sentences.
    Do not add any explanation or extra text outside the JSON object.
  `;
};

module.exports = { generateQuestionsPrompt, evaluateAnswerPrompt };