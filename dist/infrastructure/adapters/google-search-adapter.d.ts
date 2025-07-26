import { SearchResult } from '../../domain/entities/search-result';
import { SearchRequestedEvent, SearchCompletedEvent, SearchFailedEvent } from '../../domain/events';
/**
 * Browser context interface for DOM manipulation
 */
export interface BrowserContext {
    querySelector(selector: string): Element | null;
    querySelectorAll(selector: string): NodeListOf<Element>;
    getElementById(id: string): Element | null;
    getElementsByClassName(className: string): HTMLCollectionOf<Element>;
    dispatchEvent(element: Element, event: Event): void;
    click(element: Element): void;
    setValue(element: HTMLInputElement, value: string): void;
    submit(form: HTMLFormElement): void;
    waitForElement(selector: string, timeout?: number): Promise<Element>;
    waitForNavigation(timeout?: number): Promise<void>;
    getCurrentUrl(): string;
    getTitle(): string;
}
/**
 * Google search adapter for executing searches in the browser
 * This adapter runs in the content script context
 */
export declare class GoogleSearchAdapter {
    private browserContext;
    /**
     * Selector constants for Google search page
     */
    private static readonly SELECTORS;
    constructor(browserContext: BrowserContext);
    /**
     * Handles a search requested event
     */
    handleSearchRequest(event: SearchRequestedEvent): Promise<SearchCompletedEvent | SearchFailedEvent>;
    /**
     * Clicks on a search result
     */
    clickSearchResult(result: SearchResult): Promise<void>;
    /**
     * Checks if we're on Google search page
     */
    private isOnGoogleSearchPage;
    /**
     * Navigates to Google with the search query
     */
    private navigateToGoogle;
    /**
     * Enters search term in the search box
     */
    private enterSearchTerm;
    /**
     * Submits the search form
     */
    private submitSearch;
    /**
     * Waits for search results to load
     */
    private waitForSearchResults;
    /**
     * Extracts search results from the page
     */
    private extractSearchResults;
    /**
     * Extracts a single result from a DOM element
     */
    private extractResultFromElement;
    /**
     * Extracts the display URL from a result element
     */
    private extractDisplayUrl;
    /**
     * Extracts the favicon URL from a result element
     */
    private extractFavicon;
    /**
     * Extracts search metadata
     */
    private extractSearchMetadata;
    /**
     * Extracts search execution time
     */
    private extractSearchTime;
    /**
     * Creates a failed event from an error
     */
    private createFailedEvent;
    /**
     * Utility: Add realistic delay
     */
    private delay;
}
//# sourceMappingURL=google-search-adapter.d.ts.map