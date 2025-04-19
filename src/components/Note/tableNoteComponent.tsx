'use client'

import { axiosInstance } from "@/utils/config";
import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";
import { TiDelete } from "react-icons/ti";
import { useRouter } from "next/navigation";
import { getSocket } from "@/utils/socketClient";


interface Col {
    id: string;
    title: string;
}

interface Row {
    id: string;
    rowNumber: number;
    rowData: {
        id: string;
        content: string;
        colId: string;
    }[];
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const Modal = ({ isOpen, onClose, onConfirm, title, message }: ModalProps) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setShowModal(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleEnter = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                onConfirm();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('keydown', handleEnter);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleEnter);
        };
    }, [isOpen, onClose, onConfirm]);

    if (!shouldRender) return null;

    return (
        <div className={`fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${showModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div ref={modalRef} className={`bg-zinc-900 p-6 rounded-lg w-[400px] border border-zinc-700 transition-all duration-300 transform ${showModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
                <h3 className="text-xl font-semibold text-zinc-300 mb-2">{title}</h3>
                <p className="text-zinc-400 mb-4">{message}</p>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 cursor-pointer"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                        onClick={onConfirm}
                        autoFocus
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// Data dummy untuk demonstrasi
// const dummyData = {
//     cols: [
//         { id: '1', title: 'Nama Produk' },
//         { id: '2', title: 'Kategori' },
//         { id: '3', title: 'Harga' },
//         { id: '4', title: 'Stok' },
//     ],
//     rows: [
//         {
//             id: '1',
//             rowNumber: 1,
//             rowData: [
//                 { id: '1-1', content: 'Laptop Asus ROG new pro max seri', colId: '1' },
//                 { id: '1-2', content: 'Elektronik', colId: '2' },
//                 { id: '1-3', content: 'Rp 15.000.000', colId: '3' },
//                 { id: '1-4', content: '1', colId: '4' },
//                 { id: '1-5', content: 'Keterangan', colId: '5' }
//             ]
//         },
//         {
//             id: '2',
//             rowNumber: 2,
//             rowData: [
//                 { id: '2-1', content: 'iPhone 15 Pro', colId: '1' },
//                 { id: '2-2', content: 'Smartphone', colId: '2' },
//                 { id: '2-3', content: 'Rp 25.000.000', colId: '3' },
//             ]
//         },
//         {
//             id: '3',
//             rowNumber: 3,
//             rowData: [
//                 { id: '3-1', content: 'Samsung Galaxy', colId: '1' },
//                 { id: '3-2', content: 'Smartwatch', colId: '2' },
//                 { id: '3-3', content: 'Rp 5.000.000', colId: '3' },
//                 { id: '3-4', content: '1', colId: '4' }
//             ]
//         }
//     ]
// }

interface TableBlockProps {
    id: string;
    noteId: string;
    noteEditable: boolean;
    onComponentDeleted?: () => void;
}

export default function TableBlock({ id, noteId, noteEditable, onComponentDeleted }: TableBlockProps) {
    const router = useRouter();
    const [name, setName] = useState<string>('')
    const [saving, setSaving] = useState(false)
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout>()
    const [editable, setEditable] = useState(false)
    const [editableNote, setEditableNote] = useState(noteEditable)
    const [isSourceNote, setIsSourceNote] = useState(false)
    const [sourceNote, setSourceNote] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [tableRelationAccessDenied, setTableRelationAccessDenied] = useState({
        isAccessDenied: true,
        message: ''
    })
    const [cols, setCols] = useState<Col[]>([])
    const [rows, setRows] = useState<Row[]>([])
    const [contentSaveTimeout, setContentSaveTimeout] = useState<NodeJS.Timeout>()
    const [columnSaveTimeout, setColumnSaveTimeout] = useState<NodeJS.Timeout>()
    const [tableId, setTableId] = useState<string>('')
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: '', // 'row' or 'column'
        id: '',
        title: '',
        message: ''
    })

    // Update editableNote ketika prop noteEditable berubah
    useEffect(() => {
        setEditableNote(noteEditable)
    }, [noteEditable])

    // fetch table
    const fetchTable = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get(`/table/${id}?detail=true`)
            setTableRelationAccessDenied({
                isAccessDenied: false,
                message: ''
            })
            setTableId(response.data.id)
            setEditable(response.data.canEdit)
            setIsSourceNote(response.data.isSourceNote)
            if (response.data.name) {
                setName(response.data.name)
            }

            if (!response.data.isSourceNote) {
                const sourceNoteResponse = await axiosInstance.get(`/note/${response.data.sourceNoteId}`)
                setSourceNote(sourceNoteResponse.data)
            }
            setCols(response.data.cols)
            setRows(response.data.rows)
            // setCols(dummyData.cols)
            // setRows(dummyData.rows)
        } catch (error: any) {
            if (error.response.data.serverCode === 'TABLE_RELATION_ACCESS_DENIED') {
                setTableRelationAccessDenied({
                    isAccessDenied: true,
                    message: error.response.data.message
                })
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!tableId) return;
        const socket = getSocket();
        if (!socket) return;
        socket.emit('joinTable', { tableId });
        socket.on(`joinedTable_${tableId}`, (data) => {
            console.log('Joined table:', data);
            if (data.socketAction === 'updateNote') {
                setEditable(data.canEdit)
            }
            if (data.socketAction === 'updateTableName') {
                setName(data.name)
            }
            if (data.socketAction === 'updateRowData') {
                setRows(prevRows =>
                    prevRows.map(row =>
                        row.id === data.updatedRowData.rowId ? { ...row, rowData: row.rowData.map(rd => rd.id === data.updatedRowData.id ? { ...rd, content: data.updatedRowData.content } : rd) } : row
                    )
                )
            }
            if (data.socketAction === 'updateCol') {
                setCols(prevCols =>
                    prevCols.map(col =>
                        col.id === data.updatedCol.id ? { ...col, title: data.updatedCol.title } : col
                    )
                )
            }
            if (data.socketAction === 'createCol') {
                setCols(prevCols => [...prevCols, data.newCol])
            }
            if (data.socketAction === 'deleteCol') {
                setCols(prevCols => prevCols.filter(col => col.id !== data.deletedCol.id))
            }
            if (data.socketAction === 'createRow') {
                setRows(prevRows => [...prevRows, data.newRow])
            }
            if (data.socketAction === 'deleteRow') {
                setRows(prevRows => prevRows.filter(row => row.id !== data.deletedRow.id))
            }
        });
        return () => {
            console.log('Leaving table socket:', tableId);
            socket.emit('leaveTable');
            socket.off(`joinedTable_${tableId}`);
        };
    }, [tableId]);

    useEffect(() => {
        fetchTable()

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
    const saveTable = useCallback(async (name: string) => {
        if (saveTimeout) {
            clearTimeout(saveTimeout)
        }

        const timeout = setTimeout(async () => {
            setSaving(true)
            try {
                if (name !== '') {
                    await axiosInstance.put(`/table/${tableId}/title`, {
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
    }, [tableId])

    // cleanup save timeout
    useEffect(() => {
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout)
            }
        }
    }, [saveTimeout])

    const handleRowDataChange = async (rowId: string, colId: string, content: string, rowDataId: string) => {
        // Update local state immediately
        setRows(prevRows =>
            prevRows.map(r =>
                r.id === rowId ? { ...r, rowData: r.rowData.map(rd => rd.id === rowDataId ? { ...rd, content } : rd) } : r
            )
        )
        // Clear existing timeout
        if (contentSaveTimeout) {
            clearTimeout(contentSaveTimeout)
        }
        // Set new timeout
        const timeout = setTimeout(async () => {
            try {
                await axiosInstance.put(`/table/row-data/${rowDataId}`, {
                    content,
                })
            } catch (error) {
                console.error('Error updating row data:', error)
            }
        }, 1000) // 1 second delay
        setContentSaveTimeout(timeout)
    }

    // Cleanup content save timeout
    useEffect(() => {
        return () => {
            if (contentSaveTimeout) {
                clearTimeout(contentSaveTimeout)
            }
        }
    }, [contentSaveTimeout])

    const handleColumnChange = async (colId: string, title: string) => {
        try {
            setCols(prevCols =>
                prevCols.map(col =>
                    col.id === colId ? { ...col, title } : col
                )
            )
            if (columnSaveTimeout) {
                clearTimeout(columnSaveTimeout)
            }
            const timeout = setTimeout(async () => {
                await axiosInstance.put(`/table/col/${colId}`, {
                    title
                })
            }, 1000)
            setColumnSaveTimeout(timeout)
            // Update local state
        } catch (error) {
            console.error('Error updating column title:', error)
        }
    }

    useEffect(() => {
        return () => {
            if (columnSaveTimeout) {
                clearTimeout(columnSaveTimeout)
            }
        }
    }, [columnSaveTimeout])

    const handleAddColumn = async () => {
        try {
            const response = await axiosInstance.post(`/table/${tableId}/col`)
            // setCols(prevCols => [...prevCols, response.data])
        } catch (error) {
            console.error('Error adding column:', error)
        }
    }

    const handleDeleteColumn = async (colId: string) => {
        setModalState({
            isOpen: true,
            type: 'column',
            id: colId,
            title: 'Delete Column',
            message: 'Are you sure you want to delete this column? This action cannot be undone.'
        })
    }

    const handleAddRow = async () => {
        try {
            const response = await axiosInstance.post(`/table/${tableId}/row`)
            // setRows(prevRows => [...prevRows, response.data])
        } catch (error) {
            console.error('Error adding row:', error)
        }
    }

    const handleRemoveRow = async (rowId: string) => {
        setModalState({
            isOpen: true,
            type: 'row',
            id: rowId,
            title: 'Delete Row',
            message: 'Are you sure you want to delete this row? This action cannot be undone.'
        })
    }
    const handleAddRowData = async (rowId: string, colId: string) => {
        try {
            const response = await axiosInstance.post(`/table/${tableId}/row-data`, {
                rowId,
                colId,
            })
            // Update local state
            setRows(prevRows =>
                prevRows.map(row => {
                    if (row.id === rowId) {
                        return {
                            ...row,
                            rowData: [...row.rowData, response.data]
                        }
                    }
                    return row
                })
            )
        } catch (error) {
            console.error('Error adding row data:', error)
        }
    }

    const handleDeleteRowData = async (rowId: string, rowDataId: string) => {
        try {
            await axiosInstance.delete(`/table/row-data/${rowDataId}`)
            // Update local state
            setRows(prevRows =>
                prevRows.map(row => {
                    if (row.id === rowId) {
                        return {
                            ...row,
                            rowData: row.rowData.filter(rd => rd.id !== rowDataId)
                        }
                    }
                    return row
                })
            )
        } catch (error) {
            console.error('Error deleting row data:', error)
        }
    }

    const handleDeleteTable = async () => {
        setModalState({
            isOpen: true,
            type: 'table',
            id: id,
            title: 'Delete Table',
            message: 'Are you sure you want to delete this table? This action cannot be undone.'
        })
    }

    const handleModalConfirm = async () => {
        try {
            if (modalState.type === 'column') {
                await axiosInstance.delete(`/table/col/${modalState.id}`)
                // setCols(prevCols => prevCols.filter(col => col.id !== modalState.id))
            } else if (modalState.type === 'row') {
                await axiosInstance.delete(`/table/row/${modalState.id}`)
                // setRows(prevRows => prevRows.filter(row => row.id !== modalState.id))
            } else if (modalState.type === 'table') {
                await axiosInstance.delete(`/table/${modalState.id}`)
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

    return (
        <>
            <Modal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                title={modalState.title}
                message={modalState.message}
            />
            {loading || tableRelationAccessDenied.isAccessDenied ? (

                loading ? (
                    //like a table loading
                    <div className="bg-zinc-800 rounded-lg p-4">
                        <p className="text-zinc-300 text-lg">Loading...</p>
                    </div>
                ) : (
                    <div className="bg-zinc-800 rounded-lg p-4 flex items-center gap-2">
                        {editableNote && (
                            <button 
                            className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md hover:bg-zinc-600 cursor-pointer"
                            title="Delete Table"
                            onClick={() => handleDeleteTable()}
                            >
                            <TiDelete size={16} />
                        </button>
                        )}
                        <p className="text-zinc-300 text-lg">{tableRelationAccessDenied.message || 'Table not found'}</p>
                    </div>
                )
            ) : (
                <div className="bg-zinc-800 rounded-lg p-4">
                    {!isSourceNote && sourceNote && (
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <p className="text-zinc-300 text-lg">Table From</p>
                                <Link href={`/note/${sourceNote.id}`} className="text-blue-500 hover:text-blue-600">
                                    {sourceNote.title}
                                </Link>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-start items-center mb-4 relative gap-2">
                        {editableNote && (
                            <button 
                            className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md hover:bg-zinc-600 cursor-pointer"
                        title="Delete Table"
                        onClick={() => handleDeleteTable()}
                        >
                            <TiDelete size={16} />
                        </button>
                        )}
                        <input
                            type="text"
                            className="border-none outline-none bg-transparent text-zinc-300 text-lg font-bold w-full"
                            placeholder="Table Name"
                            value={name ?? ''}
                            disabled={!editable}
                            onChange={(e) => {
                                setName(e.target.value)
                                saveTable(e.target.value)
                            }}
                        />
                        {saving && <span className="saving-indicator absolute right-0">Saving...</span>}
                    </div>
                    <div>
                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg custom-scrollbar">
                            <table className="w-full text-sm text-left rtl:text-right text-zinc-500 dark:text-zinc-400">
                                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-400">
                                    <tr className="">
                                        {cols.map((col) => (
                                            <th key={col.id} scope="col" className="px-6 py-3 border-r border-zinc-200 group relative">
                                                <input
                                                    type="text"
                                                    className="border-none outline-none bg-transparent text-zinc-300"
                                                    value={col.title ?? ''}
                                                    disabled={!editable}
                                                    placeholder="type column name here..."
                                                    onChange={(e) => {
                                                        handleColumnChange(col.id, e.target.value)
                                                    }}
                                                />
                                                {editable && (
                                                    <button
                                                        className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer absolute right-4"
                                                        onClick={() => handleDeleteColumn(col.id)}
                                                        title="Delete Column"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </th>
                                        ))}
                                        {editable && (
                                            <th scope="col" className="px-6 py-3 right-0">
                                                <button className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer"
                                                    onClick={handleAddColumn}
                                                    title="Add Column"
                                                >
                                                    +
                                                </button>
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr key={row.id} className="bg-white border-b dark:bg-zinc-800 dark:border-zinc-700 border-zinc-200 group relative">
                                            {cols.map((col) => {
                                                const rowDataItems = row.rowData.filter(rd => rd.colId === col.id)
                                                return (
                                                    <td key={`${row.id}-${col.id}`} className="px-6 py-4 border-r border-zinc-700 group align-top">
                                                        <div className="flex flex-col gap-1 relative">
                                                            {rowDataItems.map((rowData, index) => (
                                                                <div key={`${rowData.id}-${index}`} className="flex items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        className="border-none outline-none bg-transparent text-zinc-300"
                                                                        value={rowData.content ?? ''}
                                                                        placeholder="type row data here..."
                                                                        disabled={!editable}
                                                                        onChange={(e) => {
                                                                            handleRowDataChange(row.id, col.id, e.target.value, rowData.id)
                                                                        }}
                                                                    />
                                                                    {editable && rowDataItems.length > 1 && (
                                                                        <button
                                                                            className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                                            onClick={() => handleDeleteRowData(row.id, rowData.id)}
                                                                            title="Delete Row Data"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {editable && rowDataItems.length === 0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        className="border-none outline-none bg-transparent text-zinc-300"
                                                                        placeholder="type row data here..."
                                                                        disabled={!editable}
                                                                        title="Add Row Data"
                                                                        onChange={(e) => {
                                                                            const value = e.target.value
                                                                            if (contentSaveTimeout) {
                                                                                clearTimeout(contentSaveTimeout)
                                                                            }
                                                                            const timeout = setTimeout(async () => {
                                                                                if (value.trim() !== '') {
                                                                                    const response = await axiosInstance.post(`/table/${tableId}/row-data`, {
                                                                                        rowId: row.id,
                                                                                        colId: col.id,
                                                                                        content: value
                                                                                    })
                                                                                    setRows(prevRows =>
                                                                                        prevRows.map(r =>
                                                                                            r.id === row.id
                                                                                                ? {
                                                                                                    ...r,
                                                                                                    rowData: [...r.rowData, response.data]
                                                                                                }
                                                                                                : r
                                                                                        )
                                                                                    )
                                                                                }
                                                                            }, 1000)
                                                                            setContentSaveTimeout(timeout)
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {editable && rowDataItems.length > 0 && rowDataItems[0].content !== '' && (
                                                                <button
                                                                    className="text-blue-500 hover:text-blue-600 cursor-pointer text-left absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onClick={() => handleAddRowData(row.id, col.id)}
                                                                    title="Add Row Data"
                                                                >
                                                                    +
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )
                                            })}
                                            {editable && (
                                                <td key={`${row.id}-delete`} className="px-6 py-2">
                                                    <button
                                                        className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer right-4"
                                                        onClick={() => handleRemoveRow(row.id)}
                                                        title="Delete Row"
                                                    >
                                                        ×
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    <tr key="add-row">
                                        {editable && (
                                            <td colSpan={cols.length + 1} className="px-6 py-2">
                                                <button className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer"
                                                    onClick={handleAddRow}
                                                    title="Add Row"
                                                >
                                                    + Add Row
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


            )}
        </>
    )
}