import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
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
import { ExtraPaymentApplied, ExtraPaymentInputDialogComponent } from './extra-payment-input-dialog/extra-payment-input-dialog.component';
import { ExtraPaymentComparisonComponent } from './extra-payment-comparison/extra-payment-comparison.component';

const LOCALE = 'en-IN';

function addMonthsToDate(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

@Component({
  selector: 'app-loan-calculator',
  standalone: true,
  imports: [
    CommonModule,
    CalculatorHeaderComponent,
    LoanFormComponent,
    LoanSummaryComponent,
    AmortizationTableComponent,
    ExtraPaymentInputDialogComponent,
    ExtraPaymentComparisonComponent,
  ],
  templateUrl: './loan-calculator.component.html',
  styleUrls: ['./loan-calculator.component.scss'],
})
export class LoanCalculatorComponent implements OnInit, OnDestroy {
  principal: number | null = null;
  principalDisplay = '';
  annualRate: number | null = null;
  tenureYears: number | null = null;
  tenureMonths: number | null = null;
  startDate = this.getTodayDate();
  extraPayment: number | null = null;
  extraPaymentDisplay = '';
  /** 0 = at loan start, 1+ = after that many months */
  extraPaymentAtMonth = 0;
  /** Date of extra payment (YYYY-MM-DD) for display in schedule */
  extraPaymentDate: string | null = null;

  emi = 0;
  totalPayable = 0;
  totalInterest = 0;
  schedule: AmortizationRow[] = [];

  showExtraPaymentDialog = false;
  comparison: ExtraPaymentComparison | null = null;
  /** Opens the comparison summary panel (bottom sheet) */
  showComparisonPanel = false;
  /** Which scenario is shown in the amortization table when comparison exists */
  selectedStrategy: ExtraPaymentStrategy = 'reduce-tenure';

  /** Schedule to show in amortization table (original or selected comparison scenario) */
  get displaySchedule(): AmortizationRow[] {
    if (!this.comparison) return this.schedule;
    return this.selectedStrategy === 'reduce-emi'
      ? this.comparison.withExtraPaymentReduceEmi.schedule
      : this.comparison.withExtraPaymentReduceTenure.schedule;
  }

  get displayEmi(): number {
    if (!this.comparison) return this.emi;
    return this.selectedStrategy === 'reduce-emi'
      ? this.comparison.withExtraPaymentReduceEmi.emi
      : this.comparison.withExtraPaymentReduceTenure.emi;
  }

  get displayTenureMonths(): number {
    if (!this.comparison) return this.schedule.length;
    return this.selectedStrategy === 'reduce-emi'
      ? this.comparison.withExtraPaymentReduceEmi.schedule.length
      : this.comparison.withExtraPaymentReduceTenure.schedule.length;
  }

  /** True when the table is showing the original schedule (no comparison or not in comparison mode) */
  get isShowingOriginalSchedule(): boolean {
    return !this.comparison;
  }

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

  ngOnDestroy(): void {
    this.theme.unregisterElement(this.el.nativeElement);
  }

  calculate(): void {
    const input = this.buildLoanInput();
    const result = this.loanService.calculateLoan(input);

    this.emi = result.emi;
    this.totalInterest = result.totalInterest;
    this.totalPayable = result.totalPayable;
    this.schedule = result.schedule;
    this.comparison = null;
    if (this.extraPayment != null && this.extraPayment > 0) {
      this.calculateComparison();
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
    this.extraPaymentAtMonth = 0;
    this.extraPaymentDate = null;
    this.selectedStrategy = 'reduce-tenure';
    this.resetResults();
    this.showExtraPaymentDialog = false;
    this.showComparisonPanel = false;
    this.comparison = null;
    this.loanService.clearData();
  }

  openExtraPaymentDialog(): void {
    this.showExtraPaymentDialog = true;
  }

  onExtraPaymentApply(payload: ExtraPaymentApplied): void {
    this.extraPayment = payload.amount;
    this.extraPaymentDisplay =
      payload.amount != null && payload.amount > 0
        ? payload.amount.toLocaleString(LOCALE)
        : '';
    this.extraPaymentAtMonth = payload.atMonth ?? 0;
    this.extraPaymentDate = payload.paymentDate ?? null;
    if (this.extraPayment != null && this.extraPayment > 0 && this.schedule.length > 0) {
      this.calculateComparison();
    }
  }

  /** Run comparison and open the Comparison Summary panel */
  openComparisonSummary(): void {
    if (!this.extraPayment || this.extraPayment <= 0) return;
    if (this.schedule.length === 0) {
      this.calculate();
    }
    this.calculateComparison();
    this.showComparisonPanel = true;
    this.saveData();
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

  closeComparisonPanel(): void {
    this.showComparisonPanel = false;
    this.saveData();
  }

  onStrategyChange(strategy: ExtraPaymentStrategy): void {
    if (strategy === 'reduce-emi' || strategy === 'reduce-tenure') {
      this.selectedStrategy = strategy;
      this.saveData();
    }
  }

  private getEffectivePrincipalAndRemainingMonths(input: LoanInput): {
    principal: number;
    remainingMonths: number;
    originalEmi: number;
  } | null {
    const totalMonths = this.getTotalMonths(input);
    if (totalMonths <= 0) return null;

    const original = this.loanService.calculateLoan(input);

    if (this.extraPaymentAtMonth === 0) {
      const principal = (input.principal ?? 0) - (this.extraPayment ?? 0);
      return principal <= 0
        ? null
        : { principal, remainingMonths: totalMonths, originalEmi: original.emi };
    }

    if (this.schedule.length < this.extraPaymentAtMonth) return null;
    const row = this.schedule[this.extraPaymentAtMonth - 1];
    const balanceAfter = row.closing;
    const principal = balanceAfter - (this.extraPayment ?? 0);
    const remainingMonths = totalMonths - this.extraPaymentAtMonth;
    return principal <= 0 || remainingMonths <= 0
      ? null
      : { principal, remainingMonths, originalEmi: original.emi };
  }

  private calculateComparison(): void {
    const input = this.buildLoanInput();
    const original = this.loanService.calculateLoan(input);
    const effective = this.getEffectivePrincipalAndRemainingMonths(input);

    if (!effective) {
      this.comparison = {
        original,
        withExtraPaymentReduceEmi: original,
        withExtraPaymentReduceTenure: original,
      };
      return;
    }

    const inputReduceEmi = {
      ...input,
      principal: effective.principal,
      tenureMonths: effective.remainingMonths,
      tenureYears: null,
    };
    const withExtraPaymentReduceEmi = this.loanService.calculateLoan(inputReduceEmi);
    const withExtraPaymentReduceTenure = this.calculateWithReducedTenure(input, effective);

    this.comparison = {
      original,
      withExtraPaymentReduceEmi,
      withExtraPaymentReduceTenure,
    };
  }

  private calculateWithReducedTenure(
    input: LoanInput,
    effective?: { principal: number; remainingMonths: number; originalEmi: number } | null,
  ): LoanCalculationResult {
    if (!this.extraPayment || this.extraPayment <= 0) {
      return this.loanService.calculateLoan(input);
    }

    const eff =
      effective ?? this.getEffectivePrincipalAndRemainingMonths(input);
    if (!eff) return this.loanService.calculateLoan(input);

    const { principal: reducedPrincipal, remainingMonths, originalEmi } = eff;
    const emi = originalEmi > 0 ? originalEmi : this.loanService.calculateLoan(input).emi;

    if (emi <= 0 || reducedPrincipal <= 0) {
      return this.loanService.calculateLoan(input);
    }

    const annualRate = input.annualRate ?? 0;
    const r = annualRate / 100 / 12;

    const term = 1 - (reducedPrincipal * r) / emi;
    if (term <= 0 || term >= 1) {
      return this.loanService.calculateLoan({
        ...input,
        principal: reducedPrincipal,
        tenureMonths: remainingMonths,
        tenureYears: null,
      });
    }
    const n = Math.ceil(-Math.log(term) / Math.log(1 + r));
    const tenureMonths = Math.max(1, Math.min(n, remainingMonths));

    return this.loanService.calculateLoan({
      ...input,
      principal: reducedPrincipal,
      tenureMonths,
      tenureYears: null,
    });
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
    this.extraPaymentAtMonth = data.extraPaymentAtMonth ?? 0;
    this.extraPaymentDate =
      data.extraPaymentDate ??
      (data.startDate && (data.extraPaymentAtMonth ?? 0) > 0
        ? addMonthsToDate(data.startDate, data.extraPaymentAtMonth ?? 0)
        : null);
    if (data.selectedStrategy === 'reduce-emi' || data.selectedStrategy === 'reduce-tenure') {
      this.selectedStrategy = data.selectedStrategy;
    }

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
      selectedStrategy: this.selectedStrategy,
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
      extraPaymentAtMonth: this.extraPaymentAtMonth,
      extraPaymentDate: this.extraPaymentDate,
    };
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
