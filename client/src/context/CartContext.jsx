import { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartContext = createContext({
  items: [],
  count: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isInCart: () => false,
});

const getItemId = (item) =>
  item?._id ?? item?.id ?? item?.sku ?? item?.name ?? null;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((item) => {
    const id = getItemId(item);
    if (!id) return;
    setItems((prev) => {
      const existing = prev.find((entry) => getItemId(entry) === id);
      if (existing) {
        return prev.map((entry) =>
          getItemId(entry) === id
            ? { ...entry, quantity: (entry.quantity || 1) + (item.quantity || 1), cartMode: item.cartMode || entry.cartMode }
            : entry
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    if (!id) return;
    setItems((prev) => prev.filter((item) => getItemId(item) !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (!id) return;
    const nextQty = Number(quantity);
    if (!Number.isFinite(nextQty)) return;
    setItems((prev) =>
      prev
        .map((item) =>
          getItemId(item) === id
            ? { ...item, quantity: Math.max(1, Math.floor(nextQty)) }
            : item
        )
        .filter((item) => (item.quantity || 1) > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (id) => items.some((item) => getItemId(item) === id),
    [items]
  );

  const count = useMemo(
    () =>
      items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
    }),
    [items, count, addItem, removeItem, updateQuantity, clearCart, isInCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
