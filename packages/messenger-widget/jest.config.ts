import type { Config } from 'jest';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-expect-error
global.TextDecoder = TextDecoder;

const config: Config = {
    verbose: true,
};

export default config;
