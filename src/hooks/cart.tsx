import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async (): Promise<void> => {
      const items = await AsyncStorage.getItem('@GoMarketPlace:products');

      if (items) {
        setProducts(JSON.parse(items));
      }
    };

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product): Promise<void> => {
      const items = [...products, { ...product, quantity: 1 }];
      setProducts(items);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(items),
      );
    },
    [products],
  );

  const increment = useCallback(
    async (id): Promise<void> => {
      const items = [...products];
      const index = items.findIndex(item => item.id === id);
      const aux = items[index];
      aux.quantity += 1;
      items[index] = aux;
      setProducts(items);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(items),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async (id): Promise<void> => {
      let items = [...products];
      const index = items.findIndex(item => item.id === id);
      const aux = items[index];
      aux.quantity -= 1;
      if (aux.quantity <= 0) {
        delete items[index];
        items = items.filter(item => item);
      } else {
        items[index] = aux;
      }
      setProducts(items);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(items),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
