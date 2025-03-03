import { Asset } from "./types";
import { Ticket } from "./types";
import Fuse from "fuse.js";

export interface ValidationResult {
  isValid: boolean;
  error?: {
    title: string;
    description: string;
  };
} 

export interface TicketValidationParams {
  assetInType: Asset | null;
  assetOutType: Asset | null;
  amountIn: string;
  minAmountOut: string;
  expiryHours: string;
}

export interface FilterTicketsParams {
  tickets: Ticket[];
  searchQuery: string;
  fuse: Fuse<Ticket> | null;
}
