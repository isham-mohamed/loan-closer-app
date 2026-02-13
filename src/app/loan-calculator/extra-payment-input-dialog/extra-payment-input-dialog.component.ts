import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const LOCALE = 'en-IN';

export interface ExtraPaymentApplied {
  amount: number | null;
  atMonth: number;
  paymentDate: string | null;
}

/** Add months to a YYYY-MM-DD date string. */
function addMonthsToDate(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

/** Months from start to payment date (1-based month index; 0 = same as start). */
function monthsFromStart(startDateStr: string, paymentDateStr: string): number {
  const start = new Date(startDateStr + 'T12:00:00');
  const pay = new Date(paymentDateStr + 'T12:00:00');
  if (pay <= start) return 0;
  const months = (pay.getFullYear() - start.getFullYear()) * 12 + (pay.getMonth() - start.getMonth());
  return Math.max(0, months);
}

@Component({
  selector: 'app-extra-payment-input-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './extra-payment-input-dialog.component.html',
  styleUrls: ['./extra-payment-input-dialog.component.scss'],
})
export class ExtraPaymentInputDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() initialAmount: number | null = null;
  @Input() initialDisplay = '';
  @Input() initialAtMonth = 0;
  @Input() initialPaymentDate: string | null = null;
  /** Loan start date (YYYY-MM-DD) for min date and to derive atMonth from payment date. */
  @Input() startDate = '';

  @Output() apply = new EventEmitter<ExtraPaymentApplied>();
  @Output() closed = new EventEmitter<void>();

  amount: number | null = null;
  display = '';
  /** Payment date (YYYY-MM-DD). */
  paymentDate = '';

  get minPaymentDate(): string {
    return this.startDate || new Date().toISOString().split('T')[0];
  }

  get hasValue(): boolean {
    return this.amount != null && this.amount > 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      const hasAmount = this.initialAmount != null && this.initialAmount > 0;
      this.amount = hasAmount ? this.initialAmount : null;
      this.display =
        this.initialDisplay ||
        (hasAmount ? this.initialAmount!.toLocaleString(LOCALE) : '');
      if (this.initialPaymentDate) {
        this.paymentDate = this.initialPaymentDate;
      } else if (this.startDate) {
        const m = this.initialAtMonth ?? 0;
        this.paymentDate = m === 0 ? this.startDate : addMonthsToDate(this.startDate, m);
      } else {
        this.paymentDate = new Date().toISOString().split('T')[0];
      }
    }
  }

  onInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value.replace(/,/g, '');
    if (!input) {
      this.amount = null;
      this.display = '';
      return;
    }
    const num = parseInt(input, 10);
    if (!isNaN(num) && num >= 0) {
      this.amount = num;
      this.display = num.toLocaleString(LOCALE);
    }
  }

  onApply(): void {
    const start = this.startDate || new Date().toISOString().split('T')[0];
    const date = this.paymentDate || start;
    const atMonth = this.paymentDate ? monthsFromStart(start, date) : 0;
    this.apply.emit({ amount: this.amount, atMonth, paymentDate: this.paymentDate || null });
    this.closed.emit();
  }

  onClear(): void {
    this.amount = null;
    this.display = '';
    this.paymentDate = this.minPaymentDate;
    this.apply.emit({ amount: null, atMonth: 0, paymentDate: null });
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }

  onOverlayClick(): void {
    this.onClose();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
