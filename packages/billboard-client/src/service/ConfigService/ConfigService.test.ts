import { ConfigService } from './ConfigService';

describe('ConfigService', () => {
    afterEach(() => {
        process.env = {};
    });
    it('should throw an error if env.time is not set', () => {
        const { time, privateKey, ensNames, mediators } = process.env;
        process.env.privateKey = '';
        process.env.ensNames = JSON.stringify([]);
        process.env.mediators = JSON.stringify([]);

        expect(() => {
            ConfigService().readConfigFromEnv();
        }).toThrowError('Invalid ENV; env.time is required');
    });
    it('should throw an error if env.privateKey is not set', () => {
        const { time, privateKey, ensNames, mediators } = process.env;
        process.env.time = '1';
        process.env.ensNames = JSON.stringify([]);
        process.env.mediators = JSON.stringify([]);
        expect(() => {
            ConfigService().readConfigFromEnv();
        }).toThrowError('Invalid ENV; env.privateKey is required');
    });
    it('should throw an error if env.ensNames is not set', () => {
        const { time, privateKey, ensNames, mediators } = process.env;
        process.env.time = '1';
        process.env.privateKey = '0x';
        process.env.mediators = JSON.stringify([]);
        expect(() => {
            ConfigService().readConfigFromEnv();
        }).toThrowError('Invalid ENV; env.ensNames is required');
    });
    it('should throw an error if env.ensNames is not an array', () => {
        const { time, privateKey, ensNames, mediators } = process.env;
        process.env.time = '1';
        process.env.privateKey = '0x';
        process.env.ensNames = 'alice.eth';
        process.env.mediators = JSON.stringify([]);
        expect(() => {
            ConfigService().readConfigFromEnv();
        }).toThrowError('Invalid ENV; env.ensNames must a valid JSON array');
    });
    it('should throw an error if env.mediators is not set', () => {
        const { time, privateKey, ensNames, mediators } = process.env;
        process.env.time = '1';
        process.env.privateKey = '0x';
        process.env.ensNames = JSON.stringify([]);
        expect(() => {
            ConfigService().readConfigFromEnv();
        }).toThrowError('Invalid ENV; env.mediators is required');
    });
    it('should throw an error if env.mediators is not an array', () => {
        const { time, privateKey, ensNames, mediators } = process.env;
        process.env.time = '1';
        process.env.privateKey = '0x';
        process.env.ensNames = JSON.stringify([]);
        process.env.mediators = 'alice.eth';
        expect(() => {
            ConfigService().readConfigFromEnv();
        }).toThrowError('Invalid ENV; env.mediators must a valid JSON array');
    });
});
