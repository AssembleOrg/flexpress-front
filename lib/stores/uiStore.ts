import { create } from "zustand";

interface UIState {
  isGlobalLoading: boolean;
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  sidebarOpen: boolean;
}

interface UIActions {
  setGlobalLoading: (loading: boolean) => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  // Estado inicial
  isGlobalLoading: false,
  isModalOpen: false,
  modalContent: null,
  sidebarOpen: false,

  // Acciones
  setGlobalLoading: (loading: boolean) => set({ isGlobalLoading: loading }),

  openModal: (content: React.ReactNode) =>
    set({
      isModalOpen: true,
      modalContent: content,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      modalContent: null,
    }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}));
