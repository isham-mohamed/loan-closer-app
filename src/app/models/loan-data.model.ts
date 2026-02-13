export interface LoanInput {
  principal: number | null;
  annualRate: number | null;
  tenureYears: number | null;
  tenureMonths: number | null;
  startDate: string | null;
  extraPayment?: number | null; /** 0 = at loan start, 1+ = after that many months */
  extraPaymentAtMonth?: number;
}

export type ExtraPaymentStrategy = 'reduce-emi' | 'reduce-tenure' | null;

export interface AmortizationRow {
  month: number;
  dueDate: string;
  opening: number;
  emi: number;
  interest: number;
  principal: number;
  closing: number;
}

export interface LoanCalculationResult {
  emi: number;
  totalInterest: number;
  totalPayable: number;
  schedule: AmortizationRow[];
}

export interface ExtraPaymentComparison {
  original: LoanCalculationResult;
  withExtraPaymentReduceEmi: LoanCalculationResult;
  withExtraPaymentReduceTenure: LoanCalculationResult;
}

export interface LoanData extends LoanInput {
  result?: LoanCalculationResult;
  comparison?: ExtraPaymentComparison;
}
