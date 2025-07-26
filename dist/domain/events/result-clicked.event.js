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
exports.ResultClickedEvent = void 0;
/**
 * @fileoverview Result clicked event for Google domain
 * @author Semantest Team
 * @module domain/events/result-clicked
 */
const domain_1 = require("@typescript-eda/domain");
const search_result_1 = require("../entities/search-result");
/**
 * Event emitted when a search result is clicked
 * Tracks user interaction with search results
 */
class ResultClickedEvent extends domain_1.Event {
    /**
     * Creates a ResultClickedEvent
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
     * Gets the clicked result
     */
    get result() {
        return this.payload.result;
    }
    /**
     * Gets when the result was clicked
     */
    get clickedAt() {
        return this.payload.clickedAt;
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
     * Gets click context
     */
    get context() {
        return this.payload.context;
    }
    /**
     * Factory method to create the event
     */
    static create(searchId, result, options) {
        return new ResultClickedEvent({
            searchId,
            result,
            clickedAt: new Date(),
            ...options
        });
    }
    /**
     * Gets the event name
     */
    static get eventName() {
        return 'google.result.clicked';
    }
    /**
     * Checks if the click will open in a new tab
     */
    willOpenInNewTab() {
        const ctx = this.context;
        return !!(ctx?.openInNewTab || ctx?.ctrlKey || ctx?.metaKey || ctx?.shiftKey);
    }
    /**
     * Serializes the event for transport
     */
    toJSON() {
        const payload = this.payload;
        return {
            eventName: ResultClickedEvent.eventName,
            payload: {
                ...payload,
                result: payload.result.toJSON(),
                clickedAt: payload.clickedAt.toISOString()
            }
        };
    }
    /**
     * Deserializes the event from transport format
     */
    static fromJSON(data) {
        return new ResultClickedEvent({
            ...data.payload,
            result: search_result_1.SearchResult.fromJSON(data.payload.result),
            clickedAt: new Date(data.payload.clickedAt)
        });
    }
}
exports.ResultClickedEvent = ResultClickedEvent;
//# sourceMappingURL=result-clicked.event.js.map