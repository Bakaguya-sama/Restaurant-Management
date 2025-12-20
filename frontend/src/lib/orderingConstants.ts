/**
 * Ordering Page Constants
 * These are hardcoded values for testing purposes
 * In production, these would come from authentication and table selection
 */

// Mock Staff ID for testing (must match a staff ID in seed.js)
// You can get real staff IDs by running: db.staffs.find() in MongoDB
export const MOCK_STAFF_ID = "674d1234567890abcdef0001"; // Replace with real ID from your seed data

// Mock Table IDs for testing (must match table IDs in seed.js)
export const MOCK_TABLE_IDS: Record<string, string> = {
  "T01": "674d1234567890abcdef1001",
  "T02": "674d1234567890abcdef1002", 
  "T03": "674d1234567890abcdef1003",
  "T09": "674d1234567890abcdef1009",
  "T010": "674d1234567890abcdef1010",
};

// Available tables for ordering (simplified - not dependent on TableMap)
export const AVAILABLE_TABLES = [
  { number: "T02", name: "Bàn T02" },
  { number: "T09", name: "Bàn T09" },
  { number: "T010", name: "Bàn T010" },
];
