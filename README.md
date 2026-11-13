# clojure-mcp-view

A [Claude Code](https://code.claude.com) plugin that shows
[clojure-mcp](https://github.com/bhauman/clojure-mcp) evals readably in the expanded view
(ctrl+o): the code Claude sent, with real newlines, under the call's row, and the response
with each value lined up after its `=>`. The normal view and what the model reads are
unchanged.

## Install

Add it to a project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "clojure-mcp-view": {
      "source": {
        "source": "settings",
        "name": "clojure-mcp-view",
        "owner": { "name": "Shaun Williams" },
        "plugins": [
          { "name": "clojure-mcp-view",
            "source": { "source": "npm", "package": "clojure-mcp-view" } }
        ]
      }
    }
  },
  "enabledPlugins": { "clojure-mcp-view@clojure-mcp-view": true }
}
```

## Settings

Everything is on by default. Turn parts off with the `/clj-view` command; the settings are
saved and apply to every session:

```
/clj-view                    show the current settings
/clj-view request off        ;; Request: the eval's code under its row
/clj-view response off       ;; Response: printed output and each => value
/clj-view highlight off      draw both as plain text, not highlighted
/clj-view fold 10            fold a request or response past 10 lines (the default)
/clj-view fold off           never fold
```

A folded section ends with `… +n lines (click to expand)`, and an unfolded one with
`(click to fold)`. Clicks reach the plugin only in Claude Code's fullscreen mode.

- Depends on clojure-mcp's text format (`=> ` before each value, `*==== ns | clj ====*`
  after each form's output); tested with clojure-mcp v0.6.0 and Claude Code 2.1.319.

## Developing

The mod is `main.cljs` and its tests are `test.cljs`, both in
[squint](https://github.com/squint-cljs/squint). Needs node and
[babashka](https://babashka.org).

```sh
npm install    # once: squint-cljs, esbuild and highlight.js, pinned in package.json
npm run build  # bb build.bb: compile main.cljs and test.cljs, then bundle each
npm test       # build, then claude plugin test . against the compiled module
```

To try a change in Claude Code, add this checkout as a marketplace once, install from it, and
`/reload-plugins` after each build:

```sh
claude plugin marketplace add ~/code/claude-clojure-mcp-view
claude plugin install clojure-mcp-view@clojure-mcp-view-dev
```

`build.bb` adjusts squint's output for Claude Code: a mod imports only the plugin's own files
(so esbuild bundles in the parts of squint's runtime the mod uses), its mod loader accepts
`register` and hooks only as `const` or `function` bindings (squint and esbuild emit `var`),
and `claude plugin test` runs only `*.test.ts` files (so each compiled test is written as one).
It also copies package.json's version into plugin.json.

## Releasing

```sh
npm version patch   # bumps package.json and plugin.json, commits, tags
npm publish         # tests and validates first (prepublishOnly)
git push --follow-tags
```

## License

Copyright © 2026 Shaun Williams. Distributed under the Eclipse Public License 2.0, the same as
clojure-mcp; see [LICENSE](LICENSE).

The published `main.jsx` bundles parts of the
[squint](https://github.com/squint-cljs/squint) runtime, Copyright © 2022 - 2026 Michiel Borkent,
under the Eclipse Public License 1.0, and
[highlight.js](https://github.com/highlightjs/highlight.js), Copyright © 2006 Ivan Sagalaev,
under the BSD 3-Clause License, whose text is at the top of `main.jsx`.
