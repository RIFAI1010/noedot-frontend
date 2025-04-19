'use client'
// pages/document/[id].tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import DocumentEditor from '@/components/DocumentEditor/Editor'
import { useRouter, useParams } from 'next/navigation'
import { API_BASE_URL, axiosInstance } from '@/utils/config'
import { MdEditNote } from "react-icons/md";
import { CiViewTable } from "react-icons/ci";
import { IoMdImages } from "react-icons/io";
import { GoStack } from "react-icons/go";
import { Block, blockRegistry } from '@/utils/componentRegistry'
import { io } from 'socket.io-client'
import { getUserPayload } from '@/utils/auth'
import { connectSocket, disconnectSocket, getSocket } from '@/utils/socketClient'
import { FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa'

const NotePage = () => {
    const router = useRouter()
    const { id } = useParams()
    const [title, setTitle] = useState<string>('')
    const [saving, setSaving] = useState(false)
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout>()
    const [editable, setEditable] = useState(false)
    const [blocks, setBlocks] = useState<Block[]>([])
    const [isPositionModalOpen, setIsPositionModalOpen] = useState(false)
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const [shouldRender, setShouldRender] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [blocksPosition, setBlocksPosition] = useState<Block[]>([])
    // fetch note
    const fetchNote = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/note/${id}`)
            setEditable(response.data.canEdit)
            setTitle(response.data.title)
            setBlocks(response.data.noteBlocks)
        } catch (error) {
            console.error('Error fetching note:', error)
        }
    }, [id])

    // Load note
    useEffect(() => {
        if (id) {
            fetchNote()
        }
    }, [id, fetchNote])

    // event listener for noteUpdated
    useEffect(() => {
        const handleNoteSaved = () => {
            if (id) {
                fetchNote()
            }
        }
        window.addEventListener('noteUpdated', handleNoteSaved)
        return () => window.removeEventListener('noteUpdated', handleNoteSaved)
    }, [id, fetchNote])

    // websocket
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        socket.emit('joinNote', { noteId: id });
        socket.on(`joinedNote_${id}`, (data) => {
            console.log('Joined note:', data);
            if (data.title) {
                setTitle(data.title);
            }
            if (data.canEdit !== null) {
                setEditable(data.canEdit);
                window.dispatchEvent(new CustomEvent('canEdit', {
                    detail: {
                        canEdit: data.canEdit
                    }
                }))
            }
            if (data.socketAction === 'addBlock') {
                setBlocks(prevBlocks => [...prevBlocks, data.newBlock]);
            }
            if (data.socketAction === 'deleteBlock') {
                // setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== data.deletedBlock.id));
                handleComponentDeleted(data.deletedBlock.referenceId)
                setBlocks(prevBlocks => prevBlocks.map(block =>
                    block.id === data.deletedBlock.id ? { ...block, position: data.deletedBlock.position } : block
                ));
            }
            if (data.socketAction === 'updateBlockPosition') {
                setBlocks(prevBlocks => prevBlocks.map(block =>
                    block.id === data.updatedBlockPosition.id ? { ...block, position: data.updatedBlockPosition.position } : block
                ));
            }
        });
        return () => {
            console.log('Leaving note socket:', id);
            socket.emit('leaveNote');
            socket.off(`joinedNote_${id}`);
        };
    }, [id]);

    // save note handler
    const saveNote = useCallback(async (title: string) => {
        if (saveTimeout) {
            clearTimeout(saveTimeout)
        }

        const timeout = setTimeout(async () => {
            setSaving(true)
            try {
                if (title !== '') {
                    await axiosInstance.put(`/note/${id}/title`, {
                        title: title
                    })
                }
                window.dispatchEvent(new CustomEvent('noteSaved'))
            } catch (error) {
                console.error('Error saving note:', error)
            } finally {
                setSaving(false)
            }
        }, 500) // Delay 500ms

        setSaveTimeout(timeout)
    }, [id])

    // cleanup save timeout
    useEffect(() => {
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout)
            }
        }
    }, [saveTimeout])


    const handleAddTable = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        try {
            const response = await axiosInstance.post(`/table`, {
                noteId: id
            })
            // setBlocks(prevBlocks => [...prevBlocks, {
            //     id: response.data.noteBlock.id,
            //     type: response.data.noteBlock.type,
            //     referenceId: response.data.noteBlock.referenceId,
            //     position: response.data.noteBlock.position
            // }])
        } catch (error) {
            console.error('Error adding table:', error)
        }
    }

    const handleComponentDeleted = (componentId: string) => {
        setBlocks(prevBlocks => prevBlocks.filter((block: Block) =>
            !(block.referenceId === componentId)
        ));
    };

    const handlePositionModalOpen = async () => {
        setIsPositionModalOpen(true)
        try {
            const response = await axiosInstance.get(`/note/${id}/blocks`)
            if (response.data && Array.isArray(response.data.noteBlocks)) {
                setBlocksPosition(response.data.noteBlocks)
            } else {
                console.error('Invalid response format:', response.data)
                setBlocksPosition([])
            }
        } catch (error) {
            console.error('Error fetching blocks:', error)
            setBlocksPosition([])
        }
    }

    const handlePositionModalClose = () => {
        setIsPositionModalOpen(false)
        setSelectedBlock(null)
    }

    const handleBlockSelect = (block: Block) => {
        setSelectedBlock(block)
    }

    const handleMoveBlock = async (direction: 'up' | 'down') => {
        if (!selectedBlock) return

        try {
            const response = await axiosInstance.put(`/note/${id}/block/${selectedBlock.id}/position`, {
                direction
            })

            if (response.data.success) {
                setBlocks(prevBlocks => {
                    const index = prevBlocks.findIndex(b => b.id === selectedBlock.id)
                    if (index === -1) return prevBlocks

                    const newBlocks = [...prevBlocks]
                    const newIndex = direction === 'up' ? index - 1 : index + 1

                    if (newIndex < 0 || newIndex >= newBlocks.length) return prevBlocks

                    const temp = newBlocks[index]
                    newBlocks[index] = newBlocks[newIndex]
                    newBlocks[newIndex] = temp

                    return newBlocks
                })
            }
        } catch (error) {
            console.error('Error moving block:', error)
        }
    }

    useEffect(() => {
        if (isPositionModalOpen) {
            setShouldRender(true)
            const timer = setTimeout(() => {
                setShowModal(true)
            }, 100)
            return () => clearTimeout(timer)
        } else {
            setShowModal(false)
            const timer = setTimeout(() => {
                setShouldRender(false)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isPositionModalOpen])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handlePositionModalClose()
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handlePositionModalClose()
            }
        }

        if (isPositionModalOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isPositionModalOpen])

    return (
        <div className="document-page max-w-[1000px] mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-zinc-700 relative">
                <input
                    type="text"
                    disabled={!editable}
                    value={title ?? ''}
                    onChange={(e) => {
                        setTitle(e.target.value)
                        saveNote(e.target.value)
                    }}
                    className="border-none outline-none bg-transparent text-zinc-300 text-2xl font-bold w-full"
                    placeholder="Untitled Document"
                />
                {saving && <span className="saving-indicator absolute right-0">Saving...</span>}
            </div>
            <div className="menu-bar flex gap-2 flex-wrap p-2 border-b border-zinc-500 bg-zinc-800 rounded-b-lg">
                <div className="flex gap-2">
                    <button
                        onClick={handlePositionModalOpen}
                        className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700`}
                        title="Edit Position"
                    >
                        <GoStack size={16} />
                    </button>
                </div>
                <div className="w-[1px] my-1 bg-zinc-500" />
                <div className="flex gap-2">
                    <button
                        className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700`}
                        title="Document"
                    >
                        <MdEditNote size={16} />
                    </button>
                    <button
                        onClick={handleAddTable}
                        className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700`}
                        title="Table"
                    >
                        <CiViewTable size={16} />
                    </button>
                    <button
                        className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700`}
                        title="Gallery"
                    >
                        <IoMdImages size={16} />
                    </button>
                </div>
            </div>

            {/* Position Modal */}
            {shouldRender && (
                <div className={`fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${showModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div
                        ref={modalRef}
                        className={`bg-zinc-800 p-6 rounded-lg w-[400px] border border-zinc-700 transition-all duration-300 transform ${showModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Atur Posisi Block</h2>
                            <button
                                onClick={handlePositionModalClose}
                                className="text-white hover:text-zinc-300 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {Array.isArray(blocksPosition) && blocksPosition.length > 0 ? (
                                blocksPosition.map((block, index) => (
                                    <div
                                        key={block.id}
                                        className={`p-3 rounded-md cursor-pointer transition-colors ${selectedBlock?.id === block.id
                                                ? 'bg-zinc-700'
                                                : 'bg-zinc-900 hover:bg-zinc-700'
                                            }`}
                                        onClick={() => handleBlockSelect(block)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-white">
                                                {block.type} - {block.details.name}
                                            </span>
                                            {selectedBlock?.id === block.id && editable && (
                                                <div className="flex gap-2">
                                                    {index !== 0 && (
                                                        <button
                                                            onClick={() => handleMoveBlock('up')}
                                                            className="p-1 rounded-md bg-zinc-600 hover:bg-zinc-500 transition-colors"
                                                        >
                                                            <FaRegArrowAltCircleUp />
                                                        </button>
                                                    )}
                                                    {index !== blocksPosition.length - 1 && (
                                                        <button
                                                            onClick={() => handleMoveBlock('down')}
                                                            className="p-1 rounded-md bg-zinc-600 hover:bg-zinc-500 transition-colors"
                                                    >
                                                            <FaRegArrowAltCircleDown />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-zinc-400 py-4">
                                    Tidak ada block yang tersedia
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-4">
                {/* <DocumentEditor
                    noteId={id as string}
                    content=''
                    onChange={(newContent) => {
                    }}
                /> */}
                <div className="space-y-4">
                    {blocks.map((block: Block) => {
                        const BlockComponent = blockRegistry[block.type]
                        if (!BlockComponent) {
                            return null
                        }
                        return (
                            <BlockComponent
                                key={block.id}
                                id={block.referenceId}
                                noteId={id as string}
                                noteEditable={editable}
                                onComponentDeleted={() => handleComponentDeleted(block.referenceId)}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default NotePage