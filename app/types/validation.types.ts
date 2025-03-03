export interface ValidationResult {
  isValid: boolean;
  error?: {
    title: string;
    description: string;
  };
} 
