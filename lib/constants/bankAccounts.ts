export interface BankAccount {
  id: string;
  alias: string;
  accountNumber: string;
  accountType: "CBU" | "CVU";
  holder: string;
  bank?: string;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "blessedtech",
    alias: "blessedtech",
    accountNumber: "0000003100015518948401",
    accountType: "CVU",
    holder: "Holmes Andres Garcia Agudelo",
    bank: "Mercado Pago",
  },
  {
    id: "flexpress",
    alias: "flexpress",
    accountNumber: "4530000800010697675573",
    accountType: "CBU",
    holder: "Holmes Andres Garcia Agudelo",
    bank: "Naranja X",
  },
];
