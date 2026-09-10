const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('child_process');

test('callWithRetry fails safely when no Groq API keys are configured', () => {
    const result = spawnSync(
        process.execPath,
        [
            '-e',
            `
            delete process.env.GROQ_API_KEY;
            delete process.env.GROQ_API_KEYS;

            const { callWithRetry } = require('./api/utils/groqClient');

            callWithRetry('test prompt')
                .then(() => process.exit(1))
                .catch(error => {
                    console.log(error.message);
                    process.exit(error.statusCode === 500 ? 0 : 1);
                });
            `
        ],
        {
            cwd: process.cwd(),
            env: {
                ...process.env,
                GROQ_API_KEY: '',
                GROQ_API_KEYS: ''
            },
            encoding: 'utf8'
        }
    );

    assert.strictEqual(result.status, 0);
    assert.match(
        result.stdout,
        /AI service error/
    );
});