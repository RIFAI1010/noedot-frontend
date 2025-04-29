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
import { FaRegBookmark, FaBookmark, FaRegClipboard } from 'react-icons/fa6'
import { TbCirclesRelation } from "react-icons/tb";
import Modal from '@/components/Modal'
import { useModal } from '@/hooks/useModal'
import BoardNoteComponent from '@/components/Note/boardNoteComponent'

const showNotification = (message?: string, type?: 'success' | 'error') => {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent('showNotification', {
            detail: {
                message: message || 'An unexpected error occurred',
                type: type || 'error'
            }
        });
        window.dispatchEvent(event);
    }
};


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
    const [noteBookmark, setNoteBookmark] = useState(false)
    const [isRelationModalOpen, setIsRelationModalOpen] = useState(false)
    const [shouldRenderRelation, setShouldRenderRelation] = useState(false)
    const [showRelationModal, setShowRelationModal] = useState(false)
    const [relationType, setRelationType] = useState<'table' | 'document' | 'board'>('table')
    const [relationFilter, setRelationFilter] = useState<'my' | 'shared' | 'favorite'>('my')
    const [relationComponents, setRelationComponents] = useState<any[]>([])
    const relationModalRef = useRef<HTMLDivElement>(null)
    const { isOpen: isTagModalOpen, openModal: openTagModal, closeModal: closeTagModal } = useModal()
    const [tag, setTag] = useState('')
    const [editTag, setEditTag] = useState('')
    const [beginDate, setBeginDate] = useState('')
    const [beginDateTimeout, setBeginDateTimeout] = useState<NodeJS.Timeout>()
    const [dueDate, setDueDate] = useState('')
    const [dueDateTimeout, setDueDateTimeout] = useState<NodeJS.Timeout>()
    const [dateStatus, setDateStatus] = useState('')
    
    // fetch note
    const fetchNote = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/note/${id}`)
            setEditable(response.data.canEdit)
            setTag(response.data.tags)
            setBeginDate(response.data.begin)
            setDueDate(response.data.due)
            setDateStatus(response.data.dateStatus)
            setTitle(response.data.title)
            setBlocks(response.data.noteBlocks)
            setNoteBookmark(response.data.favorite)
        } catch (error) {
            console.error('Error fetching note:', error)
        }
    }, [id])

    const handleBeginChange = async (date: string) => {
        setBeginDate(date)

        if (beginDateTimeout) {
            clearTimeout(beginDateTimeout)
        }

        const timeout = setTimeout(async () => {
            try {
                await axiosInstance.put(`/note/${id}/begin`, {
                    date: date
                })
            } catch (error) {
                console.error('Error saving begin date:', error)
            }
            fetchNote()
        }, 1000)

        setBeginDateTimeout(timeout)
    }

    useEffect(() => {
        return () => {
            if (beginDateTimeout) {
                clearTimeout(beginDateTimeout)
            }
        }
    }, [beginDateTimeout])

    const handleDueChange = async (date: string) => {
        setDueDate(date)

        if (dueDateTimeout) {
            clearTimeout(dueDateTimeout)
        }

        const timeout = setTimeout(async () => {
            try {
                await axiosInstance.put(`/note/${id}/due`, {
                    date: date
                })
            } catch (error) {
                console.error('Error saving due date:', error)
            }
            fetchNote()
        }, 1000)

        setDueDateTimeout(timeout)
    }

    useEffect(() => {
        return () => {
            if (dueDateTimeout) {
                clearTimeout(dueDateTimeout)
            }
        }
    }, [dueDateTimeout])

    const handleDueConfirm = async () => {
        try {
            await axiosInstance.post(`/note/${id}/confirm-due`)
            fetchNote()
        } catch (error) {
            console.error('Error confirming due date:', error)
        }
    }

    // // debug
    // useEffect(() => {

    //     const fetchBlocks = async () => {
    //         try {
    //             const response = await axiosInstance.get(`table?filter=favorite`)
    //             console.log('debug: note with table: ', response.data)
    //         } catch (error) {
    //             console.error('Error fetching blocks:', error)
    //         }
    //     }
    //     fetchBlocks()
    // }, [id])

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
            if (data.socketAction === 'updateNoteTag') {
                setTag(data.tags)
            }
            if (data.title) {
                setTitle(data.title);
            }
            if (data.canEdit) {
                console.log('debug: can edit to event: ', data.canEdit)
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
                setBlocks(prevBlocks => {
                    const index = prevBlocks.findIndex(b => b.id === data.blockId)
                    if (index === -1) return prevBlocks

                    const newBlocks = [...prevBlocks]
                    const newIndex = data.direction === 'UP' ? index - 1 : index + 1

                    if (newIndex < 0 || newIndex >= newBlocks.length) return prevBlocks

                    const temp = newBlocks[index]
                    newBlocks[index] = newBlocks[newIndex]
                    newBlocks[newIndex] = temp

                    return newBlocks
                })
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

    const handleAddDocument = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        try {
            const response = await axiosInstance.post(`/document`, {
                noteId: id
            })
        } catch (error) {
            console.error('Error adding document:', error)
        }
    }

    const handleAddBoard = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        try {
            const response = await axiosInstance.post(`/board`, {
                noteId: id
            })
        } catch (error) {
            console.error('Error adding board:', error)
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
                setBlocks(response.data.noteBlocks)
            }
        } catch (error) {
            console.error('Error fetching blocks:', error)
        }
    }

    const handlePositionModalClose = () => {
        setIsPositionModalOpen(false)
        setSelectedBlock(null)
    }

    const handleBlockSelect = (block: Block) => {
        setSelectedBlock(block)
    }

    const handleMoveBlock = async (direction: 'UP' | 'DOWN') => {
        if (!selectedBlock) return

        try {
            const response = await axiosInstance.put(`/note/${id}/block/${selectedBlock.id}/position`, {
                direction
            })

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


    const handleBookmark = async () => {
        try {
            let response
            if (noteBookmark) {
                response = await axiosInstance.delete(`/note/${id}/favorite`)
            } else {
                response = await axiosInstance.post(`/note/${id}/favorite`)
            }
            setNoteBookmark(response.data.favorite)
        } catch (error) {
            console.error('Error bookmarking note:', error)
        }
    }

    const handleRelationModalOpen = () => {
        setIsRelationModalOpen(true)
        fetchRelationComponents()
    }

    const handleRelationModalClose = () => {
        setShowRelationModal(false)
        const timer = setTimeout(() => {
            setIsRelationModalOpen(false)
            setShouldRenderRelation(false)
        }, 300)
        return () => clearTimeout(timer)
    }

    const fetchRelationComponents = async () => {
        try {
            const response = await axiosInstance.get(`/${relationType}?filter=${relationFilter}&noteId=${id}`)
            setRelationComponents(response.data)
        } catch (error) {
            console.error('Error fetching relation components:', error)
        }
    }

    useEffect(() => {
        if (isRelationModalOpen) {
            setShouldRenderRelation(true)
            const timer = setTimeout(() => {
                setShowRelationModal(true)
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isRelationModalOpen])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (relationModalRef.current && !relationModalRef.current.contains(event.target as Node)) {
                handleRelationModalClose()
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleRelationModalClose()
            }
        }

        if (isRelationModalOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isRelationModalOpen])

    useEffect(() => {
        fetchRelationComponents()
    }, [relationType, relationFilter])

    const handleRelationComponentClick = async (component: any) => {
        // console.log('debug: relation component clicked: ', component)
        try {
            const response = await axiosInstance.post(`${component.type}/${component.id}/relation/${id}`)
            console.log('debug: relation component added: ', response.data)
        } catch (error: any) {
            if (error.response.data.serverCode === 'COMPONENTS_ALREADY_RELATED_TO_NOTE') {
                window.dispatchEvent(new CustomEvent('showNotification', {
                    detail: {
                        message: 'Components already related to note',
                        type: 'error'
                    }
                }));
            }
            if (error.response.data.serverCode === 'NOTE_NOT_PUBLIC') {
                window.dispatchEvent(new CustomEvent('showNotification', {
                    detail: {
                        message: 'Note from this component must be public',
                        type: 'error'
                    }
                }));
            } else {
                console.error('Error adding relation:', error)
            }
        } finally {
            handleRelationModalClose()
        }
    }

    const handleEditTag = () => {
        setEditTag(tag)
        openTagModal()
    }

    const hanldeTagUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/note/${id}/tag`, {
                tag: editTag
            });
            closeTagModal();
            showNotification('Note tag updated successfully', 'success');
        } catch (error: any) {
            if (error.response?.data?.message) {
            } else {
            }
        }
    }

    return (
        <div className="document-page max-w-[1000px] mx-auto px-4 mb-30">
            {/* debug */}
            {/* {editable ? 'editable' : 'not editable'} */}
            <Modal
                isOpen={isTagModalOpen}
                onClose={closeTagModal}
                title="Edit Label"
                className="w-[400px]"
            >
                <form className="space-y-4" onSubmit={hanldeTagUpdate}>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Tag
                        </label>
                        <div className="flex items-center justify-between border-1 border-zinc-700 rounded-lg">
                            <div className="relative w-full text-center">
                                <label
                                    title="todo"
                                    htmlFor="tag"
                                    className={`cursor-pointer block px-4 py-2 text-sm rounded-s-lg transition-all  ${editTag === 'todo' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'} cursor-pointer `}
                                >
                                    <input
                                        type="radio"
                                        id="tag"
                                        name="tag"
                                        value="todo"
                                        checked={editTag === 'todo'}
                                        onChange={(e) => setEditTag(e.target.value)}
                                        className={`absolute opacity-0 left-0 w-full h-full cursor-pointer`}
                                    />
                                    Todo
                                </label>
                            </div>
                            <div className="relative w-full text-center">
                                <label
                                    title="progress"
                                    htmlFor="tag"
                                    className={`block px-4 py-2 text-sm transition-all  ${editTag === 'progress' ? 'bg-sky-700 text-white hover:bg-sky-600' : 'text-zinc-500 hover:text-white hover:bg-sky-800'} cursor-pointer`}
                                >
                                    <input
                                        type="radio"
                                        id="tag"
                                        name="tag"
                                        value="progress"
                                        checked={editTag === 'progress'}
                                        onChange={(e) => setEditTag(e.target.value)}
                                        className={`absolute opacity-0 left-0 w-full h-full cursor-pointer`}
                                    />
                                    Progress
                                </label>
                            </div>
                            <div className="relative w-full text-center">
                                <label
                                    title="compete"
                                    htmlFor="tag"
                                    className={`block px-4 py-2 text-sm rounded-e-lg transition-all ${editTag === 'complete' ? 'bg-emerald-700 text-white hover:bg-emerald-600' : 'text-zinc-500 hover:text-white hover:bg-emerald-800'} cursor-pointer`}
                                >
                                    <input
                                        type="radio"
                                        id="tag"
                                        name="tag"
                                        value="complete"
                                        checked={editTag === 'complete'}
                                        onChange={(e) => setEditTag(e.target.value)}
                                        className={`absolute opacity-0 right-0 w-full h-full cursor-pointer`}
                                    />
                                    Complete
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-1">
                        <button
                            type="button"
                            onClick={() => closeTagModal()}
                            className="px-4 py-2 text-sm text-zinc-300 hover:text-white cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-zinc-700 text-white rounded-md hover:bg-zinc-600 cursor-pointer"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>
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
            <div className="menu-bar flex justify-between items-center p-2 border-b border-zinc-500 bg-zinc-800 rounded-b-lg">
                <div className="flex gap-2">
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
                            onClick={handleAddDocument}
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
                            onClick={handleAddBoard}
                            className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700`}
                            title="Board"
                        >
                            <FaRegClipboard size={16} />
                        </button>
                    </div>
                    <div className="w-[1px] my-1 bg-zinc-500" />
                    <div className="flex gap-2">
                        <button
                            onClick={handleRelationModalOpen}
                            className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700`}
                            title="Relation Component"
                        >
                            <TbCirclesRelation size={16} />
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex gap-2">
                    <label
                        className={`status-label py-1 px-2 rounded-md text-white cursor-pointer ${dateStatus === 'progress' ? 'bg-sky-700 hover:bg-sky-500' :
                            dateStatus === 'complete' ? 'bg-emerald-700 hover:bg-emerald-500' : dateStatus === 'confirm to complete' ? 'bg-yellow-700 hover:bg-yellow-500' :
                                    'bg-zinc-700 hover:bg-zinc-500'
                            }`}
                            onClick={e => {
                                if (dateStatus === 'confirm to complete') {
                                    handleDueConfirm()
                                }
                            }}
                    >
                        {dateStatus}
                    </label>
                        <div className="relative text-start">
                            <p className="text-xs text-zinc-400 absolute bottom-0">Begin</p>

                            <input 
                                type="date"
                                value={beginDate ?? ''}
                                onChange={(e) => {
                                    handleBeginChange(e.target.value)
                                }}
                                className="w-32 h-5 rounded-md bg-zinc-700 text-white px-2 py-1 border border-zinc-600 focus:outline-none focus:border-zinc-500"
                                placeholder="Begin"
                            />
                        </div>
                        <div className="relative text-start">
                            <p className="text-xs text-zinc-400 absolute bottom-0">Due</p>
                            <input 
                                type="date"
                                value={dueDate ?? ''}
                                onChange={(e) => {
                                    handleDueChange(e.target.value)
                                }}
                                className="w-32 h-5 rounded-md bg-zinc-700 text-white px-2 py-1 border border-zinc-600 focus:outline-none focus:border-zinc-500" 
                                placeholder="Due"
                            />
                        </div>
                    </div>
                    {/* <label
                        className={`status-label py-1 px-2 rounded-md text-white cursor-pointer ${tag === 'progress' ? 'bg-sky-700 hover:bg-sky-500' :
                                tag === 'complete' ? 'bg-emerald-700 hover:bg-emerald-500' :
                                    'bg-zinc-700 hover:bg-zinc-500'
                            }`}
                        onClick={handleEditTag}
                    >
                        {tag || '....'}
                    </label> */}
                    <button
                        className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700`}
                        title="Save to Bookmark"
                        onClick={handleBookmark}
                    >
                        {noteBookmark ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />}
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
                            <h2 className="text-xl font-bold text-white">Arrange Block Position</h2>
                            <button
                                onClick={handlePositionModalClose}
                                className="text-white hover:text-zinc-300 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {Array.isArray(blocks) && blocks.length > 0 ? (
                                blocks.map((block, index) => (
                                    <div
                                        key={block.id}
                                        className={`p-3 rounded-md cursor-pointer transition-colors ${selectedBlock?.id === block.id
                                            ? 'bg-zinc-700'
                                            : 'bg-zinc-900 hover:bg-zinc-700'
                                            }`}
                                        onClick={() => handleBlockSelect(block)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-200">
                                                {block.type.charAt(0).toUpperCase() + block.type.slice(1)} -
                                                <span className={`${block.details?.name ? 'text-zinc-200' : 'text-zinc-400'} ms-1`}>
                                                    {block.details?.name ?? 'Unnamed Component'}
                                                </span>
                                            </span>
                                            {selectedBlock?.id === block.id && editable && (
                                                <div className="flex gap-2">
                                                    {index !== 0 && (
                                                        <button
                                                            onClick={() => handleMoveBlock('UP')}
                                                            className="p-1 rounded-md bg-zinc-600 hover:bg-zinc-500 transition-colors"
                                                        >
                                                            <FaRegArrowAltCircleUp />
                                                        </button>
                                                    )}
                                                    {index !== blocks.length - 1 && (
                                                        <button
                                                            onClick={() => handleMoveBlock('DOWN')}
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

            {/* Relation Modal */}
            {shouldRenderRelation && (
                <div className={`fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${showRelationModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div
                        ref={relationModalRef}
                        className={`bg-zinc-900 p-6 rounded-lg w-[600px] border border-zinc-700 transition-all duration-300 transform ${showRelationModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Relasi Komponen</h2>
                            <button
                                onClick={handleRelationModalClose}
                                className="text-white hover:text-zinc-300 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Component Type</label>
                                    <div className="flex items-center justify-between border-1 border-zinc-700 rounded-lg">
                                        <div className="relative w-full text-center">
                                            <label
                                                htmlFor="table"
                                                className={`cursor-pointer block px-4 py-2 text-sm rounded-s-lg transition-all ${relationType === 'table' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    id="table"
                                                    name="type"
                                                    value="table"
                                                    checked={relationType === 'table'}
                                                    onChange={(e) => setRelationType(e.target.value as 'table' | 'document' | 'board')}
                                                    className="absolute opacity-0 right-0 w-full h-full cursor-pointer"
                                                />
                                                Table
                                            </label>
                                        </div>
                                        <div className="relative w-full text-center">
                                            <label
                                                htmlFor="document"
                                                className={`cursor-pointer block px-4 py-2 text-sm transition-all ${relationType === 'document' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    id="document"
                                                    name="type"
                                                    value="document"
                                                    checked={relationType === 'document'}
                                                    onChange={(e) => setRelationType(e.target.value as 'table' | 'document' | 'board')}
                                                    className="absolute opacity-0 left-0 w-full h-full cursor-pointer"
                                                />
                                                Document
                                            </label>
                                        </div>
                                        <div className="relative w-full text-center">
                                            <label
                                                htmlFor="           "
                                                className={`cursor-pointer block px-4 py-2 text-sm rounded-e-lg transition-all ${relationType === 'board' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    id="board"
                                                    name="type"
                                                    value="board"
                                                    checked={relationType === 'board'}
                                                    onChange={(e) => setRelationType(e.target.value as 'table' | 'document' | 'board')}
                                                    className="absolute opacity-0 left-0 w-full h-full cursor-pointer"
                                                />
                                                Board
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Filter</label>
                                    <div className="flex items-center justify-between border-1 border-zinc-700 rounded-lg">
                                        <div className="relative w-full text-center">
                                            <label
                                                htmlFor="my"
                                                className={`cursor-pointer block px-4 py-2 text-sm rounded-s-lg transition-all ${relationFilter === 'my' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    id="my"
                                                    name="filter"
                                                    value="my"
                                                    checked={relationFilter === 'my'}
                                                    onChange={(e) => setRelationFilter(e.target.value as 'my' | 'shared' | 'favorite')}
                                                    className="absolute opacity-0 right-0 w-full h-full cursor-pointer"
                                                />
                                                My
                                            </label>
                                        </div>
                                        <div className="relative w-full text-center">
                                            <label
                                                htmlFor="shared"
                                                className={`cursor-pointer block px-4 py-2 text-sm transition-all ${relationFilter === 'shared' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    id="shared"
                                                    name="filter"
                                                    value="shared"
                                                    checked={relationFilter === 'shared'}
                                                    onChange={(e) => setRelationFilter(e.target.value as 'my' | 'shared' | 'favorite')}
                                                    className="absolute opacity-0 left-0 w-full h-full cursor-pointer"
                                                />
                                                Shared
                                            </label>
                                        </div>
                                        <div className="relative w-full text-center">
                                            <label
                                                htmlFor="favorite"
                                                className={`cursor-pointer block px-4 py-2 text-sm rounded-e-lg transition-all ${relationFilter === 'favorite' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    id="favorite"
                                                    name="filter"
                                                    value="favorite"
                                                    checked={relationFilter === 'favorite'}
                                                    onChange={(e) => setRelationFilter(e.target.value as 'my' | 'shared' | 'favorite')}
                                                    className="absolute opacity-0 left-0 w-full h-full cursor-pointer"
                                                />
                                                Favorite
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 max-h-[300px] overflow-y-auto">
                                <div className="space-y-2">
                                    {relationComponents.length > 0 ? (
                                        relationComponents.map((component) => (
                                            <div
                                                key={component.id}
                                                className="p-3 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                                                onClick={() => handleRelationComponentClick(component)}
                                            >
                                                <div className="text-white">
                                                    {component.type.charAt(0).toUpperCase() + component.type.slice(1)} -
                                                    <span className={`${component.name || component.title ? 'text-zinc-200' : 'text-zinc-400'} ms-1`}>
                                                        {component.name || component.title || 'Unnamed Component'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p className="text-zinc-400 text-xs">
                                                        {component.notes[0].title ?? 'Untitled Note'}
                                                    </p>
                                                    <p className="text-zinc-400 text-xs">
                                                        {component.notes[0].user.name}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-zinc-400 py-4">
                                            No components available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-4">
                {/* <DocumentEditor
                    noteId={id as string}
                    content=''
                    onChange={(newContent) => {
                    }}
                /> */}
                <div className="space-y-2">
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
                    {/* <BoardNoteComponent /> */}
                </div>
            </div>
        </div>
    )
}

export default NotePage