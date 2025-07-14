'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { TiDelete } from 'react-icons/ti'
import { RxDragHandleDots2 } from "react-icons/rx";
import { ModalProps } from './modalAlert';
import { ModalAlert } from './modalAlert';
import Link from 'next/link';
import { axiosInstance } from '@/utils/config';
import { getSocket } from '@/utils/socketClient';

interface Card {
    id: string
    title: string
    description: string
}

interface Column {
    id: string
    title: string
    cards: Card[]
    position: number
}

interface BoardProps {
    id: string;
    noteId: string;
    noteEditable: boolean;
    onComponentDeleted?: () => void;
}

export default function BoardNoteComponent({ id, noteId, noteEditable, onComponentDeleted }: BoardProps) {
    const [name, setName] = useState<string>('')
    const [saving, setSaving] = useState(false)
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout>()
    const [editable, setEditable] = useState(false)
    const [editableNote, setEditableNote] = useState(noteEditable)
    const [isSourceNote, setIsSourceNote] = useState(false)
    const [sourceNote, setSourceNote] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [boardRelationAccessDenied, setBoardRelationAccessDenied] = useState({
        isAccessDenied: false,
        message: ''
    })
    const [boardId, setBoardId] = useState<string>('')
    const [columns, setColumns] = useState<Column[]>([
        // {
        //     id: '1',
        //     title: 'To Do',
        //     cards: [
        //         { id: '1', title: 'Task 1', description: 'Description 1' },
        //         { id: '2', title: 'Task 2', description: 'Description 2' },
        //         { id: '5', title: 'Task 5', description: 'Description 5' },
        //     ],
        // },
        // {
        //     id: '2',
        //     title: 'In Progress',
        //     cards: [
        //         { id: '3', title: 'Task 3', description: 'Description 3' },
        //     ],
        // },
        // {
        //     id: '3',
        //     title: 'Done',
        //     cards: [
        //         { id: '4', title: 'Task 4', description: 'Description 4' },
        //     ],
        // },
    ])
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: '',
        id: '',
        extraId: '',
        title: '',
        message: '',
        confirmButtonText: '',
        cancelButtonText: '',
        confirmButtonColor: ''
    })
    const [draggedItem, setDraggedItem] = useState<{
        cardId: string;
        columnId: string;
        startIndex: number;
    } | null>(null);
    const [columnSaveTimeout, setColumnSaveTimeout] = useState<NodeJS.Timeout>()
    const [cardSaveTimeout, setCardSaveTimeout] = useState<NodeJS.Timeout>()
    const [cardMoveTimeout, setCardMoveTimeout] = useState<NodeJS.Timeout>()



    useEffect(() => {
        setEditableNote(noteEditable)
    }, [noteEditable])


    const fetchBoard = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get(`/board/${id}?detail=true`)
            setBoardRelationAccessDenied({
                isAccessDenied: false,
                message: ''
            })
            setBoardId(response.data.id)
            setEditable(response.data.canEdit)
            setIsSourceNote(response.data.isSourceNote)
            if (response.data.name) {
                setName(response.data.name)
            }

            if (!response.data.isSourceNote) {
                const sourceNoteResponse = await axiosInstance.get(`/note/${response.data.sourceNoteId}`)
                setSourceNote(sourceNoteResponse.data)
            }
            setColumns(response.data.columns)
        } catch (error: any) {
            if (error.response.data.serverCode === 'BOARD_RELATION_ACCESS_DENIED') {
                setBoardRelationAccessDenied({
                    isAccessDenied: true,
                    message: error.response.data.message
                })
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!boardId) return;
        const socket = getSocket();
        if (!socket) return;
        socket.emit('joinBoard', { boardId });
        socket.on(`joinedBoard_${boardId}`, (data) => {
            console.log('Joined board:', data);
            if (data.socketAction === 'updateBoardName') {
                setName(data.name)
            }
            if (data.socketAction === 'createColumn') {
                // setColumns([...columns, response.data])
                setColumns(prevColumns => [...prevColumns, data.newColumn])
            }
            if (data.socketAction === 'updateColumn') {
                // setColumns(
                //     columns.map((column) =>
                //         column.id === data.updatedColumn.id ? { ...column, title: data.updatedColumn.title } : column
                //     )
                // )
                setColumns(prevColumns =>
                    prevColumns.map(col => col.id === data.updatedColumn.id ? {
                        ...col, title: data.updatedColumn.title
                    } : col))
            }
            if (data.socketAction === 'deleteColumn') {
                // const updatedColumns = columns
                //     .filter(col => col.id !== data.deletedColumn.id)
                //     .map((col, index) => ({
                //         ...col,
                //         position: index
                //     }));
                // setColumns(updatedColumns);
                setColumns(prevColumns =>
                    prevColumns.filter(col => col.id !== data.deletedColumn.id))
            }
            if (data.socketAction === 'createCard') {
                // setColumns(
                //     columns.map((column) =>
                //         column.id === data.newCard.boardColumnId
                //             ? { ...column, cards: [...column.cards, data.newCard] }
                //             : column
                //     )
                // )
                setColumns(prevColumns =>
                    prevColumns.map(col => col.id === data.newCard.boardColumnId ? {
                        ...col, cards: [...col.cards, data.newCard]
                    } : col))
            }
            if (data.socketAction === 'updateCard') {
                // setColumns(
                //     columns.map((column) =>
                //         column.id === data.updatedCard.boardColumnId
                //             ? {
                //                 ...column,
                //                 cards: column.cards.map((card) =>
                //                     card.id === data.updatedCard.id ? { ...card, ...data.updatedCard } : card
                //                 ),
                //             }
                //             : column
                //     )
                // )
                setColumns(prevColumns =>
                    prevColumns.map(col => col.id === data.updatedCard.boardColumnId ? {
                        ...col, cards: col.cards.map(card => card.id === data.updatedCard.id ? { ...card, ...data.updatedCard } : card)
                    } : col))
            }
            if (data.socketAction === 'deleteCard') {
                // setColumns(columns.map(col => {
                //     if (col.id === data.deletedCard.boardColumnId) {
                //         const updatedCards = col.cards
                //             .filter(card => card.id !== data.deletedCard.id)
                //             .map((card, index) => ({
                //                 ...card,
                //                 position: index
                //             }));
                //         return { ...col, cards: updatedCards };
                //     }
                //     return col;
                // }));
                setColumns(prevColumns =>
                    prevColumns.map(col => col.id === data.deletedCard.boardColumnId ? {
                        ...col, cards: col.cards.filter(card => card.id !== data.deletedCard.id)
                    } : col))
            }
            if (data.socketAction === 'updateCardPositionAndColumn') {
                setColumns(prevColumns => {
                    // Update old column
                    const updatedColumns = prevColumns.map(col => {
                        if (col.id === data.updatedCards.fromColumnId) {
                            return { ...col, cards: data.updatedCards.oldColumnCards };
                        }
                        if (col.id === data.updatedCards.toColumnId) {
                            return { ...col, cards: data.updatedCards.newColumnCards };
                        }
                        return col;
                    });
                    return updatedColumns;
                });
            }
            if (data.socketAction === 'updateCardPosition') {
                // setColumns(prevColumns =>
                //     prevColumns.map(col => col.id === data.columnId ? {
                //         ...col, cards: data.updatedCards
                //     } : col)
                // );
                // setColumns(columns.map(col => {
                //         return col.id === data.columnId ? { ...col, cards: data.updatedCards } : col;
                //     }));
            }
        });
        return () => {
            console.log('Leaving board socket:', boardId);
            socket.emit('leaveBoard');
            socket.off(`joinedBoard_${boardId}`);
        };
    }, [boardId]);

    useEffect(() => {
        fetchBoard()

        const handleCanEdit = (e: CustomEvent) => {
            setEditableNote(e.detail.canEdit)
            console.log('board said can edit', e.detail.canEdit)
        }

        window.addEventListener('canEdit', handleCanEdit as EventListener)

        // Cleanup
        return () => {
            window.removeEventListener('canEdit', handleCanEdit as EventListener)
        }
    }, [])

    // save table handler
    const saveBoard = useCallback(async (name: string) => {
        if (saveTimeout) {
            clearTimeout(saveTimeout)
        }

        const timeout = setTimeout(async () => {
            setSaving(true)
            try {
                if (name !== '') {
                    await axiosInstance.put(`/board/${boardId}/title`, {
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
    }, [boardId])

    // cleanup save timeout
    useEffect(() => {
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout)
            }
        }
    }, [saveTimeout])


    const addColumn = async () => {
        // const newColumn: Column = {
        //     id: Date.now().toString(),
        //     title: 'New Column',
        //     cards: [],
        // }
        // setColumns([...columns, newColumn])
        try {
            const response = await axiosInstance.post(`/board/${boardId}/column`)
            // setColumns([...columns, response.data])
        } catch (error) {
            console.error('Error adding column:', error)
        }
    }

    const addCard = async (columnId: string) => {
        // const newCard: Card = {
        //     id: Date.now().toString(),
        //     title: 'New Card',
        //     description: '',
        // }
        try {
            const response = await axiosInstance.post(`/board/${boardId}/card`, {
                columnId: columnId
            })
            // setColumns(
            //     columns.map((column) =>
            //         column.id === columnId
            //             ? { ...column, cards: [...column.cards, response.data] }
            //             : column
            //     )
            // )
        } catch (error) {
            
        }
        
    }

    const updateCard = (columnId: string, cardId: string, updates: Partial<Card>) => {
        setColumns(
            columns.map((column) =>
                column.id === columnId
                    ? {
                        ...column,
                        cards: column.cards.map((card) =>
                            card.id === cardId ? { ...card, ...updates } : card
                        ),
                    }
                    : column
            )
        )
        if (cardSaveTimeout) {
            clearTimeout(cardSaveTimeout)
        }
        const timeout = setTimeout(async () => {
            try {
                await axiosInstance.put(`/board/card/${cardId}`, {
                    title: updates.title,
                    description: updates.description
                })
            } catch (error) {
                console.error('Error updating card:', error)
            }
        }, 1000)
        setCardSaveTimeout(timeout)
    }
    useEffect(() => {
        return () => {
            if (cardSaveTimeout) {
                clearTimeout(cardSaveTimeout)
            }
        }
    }, [cardSaveTimeout])

    const updateColumnTitle = async (columnId: string, title: string) => {
        setColumns(
            columns.map((column) =>
                column.id === columnId ? { ...column, title } : column
            )
        )
        if (columnSaveTimeout) {
            clearTimeout(columnSaveTimeout)
        }
        const timeout = setTimeout(async () => {
            try {
                await axiosInstance.put(`/board/column/${columnId}`, {
                    title: title
                })
            } catch (error) {
                console.error('Error updating column title:', error)
            }
        }, 1000)
        setColumnSaveTimeout(timeout)
    }

    useEffect(() => {
        return () => {
            if (columnSaveTimeout) {
                clearTimeout(columnSaveTimeout)
            }
        }
    }, [columnSaveTimeout])

    const handleDragStart = (e: React.DragEvent, cardId: string, columnId: string, index: number) => {
        setDraggedItem({ cardId, columnId, startIndex: index });

        if (e.dataTransfer.setDragImage) {
            const dragElement = e.currentTarget as HTMLElement;
            e.dataTransfer.setDragImage(dragElement, 20, 20);
        }

        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, columnId: string, index: number) => {
        e.preventDefault();

        if (!draggedItem) return;

        const sourceColumn = columns.find(col => col.id === draggedItem.columnId);
        const targetColumn = columns.find(col => col.id === columnId);
        if (!sourceColumn) return;

        // If dragging to a different column
        if (draggedItem.columnId !== columnId) {
            // Create new arrays for both columns
            const newSourceCards = [...sourceColumn.cards];
            const newTargetCards = targetColumn ? [...targetColumn.cards] : [];

            // Remove card from source column
            const [draggedCard] = newSourceCards.splice(draggedItem.startIndex, 1);

            // Insert card into target column
            newTargetCards.splice(index, 0, draggedCard);

            // Update both columns
            // setColumns(columns.map(col => {
            //     if (col.id === draggedItem.columnId) {
            //         return { ...col, cards: newSourceCards };
            //     }
            //     if (col.id === columnId) {
            //         return { ...col, cards: newTargetCards };
            //     }
            //     return col;
            // }));

            // Update dragged item info
            setDraggedItem({ ...draggedItem, columnId, startIndex: index });

            // Send update to backend with debounce
            if (cardMoveTimeout) {
                clearTimeout(cardMoveTimeout);
            }
            const timeout = setTimeout(async () => {
                try {
                    await axiosInstance.put(`/board/card/${draggedItem.cardId}/position`, {
                        columnId: columnId,
                        position: index
                    });
                } catch (error) {
                    console.error('Error moving card:', error);
                    fetchBoard();
                }
            }, 500);
            setCardMoveTimeout(timeout);
        } else {
            // Same column drag logic
            if (draggedItem.startIndex === index) return;

            const newCards = [...sourceColumn.cards];
            const [draggedCard] = newCards.splice(draggedItem.startIndex, 1);
            newCards.splice(index, 0, draggedCard);

            setColumns(columns.map(col => {
                return col.id === columnId ? { ...col, cards: newCards } : col;
            }));

            setDraggedItem({ ...draggedItem, startIndex: index });

            // Send update to backend with debounce
            if (cardMoveTimeout) {
                clearTimeout(cardMoveTimeout);
            }
            const timeout = setTimeout(async () => {
                try {
                    await axiosInstance.put(`/board/card/${draggedItem.cardId}/position`, {
                        columnId: columnId,
                        position: index
                    });
                } catch (error) {
                    console.error('Error moving card:', error);
                    fetchBoard();
                }
            }, 500);
            setCardMoveTimeout(timeout);
        }
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    // Cleanup timeout
    useEffect(() => {
        return () => {
            if (cardMoveTimeout) {
                clearTimeout(cardMoveTimeout);
            }
        }
    }, [cardMoveTimeout]);

    const deleteColumn = (columnId: string) => {
        setModalState({
            isOpen: true,
            type: 'column',
            id: columnId,
            extraId: '',
            title: 'Delete Column',
            message: 'Are you sure you want to delete this column? This action cannot be undone.',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: 'danger'
        })
    }

    const deleteCard = (columnId: string, cardId: string) => {
        setModalState({
            isOpen: true,
            type: 'card',
            id: cardId,
            extraId: columnId,
            title: 'Delete Card',
            message: 'Are you sure you want to delete this card? This action cannot be undone.',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: 'danger'
        })
    }

    const handleDeleteBoard = async () => {
        setModalState({
            isOpen: true,
            type: 'board',
            id: id,
            extraId: '',
            title: 'Delete Board',
            message: 'Are you sure you want to delete this board? This action cannot be undone.',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: 'danger'
        })
    }


    const handleModalConfirm = async () => {
        try {
            if (modalState.type === 'column') {
                const response = await axiosInstance.delete(`/board/column/${modalState.id}`)
                // Filter out the deleted column and update positions
                // const updatedColumns = columns
                //     .filter(col => col.id !== response.data.id)
                //     .map((col, index) => ({
                //         ...col,
                //         position: index
                //     }));
                // setColumns(updatedColumns);
            } else if (modalState.type === 'card') {
                const response = await axiosInstance.delete(`/board/card/${modalState.id}`)
                // Update the column's cards with new positions
                // setColumns(columns.map(col => {
                //     if (col.id === modalState.extraId) {
                //         const updatedCards = col.cards
                //             .filter(card => card.id !== modalState.id)
                //             .map((card, index) => ({
                //                 ...card,
                //                 position: index
                //             }));
                //         return { ...col, cards: updatedCards };
                //     }
                //     return col;
                // }));
            } else if (modalState.type === 'board') {
                await axiosInstance.delete(`/board/${modalState.id}`)
                if (onComponentDeleted) {
                    onComponentDeleted();
                }
            }
        } catch (error) {
            console.error('Error handling modal confirm:', error);
        } finally {
            setModalState(prev => ({ ...prev, isOpen: false }))
        }
    }
    const handleModalClose = () => {
        setModalState(prev => ({ ...prev, isOpen: false }))
    }

    return (
        <>
            <ModalAlert
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                title={modalState.title}
                message={modalState.message}
                confirmButtonText={modalState.confirmButtonText}
                cancelButtonText={modalState.cancelButtonText}
                confirmButtonColor={modalState.confirmButtonColor as ModalProps['confirmButtonColor']}
            />
            {loading || boardRelationAccessDenied.isAccessDenied ? (

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
                                title="Delete Board"
                            // onClick={() => handleDeleteDocument()}
                            >
                                <TiDelete size={16} />
                            </button>
                        )}
                        <p className="text-zinc-300 text-lg">{boardRelationAccessDenied.message || 'Board not found'}</p>
                    </div>
                )
            ) : (
                <div className='overflow-x-auto max-w-[100vw] overflow-y-hidden'>
                    <div className="bg-zinc-800 rounded-lg p-4">
                        {!isSourceNote && sourceNote && (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <p className="text-zinc-300 text-sm">Table From</p>
                                    <Link href={`/note/${sourceNote.id}`} className="text-blue-500 hover:text-blue-600">
                                        {sourceNote.title}
                                    </Link>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-start items-center mb-4 relative gap-2">
                            {(editableNote || editable) && (
                                <button
                                    className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md hover:bg-zinc-600 cursor-pointer"
                                    title="Delete Board"
                                    onClick={() => handleDeleteBoard()}
                                >
                                    <TiDelete size={16} />
                                </button>
                            )}
                            <input
                                type="text"
                                className="border-none outline-none text-zinc-300 text-lg font-bold w-full bg-transparent shadow-md p-1 rounded-md"
                                placeholder="Table Name"
                                value={name ?? ''}
                                disabled={!editable}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    saveBoard(e.target.value)
                                }}
                            />
                            {(editableNote || editable) && (
                                <button
                                    onClick={addColumn}
                                    className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors"
                                >
                                    +
                                </button>
                            )}
                            {saving && <span className="saving-indicator absolute right-0">Saving...</span>}
                        </div>
                        {/* <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-semibold text-zinc-200">Board View</h1>
                            <button
                                onClick={addColumn}
                                className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors"
                            >
                                +
                            </button>
                        </div> */}
                        <div className="flex gap-4 pb-4 custom-scrollbar">
                            {
                                columns.length === 0 ? (
                                    <div className="bg-zinc-800 rounded-lg p-4 text-center w-full">
                                        <p className="text-zinc-400">No columns yet</p>
                                        <p className="text-zinc-500 text-sm">Click + to add a column</p>
                                    </div>
                                ) : (
                                    columns.sort((a, b) => a.position - b.position).map((column) => (
                                        <div
                                            key={column.id}
                                            className="flex-shrink-0 lg:w-80 w-60 bg-zinc-900 rounded-lg p-4 min-h-[300px]"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                {(editableNote || editable) && (

                                                    <button
                                                    className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md hover:bg-zinc-600 cursor-pointer"
                                                    title="Delete Column"
                                                    onClick={() => deleteColumn(column.id)}
                                                    >
                                                        <TiDelete size={16} />
                                                    </button>
                                                    )}
                                                    <input
                                                        type="text"
                                                        value={column.title ?? ''}
                                                        onChange={(e) => updateColumnTitle(column.id, e.target.value)}
                                                        placeholder="Column Title"
                                                        className="bg-transparent text-zinc-200 font-semibold border-none outline-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => addCard(column.id)}
                                                    className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                                                    title="Add Card"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div
                                                data-column-id={column.id}
                                                className="space-y-2 min-h-[50px]"
                                                onDragOver={(e) => {
                                                    if (column.cards.length === 0) {
                                                        handleDragOver(e, column.id, 0)
                                                    }
                                                }}
                                            >
                                                {column.cards?.length === 0 ? (
                                                    <div className="bg-zinc-800 rounded-lg p-4 text-center">
                                                        <p className="text-zinc-400">No cards yet</p>
                                                        <p className="text-zinc-500 text-sm">Click + to add a card</p>
                                                    </div>
                                                ) : (
                                                    column.cards.map((card, index) => (
                                                        <div
                                                            key={card.id}
                                                            draggable={true}
                                                            onDragStart={(e) => handleDragStart(e, card.id, column.id, index)}
                                                            onDragOver={(e) => handleDragOver(e, column.id, index)}
                                                            onDragEnd={handleDragEnd}
                                                            className={`bg-zinc-800 rounded-lg flex items-center ${draggedItem?.cardId === card.id ? 'border-2 border-zinc-200' : ''
                                                                }`}
                                                        >
                                                            <div className="column-handle cursor-move text-zinc-400 hover:text-zinc-200 px-3 lg:px-1">
                                                                <RxDragHandleDots2 className="text-xl" />
                                                            </div>

                                                            <div className='bg-zinc-700 rounded-lg py-3 px-2 w-full'>
                                                                <div className='flex items-center justify-between'>
                                                                {(editableNote || editable) && (

                                                                    <button
                                                                        className="bg-zinc-700 text-zinc-300 cursor-pointer items-center justify-center px-1"
                                                                        title="Delete Card"
                                                                        onClick={() => deleteCard(column.id, card.id)}
                                                                        >
                                                                        <TiDelete size={16} />
                                                                    </button>
                                                                    )}
                                                                    <input
                                                                        type="text"
                                                                        disabled={!editable}
                                                                        value={card.title ?? ''}
                                                                        placeholder="Title..."
                                                                        onChange={(e) =>
                                                                            updateCard(column.id, card.id, { title: e.target.value })
                                                                        }
                                                                        className="w-full bg-transparent text-zinc-200 font-medium border-none outline-none mb-1"
                                                                    />
                                                                </div>
                                                                <textarea
                                                                    value={card.description ?? ''}
                                                                    disabled={!editable}
                                                                    onChange={(e) =>
                                                                        updateCard(column.id, card.id, { description: e.target.value })
                                                                    }
                                                                    placeholder="Description..."
                                                                    className="w-full bg-transparent text-zinc-400 text-sm border-none outline-none resize-none"
                                                                    rows={1}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )
                                    ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}