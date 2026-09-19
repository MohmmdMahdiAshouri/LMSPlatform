import { create } from 'zustand';
import { AuthStoreType } from '../types/auth.type';

export const useAuthStore = create<AuthStoreType>((set) => ({
    accessToken: null,
    
    setAccessToken: (accessToken) => set({ accessToken }),
    
    clear: () => set({ accessToken: null }),
}));
