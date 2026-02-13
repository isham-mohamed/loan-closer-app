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

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
