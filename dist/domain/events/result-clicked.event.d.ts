/**
 * @fileoverview Result clicked event for Google domain
 * @author Semantest Team
 * @module domain/events/result-clicked
 */
import { Event } from '@typescript-eda/domain';
import { SearchResult } from '../entities/search-result';
/**
 * Payload for ResultClickedEvent
 */
export interface ResultClickedPayload {
    readonly searchId: string;
    readonly result: SearchResult;
    readonly clickedAt: Date;
    readonly tabId?: number;
    readonly clientId?: string;
    readonly context?: {
        readonly ctrlKey?: boolean;
        readonly shiftKey?: boolean;
        readonly metaKey?: boolean;
        readonly openInNewTab?: boolean;
    };
}
/**
 * Event emitted when a search result is clicked
 * Tracks user interaction with search results
 */
export declare class ResultClickedEvent extends Event {
    /**
     * Creates a ResultClickedEvent
     * @param payload The event payload
     */
    constructor(payload: ResultClickedPayload);
    /**
     * Gets the search ID
     */
    get searchId(): string;
    /**
     * Gets the clicked result
     */
    get result(): SearchResult;
    /**
     * Gets when the result was clicked
     */
    get clickedAt(): Date;
    /**
     * Gets the tab ID if specified
     */
    get tabId(): number | undefined;
    /**
     * Gets the client ID if specified
     */
    get clientId(): string | undefined;
    /**
     * Gets click context
     */
    get context(): ResultClickedPayload['context'];
    /**
     * Factory method to create the event
     */
    static create(searchId: string, result: SearchResult, options?: Partial<Omit<ResultClickedPayload, 'searchId' | 'result' | 'clickedAt'>>): ResultClickedEvent;
    /**
     * Gets the event name
     */
    static get eventName(): string;
    /**
     * Checks if the click will open in a new tab
     */
    willOpenInNewTab(): boolean;
    /**
     * Serializes the event for transport
     */
    toJSON(): any;
    /**
     * Deserializes the event from transport format
     */
    static fromJSON(data: any): ResultClickedEvent;
}
//# sourceMappingURL=result-clicked.event.d.ts.map