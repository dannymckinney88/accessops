/**
 * Grand Central Station for Data Access
 * This file exports all seeds, types, and query logic.
 */

// 1. Export all raw mock data (seeds)
export * from "./seeds";

// 2. Export all core domain types
export * from "./types/domain";

// 3. Export all feature-specific logic (queries)
// Note: We use full names for all exports to ensure zero shorthand confusion.
export * from "./queries/shared";
export * from "./queries/dashboard";
export * from "./queries/scans";
export * from "./queries/issues";
export * from "./queries/compare";
