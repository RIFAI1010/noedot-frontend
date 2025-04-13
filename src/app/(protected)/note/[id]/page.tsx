'use client'
// pages/document/[id].tsx
import { useState, useEffect, useCallback } from 'react'
import DocumentEditor from '@/components/DocumentEditor/Editor'
import { useRouter, useParams } from 'next/navigation'
import { axiosInstance } from '@/utils/config'

const DocumentPage = () => {
    const router = useRouter()
    const { id } = useParams()
    const [document, setDocument] = useState({ content: '', title: '' })
    const [saving, setSaving] = useState(false)
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout>()

    // Load document
    useEffect(() => {
        if (id) {
            fetchDocument()
        }
    }, [id])

    const fetchDocument = async () => {
        try {
            const response = await axiosInstance.get(`/note/${id}`)
            setDocument({ content: response.data.content, title: response.data.title })
        } catch (error) {
            console.error('Error fetching document:', error)
        }
    }


    useEffect(() => {
        const handleNoteSaved = () => {
            fetchDocument()
        }
        window.addEventListener('noteSaved', handleNoteSaved)
        return () => window.removeEventListener('noteSaved', handleNoteSaved)
    }, [])


    // Save document dengan debounce
    const saveDocument = useCallback(async (content: string, title: string) => {
        if (saveTimeout) {
            clearTimeout(saveTimeout)
        }

        const timeout = setTimeout(async () => {
            setSaving(true)
            try {
                await axiosInstance.put(`/note/${id}/document`, {
                    content: content,
                    title: title
                })
                // Dispatch event saat note berhasil disimpan
                window.dispatchEvent(new CustomEvent('noteSaved'))
            } catch (error) {
                console.error('Error saving document:', error)
            } finally {
                setSaving(false)
            }
        }, 500) // Delay 500ms

        setSaveTimeout(timeout)
    }, [id])

    

    useEffect(() => {
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout)
            }
        }
    }, [saveTimeout])

    return (
        <div className="document-page max-w-[1000px] mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                <input
                    type="text"
                    value={document.title}
                    onChange={(e) => {
                        setDocument(prev => ({ ...prev, title: e.target.value }))
                        saveDocument(document.content, e.target.value)
                    }}
                    className="border-none outline-none bg-transparent text-zinc-300 text-2xl font-bold"
                    placeholder="Untitled Document"
                />
                {saving && <span className="saving-indicator">Saving...</span>}
            </div>

            <DocumentEditor
                noteId={id as string}
                content={document.content}
                onChange={(newContent) => {
                    setDocument(prev => ({ ...prev, content: newContent }))
                    saveDocument(newContent, document.title)
                }}
            />
        </div>
    )
}

export default DocumentPage