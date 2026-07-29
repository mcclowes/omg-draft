import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// Drafting-desk theme: ink blue, chalk text, cyan line work.
const draftingTheme = EditorView.theme(
  {
    '&': { backgroundColor: 'transparent', color: 'var(--chalk)' },
    '.cm-content': { caretColor: 'var(--cyan)', padding: '20px 0' },
    '.cm-line': { padding: '0 20px' },
    '.cm-cursor': { borderLeftColor: 'var(--cyan)', borderLeftWidth: '2px' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(103, 198, 255, 0.18) !important',
    },
    '.cm-activeLine': { backgroundColor: 'rgba(126, 178, 240, 0.05)' },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: 'var(--chalk-faint)',
      border: 'none',
      paddingLeft: '8px',
    },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--cyan)' },
  },
  { dark: true }
);

const draftingHighlight = HighlightStyle.define([
  { tag: tags.heading, color: 'var(--cyan)', fontWeight: '600' },
  { tag: tags.strong, color: '#ffffff', fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic', color: 'var(--chalk)' },
  { tag: tags.monospace, color: '#a8d8a0' },
  { tag: tags.meta, color: 'var(--chalk-faint)' },
  { tag: tags.processingInstruction, color: 'var(--chalk-faint)' },
  { tag: tags.labelName, color: 'var(--safety)' },
  { tag: tags.contentSeparator, color: 'var(--safety)' },
  { tag: tags.link, color: 'var(--cyan)' },
  { tag: tags.url, color: 'var(--cyan)', textDecoration: 'underline' },
  { tag: tags.quote, color: 'var(--chalk-dim)', fontStyle: 'italic' },
  { tag: tags.comment, color: 'var(--chalk-faint)', fontStyle: 'italic' },
]);

export const draftingExtensions = [draftingTheme, syntaxHighlighting(draftingHighlight)];

// Paper theme for the read-only YAML view.
const paperTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: 'var(--ink-on-paper)' },
  '.cm-content': { padding: '20px 0' },
  '.cm-line': { padding: '0 24px' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--ink-faint)',
    border: 'none',
    paddingLeft: '8px',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(38, 49, 61, 0.04)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
});

const paperHighlight = HighlightStyle.define([
  { tag: tags.definition(tags.propertyName), color: '#1f6fb2', fontWeight: '500' },
  { tag: tags.propertyName, color: '#1f6fb2', fontWeight: '500' },
  { tag: tags.string, color: '#8a4b12' },
  { tag: tags.number, color: '#7b5cb8' },
  { tag: tags.bool, color: '#2d8a5f' },
  { tag: tags.null, color: 'var(--ink-faint)' },
  { tag: tags.comment, color: 'var(--ink-faint)', fontStyle: 'italic' },
]);

export const paperExtensions = [paperTheme, syntaxHighlighting(paperHighlight)];
