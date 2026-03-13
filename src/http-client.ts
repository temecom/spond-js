export interface RequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, any>;
    baseURL?: string;
    url?: string;
    method?: string;
    responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
    withCredentials?: boolean;
}

export interface Response<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: RequestConfig;
}

export interface HttpClient {
    defaults: RequestConfig;
    interceptors: {
        request: {
            use: (onFulfilled: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>, onRejected?: (error: any) => any) => number;
        };
        response: {
            use: (onFulfilled: (response: Response) => Response | Promise<Response>, onRejected?: (error: any) => any) => number;
        };
    };
    get<T = any>(url: string, config?: RequestConfig): Promise<Response<T>>;
    post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>;
    put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>;
    delete<T = any>(url: string, config?: RequestConfig): Promise<Response<T>>;
}
