import { Component, Input } from '@angular/core';
import { FormatCurrencyPipe } from '../../pipes/format-currency.pipe';
import { AmortizationRow } from '../../models/loan-data.model';

@Component({
  selector: 'app-amortization-table',
  standalone: true,
  imports: [FormatCurrencyPipe],
  templateUrl: './amortization-table.component.html',
  styleUrls: ['./amortization-table.component.scss'],
})
export class AmortizationTableComponent {
  @Input() schedule: AmortizationRow[] = [];
}
