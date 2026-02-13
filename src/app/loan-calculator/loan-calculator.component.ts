import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../services/loan.service';
import { AmortizationRow, LoanInput } from '../models/loan-data.model';

@Component({
  selector: 'app-loan-calculator',
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-calculator.component.html',
  styleUrls: ['./loan-calculator.component.scss'],
})
export class LoanCalculatorComponent implements OnInit {
  // Form inputs
  principal: number | null = null;
  principalDisplay: string = '';
  annualRate: number | null = null;
  tenureYears: number | null = null;
  tenureMonths: number | null = null;
  startDate: string = this.getTodayDate();

  // Results
  emi = 0;
  totalPayable = 0;
  totalInterest = 0;
  schedule: AmortizationRow[] = [];

  // Theme
  isDarkMode = false;

  private readonly STORAGE_THEME_KEY = 'themeMode';
  private readonly THEME_DARK = 'dark';
  private readonly THEME_LIGHT = 'light';
  private readonly LOCALE = 'en-IN';

  constructor(
    private loanService: LoanService,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    this.loadTheme();
    this.loadData();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.setThemeStorage(this.isDarkMode);
    this.applyTheme();
  }

  calculate(): void {
    const input = this.buildLoanInput();
    const result = this.loanService.calculateLoan(input);

    this.emi = result.emi;
    this.totalInterest = result.totalInterest;
    this.totalPayable = result.totalPayable;
    this.schedule = result.schedule;

    this.saveData();
  }

  resetAll(): void {
    this.principal = null;
    this.principalDisplay = '';
    this.annualRate = null;
    this.tenureYears = null;
    this.tenureMonths = null;
    this.startDate = this.getTodayDate();
    this.resetResults();
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
      this.principalDisplay = num.toLocaleString(this.LOCALE);
    }
  }

  formatMoney(value: number): string {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.STORAGE_THEME_KEY);
    if (savedTheme) {
      this.isDarkMode = savedTheme === this.THEME_DARK;
    } else {
      this.isDarkMode = this.getSystemThemePreference();
    }
    this.applyTheme();
  }

  private applyTheme(): void {
    const theme = this.isDarkMode ? this.THEME_DARK : this.THEME_LIGHT;
    this.el.nativeElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  private setThemeStorage(isDark: boolean): void {
    localStorage.setItem(this.STORAGE_THEME_KEY, isDark ? this.THEME_DARK : this.THEME_LIGHT);
  }

  private getSystemThemePreference(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private loadData(): void {
    const data = this.loanService.loadData();
    if (!data) return;

    this.principal = data.principal || null;
    this.principalDisplay = data.principal ? data.principal.toLocaleString(this.LOCALE) : '';
    this.annualRate = data.annualRate || null;
    this.tenureYears = data.tenureYears || null;
    this.tenureMonths = data.tenureMonths || null;
    this.startDate = data.startDate || this.getTodayDate();

    if (data.result) {
      this.emi = data.result.emi;
      this.totalInterest = data.result.totalInterest;
      this.totalPayable = data.result.totalPayable;
      this.schedule = data.result.schedule;
    }
  }

  private saveData(): void {
    const input = this.buildLoanInput();
    const data = {
      ...input,
      result: {
        emi: this.emi,
        totalInterest: this.totalInterest,
        totalPayable: this.totalPayable,
        schedule: this.schedule,
      },
    };
    this.loanService.saveData(data);
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
    };
  }

  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
