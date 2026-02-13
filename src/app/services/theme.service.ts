import { Injectable } from '@angular/core';

const STORAGE_THEME_KEY = 'themeMode';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _isDarkMode = false;
  private themedElements = new Set<HTMLElement>();

  get isDarkMode(): boolean {
    return this._isDarkMode;
  }

  loadTheme(): void {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved) {
      this._isDarkMode = saved === THEME_DARK;
    } else {
      this._isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this._isDarkMode = !this._isDarkMode;
    localStorage.setItem(STORAGE_THEME_KEY, this._isDarkMode ? THEME_DARK : THEME_LIGHT);
    this.applyTheme();
  }

  applyThemeToElement(element: HTMLElement): void {
    this.themedElements.add(element);
    this.setThemeOnElement(element);
  }

  unregisterElement(element: HTMLElement): void {
    this.themedElements.delete(element);
  }

  private setThemeOnElement(element: HTMLElement): void {
    const theme = this._isDarkMode ? THEME_DARK : THEME_LIGHT;
    element.setAttribute('data-theme', theme);
  }

  private applyTheme(): void {
    const theme = this._isDarkMode ? THEME_DARK : THEME_LIGHT;
    document.documentElement.setAttribute('data-theme', theme);
    this.themedElements.forEach((el) => this.setThemeOnElement(el));
  }
}
