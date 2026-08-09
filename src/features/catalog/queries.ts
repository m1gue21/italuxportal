import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapCatalogRow, mapProductRow, type PublicCatalog } from "./supabase-map";
import type { CatalogProduct } from "./types";
import { getCatalogCategories } from "./product-registry";
import type { CatalogCategory } from "./types";

export const publicCatalogsQuery = queryOptions({
  queryKey: ["investor_catalogs", "public"],
  queryFn: async (): Promise<PublicCatalog[]> => {
    const { data, error } = await supabase
      .from("investor_catalogs")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return (data ?? []).map(mapCatalogRow);
  },
  staleTime: 30_000,
});

export const catalogBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["investor_catalogs", "slug", slug],
    queryFn: async (): Promise<PublicCatalog | null> => {
      const { data, error } = await supabase
        .from("investor_catalogs")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data ? mapCatalogRow(data) : null;
    },
    staleTime: 30_000,
  });

export const catalogByCodeQuery = (code: string) =>
  queryOptions({
    queryKey: ["investor_catalogs", "code", code],
    queryFn: async (): Promise<PublicCatalog | null> => {
      const { data, error } = await supabase
        .from("investor_catalogs")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (error) throw error;
      return data ? mapCatalogRow(data) : null;
    },
    staleTime: 30_000,
  });

export const publicProductsQuery = (catalogCode: string) =>
  queryOptions({
    queryKey: ["investor_products", "public", catalogCode],
    queryFn: async (): Promise<CatalogProduct[]> => {
      const { data, error } = await supabase
        .from("investor_products")
        .select("*")
        .eq("catalog_code", catalogCode)
        .eq("is_active", true)
        .order("title");
      if (error) throw error;
      return (data ?? []).map(mapProductRow);
    },
    staleTime: 30_000,
  });

export const adminCatalogsQuery = queryOptions({
  queryKey: ["investor_catalogs", "admin"],
  queryFn: async (): Promise<PublicCatalog[]> => {
    const { data, error } = await supabase
      .from("investor_catalogs")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data ?? []).map(mapCatalogRow);
  },
  staleTime: 0,
});

export const adminProductsQuery = (catalogCode: string) =>
  queryOptions({
    queryKey: ["investor_products", "admin", catalogCode],
    queryFn: async (): Promise<CatalogProduct[]> => {
      const { data, error } = await supabase
        .from("investor_products")
        .select("*")
        .eq("catalog_code", catalogCode)
        .order("title");
      if (error) throw error;
      return (data ?? []).map(mapProductRow);
    },
    staleTime: 0,
  });

export function categoriesForProducts(products: CatalogProduct[]): CatalogCategory[] {
  const set = new Set<CatalogCategory>();
  for (const p of products) {
    for (const c of p.categories) set.add(c);
  }
  const known = getCatalogCategories("CL");
  return known.filter((c) => set.has(c)).concat(
    [...set].filter((c) => !known.includes(c)),
  );
}
