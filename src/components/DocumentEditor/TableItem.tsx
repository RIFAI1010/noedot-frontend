import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Table from './Table'
import { createRoot } from 'react-dom/client'
import { Editor } from '@tiptap/core'

export default Node.create({
    name: 'customTable',
    group: 'block',
    content: 'block+',
    draggable: true,
    addAttributes() {
        return {
            id: {
                default: null,
            },
            noteId: {
                default: null,
            }
        }
    },
    parseHTML() {
        return [{
            tag: 'table[id]',
        }]
    },
    renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
        return ['table', mergeAttributes(HTMLAttributes, { 'data-type': 'customTable' }), 0]
    },
    addNodeView() {
        return ({ node, HTMLAttributes, editor }: { node: any, HTMLAttributes: any, editor: Editor }) => {
            const dom = document.createElement('div')
            dom.classList.add('custom-table-wrapper')
            dom.setAttribute('draggable', 'false')
            dom.ondragstart = (e) => {
                e.preventDefault()
                return false
            }
            const tableId = node.attrs.id
            const noteId = node.attrs.noteId
            const root = document.createElement('div')
            dom.appendChild(root)

            const reactRoot = createRoot(root)
            const getEditor = () => editor
            reactRoot.render(<Table id={tableId} noteId={noteId} getEditor={getEditor} />)

            return {
                dom,
                contentDOM: dom,
                update: (node: any) => {
                    const newTableId = node.attrs.id
                    const newNoteId = node.attrs.noteId
                    if (newTableId !== tableId || newNoteId !== noteId) {
                        reactRoot.render(<Table id={newTableId} noteId={newNoteId} getEditor={getEditor} />)
                    }
                    return true
                },
                destroy: () => {
                    reactRoot.unmount()
                    console.log("table: destroyed")
                }
            }
        }
    },
}) 