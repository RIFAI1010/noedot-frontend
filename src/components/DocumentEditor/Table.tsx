'use client'
// components/DocumentEditor/Table.tsx
import { axiosInstance } from '@/utils/config';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, Trash2, GripVertical } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface TableProps {
    id: string;
    noteId: string;
    getEditor: () => Editor | null;
}

const Table: React.FC<TableProps> = ({ id, noteId, getEditor }) => {
    const [table, setTable] = useState<any>(null)
    const [isFound, setIsFound] = useState<boolean>(true)
    const [isNoteSourceTable, setIsNoteSourceTable] = useState<boolean>(false)
    const [sourceNote, setSourceNote] = useState<any>(null)
    const [isDragging, setIsDragging] = useState<boolean>(false)

    const handleDeleteTable = () => {
        const editor = getEditor()
        console.log("table: editor", editor)
        if (editor) {
            let foundPos: number | null = null

            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'customTable' && node.attrs.id === id) {
                    foundPos = pos
                    return false
                }
                return true
            })

            if (foundPos !== null) {
                editor.chain()
                    .focus()
                    .deleteRange({ from: foundPos, to: foundPos + 1 })
                    .run()
                console.log("table: deleted")
            }
        }
    }

    const handleDragStart = (e: React.DragEvent) => {
        e.preventDefault() // Mencegah drag default
        setIsDragging(true)
        // Tambahkan logika drag and drop di sini jika diperlukan
    }

    const handleDragEnd = () => {
        setIsDragging(false)
    }

    const fetchTable = async () => {
        try {
            const response = await axiosInstance.get(`/table/${id}`)
            setTable(response.data)
            if (response.data.sourceNoteId == noteId) {
                setIsNoteSourceTable(true)
            } else {
                setIsNoteSourceTable(false)
                const sourceNote = await axiosInstance.get(`/note/${response.data.sourceNoteId}`)
                setSourceNote(sourceNote.data)
            }
        } catch (error) {
            console.error('Error fetching table:', error)
            if (error instanceof AxiosError) {
                if (error.response?.status === 404) {
                    setIsFound(false)
                }
            }
        }
    }

    useEffect(() => {
        fetchTable()
    }, [])

    return (
        <>
            {isFound ? (
                <>
                    <div
                        className="top-0 left-0 p-1 bg-zinc-700 rounded-full cursor-move"
                        draggable={false}
                    >
                        <GripVertical size={16} className="text-white" />
                    </div>
                    <div
                        className="custom-table relative group"
                        data-table-id={id}
                        draggable={true}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        contentEditable={false}
                    >
                        <button
                            onClick={handleDeleteTable}
                            className="absolute -top-2 -right-2 p-1 bg-zinc-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Table"
                        >
                            <Trash2 size={16} className="text-white" />
                        </button>
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr>
                                    <td className="border border-zinc-700 p-2">Table {id}</td>
                                    {isNoteSourceTable && (
                                        <td className="border border-zinc-700 p-2">
                                            is table source
                                        </td>
                                    )}
                                </tr>
                                <tr>
                                    <td className="border border-zinc-700 p-2">
                                        <input type="text" className="w-full" />
                                    </td>
                                    <td className="border border-zinc-700 p-2">
                                        <input type="text" className="w-full" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div>Table not found</div>
            )}
        </>
    );
};

export default Table; 