import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { CookieJar } from 'tough-cookie';

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
    protected client: AxiosInstance;
    public token: string | null = null;
    protected cookieJar: CookieJar;

    constructor(username: string, password: string, apiUrl: string) {
        this.username = username;
        this.password = password;
        this.apiUrl = apiUrl;
        this.cookieJar = new CookieJar();

        this.client = axios.create({
            baseURL: this.apiUrl,
        });

        // Add request interceptor to attach cookies
        this.client.interceptors.request.use(async (config) => {
            // Attach bearer token if exists
            if (this.token) {
                config.headers['Authorization'] = `Bearer ${this.token}`;
            }
            
            // Attach cookies
            // Note: In browser environments this is handled automatically. 
            // In Node, we must manage the Cookie header manually or use an agent.
            // Since we are mocking aiohttp behavior, we'll use tough-cookie.
            const url = config.url ? (config.url.startsWith('http') ? config.url : `${config.baseURL || ''}${config.url}`) : '';
            if (url) {
                const cookieString = await this.cookieJar.getCookieString(url);
                if (cookieString) {
                    config.headers['Cookie'] = cookieString;
                }
            }
            
            config.headers['Content-Type'] = 'application/json';
            return config;
        });

        // Add response interceptor to store cookies
        this.client.interceptors.response.use(async (response) => {
            const setCookie = response.headers['set-cookie'];
            if (setCookie && response.config.url) {
                const url = response.config.url.startsWith('http') ? response.config.url : `${response.config.baseURL || ''}${response.config.url}`;
                 // setCookie can be a string or array of strings
                if (Array.isArray(setCookie)) {
                    for (const cookie of setCookie) {
                        await this.cookieJar.setCookie(cookie, url);
                    }
                } else if (typeof setCookie === 'string') {
                    await this.cookieJar.setCookie(setCookie, url);
                }
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
        const loginUrl = `${this.apiUrl}login`;
        const data = { email: this.username, password: this.password };

        try {
            const r: AxiosResponse = await this.client.post(loginUrl, data);
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
