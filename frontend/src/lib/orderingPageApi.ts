import { fetchDishes, GetDishesParams, mapUiCategoryToApi } from "./menuPageApi";
import { MenuItem } from "../types";

// ==================== API FUNCTIONS ====================

/**
 * Fetch dishes for ordering page
 * Wraps menuPageApi's fetchDishes for ordering page usage
 */
export async function fetchOrderingDishes(
  params?: GetDishesParams
): Promise<MenuItem[]> {
  return fetchDishes(params);
}

/**
 * Map UI category to API category
 * Re-export for convenience
 */
export { mapUiCategoryToApi };
