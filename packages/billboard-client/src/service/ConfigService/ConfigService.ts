export interface BillboardClientConfig {
    /**
     * Time value for the configuration.
     */
    time: number;
    /**
     * Private key for the configuration.
     */
    privateKey: string;
    /**
     * Array of ENS names for the configuration.
     */
    ensNames: string[];
    /**
     * Array of mediators for the configuration.
     */
    mediators: string[];
}
/**
 * Service for reading the configuration from the environment variables.
 */
export function ConfigService() {
    /**
     * Reads the configuration from the environment variables.
     * @returns The BillboardClientConfig object.
     * @throws Error if any required environment variable is missing or invalid.
     */
    const readConfigFromEnv = () => {
        const { time, privateKey, ensNames, mediators } = process.env;

        if (!time || isNaN(Number(time))) {
            throw new Error('Invalid ENV; env.time is required');
        }

        if (!privateKey) {
            throw new Error('Invalid ENV; env.privateKey is required');
        }
        if (!ensNames) {
            throw new Error('Invalid ENV; env.ensNames is required');
        }
        let _ensNames;
        try {
            _ensNames = JSON.parse(ensNames);
            if (!Array.isArray(_ensNames)) {
                throw new Error('Invalid ENV; env.ensNames must be an array');
            }
        } catch (err) {
            throw new Error(
                'Invalid ENV; env.ensNames must a valid JSON array',
            );
        }

        if (!mediators) {
            throw new Error('Invalid ENV; env.mediators is required');
        }
        let _mediators;
        try {
            _mediators = JSON.parse(mediators);
            if (!Array.isArray(_mediators)) {
                throw new Error('Invalid ENV; env.mediators must be an array');
            }
        } catch (err) {
            throw new Error(
                'Invalid ENV; env.mediators must a valid JSON array',
            );
        }

        const config: BillboardClientConfig = {
            time: Number(time),
            privateKey,
            ensNames: _ensNames,
            mediators: _mediators,
        };

        return config;
    };

    return { readConfigFromEnv };
}
