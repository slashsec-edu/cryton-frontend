import { TCTheme } from './template-creator-theme';

export interface Theme {
  primary: string;
  accent: string;
  warn: string;
  isDark: boolean;
  templateCreator: TCTheme;
}
