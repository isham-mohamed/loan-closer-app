import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loan-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-calculator.component.html',
  styleUrls: ['./loan-calculator.component.css'],
})
export class LoanCalculatorComponent {
  principal: number | null = null;
  principalDisplay: string = '';
  annualRate: number | null = null; // percent
  tenureYears: number | null = null;
  tenureMonths: number | null = null;

  emi = 0;
  totalPayable = 0;
  totalInterest = 0;
  schedule: Array<{
    month: number;
    opening: number;
    emi: number;
    interest: number;
    principal: number;
    closing: number;
  }> = [];

  calculate() {
    const P = Number(this.principal) || 0;
    const annualRate = Number(this.annualRate) || 0;
    let n = 0;
    if (this.tenureMonths) n = Number(this.tenureMonths);
    else if (this.tenureYears) n = Number(this.tenureYears) * 12;
    else n = 0;
    const r = annualRate / 100 / 12; // monthly rate

    if (P <= 0 || n <= 0) {
      this.resetResults();
      return;
    }

    if (r === 0) {
      this.emi = P / n;
    } else {
      const factor = Math.pow(1 + r, n);
      this.emi = (P * r * factor) / (factor - 1);
    }

    // round EMI to 2 decimals
    this.emi = Math.round(this.emi * 100) / 100;

    let balance = P;
    this.schedule = [];
    let totalInterest = 0;

    for (let i = 1; i <= n; i++) {
      const interest = Math.round(balance * r * 100) / 100;
      // principal component may need to be adjusted on last payment to avoid tiny negative balances
      let principalComponent = Math.round((this.emi - interest) * 100) / 100;
      if (i === n) {
        // final payment: pay off remaining balance (deal with rounding)
        principalComponent = Math.round(balance * 100) / 100;
      }
      let closing = Math.round((balance - principalComponent) * 100) / 100;
      if (closing < 0) closing = 0;

      this.schedule.push({
        month: i,
        opening: Math.round(balance * 100) / 100,
        emi: this.emi,
        interest,
        principal: principalComponent,
        closing,
      });

      totalInterest += interest;
      balance = closing;
    }

    this.totalInterest = Math.round(totalInterest * 100) / 100;
    this.totalPayable = Math.round(this.emi * n * 100) / 100;
  }

  resetResults() {
    this.emi = 0;
    this.totalInterest = 0;
    this.totalPayable = 0;
    this.schedule = [];
  }

  resetAll() {
    this.principal = null;
    this.annualRate = null;
    this.tenureYears = null;
    this.tenureMonths = null;
    this.resetResults();
  }

  formatMoney(v: number) {
    return Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  onPrincipalChange(event: any) {
    const input = event.target.value.replace(/,/g, '');
    if (input === '') {
      this.principal = null;
      this.principalDisplay = '';
    } else {
      const num = parseInt(input, 10);
      if (!isNaN(num)) {
        this.principal = num;
        this.principalDisplay = num.toLocaleString('en-IN');
      }
    }
  }
}
