import { HttpClient, Response } from './http-client';
import { createHttpClient } from './client-factory';

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthenticationError";
    }
}

// Simple type alias for generic JSON objects
export type JSONDict = { [key: string]: any };

/* 
 * Decorator for requiring authentication.
 * Using a method decorator pattern in TypeScript.
 */
export function requireAuthentication(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        const instance = this as unknown as SpondBase; // Type assertion to SpondBase
        if (!instance.token) {
            try {
                await instance.login();
            } catch (e) {
                // In Python, this closes the session. In Axios, we don't explicitly close a stateless client, 
                // but we forward the error.
                throw e;
            }
        }
        return originalMethod.apply(this, args);
    };

    return descriptor;
}


export abstract class SpondBase {
    protected username?: string;
    protected password?: string;
    protected apiUrl: string;
    protected client: HttpClient;
    public token: string | null = null;
    protected cookies: Map<string, string>;

    constructor(username: string, password: string, apiUrl: string) {
        this.username = username;
        this.password = password;
        this.apiUrl = apiUrl;
        this.cookies = new Map<string, string>();

        this.client = createHttpClient({
            baseURL: this.apiUrl,
        });

        // Add request interceptor to attach cookies
        // @ts-ignore
        this.client.interceptors.request.use(async (config: any) => {
            // Attach bearer token if exists
            if (this.token) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${this.token}`;
            }
            
            // Attach cookies
            if (this.cookies.size > 0) {
                const cookieParts: string[] = [];
                this.cookies.forEach((value, key) => {
                    cookieParts.push(`${key}=${value}`);
                });
                const cookieString = cookieParts.join('; ');
                config.headers = config.headers || {};
                config.headers['Cookie'] = cookieString;
            }
            
            config.headers = config.headers || {};
            config.headers['Content-Type'] = 'application/json';
            return config;
        });

        // Add response interceptor to store cookies
        // @ts-ignore
        this.client.interceptors.response.use(async (response: any) => {
            const headers = response.headers || {};
            // Handle case-insensitive headers if needed, but GAS usually returns standard casing or lower-case depending on run
            // Let's check typical keys
            const setCookie = headers['Set-Cookie'] || headers['set-cookie'];
            
            if (setCookie) {
                const cookiesToSet = Array.isArray(setCookie) ? setCookie : [setCookie];
                cookiesToSet.forEach((cookieStr: string) => {
                    // Simple parsing: NAME=VALUE; Path=...
                    const firstPart = cookieStr.split(';')[0];
                    const [key, ...valParts] = firstPart.split('=');
                    const value = valParts.join('=');
                    if (key && value) {
                        this.cookies.set(key.trim(), value.trim());
                    }
                });
            }
            return response;
        });
    }

    protected get authHeaders(): JSONDict {
        return {
            "content-type": "application/json",
            "Authorization": `Bearer ${this.token}`,
        };
    }

    public async login(): Promise<void> {
        const loginUrl = `login`;
        const data = { email: this.username, password: this.password };

        try {
            const r: Response = await this.client.post(loginUrl, data);
            const loginResult = r.data;
            this.token = loginResult.loginToken;

            if (!this.token) {
                const errMsg = `Login failed. Response received: ${JSON.stringify(loginResult)}`;
                throw new AuthenticationError(errMsg);
            }
        } catch (error: any) {
             const errMsg = `Login failed. Error: ${error.message}`;
             throw new AuthenticationError(errMsg);
        }
    }
}
