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
exports.SearchFailedEvent = exports.SearchErrorCode = void 0;
/**
 * @fileoverview Search failed event for Google domain
 * @author Semantest Team
 * @module domain/events/search-failed
 */
const domain_1 = require("@typescript-eda/domain");
const search_query_1 = require("../value-objects/search-query");
/**
 * Error codes for search failures
 */
var SearchErrorCode;
(function (SearchErrorCode) {
    SearchErrorCode["TIMEOUT"] = "TIMEOUT";
    SearchErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    SearchErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    SearchErrorCode["CAPTCHA_REQUIRED"] = "CAPTCHA_REQUIRED";
    SearchErrorCode["PAGE_NOT_LOADED"] = "PAGE_NOT_LOADED";
    SearchErrorCode["ELEMENT_NOT_FOUND"] = "ELEMENT_NOT_FOUND";
    SearchErrorCode["NAVIGATION_FAILED"] = "NAVIGATION_FAILED";
    SearchErrorCode["UNKNOWN"] = "UNKNOWN";
})(SearchErrorCode || (exports.SearchErrorCode = SearchErrorCode = {}));
/**
 * Event emitted when a Google search fails
 * Contains error information and recovery hints
 */
class SearchFailedEvent extends domain_1.Event {
    /**
     * Creates a SearchFailedEvent
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
     * Gets the error message
     */
    get error() {
        return this.payload.error;
    }
    /**
     * Gets the error code
     */
    get errorCode() {
        return this.payload.errorCode;
    }
    /**
     * Gets when the search failed
     */
    get failedAt() {
        return this.payload.failedAt;
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
     * Checks if the search can be retried
     */
    get isRetryable() {
        return this.payload.retryable ?? this.determineRetryability();
    }
    /**
     * Gets error details
     */
    get details() {
        return this.payload.details;
    }
    /**
     * Factory method to create the event
     */
    static create(searchId, query, error, errorCode = SearchErrorCode.UNKNOWN, options) {
        return new SearchFailedEvent({
            searchId,
            query,
            error,
            errorCode,
            failedAt: new Date(),
            ...options
        });
    }
    /**
     * Creates a timeout error event
     */
    static createTimeout(searchId, query, timeoutMs, options) {
        return SearchFailedEvent.create(searchId, query, `Search timed out after ${timeoutMs}ms`, SearchErrorCode.TIMEOUT, {
            retryable: true,
            ...options
        });
    }
    /**
     * Creates a rate limit error event
     */
    static createRateLimited(searchId, query, options) {
        return SearchFailedEvent.create(searchId, query, 'Google has rate limited this request', SearchErrorCode.RATE_LIMITED, {
            retryable: false,
            ...options
        });
    }
    /**
     * Gets the event name
     */
    static get eventName() {
        return 'google.search.failed';
    }
    /**
     * Determines if the error is retryable based on error code
     */
    determineRetryability() {
        switch (this.errorCode) {
            case SearchErrorCode.TIMEOUT:
            case SearchErrorCode.NETWORK_ERROR:
            case SearchErrorCode.PAGE_NOT_LOADED:
                return true;
            case SearchErrorCode.RATE_LIMITED:
            case SearchErrorCode.CAPTCHA_REQUIRED:
                return false;
            default:
                return true; // Optimistic retry for unknown errors
        }
    }
    /**
     * Serializes the event for transport
     */
    toJSON() {
        const payload = this.payload;
        return {
            eventName: SearchFailedEvent.eventName,
            payload: {
                ...payload,
                query: payload.query.toJSON(),
                failedAt: payload.failedAt.toISOString()
            }
        };
    }
    /**
     * Deserializes the event from transport format
     */
    static fromJSON(data) {
        return new SearchFailedEvent({
            ...data.payload,
            query: new search_query_1.SearchQuery(data.payload.query),
            failedAt: new Date(data.payload.failedAt)
        });
    }
}
exports.SearchFailedEvent = SearchFailedEvent;
//# sourceMappingURL=search-failed.event.js.map