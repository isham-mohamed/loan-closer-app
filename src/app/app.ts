import { Component, signal } from '@angular/core';
import { LoanCalculatorComponent } from './loan-calculator/loan-calculator.component';

@Component({
  selector: 'app-root',
  imports: [LoanCalculatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('loan-closer-app');
}
