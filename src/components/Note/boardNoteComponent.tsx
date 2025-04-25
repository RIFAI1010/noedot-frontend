'use client'

import { useState, useEffect, useRef } from 'react'
import Sortable from 'sortablejs'

interface Card {
    id: string
    title: string
    description: string
}

interface Column {
    id: string
    title: string
    cards: Card[]
}

export default function BoardNoteComponent() {
    const [stateTest, setStateTest] = useState([])
    const [debugColumns, setDebugColumns] = useState<Column[]>([
        {
            id: '1',
            title: 'To Do',
            cards: [
                { id: '1', title: 'Task 1', description: 'Description 1' },
                { id: '2', title: 'Task 2', description: 'Description 2' },
                { id: '5', title: 'Task 5', description: 'Description 5' },
            ],
        },
    ])
    const [columns, setColumns] = useState<Column[]>([
        {
            id: '1',
            title: 'To Do',
            cards: [
                { id: '1', title: 'Task 1', description: 'Description 1' },
                { id: '2', title: 'Task 2', description: 'Description 2' },
                { id: '5', title: 'Task 5', description: 'Description 5' },
            ],
        },
        {
            id: '2',
            title: 'In Progress',
            cards: [
                { id: '3', title: 'Task 3', description: 'Description 3' },
            ],
        },
        {
            id: '3',
            title: 'Done',
            cards: [
                { id: '4', title: 'Task 4', description: 'Description 4' },
            ],
        },
    ])

    const columnsRef = useRef<HTMLDivElement>(null)
    const columnRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const sortableInstances = useRef<{ [key: string]: Sortable | null }>({})

    useEffect(() => {
        // Initialize Sortable for columns
        if (columnsRef.current) {
            const columnsSortable = new Sortable(columnsRef.current, {
                animation: 150,
                handle: '.column-handle',
                onEnd: (evt) => {
                    const { oldIndex, newIndex } = evt
                    if (oldIndex !== undefined && newIndex !== undefined) {
                        const newColumns = [...columns]
                        const [movedColumn] = newColumns.splice(oldIndex, 1)
                        newColumns.splice(newIndex, 0, movedColumn)
                        setColumns(newColumns)
                        // // setDebugColumns(newColumns)
                        // const event = new CustomEvent('setColumnsEvent', {
                        //     detail: {
                        //         columns: newColumns
                        //     }
                        // })
                        // window.dispatchEvent(event)
                        // console.log(newColumns)
                    }
                },
            })
        }

        // Initialize Sortable for each column's cards
        columns.forEach((column) => {
            const columnElement = columnRefs.current[column.id]
            if (columnElement && !sortableInstances.current[column.id]) {
                const sortable = new Sortable(columnElement, {
                    group: 'cards',
                    animation: 150,
                    onEnd: (evt) => {
                        const { from, to, oldIndex, newIndex } = evt
                        if (oldIndex !== undefined && newIndex !== undefined) {
                            const fromColumnId = from.getAttribute('data-column-id')
                            const toColumnId = to.getAttribute('data-column-id')
                            
                            if (fromColumnId && toColumnId) {
                                const newColumns = [...columns]
                                const fromColumn = newColumns.find(col => col.id === fromColumnId)
                                const toColumn = newColumns.find(col => col.id === toColumnId)
                                
                                if (fromColumn && toColumn) {
                                    const [movedCard] = fromColumn.cards.splice(oldIndex, 1)
                                    toColumn.cards.splice(newIndex, 0, movedCard)
                                    setColumns(newColumns)
                                    // const timer = setTimeout(() => {
                                    //     setColumns(newColumns)
                                    //     clearTimeout(timer)
                                    // }, 1000)
                                    // setDebugColumns(newColumns)
                                    // const event = new CustomEvent('setColumnsEvent', {
                                    //     detail: {
                                    //         columns: newColumns
                                    //     }
                                    // })
                                    // window.dispatchEvent(event)
                                    // console.log(newColumns)
                                }
                            }
                        }
                    },
                })
                sortableInstances.current[column.id] = sortable
            }
        })

        // Cleanup function
        return () => {
            // Destroy all Sortable instances
            Object.values(sortableInstances.current).forEach(instance => {
                if (instance) {
                    instance.destroy()
                }
            })
            sortableInstances.current = {}
        }
    }, [columns])

    const addColumn = () => {
        const newColumn: Column = {
            id: Date.now().toString(),
            title: 'New Column',
            cards: [],
        }
        setColumns([...columns, newColumn])
    }

    useEffect(() => {
        const handleSetColumns = (event: CustomEvent) => {
            console.log('setColumnsEvent');
            console.log(event.detail);
            // setColumns(event.detail.columns)
            // setDebugColumns(event.detail.columns)
            setStateTest(event.detail.columns[0].cards)
        };
    
        window.addEventListener('setColumnsEvent', handleSetColumns as EventListener);
        return () => {
          window.removeEventListener('setColumnsEvent', handleSetColumns as EventListener);
        };
      }, []);

    const debug = () => {
        // setColumns(debugColumns)
        console.log(stateTest);
    }

    const addCard = (columnId: string) => {
        const newCard: Card = {
            id: Date.now().toString(),
            title: 'New Card',
            description: '',
        }
        setColumns(
            columns.map((column) =>
                column.id === columnId
                    ? { ...column, cards: [...column.cards, newCard] }
                    : column
            )
        )
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
    }

    const updateColumnTitle = (columnId: string, title: string) => {
        setColumns(
            columns.map((column) =>
                column.id === columnId ? { ...column, title } : column
            )
        )
    }

    return (
        <div className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-zinc-200">Board View</h1>
                <button
                    onClick={addColumn}
                    className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                    Add Column
                </button>
                {/* debug */}
                <button
                    onClick={debug}
                    className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                    Debug
                </button>
            </div>
            <div ref={columnsRef} className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className="flex-shrink-0 w-80 bg-zinc-900 rounded-lg p-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="column-handle cursor-move text-zinc-400 hover:text-zinc-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="9" cy="5" r="1"></circle>
                                        <circle cx="9" cy="12" r="1"></circle>
                                        <circle cx="9" cy="19" r="1"></circle>
                                        <circle cx="15" cy="5" r="1"></circle>
                                        <circle cx="15" cy="12" r="1"></circle>
                                        <circle cx="15" cy="19" r="1"></circle>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={column.title}
                                    onChange={(e) => updateColumnTitle(column.id, e.target.value)}
                                    className="bg-transparent text-zinc-200 font-semibold border-none outline-none"
                                />
                            </div>
                            <button
                                onClick={() => addCard(column.id)}
                                className="text-zinc-400 hover:text-zinc-200"
                            >
                                +
                            </button>
                        </div>
                        <div
                            ref={(el) => {
                                columnRefs.current[column.id] = el
                            }}
                            data-column-id={column.id}
                            className="space-y-2 min-h-[50px]"
                        >
                            {column.cards.map((card) => (
                                <div
                                    key={card.id}
                                    className="bg-zinc-700 rounded-lg p-3 hover:bg-zinc-500 transition-colors cursor-move"
                                >
                                    <input
                                        type="text"
                                        value={card.title}
                                        onChange={(e) =>
                                            updateCard(column.id, card.id, { title: e.target.value })
                                        }
                                        className="w-full bg-transparent text-zinc-200 font-medium border-none outline-none mb-1"
                                    />
                                    <textarea
                                        value={card.description}
                                        onChange={(e) =>
                                            updateCard(column.id, card.id, { description: e.target.value })
                                        }
                                        className="w-full bg-transparent text-zinc-400 text-sm border-none outline-none resize-none"
                                        rows={1}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
