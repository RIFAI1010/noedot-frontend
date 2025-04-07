'use client'
// components/DocumentEditor/Editor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Strike from '@tiptap/extension-strike'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import { useCallback, useEffect } from 'react'
import MenuBar from './MenuBar'

interface EditorProps {
    content: string
    onChange: (content: string) => void
}

const DocumentEditor = ({ content, onChange }: EditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Heading.configure({
                levels: [1, 2, 3]
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph']
            }),
            Underline,
            TextStyle,
            Strike,
            Blockquote,
            CodeBlock,
            Link.configure({
                openOnClick: false,
            }),
            Image,
            BulletList,
            OrderedList
        ],
        content: content,
        onUpdate: ({ editor }) => {
            // Kirim konten ke parent component setiap kali ada perubahan
            onChange(editor.getHTML())
        }
    })

    // Update content dari props jika berubah
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="document-editor">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="editor-content min-h-[500px] p-4 bg-zinc-900" />
        </div>
    )
}

export default DocumentEditor