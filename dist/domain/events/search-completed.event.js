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
exports.SearchCompletedEvent = void 0;
/**
 * @fileoverview Search completed event for Google domain
 * @author Semantest Team
 * @module domain/events/search-completed
 */
const domain_1 = require("@typescript-eda/domain");
const search_result_1 = require("../entities/search-result");
const search_query_1 = require("../value-objects/search-query");
/**
 * Event emitted when a Google search is successfully completed
 * Contains the search results and metadata
 */
class SearchCompletedEvent extends domain_1.Event {
    /**
     * Creates a SearchCompletedEvent
     * @param payload The event payload
     */
    constructor(payload) {
        super(payload);
    }
    /**
     * Gets the search ID
     */
    get searchId() {
        return this.payload.searchId;
    }
    /**
     * Gets the search query
     */
    get query() {
        return this.payload.query;
    }
    /**
     * Gets the search results
     */
    get results() {
        return this.payload.results;
    }
    /**
     * Gets the total number of results
     */
    get totalResults() {
        return this.payload.totalResults;
    }
    /**
     * Gets the search execution time in milliseconds
     */
    get searchTime() {
        return this.payload.searchTime;
    }
    /**
     * Gets when the search completed
     */
    get completedAt() {
        return this.payload.completedAt;
    }
    /**
     * Gets the tab ID if specified
     */
    get tabId() {
        return this.payload.tabId;
    }
    /**
     * Gets the client ID if specified
     */
    get clientId() {
        return this.payload.clientId;
    }
    /**
     * Gets search metadata
     */
    get metadata() {
        return this.payload.metadata;
    }
    /**
     * Factory method to create the event
     */
    static create(searchId, query, results, searchTime, options) {
        return new SearchCompletedEvent({
            searchId,
            query,
            results,
            searchTime,
            totalResults: options?.totalResults ?? results.length,
            completedAt: new Date(),
            ...options
        });
    }
    /**
     * Gets the event name
     */
    static get eventName() {
        return 'google.search.completed';
    }
    /**
     * Gets organic (non-ad) results
     */
    getOrganicResults() {
        return this.results.filter(result => !result.isAd);
    }
    /**
     * Gets featured results
     */
    getFeaturedResults() {
        return this.results.filter(result => result.isFeatured);
    }
    /**
     * Gets results from a specific domain
     */
    getResultsFromDomain(domain) {
        return this.results.filter(result => result.isFromDomain(domain));
    }
    /**
     * Serializes the event for transport
     */
    toJSON() {
        const payload = this.payload;
        return {
            eventName: SearchCompletedEvent.eventName,
            payload: {
                ...payload,
                query: payload.query.toJSON(),
                results: payload.results.map(r => r.toJSON()),
                completedAt: payload.completedAt.toISOString()
            }
        };
    }
    /**
     * Deserializes the event from transport format
     */
    static fromJSON(data) {
        return new SearchCompletedEvent({
            ...data.payload,
            query: new search_query_1.SearchQuery(data.payload.query),
            results: data.payload.results.map((r) => search_result_1.SearchResult.fromJSON(r)),
            completedAt: new Date(data.payload.completedAt)
        });
    }
}
exports.SearchCompletedEvent = SearchCompletedEvent;
//# sourceMappingURL=search-completed.event.js.map