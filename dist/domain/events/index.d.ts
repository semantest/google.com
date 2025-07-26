/**
 * @fileoverview Domain events index for Google domain
 * @author Semantest Team
 * @module domain/events
 */
export * from './search-requested.event';
export * from './search-completed.event';
export * from './search-failed.event';
export * from './result-clicked.event';
export declare const GoogleEventNames: {
    readonly SEARCH_REQUESTED: "google.search.requested";
    readonly SEARCH_COMPLETED: "google.search.completed";
    readonly SEARCH_FAILED: "google.search.failed";
    readonly RESULT_CLICKED: "google.result.clicked";
};
export type GoogleEventName = typeof GoogleEventNames[keyof typeof GoogleEventNames];
//# sourceMappingURL=index.d.ts.map