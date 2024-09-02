import { validateSchema } from './validateSchema';

describe('Schema check', () => {
    describe('enforce presence', () => {
        it('Should return true if key is present', async () => {
            const schema = {
                type: 'object',
                properties: {
                    key0: { type: 'string' },
                },
                required: ['key0'],
                additionalProperties: false,
            };

            const data = {
                key0: 'value0',
            };

            const isValid = validateSchema(schema, data);
            expect(isValid).toBe(true);
        });
        it('Should return false if a required key is missing', async () => {
            const schema = {
                type: 'object',
                properties: {
                    key0: { type: 'string' },
                    key1: { type: 'string' },
                },
                required: ['key0', 'key1'],
                additionalProperties: false,
            };

            const data = {
                key0: 'value0',
            };

            const isValid = validateSchema(schema, data);
            expect(isValid).toBe(false);
        });
        it('Should return true if a non-required key is missing', async () => {
            const schema = {
                type: 'object',
                properties: {
                    key0: { type: 'string' },
                    key1: { type: 'string' },
                },
                required: ['key0'],
                additionalProperties: false,
            };

            const data = {
                key0: 'value0',
            };

            const isValid = validateSchema(schema, data);
            expect(isValid).toBe(true);
        });
    });
    describe('enforce absence', () => {
        it('Should return false if an additional key is present', async () => {
            const schema = {
                type: 'object',
                properties: {
                    key0: { type: 'string' },
                },
                required: ['key0'],
                additionalProperties: false,
            };

            const data = {
                key0: 'value0',
                key1: 'value1',
            };

            const isValid = validateSchema(schema, data);
            expect(isValid).toBe(false);
        });
    });
    describe('enforce type', () => {
        it('Should return false if an additional key is present', async () => {
            const schema = {
                type: 'object',
                properties: {
                    key0: { type: 'string' },
                },
            };

            // this is a string, not an object
            const data = "key0: 'value0'";

            const isValid = validateSchema(schema, data);
            expect(isValid).toBe(false);
        });
    });
});
