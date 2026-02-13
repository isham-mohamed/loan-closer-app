import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { LoanService } from '../services/loan.service';
import { ThemeService } from '../services/theme.service';
import {
  AmortizationRow,
  ExtraPaymentComparison,
  ExtraPaymentStrategy,
  LoanCalculationResult,
  LoanInput,
} from '../models/loan-data.model';
import { CalculatorHeaderComponent } from './calculator-header/calculator-header.component';
import { LoanFormComponent } from './loan-form/loan-form.component';
import { LoanSummaryComponent } from './loan-summary/loan-summary.component';
import { AmortizationTableComponent } from './amortization-table/amortization-table.component';
import { ExtraPaymentStrategyDialogComponent } from './extra-payment-strategy-dialog/extra-payment-strategy-dialog.component';
import { ExtraPaymentComparisonComponent } from './extra-payment-comparison/extra-payment-comparison.component';

const LOCALE = 'en-IN';

@Component({
  selector: 'app-loan-calculator',
  standalone: true,
  imports: [
    CommonModule,
    CalculatorHeaderComponent,
    LoanFormComponent,
    LoanSummaryComponent,
    AmortizationTableComponent,
    ExtraPaymentStrategyDialogComponent,
    ExtraPaymentComparisonComponent,
  ],
  templateUrl: './loan-calculator.component.html',
  styleUrls: ['./loan-calculator.component.scss'],
})
export class LoanCalculatorComponent implements OnInit {
  principal: number | null = null;
  principalDisplay = '';
  annualRate: number | null = null;
  tenureYears: number | null = null;
  tenureMonths: number | null = null;
  startDate = this.getTodayDate();
  extraPayment: number | null = null;
  extraPaymentDisplay = '';

  emi = 0;
  totalPayable = 0;
  totalInterest = 0;
  schedule: AmortizationRow[] = [];

  showStrategyDialog = false;
  comparison: ExtraPaymentComparison | null = null;
  selectedStrategy: ExtraPaymentStrategy = null;

  constructor(
    private loanService: LoanService,
    private theme: ThemeService,
    private el: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    this.theme.loadTheme();
    this.theme.applyThemeToElement(this.el.nativeElement);
    this.loadData();
  }

  calculate(): void {
    const input = this.buildLoanInput();
    const result = this.loanService.calculateLoan(input);

    this.emi = result.emi;
    this.totalInterest = result.totalInterest;
    this.totalPayable = result.totalPayable;
    this.schedule = result.schedule;

    if (this.extraPayment && this.extraPayment > 0) {
      this.showStrategyDialog = true;
    } else {
      this.comparison = null;
    }

    this.saveData();
  }

  resetAll(): void {
    this.principal = null;
    this.principalDisplay = '';
    this.annualRate = null;
    this.tenureYears = null;
    this.tenureMonths = null;
    this.startDate = this.getTodayDate();
    this.extraPayment = null;
    this.extraPaymentDisplay = '';
    this.resetResults();
    this.showStrategyDialog = false;
    this.comparison = null;
    this.selectedStrategy = null;
    this.loanService.clearData();
  }

  onPrincipalChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value.replace(/,/g, '');
    if (!input) {
      this.principal = null;
      this.principalDisplay = '';
      return;
    }
    const num = parseInt(input, 10);
    if (!isNaN(num)) {
      this.principal = num;
      this.principalDisplay = num.toLocaleString(LOCALE);
    }
  }

  onExtraPaymentChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value.replace(/,/g, '');
    if (!input) {
      this.extraPayment = null;
      this.extraPaymentDisplay = '';
      return;
    }
    const num = parseInt(input, 10);
    if (!isNaN(num) && num > 0) {
      this.extraPayment = num;
      this.extraPaymentDisplay = num.toLocaleString(LOCALE);
    }
  }

  onStrategySelected(strategy: ExtraPaymentStrategy): void {
    this.selectedStrategy = strategy;
    this.calculateComparison();
    this.showStrategyDialog = false;
  }

  closeStrategyDialog(): void {
    this.showStrategyDialog = false;
  }

  clearComparison(): void {
    this.comparison = null;
    this.selectedStrategy = null;
    this.extraPayment = null;
    this.extraPaymentDisplay = '';
  }

  private calculateComparison(): void {
    const input = this.buildLoanInput();
    const original = this.loanService.calculateLoan(input);

    const inputReduceEmi = {
      ...input,
      principal: (input.principal || 0) - (this.extraPayment || 0),
    };
    const withExtraPaymentReduceEmi = this.loanService.calculateLoan(inputReduceEmi);
    const withExtraPaymentReduceTenure = this.calculateWithReducedTenure(input);

    this.comparison = {
      original,
      withExtraPaymentReduceEmi,
      withExtraPaymentReduceTenure,
    };
  }

  private calculateWithReducedTenure(input: LoanInput): LoanCalculationResult {
    if (!this.extraPayment || this.extraPayment <= 0) {
      return this.loanService.calculateLoan(input);
    }

    const tempMonths = this.getTotalMonths(input);

    for (let m = tempMonths; m >= 1; m--) {
      const tempInput = { ...input, tenureMonths: m };
      const tempResult = this.loanService.calculateLoan(tempInput);

      if (
        tempResult.totalPayable + this.extraPayment >=
        this.loanService.calculateLoan(input).totalPayable
      ) {
        return tempResult;
      }
    }

    return this.loanService.calculateLoan(input);
  }

  private getTotalMonths(input: LoanInput): number {
    if (input.tenureMonths && input.tenureMonths > 0) return input.tenureMonths;
    if (input.tenureYears && input.tenureYears > 0) return input.tenureYears * 12;
    return 0;
  }

  private loadData(): void {
    const data = this.loanService.loadData();
    if (!data) return;

    this.principal = data.principal ?? null;
    this.principalDisplay = data.principal ? data.principal.toLocaleString(LOCALE) : '';
    this.annualRate = data.annualRate ?? null;
    this.tenureYears = data.tenureYears ?? null;
    this.tenureMonths = data.tenureMonths ?? null;
    this.startDate = data.startDate ?? this.getTodayDate();
    this.extraPayment = data.extraPayment ?? null;
    this.extraPaymentDisplay = data.extraPayment
      ? data.extraPayment.toLocaleString(LOCALE)
      : '';

    if (data.result) {
      this.emi = data.result.emi;
      this.totalInterest = data.result.totalInterest;
      this.totalPayable = data.result.totalPayable;
      this.schedule = data.result.schedule;
    }

    if (data.comparison) {
      this.comparison = data.comparison;
    }
  }

  private saveData(): void {
    const input = this.buildLoanInput();
    this.loanService.saveData({
      ...input,
      result: {
        emi: this.emi,
        totalInterest: this.totalInterest,
        totalPayable: this.totalPayable,
        schedule: this.schedule,
      },
      ...(this.comparison && { comparison: this.comparison }),
    });
  }

  private resetResults(): void {
    this.emi = 0;
    this.totalInterest = 0;
    this.totalPayable = 0;
    this.schedule = [];
  }

  private buildLoanInput(): LoanInput {
    return {
      principal: this.principal,
      annualRate: this.annualRate,
      tenureYears: this.tenureYears,
      tenureMonths: this.tenureMonths,
      startDate: this.startDate,
      extraPayment: this.extraPayment,
    };
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
