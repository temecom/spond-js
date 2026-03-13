// Light-weight replacement for Axios using Google Apps Script's native UrlFetchApp

import { HttpClient, RequestConfig, Response } from './http-client';

export type GASRequestConfig = RequestConfig;
export type GASResponse<T = any> = Response<T>;

export class GASClient implements HttpClient {
    public defaults: GASRequestConfig;
    private requestInterceptor: ((config: GASRequestConfig) => GASRequestConfig | Promise<GASRequestConfig>) | null = null;
    private responseInterceptor: ((response: GASResponse) => GASResponse | Promise<GASResponse>) | null = null;

    constructor(config: GASRequestConfig = {}) {
        this.defaults = config;
    }

    get interceptors() {
        return {
            request: {
                use: (onFulfilled: any) => {
                    this.requestInterceptor = onFulfilled;
                    return 0; // mimic ID
                }
            },
            response: {
                use: (onFulfilled: any) => {
                    this.responseInterceptor = onFulfilled;
                    return 0; // mimic ID
                }
            }
        };
    }

    private async request(method: string, url: string, data?: any, config: GASRequestConfig = {}): Promise<GASResponse> {
        // Merge defaults
        let finalConfig: GASRequestConfig = {
            ...this.defaults,
            ...config,
            headers: {
                ...(this.defaults.headers || {}),
                ...(config.headers || {})
            },
            baseURL: this.defaults.baseURL // ensure baseURL is passed
        };

        // Apply request interceptor if exists
        if (this.requestInterceptor) {
            try {
                // Determine full URL for interceptor logic (e.g. cookie matching)
                const fullUrlForInterceptor = this.buildUrl(url, config.params, finalConfig.baseURL);
                finalConfig.url = fullUrlForInterceptor;
                
                const res = await this.requestInterceptor(finalConfig);
                finalConfig = res;
            } catch (e) {
                console.error("Interceptor failed:", e);
                throw e;
            }
        }

        const fetchOptions: any = {
            method: method,
            headers: finalConfig.headers,
            muteHttpExceptions: true
        };

        if (data) {
            if (typeof data === 'object') {
                fetchOptions.contentType = 'application/json';
                fetchOptions.payload = JSON.stringify(data);
            } else {
                fetchOptions.payload = data;
            }
        }

        const fullUrl = this.buildUrl(url, config.params, finalConfig.baseURL);
        console.log(`[GASClient] ${method.toUpperCase()} ${fullUrl}`);
        
        // GAS specific: convert headers to native GAS format if needed, but simple object usually works
        const response = UrlFetchApp.fetch(fullUrl, fetchOptions);
        const responseCode = response.getResponseCode();
        const headers = response.getAllHeaders() as Record<string, string>; // Cast to allow indexing
        
        let responseData: any;
        const configResponseType = finalConfig.responseType || 'json'; // Default to try json
        let responseTextStr = '';

        if (configResponseType === 'arraybuffer') {
             responseData = response.getBlob().getBytes();
        } else if (configResponseType === 'blob') {
             responseData = response.getBlob();
        } else {
             responseTextStr = response.getContentText();
             if (configResponseType === 'json') {
                 // Check content type or just try parsing
                 if (headers['Content-Type'] && headers['Content-Type'].includes('application/json')) {
                     try {
                         responseData = JSON.parse(responseTextStr);
                     } catch (e) {
                         responseData = responseTextStr;
                     }
                 } else {
                     // Fallback: try parsing anyway if it looks like JSON? Or strict?
                     // Axios tries to parse JSON by default if it can.
                     try {
                          responseData = JSON.parse(responseTextStr);
                     } catch (e) {
                          responseData = responseTextStr;
                     }
                 }
             } else {
                 responseData = responseTextStr;
             }
        }

        const result: GASResponse = {
            data: responseData,
            status: responseCode,
            statusText: responseCode.toString(), // GAS doesn't give status text
            headers: headers,
            config: finalConfig
        };

        // Handle errors (Axios throws on 4xx/5xx by default)
        if (responseCode >= 400) {
            const msg = responseTextStr || (typeof responseData === 'string' ? responseData : 'Error');
            const error: any = new Error(`Request failed with status ${responseCode}: ${msg}`);
            error.response = result;
            error.isAxiosError = true; // mimic axios error structure for compatibility
            throw error;
        }

        return result;
    }

    private buildUrl(url: string, params?: Record<string, any>, baseURL?: string): string {
        let fullUrl = url;
        if (!url.startsWith('http') && baseURL) {
            const base = baseURL.endsWith('/') ? baseURL : baseURL + '/';
            const path = url.startsWith('/') ? url.substring(1) : url;
            fullUrl = base + path;
        }
        
        if (params) {
             const parts = [];
             for (const key of Object.keys(params)) {
                 const value = params[key];
                 if (Array.isArray(value)) {
                     value.forEach(v => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
                 } else {
                     parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                 }
             }
             if (parts.length > 0) {
                 fullUrl += (fullUrl.includes('?') ? '&' : '?') + parts.join('&');
             }
        }
        return fullUrl;
    }

    static create(config: GASRequestConfig): GASClient {
        return new GASClient(config);
    }

    async get<T = any>(url: string, config?: GASRequestConfig): Promise<GASResponse<T>> {
        return this.request('get', url, undefined, config);
    }

    async post<T = any>(url: string, data?: any, config?: GASRequestConfig): Promise<GASResponse<T>> {
        return this.request('post', url, data, config);
    }

    async put<T = any>(url: string, data?: any, config?: GASRequestConfig): Promise<GASResponse<T>> {
        return this.request('put', url, data, config);
    }

    async delete<T = any>(url: string, config?: GASRequestConfig): Promise<GASResponse<T>> {
        return this.request('delete', url, undefined, config);
    }
}
