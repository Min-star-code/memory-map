export type TokenKind = 'kw' | 'type' | 'num' | 'str' | 'fn' | 'plain';
export interface Token { kind: TokenKind; text: string }

const KEYWORDS = new Set(['return', 'if', 'else', 'while', 'for', 'sizeof', 'struct', 'const']);
const TYPES = new Set(['int', 'void', 'char', 'bool', 'double', 'NULL']);

// A small tokenizer for the short C snippets on the site. It only needs to
// colour strings, numbers, keywords, types and function names.
const TOKEN_RE = /("(?:\\.|[^"\\])*")|(\b\d+\b)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)|(\s+)|(.)/g;

export function tokenizeC(line: string): Token[] {
  const out: Token[] = [];
  for (const m of line.matchAll(TOKEN_RE)) {
    const [text, str, num, call, word] = m;
    let kind: TokenKind = 'plain';
    if (str) kind = 'str';
    else if (num) kind = 'num';
    else if (call) kind = KEYWORDS.has(call) ? 'kw' : TYPES.has(call) ? 'type' : 'fn';
    else if (word) kind = KEYWORDS.has(word) ? 'kw' : TYPES.has(word) ? 'type' : 'plain';
    const last = out[out.length - 1];
    if (kind === 'plain' && last && last.kind === 'plain') last.text += text;
    else out.push({ kind, text });
  }
  return out;
}
