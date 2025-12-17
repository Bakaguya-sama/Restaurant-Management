import { MenuItem } from "../types";

// ==================== TYPE DEFINITIONS ====================

export interface DishDTO {
  id: string;
  name: string;
  description?: string;
  category: "appetizer" | "main_course" | "dessert" | "beverage" | string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

export interface GetDishesParams {
  search?: string;
  category?: "appetizer" | "main_course" | "dessert" | "beverage";
  is_available?: boolean;
}

// ==================== API CONFIGURATION ====================

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:5001/api/v1";

// ==================== CATEGORY MAPPING ====================

/**
 * Map between API categories and Vietnamese UI labels
 */
export const CATEGORY_MAP = {
  apiToUi: {
    appetizer: "Khai vị",
    main_course: "Món chính",
    beverage: "Đồ uống",
    dessert: "Tráng miệng",
  } as Record<string, string>,
  
  uiToApi: {
    "Khai vị": "appetizer",
    "Món chính": "main_course",
    "Đồ uống": "beverage",
    "Tráng miệng": "dessert",
  } as Record<string, "appetizer" | "main_course" | "beverage" | "dessert">,
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Map API dish data to MenuItem format for UI
 */
export function mapDishToMenuItem(dish: DishDTO): MenuItem {
  return {
    id: dish.id,
    name: dish.name,
    category: CATEGORY_MAP.apiToUi[dish.category] || dish.category,
    price: dish.price,
    description: dish.description,
    image: dish.image_url,
    available: dish.is_available,
  };
}

/**
 * Map Vietnamese UI category to API category
 */
export function mapUiCategoryToApi(
  uiCategory: string
): "appetizer" | "main_course" | "beverage" | "dessert" | undefined {
  return CATEGORY_MAP.uiToApi[uiCategory];
}

// ==================== API FUNCTIONS ====================

/**
 * Fetch dishes from backend API
 * @param params - Query parameters for filtering dishes
 * @returns Promise<MenuItem[]> - Array of menu items
 */
export async function fetchDishes(
  params: GetDishesParams = {}
): Promise<MenuItem[]> {
  const url = new URL(`${API_BASE}/dishes`);

  // Add query parameters
  if (params.search) {
    url.searchParams.set("search", params.search);
  }
  if (params.category) {
    url.searchParams.set("category", params.category);
  }
  if (typeof params.is_available === "boolean") {
    url.searchParams.set("is_available", String(params.is_available));
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch dishes: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const dishes = (json?.data || []) as DishDTO[];

  // Map API data to UI format
  return dishes.map(mapDishToMenuItem);
}
