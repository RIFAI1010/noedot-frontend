'use client'
// components/DocumentEditor/Editor.tsx
import { useEditor, EditorContent, Node, Editor, EditorProvider, mergeAttributes } from '@tiptap/react'
import { createRoot } from 'react-dom/client'
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
import { useCallback, useEffect, useRef } from 'react'
import MenuBar from './MenuBar'
import Table from './Table'
import DraggableItem from './DraggableItem'
import { CustomComponentNode } from './CustomComponentNode'

interface EditorProps {
    content: string
    onChange: (content: string) => void
    noteId: string
}

const DocumentEditor = ({ content, onChange, noteId }: EditorProps) => {

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
            OrderedList,
            // CustomComponentNode,
            // Node.create({
            //     name: 'customTable',
            //     group: 'block',
            //     atom: true,
            //     draggable: true,
            //     addAttributes() {
            //         return {
            //             id: {
            //                 default: null,
            //             }
            //         }
            //     },
            //     parseHTML() {
            //         return [{
            //             tag: 'div[id]',
            //         }]
            //     },
            //     renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
            //         return ['div', HTMLAttributes]
            //     },
            //     addNodeView() {
            //         return ({ node, HTMLAttributes }: { node: any, HTMLAttributes: any }) => {
            //             const dom = document.createElement('div')
            //             dom.classList.add('custom-table-wrapper')
            //             // dom.setAttribute('draggable', 'false')
            //             // dom.ondragstart = (e) => {
            //             //     e.preventDefault()
            //             //     return false
            //             // }
            //             const tableId = node.attrs.id
            //             const root = document.createElement('div')
            //             root.setAttribute('id', tableId)
            //             root.classList.add('custom-table')
            //             dom.appendChild(root)

            //             const reactRoot = createRoot(root)
            //             reactRoot.render(<Table id={tableId} noteId={noteId} getEditor={() => editor} />)

            //             return {
            //                 dom,
            //                 update: (node: any) => {
            //                     const newTableId = node.attrs.id
            //                     if (newTableId !== tableId) {
            //                         reactRoot.render(<Table id={newTableId} noteId={noteId} getEditor={() => editor} />)
            //                     }
            //                     return true
            //                 },
            //                 destroy: () => {
            //                     reactRoot.unmount()
            //                     console.log("table: destroyed")
            //                 }
            //             }
            //         }
            //     },
            // })
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        }
    })

    // Update content dari props jika berubah
    useEffect(() => {
        console.log("editor", editor)
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }

    }, [content, editor])


    if (!editor) {
        return null
    }

    // const extensions = [
    //     StarterKit,
    //     DraggableItem,
    // ]

    // const content2 = `
    //     <p>This is a boring paragraph.</p>
    //     <div data-type="draggable-item">
    //       <p>Followed by a fancy draggable item.</p>
    //     </div>
    //     <div data-type="draggable-item">
    //       <p>And another draggable item.</p>
    //       <div data-type="draggable-item">
    //         <p>And a nested one.</p>
    //         <div data-type="draggable-item">
    //           <p>But can we go deeper?</p>
    //         </div>
    //       </div>
    //     </div>
    //     <p>Let’s finish with a boring paragraph.</p>
    //   `



    return (
        <div className="document-editor">
            <MenuBar noteId={noteId} editor={editor} />
            <EditorContent editor={editor} className="editor-content min-h-[500px] p-4 bg-zinc-900" />
            {/* <div className="editor-content min-h-[500px] p-4 bg-zinc-900">
                <EditorProvider slotBefore={<MenuBar noteId={noteId} />} extensions={extensions} content={content2} >
                    
                </EditorProvider>
            </div> */}
        </div>
    )
}

export default DocumentEditor