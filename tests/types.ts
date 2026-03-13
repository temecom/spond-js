export interface Logger {
    log(message: string): void;
    error(message: string): void;
}

export interface TestConfig {
    get(key: string): string | null;
}

export interface TestContext {
    logger: Logger;
    config: TestConfig;
}
