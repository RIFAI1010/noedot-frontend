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
            const response = await axiosInstance.get(`/api/documents/${id}`)
            setDocument(response.data)
        } catch (error) {
            console.error('Error fetching document:', error)
        }
    }

    // Save document dengan debounce
    const saveDocument = useCallback(async (content: string) => {
        if (saveTimeout) {
            clearTimeout(saveTimeout)
        }

        const timeout = setTimeout(async () => {
            setSaving(true)
            try {
                await axiosInstance.put(`/api/documents/${id}`, {
                    content,
                    title: document.title
                })
            } catch (error) {
                console.error('Error saving document:', error)
            } finally {
                setSaving(false)
            }
        }, 1000) // Delay 1 detik

        setSaveTimeout(timeout)
    }, [id, document.title])

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
                        saveDocument(e.target.value)
                    }}
                    className="border-none outline-none bg-transparent text-zinc-300 text-2xl font-bold"
                    placeholder="Untitled Document"
                />
                {saving && <span className="saving-indicator">Saving...</span>}
            </div>

            <DocumentEditor
                content={document.content}
                onChange={(newContent) => {
                    setDocument(prev => ({ ...prev, content: newContent }))
                    saveDocument(newContent)
                }}
            />
        </div>
    )
}

export default DocumentPage