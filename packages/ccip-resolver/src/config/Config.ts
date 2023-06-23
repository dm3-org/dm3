export interface SigningConfigEntry {
    type: 'signing';
    handlerUrl: string;
}

export interface OptimismBedrockConfigEntry {
    type: 'optimism-bedrock';
}

export type ConfigEntry = SigningConfigEntry | OptimismBedrockConfigEntry;

export function isSigningConfigEntry(
    configEntry: ConfigEntry,
): configEntry is SigningConfigEntry {
    return configEntry.type === 'signing';
}

export function isOptimismBedrockConfigEntry(
    configEntry: ConfigEntry,
): configEntry is OptimismBedrockConfigEntry {
    return configEntry.type === 'optimism-bedrock';
}

export type Config = Record<string, ConfigEntry>;
