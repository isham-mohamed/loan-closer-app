import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const LOCALE = 'en-IN';

export interface ExtraPaymentApplied {
  amount: number | null;
  atMonth: number;
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

  @Output() apply = new EventEmitter<ExtraPaymentApplied>();
  @Output() closed = new EventEmitter<void>();

  amount: number | null = null;
  display = '';
  atStart = true;
  afterMonths = 12;

  get atMonth(): number {
    return this.atStart ? 0 : this.afterMonths;
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
      const m = this.initialAtMonth ?? 0;
      this.atStart = m === 0;
      this.afterMonths = m > 0 ? m : 12;
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
    this.apply.emit({ amount: this.amount, atMonth: this.atMonth });
    this.closed.emit();
  }

  onMonthChange(v: number | string): void {
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    if (!isNaN(n) && n >= 1 && n <= 360) {
      this.afterMonths = Math.floor(n);
    }
  }

  onClear(): void {
    this.amount = null;
    this.display = '';
    this.atStart = true;
    this.afterMonths = 12;
    this.apply.emit({ amount: null, atMonth: 0 });
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
