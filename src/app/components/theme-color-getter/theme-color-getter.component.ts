import { ChangeDetectionStrategy, Component, DebugElement, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-theme-color-getter',
  templateUrl: './theme-color-getter.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeColorGetterComponent implements OnInit {
  @ViewChild('primary') primaryColor: DebugElement;
  @ViewChild('accent') accentColor: DebugElement;
  @ViewChild('warn') warnColor: DebugElement;

  constructor(private _themeService: ThemeService) {}

  ngOnInit(): void {
    this._themeService.setThemeColorGetter(this);
  }
}
