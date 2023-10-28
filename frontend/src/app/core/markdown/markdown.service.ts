import { Injectable } from '@angular/core';
import TurndownService from 'turndown';
import { MarkdownItService } from '../../basic/markdown-it/markdown-it.service';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  private _turndownService: TurndownService;

  constructor(private markdownItService: MarkdownItService) {
    const turndownService = new TurndownService();

    // Import plugins from turndown-plugin-gfm
    var turndownPluginGfm = require('turndown-plugin-gfm');
    var gfm = turndownPluginGfm.gfm;

    // Use the gfm plugin
    turndownService.use(gfm);

    this._turndownService = turndownService;
  }

  toMarkdownString(html: string) {
    return this._turndownService.turndown(html);
  }

  toHtml(markdownString: string) {
    return this.markdownItService.render(markdownString);
  }
}
