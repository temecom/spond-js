// Entry point for GAS tests
import { Tester } from './Tester';
import { TestContext, Logger, TestConfig } from './types';
import * as configuration from '../src/configuration';

// GAS Logger implementation
class GASLogger implements Logger {
    log(message: string): void {
        console.log(message); // Redirects to Stackdriver logging in GAS V8
    }
    error(message: string): void {
        console.error(message);
    }
}

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
    const logger = new GASLogger();
    // Use the imported configuration object
    const config = new GASConfig(configuration); 
    
    const context: TestContext = {
        logger,
        config
    };

    const tester = new Tester(context);
    await tester.runAll();
}

