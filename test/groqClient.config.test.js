const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('child_process');

test('callWithRetry returns a controlled error when API keys are unavailable', () => {
    const result = spawnSync(
        process.execPath,
        [
            '-e',
            `
            process.env.GROQ_API_KEYS = 'fake-key-1,fake-key-2';
            process.env.GROQ_API_KEY = '';

            const { callWithRetry } = require('./api/utils/groqClient');

            callWithRetry('test prompt')
                .then(() => process.exit(1))
                .catch(error => {
                    console.log(error.message);
                    console.log('STATUS:', error.statusCode);
                    process.exit(error.statusCode >= 400 ? 0 : 1);
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
        /AI service error/
    );

    assert.match(
        result.stdout,
        /STATUS:/
    );
});