import { Tester } from './Tester';
import * as fs from 'fs';
import * as path from 'path';
import { Logger, TestConfig, TestContext } from './types';

const secretsPath = path.resolve(__dirname, '../secrets.cjs');
if (!fs.existsSync(secretsPath)) {
    console.error(`Error: Secrets file not found at ${secretsPath}`);
    process.exit(1);
}

const secrets = require('../secrets.cjs');

class ConsoleLogger implements Logger {
    log(message: string): void {
        console.log(message);
    }
    error(message: string): void {
        console.error(message);
    }
}

class LocalConfig implements TestConfig {
    get(key: string): string | null {
        return secrets[key] || null;
    }
}

async function test() {
    const logger = new ConsoleLogger();
    const config = new LocalConfig();
    const context: TestContext = { logger, config };
    
    const tester = new Tester(context);
    await tester.runAll();
}
test();
