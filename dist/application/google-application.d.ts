/**
 * @fileoverview Google application following TypeScript-EDA patterns
 * @author Semantest Team
 * @module application/google-application
 */
import { Application } from '@typescript-eda/application';
import { SearchRequestedEvent, ResultClickedEvent } from '../domain/events';
import { GoogleSearch } from '../domain/entities/google-search';
import { GoogleSearchAdapter } from '../infrastructure/adapters/google-search-adapter';
import { GoogleCommunicationAdapter } from '../infrastructure/adapters/google-communication-adapter';
/**
 * Application configuration
 */
export interface GoogleApplicationConfig {
    searchAdapter?: GoogleSearchAdapter;
    communicationAdapter?: GoogleCommunicationAdapter;
    maxConcurrentSearches?: number;
    defaultTimeout?: number;
}
/**
 * Google search application
 * Orchestrates the search workflow using event-driven architecture
 */
export declare class GoogleApplication extends Application {
    private readonly activeSearches;
    private readonly searchAdapter;
    private readonly communicationAdapter?;
    private readonly maxConcurrentSearches;
    private readonly defaultTimeout;
    constructor(config?: GoogleApplicationConfig);
    /**
     * Handles search requested events
     */
    handleSearchRequested(event: SearchRequestedEvent): Promise<void>;
    /**
     * Handles result click events
     */
    handleResultClicked(event: ResultClickedEvent): Promise<void>;
    /**
     * Handles search success
     */
    private handleSearchSuccess;
    /**
     * Handles search failure
     */
    private handleSearchFailure;
    /**
     * Emits a search failed event
     */
    private emitSearchFailed;
    /**
     * Gets active searches
     */
    getActiveSearches(): ReadonlyMap<string, GoogleSearch>;
    /**
     * Gets a specific search
     */
    getSearch(searchId: string): GoogleSearch | undefined;
    /**
     * Cancels an active search
     */
    cancelSearch(searchId: string): Promise<void>;
    /**
     * Clears all completed or failed searches
     */
    clearInactiveSearches(): void;
    /**
     * Creates default search adapter
     */
    private createDefaultSearchAdapter;
    /**
     * Utility: Execute with timeout
     */
    private withTimeout;
    /**
     * Gets application statistics
     */
    getStatistics(): {
        activeSearches: number;
        totalSearches: number;
        successRate: number;
    };
}
//# sourceMappingURL=google-application.d.ts.map