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
  @Input() originalSchedule: AmortizationRow[] = [];
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

  get hasExtraPayment(): boolean {
    return this.extraPaymentAmount != null && this.extraPaymentAmount > 0;
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

  /** Original closing balance for the same month (for Change column when viewing a scenario) */
  getOriginalClosing(month: number): number | null {
    const row = this.originalSchedule.find((r) => r.month === month);
    return row != null ? row.closing : null;
  }

  /** Change vs original: positive = you owe less (savings) */
  getChangeVsOriginal(row: AmortizationRow): number | null {
    const orig = this.getOriginalClosing(row.month);
    if (orig == null) return null;
    return Math.round((orig - row.closing) * 100) / 100;
  }
}
