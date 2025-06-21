import { TwitterApiV2Settings } from '../settings';
import { ApiPartialResponseError, ApiRequestError, ApiResponseError } from '../types';

export class RequestHandlerHelper {
    constructor(requestData) {
        this.requestData = requestData;
        this.requestErrorHandled = false;
        this.responseData = [];
    }
    /* Request helpers */
    get hrefPathname() {
        const url = this.requestData.url;
        return url.hostname + url.pathname;
    }
    isFormEncodedEndpoint() {
        return this.requestData.url.href.startsWith('https://api.x.com/oauth/');
    }
    /* Error helpers */
    createRequestError(error) {
        if (TwitterApiV2Settings.debug) {
            TwitterApiV2Settings.logger.log('Request error:', error);
        }
        return new ApiRequestError('Request failed.', { error });
    }
    createResponseError({ res, data, rateLimit, code }) {
        if (TwitterApiV2Settings.debug) {
            TwitterApiV2Settings.logger.log(`Request failed with code ${code}, data:`, data);
            TwitterApiV2Settings.logger.log('Response headers:', res.headers);
        }
        let errorString = `Request failed with code ${code}`;
        if (data?.errors?.length) {
            const errors = data.errors;
            if ('code' in errors[0]) {
                errorString += ' - ' + this.formatV1Errors(errors);
            } else {
                errorString += ' - ' + this.formatV2Error(data);
            }
        }
        return new ApiResponseError(errorString, {
            code,
            data,
            headers: res.headers,
            rateLimit,
        });
    }
    formatV1Errors(errors) {
        return errors
            .map(({ code, message }) => `${message} (Twitter code ${code})`)
            .join(', ');
    }
    formatV2Error(error) {
        return `${error.title}: ${error.detail} (see ${error.type})`;
    }
    /* Response helpers */
    getRateLimitFromResponse(res) {
        let rateLimit = undefined;
        if (res.headers.get('x-rate-limit-limit')) {
            rateLimit = {
                limit: Number(res.headers.get('x-rate-limit-limit')),
                remaining: Number(res.headers.get('x-rate-limit-remaining')),
                reset: Number(res.headers.get('x-rate-limit-reset')),
            };
            if (res.headers.get('x-app-limit-24hour-limit')) {
                rateLimit.day = {
                    limit: Number(res.headers.get('x-app-limit-24hour-limit')),
                    remaining: Number(res.headers.get('x-app-limit-24hour-remaining')),
                    reset: Number(res.headers.get('x-app-limit-24hour-reset')),
                };
            }
            if (this.requestData.rateLimitSaver) {
                this.requestData.rateLimitSaver(rateLimit);
            }
        }
        return rateLimit;
    }
    /* Request event handlers */
    requestErrorHandler(reject, requestError) {
        var _a, _b;
        (_b = (_a = this.requestData).requestEventDebugHandler) === null || _b === void 0 ? void 0 : _b.call(_a, 'request-error', { requestError });
        this.requestErrorHandled = true;
        reject(this.createRequestError(requestError));
    }
    timeoutErrorHandler() {
        this.requestErrorHandled = true;
        this.req.destroy(new Error('Request timeout.'));
    }
    /* Response event handlers */
    classicResponseHandler(resolve, reject, res) {
        this.res = res;
        const dataStream = this.getResponseDataStream(res);
        // Register the response data
        dataStream.on('data', chunk => this.responseData.push(chunk));
        dataStream.on('end', this.onResponseEndHandler.bind(this, resolve, reject));
        dataStream.on('close', this.onResponseCloseHandler.bind(this, resolve, reject));
        // Debug handlers
        if (this.requestData.requestEventDebugHandler) {
            this.requestData.requestEventDebugHandler('response', { res });
            res.on('aborted', error => this.requestData.requestEventDebugHandler('response-aborted', { error }));
            res.on('error', error => this.requestData.requestEventDebugHandler('response-error', { error }));
            res.on('close', () => this.requestData.requestEventDebugHandler('response-close', { data: this.responseData }));
            res.on('end', () => this.requestData.requestEventDebugHandler('response-end'));
        }
    }
    onResponseEndHandler(resolve, reject) {
        const rateLimit = this.getRateLimitFromResponse(this.res);
        let data;
        try {
            data = this.getParsedResponse(this.res);
        }
        catch (e) {
            reject(this.createPartialResponseError(e, false));
            return;
        }
        // Handle bad error codes
        const code = this.res.statusCode;
        if (code >= 400) {
            reject(this.createResponseError({ data, res: this.res, rateLimit, code }));
            return;
        }
        if (TwitterApiV2Settings.debug) {
            TwitterApiV2Settings.logger.log(`[${this.requestData.options.method} ${this.hrefPathname}]: Request succeeds with code ${this.res.statusCode}`);
            TwitterApiV2Settings.logger.log('Response body:', data);
        }
        resolve({
            data,
            headers: this.res.headers,
            rateLimit,
        });
    }
    onResponseCloseHandler(resolve, reject) {
        const res = this.res;
        if (res.aborted) {
            // Try to parse the request (?)
            try {
                this.getParsedResponse(this.res);
                // Ok, try to resolve normally the request
                return this.onResponseEndHandler(resolve, reject);
            }
            catch (e) {
                // Parse error, just drop with content
                return reject(this.createPartialResponseError(e, true));
            }
        }
        if (!res.complete) {
            return reject(this.createPartialResponseError(new Error('Response has been interrupted before response could be parsed.'), true));
        }
        // else: end has been called
    }
    streamResponseHandler(resolve, reject, res) {
        const code = res.statusCode;
        if (code < 400) {
            if (TwitterApiV2Settings.debug) {
                TwitterApiV2Settings.logger.log(`[${this.requestData.options.method} ${this.hrefPathname}]: Request succeeds with code ${res.statusCode} (starting stream)`);
            }
            const dataStream = this.getResponseDataStream(res);
            // HTTP code ok, consume stream
            resolve({ req: this.req, res: dataStream, originalResponse: res, requestData: this.requestData });
        }
        else {
            // Handle response normally, can only rejects
            this.classicResponseHandler(() => undefined, reject, res);
        }
    }
    /* Wrappers for request lifecycle */
    debugRequest() {
        const url = this.requestData.url;
        TwitterApiV2Settings.logger.log(`[${this.requestData.options.method} ${this.hrefPathname}]`, this.requestData.options);
        if (url.search) {
            TwitterApiV2Settings.logger.log('Request parameters:', [...url.searchParams.entries()].map(([key, value]) => `${key}: ${value}`));
        }
        if (this.requestData.body) {
            TwitterApiV2Settings.logger.log('Request body:', this.requestData.body);
        }
    }
    buildRequest() {
        const url = this.requestData.url;
        const auth = url.username ? `${url.username}:${url.password}` : undefined;
        const headers = this.requestData.options.headers ?? {};

        if (auth) {
            headers['Authorization'] = 'Basic ' + btoa(auth);
        }

        if (TwitterApiV2Settings.debug) {
            this.debugRequest();
        }

        return {
            method: this.requestData.options.method,
            headers: headers,
            body: this.requestData.body,
        };
    }
    registerRequestEventDebugHandlers(req) {
        req.on('close', () => this.requestData.requestEventDebugHandler('close'));
        req.on('abort', () => this.requestData.requestEventDebugHandler('abort'));
        req.on('socket', socket => {
            this.requestData.requestEventDebugHandler('socket', { socket });
            socket.on('error', error => this.requestData.requestEventDebugHandler('socket-error', { socket, error }));
            socket.on('connect', () => this.requestData.requestEventDebugHandler('socket-connect', { socket }));
            socket.on('close', withError => this.requestData.requestEventDebugHandler('socket-close', { socket, withError }));
            socket.on('end', () => this.requestData.requestEventDebugHandler('socket-end', { socket }));
            socket.on('lookup', (...data) => this.requestData.requestEventDebugHandler('socket-lookup', { socket, data }));
            socket.on('timeout', () => this.requestData.requestEventDebugHandler('socket-timeout', { socket }));
        });
    }
    async makeRequest() {
        const options = this.buildRequest();
        const url = this.requestData.url.toString();

        try {
            const response = await fetch(url, options);
            let data;
            
            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }

            const headers = Object.fromEntries(response.headers.entries());
            const rateLimit = this.getRateLimitFromResponse(response);

            if (!response.ok) {
                throw this.createResponseError({
                    res: response,
                    data,
                    rateLimit,
                    code: response.status
                });
            }

            if (TwitterApiV2Settings.debug) {
                TwitterApiV2Settings.logger.log(`[${this.requestData.options.method} ${this.hrefPathname}]: Request succeeds with code ${response.status}`);
                TwitterApiV2Settings.logger.log('Response body:', data);
            }

            return {
                data,
                headers,
                rateLimit,
            };
        } catch (error) {
            if (error instanceof ApiResponseError) {
                throw error;
            }
            throw this.createRequestError(error);
        }
    }
    async makeRequestAsStream() {
        throw new Error('Streaming is not supported in browser environment');
    }
    makeRequestAndResolveWhenReady() {
        return this.makeRequest();
    }
}
export default RequestHandlerHelper;
 