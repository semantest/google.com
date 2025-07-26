/**
 * @fileoverview Search result entity for Google domain
 * @author Semantest Team
 * @module domain/entities/search-result
 */
import { Entity } from '@typescript-eda/domain';
/**
 * Properties for SearchResult entity
 */
export interface SearchResultProps {
    readonly id: string;
    readonly title: string;
    readonly url: string;
    readonly description: string;
    readonly position: number;
    readonly displayUrl?: string;
    readonly favicon?: string;
    readonly isAd?: boolean;
    readonly isFeatured?: boolean;
    readonly timestamp: Date;
    readonly metadata?: Record<string, any>;
}
/**
 * Represents a search result from Google
 * This is an entity with a unique identity
 */
export declare class SearchResult extends Entity<SearchResultProps> {
    /**
     * Creates a SearchResult instance
     * @param props The search result properties
     */
    constructor(props: SearchResultProps);
    /**
     * Factory method to create a SearchResult
     */
    static create(props: Omit<SearchResultProps, 'id' | 'timestamp'>): SearchResult;
    /**
     * Gets the unique identifier
     */
    get id(): string;
    /**
     * Gets the result title
     */
    get title(): string;
    /**
     * Gets the result URL
     */
    get url(): string;
    /**
     * Gets the result description
     */
    get description(): string;
    /**
     * Gets the position in search results (1-based)
     */
    get position(): number;
    /**
     * Gets the display URL
     */
    get displayUrl(): string | undefined;
    /**
     * Gets the favicon URL
     */
    get favicon(): string | undefined;
    /**
     * Checks if this is an advertisement
     */
    get isAd(): boolean;
    /**
     * Checks if this is a featured snippet
     */
    get isFeatured(): boolean;
    /**
     * Gets the timestamp when this result was captured
     */
    get timestamp(): Date;
    /**
     * Gets additional metadata
     */
    get metadata(): Record<string, any> | undefined;
    /**
     * Validates the search result
     * @throws {Error} If validation fails
     */
    private validate;
    /**
     * Checks if a URL is valid
     */
    private isValidUrl;
    /**
     * Gets the domain from the URL
     */
    getDomain(): string;
    /**
     * Checks if the result is from a specific domain
     */
    isFromDomain(domain: string): boolean;
    /**
     * Converts to a plain object for serialization
     */
    toJSON(): SearchResultProps;
    /**
     * Creates a SearchResult from JSON data
     */
    static fromJSON(data: any): SearchResult;
}
//# sourceMappingURL=search-result.d.ts.map