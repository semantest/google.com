/**
 * @fileoverview Search failed event for Google domain
 * @author Semantest Team
 * @module domain/events/search-failed
 */
import { Event } from '@typescript-eda/domain';
import { SearchQuery } from '../value-objects/search-query';
/**
 * Error codes for search failures
 */
export declare enum SearchErrorCode {
    TIMEOUT = "TIMEOUT",
    NETWORK_ERROR = "NETWORK_ERROR",
    RATE_LIMITED = "RATE_LIMITED",
    CAPTCHA_REQUIRED = "CAPTCHA_REQUIRED",
    PAGE_NOT_LOADED = "PAGE_NOT_LOADED",
    ELEMENT_NOT_FOUND = "ELEMENT_NOT_FOUND",
    NAVIGATION_FAILED = "NAVIGATION_FAILED",
    UNKNOWN = "UNKNOWN"
}
/**
 * Payload for SearchFailedEvent
 */
export interface SearchFailedPayload {
    readonly searchId: string;
    readonly query: SearchQuery;
    readonly error: string;
    readonly errorCode: SearchErrorCode;
    readonly failedAt: Date;
    readonly tabId?: number;
    readonly clientId?: string;
    readonly retryable?: boolean;
    readonly details?: {
        readonly attemptNumber?: number;
        readonly maxAttempts?: number;
        readonly lastUrl?: string;
        readonly stackTrace?: string;
    };
}
/**
 * Event emitted when a Google search fails
 * Contains error information and recovery hints
 */
export declare class SearchFailedEvent extends Event {
    /**
     * Creates a SearchFailedEvent
     * @param payload The event payload
     */
    constructor(payload: SearchFailedPayload);
    /**
     * Gets the search ID
     */
    get searchId(): string;
    /**
     * Gets the search query
     */
    get query(): SearchQuery;
    /**
     * Gets the error message
     */
    get error(): string;
    /**
     * Gets the error code
     */
    get errorCode(): SearchErrorCode;
    /**
     * Gets when the search failed
     */
    get failedAt(): Date;
    /**
     * Gets the tab ID if specified
     */
    get tabId(): number | undefined;
    /**
     * Gets the client ID if specified
     */
    get clientId(): string | undefined;
    /**
     * Checks if the search can be retried
     */
    get isRetryable(): boolean;
    /**
     * Gets error details
     */
    get details(): SearchFailedPayload['details'];
    /**
     * Factory method to create the event
     */
    static create(searchId: string, query: SearchQuery, error: string, errorCode?: SearchErrorCode, options?: Partial<Omit<SearchFailedPayload, 'searchId' | 'query' | 'error' | 'errorCode' | 'failedAt'>>): SearchFailedEvent;
    /**
     * Creates a timeout error event
     */
    static createTimeout(searchId: string, query: SearchQuery, timeoutMs: number, options?: Partial<SearchFailedPayload>): SearchFailedEvent;
    /**
     * Creates a rate limit error event
     */
    static createRateLimited(searchId: string, query: SearchQuery, options?: Partial<SearchFailedPayload>): SearchFailedEvent;
    /**
     * Gets the event name
     */
    static get eventName(): string;
    /**
     * Determines if the error is retryable based on error code
     */
    private determineRetryability;
    /**
     * Serializes the event for transport
     */
    toJSON(): any;
    /**
     * Deserializes the event from transport format
     */
    static fromJSON(data: any): SearchFailedEvent;
}
//# sourceMappingURL=search-failed.event.d.ts.map