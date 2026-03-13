// src/node-client.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { HttpClient, RequestConfig, Response } from './http-client';

export class NodeClient implements HttpClient {
    private client: AxiosInstance;

    constructor(config: RequestConfig = {}) {
        this.client = axios.create({
            baseURL: config.baseURL,
            headers: config.headers as any,
            params: config.params,
            responseType: config.responseType,
            withCredentials: config.withCredentials
        });
    }

    get defaults(): RequestConfig {
        return this.client.defaults as unknown as RequestConfig;
    }

    get interceptors() {
        return {
            request: {
                use: (onFulfilled: any, onRejected: any) => this.client.interceptors.request.use(onFulfilled, onRejected)
            },
            response: {
                use: (onFulfilled: any, onRejected: any) => this.client.interceptors.response.use(onFulfilled, onRejected)
            }
        };
    }

    async get<T = any>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
        const result = await this.client.get(url, config as any);
        return this.mapResponse(result);
    }

    async post<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<Response<T>> {
        const result = await this.client.post(url, data, config as any);
        return this.mapResponse(result);
    }

    async put<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<Response<T>> {
        const result = await this.client.put(url, data, config as any);
        return this.mapResponse(result);
    }

    async delete<T = any>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
        const result = await this.client.delete(url, config as any);
        return this.mapResponse(result);
    }

    private mapResponse(axiosRes: AxiosResponse): Response {
        return {
            data: axiosRes.data,
            status: axiosRes.status,
            statusText: axiosRes.statusText,
            headers: axiosRes.headers as unknown as Record<string, string>,
            config: axiosRes.config as unknown as RequestConfig
        };
    }

    static create(config: RequestConfig): NodeClient {
        return new NodeClient(config);
    }
}
