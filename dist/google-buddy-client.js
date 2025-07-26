"use strict";
/*
 * Copyright 2025-today Semantest Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleBuddyClient = void 0;
const google_communication_adapter_1 = require("./infrastructure/adapters/google-communication-adapter");
const search_query_1 = require("./domain/value-objects/search-query");
const events_1 = require("./domain/events");
/**
 * Google-specific client that provides convenient methods
 * Built on top of the new TypeScript-EDA foundation
 * Maintains backward compatibility with the legacy API
 *
 * @deprecated Use GoogleCommunicationAdapter directly for new implementations
 */
class GoogleBuddyClient {
    constructor(config) {
        // Convert legacy config to WebSocket config
        const wsConfig = {
            url: config.serverUrl.replace('http://', 'ws://').replace('https://', 'wss://'),
            timeout: config.timeout,
            retries: config.retryAttempts,
            headers: config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : undefined,
            clientId: 'google-buddy-legacy-client'
        };
        this.adapter = new google_communication_adapter_1.GoogleCommunicationAdapter(wsConfig);
    }
    /**
     * Initialize connection
     */
    async connect() {
        await this.adapter.connect();
    }
    /**
     * Disconnect
     */
    async disconnect() {
        await this.adapter.disconnect();
    }
    /**
     * Enter search term in Google search box
     * Convenient wrapper around ENTER_SEARCH_TERM message
     */
    async enterSearchTerm(term, options) {
        try {
            const query = search_query_1.SearchQuery.fromString(term);
            const event = await this.adapter.requestSearch(query, {
                tabId: options?.tabId,
                timeout: 30000
            });
            if (event instanceof events_1.SearchCompletedEvent) {
                this.currentSearchId = event.searchId;
                return {
                    success: true,
                    correlationId: event.searchId
                };
            }
            else if (event instanceof events_1.SearchFailedEvent) {
                return {
                    success: false,
                    error: event.error,
                    correlationId: event.searchId
                };
            }
            throw new Error('Unexpected response type');
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Unknown error',
                correlationId: 'error-' + Date.now()
            };
        }
    }
    /**
     * Get all search results from current page
     * Convenient wrapper around GET_SEARCH_RESULTS message
     */
    async getSearchResults(options) {
        if (!this.currentSearchId) {
            throw new Error('No active search. Call enterSearchTerm first.');
        }
        try {
            const results = await this.adapter.getSearchResults(this.currentSearchId, options);
            return results;
        }
        catch (error) {
            console.error('Failed to get search results:', error);
            return [];
        }
    }
    /**
     * Get the first search result
     * Convenient wrapper around GET_FIRST_RESULT message
     */
    async getFirstResult(options) {
        const results = await this.getSearchResults(options);
        if (results.length === 0) {
            throw new Error('No search results found');
        }
        return results[0];
    }
    /**
     * Click on a specific search result
     * Convenient wrapper around CLICK_RESULT message
     */
    async clickResult(index = 0, options) {
        if (!this.currentSearchId) {
            throw new Error('No active search. Call enterSearchTerm first.');
        }
        try {
            const results = await this.getSearchResults(options);
            if (index >= results.length) {
                throw new Error(`Result index ${index} out of bounds`);
            }
            await this.adapter.clickResult(this.currentSearchId, index, options);
            return {
                success: true,
                url: results[index].url
            };
        }
        catch (error) {
            return {
                success: false,
                url: ''
            };
        }
    }
    /**
     * Extract page title from current page
     * Convenient wrapper around EXTRACT_PAGE_TITLE message
     */
    async extractPageTitle(options) {
        try {
            return await this.adapter.extractPageTitle(options);
        }
        catch (error) {
            console.error('Failed to extract page title:', error);
            return '';
        }
    }
    /**
     * Convenience method: Complete search flow
     * Combines multiple operations into a single method
     */
    async search(term, options) {
        await this.enterSearchTerm(term, options);
        return this.getSearchResults(options);
    }
    /**
     * Convenience method: Search and click first result
     * Common workflow for "I'm feeling lucky" behavior
     */
    async searchAndClickFirst(term, options) {
        await this.enterSearchTerm(term, options);
        return this.clickResult(0, options);
    }
    /**
     * Advanced: Batch search multiple terms
     * Returns results for all terms
     */
    async batchSearch(terms, options) {
        const events = await this.adapter.batchSearch(terms, {
            tabId: options?.tabId,
            parallel: options?.parallel,
            maxResults: 10
        });
        return events.map(event => event.results);
    }
    /**
     * Advanced: Search with result filtering
     * Searches and filters results based on criteria
     */
    async searchWithFilter(term, filter, options) {
        const results = await this.search(term, options);
        const filteredResults = results.filter(filter);
        if (options?.maxResults) {
            return filteredResults.slice(0, options.maxResults);
        }
        return filteredResults;
    }
    /**
     * Advanced: Search and extract specific data
     * Performs search and extracts data from results using custom extractor
     */
    async searchAndExtract(term, extractor, options) {
        const results = await this.search(term, options);
        return extractor(results);
    }
    /**
     * Utility: Check if we're on Google search page
     */
    async isOnGoogleSearchPage(options) {
        try {
            const title = await this.extractPageTitle(options);
            return title.includes('Google Search') || title.includes('Google');
        }
        catch {
            return false;
        }
    }
    /**
     * Access to underlying adapter for advanced use cases
     */
    getAdapter() {
        return this.adapter;
    }
    /**
     * Legacy WebBuddyClient compatibility
     * @deprecated Use getAdapter() instead
     */
    getWebBuddyClient() {
        console.warn('getWebBuddyClient() is deprecated. Use getAdapter() instead.');
        return {
            sendMessage: async (message, options) => {
                return this.adapter.handleLegacyMessage(message, options);
            }
        };
    }
}
exports.GoogleBuddyClient = GoogleBuddyClient;
//# sourceMappingURL=google-buddy-client.js.map