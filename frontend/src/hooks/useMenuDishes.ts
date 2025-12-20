import { useEffect, useState } from "react";
import { Dish } from "../types";
import {
  fetchDishes,
  GetDishesParams,
  mapUiCategoryToApi,
} from "../lib/menuPageApi";

// ==================== CUSTOM HOOK ====================

/**
 * Custom hook to fetch and manage dishes data from API
 * 
 * @param searchQuery - Search term for filtering dishes by name
 * @param selectedCategory - Selected UI category (e.g., "Khai vị", "Món chính", "all")
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Object containing items, loading state, and error
 * 
 * @example
 * ```tsx
 * const { items, loading, error } = useMenuDishes(searchQuery, selectedCategory);
 * ```
 */
export function useMenuDishes(
  searchQuery: string,
  selectedCategory: string,
  debounceMs: number = 300
) {
  const [items, setItems] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search query to reduce API calls
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Fetch dishes effect
  useEffect(() => {
    let cancelled = false;

    async function loadDishes() {
      setLoading(true);
      setError(null);

      try {
        const params: GetDishesParams = {};

        // Add search parameter if exists
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        // Add category parameter (convert UI category to API category)
        if (selectedCategory !== "all") {
          const apiCategory = mapUiCategoryToApi(selectedCategory);
          if (apiCategory) {
            params.category = apiCategory;
          }
        }

        const dishes = await fetchDishes(params);

        if (!cancelled) {
          setItems(dishes);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to load dishes:", err);
          setError(err?.message || "Không thể tải dữ liệu món ăn");
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDishes();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, selectedCategory]);

  return { items, loading, error };
}
