import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect
} from 'react';

import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  branchId: number;
}

interface CartContextType {
  cart: CartItem[];

  addToCart: (
    item: CartItem
  ) => {
    success: boolean;
    message?: string;
  };

  removeFromCart: (
    id: string
  ) => void;

  increaseQuantity: (
    id: string
  ) => void;

  decreaseQuantity: (
    id: string
  ) => void;

  clearCart: () => void;

  total: number;

  cartBranchId: number | null;
}

const CartContext =
  createContext<CartContextType | null>(
    null
  );

export const CartProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();

  const [cart, setCart] = useState<
    CartItem[]
  >([]);

  // ─────────────────────────────
  // Unique cart key per user
  // ─────────────────────────────
  const cartStorageKey = user
    ? `cart_${user.id}`
    : 'cart_guest';

  // ─────────────────────────────
  // Load cart whenever user changes
  // ─────────────────────────────
  useEffect(() => {
    const storedCart =
      localStorage.getItem(
        cartStorageKey
      );

    if (storedCart) {
      try {
        setCart(
          JSON.parse(storedCart)
        );
      } catch {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [cartStorageKey]);

  // ─────────────────────────────
  // Save cart whenever it changes
  // ─────────────────────────────
  useEffect(() => {
    localStorage.setItem(
      cartStorageKey,
      JSON.stringify(cart)
    );
  }, [cart, cartStorageKey]);

  // ─────────────────────────────
  // Current branch lock
  // ─────────────────────────────
  const cartBranchId: number | null =
    cart.length > 0
      ? cart[0].branchId
      : null;

  // ─────────────────────────────
  // Add to cart
  // ─────────────────────────────
  const addToCart = (
    item: CartItem
  ): {
    success: boolean;
    message?: string;
  } => {
    // Prevent mixing branches
    if (
      cart.length > 0 &&
      cart[0].branchId !==
        item.branchId
    ) {
      return {
        success: false,
        message:
          'Your cart already has items from another branch. Please clear your cart before ordering from a different location.'
      };
    }

    setCart(prev => {
      const existing =
        prev.find(
          i => i.id === item.id
        );

      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? {
                ...i,
                quantity:
                  i.quantity + 1
              }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1
        }
      ];
    });

    return {
      success: true
    };
  };

  // ─────────────────────────────
  // Remove item
  // ─────────────────────────────
  const removeFromCart = (
    id: string
  ) => {
    setCart(prev =>
      prev.filter(
        item => item.id !== id
      )
    );
  };

  // ─────────────────────────────
  // Increase quantity
  // ─────────────────────────────
  const increaseQuantity = (
    id: string
  ) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1
            }
          : item
      )
    );
  };

  // ─────────────────────────────
  // Decrease quantity
  // ─────────────────────────────
  const decreaseQuantity = (
    id: string
  ) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1
              }
            : item
        )
        .filter(
          item => item.quantity > 0
        )
    );
  };

  // ─────────────────────────────
  // Clear cart
  // ─────────────────────────────
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(
      cartStorageKey
    );
  };

  // ─────────────────────────────
  // Total
  // ─────────────────────────────
  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.quantity,
      0
    );
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        total,
        cartBranchId
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within CartProvider'
    );
  }

  return context;
};