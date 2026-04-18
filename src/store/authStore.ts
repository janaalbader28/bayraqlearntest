import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => {
                set({ user: null });
                // Optionally trigger API logout here
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
