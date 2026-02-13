import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormatCurrencyPipe } from '../../pipes/format-currency.pipe';
import { AmortizationRow, ExtraPaymentComparison, ExtraPaymentStrategy } from '../../models/loan-data.model';

@Component({
  selector: 'app-amortization-table',
  standalone: true,
  imports: [FormatCurrencyPipe],
  templateUrl: './amortization-table.component.html',
  styleUrls: ['./amortization-table.component.scss'],
})
export class AmortizationTableComponent {
  @Input() schedule: AmortizationRow[] = [];
  @Input() comparison: ExtraPaymentComparison | null = null;
  @Input() extraPaymentAmount: number | null = null;
  @Input() extraPaymentAtMonth = 0;
  @Input() extraPaymentDate: string | null = null;
  @Input() selectedStrategy: ExtraPaymentStrategy = 'reduce-tenure';
  @Input() displayEmi = 0;
  @Input() displayTenureMonths = 0;
  @Input() isShowingOriginalSchedule = true;

  @Output() strategyChange = new EventEmitter<ExtraPaymentStrategy>();

  get hasComparison(): boolean {
    return this.comparison != null;
  }

  get extraPaymentDateDisplay(): string {
    if (this.extraPaymentDate) return this.extraPaymentDate;
    return '';
  }

  selectStrategy(strategy: ExtraPaymentStrategy): void {
    this.strategyChange.emit(strategy);
  }

  isExtraPaymentRow(row: AmortizationRow): boolean {
    return this.isShowingOriginalSchedule && this.extraPaymentAtMonth > 0 && row.month === this.extraPaymentAtMonth;
  }
}
