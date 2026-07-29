import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// Light monochrome editor matching the omg docs site: charcoal on near-white,
// weight and shade carry the hierarchy instead of colour.
const editorTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: 'var(--ink)' },
  '.cm-content': { caretColor: 'var(--ink)', padding: '20px 0' },
  '.cm-line': { padding: '0 20px' },
  '.cm-cursor': { borderLeftColor: 'var(--ink)', borderLeftWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(0, 0, 0, 0.1) !important',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(0, 0, 0, 0.03)' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--gray-400)',
    border: 'none',
    paddingLeft: '8px',
  },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--ink)' },
});

const editorHighlight = HighlightStyle.define([
  { tag: tags.heading, color: 'var(--ink-strong)', fontWeight: '700' },
  { tag: tags.strong, color: 'var(--ink-strong)', fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.monospace, color: 'var(--gray-700)' },
  { tag: tags.meta, color: 'var(--gray-500)' },
  { tag: tags.processingInstruction, color: 'var(--gray-500)' },
  { tag: tags.labelName, color: 'var(--ink)', fontWeight: '600' },
  { tag: tags.contentSeparator, color: 'var(--gray-400)' },
  { tag: tags.link, color: 'var(--ink)', textDecoration: 'underline' },
  { tag: tags.url, color: 'var(--gray-600)' },
  { tag: tags.quote, color: 'var(--gray-600)', fontStyle: 'italic' },
  { tag: tags.comment, color: 'var(--gray-500)', fontStyle: 'italic' },
]);

export const editorExtensions = [editorTheme, syntaxHighlighting(editorHighlight)];

// Read-only YAML view: same monochrome base, keys weighted, values in greys.
const yamlTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: 'var(--ink)' },
  '.cm-content': { padding: '20px 0' },
  '.cm-line': { padding: '0 24px' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--gray-400)',
    border: 'none',
    paddingLeft: '8px',
  },
  '.cm-activeLine': { backgroundColor: 'transparent' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
});

const yamlHighlight = HighlightStyle.define([
  { tag: tags.definition(tags.propertyName), color: 'var(--ink-strong)', fontWeight: '600' },
  { tag: tags.propertyName, color: 'var(--ink-strong)', fontWeight: '600' },
  { tag: tags.string, color: 'var(--gray-600)' },
  { tag: tags.number, color: 'var(--gray-700)' },
  { tag: tags.bool, color: 'var(--gray-700)', fontWeight: '600' },
  { tag: tags.null, color: 'var(--gray-400)' },
  { tag: tags.comment, color: 'var(--gray-400)', fontStyle: 'italic' },
]);

export const yamlViewExtensions = [yamlTheme, syntaxHighlighting(yamlHighlight)];
