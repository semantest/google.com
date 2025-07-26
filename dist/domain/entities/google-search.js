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
exports.GoogleSearch = exports.SearchStatus = void 0;
/**
 * @fileoverview Google search aggregate root entity
 * @author Semantest Team
 * @module domain/entities/google-search
 */
const domain_1 = require("@typescript-eda/domain");
const uuid_1 = require("uuid");
const search_query_1 = require("../value-objects/search-query");
const search_result_1 = require("./search-result");
/**
 * Search status enumeration
 */
var SearchStatus;
(function (SearchStatus) {
    SearchStatus["PENDING"] = "PENDING";
    SearchStatus["IN_PROGRESS"] = "IN_PROGRESS";
    SearchStatus["COMPLETED"] = "COMPLETED";
    SearchStatus["FAILED"] = "FAILED";
    SearchStatus["CANCELLED"] = "CANCELLED";
})(SearchStatus || (exports.SearchStatus = SearchStatus = {}));
/**
 * Represents a Google search operation aggregate root
 * Manages the lifecycle of a search from request to completion
 */
class GoogleSearch extends domain_1.Entity {
    /**
     * Creates a GoogleSearch instance
     * @param props The search properties
     */
    constructor(props) {
        super(props);
        this.validate();
    }
    /**
     * Factory method to create a new search
     */
    static create(query) {
        return new GoogleSearch({
            id: (0, uuid_1.v4)(),
            query,
            status: SearchStatus.PENDING,
            results: [],
            startedAt: new Date()
        });
    }
    /**
     * Gets the search ID
     */
    get id() {
        return this.props.id;
    }
    /**
     * Gets the search query
     */
    get query() {
        return this.props.query;
    }
    /**
     * Gets the current status
     */
    get status() {
        return this.props.status;
    }
    /**
     * Gets the search results
     */
    get results() {
        return [...this.props.results];
    }
    /**
     * Gets the total number of results
     */
    get totalResults() {
        return this.props.totalResults;
    }
    /**
     * Gets the search execution time in milliseconds
     */
    get searchTime() {
        return this.props.searchTime;
    }
    /**
     * Gets when the search started
     */
    get startedAt() {
        return this.props.startedAt;
    }
    /**
     * Gets when the search completed
     */
    get completedAt() {
        return this.props.completedAt;
    }
    /**
     * Gets any error message
     */
    get error() {
        return this.props.error;
    }
    /**
     * Gets additional metadata
     */
    get metadata() {
        return this.props.metadata;
    }
    /**
     * Marks the search as in progress
     */
    markAsInProgress() {
        if (this.props.status !== SearchStatus.PENDING) {
            throw new Error(`Cannot start search in status: ${this.props.status}`);
        }
        return new GoogleSearch({
            ...this.props,
            status: SearchStatus.IN_PROGRESS
        });
    }
    /**
     * Completes the search with results
     */
    completeWithResults(results, totalResults, searchTime) {
        if (this.props.status !== SearchStatus.IN_PROGRESS) {
            throw new Error(`Cannot complete search in status: ${this.props.status}`);
        }
        return new GoogleSearch({
            ...this.props,
            status: SearchStatus.COMPLETED,
            results: [...results],
            totalResults: totalResults ?? results.length,
            searchTime,
            completedAt: new Date()
        });
    }
    /**
     * Marks the search as failed
     */
    failWithError(error) {
        if (this.props.status === SearchStatus.COMPLETED) {
            throw new Error('Cannot fail a completed search');
        }
        return new GoogleSearch({
            ...this.props,
            status: SearchStatus.FAILED,
            error,
            completedAt: new Date()
        });
    }
    /**
     * Cancels the search
     */
    cancel() {
        if (this.props.status === SearchStatus.COMPLETED ||
            this.props.status === SearchStatus.FAILED) {
            throw new Error(`Cannot cancel search in status: ${this.props.status}`);
        }
        return new GoogleSearch({
            ...this.props,
            status: SearchStatus.CANCELLED,
            completedAt: new Date()
        });
    }
    /**
     * Adds a result to the search
     */
    addResult(result) {
        if (this.props.status !== SearchStatus.IN_PROGRESS) {
            throw new Error('Can only add results to in-progress searches');
        }
        return new GoogleSearch({
            ...this.props,
            results: [...this.props.results, result]
        });
    }
    /**
     * Updates metadata
     */
    updateMetadata(metadata) {
        return new GoogleSearch({
            ...this.props,
            metadata: {
                ...this.props.metadata,
                ...metadata
            }
        });
    }
    /**
     * Checks if the search is complete
     */
    isComplete() {
        return this.props.status === SearchStatus.COMPLETED;
    }
    /**
     * Checks if the search failed
     */
    isFailed() {
        return this.props.status === SearchStatus.FAILED;
    }
    /**
     * Checks if the search is in progress
     */
    isInProgress() {
        return this.props.status === SearchStatus.IN_PROGRESS;
    }
    /**
     * Gets the duration of the search
     */
    getDuration() {
        if (!this.props.startedAt || !this.props.completedAt) {
            return undefined;
        }
        return this.props.completedAt.getTime() - this.props.startedAt.getTime();
    }
    /**
     * Filters results by domain
     */
    getResultsFromDomain(domain) {
        return this.props.results.filter(result => result.isFromDomain(domain));
    }
    /**
     * Gets non-ad results
     */
    getOrganicResults() {
        return this.props.results.filter(result => !result.isAd);
    }
    /**
     * Gets featured results
     */
    getFeaturedResults() {
        return this.props.results.filter(result => result.isFeatured);
    }
    /**
     * Validates the search
     */
    validate() {
        if (!this.props.id) {
            throw new Error('Google search must have an ID');
        }
        if (!this.props.query) {
            throw new Error('Google search must have a query');
        }
        if (!this.props.status) {
            throw new Error('Google search must have a status');
        }
        if (!Array.isArray(this.props.results)) {
            throw new Error('Google search must have results array');
        }
        // Validate status transitions
        if (this.props.status === SearchStatus.COMPLETED && this.props.results.length === 0) {
            console.warn('Completed search has no results');
        }
    }
    /**
     * Converts to JSON for serialization
     */
    toJSON() {
        return {
            ...this.props,
            query: this.props.query.toJSON(),
            results: this.props.results.map(r => r.toJSON())
        };
    }
    /**
     * Creates from JSON data
     */
    static fromJSON(data) {
        return new GoogleSearch({
            ...data,
            query: new search_query_1.SearchQuery(data.query),
            results: data.results.map((r) => search_result_1.SearchResult.fromJSON(r)),
            startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
            completedAt: data.completedAt ? new Date(data.completedAt) : undefined
        });
    }
}
exports.GoogleSearch = GoogleSearch;
//# sourceMappingURL=google-search.js.map