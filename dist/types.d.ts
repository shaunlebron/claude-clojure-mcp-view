export type Settings = {
  request: boolean
  response: boolean
  highlight: boolean
  fold: number | false
}

declare module 'claude-code' {
  interface PluginState {
    'clojure-mcp-view': { settings: Settings; unfolded: StateFamily<boolean> }
  }
}
