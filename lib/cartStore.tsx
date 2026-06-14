"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

// ── Cart item shape ────────────────────────────────────────────────────────────
// Uses only the fields we need — compatible with both Product and MappedProduct.
export interface CartProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  brand: string;
  category: string;
  caseCount: number;
  pricePerPiece: number;
  pricePerCarton: number;
  hasTax: boolean;
  image: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

// ── Reducer ───────────────────────────────────────────────────────────────────
interface CartState { items: CartItem[] }

type CartAction =
  | { type: "ADD";    product: CartProduct }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE"; id: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: 1 }] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.product.id !== action.id) };
    case "UPDATE": {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.product.id !== action.id) };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    }
    case "CLEAR":
      return { items: [] };
    case "HYDRATE":
      return { items: action.items };
    default:
      return state;
  }
}

const STORAGE_KEY = "mass_dist_cart";

// ── Context ───────────────────────────────────────────────────────────────────
interface CartContextType {
  items: CartItem[];
  add: (product: CartProduct) => void;
  remove: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const items = JSON.parse(saved) as CartItem[];
        if (Array.isArray(items) && items.length > 0) {
          dispatch({ type: "HYDRATE", items });
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore storage errors (private mode, quota exceeded)
    }
  }, [state.items]);

  const total = state.items.reduce((sum, i) => sum + i.product.pricePerPiece * i.quantity, 0);
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items:     state.items,
      add:       (product) => dispatch({ type: "ADD",    product }),
      remove:    (id)      => dispatch({ type: "REMOVE", id }),
      update:    (id, qty) => dispatch({ type: "UPDATE", id, quantity: qty }),
      clear:     ()        => dispatch({ type: "CLEAR" }),
      total,
      count,
      cartCount: count,
      cartTotal: total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
