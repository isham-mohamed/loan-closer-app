import { Component, Input } from '@angular/core';
import { FormatCurrencyPipe } from '../../pipes/format-currency.pipe';

@Component({
  selector: 'app-loan-summary',
  standalone: true,
  imports: [FormatCurrencyPipe],
  templateUrl: './loan-summary.component.html',
  styleUrls: ['./loan-summary.component.scss'],
})
export class LoanSummaryComponent {
  @Input() emi = 0;
  @Input() totalInterest = 0;
  @Input() totalPayable = 0;
}
