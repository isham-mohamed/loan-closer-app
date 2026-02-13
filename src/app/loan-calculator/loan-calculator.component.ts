import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../services/loan.service';
import { AmortizationRow, LoanInput } from '../models/loan-data.model';

@Component({
  selector: 'app-loan-calculator',
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-calculator.component.html',
  styleUrls: ['./loan-calculator.component.css'],
})
export class LoanCalculatorComponent implements OnInit {
  principal: number | null = null;
  principalDisplay: string = '';
  annualRate: number | null = null;
  tenureYears: number | null = null;
  tenureMonths: number | null = null;

  emi = 0;
  totalPayable = 0;
  totalInterest = 0;
  schedule: AmortizationRow[] = [];

  isDarkMode = false;

  constructor(
    private loanService: LoanService,
    private el: ElementRef,
  ) {}

  ngOnInit() {
    this.loadTheme();
    this.loadData();
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      // Check system preference
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('themeMode', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme() {
    if (this.isDarkMode) {
      this.el.nativeElement.setAttribute('data-theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      this.el.nativeElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  loadData() {
    const data = this.loanService.loadData();
    if (data) {
      this.principal = data.principal || null;
      this.principalDisplay = data.principal ? data.principal.toLocaleString('en-IN') : '';
      this.annualRate = data.annualRate || null;
      this.tenureYears = data.tenureYears || null;
      this.tenureMonths = data.tenureMonths || null;

      // If data was saved with results, restore them
      if (data.result) {
        this.emi = data.result.emi;
        this.totalInterest = data.result.totalInterest;
        this.totalPayable = data.result.totalPayable;
        this.schedule = data.result.schedule;
      }
    }
  }

  saveData() {
    const input: LoanInput = {
      principal: this.principal,
      annualRate: this.annualRate,
      tenureYears: this.tenureYears,
      tenureMonths: this.tenureMonths,
    };
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

  calculate() {
    const input: LoanInput = {
      principal: this.principal,
      annualRate: this.annualRate,
      tenureYears: this.tenureYears,
      tenureMonths: this.tenureMonths,
    };

    const result = this.loanService.calculateLoan(input);
    this.emi = result.emi;
    this.totalInterest = result.totalInterest;
    this.totalPayable = result.totalPayable;
    this.schedule = result.schedule;
    this.saveData();
  }

  resetResults() {
    this.emi = 0;
    this.totalInterest = 0;
    this.totalPayable = 0;
    this.schedule = [];
  }

  resetAll() {
    this.principal = null;
    this.principalDisplay = '';
    this.annualRate = null;
    this.tenureYears = null;
    this.tenureMonths = null;
    this.resetResults();
    this.loanService.clearData();
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

  formatMoney(v: number) {
    return Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
