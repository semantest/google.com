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
exports.SearchResult = void 0;
/**
 * @fileoverview Search result entity for Google domain
 * @author Semantest Team
 * @module domain/entities/search-result
 */
const domain_1 = require("@typescript-eda/domain");
const uuid_1 = require("uuid");
/**
 * Represents a search result from Google
 * This is an entity with a unique identity
 */
class SearchResult extends domain_1.Entity {
    /**
     * Creates a SearchResult instance
     * @param props The search result properties
     */
    constructor(props) {
        super(props);
        this.validate();
    }
    /**
     * Factory method to create a SearchResult
     */
    static create(props) {
        return new SearchResult({
            ...props,
            id: (0, uuid_1.v4)(),
            timestamp: new Date()
        });
    }
    /**
     * Gets the unique identifier
     */
    get id() {
        return this.props.id;
    }
    /**
     * Gets the result title
     */
    get title() {
        return this.props.title;
    }
    /**
     * Gets the result URL
     */
    get url() {
        return this.props.url;
    }
    /**
     * Gets the result description
     */
    get description() {
        return this.props.description;
    }
    /**
     * Gets the position in search results (1-based)
     */
    get position() {
        return this.props.position;
    }
    /**
     * Gets the display URL
     */
    get displayUrl() {
        return this.props.displayUrl;
    }
    /**
     * Gets the favicon URL
     */
    get favicon() {
        return this.props.favicon;
    }
    /**
     * Checks if this is an advertisement
     */
    get isAd() {
        return this.props.isAd ?? false;
    }
    /**
     * Checks if this is a featured snippet
     */
    get isFeatured() {
        return this.props.isFeatured ?? false;
    }
    /**
     * Gets the timestamp when this result was captured
     */
    get timestamp() {
        return this.props.timestamp;
    }
    /**
     * Gets additional metadata
     */
    get metadata() {
        return this.props.metadata;
    }
    /**
     * Validates the search result
     * @throws {Error} If validation fails
     */
    validate() {
        if (!this.props.id) {
            throw new Error('Search result must have an ID');
        }
        if (!this.props.title || this.props.title.trim().length === 0) {
            throw new Error('Search result must have a title');
        }
        if (!this.props.url || !this.isValidUrl(this.props.url)) {
            throw new Error('Search result must have a valid URL');
        }
        if (!this.props.description) {
            throw new Error('Search result must have a description');
        }
        if (this.props.position < 1) {
            throw new Error('Search result position must be positive');
        }
        if (this.props.displayUrl && !this.isValidUrl(this.props.displayUrl)) {
            throw new Error('Display URL must be valid if provided');
        }
        if (this.props.favicon && !this.isValidUrl(this.props.favicon)) {
            throw new Error('Favicon URL must be valid if provided');
        }
    }
    /**
     * Checks if a URL is valid
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Gets the domain from the URL
     */
    getDomain() {
        try {
            const url = new URL(this.props.url);
            return url.hostname;
        }
        catch {
            return '';
        }
    }
    /**
     * Checks if the result is from a specific domain
     */
    isFromDomain(domain) {
        return this.getDomain().toLowerCase().includes(domain.toLowerCase());
    }
    /**
     * Converts to a plain object for serialization
     */
    toJSON() {
        return { ...this.props };
    }
    /**
     * Creates a SearchResult from JSON data
     */
    static fromJSON(data) {
        return new SearchResult({
            ...data,
            timestamp: new Date(data.timestamp)
        });
    }
}
exports.SearchResult = SearchResult;
//# sourceMappingURL=search-result.js.map