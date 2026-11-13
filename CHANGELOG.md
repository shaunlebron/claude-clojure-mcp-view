# Changelog

## Unreleased

- First release: in the Claude Code CLI's expanded view (ctrl+o), a clojure-mcp eval shows
  the code Claude sent under the call's row, with real newlines, and the response with each
  value lined up after its `=>`, without clojure-mcp's namespace lines.
- Code and values are highlighted with highlight.js, in the terminal's own palette colors.
- A request or response past 10 lines folds, with a button to expand and fold it again
  (clicks need fullscreen mode).
- `/clj-view` turns the request, the response or highlighting off, and sets the fold limit;
  the settings are saved across sessions.
