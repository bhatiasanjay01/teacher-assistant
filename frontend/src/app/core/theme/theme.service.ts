import { ApplicationRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ThemeType } from './theme-type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  currentTheme = ThemeType.default;

  private _themeSubject = new BehaviorSubject<ThemeType>(this.currentTheme);

  constructor(private ref: ApplicationRef) {
    // // Initially check if dark mode is enabled on system
    // const darkModeOn = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    // // If dark mode is enabled then directly switch to the dark-theme
    // if (darkModeOn) {
    //   if (this.currentTheme === ThemeType.default) {
    //     this.toggleTheme().then();
    //   }
    // }
    // // Watch for changes of the preference
    // window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    //   const turnOn = e.matches;
    //   if (turnOn && this.currentTheme === ThemeType.default) {
    //     this.toggleTheme().then();
    //   } else if (!turnOn && this.currentTheme === ThemeType.dark) {
    //     this.toggleTheme().then();
    //   }
    // });
  }

  onThemeChange$() {
    return this._themeSubject.asObservable();
  }

  private reverseTheme(theme: string): ThemeType {
    return theme === ThemeType.dark ? ThemeType.default : ThemeType.dark;
  }

  private removeUnusedTheme(theme: ThemeType): void {
    document.documentElement.classList.remove(theme);
    const removedThemeStyle = document.getElementById(theme);
    if (removedThemeStyle) {
      document.head.removeChild(removedThemeStyle);
    }
  }

  private loadCss(href: string, id: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = href;
      style.id = id;
      style.onload = resolve;
      style.onerror = reject;
      document.head.append(style);
    });
  }

  public loadTheme(firstLoad = true): Promise<Event> {
    const theme = this.currentTheme;
    if (firstLoad) {
      document.documentElement.classList.add(theme);
    }
    return new Promise<Event>((resolve, reject) => {
      this.loadCss(`${theme}.css`, theme).then(
        (e) => {
          if (!firstLoad) {
            document.documentElement.classList.add(theme);
          }
          this.removeUnusedTheme(this.reverseTheme(theme));
          resolve(e);
        },
        (e) => reject(e)
      );
    });
  }

  public toggleTheme(): Promise<Event> {
    this.currentTheme = this.reverseTheme(this.currentTheme);
    this._themeSubject.next(this.currentTheme);
    return this.loadTheme(false);
  }
}
