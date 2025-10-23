import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  product: {
    id: string;
    species_name: string;
    scientific_name?: string;
    price: number;
    image_url?: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (product: { id: string; species_name: string; scientific_name?: string; price: number; image_url?: string }, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (product: { id: string; species_name: string; scientific_name?: string; price: number; image_url?: string }, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.product.id === product.id);

        if (existingItem) {
          existingItem.quantity += quantity;
          existingItem.total_price = existingItem.quantity * existingItem.unit_price;
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product: {
              id: product.id,
              species_name: product.species_name,
              scientific_name: product.scientific_name,
              price: product.price,
              image_url: product.image_url,
            },
            quantity,
            unit_price: product.price,
            total_price: quantity * product.price,
          };
          items.push(newItem);
        }

        const total = items.reduce((sum, item) => sum + item.total_price, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        set({ items: [...items], total, itemCount });
      },

      removeItem: (productId: string) => {
        const items = get().items.filter(item => item.product.id !== productId);
        const total = items.reduce((sum, item) => sum + item.total_price, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        set({ items, total, itemCount });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const items = get().items.map(item => {
          if (item.product.id === productId) {
            item.quantity = quantity;
            item.total_price = quantity * item.unit_price;
          }
          return item;
        });

        const total = items.reduce((sum, item) => sum + item.total_price, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        set({ items, total, itemCount });
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
      },

      getTotal: () => get().total,

      getItemCount: () => get().itemCount,
    }),
    {
      name: 'cart-storage',
    }
  )
);