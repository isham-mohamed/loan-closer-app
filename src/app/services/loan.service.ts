import { Injectable } from '@angular/core';
import {
  AmortizationRow,
  LoanCalculationResult,
  LoanData,
  LoanInput,
} from '../models/loan-data.model';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private readonly STORAGE_KEY = 'loanCalculatorData';

  loadData(): LoanData | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load data from localStorage:', e);
    }
    return null;
  }

  saveData(data: LoanData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data to localStorage:', e);
    }
  }

  clearData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
  }

  calculateLoan(input: LoanInput): LoanCalculationResult {
    const P = Number(input.principal) || 0;
    const annualRate = Number(input.annualRate) || 0;
    let n = 0;

    if (input.tenureMonths) {
      n = Number(input.tenureMonths);
    } else if (input.tenureYears) {
      n = Number(input.tenureYears) * 12;
    } else {
      n = 0;
    }

    const r = annualRate / 100 / 12; // monthly rate

    const result: LoanCalculationResult = {
      emi: 0,
      totalInterest: 0,
      totalPayable: 0,
      schedule: [],
    };

    if (P <= 0 || n <= 0) {
      return result;
    }

    if (r === 0) {
      result.emi = P / n;
    } else {
      const factor = Math.pow(1 + r, n);
      result.emi = (P * r * factor) / (factor - 1);
    }

    // round EMI to 2 decimals
    result.emi = Math.round(result.emi * 100) / 100;

    let balance = P;
    let totalInterest = 0;

    // Parse start date or use today's date
    const startDate = input.startDate ? new Date(input.startDate) : new Date();
    const currentDate = new Date(startDate);

    for (let i = 1; i <= n; i++) {
      // Move to next month for due date
      currentDate.setMonth(currentDate.getMonth() + 1);
      const dueDate = currentDate.toISOString().split('T')[0];

      const interest = Math.round(balance * r * 100) / 100;
      // principal component may need to be adjusted on last payment
      let principalComponent = Math.round((result.emi - interest) * 100) / 100;
      if (i === n) {
        // final payment: pay off remaining balance
        principalComponent = Math.round(balance * 100) / 100;
      }
      let closing = Math.round((balance - principalComponent) * 100) / 100;
      if (closing < 0) closing = 0;

      const row: AmortizationRow = {
        month: i,
        dueDate,
        opening: Math.round(balance * 100) / 100,
        emi: result.emi,
        interest,
        principal: principalComponent,
        closing,
      };

      result.schedule.push(row);
      totalInterest += interest;
      balance = closing;
    }

    result.totalInterest = Math.round(totalInterest * 100) / 100;
    result.totalPayable = Math.round(result.emi * n * 100) / 100;

    return result;
  }
}
