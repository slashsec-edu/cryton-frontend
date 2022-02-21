import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { DebugElement, Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ThemeColorGetterComponent } from '../components/theme-color-getter/theme-color-getter.component';
import { Theme } from '../modules/template-creator/models/interfaces/theme';
import { tcDarkTheme } from '../modules/template-creator/styles/themes/template-creator-dark.theme';
import { tcLightTheme } from '../modules/template-creator/styles/themes/template-creator-light.theme';

interface LocalstorageTheme {
  name: string;
  isDark: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme$: Observable<Theme>;

  private _currentTheme$: BehaviorSubject<Theme>;
  private _themeColorGetter: ThemeColorGetterComponent;

  constructor(private _overlayContainer: OverlayContainer, @Inject(DOCUMENT) private _document: Document) {
    const savedTheme = JSON.parse(localStorage.getItem('theme')) as LocalstorageTheme;
    if (savedTheme) {
      this._setThemeClass(savedTheme.name);
    }

    this._currentTheme$ = new BehaviorSubject({
      primary: '',
      accent: '',
      warn: '',
      isDark: false,
      templateCreator: tcLightTheme
    });
    this.currentTheme$ = this._currentTheme$.asObservable();
    this._tryGettingTheme(savedTheme?.isDark ?? false);
  }

  changeTheme(name: string, isDark: boolean): void {
    localStorage.setItem('theme', JSON.stringify({ name, isDark }));
    this._setThemeClass(name);
    this._emitTheme(isDark);
  }

  getPrimaryColor(): string {
    return this._getColor(this._themeColorGetter?.primaryColor);
  }
  getAccentColor(): string {
    return this._getColor(this._themeColorGetter?.accentColor);
  }
  getWarnColor(): string {
    return this._getColor(this._themeColorGetter?.warnColor);
  }

  setThemeColorGetter(colorGetter: ThemeColorGetterComponent): void {
    this._themeColorGetter = colorGetter;
  }

  private _tryGettingTheme(isSavedThemeDark: boolean): void {
    const defaultBG = 'rgb(0, 0, 0)';
    const interval = setInterval(() => {
      if (
        this.getPrimaryColor() !== defaultBG ||
        this.getAccentColor() !== defaultBG ||
        this.getWarnColor() !== defaultBG
      ) {
        this._emitTheme(isSavedThemeDark);
        clearInterval(interval);
      }
    }, 50);
  }

  private _setThemeClass(name: string): void {
    const overlayContainerClasses = this._overlayContainer.getContainerElement().classList;
    const documentBodyClasses = this._document.body.classList;

    this._changeClass(overlayContainerClasses, name);
    this._changeClass(documentBodyClasses, name);
  }

  private _emitTheme(isDark: boolean): void {
    this._currentTheme$.next(
      isDark
        ? {
            primary: this.getPrimaryColor(),
            accent: this.getAccentColor(),
            warn: this.getWarnColor(),
            templateCreator: tcDarkTheme,
            isDark
          }
        : {
            primary: this.getPrimaryColor(),
            accent: this.getAccentColor(),
            warn: this.getWarnColor(),
            templateCreator: tcLightTheme,
            isDark
          }
    );
  }

  private _getColor(debugElement: DebugElement): string {
    if (debugElement) {
      return window.getComputedStyle(debugElement.nativeElement as HTMLDivElement).backgroundColor;
    }
  }

  private _changeClass(classList: DOMTokenList, newClass: string): void {
    const classesToRemove = Array.from(classList).filter((item: string) => item.includes('-theme'));
    if (classesToRemove.length) {
      classList.remove(...classesToRemove);
    }
    classList.add(newClass);
  }
}
