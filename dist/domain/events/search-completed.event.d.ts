/**
 * @fileoverview Search completed event for Google domain
 * @author Semantest Team
 * @module domain/events/search-completed
 */
import { Event } from '@typescript-eda/domain';
import { SearchResult } from '../entities/search-result';
import { SearchQuery } from '../value-objects/search-query';
/**
 * Payload for SearchCompletedEvent
 */
export interface SearchCompletedPayload {
    readonly searchId: string;
    readonly query: SearchQuery;
    readonly results: SearchResult[];
    readonly totalResults: number;
    readonly searchTime: number;
    readonly completedAt: Date;
    readonly tabId?: number;
    readonly clientId?: string;
    readonly metadata?: {
        readonly suggestedQueries?: string[];
        readonly relatedSearches?: string[];
        readonly didYouMean?: string;
    };
}
/**
 * Event emitted when a Google search is successfully completed
 * Contains the search results and metadata
 */
export declare class SearchCompletedEvent extends Event {
    /**
     * Creates a SearchCompletedEvent
     * @param payload The event payload
     */
    constructor(payload: SearchCompletedPayload);
    /**
     * Gets the search ID
     */
    get searchId(): string;
    /**
     * Gets the search query
     */
    get query(): SearchQuery;
    /**
     * Gets the search results
     */
    get results(): ReadonlyArray<SearchResult>;
    /**
     * Gets the total number of results
     */
    get totalResults(): number;
    /**
     * Gets the search execution time in milliseconds
     */
    get searchTime(): number;
    /**
     * Gets when the search completed
     */
    get completedAt(): Date;
    /**
     * Gets the tab ID if specified
     */
    get tabId(): number | undefined;
    /**
     * Gets the client ID if specified
     */
    get clientId(): string | undefined;
    /**
     * Gets search metadata
     */
    get metadata(): SearchCompletedPayload['metadata'];
    /**
     * Factory method to create the event
     */
    static create(searchId: string, query: SearchQuery, results: SearchResult[], searchTime: number, options?: Partial<Omit<SearchCompletedPayload, 'searchId' | 'query' | 'results' | 'searchTime' | 'completedAt'>>): SearchCompletedEvent;
    /**
     * Gets the event name
     */
    static get eventName(): string;
    /**
     * Gets organic (non-ad) results
     */
    getOrganicResults(): SearchResult[];
    /**
     * Gets featured results
     */
    getFeaturedResults(): SearchResult[];
    /**
     * Gets results from a specific domain
     */
    getResultsFromDomain(domain: string): SearchResult[];
    /**
     * Serializes the event for transport
     */
    toJSON(): any;
    /**
     * Deserializes the event from transport format
     */
    static fromJSON(data: any): SearchCompletedEvent;
}
//# sourceMappingURL=search-completed.event.d.ts.map