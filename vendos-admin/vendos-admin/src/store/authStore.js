import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  owner: null,

  login: (email, password) => {
    // Replace with real API call later
    if (email === 'admin@vendos.com' && password === 'admin123') {
      set({ isAuthenticated: true, owner: { name: 'Owner', email } });
      return true;
    }
    return false;
  },

  logout: () => set({ isAuthenticated: false, owner: null }),
}));
