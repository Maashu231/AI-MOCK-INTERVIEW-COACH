const test = require('node:test');
const assert = require('node:assert');

const { extractJSON } = require('../api/utils/groqClient');

test('extractJSON parses normal JSON object', () => {
    const result = extractJSON('{"score": 8}');

    assert.deepStrictEqual(result, {
        score: 8
    });
});

test('extractJSON parses JSON array', () => {
    const result = extractJSON('["Question 1", "Question 2"]');

    assert.deepStrictEqual(result, [
        'Question 1',
        'Question 2'
    ]);
});

test('extractJSON parses markdown JSON', () => {
    const result = extractJSON(`
        \`\`\`json
        {"score": 9}
        \`\`\`
    `);

    assert.deepStrictEqual(result, {
        score: 9
    });
});

test('extractJSON extracts JSON from extra text', () => {
    const result = extractJSON(
        'Here is the result: {"score": 7}'
    );

    assert.deepStrictEqual(result, {
        score: 7
    });
});

test('extractJSON handles nested JSON', () => {
    const result = extractJSON(
        '{"evaluation":{"score":8,"feedback":"Good answer"}}'
    );

    assert.strictEqual(result.evaluation.score, 8);
    assert.strictEqual(result.evaluation.feedback, 'Good answer');
});

test('extractJSON rejects empty input', () => {
    assert.throws(
        () => extractJSON(''),
        /Invalid input/
    );
});

test('extractJSON rejects non-string input', () => {
    assert.throws(
        () => extractJSON(null),
        /Invalid input/
    );
});

test('extractJSON rejects invalid JSON', () => {
    assert.throws(
        () => extractJSON('This is not JSON'),
        /No JSON structure found/
    );
});

test('extractJSON handles complex nested AI response', () => {
    const result = extractJSON(`
        Here is the evaluation result:

        {
            "score": 8,
            "feedback": {
                "strengths": ["Clear explanation", "Good example"],
                "improvements": ["Add more detail"]
            }
        }

        Hope this helps!
    `);

    assert.strictEqual(result.score, 8);
    assert.deepStrictEqual(
        result.feedback.strengths,
        ["Clear explanation", "Good example"]
    );
    assert.deepStrictEqual(
        result.feedback.improvements,
        ["Add more detail"]
    );
});