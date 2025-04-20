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
import { Link as TiptapLink } from '@tiptap/extension-link'
import Link from "next/link";
import Image from '@tiptap/extension-image'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import { useCallback, useEffect, useRef, useState } from 'react'
import MenuBar from './MenuBar'
import Table from './Table'
import DraggableItem from './DraggableItem'
import { CustomComponentNode } from './CustomComponentNode'
import { axiosInstance } from '@/utils/config'
import { getSocket } from '@/utils/socketClient'
import { ModalAlert } from '../Note/modalAlert'
import { Editor as TiptapEditor } from '@tiptap/core'
import { TiDelete } from 'react-icons/ti'

interface EditorProps {
    id: string;
    noteId: string;
    noteEditable: boolean;
    onComponentDeleted?: () => void;
}

const DocumentEditor = ({ id, noteId, noteEditable, onComponentDeleted }: EditorProps) => {

    const [name, setName] = useState<string>('')
    const [saving, setSaving] = useState(false)
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout>()
    const [editable, setEditable] = useState(false)
    const [editableNote, setEditableNote] = useState(noteEditable)
    const [isSourceNote, setIsSourceNote] = useState(false)
    const [sourceNote, setSourceNote] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [documentRelationAccessDenied, setDocumentRelationAccessDenied] = useState({
        isAccessDenied: true,
        message: ''
    })
    const [content, setContent] = useState('')
    const [contentSaveTimeout, setContentSaveTimeout] = useState<NodeJS.Timeout>()
    const [documentId, setDocumentId] = useState<string>('')
    const [editorHeight, setEditorHeight] = useState<number>(300) // Default height
    const [heightSaveTimeout, setHeightSaveTimeout] = useState<NodeJS.Timeout>()
    const [isDragging, setIsDragging] = useState(false)
    const [startY, setStartY] = useState(0)
    const [startHeight, setStartHeight] = useState(0)
    const resizeHandleRef = useRef<HTMLDivElement>(null)
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: '', // 'row' or 'column'
        id: '',
        title: '',
        message: ''
    })
    const [isMounted, setIsMounted] = useState(false)
    const editorRef = useRef<TiptapEditor | null>(null)

    useEffect(() => {
        setEditableNote(noteEditable)
    }, [noteEditable])

    const fetchDocument = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get(`/document/${id}`)
            setDocumentRelationAccessDenied({
                isAccessDenied: false,
                message: ''
            })
            setDocumentId(response.data.id)
            setEditorHeight(response.data.height)
            setEditable(response.data.canEdit)
            setIsSourceNote(response.data.isSourceNote)
            setContent(response.data.content)
            if (!response.data.isSourceNote) {
                const sourceNoteResponse = await axiosInstance.get(`/note/${response.data.sourceNoteId}`)
                setSourceNote(sourceNoteResponse.data)
            }
        } catch (error: any) {
            if (error.response.data.serverCode === 'DOCUMENT_RELATION_ACCESS_DENIED') {
                setDocumentRelationAccessDenied({
                    isAccessDenied: true,
                    message: error.response.data.message
                })
            }
        }
        finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        if (!documentId) return;
        const socket = getSocket();
        if (!socket) return;
        socket.emit('joinDocument', { documentId });
        socket.on(`joinedDocument_${documentId}`, (data) => {
            console.log('Joined document:', data);
            if (data.socketAction === 'updateNote') {
                setEditable(data.canEdit)
            }
            if (data.socketAction === 'updateDocumentName') {
                setName(data.name)
            }
            if (data.socketAction === 'updateDocumentContent') {
                setContent(data.content)
            }
            if (data.socketAction === 'updateDocumentHeight') {
                setEditorHeight(data.height)
            }
        });
        return () => {
            console.log('Leaving document socket:', documentId);
            socket.emit('leaveDocument');
            socket.off(`joinedDocument_${documentId}`);
        };
    }, [documentId]);

    useEffect(() => {
        fetchDocument()

        const handleCanEdit = (e: CustomEvent) => {
            setEditableNote(e.detail.canEdit)
            console.log('table said can edit', e.detail.canEdit)
        }

        window.addEventListener('canEdit', handleCanEdit as EventListener)

        // Cleanup
        return () => {
            window.removeEventListener('canEdit', handleCanEdit as EventListener)
        }
    }, [])

    // save table handler
    const saveDocument = useCallback(async (name: string) => {
        if (saveTimeout) {
            clearTimeout(saveTimeout)
        }

        const timeout = setTimeout(async () => {
            setSaving(true)
            try {
                if (name !== '') {
                    await axiosInstance.put(`/document/${documentId}/title`, {
                        name: name
                    })
                }
            } catch (error) {
                console.error('Error saving table:', error)
            } finally {
                setSaving(false)
            }
        }, 500)

        setSaveTimeout(timeout)
    }, [documentId])

    // cleanup save timeout
    useEffect(() => {
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout)
            }
        }
    }, [saveTimeout])

    const handleContentChange = useCallback((content: string) => {
        if (contentSaveTimeout) {
            clearTimeout(contentSaveTimeout)
        }

        const timeout = setTimeout(async () => {
            setSaving(true)
            try {
                await axiosInstance.put(`/document/${documentId}/content`, {
                    content: content
                })
                setContent(content)
            } catch (error) {
                console.error('Error saving content:', error)
            } finally {
                setSaving(false)
            }
        }, 500) // Delay 500ms

        setContentSaveTimeout(timeout)
    }, [contentSaveTimeout, documentId])

    // cleanup content save timeout
    useEffect(() => {
        return () => {
            if (contentSaveTimeout) {
                clearTimeout(contentSaveTimeout)
            }
        }
    }, [contentSaveTimeout])

    const handleDeleteDocument = async () => {
        setModalState({
            isOpen: true,
            type: 'document',
            id: id,
            title: 'Delete Document',
            message: 'Are you sure you want to delete this document? This action cannot be undone.'
        })
    }

    const handleModalConfirm = async () => {
        try {
            if (modalState.type === 'document') {
                await axiosInstance.delete(`/document/${modalState.id}`)
                // Panggil callback function dari parent
                if (onComponentDeleted) {
                    onComponentDeleted();
                }
            }
        } catch (error) {
            console.error('Error deleting:', error)
        } finally {
            setModalState(prev => ({ ...prev, isOpen: false }))
        }
    }

    const handleModalClose = () => {
        setModalState(prev => ({ ...prev, isOpen: false }))
    }

    // Fungsi untuk menangani drag
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        setStartY(e.clientY)
        setStartHeight(editorHeight)
        document.body.style.cursor = 'row-resize'
    }
    
    const saveEditorHeight = useCallback(async () => {
        if (heightSaveTimeout) {
            clearTimeout(heightSaveTimeout)
        }

        console.log("saving height1 ", editorHeight)
        const timeout = setTimeout(async () => {
            try {
                await axiosInstance.put(`/document/${documentId}/height`, {
                    height: editorHeight
                })
                console.log("saving height2 ", editorHeight)
            } catch (error) {
                console.error('Error saving editor height:', error)
            }
        }, 500)

        setHeightSaveTimeout(timeout)
    }, [editorHeight, documentId, heightSaveTimeout])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return

            const delta = e.clientY - startY
            const newHeight = Math.max(100, Math.min(1000, startHeight + delta))
            console.log("newHeight: ", newHeight)
            setEditorHeight(newHeight)
        }

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false)
                document.body.style.cursor = ''
                saveEditorHeight()
            }
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, startY, startHeight, saveEditorHeight])

    // Cleanup height save timeout
    useEffect(() => {
        return () => {
            if (heightSaveTimeout) {
                clearTimeout(heightSaveTimeout)
            }
        }
    }, [heightSaveTimeout])

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
            TiptapLink.configure({
                openOnClick: false,
            }),
            Image,
            BulletList,
            OrderedList,
        ],
        content: content,
        editable: true,
        onUpdate: ({ editor }) => {
            handleContentChange(editor.getHTML())
        }
    })

    // Update content dari props jika berubah
    useEffect(() => {
        console.log("editor", editor)
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }

    }, [content, editor])

    useEffect(() => {
        if (!isMounted) {
            setIsMounted(true)
        }
    }, [isMounted])

    if (!isMounted) {
        return null
    }

    if (!editor) {
        return null
    }

    return (
        <>
            <ModalAlert
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                title={modalState.title}
                message={modalState.message}
            />

            {loading || documentRelationAccessDenied.isAccessDenied ? (

                loading ? (
                    //like a table loading
                    <div className="bg-zinc-800 rounded-lg p-4">
                        <p className="text-zinc-300 text-lg">Loading...</p>
                    </div>
                ) : (
                    <div className="bg-zinc-800 rounded-lg p-4 flex items-center gap-2">
                        {(editableNote || editable) && (
                            <button
                                className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md hover:bg-zinc-600 cursor-pointer"
                                title="Delete Document"
                                onClick={() => handleDeleteDocument()}
                            >
                                <TiDelete size={16} />
                            </button>
                        )}
                        <p className="text-zinc-300 text-lg">{documentRelationAccessDenied.message || 'Document not found'}</p>
                    </div>
                )
            ) : (
                <div className="bg-zinc-800 rounded-lg p-4">
                    {!isSourceNote && sourceNote && (
                        <>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <p className="text-zinc-300 text-sm">Document From</p>
                                    <Link href={`/note/${sourceNote.id}`} className="text-blue-500 hover:text-blue-600">
                                        {sourceNote.title}
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                        <div className="flex justify-start items-center mb-4 relative gap-2">
                            {(editableNote || editable) && (
                                <button
                                    className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md hover:bg-zinc-600 cursor-pointer"
                                    title="Delete Document"
                                    onClick={() => handleDeleteDocument()}
                                >
                                    <TiDelete size={16} />
                                </button>
                            )}
                            <input
                                type="text"
                                className="border-none outline-none text-zinc-300 text-lg font-bold w-full bg-transparent shadow-md p-1 rounded-md"
                                placeholder="Document Name"
                                value={name ?? ''}
                                disabled={!editable}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    saveDocument(e.target.value)
                                }}
                            />
                        </div>
                    <div className="relative">
                        {(editableNote || editable) && (
                            <>
                                {/* {editorHeight} */}
                                <MenuBar editor={editor} />
                            </>
                        )}
                        <div className="editor-wrapper relative" >
                            <EditorContent
                                editor={editor}
                                className="editor-content bg-zinc-900 shadow-md p-4 overflow-y-auto border-3 border-zinc-700" style={{ minHeight: `${editorHeight}px` }}
                            />
                            {(editableNote || editable) && (
                                <div
                                    ref={resizeHandleRef}
                                    className="absolute bottom-0 left-0 right-0 h-2 bg-zinc-700 hover:bg-zinc-600 cursor-row-resize flex items-center justify-center"
                                    onMouseDown={handleMouseDown}
                                >
                                    <div className="w-8 h-1 bg-zinc-500 rounded-full"></div>
                                </div>
                            )}
                        </div>
                        {saving && (
                            <div className="absolute right-0 top-0 text-xs text-zinc-400">
                                Saving...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default DocumentEditor