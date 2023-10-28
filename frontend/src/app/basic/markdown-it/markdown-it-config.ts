import * as MarkdownIt from 'markdown-it';

export class MarkdownItConfig {
  /**
   * Syntax rules and options for common use cases:
   *
   *   - default - similar to GFM, used when no preset name given.
   *   - "commonmark" - configures parser to strict CommonMark mode.
   *   - "zero" - all rules disabled.
   */
  presetName?: MarkdownIt.PresetName;

  /**
   * Plugins to apply.
   */
  plugins?: any[];
}
