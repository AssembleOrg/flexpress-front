export interface BankAccount {
  id: string;
  alias: string;
  accountNumber: string;
  accountType: "CBU" | "CVU";
  holder: string;
  bank?: string;
}

// Formato wa.me: código de país sin '+' ni espacios (ej AR: "54911...").
// +54 9 11 3012-4035
export const SUPPORT_WHATSAPP = "5491130124035";

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "flexpress",
    alias: "flexpress",
    accountNumber: "4530000800010697675573",
    accountType: "CBU",
    holder: "Holmes Andres Garcia Agudelo",
    bank: "Naranja X",
  },
];
