const test = require('node:test');
const assert = require('node:assert');

const {
    generateQuestionsPrompt,
    evaluateAnswerPrompt
} = require('../api/utils/prompts');

test('generateQuestionsPrompt includes role and difficulty', () => {
    const prompt = generateQuestionsPrompt(
        'Java Developer',
        'Medium',
        'Technical',
        'Fresher'
    );

    assert.ok(prompt.includes('Java Developer'));
    assert.ok(prompt.includes('Medium'));
    assert.ok(prompt.includes('Technical'));
    assert.ok(prompt.includes('Fresher'));
});

test('generateQuestionsPrompt includes resume content', () => {
    const resume = 'Built a Spring Boot REST API project';

    const prompt = generateQuestionsPrompt(
        'Backend Developer',
        'Medium',
        'Technical',
        'Fresher',
        resume
    );

    assert.ok(prompt.includes('Spring Boot REST API project'));
});

test('evaluateAnswerPrompt includes question and answer', () => {
    const question = 'What is polymorphism?';
    const answer = 'Polymorphism allows one interface to have multiple implementations.';

    const prompt = evaluateAnswerPrompt(question, answer);

    assert.ok(prompt.includes(question));
    assert.ok(prompt.includes(answer));
});

test('evaluateAnswerPrompt includes scoring instructions', () => {
    const prompt = evaluateAnswerPrompt(
        'What is inheritance?',
        'Inheritance allows a class to acquire properties from another class.'
    );

    assert.ok(prompt.includes('0 to 3'));
    assert.ok(prompt.includes('9 to 10'));
});