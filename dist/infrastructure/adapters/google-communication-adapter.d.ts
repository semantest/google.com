import { WebSocketCommunicationAdapter, WebSocketConfig } from '@typescript-eda/infrastructure';
import { SearchCompletedEvent, SearchFailedEvent } from '../../domain/events';
import { SearchQuery } from '../../domain/value-objects/search-query';
import { SearchResult } from '../../domain/entities/search-result';
/**
 * Google-specific communication adapter
 * Extends the base WebSocket adapter with Google domain functionality
 */
export declare class GoogleCommunicationAdapter extends WebSocketCommunicationAdapter {
    /**
     * Message type constants for Google domain
     */
    private static readonly MESSAGE_TYPES;
    constructor(config: WebSocketConfig);
    /**
     * Requests a Google search
     */
    requestSearch(query: string | SearchQuery, options?: {
        tabId?: number;
        maxResults?: number;
        includeAds?: boolean;
        timeout?: number;
    }): Promise<SearchCompletedEvent | SearchFailedEvent>;
    /**
     * Clicks on a search result
     */
    clickResult(searchId: string, result: SearchResult | number, options?: {
        tabId?: number;
        openInNewTab?: boolean;
    }): Promise<void>;
    /**
     * Gets current search results
     */
    getSearchResults(searchId: string, options?: {
        tabId?: number;
    }): Promise<SearchResult[]>;
    /**
     * Extracts page title
     */
    extractPageTitle(options?: {
        tabId?: number;
    }): Promise<string>;
    /**
     * Legacy API support: Send search term
     */
    enterSearchTerm(term: string, options?: {
        tabId?: number;
    }): Promise<void>;
    /**
     * Sets up Google-specific message handlers
     */
    private setupGoogleHandlers;
    /**
     * Converts legacy message format to events
     */
    handleLegacyMessage(message: any, options?: {
        tabId?: number;
    }): Promise<any>;
    /**
     * Gets the current search ID for a tab
     * This would be tracked in the application state
     */
    private getCurrentSearchId;
    /**
     * Batch search support
     */
    batchSearch(queries: string[], options?: {
        tabId?: number;
        parallel?: boolean;
        maxResults?: number;
    }): Promise<SearchCompletedEvent[]>;
}
//# sourceMappingURL=google-communication-adapter.d.ts.map