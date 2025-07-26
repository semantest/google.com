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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleApplication = void 0;
/**
 * @fileoverview Google application following TypeScript-EDA patterns
 * @author Semantest Team
 * @module application/google-application
 */
const application_1 = require("@typescript-eda/application");
const domain_1 = require("@typescript-eda/domain");
const events_1 = require("../domain/events");
const google_search_1 = require("../domain/entities/google-search");
const google_search_adapter_1 = require("../infrastructure/adapters/google-search-adapter");
/**
 * Google search application
 * Orchestrates the search workflow using event-driven architecture
 */
class GoogleApplication extends application_1.Application {
    constructor(config = {}) {
        super();
        this.activeSearches = new Map();
        this.searchAdapter = config.searchAdapter || this.createDefaultSearchAdapter();
        this.communicationAdapter = config.communicationAdapter;
        this.maxConcurrentSearches = config.maxConcurrentSearches || 5;
        this.defaultTimeout = config.defaultTimeout || 30000;
    }
    /**
     * Handles search requested events
     */
    async handleSearchRequested(event) {
        try {
            // Check concurrent search limit
            if (this.activeSearches.size >= this.maxConcurrentSearches) {
                await this.emitSearchFailed(event, 'Maximum concurrent searches reached', 'RATE_LIMITED');
                return;
            }
            // Create search entity
            const search = google_search_1.GoogleSearch.create(event.query);
            this.activeSearches.set(search.id, search);
            // Mark as in progress
            const inProgressSearch = search.markAsInProgress();
            this.activeSearches.set(search.id, inProgressSearch);
            // Execute search with timeout
            const timeoutMs = event.options?.timeout || this.defaultTimeout;
            const searchPromise = this.searchAdapter.handleSearchRequest(event);
            const result = await this.withTimeout(searchPromise, timeoutMs);
            // Handle result
            if (result instanceof events_1.SearchCompletedEvent) {
                await this.handleSearchSuccess(event.searchId, result);
            }
            else if (result instanceof events_1.SearchFailedEvent) {
                await this.handleSearchFailure(event.searchId, result);
            }
        }
        catch (error) {
            await this.emitSearchFailed(event, error.message || 'Unknown error', 'UNKNOWN');
        }
        finally {
            // Clean up
            this.activeSearches.delete(event.searchId);
        }
    }
    /**
     * Handles result click events
     */
    async handleResultClicked(event) {
        try {
            // Find the search
            const search = this.activeSearches.get(event.searchId);
            if (!search) {
                throw new Error(`Search ${event.searchId} not found`);
            }
            // Verify the result belongs to this search
            const resultExists = search.results.some(r => r.id === event.result.id);
            if (!resultExists) {
                throw new Error(`Result ${event.result.id} not found in search ${event.searchId}`);
            }
            // Execute click
            await this.searchAdapter.clickSearchResult(event.result);
            // Emit success event
            await this.emit(new domain_1.Event({
                type: 'google.result.click.success',
                searchId: event.searchId,
                resultId: event.result.id,
                url: event.result.url,
                timestamp: new Date()
            }));
        }
        catch (error) {
            // Emit failure event
            await this.emit(new domain_1.Event({
                type: 'google.result.click.failed',
                searchId: event.searchId,
                resultId: event.result.id,
                error: error.message,
                timestamp: new Date()
            }));
        }
    }
    /**
     * Handles search success
     */
    async handleSearchSuccess(searchId, event) {
        const search = this.activeSearches.get(searchId);
        if (!search)
            return;
        // Update search entity
        const completedSearch = search.completeWithResults(event.results, event.totalResults, event.searchTime);
        this.activeSearches.set(searchId, completedSearch);
        // Emit completed event
        await this.emit(event);
        // If communication adapter is available, notify through WebSocket
        if (this.communicationAdapter) {
            await this.communicationAdapter.publishEvent(event);
        }
    }
    /**
     * Handles search failure
     */
    async handleSearchFailure(searchId, event) {
        const search = this.activeSearches.get(searchId);
        if (!search)
            return;
        // Update search entity
        const failedSearch = search.failWithError(event.error);
        this.activeSearches.set(searchId, failedSearch);
        // Emit failed event
        await this.emit(event);
        // If communication adapter is available, notify through WebSocket
        if (this.communicationAdapter) {
            await this.communicationAdapter.publishEvent(event);
        }
    }
    /**
     * Emits a search failed event
     */
    async emitSearchFailed(request, error, errorCode) {
        const failedEvent = events_1.SearchFailedEvent.create(request.searchId, request.query, error, errorCode, {
            tabId: request.tabId,
            clientId: request.clientId
        });
        await this.emit(failedEvent);
        if (this.communicationAdapter) {
            await this.communicationAdapter.publishEvent(failedEvent);
        }
    }
    /**
     * Gets active searches
     */
    getActiveSearches() {
        return new Map(this.activeSearches);
    }
    /**
     * Gets a specific search
     */
    getSearch(searchId) {
        return this.activeSearches.get(searchId);
    }
    /**
     * Cancels an active search
     */
    async cancelSearch(searchId) {
        const search = this.activeSearches.get(searchId);
        if (!search) {
            throw new Error(`Search ${searchId} not found`);
        }
        const cancelledSearch = search.cancel();
        this.activeSearches.set(searchId, cancelledSearch);
        // Emit cancelled event
        await this.emit(new domain_1.Event({
            type: 'google.search.cancelled',
            searchId,
            timestamp: new Date()
        }));
        // Clean up
        this.activeSearches.delete(searchId);
    }
    /**
     * Clears all completed or failed searches
     */
    clearInactiveSearches() {
        for (const [id, search] of this.activeSearches) {
            if (search.isComplete() || search.isFailed()) {
                this.activeSearches.delete(id);
            }
        }
    }
    /**
     * Creates default search adapter
     */
    createDefaultSearchAdapter() {
        // In a real implementation, this would create an adapter
        // with proper browser context injection
        return new google_search_adapter_1.GoogleSearchAdapter({
            querySelector: (selector) => document.querySelector(selector),
            querySelectorAll: (selector) => document.querySelectorAll(selector),
            getElementById: (id) => document.getElementById(id),
            getElementsByClassName: (className) => document.getElementsByClassName(className),
            dispatchEvent: (element, event) => element.dispatchEvent(event),
            click: (element) => element.click(),
            setValue: (element, value) => { element.value = value; },
            submit: (form) => form.submit(),
            waitForElement: async (selector, timeout) => {
                // Simplified implementation
                const element = document.querySelector(selector);
                if (element)
                    return element;
                throw new Error(`Element ${selector} not found`);
            },
            waitForNavigation: async () => {
                // Simplified implementation
                await new Promise(resolve => setTimeout(resolve, 1000));
            },
            getCurrentUrl: () => window.location.href,
            getTitle: () => document.title
        });
    }
    /**
     * Utility: Execute with timeout
     */
    async withTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs))
        ]);
    }
    /**
     * Gets application statistics
     */
    getStatistics() {
        let totalSearches = 0;
        let successfulSearches = 0;
        for (const search of this.activeSearches.values()) {
            totalSearches++;
            if (search.isComplete()) {
                successfulSearches++;
            }
        }
        return {
            activeSearches: this.activeSearches.size,
            totalSearches,
            successRate: totalSearches > 0 ? successfulSearches / totalSearches : 0
        };
    }
}
exports.GoogleApplication = GoogleApplication;
__decorate([
    (0, application_1.Listen)(events_1.SearchRequestedEvent),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [events_1.SearchRequestedEvent]),
    __metadata("design:returntype", Promise)
], GoogleApplication.prototype, "handleSearchRequested", null);
__decorate([
    (0, application_1.Listen)(events_1.ResultClickedEvent),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [events_1.ResultClickedEvent]),
    __metadata("design:returntype", Promise)
], GoogleApplication.prototype, "handleResultClicked", null);
//# sourceMappingURL=google-application.js.map