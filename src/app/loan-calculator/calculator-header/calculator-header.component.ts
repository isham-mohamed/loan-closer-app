import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-calculator-header',
  standalone: true,
  templateUrl: './calculator-header.component.html',
  styleUrls: ['./calculator-header.component.scss'],
})
export class CalculatorHeaderComponent {
  constructor(public theme: ThemeService) {}

  toggleTheme(): void {
    this.theme.toggleTheme();
  }
}
