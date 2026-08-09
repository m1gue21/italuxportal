import { useCallback, useEffect, useMemo, useState } from "react";
import type { CatalogCurrency } from "./catalog-meta";
import { DEFAULT_PRICING, priceForRole, type PricingConfig } from "./pricing";
import type { CatalogProduct, InvestorRole, OrderLine, OrderState } from "./types";

function makeOrderId(countryCode: string): string {
  const part = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${countryCode}-${part}`;
}

function defaultState(countryCode: string): OrderState {
  return {
    role: "mayorista",
    items: [],
    orderId: makeOrderId(countryCode),
    customerName: "",
    customerCity: "",
  };
}

function loadState(storageKey: string, countryCode: string): OrderState {
  if (typeof window === "undefined") return defaultState(countryCode);
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultState(countryCode);
    const parsed = JSON.parse(raw) as Partial<OrderState>;
    return {
      role: parsed.role === "empresario" ? "empresario" : "mayorista",
      items: Array.isArray(parsed.items) ? parsed.items : [],
      orderId:
        typeof parsed.orderId === "string" ? parsed.orderId : makeOrderId(countryCode),
      customerName: typeof parsed.customerName === "string" ? parsed.customerName : "",
      customerCity: typeof parsed.customerCity === "string" ? parsed.customerCity : "",
    };
  } catch {
    return defaultState(countryCode);
  }
}

export function useOrderCart(
  countryCode: string,
  pricing: PricingConfig = DEFAULT_PRICING,
  currency: CatalogCurrency = "CLP",
) {
  const storageKey = `italux-catalog-order-${countryCode.toLowerCase()}`;
  const [state, setState] = useState<OrderState>(() => defaultState(countryCode));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState(storageKey, countryCode));
    setHydrated(true);
  }, [storageKey, countryCode]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, hydrated, storageKey]);

  const setRoleAndReprice = useCallback(
    (role: InvestorRole, productsByHandle: Map<string, CatalogProduct>) => {
      setState((prev) => ({
        ...prev,
        role,
        items: prev.items.map((item) => {
          const product = productsByHandle.get(item.handle);
          if (!product) return { ...item, role };
          return {
            ...item,
            role,
            unitPrice: priceForRole(product, role, pricing, currency),
          };
        }),
      }));
    },
    [pricing, currency],
  );

  const addItem = useCallback(
    (product: CatalogProduct, qty: number, role: InvestorRole) => {
      if (qty < 1) return;
      setState((prev) => {
        const existing = prev.items.find((i) => i.handle === product.handle);
        const unitPrice = priceForRole(product, role, pricing, currency);
        if (existing) {
          return {
            ...prev,
            role,
            items: prev.items.map((i) =>
              i.handle === product.handle
                ? { ...i, qty: i.qty + qty, unitPrice, role }
                : i,
            ),
          };
        }
        const line: OrderLine = {
          handle: product.handle,
          title: product.title,
          sku: product.sku,
          imageUrl: product.imageUrl,
          qty,
          unitPrice,
          role,
        };
        return { ...prev, role, items: [...prev.items, line] };
      });
    },
    [pricing, currency],
  );

  const setQty = useCallback((handle: string, qty: number) => {
    setState((prev) => {
      if (qty < 1) {
        return { ...prev, items: prev.items.filter((i) => i.handle !== handle) };
      }
      return {
        ...prev,
        items: prev.items.map((i) => (i.handle === handle ? { ...i, qty } : i)),
      };
    });
  }, []);

  const removeItem = useCallback((handle: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.handle !== handle),
    }));
  }, []);

  const clearOrder = useCallback(() => {
    setState({
      ...defaultState(countryCode),
      orderId: makeOrderId(countryCode),
    });
  }, [countryCode]);

  const setCustomerName = useCallback((customerName: string) => {
    setState((prev) => ({ ...prev, customerName }));
  }, []);

  const setCustomerCity = useCallback((customerCity: string) => {
    setState((prev) => ({ ...prev, customerCity }));
  }, []);

  const totalPieces = useMemo(
    () => state.items.reduce((sum, i) => sum + i.qty, 0),
    [state.items],
  );

  const totalAmount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    [state.items],
  );

  return {
    ...state,
    hydrated,
    totalPieces,
    totalAmount,
    setRoleAndReprice,
    addItem,
    setQty,
    removeItem,
    clearOrder,
    setCustomerName,
    setCustomerCity,
  };
}
