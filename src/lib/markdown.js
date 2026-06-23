const marked = require('marked');

function renderMarkdown(markdownText) {
  return marked.parse(markdownText, {
    mangle: false,
    headerIds: false,
  });
}

module.exports = { renderMarkdown };
