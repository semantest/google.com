/**
 * @fileoverview Google search aggregate root entity
 * @author Semantest Team
 * @module domain/entities/google-search
 */
import { Entity } from '@typescript-eda/domain';
import { SearchQuery } from '../value-objects/search-query';
import { SearchResult } from './search-result';
/**
 * Search status enumeration
 */
export declare enum SearchStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
/**
 * Properties for GoogleSearch aggregate root
 */
export interface GoogleSearchProps {
    readonly id: string;
    readonly query: SearchQuery;
    readonly status: SearchStatus;
    readonly results: SearchResult[];
    readonly totalResults?: number;
    readonly searchTime?: number;
    readonly startedAt?: Date;
    readonly completedAt?: Date;
    readonly error?: string;
    readonly metadata?: Record<string, any>;
}
/**
 * Represents a Google search operation aggregate root
 * Manages the lifecycle of a search from request to completion
 */
export declare class GoogleSearch extends Entity<GoogleSearchProps> {
    /**
     * Creates a GoogleSearch instance
     * @param props The search properties
     */
    constructor(props: GoogleSearchProps);
    /**
     * Factory method to create a new search
     */
    static create(query: SearchQuery): GoogleSearch;
    /**
     * Gets the search ID
     */
    get id(): string;
    /**
     * Gets the search query
     */
    get query(): SearchQuery;
    /**
     * Gets the current status
     */
    get status(): SearchStatus;
    /**
     * Gets the search results
     */
    get results(): ReadonlyArray<SearchResult>;
    /**
     * Gets the total number of results
     */
    get totalResults(): number | undefined;
    /**
     * Gets the search execution time in milliseconds
     */
    get searchTime(): number | undefined;
    /**
     * Gets when the search started
     */
    get startedAt(): Date | undefined;
    /**
     * Gets when the search completed
     */
    get completedAt(): Date | undefined;
    /**
     * Gets any error message
     */
    get error(): string | undefined;
    /**
     * Gets additional metadata
     */
    get metadata(): Record<string, any> | undefined;
    /**
     * Marks the search as in progress
     */
    markAsInProgress(): GoogleSearch;
    /**
     * Completes the search with results
     */
    completeWithResults(results: SearchResult[], totalResults?: number, searchTime?: number): GoogleSearch;
    /**
     * Marks the search as failed
     */
    failWithError(error: string): GoogleSearch;
    /**
     * Cancels the search
     */
    cancel(): GoogleSearch;
    /**
     * Adds a result to the search
     */
    addResult(result: SearchResult): GoogleSearch;
    /**
     * Updates metadata
     */
    updateMetadata(metadata: Record<string, any>): GoogleSearch;
    /**
     * Checks if the search is complete
     */
    isComplete(): boolean;
    /**
     * Checks if the search failed
     */
    isFailed(): boolean;
    /**
     * Checks if the search is in progress
     */
    isInProgress(): boolean;
    /**
     * Gets the duration of the search
     */
    getDuration(): number | undefined;
    /**
     * Filters results by domain
     */
    getResultsFromDomain(domain: string): SearchResult[];
    /**
     * Gets non-ad results
     */
    getOrganicResults(): SearchResult[];
    /**
     * Gets featured results
     */
    getFeaturedResults(): SearchResult[];
    /**
     * Validates the search
     */
    private validate;
    /**
     * Converts to JSON for serialization
     */
    toJSON(): any;
    /**
     * Creates from JSON data
     */
    static fromJSON(data: any): GoogleSearch;
}
//# sourceMappingURL=google-search.d.ts.map