import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormatCurrencyPipe } from '../../pipes/format-currency.pipe';
import { ExtraPaymentStrategy } from '../../models/loan-data.model';

@Component({
  selector: 'app-extra-payment-strategy-dialog',
  standalone: true,
  imports: [FormatCurrencyPipe],
  templateUrl: './extra-payment-strategy-dialog.component.html',
  styleUrls: ['./extra-payment-strategy-dialog.component.scss'],
})
export class ExtraPaymentStrategyDialogComponent {
  @Input() visible = false;
  @Input() extraPaymentAmount = 0;

  @Output() strategySelected = new EventEmitter<ExtraPaymentStrategy>();
  @Output() closed = new EventEmitter<void>();

  selectStrategy(strategy: ExtraPaymentStrategy): void {
    this.strategySelected.emit(strategy);
  }

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(): void {
    this.close();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
