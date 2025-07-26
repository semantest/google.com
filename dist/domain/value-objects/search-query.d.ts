/**
 * @fileoverview Search query value object for Google domain
 * @author Semantest Team
 * @module domain/value-objects/search-query
 */
import { ValueObject } from '@typescript-eda/domain';
/**
 * Properties for SearchQuery value object
 */
interface SearchQueryProps {
    readonly value: string;
    readonly language?: string;
    readonly region?: string;
    readonly safeSearch?: boolean;
}
/**
 * Represents a search query in the Google domain
 * Encapsulates validation and business rules for search queries
 */
export declare class SearchQuery extends ValueObject<SearchQueryProps> {
    /**
     * Maximum allowed length for a search query
     */
    private static readonly MAX_QUERY_LENGTH;
    /**
     * Minimum required length for a search query
     */
    private static readonly MIN_QUERY_LENGTH;
    /**
     * Creates a SearchQuery instance
     * @param props The search query properties
     * @throws {Error} If the query is invalid
     */
    constructor(props: SearchQueryProps);
    /**
     * Factory method to create a SearchQuery from a string
     * @param query The search query string
     * @param options Optional configuration
     * @returns SearchQuery instance
     */
    static fromString(query: string, options?: Omit<SearchQueryProps, 'value'>): SearchQuery;
    /**
     * Gets the query value
     */
    get value(): string;
    /**
     * Gets the language preference
     */
    get language(): string | undefined;
    /**
     * Gets the region preference
     */
    get region(): string | undefined;
    /**
     * Gets the safe search setting
     */
    get safeSearch(): boolean;
    /**
     * Validates the search query
     * @throws {Error} If validation fails
     */
    private validate;
    /**
     * Checks if a language code is valid (ISO 639-1)
     */
    private isValidLanguageCode;
    /**
     * Checks if a region code is valid (ISO 3166-1 alpha-2)
     */
    private isValidRegionCode;
    /**
     * Converts the search query to URL-encoded format
     */
    toUrlEncoded(): string;
    /**
     * Creates a Google search URL for this query
     */
    toGoogleSearchUrl(): string;
}
export {};
//# sourceMappingURL=search-query.d.ts.map