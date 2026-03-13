export interface ILogger {
    log(message: string): void;
    error(message: string): void;
    warn?(message: string): void;
    info?(message: string): void;
}

export class GASLogger implements ILogger {
    log(message: string): void {
        Logger.log(message);
    }

    error(message: string): void {
        Logger.log(`ERROR: ${message}`);
    }

    warn(message: string): void {
        Logger.log(`WARN: ${message}`);
    }

    info(message: string): void {
        Logger.log(`INFO: ${message}`);
    }
}

export class ConsoleLogger implements ILogger {
    log(message: string): void {
        console.log(message);
    }

    error(message: string): void {
        console.error(message);
    }

    warn(message: string): void {
        console.warn(message);
    }

    info(message: string): void {
        console.info(message);
    }
}
