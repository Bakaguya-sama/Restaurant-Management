import { useEffect, useState } from "react";
import { MenuItem } from "../types";
import { fetchDishes, mapUiCategoryToApi } from "../lib/menuPageApi";

// ==================== CUSTOM HOOK ====================

/**
 * Custom hook to fetch dishes for ordering page
 * No search functionality - only category filter
 * 
 * @param selectedCategory - Selected UI category (e.g., "Khai vị", "Món chính", "all")
 * @returns Object containing items, loading state, and error
 * 
 * @example
 * ```tsx
 * const { items, loading, error } = useOrderingDishes(selectedCategory);
 * ```
 */
export function useOrderingDishes(selectedCategory: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDishes() {
      setLoading(true);
      setError(null);

      try {
        const params: any = {};

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
          setError(err.message || "Failed to fetch dishes");
          setItems([]); // Clear items on error
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDishes();

    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  return { items, loading, error };
}
