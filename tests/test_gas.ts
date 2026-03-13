// Entry point for GAS tests
import './polyfills'; // Ensure polyfills are loaded
import { Tester } from './Tester';
import { TestContext, Logger, TestConfig } from './types';
import * as configuration from '../src/configuration';
import { GASLogger, getLogLevel } from '../src/logger';

// Config wrapper using the bundled configuration object
class GASConfig implements TestConfig {
    private config: any;
    private secrets: any;

    constructor(configModule: any) {
        this.config = configModule.config;
        this.secrets = configModule.secrets;
    }

    get(key: string): string | null {
        // Check secrets first
        if (this.secrets && this.secrets[key]) {
            return this.secrets[key];
        }
        
        if (this.config && this.config.dev && this.config.dev[key]) {
            return this.config.dev[key];
        }
        
        return null;
    }
}

// Global function to be triggered from GAS UI
// @ts-ignore
globalThis.runTestInternal = async function() {
    // Get log level from config if available
    const config = (configuration as any).config || {};
    const envConfig = config.development || config || {};
    const logLevelStr = envConfig.logLevel || 'INFO';
    const logLevel = getLogLevel(logLevelStr);

    const logger = new GASLogger(logLevel);
    // Use the imported configuration object
    const configWrapper = new GASConfig(configuration); 
    
    const context: TestContext = {
        logger: logger,
        config: configWrapper
    };

    const tester = new Tester(context);
    await tester.runAll();
}

