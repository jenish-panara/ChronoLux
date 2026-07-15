import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',

      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

export const useCartStore = create(
  persist(
    (set) => ({
      cartCount: 0,
      setCartCount: (count) => set({ cartCount: count }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

export const useWishlistStore = create(
  persist(
    (set) => ({
      wishlistCount: 0,
      setWishlistCount: (count) => set({ wishlistCount: count }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);