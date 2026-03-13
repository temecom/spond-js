export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}

export interface ILogger {
    log(message: string): void;
    error(message: string): void;
    warn?(message: string): void;
    info?(message: string): void;
}

export function getLogLevel(level: string): LogLevel {
    switch (level?.toUpperCase()) {
        case 'DEBUG': return LogLevel.DEBUG;
        case 'INFO': return LogLevel.INFO;
        case 'WARN': return LogLevel.WARN;
        case 'ERROR': return LogLevel.ERROR;
        case 'NONE': return LogLevel.NONE;
        default: return LogLevel.INFO;
    }
}

export class GASLogger implements ILogger {
    private level: LogLevel;

    constructor(level: LogLevel = LogLevel.INFO) {
        this.level = level;
    }

    log(message: string): void {
        if (this.level <= LogLevel.DEBUG) {
            Logger.log(message);
        }
    }

    error(message: string): void {
        if (this.level <= LogLevel.ERROR) {
            Logger.log(`ERROR: ${message}`);
        }
    }

    warn(message: string): void {
        if (this.level <= LogLevel.WARN) {
            Logger.log(`WARN: ${message}`);
        }
    }

    info(message: string): void {
        if (this.level <= LogLevel.INFO) {
            Logger.log(`INFO: ${message}`);
        }
    }
}

export class ConsoleLogger implements ILogger {
    private level: LogLevel;

    constructor(level: LogLevel = LogLevel.INFO) {
        this.level = level;
    }

    log(message: string): void {
        if (this.level <= LogLevel.DEBUG) {
            console.log(message);
        }
    }

    error(message: string): void {
        if (this.level <= LogLevel.ERROR) {
            console.error(message);
        }
    }

    warn(message: string): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(message);
        }
    }

    info(message: string): void {
        if (this.level <= LogLevel.INFO) {
            console.info(message);
        }
    }
}
