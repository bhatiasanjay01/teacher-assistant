import { Injectable } from '@angular/core';

import MarkdownIt from 'markdown-it';
import { default as markdownItHighlightjs } from 'markdown-it-highlightjs';
import mathjax3 from 'markdown-it-mathjax3';
import { MarkdownItConfig } from './markdown-it-config';

@Injectable({
  providedIn: 'root',
})
export class MarkdownItService {
  private markdownIt: MarkdownIt;

  constructor() {
    var presetName: MarkdownIt.PresetName = 'default';

    const config: MarkdownItConfig = {
      presetName: presetName,
      plugins: [markdownItHighlightjs, mathjax3],
    };

    if (config && config.presetName) {
      presetName = config.presetName;
    }

    this.markdownIt = new MarkdownIt(presetName);

    if (config && config.plugins) {
      config.plugins.forEach((plugin) => this.markdownIt.use(plugin));
    }

    this.markdownIt.disable(['emphasis']);
  }

  public render(markdown: string): string {
    return `${this.markdownIt.render(markdown)}`;
  }
}
