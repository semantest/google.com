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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACKAGE_VERSION = exports.PACKAGE_NAME = exports.GoogleEventNames = exports.GoogleSearchAdapter = exports.GoogleCommunicationAdapter = exports.GoogleApplication = exports.SearchStatus = exports.GoogleSearch = exports.SearchResult = exports.SearchQuery = exports.GoogleBuddyClient = void 0;
/**
 * @fileoverview Main exports for @semantest/google.com package
 * @author Semantest Team
 * @module @semantest/google.com
 */
// Re-export all layers
__exportStar(require("./domain"), exports);
__exportStar(require("./infrastructure"), exports);
__exportStar(require("./application"), exports);
// Legacy compatibility
var google_buddy_client_1 = require("./google-buddy-client");
Object.defineProperty(exports, "GoogleBuddyClient", { enumerable: true, get: function () { return google_buddy_client_1.GoogleBuddyClient; } });
// Quick access to key classes
var search_query_1 = require("./domain/value-objects/search-query");
Object.defineProperty(exports, "SearchQuery", { enumerable: true, get: function () { return search_query_1.SearchQuery; } });
var search_result_1 = require("./domain/entities/search-result");
Object.defineProperty(exports, "SearchResult", { enumerable: true, get: function () { return search_result_1.SearchResult; } });
var google_search_1 = require("./domain/entities/google-search");
Object.defineProperty(exports, "GoogleSearch", { enumerable: true, get: function () { return google_search_1.GoogleSearch; } });
Object.defineProperty(exports, "SearchStatus", { enumerable: true, get: function () { return google_search_1.SearchStatus; } });
var google_application_1 = require("./application/google-application");
Object.defineProperty(exports, "GoogleApplication", { enumerable: true, get: function () { return google_application_1.GoogleApplication; } });
var google_communication_adapter_1 = require("./infrastructure/adapters/google-communication-adapter");
Object.defineProperty(exports, "GoogleCommunicationAdapter", { enumerable: true, get: function () { return google_communication_adapter_1.GoogleCommunicationAdapter; } });
var google_search_adapter_1 = require("./infrastructure/adapters/google-search-adapter");
Object.defineProperty(exports, "GoogleSearchAdapter", { enumerable: true, get: function () { return google_search_adapter_1.GoogleSearchAdapter; } });
// Event constants for convenience
var events_1 = require("./domain/events");
Object.defineProperty(exports, "GoogleEventNames", { enumerable: true, get: function () { return events_1.GoogleEventNames; } });
// Package metadata
exports.PACKAGE_NAME = '@semantest/google.com';
exports.PACKAGE_VERSION = '2.0.0';
//# sourceMappingURL=index.js.map