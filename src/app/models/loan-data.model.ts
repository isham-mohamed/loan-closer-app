export interface LoanInput {
  principal: number | null;
  annualRate: number | null;
  tenureYears: number | null;
  tenureMonths: number | null;
  startDate: string | null;
}

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

export interface LoanData extends LoanInput {
  result?: LoanCalculationResult;
}
