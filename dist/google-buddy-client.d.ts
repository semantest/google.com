import { GoogleCommunicationAdapter } from './infrastructure/adapters/google-communication-adapter';
import { SearchResult } from './domain/entities/search-result';
/**
 * Legacy search response interface for backward compatibility
 */
export interface SearchResponse {
    success: boolean;
    results?: SearchResult[];
    result?: SearchResult;
    title?: string;
    url?: string;
    error?: string;
    correlationId: string;
}
/**
 * Configuration for GoogleBuddyClient
 */
export interface GoogleBuddyClientConfig {
    serverUrl: string;
    timeout?: number;
    apiKey?: string;
    retryAttempts?: number;
    retryDelay?: number;
}
/**
 * Google-specific client that provides convenient methods
 * Built on top of the new TypeScript-EDA foundation
 * Maintains backward compatibility with the legacy API
 *
 * @deprecated Use GoogleCommunicationAdapter directly for new implementations
 */
export declare class GoogleBuddyClient {
    private readonly adapter;
    private currentSearchId?;
    constructor(config: GoogleBuddyClientConfig);
    /**
     * Initialize connection
     */
    connect(): Promise<void>;
    /**
     * Disconnect
     */
    disconnect(): Promise<void>;
    /**
     * Enter search term in Google search box
     * Convenient wrapper around ENTER_SEARCH_TERM message
     */
    enterSearchTerm(term: string, options?: {
        tabId?: number;
    }): Promise<SearchResponse>;
    /**
     * Get all search results from current page
     * Convenient wrapper around GET_SEARCH_RESULTS message
     */
    getSearchResults(options?: {
        tabId?: number;
    }): Promise<SearchResult[]>;
    /**
     * Get the first search result
     * Convenient wrapper around GET_FIRST_RESULT message
     */
    getFirstResult(options?: {
        tabId?: number;
    }): Promise<SearchResult>;
    /**
     * Click on a specific search result
     * Convenient wrapper around CLICK_RESULT message
     */
    clickResult(index?: number, options?: {
        tabId?: number;
    }): Promise<{
        success: boolean;
        url: string;
    }>;
    /**
     * Extract page title from current page
     * Convenient wrapper around EXTRACT_PAGE_TITLE message
     */
    extractPageTitle(options?: {
        tabId?: number;
    }): Promise<string>;
    /**
     * Convenience method: Complete search flow
     * Combines multiple operations into a single method
     */
    search(term: string, options?: {
        tabId?: number;
    }): Promise<SearchResult[]>;
    /**
     * Convenience method: Search and click first result
     * Common workflow for "I'm feeling lucky" behavior
     */
    searchAndClickFirst(term: string, options?: {
        tabId?: number;
    }): Promise<{
        success: boolean;
        url: string;
    }>;
    /**
     * Advanced: Batch search multiple terms
     * Returns results for all terms
     */
    batchSearch(terms: string[], options?: {
        tabId?: number;
        parallel?: boolean;
    }): Promise<SearchResult[][]>;
    /**
     * Advanced: Search with result filtering
     * Searches and filters results based on criteria
     */
    searchWithFilter(term: string, filter: (result: SearchResult) => boolean, options?: {
        tabId?: number;
        maxResults?: number;
    }): Promise<SearchResult[]>;
    /**
     * Advanced: Search and extract specific data
     * Performs search and extracts data from results using custom extractor
     */
    searchAndExtract<T>(term: string, extractor: (results: SearchResult[]) => T, options?: {
        tabId?: number;
    }): Promise<T>;
    /**
     * Utility: Check if we're on Google search page
     */
    isOnGoogleSearchPage(options?: {
        tabId?: number;
    }): Promise<boolean>;
    /**
     * Access to underlying adapter for advanced use cases
     */
    getAdapter(): GoogleCommunicationAdapter;
    /**
     * Legacy WebBuddyClient compatibility
     * @deprecated Use getAdapter() instead
     */
    getWebBuddyClient(): any;
}
//# sourceMappingURL=google-buddy-client.d.ts.map