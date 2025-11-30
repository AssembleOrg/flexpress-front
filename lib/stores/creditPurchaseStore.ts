/**
 * Credit Purchase Store (Zustand)
 * Maneja el estado del MODAL de compra de créditos (UI State)
 */

import { create } from "zustand";

interface CreditPurchaseState {
  // Modal open/close
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;

  // Amount and credits (calculated from ARS input)
  customCredits: number;
  customAmount: number;
  setCustomCredits: (credits: number) => void;
  setCustomAmount: (amount: number) => void;

  // Receipt upload
  receiptUrl: string | null;
  setReceiptUrl: (url: string | null) => void;

  // Reset all
  resetPurchase: () => void;
}

export const useCreditPurchaseStore = create<CreditPurchaseState>((set) => ({
  // Initial state
  isModalOpen: false,
  customCredits: 0,
  customAmount: 0,
  receiptUrl: null,

  // Actions
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  setCustomCredits: (credits) => set({ customCredits: credits }),
  setCustomAmount: (amount) => set({ customAmount: amount }),
  setReceiptUrl: (url) => set({ receiptUrl: url }),
  resetPurchase: () =>
    set({
      customCredits: 0,
      customAmount: 0,
      receiptUrl: null,
    }),
}));
