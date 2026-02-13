import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-form.component.html',
  styleUrls: ['./loan-form.component.scss'],
})
export class LoanFormComponent {
  @Input() principalDisplay = '';
  @Input() annualRate: number | null = null;
  @Input() tenureYears: number | null = null;
  @Input() tenureMonths: number | null = null;
  @Input() startDate = '';

  @Output() principalChange = new EventEmitter<Event>();
  @Output() annualRateChange = new EventEmitter<number | null>();
  @Output() tenureYearsChange = new EventEmitter<number | null>();
  @Output() tenureMonthsChange = new EventEmitter<number | null>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() calculate = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  onPrincipalInput(event: Event): void {
    this.principalChange.emit(event);
  }

  onCalculate(): void {
    this.calculate.emit();
  }

  onReset(): void {
    this.reset.emit();
  }
}
