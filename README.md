# 💰 Loan Calculator App

A modern, responsive Angular application for calculating loan EMI (Equated Monthly Installment), total interest, and generating detailed amortization schedules. Features a beautiful dark/light theme toggle and persistent data storage.

## Features

- ✨ **EMI Calculation** - Calculate monthly EMI with precision
- 📊 **Amortization Schedule** - View detailed month-by-month payment breakdown
- 🎨 **Dark/Light Theme** - Toggle between dark and light modes with persistent preference
- 💾 **Auto-Save** - Automatically saves calculation data to localStorage
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🧮 **Indian Number Formatting** - Displays currency in Indian numbering system (₹1,00,000)
- ⚡ **Real-time Results** - Instantly view summary results

## Technology Stack

- **Framework**: Angular 21.1.4 (Standalone Components)
- **Language**: TypeScript 5.9.2
- **Styling**: SCSS with CSS variables for theming
- **Build Tool**: Angular CLI with Vite
- **Code Formatter**: Prettier
- **Architecture**: Service-based with typed models

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
# Navigate to the project directory
cd loan-closer-app

# Install dependencies
npm install

# Start the development server
npm start

# Open your browser and navigate to
http://localhost:4200/
```

The app will automatically reload when you make changes to the code.

## Usage

### Calculate Loan Details

1. **Enter Principal Amount** - Input the loan amount in rupees (₹)
2. **Enter Annual Interest Rate** - Input the interest rate as percentage (%)
3. **Enter Tenure** - Choose either:
   - Years (will be converted to months)
   - Months (direct entry)
4. **Click Calculate** - View instant results

### Understanding Results

- **Monthly EMI** - The fixed amount you need to pay each month
- **Total Interest** - Total interest paid over the loan tenure
- **Total Payable** - Total amount paid (Principal + Interest)

### Amortization Schedule

The table shows month-by-month breakdown:

- **Month** - Payment month number
- **Opening Balance** - Loan balance at the start of the month
- **EMI** - Monthly payment amount
- **Interest** - Interest portion of the EMI (orange)
- **Principal** - Principal portion of the EMI (green)
- **Closing Balance** - Remaining loan balance after payment

### Theme Toggle

Click the theme toggle button (☀️/🌙) in the header to switch between:

- **Light Mode** - Clean, bright interface
- **Dark Mode** - Easy on the eyes for low-light environments

Your theme preference is automatically saved.

## Project Structure

```
src/
├── app/
│   ├── loan-calculator/
│   │   ├── loan-calculator.component.ts      # Main component logic
│   │   ├── loan-calculator.component.html    # Template
│   │   └── loan-calculator.component.scss    # Styles with themes
│   ├── models/
│   │   └── loan-data.model.ts               # TypeScript interfaces
│   ├── services/
│   │   └── loan.service.ts                  # Business logic & storage
│   ├── app.ts                               # Root component
│   └── app.html                             # Root template
├── index.html                               # Main HTML file
├── main.ts                                  # Bootstrap file
└── styles.css                               # Global styles
```

## Architecture

### Service-Based Design

The application follows Angular best practices with a service-based architecture:

- **LoanService** - Handles all calculations and localStorage operations
- **LoanCalculatorComponent** - Acts as a thin UI layer, delegating business logic to the service
- **Models** - Strongly typed interfaces for data structures

### Data Models

```typescript
// Loan input parameters
interface LoanInput {
  principal: number | null;
  annualRate: number | null;
  tenureYears: number | null;
  tenureMonths: number | null;
}

// Single amortization row
interface AmortizationRow {
  month: number;
  opening: number;
  emi: number;
  interest: number;
  principal: number;
  closing: number;
}

// Calculation results
interface LoanCalculationResult {
  emi: number;
  totalInterest: number;
  totalPayable: number;
  schedule: AmortizationRow[];
}
```

## Styling

### SCSS Features

- **Variables** - Light and dark theme color maps
- **Mixins** - Reusable styles (`@mixin card`, `@mixin transition`)
- **Nesting** - Clean, organized CSS structure
- **CSS Variables** - Dynamic theming with `--bg-primary`, `--text-primary`, etc.

### Theme Variables

Light mode uses bright, professional colors while dark mode uses dark backgrounds with light text for comfortable viewing.

## Available Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Format code with Prettier
npm run format

# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Code Quality

### Formatting

All code is formatted using Prettier for consistent style:

```bash
npm run format
```

### TypeScript Strict Mode

The project uses strict TypeScript configuration for type safety:

- Strict null checking
- No implicit any types
- Strict property initialization

## Key Methods

### LoanService

- `calculateLoan(input: LoanInput)` - Performs EMI calculation using standard formula
- `loadData()` - Retrieves saved loan data from localStorage
- `saveData(data: LoanData)` - Persists loan data to localStorage
- `clearData()` - Clears all saved data

### LoanCalculatorComponent

- `calculate()` - Triggers loan calculation and updates display
- `resetAll()` - Clears all form fields and results
- `toggleTheme()` - Switches between dark and light modes
- `formatMoney(value: number)` - Formats numbers as currency with 2 decimal places

## EMI Calculation Formula

The app uses the standard EMI formula:

```
EMI = P × R × (1 + R)^N / ((1 + R)^N - 1)
```

Where:

- **P** = Principal (Loan Amount)
- **R** = Monthly Interest Rate (Annual Rate / 12 / 100)
- **N** = Total Number of Payments (Tenure in months)

## Browser Support

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## Performance

- **Bundle Size** - ~47 KB (main.js)
- **Style Budget** - 6.55 KB (component styles)
- **Development Mode** - Unminified for debugging
- **Production Mode** - Minified and optimized

## Storage

The app uses browser `localStorage` to persist:

- Loan calculation inputs (principal, rate, tenure)
- Calculation results (EMI, interest, schedule)
- User theme preference (light/dark mode)

Data is automatically saved on calculation and loaded on app startup.

## Troubleshooting

### App Not Loading

1. Clear browser cache (Ctrl+Shift+Delete)
2. Check browser console for errors (F12)
3. Ensure you're accessing http://localhost:4200/

### Theme Not Persisting

- Check if localStorage is enabled in your browser
- Cookies/Storage settings should allow storage for localhost

### Data Not Saving

- Verify localStorage is enabled
- Check browser storage limits (usually 5-10MB)
- Try clearing browser data and recalculating

## Development Tips

### Adding New Features

1. Update models in `models/loan-data.model.ts` if needed
2. Implement logic in `services/loan.service.ts`
3. Add UI in `loan-calculator.component.html`
4. Add styles in `loan-calculator.component.scss`

### Updating Themes

Edit the `$light-theme` and `$dark-theme` maps in the SCSS file to customize colors.

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Made with ❤️ for easy loan calculations**
