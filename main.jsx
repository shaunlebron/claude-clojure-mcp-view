// Includes parts of squint-cljs's runtime (https://github.com/squint-cljs/squint),
// Copyright © 2022 - 2026 Michiel Borkent, under the Eclipse Public License 1.0.
//
// Includes highlight.js (https://github.com/highlightjs/highlight.js), under this license:
//
// BSD 3-Clause License
//
// Copyright (c) 2006, Ivan Sagalaev.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice, this
//   list of conditions and the following disclaimer.
//
// * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation
//   and/or other materials provided with the distribution.
//
// * Neither the name of the copyright holder nor the names of its
//   contributors may be used to endorse or promote products derived from
//   this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/highlight.js/lib/core.js
var require_core = __commonJS({
  "node_modules/highlight.js/lib/core.js"(exports, module) {
    function deepFreeze(obj) {
      if (obj instanceof Map) {
        obj.clear = obj.delete = obj.set = function() {
          throw new Error("map is read-only");
        };
      } else if (obj instanceof Set) {
        obj.add = obj.clear = obj.delete = function() {
          throw new Error("set is read-only");
        };
      }
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach((name) => {
        const prop = obj[name];
        const type = typeof prop;
        if ((type === "object" || type === "function") && !Object.isFrozen(prop)) {
          deepFreeze(prop);
        }
      });
      return obj;
    }
    var Response = class {
      /**
       * @param {CompiledMode} mode
       */
      constructor(mode) {
        if (mode.data === void 0) mode.data = {};
        this.data = mode.data;
        this.isMatchIgnored = false;
      }
      ignoreMatch() {
        this.isMatchIgnored = true;
      }
    };
    function escapeHTML(value) {
      return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    }
    function inherit$1(original, ...objects) {
      const result = /* @__PURE__ */ Object.create(null);
      for (const key in original) {
        result[key] = original[key];
      }
      objects.forEach(function(obj) {
        for (const key in obj) {
          result[key] = obj[key];
        }
      });
      return (
        /** @type {T} */
        result
      );
    }
    var SPAN_CLOSE = "</span>";
    var emitsWrappingTags = (node) => {
      return !!node.scope;
    };
    var scopeToCSSClass = (name, { prefix }) => {
      if (name.startsWith("language:")) {
        return name.replace("language:", "language-");
      }
      if (name.includes(".")) {
        const pieces = name.split(".");
        return [
          `${prefix}${pieces.shift()}`,
          ...pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`)
        ].join(" ");
      }
      return `${prefix}${name}`;
    };
    var HTMLRenderer = class {
      /**
       * Creates a new HTMLRenderer
       *
       * @param {Tree} parseTree - the parse tree (must support `walk` API)
       * @param {{classPrefix: string}} options
       */
      constructor(parseTree, options) {
        this.buffer = "";
        this.classPrefix = options.classPrefix;
        parseTree.walk(this);
      }
      /**
       * Adds texts to the output stream
       *
       * @param {string} text */
      addText(text) {
        this.buffer += escapeHTML(text);
      }
      /**
       * Adds a node open to the output stream (if needed)
       *
       * @param {Node} node */
      openNode(node) {
        if (!emitsWrappingTags(node)) return;
        const className = scopeToCSSClass(
          node.scope,
          { prefix: this.classPrefix }
        );
        this.span(className);
      }
      /**
       * Adds a node close to the output stream (if needed)
       *
       * @param {Node} node */
      closeNode(node) {
        if (!emitsWrappingTags(node)) return;
        this.buffer += SPAN_CLOSE;
      }
      /**
       * returns the accumulated buffer
      */
      value() {
        return this.buffer;
      }
      // helpers
      /**
       * Builds a span element
       *
       * @param {string} className */
      span(className) {
        this.buffer += `<span class="${className}">`;
      }
    };
    var newNode = (opts = {}) => {
      const result = { children: [] };
      Object.assign(result, opts);
      return result;
    };
    var TokenTree = class _TokenTree {
      constructor() {
        this.rootNode = newNode();
        this.stack = [this.rootNode];
      }
      get top() {
        return this.stack[this.stack.length - 1];
      }
      get root() {
        return this.rootNode;
      }
      /** @param {Node} node */
      add(node) {
        this.top.children.push(node);
      }
      /** @param {string} scope */
      openNode(scope) {
        const node = newNode({ scope });
        this.add(node);
        this.stack.push(node);
      }
      closeNode() {
        if (this.stack.length > 1) {
          return this.stack.pop();
        }
        return void 0;
      }
      closeAllNodes() {
        while (this.closeNode()) ;
      }
      toJSON() {
        return JSON.stringify(this.rootNode, null, 4);
      }
      /**
       * @typedef { import("./html_renderer").Renderer } Renderer
       * @param {Renderer} builder
       */
      walk(builder) {
        return this.constructor._walk(builder, this.rootNode);
      }
      /**
       * @param {Renderer} builder
       * @param {Node} node
       */
      static _walk(builder, node) {
        if (typeof node === "string") {
          builder.addText(node);
        } else if (node.children) {
          builder.openNode(node);
          node.children.forEach((child) => this._walk(builder, child));
          builder.closeNode(node);
        }
        return builder;
      }
      /**
       * @param {Node} node
       */
      static _collapse(node) {
        if (typeof node === "string") return;
        if (!node.children) return;
        if (node.children.every((el) => typeof el === "string")) {
          node.children = [node.children.join("")];
        } else {
          node.children.forEach((child) => {
            _TokenTree._collapse(child);
          });
        }
      }
    };
    var TokenTreeEmitter = class extends TokenTree {
      /**
       * @param {*} options
       */
      constructor(options) {
        super();
        this.options = options;
      }
      /**
       * @param {string} text
       */
      addText(text) {
        if (text === "") {
          return;
        }
        this.add(text);
      }
      /** @param {string} scope */
      startScope(scope) {
        this.openNode(scope);
      }
      endScope() {
        this.closeNode();
      }
      /**
       * @param {Emitter & {root: DataNode}} emitter
       * @param {string} name
       */
      __addSublanguage(emitter, name) {
        const node = emitter.root;
        if (name) node.scope = `language:${name}`;
        this.add(node);
      }
      toHTML() {
        const renderer = new HTMLRenderer(this, this.options);
        return renderer.value();
      }
      finalize() {
        this.closeAllNodes();
        return true;
      }
    };
    function source(re) {
      if (!re) return null;
      if (typeof re === "string") return re;
      return re.source;
    }
    function lookahead(re) {
      return concat2("(?=", re, ")");
    }
    function anyNumberOfTimes(re) {
      return concat2("(?:", re, ")*");
    }
    function optional(re) {
      return concat2("(?:", re, ")?");
    }
    function concat2(...args) {
      const joined = args.map((x) => source(x)).join("");
      return joined;
    }
    function stripOptionsFromArgs(args) {
      const opts = args[args.length - 1];
      if (typeof opts === "object" && opts.constructor === Object) {
        args.splice(args.length - 1, 1);
        return opts;
      } else {
        return {};
      }
    }
    function either(...args) {
      const opts = stripOptionsFromArgs(args);
      const joined = "(" + (opts.capture ? "" : "?:") + args.map((x) => source(x)).join("|") + ")";
      return joined;
    }
    function countMatchGroups(re) {
      return new RegExp(re.toString() + "|").exec("").length - 1;
    }
    function startsWith(re, lexeme) {
      const match = re && re.exec(lexeme);
      return match && match.index === 0;
    }
    var BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
    function _rewriteBackreferences(regexps, { joinWith }) {
      let numCaptures = 0;
      return regexps.map((regex) => {
        numCaptures += 1;
        const offset = numCaptures;
        let re = source(regex);
        let out = "";
        while (re.length > 0) {
          const match = BACKREF_RE.exec(re);
          if (!match) {
            out += re;
            break;
          }
          out += re.substring(0, match.index);
          re = re.substring(match.index + match[0].length);
          if (match[0][0] === "\\" && match[1]) {
            out += "\\" + String(Number(match[1]) + offset);
          } else {
            out += match[0];
            if (match[0] === "(") {
              numCaptures++;
            }
          }
        }
        return out;
      }).map((re) => `(${re})`).join(joinWith);
    }
    var MATCH_NOTHING_RE = /\b\B/;
    var IDENT_RE = "[a-zA-Z]\\w*";
    var UNDERSCORE_IDENT_RE = "[a-zA-Z_]\\w*";
    var NUMBER_RE = "\\b\\d+(\\.\\d+)?";
    var C_NUMBER_RE = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";
    var BINARY_NUMBER_RE = "\\b(0b[01]+)";
    var RE_STARTERS_RE = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
    var SHEBANG = (opts = {}) => {
      const beginShebang = /^#![ ]*\//;
      if (opts.binary) {
        opts.begin = concat2(
          beginShebang,
          /.*\b/,
          opts.binary,
          /\b.*/
        );
      }
      return inherit$1({
        scope: "meta",
        begin: beginShebang,
        end: /$/,
        relevance: 0,
        /** @type {ModeCallback} */
        "on:begin": (m, resp) => {
          if (m.index !== 0) resp.ignoreMatch();
        }
      }, opts);
    };
    var BACKSLASH_ESCAPE = {
      begin: "\\\\[\\s\\S]",
      relevance: 0
    };
    var APOS_STRING_MODE = {
      scope: "string",
      begin: "'",
      end: "'",
      illegal: "\\n",
      contains: [BACKSLASH_ESCAPE]
    };
    var QUOTE_STRING_MODE = {
      scope: "string",
      begin: '"',
      end: '"',
      illegal: "\\n",
      contains: [BACKSLASH_ESCAPE]
    };
    var PHRASAL_WORDS_MODE = {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    };
    var COMMENT = function(begin, end, modeOptions = {}) {
      const mode = inherit$1(
        {
          scope: "comment",
          begin,
          end,
          contains: []
        },
        modeOptions
      );
      mode.contains.push({
        scope: "doctag",
        // hack to avoid the space from being included. the space is necessary to
        // match here to prevent the plain text rule below from gobbling up doctags
        begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
        end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
        excludeBegin: true,
        relevance: 0
      });
      const ENGLISH_WORD = either(
        // list of common 1 and 2 letter words in English
        "I",
        "a",
        "is",
        "so",
        "us",
        "to",
        "at",
        "if",
        "in",
        "it",
        "on",
        // note: this is not an exhaustive list of contractions, just popular ones
        /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
        // contractions - can't we'd they're let's, etc
        /[A-Za-z]+[-][a-z]+/,
        // `no-way`, etc.
        /[A-Za-z][a-z]{2,}/
        // allow capitalized words at beginning of sentences
      );
      mode.contains.push(
        {
          // TODO: how to include ", (, ) without breaking grammars that use these for
          // comment delimiters?
          // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
          // ---
          // this tries to find sequences of 3 english words in a row (without any
          // "programming" type syntax) this gives us a strong signal that we've
          // TRULY found a comment - vs perhaps scanning with the wrong language.
          // It's possible to find something that LOOKS like the start of the
          // comment - but then if there is no readable text - good chance it is a
          // false match and not a comment.
          //
          // for a visual example please see:
          // https://github.com/highlightjs/highlight.js/issues/2827
          begin: concat2(
            /[ ]+/,
            // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
            "(",
            ENGLISH_WORD,
            /[.]?[:]?([.][ ]|[ ])/,
            "){3}"
          )
          // look for 3 words in a row
        }
      );
      return mode;
    };
    var C_LINE_COMMENT_MODE = COMMENT("//", "$");
    var C_BLOCK_COMMENT_MODE = COMMENT("/\\*", "\\*/");
    var HASH_COMMENT_MODE = COMMENT("#", "$");
    var NUMBER_MODE = {
      scope: "number",
      begin: NUMBER_RE,
      relevance: 0
    };
    var C_NUMBER_MODE = {
      scope: "number",
      begin: C_NUMBER_RE,
      relevance: 0
    };
    var BINARY_NUMBER_MODE = {
      scope: "number",
      begin: BINARY_NUMBER_RE,
      relevance: 0
    };
    var REGEXP_MODE = {
      scope: "regexp",
      begin: /\/(?=[^/\n]*\/)/,
      end: /\/[gimuy]*/,
      contains: [
        BACKSLASH_ESCAPE,
        {
          begin: /\[/,
          end: /\]/,
          relevance: 0,
          contains: [BACKSLASH_ESCAPE]
        }
      ]
    };
    var TITLE_MODE = {
      scope: "title",
      begin: IDENT_RE,
      relevance: 0
    };
    var UNDERSCORE_TITLE_MODE = {
      scope: "title",
      begin: UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    var METHOD_GUARD = {
      // excludes method names from keyword processing
      begin: "\\.\\s*" + UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    var END_SAME_AS_BEGIN = function(mode) {
      return Object.assign(
        mode,
        {
          /** @type {ModeCallback} */
          "on:begin": (m, resp) => {
            resp.data._beginMatch = m[1];
          },
          /** @type {ModeCallback} */
          "on:end": (m, resp) => {
            if (resp.data._beginMatch !== m[1]) resp.ignoreMatch();
          }
        }
      );
    };
    var MODES = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      APOS_STRING_MODE,
      BACKSLASH_ESCAPE,
      BINARY_NUMBER_MODE,
      BINARY_NUMBER_RE,
      COMMENT,
      C_BLOCK_COMMENT_MODE,
      C_LINE_COMMENT_MODE,
      C_NUMBER_MODE,
      C_NUMBER_RE,
      END_SAME_AS_BEGIN,
      HASH_COMMENT_MODE,
      IDENT_RE,
      MATCH_NOTHING_RE,
      METHOD_GUARD,
      NUMBER_MODE,
      NUMBER_RE,
      PHRASAL_WORDS_MODE,
      QUOTE_STRING_MODE,
      REGEXP_MODE,
      RE_STARTERS_RE,
      SHEBANG,
      TITLE_MODE,
      UNDERSCORE_IDENT_RE,
      UNDERSCORE_TITLE_MODE
    });
    function skipIfHasPrecedingDot(match, response) {
      const before = match.input[match.index - 1];
      if (before === ".") {
        response.ignoreMatch();
      }
    }
    function scopeClassName(mode, _parent) {
      if (mode.className !== void 0) {
        mode.scope = mode.className;
        delete mode.className;
      }
    }
    function beginKeywords(mode, parent) {
      if (!parent) return;
      if (!mode.beginKeywords) return;
      mode.begin = "\\b(" + mode.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)";
      mode.__beforeBegin = skipIfHasPrecedingDot;
      mode.keywords = mode.keywords || mode.beginKeywords;
      delete mode.beginKeywords;
      if (mode.relevance === void 0) mode.relevance = 0;
    }
    function compileIllegal(mode, _parent) {
      if (!Array.isArray(mode.illegal)) return;
      mode.illegal = either(...mode.illegal);
    }
    function compileMatch(mode, _parent) {
      if (!mode.match) return;
      if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");
      mode.begin = mode.match;
      delete mode.match;
    }
    function compileRelevance(mode, _parent) {
      if (mode.relevance === void 0) mode.relevance = 1;
    }
    var beforeMatchExt = (mode, parent) => {
      if (!mode.beforeMatch) return;
      if (mode.starts) throw new Error("beforeMatch cannot be used with starts");
      const originalMode = Object.assign({}, mode);
      Object.keys(mode).forEach((key) => {
        delete mode[key];
      });
      mode.keywords = originalMode.keywords;
      mode.begin = concat2(originalMode.beforeMatch, lookahead(originalMode.begin));
      mode.starts = {
        relevance: 0,
        contains: [
          Object.assign(originalMode, { endsParent: true })
        ]
      };
      mode.relevance = 0;
      delete originalMode.beforeMatch;
    };
    var COMMON_KEYWORDS = [
      "of",
      "and",
      "for",
      "in",
      "not",
      "or",
      "if",
      "then",
      "parent",
      // common variable name
      "list",
      // common variable name
      "value"
      // common variable name
    ];
    var DEFAULT_KEYWORD_SCOPE = "keyword";
    function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
      const compiledKeywords = /* @__PURE__ */ Object.create(null);
      if (typeof rawKeywords === "string") {
        compileList(scopeName, rawKeywords.split(" "));
      } else if (Array.isArray(rawKeywords)) {
        compileList(scopeName, rawKeywords);
      } else {
        Object.keys(rawKeywords).forEach(function(scopeName2) {
          Object.assign(
            compiledKeywords,
            compileKeywords(rawKeywords[scopeName2], caseInsensitive, scopeName2)
          );
        });
      }
      return compiledKeywords;
      function compileList(scopeName2, keywordList) {
        if (caseInsensitive) {
          keywordList = keywordList.map((x) => x.toLowerCase());
        }
        keywordList.forEach(function(keyword) {
          const pair = keyword.split("|");
          compiledKeywords[pair[0]] = [scopeName2, scoreForKeyword(pair[0], pair[1])];
        });
      }
    }
    function scoreForKeyword(keyword, providedScore) {
      if (providedScore) {
        return Number(providedScore);
      }
      return commonKeyword(keyword) ? 0 : 1;
    }
    function commonKeyword(keyword) {
      return COMMON_KEYWORDS.includes(keyword.toLowerCase());
    }
    var seenDeprecations = {};
    var error = (message) => {
      console.error(message);
    };
    var warn = (message, ...args) => {
      console.log(`WARN: ${message}`, ...args);
    };
    var deprecated = (version2, message) => {
      if (seenDeprecations[`${version2}/${message}`]) return;
      console.log(`Deprecated as of ${version2}. ${message}`);
      seenDeprecations[`${version2}/${message}`] = true;
    };
    var MultiClassError = new Error();
    function remapScopeNames(mode, regexes, { key }) {
      let offset = 0;
      const scopeNames = mode[key];
      const emit = {};
      const positions = {};
      for (let i = 1; i <= regexes.length; i++) {
        positions[i + offset] = scopeNames[i];
        emit[i + offset] = true;
        offset += countMatchGroups(regexes[i - 1]);
      }
      mode[key] = positions;
      mode[key]._emit = emit;
      mode[key]._multi = true;
    }
    function beginMultiClass(mode) {
      if (!Array.isArray(mode.begin)) return;
      if (mode.skip || mode.excludeBegin || mode.returnBegin) {
        error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
        throw MultiClassError;
      }
      if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
        error("beginScope must be object");
        throw MultiClassError;
      }
      remapScopeNames(mode, mode.begin, { key: "beginScope" });
      mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
    }
    function endMultiClass(mode) {
      if (!Array.isArray(mode.end)) return;
      if (mode.skip || mode.excludeEnd || mode.returnEnd) {
        error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
        throw MultiClassError;
      }
      if (typeof mode.endScope !== "object" || mode.endScope === null) {
        error("endScope must be object");
        throw MultiClassError;
      }
      remapScopeNames(mode, mode.end, { key: "endScope" });
      mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
    }
    function scopeSugar(mode) {
      if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
        mode.beginScope = mode.scope;
        delete mode.scope;
      }
    }
    function MultiClass(mode) {
      scopeSugar(mode);
      if (typeof mode.beginScope === "string") {
        mode.beginScope = { _wrap: mode.beginScope };
      }
      if (typeof mode.endScope === "string") {
        mode.endScope = { _wrap: mode.endScope };
      }
      beginMultiClass(mode);
      endMultiClass(mode);
    }
    function compileLanguage(language) {
      function langRe(value, global) {
        return new RegExp(
          source(value),
          "m" + (language.case_insensitive ? "i" : "") + (language.unicodeRegex ? "u" : "") + (global ? "g" : "")
        );
      }
      class MultiRegex {
        constructor() {
          this.matchIndexes = {};
          this.regexes = [];
          this.matchAt = 1;
          this.position = 0;
        }
        // @ts-ignore
        addRule(re, opts) {
          opts.position = this.position++;
          this.matchIndexes[this.matchAt] = opts;
          this.regexes.push([opts, re]);
          this.matchAt += countMatchGroups(re) + 1;
        }
        compile() {
          if (this.regexes.length === 0) {
            this.exec = () => null;
          }
          const terminators = this.regexes.map((el) => el[1]);
          this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: "|" }), true);
          this.lastIndex = 0;
        }
        /** @param {string} s */
        exec(s) {
          this.matcherRe.lastIndex = this.lastIndex;
          const match = this.matcherRe.exec(s);
          if (!match) {
            return null;
          }
          const i = match.findIndex((el, i2) => i2 > 0 && el !== void 0);
          const matchData = this.matchIndexes[i];
          match.splice(0, i);
          return Object.assign(match, matchData);
        }
      }
      class ResumableMultiRegex {
        constructor() {
          this.rules = [];
          this.multiRegexes = [];
          this.count = 0;
          this.lastIndex = 0;
          this.regexIndex = 0;
        }
        // @ts-ignore
        getMatcher(index) {
          if (this.multiRegexes[index]) return this.multiRegexes[index];
          const matcher = new MultiRegex();
          this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
          matcher.compile();
          this.multiRegexes[index] = matcher;
          return matcher;
        }
        resumingScanAtSamePosition() {
          return this.regexIndex !== 0;
        }
        considerAll() {
          this.regexIndex = 0;
        }
        // @ts-ignore
        addRule(re, opts) {
          this.rules.push([re, opts]);
          if (opts.type === "begin") this.count++;
        }
        /** @param {string} s */
        exec(s) {
          const m = this.getMatcher(this.regexIndex);
          m.lastIndex = this.lastIndex;
          let result = m.exec(s);
          if (this.resumingScanAtSamePosition()) {
            if (result && result.index === this.lastIndex) ;
            else {
              const m2 = this.getMatcher(0);
              m2.lastIndex = this.lastIndex + 1;
              result = m2.exec(s);
            }
          }
          if (result) {
            this.regexIndex += result.position + 1;
            if (this.regexIndex === this.count) {
              this.considerAll();
            }
          }
          return result;
        }
      }
      function buildModeRegex(mode) {
        const mm = new ResumableMultiRegex();
        mode.contains.forEach((term) => mm.addRule(term.begin, { rule: term, type: "begin" }));
        if (mode.terminatorEnd) {
          mm.addRule(mode.terminatorEnd, { type: "end" });
        }
        if (mode.illegal) {
          mm.addRule(mode.illegal, { type: "illegal" });
        }
        return mm;
      }
      function compileMode(mode, parent) {
        const cmode = (
          /** @type CompiledMode */
          mode
        );
        if (mode.isCompiled) return cmode;
        [
          scopeClassName,
          // do this early so compiler extensions generally don't have to worry about
          // the distinction between match/begin
          compileMatch,
          MultiClass,
          beforeMatchExt
        ].forEach((ext) => ext(mode, parent));
        language.compilerExtensions.forEach((ext) => ext(mode, parent));
        mode.__beforeBegin = null;
        [
          beginKeywords,
          // do this later so compiler extensions that come earlier have access to the
          // raw array if they wanted to perhaps manipulate it, etc.
          compileIllegal,
          // default to 1 relevance if not specified
          compileRelevance
        ].forEach((ext) => ext(mode, parent));
        mode.isCompiled = true;
        let keywordPattern = null;
        if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
          mode.keywords = Object.assign({}, mode.keywords);
          keywordPattern = mode.keywords.$pattern;
          delete mode.keywords.$pattern;
        }
        keywordPattern = keywordPattern || /\w+/;
        if (mode.keywords) {
          mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
        }
        cmode.keywordPatternRe = langRe(keywordPattern, true);
        if (parent) {
          if (!mode.begin) mode.begin = /\B|\b/;
          cmode.beginRe = langRe(cmode.begin);
          if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
          if (mode.end) cmode.endRe = langRe(cmode.end);
          cmode.terminatorEnd = source(cmode.end) || "";
          if (mode.endsWithParent && parent.terminatorEnd) {
            cmode.terminatorEnd += (mode.end ? "|" : "") + parent.terminatorEnd;
          }
        }
        if (mode.illegal) cmode.illegalRe = langRe(
          /** @type {RegExp | string} */
          mode.illegal
        );
        if (!mode.contains) mode.contains = [];
        mode.contains = [].concat(...mode.contains.map(function(c) {
          return expandOrCloneMode(c === "self" ? mode : c);
        }));
        mode.contains.forEach(function(c) {
          compileMode(
            /** @type Mode */
            c,
            cmode
          );
        });
        if (mode.starts) {
          compileMode(mode.starts, parent);
        }
        cmode.matcher = buildModeRegex(cmode);
        return cmode;
      }
      if (!language.compilerExtensions) language.compilerExtensions = [];
      if (language.contains && language.contains.includes("self")) {
        throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      }
      language.classNameAliases = inherit$1(language.classNameAliases || {});
      return compileMode(
        /** @type Mode */
        language
      );
    }
    function dependencyOnParent(mode) {
      if (!mode) return false;
      return mode.endsWithParent || dependencyOnParent(mode.starts);
    }
    function expandOrCloneMode(mode) {
      if (mode.variants && !mode.cachedVariants) {
        mode.cachedVariants = mode.variants.map(function(variant) {
          return inherit$1(mode, { variants: null }, variant);
        });
      }
      if (mode.cachedVariants) {
        return mode.cachedVariants;
      }
      if (dependencyOnParent(mode)) {
        return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
      }
      if (Object.isFrozen(mode)) {
        return inherit$1(mode);
      }
      return mode;
    }
    var version = "11.11.1";
    var HTMLInjectionError = class extends Error {
      constructor(reason, html) {
        super(reason);
        this.name = "HTMLInjectionError";
        this.html = html;
      }
    };
    var escape = escapeHTML;
    var inherit = inherit$1;
    var NO_MATCH = /* @__PURE__ */ Symbol("nomatch");
    var MAX_KEYWORD_HITS = 7;
    var HLJS = function(hljs) {
      const languages = /* @__PURE__ */ Object.create(null);
      const aliases = /* @__PURE__ */ Object.create(null);
      const plugins = [];
      let SAFE_MODE = true;
      const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
      const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: "Plain text", contains: [] };
      let options = {
        ignoreUnescapedHTML: false,
        throwUnescapedHTML: false,
        noHighlightRe: /^(no-?highlight)$/i,
        languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
        classPrefix: "hljs-",
        cssSelector: "pre code",
        languages: null,
        // beta configuration options, subject to change, welcome to discuss
        // https://github.com/highlightjs/highlight.js/issues/1086
        __emitter: TokenTreeEmitter
      };
      function shouldNotHighlight(languageName) {
        return options.noHighlightRe.test(languageName);
      }
      function blockLanguage(block) {
        let classes = block.className + " ";
        classes += block.parentNode ? block.parentNode.className : "";
        const match = options.languageDetectRe.exec(classes);
        if (match) {
          const language = getLanguage(match[1]);
          if (!language) {
            warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
            warn("Falling back to no-highlight mode for this block.", block);
          }
          return language ? match[1] : "no-highlight";
        }
        return classes.split(/\s+/).find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
      }
      function highlight2(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
        let code = "";
        let languageName = "";
        if (typeof optionsOrCode === "object") {
          code = codeOrLanguageName;
          ignoreIllegals = optionsOrCode.ignoreIllegals;
          languageName = optionsOrCode.language;
        } else {
          deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
          deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
          languageName = codeOrLanguageName;
          code = optionsOrCode;
        }
        if (ignoreIllegals === void 0) {
          ignoreIllegals = true;
        }
        const context = {
          code,
          language: languageName
        };
        fire("before:highlight", context);
        const result = context.result ? context.result : _highlight(context.language, context.code, ignoreIllegals);
        result.code = context.code;
        fire("after:highlight", result);
        return result;
      }
      function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
        const keywordHits = /* @__PURE__ */ Object.create(null);
        function keywordData(mode, matchText) {
          return mode.keywords[matchText];
        }
        function processKeywords() {
          if (!top.keywords) {
            emitter.addText(modeBuffer);
            return;
          }
          let lastIndex = 0;
          top.keywordPatternRe.lastIndex = 0;
          let match = top.keywordPatternRe.exec(modeBuffer);
          let buf = "";
          while (match) {
            buf += modeBuffer.substring(lastIndex, match.index);
            const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
            const data = keywordData(top, word);
            if (data) {
              const [kind, keywordRelevance] = data;
              emitter.addText(buf);
              buf = "";
              keywordHits[word] = (keywordHits[word] || 0) + 1;
              if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
              if (kind.startsWith("_")) {
                buf += match[0];
              } else {
                const cssClass = language.classNameAliases[kind] || kind;
                emitKeyword(match[0], cssClass);
              }
            } else {
              buf += match[0];
            }
            lastIndex = top.keywordPatternRe.lastIndex;
            match = top.keywordPatternRe.exec(modeBuffer);
          }
          buf += modeBuffer.substring(lastIndex);
          emitter.addText(buf);
        }
        function processSubLanguage() {
          if (modeBuffer === "") return;
          let result2 = null;
          if (typeof top.subLanguage === "string") {
            if (!languages[top.subLanguage]) {
              emitter.addText(modeBuffer);
              return;
            }
            result2 = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
            continuations[top.subLanguage] = /** @type {CompiledMode} */
            result2._top;
          } else {
            result2 = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
          }
          if (top.relevance > 0) {
            relevance += result2.relevance;
          }
          emitter.__addSublanguage(result2._emitter, result2.language);
        }
        function processBuffer() {
          if (top.subLanguage != null) {
            processSubLanguage();
          } else {
            processKeywords();
          }
          modeBuffer = "";
        }
        function emitKeyword(keyword, scope) {
          if (keyword === "") return;
          emitter.startScope(scope);
          emitter.addText(keyword);
          emitter.endScope();
        }
        function emitMultiClass(scope, match) {
          let i = 1;
          const max = match.length - 1;
          while (i <= max) {
            if (!scope._emit[i]) {
              i++;
              continue;
            }
            const klass = language.classNameAliases[scope[i]] || scope[i];
            const text = match[i];
            if (klass) {
              emitKeyword(text, klass);
            } else {
              modeBuffer = text;
              processKeywords();
              modeBuffer = "";
            }
            i++;
          }
        }
        function startNewMode(mode, match) {
          if (mode.scope && typeof mode.scope === "string") {
            emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
          }
          if (mode.beginScope) {
            if (mode.beginScope._wrap) {
              emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
              modeBuffer = "";
            } else if (mode.beginScope._multi) {
              emitMultiClass(mode.beginScope, match);
              modeBuffer = "";
            }
          }
          top = Object.create(mode, { parent: { value: top } });
          return top;
        }
        function endOfMode(mode, match, matchPlusRemainder) {
          let matched = startsWith(mode.endRe, matchPlusRemainder);
          if (matched) {
            if (mode["on:end"]) {
              const resp = new Response(mode);
              mode["on:end"](match, resp);
              if (resp.isMatchIgnored) matched = false;
            }
            if (matched) {
              while (mode.endsParent && mode.parent) {
                mode = mode.parent;
              }
              return mode;
            }
          }
          if (mode.endsWithParent) {
            return endOfMode(mode.parent, match, matchPlusRemainder);
          }
        }
        function doIgnore(lexeme) {
          if (top.matcher.regexIndex === 0) {
            modeBuffer += lexeme[0];
            return 1;
          } else {
            resumeScanAtSamePosition = true;
            return 0;
          }
        }
        function doBeginMatch(match) {
          const lexeme = match[0];
          const newMode = match.rule;
          const resp = new Response(newMode);
          const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
          for (const cb of beforeCallbacks) {
            if (!cb) continue;
            cb(match, resp);
            if (resp.isMatchIgnored) return doIgnore(lexeme);
          }
          if (newMode.skip) {
            modeBuffer += lexeme;
          } else {
            if (newMode.excludeBegin) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (!newMode.returnBegin && !newMode.excludeBegin) {
              modeBuffer = lexeme;
            }
          }
          startNewMode(newMode, match);
          return newMode.returnBegin ? 0 : lexeme.length;
        }
        function doEndMatch(match) {
          const lexeme = match[0];
          const matchPlusRemainder = codeToHighlight.substring(match.index);
          const endMode = endOfMode(top, match, matchPlusRemainder);
          if (!endMode) {
            return NO_MATCH;
          }
          const origin = top;
          if (top.endScope && top.endScope._wrap) {
            processBuffer();
            emitKeyword(lexeme, top.endScope._wrap);
          } else if (top.endScope && top.endScope._multi) {
            processBuffer();
            emitMultiClass(top.endScope, match);
          } else if (origin.skip) {
            modeBuffer += lexeme;
          } else {
            if (!(origin.returnEnd || origin.excludeEnd)) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (origin.excludeEnd) {
              modeBuffer = lexeme;
            }
          }
          do {
            if (top.scope) {
              emitter.closeNode();
            }
            if (!top.skip && !top.subLanguage) {
              relevance += top.relevance;
            }
            top = top.parent;
          } while (top !== endMode.parent);
          if (endMode.starts) {
            startNewMode(endMode.starts, match);
          }
          return origin.returnEnd ? 0 : lexeme.length;
        }
        function processContinuations() {
          const list2 = [];
          for (let current = top; current !== language; current = current.parent) {
            if (current.scope) {
              list2.unshift(current.scope);
            }
          }
          list2.forEach((item) => emitter.openNode(item));
        }
        let lastMatch = {};
        function processLexeme(textBeforeMatch, match) {
          const lexeme = match && match[0];
          modeBuffer += textBeforeMatch;
          if (lexeme == null) {
            processBuffer();
            return 0;
          }
          if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
            modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
            if (!SAFE_MODE) {
              const err = new Error(`0 width match regex (${languageName})`);
              err.languageName = languageName;
              err.badRule = lastMatch.rule;
              throw err;
            }
            return 1;
          }
          lastMatch = match;
          if (match.type === "begin") {
            return doBeginMatch(match);
          } else if (match.type === "illegal" && !ignoreIllegals) {
            const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || "<unnamed>") + '"');
            err.mode = top;
            throw err;
          } else if (match.type === "end") {
            const processed = doEndMatch(match);
            if (processed !== NO_MATCH) {
              return processed;
            }
          }
          if (match.type === "illegal" && lexeme === "") {
            modeBuffer += "\n";
            return 1;
          }
          if (iterations > 1e5 && iterations > match.index * 3) {
            const err = new Error("potential infinite loop, way more iterations than matches");
            throw err;
          }
          modeBuffer += lexeme;
          return lexeme.length;
        }
        const language = getLanguage(languageName);
        if (!language) {
          error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
          throw new Error('Unknown language: "' + languageName + '"');
        }
        const md = compileLanguage(language);
        let result = "";
        let top = continuation || md;
        const continuations = {};
        const emitter = new options.__emitter(options);
        processContinuations();
        let modeBuffer = "";
        let relevance = 0;
        let index = 0;
        let iterations = 0;
        let resumeScanAtSamePosition = false;
        try {
          if (!language.__emitTokens) {
            top.matcher.considerAll();
            for (; ; ) {
              iterations++;
              if (resumeScanAtSamePosition) {
                resumeScanAtSamePosition = false;
              } else {
                top.matcher.considerAll();
              }
              top.matcher.lastIndex = index;
              const match = top.matcher.exec(codeToHighlight);
              if (!match) break;
              const beforeMatch = codeToHighlight.substring(index, match.index);
              const processedCount = processLexeme(beforeMatch, match);
              index = match.index + processedCount;
            }
            processLexeme(codeToHighlight.substring(index));
          } else {
            language.__emitTokens(codeToHighlight, emitter);
          }
          emitter.finalize();
          result = emitter.toHTML();
          return {
            language: languageName,
            value: result,
            relevance,
            illegal: false,
            _emitter: emitter,
            _top: top
          };
        } catch (err) {
          if (err.message && err.message.includes("Illegal")) {
            return {
              language: languageName,
              value: escape(codeToHighlight),
              illegal: true,
              relevance: 0,
              _illegalBy: {
                message: err.message,
                index,
                context: codeToHighlight.slice(index - 100, index + 100),
                mode: err.mode,
                resultSoFar: result
              },
              _emitter: emitter
            };
          } else if (SAFE_MODE) {
            return {
              language: languageName,
              value: escape(codeToHighlight),
              illegal: false,
              relevance: 0,
              errorRaised: err,
              _emitter: emitter,
              _top: top
            };
          } else {
            throw err;
          }
        }
      }
      function justTextHighlightResult(code) {
        const result = {
          value: escape(code),
          illegal: false,
          relevance: 0,
          _top: PLAINTEXT_LANGUAGE,
          _emitter: new options.__emitter(options)
        };
        result._emitter.addText(code);
        return result;
      }
      function highlightAuto(code, languageSubset) {
        languageSubset = languageSubset || options.languages || Object.keys(languages);
        const plaintext = justTextHighlightResult(code);
        const results = languageSubset.filter(getLanguage).filter(autoDetection).map(
          (name) => _highlight(name, code, false)
        );
        results.unshift(plaintext);
        const sorted = results.sort((a, b) => {
          if (a.relevance !== b.relevance) return b.relevance - a.relevance;
          if (a.language && b.language) {
            if (getLanguage(a.language).supersetOf === b.language) {
              return 1;
            } else if (getLanguage(b.language).supersetOf === a.language) {
              return -1;
            }
          }
          return 0;
        });
        const [best, secondBest] = sorted;
        const result = best;
        result.secondBest = secondBest;
        return result;
      }
      function updateClassName(element, currentLang, resultLang) {
        const language = currentLang && aliases[currentLang] || resultLang;
        element.classList.add("hljs");
        element.classList.add(`language-${language}`);
      }
      function highlightElement(element) {
        let node = null;
        const language = blockLanguage(element);
        if (shouldNotHighlight(language)) return;
        fire(
          "before:highlightElement",
          { el: element, language }
        );
        if (element.dataset.highlighted) {
          console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
          return;
        }
        if (element.children.length > 0) {
          if (!options.ignoreUnescapedHTML) {
            console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
            console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
            console.warn("The element with unescaped HTML:");
            console.warn(element);
          }
          if (options.throwUnescapedHTML) {
            const err = new HTMLInjectionError(
              "One of your code blocks includes unescaped HTML.",
              element.innerHTML
            );
            throw err;
          }
        }
        node = element;
        const text = node.textContent;
        const result = language ? highlight2(text, { language, ignoreIllegals: true }) : highlightAuto(text);
        element.innerHTML = result.value;
        element.dataset.highlighted = "yes";
        updateClassName(element, language, result.language);
        element.result = {
          language: result.language,
          // TODO: remove with version 11.0
          re: result.relevance,
          relevance: result.relevance
        };
        if (result.secondBest) {
          element.secondBest = {
            language: result.secondBest.language,
            relevance: result.secondBest.relevance
          };
        }
        fire("after:highlightElement", { el: element, result, text });
      }
      function configure(userOptions) {
        options = inherit(options, userOptions);
      }
      const initHighlighting = () => {
        highlightAll();
        deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
      };
      function initHighlightingOnLoad() {
        highlightAll();
        deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
      }
      let wantsHighlight = false;
      function highlightAll() {
        function boot() {
          highlightAll();
        }
        if (document.readyState === "loading") {
          if (!wantsHighlight) {
            window.addEventListener("DOMContentLoaded", boot, false);
          }
          wantsHighlight = true;
          return;
        }
        const blocks = document.querySelectorAll(options.cssSelector);
        blocks.forEach(highlightElement);
      }
      function registerLanguage(languageName, languageDefinition) {
        let lang = null;
        try {
          lang = languageDefinition(hljs);
        } catch (error$1) {
          error("Language definition for '{}' could not be registered.".replace("{}", languageName));
          if (!SAFE_MODE) {
            throw error$1;
          } else {
            error(error$1);
          }
          lang = PLAINTEXT_LANGUAGE;
        }
        if (!lang.name) lang.name = languageName;
        languages[languageName] = lang;
        lang.rawDefinition = languageDefinition.bind(null, hljs);
        if (lang.aliases) {
          registerAliases(lang.aliases, { languageName });
        }
      }
      function unregisterLanguage(languageName) {
        delete languages[languageName];
        for (const alias of Object.keys(aliases)) {
          if (aliases[alias] === languageName) {
            delete aliases[alias];
          }
        }
      }
      function listLanguages() {
        return Object.keys(languages);
      }
      function getLanguage(name) {
        name = (name || "").toLowerCase();
        return languages[name] || languages[aliases[name]];
      }
      function registerAliases(aliasList, { languageName }) {
        if (typeof aliasList === "string") {
          aliasList = [aliasList];
        }
        aliasList.forEach((alias) => {
          aliases[alias.toLowerCase()] = languageName;
        });
      }
      function autoDetection(name) {
        const lang = getLanguage(name);
        return lang && !lang.disableAutodetect;
      }
      function upgradePluginAPI(plugin) {
        if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
          plugin["before:highlightElement"] = (data) => {
            plugin["before:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
        if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
          plugin["after:highlightElement"] = (data) => {
            plugin["after:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
      }
      function addPlugin(plugin) {
        upgradePluginAPI(plugin);
        plugins.push(plugin);
      }
      function removePlugin(plugin) {
        const index = plugins.indexOf(plugin);
        if (index !== -1) {
          plugins.splice(index, 1);
        }
      }
      function fire(event, args) {
        const cb = event;
        plugins.forEach(function(plugin) {
          if (plugin[cb]) {
            plugin[cb](args);
          }
        });
      }
      function deprecateHighlightBlock(el) {
        deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
        deprecated("10.7.0", "Please use highlightElement now.");
        return highlightElement(el);
      }
      Object.assign(hljs, {
        highlight: highlight2,
        highlightAuto,
        highlightAll,
        highlightElement,
        // TODO: Remove with v12 API
        highlightBlock: deprecateHighlightBlock,
        configure,
        initHighlighting,
        initHighlightingOnLoad,
        registerLanguage,
        unregisterLanguage,
        listLanguages,
        getLanguage,
        registerAliases,
        autoDetection,
        inherit,
        addPlugin,
        removePlugin
      });
      hljs.debugMode = function() {
        SAFE_MODE = false;
      };
      hljs.safeMode = function() {
        SAFE_MODE = true;
      };
      hljs.versionString = version;
      hljs.regex = {
        concat: concat2,
        lookahead,
        either,
        optional,
        anyNumberOfTimes
      };
      for (const key in MODES) {
        if (typeof MODES[key] === "object") {
          deepFreeze(MODES[key]);
        }
      }
      Object.assign(hljs, MODES);
      return hljs;
    };
    var highlight = HLJS({});
    highlight.newInstance = () => HLJS({});
    module.exports = highlight;
    highlight.HighlightJS = highlight;
    highlight.default = highlight;
  }
});

// node_modules/squint-cljs/src/squint/core.js
function __toFn(x) {
  if (x == null || typeof x === "function") return x;
  if (typeof x === "string") return (coll, d) => get(coll, x, d);
  switch (typeConst(x)) {
    case MAP_TYPE:
    case ARRAY_TYPE:
    case OBJECT_TYPE:
    case SET_TYPE:
      return (k, d) => get(x, k, d);
    case INSTANCE_TYPE:
      if (x[ILookup__lookup] !== void 0) return (k, d) => get(x, k, d);
  }
  return x;
}
var has = Object.prototype.hasOwnProperty;
function findKey(iter, tar, key) {
  for (key of iter.keys()) {
    if (dequal(key, tar)) return key;
  }
}
function isSortedMap(m) {
  return m != null && m[SORTED_TAG] === true && m[TYPE_TAG] === MAP_TYPE;
}
function isSetLike(s) {
  return s != null && (s instanceof Set || s[TYPE_TAG] === SET_TYPE);
}
function isMapLike(m) {
  return m != null && typeof m === "object" && (m.constructor === Object || m instanceof Map || m[TYPE_TAG] === MAP_TYPE);
}
function mapHas(m, k) {
  return m instanceof Map || m[TYPE_TAG] === MAP_TYPE ? m.has(k) : has.call(m, k);
}
function mapGet(m, k) {
  return m instanceof Map || m[TYPE_TAG] === MAP_TYPE ? m.get(k) : m[k];
}
function mapCount(m) {
  return m instanceof Map || m[TYPE_TAG] === MAP_TYPE ? m.size : Object.keys(m).length;
}
function dequalSameCtor(foo, bar, ctor) {
  var len;
  if (ctor === Array) {
    if ((len = foo.length) === bar.length) {
      while (len-- && dequal(foo[len], bar[len])) ;
    }
    return len === -1;
  }
  len = 0;
  for (const k in foo) {
    if (has.call(foo, k) && ++len && !has.call(bar, k)) return false;
    if (!(k in bar) || !dequal(foo[k], bar[k])) return false;
  }
  return Object.keys(bar).length === len;
}
function dequal(foo, bar) {
  if (foo === bar) return true;
  if (foo == null) return bar == null;
  if (bar == null) return false;
  if (typeof foo !== "object" || typeof bar !== "object") return false;
  var ctor = foo.constructor, tmp;
  if (ctor === bar.constructor && (ctor === Object || ctor === Array)) {
    return dequalSameCtor(foo, bar, ctor);
  }
  if (typeof foo === "object" && foo[IEquiv__equiv] !== void 0) return !!foo[IEquiv__equiv](foo, bar);
  if (typeof bar === "object" && bar[IEquiv__equiv] !== void 0) return !!bar[IEquiv__equiv](bar, foo);
  const fooSorted = isSortedMap(foo);
  if (fooSorted || isSortedMap(bar)) {
    const sm = fooSorted ? foo : bar;
    const other = sm === foo ? bar : foo;
    if (!isMapLike(other) || mapCount(sm) !== mapCount(other)) return false;
    for (const k of sm.keys()) {
      if (!mapHas(other, k) || !dequal(sm.get(k), mapGet(other, k))) return false;
    }
    return true;
  }
  if (isMapLike(foo) && isMapLike(bar) && foo.constructor !== bar.constructor) {
    if (mapCount(foo) !== mapCount(bar)) return false;
    for (const k of foo instanceof Map ? foo.keys() : Object.keys(foo)) {
      if (!mapHas(bar, k) || !dequal(mapGet(foo, k), mapGet(bar, k))) return false;
    }
    return true;
  }
  if (isSetLike(foo) || isSetLike(bar)) {
    if (!isSetLike(foo) || !isSetLike(bar) || foo.size !== bar.size) return false;
    for (let e of foo) {
      if (e && typeof e === "object") {
        e = findKey(bar, e);
        if (!e) return false;
      }
      if (!bar.has(e)) return false;
    }
    return true;
  }
  if (foo && bar && ctor === bar.constructor) {
    if (ctor === Date) return foo.getTime() === bar.getTime();
    if (ctor === RegExp) return false;
    if (ctor === Map) {
      if (foo.size !== bar.size) {
        return false;
      }
      for (const kv of foo) {
        tmp = kv[0];
        if (tmp && typeof tmp === "object") {
          tmp = findKey(bar, tmp);
          if (!tmp) return false;
        }
        if (!dequal(kv[1], bar.get(tmp))) {
          return false;
        }
      }
      return true;
    }
    if ((!ctor || typeof foo === "object") && foo[TYPE_TAG] !== LAZY_ITERABLE_TYPE) {
      return dequalSameCtor(foo, bar, Object);
    }
  }
  if (foo && bar && (Array.isArray(foo) || foo[TYPE_TAG] === LAZY_ITERABLE_TYPE) && (Array.isArray(bar) || bar[TYPE_TAG] === LAZY_ITERABLE_TYPE)) {
    const fi = foo[Symbol.iterator]();
    const bi = bar[Symbol.iterator]();
    for (; ; ) {
      const a = fi.next();
      const b = bi.next();
      if (a.done || b.done) return !!(a.done && b.done);
      if (!dequal(a.value, b.value)) return false;
    }
  }
  return false;
}
function walkArray(arr, comp2) {
  return arr.every(function(x, i) {
    return i === 0 || comp2(arr[i - 1], x);
  });
}
function _EQ_(...xs) {
  return walkArray(xs, (x, y) => dequal(x, y));
}
function validateArrayKeys(o, k, kvs) {
  let len = o.length;
  for (let i = 0; i < kvs.length + 2; i += 2) {
    const key = i === 0 ? k : kvs[i - 2];
    if (!Number.isInteger(key)) {
      throw new Error("Vector's key for assoc must be a number.");
    }
    if (key < 0 || key > len) {
      throw new Error(`Index ${key} out of bounds [0,${len}]`);
    }
    if (key === len) len++;
  }
}
function assoc_BANG_(m, k, v, ...kvs) {
  if (arguments.length < 3 || kvs.length % 2 !== 0) {
    throw new Error("Illegal argument: assoc expects an odd number of arguments.");
  }
  switch (typeConst(m)) {
    case MAP_TYPE:
      m.set(k, v);
      for (let i = 0; i < kvs.length; i += 2) {
        m.set(kvs[i], kvs[i + 1]);
      }
      break;
    case ARRAY_TYPE:
      validateArrayKeys(m, k, kvs);
      m[k] = v;
      for (let i = 0; i < kvs.length; i += 2) {
        m[kvs[i]] = kvs[i + 1];
      }
      break;
    case INSTANCE_TYPE:
      if (m[ITransientAssociative__assoc_BANG_] !== void 0) {
        let ret = m[ITransientAssociative__assoc_BANG_](m, k, v);
        for (let i = 0; i < kvs.length; i += 2) {
          ret = ret[ITransientAssociative__assoc_BANG_](ret, kvs[i], kvs[i + 1]);
        }
        return ret;
      }
    // fall through: an instance without -assoc! keeps the object behavior
    case OBJECT_TYPE:
      m[k] = v;
      for (let i = 0; i < kvs.length; i += 2) {
        m[kvs[i]] = kvs[i + 1];
      }
      break;
    default:
      throw new Error(
        `Illegal argument: assoc! expects a Map, Array, or Object as the first argument, but got ${typeof m}.`
      );
  }
  return m;
}
function copyMeta(from, to) {
  const f = from?.[IMeta__meta];
  if (f !== void 0) {
    to[IMeta__meta] = f;
    to[IWithMeta__with_meta] = from[IWithMeta__with_meta];
  }
  return to;
}
function copy(o) {
  switch (typeConst(o)) {
    case MAP_TYPE:
      return copyMeta(o, new o.constructor(o));
    case SET_TYPE:
      return copyMeta(o, new o.constructor(o));
    case ARRAY_TYPE:
      return copyMeta(o, [...o]);
    case INSTANCE_TYPE:
      return copyMeta(o, Object.assign(Object.create(Object.getPrototypeOf(o)), o));
    case OBJECT_TYPE:
      return copyMeta(o, { ...o });
    case LIST_TYPE:
      return copyMeta(o, new List(...o));
    default:
      throw new Error(`Don't know how to copy object of type ${typeof o}.`);
  }
}
function assoc(o, k, v, ...kvs) {
  if (arguments.length < 3 || kvs.length % 2 !== 0) {
    throw new Error("Illegal argument: assoc expects an odd number of arguments.");
  }
  if (o == null) {
    o = {};
  }
  if (!isObj(o) && !Array.isArray(o) && o[IAssociative__assoc] !== void 0) {
    let ret2 = o[IAssociative__assoc](o, k, v);
    for (let i = 0; i < kvs.length; i += 2) {
      ret2 = ret2[IAssociative__assoc](ret2, kvs[i], kvs[i + 1]);
    }
    return ret2;
  }
  const ret = copy(o);
  assoc_BANG_(ret, k, v, ...kvs);
  return ret;
}
function seq_to_map_for_destructuring(s) {
  const arr = Array.isArray(s) ? s : [...iterable(s)];
  const n = arr.length;
  if (n < 2) return n ? arr[0] : {};
  const m = {};
  for (let i = 0; i < n; i += 2) {
    if (i === n - 1) for (const [k, v] of iterable(arr[i])) m[k] = v;
    else m[arr[i]] = arr[i + 1];
  }
  return m;
}
var MAP_TYPE = 1;
var ARRAY_TYPE = 2;
var OBJECT_TYPE = 3;
var LIST_TYPE = 4;
var SET_TYPE = 5;
var LAZY_ITERABLE_TYPE = 6;
var INSTANCE_TYPE = 7;
var TYPE_TAG = /* @__PURE__ */ Symbol.for("squint.core/type");
var SORTED_TAG = /* @__PURE__ */ Symbol.for("squint.core/sorted");
var EDUCTION = /* @__PURE__ */ Symbol.for("squint.core/eduction");
// @__NO_SIDE_EFFECTS__
function defclass(c) {
  return c;
}
// @__NO_SIDE_EFFECTS__
function withApply(f, applyFn) {
  f.squint$lang$variadic = applyFn;
  return f;
}
function emptyOfType(type) {
  switch (type) {
    case MAP_TYPE:
      return /* @__PURE__ */ new Map();
    case ARRAY_TYPE:
      return [];
    case OBJECT_TYPE:
      return {};
    // Object.create?
    case LIST_TYPE:
      return new List();
    case SET_TYPE:
      return /* @__PURE__ */ new Set();
    case LAZY_ITERABLE_TYPE:
      return lazy(function* () {
        return;
      });
  }
  return void 0;
}
function isObj(coll) {
  return coll.constructor === Object;
}
function isVectorArray(x) {
  return Array.isArray(x) && x[TYPE_TAG] !== LIST_TYPE;
}
function object_QMARK_(coll) {
  return coll != null && isObj(coll);
}
function typeConst(obj) {
  if (obj == null) {
    return void 0;
  }
  if (isObj(obj)) {
    return OBJECT_TYPE;
  }
  if (obj instanceof Map) return MAP_TYPE;
  if (obj instanceof Set) return SET_TYPE;
  const tag = obj[TYPE_TAG];
  if (tag !== void 0) return tag;
  if (isVectorArray(obj)) return ARRAY_TYPE;
  if (typeof obj === "object") return INSTANCE_TYPE;
  return void 0;
}
function comp(...fs) {
  fs = fs.map(__toFn);
  if (fs.length === 0) {
    return identity;
  } else if (fs.length === 1) {
    return fs[0];
  }
  const [f, ...more] = fs.slice().reverse();
  return function(...args) {
    let x = f(...args);
    for (const g of more) {
      x = g(x);
    }
    return x;
  };
}
function conj_BANG_set(o, rest2) {
  for (const x of rest2) {
    o.add(x);
  }
  return o;
}
function conj_BANG_(...xs) {
  const n = xs.length;
  if (n === 0) {
    return vector();
  }
  if (n === 1) {
    return xs[0];
  }
  let o = xs[0];
  if (o === null || o === void 0) {
    o = [];
  }
  if (n === 2) {
    switch (typeConst(o)) {
      case ARRAY_TYPE:
        o.push(xs[1]);
        return o;
      case SET_TYPE:
        o.add(xs[1]);
        return o;
    }
  }
  const rest2 = xs.slice(1);
  switch (typeConst(o)) {
    case SET_TYPE:
      conj_BANG_set(o, rest2);
      break;
    case LIST_TYPE:
      o.unshift(...rest2.reverse());
      break;
    case ARRAY_TYPE:
      o.push(...rest2);
      break;
    case MAP_TYPE:
      for (const x of rest2) {
        if (isVectorArray(x)) {
          asMapEntry(x);
          o.set(x[0], x[1]);
        } else for (const kv of mapEntriesOf(x)) o.set(kv[0], kv[1]);
      }
      break;
    case INSTANCE_TYPE:
      if (o[ITransientCollection__conj_BANG_] !== void 0) {
        let acc = o[ITransientCollection__conj_BANG_](o, rest2[0]);
        for (let i = 1; i < rest2.length; i++) acc = conj_BANG_(acc, rest2[i]);
        return acc;
      }
    // fall through: an instance without -conj! keeps the object behavior
    case OBJECT_TYPE:
      for (const x of rest2) {
        if (isVectorArray(x)) {
          asMapEntry(x);
          o[x[0]] = x[1];
        } else for (const kv of mapEntriesOf(x)) o[kv[0]] = kv[1];
      }
      break;
    default:
      throw new Error(
        "Illegal argument: conj! expects a Set, Array, List, Map, or Object as the first argument."
      );
  }
  return o;
}
function* mapEntriesOf(x) {
  if (isMapLike(x)) {
    yield* iterable(x);
    return;
  }
  for (const kv of iterable(x)) {
    if (!isVectorArray(kv)) {
      throw new Error("conj on a map takes map entries or seqables of map entries");
    }
    yield kv;
  }
}
function asMapEntry(x) {
  if (x.length < 2) {
    throw new Error("Vector arg to map conj must be a pair");
  }
  return x;
}
function conj(...xs) {
  if (xs.length === 0) {
    return vector();
  }
  const [_o, ...rest2] = xs;
  if (rest2.length === 0) return _o;
  let o = _o;
  if (o === null || o === void 0) {
    o = list();
  }
  let m, o2;
  switch (typeConst(o)) {
    case SET_TYPE:
      if (o[SORTED_TAG]) {
        return copyMeta(o, conj_BANG_set(new o.constructor(o), rest2));
      } else {
        return copyMeta(o, new o.constructor([...o, ...rest2]));
      }
    case LIST_TYPE:
      return copyMeta(o, new List(...rest2.reverse(), ...o));
    case ARRAY_TYPE:
      return copyMeta(o, [...o, ...rest2]);
    case MAP_TYPE:
      m = new Map(o);
      for (const x of rest2) {
        if (isVectorArray(x)) {
          asMapEntry(x);
          m.set(x[0], x[1]);
        } else for (const kv of mapEntriesOf(x)) m.set(kv[0], kv[1]);
      }
      return copyMeta(o, m);
    case LAZY_ITERABLE_TYPE:
      return lazy(function* () {
        yield* rest2;
        yield* o;
      });
    case INSTANCE_TYPE:
      if (o[ICollection__conj] !== void 0) {
        o2 = o[ICollection__conj](o, rest2[0]);
        for (let i = 1; i < rest2.length; i++) o2 = conj(o2, rest2[i]);
        return o2;
      }
    // fall through: an instance without -conj keeps the object behavior
    case OBJECT_TYPE:
      o2 = { ...o };
      for (const x of rest2) {
        if (isVectorArray(x)) {
          asMapEntry(x);
          o2[x[0]] = x[1];
        } else for (const kv of mapEntriesOf(x)) o2[kv[0]] = kv[1];
      }
      return copyMeta(o, o2);
    default:
      throw new Error(
        "Illegal argument: conj expects a Set, Array, List, Map, or Object as the first argument."
      );
  }
}
function contains_QMARK_(coll, v) {
  if (typeof coll === "string") {
    return int_QMARK_(v) && v >= 0 && v < coll.length;
  }
  switch (typeConst(coll)) {
    case SET_TYPE:
    case MAP_TYPE:
      return coll.has(v);
    case void 0:
      return false;
    case INSTANCE_TYPE:
      if (coll[IAssociative__contains_key_QMARK_] !== void 0) {
        return !!coll[IAssociative__contains_key_QMARK_](coll, v);
      }
    // fall through
    default:
      return v in coll;
  }
}
function nth(coll, idx, orElse) {
  if (typeof idx !== "number") {
    throw new Error("Index argument to nth must be a number");
  }
  const hasDefault = arguments.length > 2;
  if (coll == null) return hasDefault ? orElse : null;
  if (Array.isArray(coll)) {
    if (idx >= 0 && idx < coll.length) {
      return coll[idx];
    }
  } else if (coll[IIndexed__nth] !== void 0) {
    return hasDefault ? coll[IIndexed__nth](coll, idx, orElse) : coll[IIndexed__nth](coll, idx);
  } else if (idx >= 0) {
    const next2 = chunkCursor(coll);
    let base = 0;
    let ch;
    while ((ch = next2()) !== null) {
      if (idx < base + ch.length) return ch[idx - base];
      base += ch.length;
    }
  }
  if (hasDefault) return orElse;
  throw new Error("Index out of bounds: " + idx);
}
function get(coll, key, otherwise = void 0) {
  if (coll == null) {
    return otherwise;
  }
  let v;
  if (isObj(coll)) {
    v = coll[key];
    if (v === void 0) {
      return otherwise;
    } else {
      return v;
    }
  }
  let g;
  switch (typeConst(coll)) {
    case SET_TYPE:
      if (coll.has(key)) v = key;
      break;
    case MAP_TYPE:
      v = coll.get(key);
      break;
    case ARRAY_TYPE:
      v = coll[key];
      break;
    default:
      if (coll[ILookup__lookup] !== void 0) {
        v = coll[ILookup__lookup](coll, key, otherwise);
        return v === void 0 ? otherwise : v;
      }
      g = coll["get"];
      if (typeof g === "function") {
        try {
          v = coll.get(key);
          break;
        } catch (e) {
        }
      }
      v = coll[key];
      break;
  }
  return v !== void 0 ? v : otherwise;
}
function sequential_QMARK_(x) {
  return Array.isArray(x) || x?.[TYPE_TAG] === LAZY_ITERABLE_TYPE || x?.[EDUCTION] !== void 0 || x != null && x[IVector.__sym] !== void 0;
}
function seqable_QMARK_(x) {
  return x === null || x === void 0 || // plain objects (squint maps) are seqable via Object.entries in `iterable`,
  // even though they lack Symbol.iterator.
  object_QMARK_(x) || // we used to check instanceof Object but this returns false for TC39 Records
  // also we used to write `Symbol.iterator in` but this does not work for strings and some other types
  !!x[Symbol.iterator] || !!x[ISEQABLE_SYM];
}
var MAP_ENTRY = /* @__PURE__ */ Symbol.for("squint.core/map-entry");
function tagMapEntry(e) {
  e[MAP_ENTRY] = true;
  return e;
}
function iterable(x) {
  if (x === null || x === void 0) {
    return [];
  }
  if (x[Symbol.iterator]) {
    return x;
  }
  if (x[ISeqable__seq] !== void 0) return iterable(x[ISeqable__seq](x));
  if (isObj(x)) return Object.entries(x).map(tagMapEntry);
  throw new TypeError(`${x} is not iterable`);
}
var IIterable = /* @__PURE__ */ Symbol.for("squint.core/IIterable");
function _iterator(coll) {
  return coll[Symbol.iterator]();
}
var es6_iterator = _iterator;
function seq(x) {
  if (x == null) return x;
  if (!seqable_QMARK_(x)) throw new TypeError(x + " is not ISeqable");
  if (typeof x === "string") return x.length ? [...x] : null;
  const iter = iterable(x);
  if (iter.length === 0 || iter.size === 0) {
    return null;
  }
  if (iter instanceof Set || iter[TYPE_TAG] === SET_TYPE) {
    return [...iter];
  }
  if (iter instanceof Map || iter[TYPE_TAG] === MAP_TYPE) {
    return [...iter].map(tagMapEntry);
  }
  if (iter[IMap__dissoc] !== void 0) {
    const entries = [...iter].map(tagMapEntry);
    return entries.length === 0 ? null : entries;
  }
  const _i = iter[Symbol.iterator]();
  if (_i.next().done) return null;
  return iter;
}
function first(coll) {
  if (coll == null) return void 0;
  if (Array.isArray(coll)) return coll[0];
  if (coll instanceof LazyIterable) {
    coll.force();
    return coll.chunk === null ? void 0 : coll.chunk[0];
  }
  const [first2] = iterable(coll);
  return first2;
}
function rest(coll) {
  const cell = chunkCells(coll);
  cell.force();
  const ch = cell.chunk;
  if (ch === null) return cell;
  if (ch.length > 1) {
    const c = new LazyIterable(null);
    c.realized = true;
    c.chunk = ch.slice(1);
    c._rest = cell._rest;
    return c;
  }
  return cell._rest;
}
var REDUCED_DEREF = (self) => self.value;
var Reduced = class {
  value;
  constructor(x) {
    this.value = x;
    this[IDeref__deref] = REDUCED_DEREF;
  }
};
function reduced(x) {
  return new Reduced(x);
}
function reduced_QMARK_(x) {
  return x instanceof Reduced;
}
function reduce(f, arg1, arg2) {
  f = __toFn(f);
  const hasInit = arguments.length !== 2;
  const coll = hasInit ? arg2 : arg1;
  let val = hasInit ? arg1 : void 0;
  if (Array.isArray(coll)) {
    let i2 = 0;
    if (!hasInit) {
      if (coll.length === 0) return f();
      val = coll[0];
      i2 = 1;
    }
    if (val instanceof Reduced) return val.value;
    for (; i2 < coll.length; i2++) {
      val = f(val, coll[i2]);
      if (val instanceof Reduced) return val.value;
    }
    return val;
  }
  const next2 = chunkCursor(coll);
  let ch = next2();
  let i = 0;
  if (!hasInit) {
    if (ch === null) return f();
    val = ch[0];
    i = 1;
  }
  if (val instanceof Reduced) return val.value;
  while (ch !== null) {
    for (; i < ch.length; i++) {
      val = f(val, ch[i]);
      if (val instanceof Reduced) return val.value;
    }
    ch = next2();
    i = 0;
  }
  return val;
}
var CHUNK_SIZE = 32;
var LazyIterable = /* @__PURE__ */ defclass(
  class LazyIterable2 {
    constructor(step) {
      this[TYPE_TAG] = LAZY_ITERABLE_TYPE;
      this[IIterable] = true;
      this.step = step;
      this.realized = false;
      this.chunk = null;
      this._rest = null;
    }
    force() {
      if (!this.realized) {
        this.realized = true;
        const r = this.step();
        this.step = null;
        if (r !== null && r !== void 0) {
          this.chunk = r[0];
          this._rest = new LazyIterable2(r[1]);
        }
      }
      return this;
    }
    [Symbol.iterator]() {
      let cell = this;
      let i = 0;
      return {
        next() {
          for (; ; ) {
            cell.force();
            const ch = cell.chunk;
            if (ch === null) return { value: void 0, done: true };
            if (i < ch.length) return { value: ch[i++], done: false };
            cell = cell._rest;
            i = 0;
          }
        },
        [Symbol.iterator]() {
          return this;
        }
      };
    }
    // Mirrors Array.prototype.indexOf so lazy seqs support (.indexOf coll x):
    // reference equality, returns -1 when absent. Unlike cljs.core, not by value.
    indexOf(x, fromIndex = 0) {
      let i = 0;
      for (const v of this) {
        if (i >= fromIndex && v === x) return i;
        i++;
      }
      return -1;
    }
  }
);
function unchunkedSteps(iter) {
  const step = () => {
    const r = iter.next();
    return r.done ? null : [[r.value], step];
  };
  return step;
}
function lazy(f) {
  return new LazyIterable(unchunkedSteps(f()));
}
function lazyIter(coll, gen) {
  const it = es6_iterator(iterable(coll));
  return lazy(() => gen(it));
}
function chunkCells(coll) {
  if (coll instanceof LazyIterable) return coll;
  if (Array.isArray(coll)) {
    const step = (pos) => () => {
      if (pos >= coll.length) return null;
      const end = Math.min(pos + CHUNK_SIZE, coll.length);
      return [coll.slice(pos, end), step(end)];
    };
    return new LazyIterable(step(0));
  }
  return new LazyIterable(unchunkedSteps(es6_iterator(iterable(coll))));
}
function chunkCursor(coll) {
  if (coll instanceof LazyIterable) {
    let cell = coll;
    return () => {
      if (cell === null) return null;
      cell.force();
      const ch = cell.chunk;
      cell = ch === null ? null : cell._rest;
      return ch;
    };
  }
  const it = es6_iterator(iterable(coll));
  return () => {
    const b = [];
    for (let i = 0; i < CHUNK_SIZE; i++) {
      const r = it.next();
      if (r.done) break;
      b.push(r.value);
    }
    return b.length === 0 ? null : b;
  };
}
function mapChunks(coll, xf) {
  const src = chunkCells(coll);
  const step = (cell, base) => () => {
    let c = cell;
    let b = base;
    for (; ; ) {
      c.force();
      const ch = c.chunk;
      if (ch === null) return null;
      const out = xf(ch, b);
      const rest2 = c._rest;
      b += ch.length;
      if (out.length !== 0) return [out, step(rest2, b)];
      c = rest2;
    }
  };
  return new LazyIterable(step(src, 0));
}
function map(f, ...colls) {
  f = __toFn(f);
  switch (colls.length) {
    case 0:
      return (rf) => {
        return (...args) => {
          switch (args.length) {
            case 0: {
              return rf();
            }
            case 1: {
              return rf(args[0]);
            }
            case 2: {
              return rf(args[0], f(args[1]));
            }
            default: {
              return rf(args[0], f(...args.slice(1)));
            }
          }
        };
      };
    case 1:
      return mapChunks(colls[0], (ch) => {
        const out = new Array(ch.length);
        for (let i = 0; i < ch.length; i++) out[i] = f(ch[i]);
        return out;
      });
    default: {
      const iters = colls.map((coll) => es6_iterator(iterable(coll)));
      return lazy(function* () {
        while (true) {
          const args = [];
          for (const i of iters) {
            const nextVal = i.next();
            if (nextVal.done) {
              return;
            }
            args.push(nextVal.value);
          }
          yield f(...args);
        }
      });
    }
  }
}
function transducer(step) {
  return (rf) => {
    const s = step(rf);
    return (...args) => args.length === 0 ? rf() : args.length === 1 ? rf(args[0]) : s(args[0], args[1]);
  };
}
function filter1(pred) {
  return transducer((rf) => (r, x) => truth_(pred(x)) ? rf(r, x) : r);
}
function filter(pred, coll) {
  if (arguments.length === 1) {
    return filter1(pred);
  }
  pred = __toFn(pred);
  return mapChunks(coll, (ch) => {
    const out = [];
    for (let i = 0; i < ch.length; i++) {
      const x = ch[i];
      if (truth_(pred(x))) out.push(x);
    }
    return out;
  });
}
function remove(pred, coll) {
  if (arguments.length === 1) {
    return filter1(complement(pred));
  }
  return filter(complement(pred), coll);
}
function map_indexed1(f) {
  return transducer((rf) => {
    let i = -1;
    return (r, x) => rf(r, f(++i, x));
  });
}
function map_indexed(f, coll) {
  f = __toFn(f);
  if (arguments.length === 1) {
    return map_indexed1(f);
  }
  return mapChunks(coll, (ch, base) => {
    const out = new Array(ch.length);
    for (let i = 0; i < ch.length; i++) out[i] = f(base + i, ch[i]);
    return out;
  });
}
function not(expr) {
  return !truth_(expr);
}
var ISEQABLE_SYM = /* @__PURE__ */ Symbol.for("squint.core/ISeqable");
var IDeref__deref = /* @__PURE__ */ Symbol.for("squint.core/-deref");
var ISeqable__seq = /* @__PURE__ */ Symbol.for("squint.core/-seq");
var ILookup__lookup = /* @__PURE__ */ Symbol.for("squint.core/-lookup");
var IAssociative__assoc = /* @__PURE__ */ Symbol.for("squint.core/-assoc");
var IAssociative__contains_key_QMARK_ = /* @__PURE__ */ Symbol.for("squint.core/-contains-key?");
var IMap__dissoc = /* @__PURE__ */ Symbol.for("squint.core/-dissoc");
var ICounted__count = /* @__PURE__ */ Symbol.for("squint.core/-count");
var ICollection__conj = /* @__PURE__ */ Symbol.for("squint.core/-conj");
var IEmptyableCollection__empty = /* @__PURE__ */ Symbol.for("squint.core/-empty");
var IEquiv__equiv = /* @__PURE__ */ Symbol.for("squint.core/-equiv");
var ITransientCollection__conj_BANG_ = /* @__PURE__ */ Symbol.for("squint.core/-conj!");
var ITransientAssociative__assoc_BANG_ = /* @__PURE__ */ Symbol.for("squint.core/-assoc!");
var IMeta__meta = /* @__PURE__ */ Symbol.for("squint.core/-meta");
var IWithMeta__with_meta = /* @__PURE__ */ Symbol.for("squint.core/-with-meta");
var M3_C1 = 3432918353 | 0;
var M3_C2 = 461845907 | 0;
var IIndexed__nth = /* @__PURE__ */ Symbol.for("squint.core/-nth");
var IVector = { __sym: /* @__PURE__ */ Symbol.for("squint.core/IVector") };
function range(begin, end, step) {
  let b = begin, e = end, s = step;
  if (end === void 0) {
    b = 0;
    e = begin;
  }
  const start = b || 0;
  s = step ?? 1;
  const ascending = s >= 0;
  const more = (i) => e === void 0 || ascending && i < e || !ascending && e < i;
  const mkStep = (from) => () => {
    if (!more(from)) return null;
    const out = [];
    let i = from;
    while (out.length < CHUNK_SIZE && more(i)) {
      out.push(i);
      i += s;
    }
    return [out, mkStep(i)];
  };
  return new LazyIterable(mkStep(start));
}
function re_matches(re, s) {
  const matches = re.exec(s);
  if (matches && s === matches[0]) {
    if (matches.length === 1) {
      return matches[0];
    } else {
      return matches;
    }
  }
  return null;
}
function vector(...args) {
  return args;
}
function vector_QMARK_(x) {
  if (x == null) return false;
  return isVectorArray(x) || x[IVector.__sym] !== void 0;
}
function mapv(...args) {
  if (args.length === 2) {
    const [_f, coll] = args;
    const f = __toFn(_f);
    const iter = iterable(coll);
    if (Array.isArray(iter)) {
      const ret = new Array(iter.length);
      for (var i = 0; i < iter.length; i++) {
        ret[i] = f(iter[i]);
      }
      return ret;
    } else {
      const ret = [];
      const next2 = chunkCursor(iter);
      let ch;
      while ((ch = next2()) !== null) {
        for (let i2 = 0; i2 < ch.length; i2++) ret.push(f(ch[i2]));
      }
      return ret;
    }
  }
  return [...map(...args)];
}
function pushAll(out, from) {
  if (from instanceof LazyIterable) {
    let cell = from;
    for (; ; ) {
      cell.force();
      const ch = cell.chunk;
      if (ch === null) return out;
      Array.prototype.push.apply(out, ch);
      cell = cell._rest;
    }
  }
  for (const x of iterable(from)) out.push(x);
  return out;
}
function vec(x) {
  if (isVectorArray(x)) return x;
  if (x != null && x[IVector.__sym] !== void 0) return x;
  return pushAll([], x);
}
function complement(f) {
  f = __toFn(f);
  return (...args) => not(f(...args));
}
var List = class extends Array {
  constructor(...args) {
    super();
    this[TYPE_TAG] = LIST_TYPE;
    this.push(...args);
  }
};
function list(...args) {
  return new List(...args);
}
function array_QMARK_(x) {
  return Array.isArray(x);
}
var CONCAT_DONE = {};
function concat1(colls) {
  const isArr = Array.isArray(colls);
  const arr = isArr ? colls.slice() : null;
  const collIter = isArr ? null : es6_iterator(iterable(colls));
  let idx = 0;
  const nextColl = () => {
    if (isArr) {
      if (idx >= arr.length) return CONCAT_DONE;
      const c = arr[idx];
      arr[idx] = null;
      idx++;
      return c;
    }
    const r = collIter.next();
    return r.done ? CONCAT_DONE : r.value;
  };
  const step = (src) => () => {
    for (; ; ) {
      if (src !== null) {
        if (src instanceof LazyIterable) {
          src.force();
          if (src.chunk !== null) return [src.chunk, step(src._rest)];
          src = null;
        } else {
          const a = src.a;
          const pos = src.pos;
          if (pos < a.length) {
            const end = Math.min(pos + CHUNK_SIZE, a.length);
            return [a.slice(pos, end), step({ a, pos: end })];
          }
          src = null;
        }
      }
      const nc = nextColl();
      if (nc === CONCAT_DONE) return null;
      src = nc instanceof LazyIterable ? nc : Array.isArray(nc) ? { a: nc, pos: 0 } : chunkCells(nc);
    }
  };
  return new LazyIterable(step(null));
}
var concat = /* @__PURE__ */ withApply(
  (...colls) => concat1(colls),
  (colls) => concat1(colls)
  // lazy seqable argument
);
function mapcat(f, ...colls) {
  if (colls.length === 0) {
    return comp(map(f), cat);
  }
  return concat1(map(f, ...colls));
}
function identity(x) {
  return x;
}
function empty(coll) {
  const type = typeConst(coll);
  if (type != null) {
    if (type === INSTANCE_TYPE) {
      if (coll[IEmptyableCollection__empty] !== void 0) return coll[IEmptyableCollection__empty](coll);
      return coll.constructor === void 0 ? copyMeta(coll, {}) : null;
    }
    return copyMeta(coll, emptyOfType(type));
  }
  return null;
}
function merge(...args) {
  if (!args.some(truth_)) return null;
  const firstArg = args[0];
  let obj;
  if (firstArg === null || firstArg === void 0) {
    obj = {};
  } else if (typeConst(firstArg) === void 0) {
    obj = firstArg;
  } else if (firstArg[ICollection__conj] !== void 0) {
    obj = firstArg;
  } else {
    obj = into(empty(firstArg), firstArg);
  }
  if (obj != null && obj[ICollection__conj] !== void 0) {
    for (let i = 1; i < args.length; i++) {
      obj = obj != null && obj[ICollection__conj] !== void 0 ? obj[ICollection__conj](obj, args[i]) : conj_BANG_(obj, args[i]);
    }
    return obj;
  }
  return conj_BANG_(obj, ...args.slice(1));
}
function into(...args) {
  let to, xform, from, c, rf;
  switch (args.length) {
    case 0:
      return [];
    case 1:
      return args[0];
    case 2:
      to = args[0] ?? [];
      if (isVectorArray(to)) {
        return pushAll(copy(to), args[1]);
      }
      if (to[ICollection__conj] !== void 0) {
        return reduce(
          (acc, x) => acc != null && acc[ICollection__conj] !== void 0 ? acc[ICollection__conj](acc, x) : conj_BANG_(acc, x),
          to,
          args[1]
        );
      }
      return reduce(conj_BANG_, copy(to), args[1]);
    case 3:
      to = args[0];
      xform = args[1];
      from = args[2];
      c = to != null && to[ICollection__conj] !== void 0 ? to : copy(to);
      rf = (coll, v) => {
        if (v === void 0) {
          return coll;
        }
        return coll != null && coll[ICollection__conj] !== void 0 ? coll[ICollection__conj](coll, v) : conj_BANG_(coll, v);
      };
      return transduce(xform, rf, c, from);
    default:
      throw TypeError(`Invalid arity call of into: ${args.length}`);
  }
}
function ensure_reduced(x) {
  if (reduced_QMARK_(x)) {
    return x;
  } else {
    return reduced(x);
  }
}
function take1(n) {
  return transducer((rf) => {
    let na = n;
    return (r, x) => {
      const nn = --na + 1;
      if (nn > 0) r = rf(r, x);
      return nn > 1 ? r : ensure_reduced(r);
    };
  });
}
function assertNumber(n) {
  if (typeof n !== "number") {
    throw new Error("Assert failed: (number? n)");
  }
  return n;
}
function take(n, coll) {
  assertNumber(n);
  if (arguments.length === 1) {
    return take1(n);
  }
  return lazyIter(coll, function* (it) {
    let i = n - 1;
    for (const x of it) {
      if (i-- >= 0) {
        yield x;
      }
      if (i < 0) {
        return;
      }
    }
  });
}
function every_QMARK_(pred, coll) {
  pred = __toFn(pred);
  if (Array.isArray(coll)) {
    for (let i = 0; i < coll.length; i++) if (!pred(coll[i])) return false;
    return true;
  }
  const next2 = chunkCursor(coll);
  let ch;
  while ((ch = next2()) !== null) {
    for (let i = 0; i < ch.length; i++) if (!pred(ch[i])) return false;
  }
  return true;
}
function some(pred, coll) {
  pred = __toFn(pred);
  if (Array.isArray(coll)) {
    for (let i = 0; i < coll.length; i++) {
      const res = pred(coll[i]);
      if (truth_(res)) return res;
    }
    return void 0;
  }
  const next2 = chunkCursor(coll);
  let ch;
  while ((ch = next2()) !== null) {
    for (let i = 0; i < ch.length; i++) {
      const res = pred(ch[i]);
      if (truth_(res)) return res;
    }
  }
  return void 0;
}
function empty_QMARK_(coll) {
  return seq(coll) ? false : true;
}
function count(coll) {
  if (!coll) return 0;
  const len = coll.length || coll.size;
  if (typeof len === "number") {
    return len;
  }
  if (coll[ICounted__count] !== void 0) return coll[ICounted__count](coll);
  const next2 = chunkCursor(coll);
  let ret = 0;
  let ch;
  while ((ch = next2()) !== null) ret += ch.length;
  return ret;
}
function next(x) {
  if (Array.isArray(x)) {
    const ret = x.slice(1);
    if (ret.length > 0) {
      return ret;
    } else {
      return null;
    }
  } else {
    return seq(rest(x));
  }
}
function truth_(x) {
  return x != null && x !== false;
}
function string_QMARK_(s) {
  return typeof s === "string";
}
function int_QMARK_(x) {
  return Number.isInteger(x);
}
function transduce(xform, ...args) {
  switch (args.length) {
    case 2: {
      const f = args[0];
      const coll = args[1];
      return transduce(xform, f, f(), coll);
    }
    default: {
      let f = args[0];
      const init = args[1];
      const coll = args[2];
      f = xform(f);
      const ret = reduce(f, init, coll);
      return f(ret);
    }
  }
}
function zipmap(keys, vals) {
  const res = {};
  const keyIterator = iterable(keys)[Symbol.iterator]();
  const valIterator = iterable(vals)[Symbol.iterator]();
  let nextKey, nextVal;
  for (; ; ) {
    nextKey = keyIterator.next();
    if (nextKey.done) break;
    nextVal = valIterator.next();
    if (nextVal.done) break;
    res[nextKey.value] = nextVal.value;
  }
  return res;
}
function preserving_reduced(rf) {
  return (a1, a2) => {
    const ret = rf(a1, a2);
    if (reduced_QMARK_(ret)) {
      return reduced(ret);
    } else return ret;
  };
}
function cat(rf) {
  const rrf = preserving_reduced(rf);
  return (...args) => {
    switch (args.length) {
      case 0:
        return rf();
      case 1:
        return rf(args[0]);
      case 2:
        return reduce(rrf, args[0], args[1]);
    }
  };
}

// node_modules/highlight.js/es/core.js
var import_core = __toESM(require_core(), 1);
var core_default = import_core.default;

// node_modules/highlight.js/es/languages/clojure.js
function clojure(hljs) {
  const SYMBOLSTART = "a-zA-Z_\\-!.?+*=<>&'";
  const SYMBOL_RE = "[#]?[" + SYMBOLSTART + "][" + SYMBOLSTART + "0-9/;:$#]*";
  const globals = "def defonce defprotocol defstruct defmulti defmethod defn- defn defmacro deftype defrecord";
  const keywords = {
    $pattern: SYMBOL_RE,
    built_in: (
      // Clojure keywords
      globals + " cond apply if-not if-let if not not= =|0 <|0 >|0 <=|0 >=|0 ==|0 +|0 /|0 *|0 -|0 rem quot neg? pos? delay? symbol? keyword? true? false? integer? empty? coll? list? set? ifn? fn? associative? sequential? sorted? counted? reversible? number? decimal? class? distinct? isa? float? rational? reduced? ratio? odd? even? char? seq? vector? string? map? nil? contains? zero? instance? not-every? not-any? libspec? -> ->> .. . inc compare do dotimes mapcat take remove take-while drop letfn drop-last take-last drop-while while intern condp case reduced cycle split-at split-with repeat replicate iterate range merge zipmap declare line-seq sort comparator sort-by dorun doall nthnext nthrest partition eval doseq await await-for let agent atom send send-off release-pending-sends add-watch mapv filterv remove-watch agent-error restart-agent set-error-handler error-handler set-error-mode! error-mode shutdown-agents quote var fn loop recur throw try monitor-enter monitor-exit macroexpand macroexpand-1 for dosync and or when when-not when-let comp juxt partial sequence memoize constantly complement identity assert peek pop doto proxy first rest cons cast coll last butlast sigs reify second ffirst fnext nfirst nnext meta with-meta ns in-ns create-ns import refer keys select-keys vals key val rseq name namespace promise into transient persistent! conj! assoc! dissoc! pop! disj! use class type num float double short byte boolean bigint biginteger bigdec print-method print-dup throw-if printf format load compile get-in update-in pr pr-on newline flush read slurp read-line subvec with-open memfn time re-find re-groups rand-int rand mod locking assert-valid-fdecl alias resolve ref deref refset swap! reset! set-validator! compare-and-set! alter-meta! reset-meta! commute get-validator alter ref-set ref-history-count ref-min-history ref-max-history ensure sync io! new next conj set! to-array future future-call into-array aset gen-class reduce map filter find empty hash-map hash-set sorted-map sorted-map-by sorted-set sorted-set-by vec vector seq flatten reverse assoc dissoc list disj get union difference intersection extend extend-type extend-protocol int nth delay count concat chunk chunk-buffer chunk-append chunk-first chunk-rest max min dec unchecked-inc-int unchecked-inc unchecked-dec-inc unchecked-dec unchecked-negate unchecked-add-int unchecked-add unchecked-subtract-int unchecked-subtract chunk-next chunk-cons chunked-seq? prn vary-meta lazy-seq spread list* str find-keyword keyword symbol gensym force rationalize"
    )
  };
  const SYMBOL = {
    begin: SYMBOL_RE,
    relevance: 0
  };
  const NUMBER = {
    scope: "number",
    relevance: 0,
    variants: [
      { match: /[-+]?0[xX][0-9a-fA-F]+N?/ },
      // hexadecimal                 // 0x2a
      { match: /[-+]?0[0-7]+N?/ },
      // octal                       // 052
      { match: /[-+]?[1-9][0-9]?[rR][0-9a-zA-Z]+N?/ },
      // variable radix from 2 to 36 // 2r101010, 8r52, 36r16
      { match: /[-+]?[0-9]+\/[0-9]+N?/ },
      // ratio                       // 1/2
      { match: /[-+]?[0-9]+((\.[0-9]*([eE][+-]?[0-9]+)?M?)|([eE][+-]?[0-9]+M?|M))/ },
      // float        // 0.42 4.2E-1M 42E1 42M
      { match: /[-+]?([1-9][0-9]*|0)N?/ }
      // int (don't match leading 0) // 42 42N
    ]
  };
  const CHARACTER = {
    scope: "character",
    variants: [
      { match: /\\o[0-3]?[0-7]{1,2}/ },
      // Unicode Octal 0 - 377
      { match: /\\u[0-9a-fA-F]{4}/ },
      // Unicode Hex 0000 - FFFF
      { match: /\\(newline|space|tab|formfeed|backspace|return)/ },
      // special characters
      {
        match: /\\\S/,
        relevance: 0
      }
      // any non-whitespace char
    ]
  };
  const REGEX = {
    scope: "regex",
    begin: /#"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  const STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, { illegal: null });
  const COMMA = {
    scope: "punctuation",
    match: /,/,
    relevance: 0
  };
  const COMMENT = hljs.COMMENT(
    ";",
    "$",
    { relevance: 0 }
  );
  const LITERAL = {
    className: "literal",
    begin: /\b(true|false|nil)\b/
  };
  const COLLECTION = {
    begin: "\\[|(#::?" + SYMBOL_RE + ")?\\{",
    end: "[\\]\\}]",
    relevance: 0
  };
  const KEY = {
    className: "symbol",
    begin: "[:]{1,2}" + SYMBOL_RE
  };
  const LIST = {
    begin: "\\(",
    end: "\\)"
  };
  const BODY = {
    endsWithParent: true,
    relevance: 0
  };
  const NAME = {
    keywords,
    className: "name",
    begin: SYMBOL_RE,
    relevance: 0,
    starts: BODY
  };
  const DEFAULT_CONTAINS = [
    COMMA,
    LIST,
    CHARACTER,
    REGEX,
    STRING,
    COMMENT,
    KEY,
    COLLECTION,
    NUMBER,
    LITERAL,
    SYMBOL
  ];
  const GLOBAL = {
    beginKeywords: globals,
    keywords: {
      $pattern: SYMBOL_RE,
      keyword: globals
    },
    end: '(\\[|#|\\d|"|:|\\{|\\)|\\(|$)',
    contains: [
      {
        className: "title",
        begin: SYMBOL_RE,
        relevance: 0,
        excludeEnd: true,
        // we can only have a single title
        endsParent: true
      }
    ].concat(DEFAULT_CONTAINS)
  };
  LIST.contains = [
    GLOBAL,
    NAME,
    BODY
  ];
  BODY.contains = DEFAULT_CONTAINS;
  COLLECTION.contains = DEFAULT_CONTAINS;
  return {
    name: "Clojure",
    aliases: [
      "clj",
      "edn"
    ],
    illegal: /\S/,
    contains: [
      COMMA,
      LIST,
      CHARACTER,
      REGEX,
      STRING,
      COMMENT,
      KEY,
      COLLECTION,
      NUMBER,
      LITERAL
    ]
  };
}

// node_modules/squint-cljs/src/squint/string.js
function blank_QMARK_(s) {
  if (s == null) return true;
  if (typeof s !== "string") return false;
  if (s.length === 0) return true;
  if (s.trimStart().length === 0) return true;
  return false;
}
function join(sep, coll) {
  if (coll === void 0) {
    coll = sep;
    sep = "";
  }
  if (coll instanceof Array) {
    return coll.join(sep);
  }
  let ret = "";
  let addSep = false;
  for (const o of iterable(coll)) {
    if (addSep) ret += sep;
    ret += o;
    addSep = true;
  }
  return ret;
}
function trim(s) {
  return s.trim();
}
function trimr(s) {
  return s.trimEnd();
}
function discardTrailingIfNeeded(limit, v) {
  if ((limit == null || limit === 0) && v.length > 1) {
    for (; ; )
      if (v[v.length - 1] === "") {
        v.pop();
      } else break;
  }
  return v;
}
function split(s, re, limit) {
  if (limit == null || limit < 1) {
    return discardTrailingIfNeeded(limit, s.split(re));
  }
  const parts = [];
  let rem = s;
  while (limit > 1) {
    const m = rem.match(re);
    if (m == null) break;
    const idx = m.index;
    parts.push(rem.substring(0, idx));
    rem = rem.substring(idx + m[0].length);
    limit--;
  }
  parts.push(rem);
  return parts;
}

// src/main.jsx
const eval_tool = "mcp__clojure-mcp__clojure_eval";
const ns_line = /\*=+ [^*\n]+ =+\*/;
const toggles = ["request", "response", "highlight"];
const defaults = { "request": true, "response": true, "highlight": true, "fold": 10 };
const usage = `${"Usage: /clj-view [request|response|highlight] [on|off]\n"}${"       /clj-view fold [<lines>|off]"}`;
const describe = function(settings) {
  return `${join(" \xB7 ", map((function(_PERCENT_1) {
    return `${_PERCENT_1 ?? ""}${(truth_(get(settings, _PERCENT_1)) ? " on" : " off") ?? ""}`;
  }), toggles)) ?? ""}${" \xB7 fold "}${(() => {
    const or_1_2 = get(settings, "fold");
    if (truth_(or_1_2)) {
      return or_1_2;
    } else {
      return "off";
    }
    ;
  })() ?? ""}`;
};
const parse_setting = function(option, value) {
  if (truth_((() => {
    const and_1_2 = some((function(_PERCENT_1) {
      return _EQ_(option, _PERCENT_1);
    }), toggles);
    if (truth_(and_1_2)) {
      return contains_QMARK_(/* @__PURE__ */ new Set(["on", "off"]), value);
    } else {
      return and_1_2;
    }
    ;
  })())) {
    return [option, value === "on"];
  } else {
    if (option === "fold" && value === "off") {
      return ["fold", false];
    } else {
      if (truth_(option === "fold" && re_matches(/[1-9]\d*/, `${value ?? ""}`))) {
        return ["fold", parseInt(value)];
      } else {
        return null;
      }
    }
  }
  ;
};
const read_settings = async function($) {
  return merge(defaults, get(await $.state.get({ "plugin": "clojure-mcp-view", "key": "settings" }), "value"));
};
const write_settings = async function($, settings) {
  return await $.state.set({ "plugin": "clojure-mcp-view", "key": "settings" }, settings);
};
const output_text = function(output) {
  if (string_QMARK_(output)) {
    return output;
  } else {
    const blocks_1 = array_QMARK_(output) ? output : get(output, "content");
    if (array_QMARK_(blocks_1) && every_QMARK_((function(_PERCENT_1) {
      return "text" === get(_PERCENT_1, "type");
    }), blocks_1)) {
      return join("\n", map("text", blocks_1));
    }
    ;
  }
  ;
};
const form_outputs = function(text) {
  return remove(blank_QMARK_, text.split(ns_line));
};
const response_items = function(text) {
  return into([], mapcat((function(body) {
    const vec___1_4 = body.split(/^=> /m);
    const seq___2_5 = seq(vec___1_4);
    const first___3_6 = first(seq___2_5);
    const seq___2_7 = next(seq___2_5);
    const printed_8 = first___3_6;
    const values_9 = seq___2_7;
    return concat(truth_(blank_QMARK_(printed_8)) ? null : [{ "kind": "printed", "text": trim(printed_8) }], map((function(v) {
      return { "kind": "value", "text": trimr(v) };
    }), values_9));
  })), form_outputs(text));
};
const fold_items = function(items, limit) {
  let items_1 = items;
  let room_2 = limit;
  let shown_3 = [];
  let hidden_4 = 0;
  while (true) {
    if (empty_QMARK_(items_1)) {
      return { "shown": shown_3, "hidden": hidden_4 };
    } else {
      const item_5 = first(items_1);
      const lines_6 = get(item_5, "text").split("\n");
      const n_7 = count(lines_6);
      if (n_7 <= room_2) {
        let G__8 = rest(items_1);
        let G__9 = room_2 - n_7;
        let G__10 = conj(shown_3, item_5);
        let G__11 = hidden_4;
        items_1 = G__8;
        room_2 = G__9;
        shown_3 = G__10;
        hidden_4 = G__11;
        continue;
      } else {
        if (room_2 > 0) {
          const cut_12 = assoc(item_5, "text", join("\n", take(room_2, lines_6)));
          let G__13 = rest(items_1);
          let G__14 = 0;
          let G__15 = conj(shown_3, cut_12);
          let G__16 = hidden_4 + (n_7 - room_2);
          items_1 = G__13;
          room_2 = G__14;
          shown_3 = G__15;
          hidden_4 = G__16;
          continue;
        } else {
          if ("else") {
            let G__17 = rest(items_1);
            let G__18 = 0;
            let G__19 = shown_3;
            let G__20 = hidden_4 + n_7;
            items_1 = G__17;
            room_2 = G__18;
            shown_3 = G__19;
            hidden_4 = G__20;
            continue;
          } else {
            return null;
          }
        }
      }
      ;
    }
    ;
    ;
    break;
  }
  ;
};
const folded = async function($, section_id, items, fold) {
  const map___1_3 = truth_(fold) ? fold_items(items, fold) : { "shown": items, "hidden": 0 };
  const map___1_4 = truth_(sequential_QMARK_(map___1_3)) ? truth_(vector_QMARK_(map___1_3)) ? map___1_3 : seq_to_map_for_destructuring(map___1_3) : map___1_3;
  const folded_5 = map___1_4;
  const hidden_6 = get(map___1_4, "hidden");
  const unfolded_QMARK__7 = hidden_6 > 0 && get(await $.state.get({ "plugin": "clojure-mcp-view", "key": "unfolded", "id": section_id }), "value");
  if (truth_(unfolded_QMARK__7)) {
    return { "shown": items, "hidden": hidden_6, "unfolded?": true };
  } else {
    return folded_5;
  }
  ;
};
const fold_toggle = function(p__1, $, section_id, p__2) {
  const map___1_5 = p__1;
  const map___1_6 = truth_(sequential_QMARK_(map___1_5)) ? truth_(vector_QMARK_(map___1_5)) ? map___1_5 : seq_to_map_for_destructuring(map___1_5) : map___1_5;
  const Button_7 = get(map___1_6, "Button");
  const map___3_8 = p__2;
  const map___3_9 = truth_(sequential_QMARK_(map___3_8)) ? truth_(vector_QMARK_(map___3_8)) ? map___3_8 : seq_to_map_for_destructuring(map___3_8) : map___3_8;
  const hidden_10 = get(map___3_9, "hidden");
  const unfolded_QMARK__11 = get(map___3_9, "unfolded?");
  if (hidden_10 > 0) {
    const label_12 = truth_(unfolded_QMARK__11) ? "(click to fold)" : `${"\u2026 +"}${hidden_10 ?? ""}${(1 === hidden_10 ? " line" : " lines") ?? ""}${" (click to expand)"}`;
    return <Button_7 key={section_id} plain={true} dimColor={true} onPress={(function() {
      return $.state.set({ "plugin": "clojure-mcp-view", "key": "unfolded", "id": section_id }, not(unfolded_QMARK__11));
    })}>{label_12}</Button_7>;
  }
  ;
};
core_default.registerLanguage("clojure", clojure);
const palette = zipmap(["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "bright-black", "bright-red", "bright-green", "bright-yellow", "bright-blue", "bright-magenta", "bright-cyan", "bright-white"], map((function(_PERCENT_1) {
  return `${"ansi256("}${_PERCENT_1 ?? ""}${")"}`;
}), range(16)));
const scope_colors = { "string": get(palette, "green"), "regex": get(palette, "green"), "name": get(palette, "bright-blue"), "character": get(palette, "green"), "built_in": get(palette, "bright-blue"), "keyword": get(palette, "bright-blue"), "number": get(palette, "yellow"), "symbol": get(palette, "cyan"), "comment": get(palette, "bright-black"), "literal": get(palette, "magenta") };
const scope_spans = function(node, parent_scope) {
  const scope_1 = (() => {
    const or_2_3 = node.scope;
    if (truth_(or_2_3)) {
      return or_2_3;
    } else {
      return parent_scope;
    }
    ;
  })();
  return into([], mapcat((function(_PERCENT_1) {
    if (string_QMARK_(_PERCENT_1)) {
      return [{ "text": _PERCENT_1, "color": get(scope_colors, scope_1) }];
    } else {
      return scope_spans(_PERCENT_1, scope_1);
    }
    ;
  })), node.children);
};
const clojure_spans = function(source) {
  return scope_spans(core_default.highlight(source, { "language": "clojure", "ignoreIllegals": true })._emitter.rootNode, null);
};
const clj_view = function(p__3, highlight_QMARK_, source) {
  const map___1_3 = p__3;
  const map___1_4 = truth_(sequential_QMARK_(map___1_3)) ? truth_(vector_QMARK_(map___1_3)) ? map___1_3 : seq_to_map_for_destructuring(map___1_3) : map___1_3;
  const Text_5 = get(map___1_4, "Text");
  if (truth_(highlight_QMARK_)) {
    return <Text_5>{vec(map_indexed((function(i, p__4) {
      const map___6_8 = p__4;
      const map___6_9 = truth_(sequential_QMARK_(map___6_8)) ? truth_(vector_QMARK_(map___6_8)) ? map___6_8 : seq_to_map_for_destructuring(map___6_8) : map___6_8;
      const text_10 = get(map___6_9, "text");
      const color_11 = get(map___6_9, "color");
      if (truth_(color_11)) {
        return <Text_5 key={`${i ?? ""}`} color={color_11}>{text_10}</Text_5>;
      } else {
        return text_10;
      }
      ;
    }), clojure_spans(source)))}</Text_5>;
  } else {
    return <Text_5>{source}</Text_5>;
  }
  ;
};
const item_view = function(p__5, highlight_QMARK_, p__6) {
  const map___1_5 = p__5;
  const map___1_6 = truth_(sequential_QMARK_(map___1_5)) ? truth_(vector_QMARK_(map___1_5)) ? map___1_5 : seq_to_map_for_destructuring(map___1_5) : map___1_5;
  const ui_7 = map___1_6;
  const Box_8 = get(map___1_6, "Box");
  const Text_9 = get(map___1_6, "Text");
  const map___3_10 = p__6;
  const map___3_11 = truth_(sequential_QMARK_(map___3_10)) ? truth_(vector_QMARK_(map___3_10)) ? map___3_10 : seq_to_map_for_destructuring(map___3_10) : map___3_10;
  const kind_12 = get(map___3_11, "kind");
  const text_13 = get(map___3_11, "text");
  const G__7_14 = kind_12;
  switch (G__7_14) {
    case "printed":
      return <Text_9>{text_13}</Text_9>;
      break;
    case "value":
      return <Box_8 flexDirection="row"><Text_9 dimColor={true}>=&gt; </Text_9>{clj_view(ui_7, highlight_QMARK_, text_13)}</Box_8>;
      break;
    default:
      throw new Error(`${"No matching clause: "}${G__7_14 ?? ""}`);
  }
  ;
};
const on_row = async function($, e, next2) {
  const map___1_3 = get(e, "props");
  const map___1_4 = truth_(sequential_QMARK_(map___1_3)) ? truth_(vector_QMARK_(map___1_3)) ? map___1_3 : seq_to_map_for_destructuring(map___1_3) : map___1_3;
  const tool_5 = get(map___1_4, "tool");
  const input_6 = get(map___1_4, "input");
  const isExpanded_7 = get(map___1_4, "isExpanded");
  const tool_use_id_8 = get(map___1_4, "tool_use_id");
  const code_9 = get(input_6, "code");
  if (not(_EQ_(tool_5, eval_tool) && (truth_(isExpanded_7) ? string_QMARK_(code_9) : isExpanded_7))) {
    return next2(e);
  } else {
    const map___10_12 = await read_settings($);
    const map___10_13 = truth_(sequential_QMARK_(map___10_12)) ? truth_(vector_QMARK_(map___10_12)) ? map___10_12 : seq_to_map_for_destructuring(map___10_12) : map___10_12;
    const request_14 = get(map___10_13, "request");
    const highlight_15 = get(map___10_13, "highlight");
    const fold_16 = get(map___10_13, "fold");
    if (not(request_14)) {
      return next2(e);
    } else {
      const map___17_19 = $.ui.resolve(e);
      const map___17_20 = truth_(sequential_QMARK_(map___17_19)) ? truth_(vector_QMARK_(map___17_19)) ? map___17_19 : seq_to_map_for_destructuring(map___17_19) : map___17_19;
      const ui_21 = map___17_20;
      const Box_22 = get(map___17_20, "Box");
      const section_id_23 = `${tool_use_id_8 ?? ""}${":request"}`;
      const section_24 = await folded($, section_id_23, [{ "text": code_9 }], fold_16);
      const row_25 = await next2(e);
      return <Box_22 flexDirection="column">{row_25}<Box_22 flexDirection="column" paddingLeft={2} marginY={1}>{clj_view(ui_21, highlight_15, ";; Request:")}{mapv((function(_PERCENT_1) {
        return clj_view(ui_21, highlight_15, get(_PERCENT_1, "text"));
      }), get(section_24, "shown"))}{fold_toggle(ui_21, $, section_id_23, section_24)}</Box_22></Box_22>;
    }
    ;
  }
  ;
};
const on_result = async function($, e, next2) {
  const map___1_3 = get(e, "props");
  const map___1_4 = truth_(sequential_QMARK_(map___1_3)) ? truth_(vector_QMARK_(map___1_3)) ? map___1_3 : seq_to_map_for_destructuring(map___1_3) : map___1_3;
  const tool_5 = get(map___1_4, "tool");
  const output_6 = get(map___1_4, "output");
  const isExpanded_7 = get(map___1_4, "isExpanded");
  const isErrored_8 = get(map___1_4, "isErrored");
  const tool_use_id_9 = get(map___1_4, "tool_use_id");
  const text_10 = output_text(output_6);
  if (not(_EQ_(tool_5, eval_tool) && (truth_(isExpanded_7) ? not(isErrored_8) && !(text_10 == null) : isExpanded_7))) {
    return next2(e);
  } else {
    const map___11_13 = await read_settings($);
    const map___11_14 = truth_(sequential_QMARK_(map___11_13)) ? truth_(vector_QMARK_(map___11_13)) ? map___11_13 : seq_to_map_for_destructuring(map___11_13) : map___11_13;
    const response_15 = get(map___11_14, "response");
    const highlight_16 = get(map___11_14, "highlight");
    const fold_17 = get(map___11_14, "fold");
    if (not(response_15)) {
      return next2(e);
    } else {
      const map___18_20 = $.ui.resolve(e);
      const map___18_21 = truth_(sequential_QMARK_(map___18_20)) ? truth_(vector_QMARK_(map___18_20)) ? map___18_20 : seq_to_map_for_destructuring(map___18_20) : map___18_20;
      const ui_22 = map___18_21;
      const Box_23 = get(map___18_21, "Box");
      const section_id_24 = `${tool_use_id_9 ?? ""}${":response"}`;
      const section_25 = await folded($, section_id_24, response_items(text_10), fold_17);
      return <Box_23 flexDirection="column" paddingLeft={2}>{clj_view(ui_22, highlight_16, ";; Response:")}{mapv((function(_PERCENT_1) {
        return item_view(ui_22, highlight_16, _PERCENT_1);
      }), get(section_25, "shown"))}{fold_toggle(ui_22, $, section_id_24, section_25)}</Box_23>;
    }
    ;
  }
  ;
};
const on_session_start = async function($, e, next2) {
  await $.command.register({ "name": "clj-view", "description": "Show or set how clojure-mcp evals draw in ctrl+o", "argumentHint": "[request|response|highlight on|off|fold <n>|off]" });
  const saved_1 = await $.store.get("settings");
  await write_settings($, merge(defaults, saved_1));
  return next2(e);
};
const on_command = async function($, e) {
  const vec___1_7 = remove(blank_QMARK_, split(trim(get(e, "args")), /\s+/));
  const option_8 = nth(vec___1_7, 0, null);
  const value_9 = nth(vec___1_7, 1, null);
  const vec___4_10 = parse_setting(option_8, value_9);
  const k_11 = nth(vec___4_10, 0, null);
  const v_12 = nth(vec___4_10, 1, null);
  const setting_13 = vec___4_10;
  if (option_8 == null) {
    return { "text": describe(await read_settings($)) };
  } else {
    if (setting_13 == null) {
      return { "text": usage };
    } else {
      if ("else") {
        const changed_14 = assoc(await read_settings($), k_11, v_12);
        await write_settings($, changed_14);
        await $.store.set("settings", changed_14);
        return { "text": describe(changed_14) };
      } else {
        return null;
      }
    }
  }
  ;
};
const register = function(on) {
  on("session.start", on_session_start);
  on("command.run", { "command": "clj-view" }, on_command);
  on("ui.render", { "component": "ToolUse" }, on_row);
  return on("ui.render", { "component": "ToolResult" }, on_result);
};
export {
  clj_view,
  clojure_spans,
  defaults,
  describe,
  eval_tool,
  fold_items,
  fold_toggle,
  folded,
  form_outputs,
  item_view,
  ns_line,
  on_command,
  on_result,
  on_row,
  on_session_start,
  output_text,
  palette,
  parse_setting,
  read_settings,
  register,
  response_items,
  scope_colors,
  scope_spans,
  toggles,
  usage,
  write_settings
};
