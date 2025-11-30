/**
 * API Services Barrel Export
 * Centralizes all API service exports for cleaner imports
 */

export type * from "./admin";
export { adminApi } from "./admin";
export type * from "./auth";
export { authApi } from "./auth";
export type * from "./feedback";
export { feedbackApi } from "./feedback";
export type * from "./geo";
export { geoApi } from "./geo";
export type * from "./payments";
export { paymentsApi } from "./payments";
export type * from "./travelMatching";
export { travelMatchingApi } from "./travelMatching";
export type * from "./systemConfig";
export { systemConfigApi } from "./systemConfig";
