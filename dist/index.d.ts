/**
 * @fileoverview Main exports for @semantest/google.com package
 * @author Semantest Team
 * @module @semantest/google.com
 */
export * from './domain';
export * from './infrastructure';
export * from './application';
export { GoogleBuddyClient } from './google-buddy-client';
export type { GoogleBuddyClientConfig, SearchResponse } from './google-buddy-client';
export { SearchQuery } from './domain/value-objects/search-query';
export { SearchResult } from './domain/entities/search-result';
export { GoogleSearch, SearchStatus } from './domain/entities/google-search';
export { GoogleApplication } from './application/google-application';
export { GoogleCommunicationAdapter } from './infrastructure/adapters/google-communication-adapter';
export { GoogleSearchAdapter } from './infrastructure/adapters/google-search-adapter';
export { GoogleEventNames } from './domain/events';
export declare const PACKAGE_NAME = "@semantest/google.com";
export declare const PACKAGE_VERSION = "2.0.0";
//# sourceMappingURL=index.d.ts.map