import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormatCurrencyPipe } from '../../pipes/format-currency.pipe';
import { ExtraPaymentComparison as ExtraPaymentComparisonModel } from '../../models/loan-data.model';

@Component({
  selector: 'app-extra-payment-comparison',
  standalone: true,
  imports: [FormatCurrencyPipe],
  templateUrl: './extra-payment-comparison.component.html',
  styleUrls: ['./extra-payment-comparison.component.scss'],
})
export class ExtraPaymentComparisonComponent {
  @Input() comparison: ExtraPaymentComparisonModel | null = null;
  @Input() extraPaymentAmount: number | null = null;
  @Input() extraPaymentAtMonth = 0;

  @Output() close = new EventEmitter<void>();

  get extraPaymentLabel(): string {
    if (this.extraPaymentAtMonth === 0) return 'At loan start';
    return `After ${this.extraPaymentAtMonth} month${this.extraPaymentAtMonth === 1 ? '' : 's'}`;
  }

  onClose(): void {
    this.close.emit();
  }
}
