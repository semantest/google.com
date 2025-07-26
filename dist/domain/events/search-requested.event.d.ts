/**
 * @fileoverview Search requested event for Google domain
 * @author Semantest Team
 * @module domain/events/search-requested
 */
import { Event } from '@typescript-eda/domain';
import { SearchQuery } from '../value-objects/search-query';
/**
 * Payload for SearchRequestedEvent
 */
export interface SearchRequestedPayload {
    readonly searchId: string;
    readonly query: SearchQuery;
    readonly tabId?: number;
    readonly clientId?: string;
    readonly requestedAt: Date;
    readonly options?: {
        readonly maxResults?: number;
        readonly includeAds?: boolean;
        readonly timeout?: number;
    };
}
/**
 * Event emitted when a Google search is requested
 * This triggers the search automation process
 */
export declare class SearchRequestedEvent extends Event {
    /**
     * Creates a SearchRequestedEvent
     * @param payload The event payload
     */
    constructor(payload: SearchRequestedPayload);
    /**
     * Gets the search ID
     */
    get searchId(): string;
    /**
     * Gets the search query
     */
    get query(): SearchQuery;
    /**
     * Gets the tab ID if specified
     */
    get tabId(): number | undefined;
    /**
     * Gets the client ID if specified
     */
    get clientId(): string | undefined;
    /**
     * Gets when the search was requested
     */
    get requestedAt(): Date;
    /**
     * Gets search options
     */
    get options(): SearchRequestedPayload['options'];
    /**
     * Factory method to create the event
     */
    static create(searchId: string, query: SearchQuery, options?: Omit<SearchRequestedPayload, 'searchId' | 'query' | 'requestedAt'>): SearchRequestedEvent;
    /**
     * Gets the event name
     */
    static get eventName(): string;
    /**
     * Serializes the event for transport
     */
    toJSON(): any;
    /**
     * Deserializes the event from transport format
     */
    static fromJSON(data: any): SearchRequestedEvent;
}
//# sourceMappingURL=search-requested.event.d.ts.map