import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Minus,
  Pilcrow,
} from 'lucide-react';

const MAX_INLINE_IMAGE_BYTES = 1.2 * 1024 * 1024; // 1.2 MB raw before base64 overhead
const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

/**
 * Convert a File to a base64 data URL (capped for safety).
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

const ToolbarButton = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    data-testid={`tiptap-${title.toLowerCase().replace(/\s+/g, '-')}`}
    className={`h-8 w-8 inline-flex items-center justify-center rounded-md border transition
      ${active ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
      disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const Toolbar = ({ editor, onInsertImage }) => {
  if (!editor) return null;

  const promptForLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('URL (https://…) — leave blank to remove', prev);
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    let href = url.trim();
    if (!/^https?:\/\//i.test(href) && !href.startsWith('/') && !href.startsWith('mailto:')) {
      href = `https://${href}`;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href, target: '_blank', rel: 'noopener noreferrer' }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-lg" data-testid="tiptap-toolbar">
      <ToolbarButton title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
        <Pilcrow className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-slate-300" />
      <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Strike" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-slate-300" />
      <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-slate-300" />
      <ToolbarButton title="Link" active={editor.isActive('link')} onClick={promptForLink}>
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Unlink" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Unlink className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Insert image" onClick={onInsertImage}>
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-slate-300" />
      <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
};

/**
 * TipTap rich-text editor.
 *
 * Props:
 *   value         current HTML string
 *   onChange      called with new HTML on every edit (debounce upstream if needed)
 *   placeholder   placeholder for the empty doc
 *   onImageError  optional callback invoked with a string when an inline-image upload is rejected
 */
const TipTapEditor = ({ value, onChange, placeholder = 'Start writing your post…', onImageError }) => {
  const fileInputRef = useRef(null);
  const lastEmittedRef = useRef(value || '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: 'language-plain' } },
        // StarterKit ships a Link mark; we register the standalone Link extension
        // below for openOnClick=false + custom HTMLAttributes, so disable the
        // bundled one to avoid the "Duplicate extension names found: [link]" warning.
        link: false,
      }),
      Image.configure({ inline: false, allowBase64: true, HTMLAttributes: { class: 'mx-auto rounded-lg my-4 max-w-full h-auto' } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-orange-600 underline underline-offset-2 hover:text-orange-700' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[300px] focus:outline-none px-4 py-3',
        'data-testid': 'tiptap-editor-area',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastEmittedRef.current = html;
      onChange?.(html);
    },
  });

  // Keep editor content in sync if `value` is updated from outside (e.g., loading an existing post).
  useEffect(() => {
    if (!editor) return;
    if (typeof value !== 'string') return;
    if (value === lastEmittedRef.current) return;
    editor.commands.setContent(value || '', false);
    lastEmittedRef.current = value || '';
  }, [editor, value]);

  const handleInsertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting same file
    if (!file) return;
    if (!ALLOWED_MIMES.includes(file.type)) {
      onImageError?.(`Unsupported image type (${file.type}). Use PNG, JPEG, WebP or GIF.`);
      return;
    }
    if (file.size > MAX_INLINE_IMAGE_BYTES) {
      onImageError?.(`Image too large (${(file.size / 1024).toFixed(0)} KB). Max ${(MAX_INLINE_IMAGE_BYTES / 1024).toFixed(0)} KB.`);
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      editor?.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
    } catch (err) {
      onImageError?.(err?.message || 'Failed to read image');
    }
  }, [editor, onImageError]);

  return (
    <div className="border border-slate-200 rounded-lg bg-white">
      <Toolbar editor={editor} onInsertImage={handleInsertImage} />
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIMES.join(',')}
        className="hidden"
        onChange={handleFileChange}
        data-testid="tiptap-image-file-input"
      />
    </div>
  );
};

export default TipTapEditor;
