import { Directive, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeType } from '../../core/theme/theme-type';
import { ThemeService } from '../../core/theme/theme.service';

@Directive({
  selector: '[appDarkModeColor]',
})
export class DarkModeColorDirective {
  private _defaultColor: string;
  private _defaultColorBackground: string;

  private _subscription: Subscription;

  constructor(private el: ElementRef, private themeService: ThemeService) {
    this._defaultColor = el.nativeElement.style.color;
    this._defaultColorBackground = el.nativeElement.style.backgroundColor;

    this._subscription = this.themeService
      .onThemeChange$()
      .subscribe((theme) => {
        if (theme === ThemeType.default) {
          this.el.nativeElement.style.color = this._defaultColor;
          this.el.nativeElement.style.backgroundColor =
            this._defaultColorBackground;
        } else if (this.themeService.currentTheme === ThemeType.dark) {
          this.el.nativeElement.style.color = '#e9e9e9';
          this.el.nativeElement.style.backgroundColor = '#292929';
        }
      });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
