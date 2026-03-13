import { Tester } from './Tester';
import * as fs from 'fs';
import * as path from 'path';
import { Logger, TestConfig, TestContext } from './types';
import { ConsoleLogger, getLogLevel } from '../src/logger';
// @ts-ignore
import configCjs from '../config.cjs';

const secretsPath = path.resolve(__dirname, '../secrets.cjs');
if (!fs.existsSync(secretsPath)) {
    console.error(`Error: Secrets file not found at ${secretsPath}`);
    process.exit(1);
}

const secrets = require('../secrets.cjs');

class LocalConfig implements TestConfig {
    get(key: string): string | null {
        return secrets[key] || null;
    }
}

async function test() {
    const testConfig = (configCjs as any).test || {};
    const logLevelStr = testConfig.logLevel || 'INFO';
    const logLevel = getLogLevel(logLevelStr);

    const logger = new ConsoleLogger(logLevel);
    const config = new LocalConfig();
    const context: TestContext = { logger, config };
    
    const tester = new Tester(context);
    await tester.runAll();
}
test();
