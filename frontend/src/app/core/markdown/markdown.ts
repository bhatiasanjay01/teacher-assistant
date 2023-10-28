export function getTurndownService() {
  var TurndownService = require('turndown');
  const turndownService = new TurndownService();

  // Import plugins from turndown-plugin-gfm
  var turndownPluginGfm = require('turndown-plugin-gfm');
  var gfm = turndownPluginGfm.gfm;

  // Use the gfm plugin
  turndownService.use(gfm);

  return turndownService;
}

export function toMarkdownString(html: string) {
  const turndownService = getTurndownService();
  return turndownService.turndown(html);
}
