import { HttpClient, RequestConfig } from './http-client';
import { GASClient } from './gas-client';

// Simple factory that determines which client to use based on environment
export function createHttpClient(config: RequestConfig): HttpClient {
    // Check for GAS environment
    // @ts-ignore
    if (typeof UrlFetchApp !== 'undefined') {
        return new GASClient(config);
    } else {
        // Dynamic require to avoid bundling axios in GAS build
        // This is a bit hacky but works for keeping the bundle clean if the bundler supports it
        // Or we just rely on tree shaking if we set up alias correctly.
        // For 'ts-node', it will work. For Vite GAS build, we want to alias this file or the import.
        
        // Actually, let's try to look for the NodeClient.
        // If we import it directly here:
        // import { NodeClient } from './node-client';
        // return new NodeClient(config);
        
        // The bundler (Vite) will pull in NodeClient -> Axios.
        // We need to prevent that for GAS build.
        
        // Option 1: Use a variable that Vite replaces.
        // Option 2: Use separate entry points/aliases.
        
        // Since we are using Vite for GAS, we can alias 'node-client' to a dummy or just rely on 'sideEffects: false'.
        // But better:
        // Use a require() wrapped in a check that Vite can dead-code eliminate?
        // const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
        
        try {
            // This is primarily for local testing via ts-node
            // @ts-ignore
            const { NodeClient } = require('./node-client');
            return new NodeClient(config);
        } catch (e) {
            console.error('Failed to load NodeClient. Ensure axios is installed if running in Node.', e);
            throw e;
        }
    }
}
