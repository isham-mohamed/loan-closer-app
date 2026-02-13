export interface LoanInput {
  principal: number | null;
  annualRate: number | null;
  tenureYears: number | null;
  tenureMonths: number | null;
}

export interface AmortizationRow {
  month: number;
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
