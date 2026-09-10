const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('child_process');

test('generate-questions returns 500 when AI service fails', () => {
    const result = spawnSync(
        process.execPath,
        [
            '-e',
            `
            process.env.GROQ_API_KEYS = 'fake-key-1,fake-key-2';

            const handler = require('./api/generate-questions');

            const req = {
                method: 'POST',
                body: {
                    role: 'Java Developer',
                    difficulty: 'Medium'
                }
            };

            const res = {
                statusCode: 200,
                body: null,

                setHeader() {
                    return this;
                },

                status(code) {
                    this.statusCode = code;
                    return this;
                },

                json(data) {
                    this.body = data;
                    console.log(JSON.stringify({
                     statusCode: this.statusCode,
                     body: this.body
                    }));
                }
            };

            Promise.resolve(handler(req, res))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                })
                .then(() => {
                    if (res.statusCode === 500) {
                        process.exit(0);
                    }

                    process.exit(1);
                });
            `
        ],
        {
            cwd: process.cwd(),
            env: {
                ...process.env,
                GROQ_API_KEYS: 'fake-key-1,fake-key-2',
                GROQ_API_KEY: ''
            },
            encoding: 'utf8'
        }
    );

    assert.strictEqual(result.status, 0);

    assert.match(
        result.stdout,
        /"statusCode":500/
    );
});

test('evaluate-answer returns 500 when AI service fails', () => {
    const result = spawnSync(
        process.execPath,
        [
            '-e',
            `
            process.env.GROQ_API_KEYS = 'fake-key-1,fake-key-2';

            const handler = require('./api/evaluate-answer');

            const req = {
                method: 'POST',
                body: {
                    question: 'What is inheritance in Java?',
                    userAnswer: 'Inheritance allows one class to acquire properties of another class.'
                }
            };

            const res = {
                statusCode: 200,
                body: null,

                setHeader() {
                    return this;
                },

                status(code) {
                    this.statusCode = code;
                    return this;
                },

                json(data) {
                    this.body = data;
                    console.log(JSON.stringify({
                        statusCode: this.statusCode,
                        body: this.body
                    }));
                }
            };

            Promise.resolve(handler(req, res))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                })
                .then(() => {
                    if (res.statusCode === 500) {
                        process.exit(0);
                    }

                    process.exit(1);
                });
            `
        ],
        {
            cwd: process.cwd(),
            env: {
                ...process.env,
                GROQ_API_KEYS: 'fake-key-1,fake-key-2',
                GROQ_API_KEY: ''
            },
            encoding: 'utf8'
        }
    );

    assert.strictEqual(result.status, 0);

    assert.match(
        result.stdout,
        /"statusCode":500/
    );
});