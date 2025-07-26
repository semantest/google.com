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
exports.SearchRequestedEvent = void 0;
/**
 * @fileoverview Search requested event for Google domain
 * @author Semantest Team
 * @module domain/events/search-requested
 */
const domain_1 = require("@typescript-eda/domain");
const search_query_1 = require("../value-objects/search-query");
/**
 * Event emitted when a Google search is requested
 * This triggers the search automation process
 */
class SearchRequestedEvent extends domain_1.Event {
    /**
     * Creates a SearchRequestedEvent
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
     * Gets when the search was requested
     */
    get requestedAt() {
        return this.payload.requestedAt;
    }
    /**
     * Gets search options
     */
    get options() {
        return this.payload.options;
    }
    /**
     * Factory method to create the event
     */
    static create(searchId, query, options) {
        return new SearchRequestedEvent({
            searchId,
            query,
            requestedAt: new Date(),
            ...options
        });
    }
    /**
     * Gets the event name
     */
    static get eventName() {
        return 'google.search.requested';
    }
    /**
     * Serializes the event for transport
     */
    toJSON() {
        const payload = this.payload;
        return {
            eventName: SearchRequestedEvent.eventName,
            payload: {
                ...payload,
                query: payload.query.toJSON(),
                requestedAt: payload.requestedAt.toISOString()
            }
        };
    }
    /**
     * Deserializes the event from transport format
     */
    static fromJSON(data) {
        return new SearchRequestedEvent({
            ...data.payload,
            query: new search_query_1.SearchQuery(data.payload.query),
            requestedAt: new Date(data.payload.requestedAt)
        });
    }
}
exports.SearchRequestedEvent = SearchRequestedEvent;
//# sourceMappingURL=search-requested.event.js.map