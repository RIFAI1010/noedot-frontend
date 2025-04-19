"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaBarsProgress, FaCheck, FaPlus } from "react-icons/fa6";
import { useState, useRef, useEffect } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import Image from "next/image";
import { API_BASE_URL, axiosInstance } from "@/utils/config";
import { BsThreeDots, BsXLg, BsX } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { FaTimes } from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";
import { io } from "socket.io-client";
import { disconnectSocket } from "@/utils/socketClient";
import { connectSocket } from "@/utils/socketClient";

interface SidebarProps {
    open: boolean
    setOpen: (open: boolean) => void
}

interface Note {
    id: string;
    title: string;
    status: string;
    editable: string;
}

interface User {
    id: string;
    name: string;
    email: string;
}

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

const Sidebar = ({ open, setOpen }: SidebarProps) => {
    const [avatar, setAvatar] = useState('/logo.png');
    const [name, setName] = useState('');

    useEffect(() => {
        setAvatar(localStorage.getItem('avatar') || '');
        setName(localStorage.getItem('name') || '');
    }, []);

    const pathname = usePathname();
    const sidebarRef = useRef<HTMLDivElement>(null)

    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdownAction, setShowDropdownAction] = useState(false);
    const [shouldRenderDropdown, setShouldRenderDropdown] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showNoteModalAction, setShowNoteModalAction] = useState(false);
    const [shouldRenderNoteModal, setShouldRenderNoteModal] = useState(false);
    const [noteModalError, setNoteModalError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [status, setStatus] = useState('public');
    const [title, setTitle] = useState('');
    const [editable, setEditable] = useState('');
    const [editNoteId, setEditNoteId] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [noteOwner, setNoteOwner] = useState<boolean>(false);
    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [searchUserResults, setSearchUserResults] = useState<User[]>([]);
    const userSearchRef = useRef<HTMLDivElement>(null);
    const searchUserTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeNoteOptions, setActiveNoteOptions] = useState<string | null>(null);
    const [NoteOptions, setNoteOptions] = useState(false);
    const noteOptionsRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const notesContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Simulasi data user (nanti bisa diganti dengan API call)
    // const mockUsers = [
    //     { id: '1', name: 'John Doe', email: 'john@example.com' },
    //     { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    //     { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
    //     { id: '4', name: 'Alice Johnson', email: 'alice@example.com' },
    //     { id: '5', name: 'Charlie Smith', email: 'charlie@example.com' },
    //     { id: '6', name: 'David Johnson', email: 'david@example.com' },
    //     { id: '7', name: 'Eve Smith', email: 'eve@example.com' },
    //     { id: '8', name: 'Frank Johnson', email: 'frank@example.com' },

    // ];

    // const [mockUsersBefore, setMockUsersBefore] = useState<User[]>([]);
    const [mockUsers, setMockUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchData(true);
    }, [pathname]);
    const fetchData = async (isInitialFetch: boolean = false) => {
        // Hanya fetch jika ini fetch pertama atau pathname berubah
        // if (isInitialFetch) {
        try {
            if (isInitialFetch) setIsLoading(true);
            const response = await axiosInstance.get('/note?my=false');
            setNotes(response.data);
        } catch (error) {
            console.log(error);
            showNotification('Failed to fetch notes', 'error');
        } finally {
            setIsLoading(false);
        }
        // }
    };
    useEffect(() => {
        fetchData()

        // Tambahkan event listener untuk noteSaved
        const handleNoteSaved = () => {
            fetchData()
        }

        window.addEventListener('noteSaved', handleNoteSaved)

        // Cleanup
        return () => {
            window.removeEventListener('noteSaved', handleNoteSaved)
        }
    }, [])

    useEffect(() => {
        const setup = async () => {
            const socket = await connectSocket();
            const payload = JSON.parse(atob(localStorage.getItem('accessToken')!.split('.')[1]));
            if (socket) {
                socket.emit('joinUser', { userId: payload.id });

                socket.on(`joinedUser_${payload.id}`, (data) => {
                    console.log('Joined user:', data);
                    fetchData();
                });
            }
        };

        setup();

        return () => {
            disconnectSocket();
        };
    }, []);

    useEffect(() => {
        if (!pathname) return;
        if (pathname.includes('/note/')) {
            setSelectedNoteId(pathname.split('/note/')[1]);
        } else {
            setSelectedNoteId(null);
        }
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdownAction(false);
            }
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setShowNoteModalAction(false);
            }
            if (noteOptionsRef.current && !noteOptionsRef.current.contains(event.target as Node)) {
                setNoteOptions(false);
            }
            if (userSearchRef.current && !userSearchRef.current.contains(event.target as Node)) {
                setShowUserSearch(false);
            }
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowNoteModalAction(false);
                setShowDropdownAction(false);
                setNoteOptions(false);
                setShowUserSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);


        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, []);

    // Efek untuk mengatur posisi dropdown saat scroll
    useEffect(() => {
        const handleScroll = () => {
            // if (activeNoteOptions && noteOptionsRef.current) {
            //     const iconElement = document.querySelector(`[data-note-id="${activeNoteOptions}"]`) as HTMLElement;
            //     if (iconElement) {
            //         const rect = iconElement.getBoundingClientRect();
            //         setDropdownPosition({
            //             top: rect.top + 30,
            //             left: rect.right + 10
            //         });
            //     }
            // }
            setNoteOptions(false);
            setShowDropdownAction(false);
        };

        const container = notesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => {
                container.removeEventListener('scroll', handleScroll);
            };
        }
    }, [activeNoteOptions]);

    useEffect(() => {
        if (!open) {
            setNoteOptions(false);
        }
    }, [open]);

    useEffect(() => {
        if (showDropdownAction) {
            setShouldRenderDropdown(true);
            const timer = setTimeout(() => {
                setShowDropdown(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setShowDropdown(false);
            const timer = setTimeout(() => {
                setShouldRenderDropdown(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [showDropdownAction]);

    useEffect(() => {
        if (showNoteModalAction) {
            setShouldRenderNoteModal(true);
            const timer = setTimeout(() => {
                setShowNoteModal(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setShowNoteModal(false);
            const timer = setTimeout(() => {
                setShouldRenderNoteModal(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [showNoteModalAction]);

    const handleShowCreateNoteModal = () => {
        setIsEditMode(false);
        setNoteOwner(true);
        setSelectedUsers([]);
        setMockUsers([]);
        // setMockUsersBefore([]);
        setSearchUserResults([]);
        setSearchUserQuery('');
        setShowNoteModalAction(true);
        setShowDropdownAction(false);
        setStatus('private');
        setTitle('');
        setEditable('me');
    }

    const handleShowEditModal = async (noteId: string) => {
        setIsEditMode(true);
        try {
            setSelectedUsers([]);
            setMockUsers([]);
            // setMockUsersBefore([]);
            setSearchUserResults([]);
            setSearchUserQuery('');
            setShowNoteModalAction(true);
            setShowDropdownAction(false);
            setNoteOptions(false);
            setStatus('private');
            setTitle('');
            setEditable('me');
            const response = await axiosInstance.get(`/note/${noteId}`);
            setNoteOwner(response.data.owner);
            setNoteModalError('');
            setEditNoteId(noteId);
            setStatus(response.data.status);
            setTitle(response.data.title);
            setEditable(response.data.editable);
            // setMockUsersBefore(response.data.noteEdits);
            setMockUsers(response.data.noteEdits);
            setSelectedUsers(response.data.noteEdits.map((user: User) => user.id));
        } catch (error) {
            console.log(error);
        }
    }

    const handleCreateNote = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setNoteModalError('');
        try {
            const response = await axiosInstance.post('/note', {
                title,
                status,
                editable,
                userAccess: selectedUsers
            });
            setShowNoteModalAction(false);
            await fetchData();
            router.push(`/note/${response.data.id}`);
            showNotification('Note created successfully', 'success');
        } catch (error: any) {
            if (error.response?.data?.message) {
                setNoteModalError(error.response.data.message);
            } else {
                setNoteModalError('An unexpected error occurred.');
            }
        }
    }

    const handleUpdateNote = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setNoteModalError('');
        try {
            await axiosInstance.put(`/note/${editNoteId}`, {
                title,
                status,
                editable,
                userAccess: selectedUsers
            });
            setShowNoteModalAction(false);
            await fetchData();
            window.dispatchEvent(new CustomEvent('noteUpdated'))
            showNotification('Note updated successfully', 'success');
        } catch (error: any) {
            if (error.response?.data?.message) {
                setNoteModalError(error.response.data.message);
            } else {
                setNoteModalError('An unexpected error occurred.');
            }
        }
    }

    const handleNoteOptionsClick = (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation(); // Mencegah event bubbling ke parent

        // Jika dropdown sudah terbuka untuk note ini, tutup
        if (activeNoteOptions === noteId) {
            setActiveNoteOptions(null);
            setNoteOptions(false);
            return;
        }

        // Dapatkan posisi icon yang diklik
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        // Set posisi dropdown
        setDropdownPosition({
            top: rect.top + 30,
            left: rect.right + 10 // 10px dari kanan icon
        });

        // Buka dropdown
        setActiveNoteOptions(noteId);
        const timer = setTimeout(() => {
            setNoteOptions(true);
        }, 100);
        return () => clearTimeout(timer);
    };

    useEffect(() => {
        if (activeNoteOptions) {
            const timer = setTimeout(() => {
                setNoteOptions(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [activeNoteOptions]);

    // Efek untuk menutup dropdown saat mengklik di luar
    useEffect(() => {
        if (!NoteOptions) {
            const timer = setTimeout(() => {
                setActiveNoteOptions(null);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [NoteOptions]);

    // const handleEditNote = (e: React.MouseEvent, noteId: string) => {
    //     e.stopPropagation();
    //     setActiveNoteOptions(null);
    //     // Implementasi edit note
    //     console.log('Edit note:', noteId);
    // };

    const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation();
        setActiveNoteOptions(null);
        // Implementasi delete note
        console.log('Delete note:', noteId);
    };

    const handleSearch = async (query: string) => {
        setSearchUserQuery(query);
        if (query.length > 0) {
            // Clear previous timeout
            if (searchUserTimeoutRef.current) {
                clearTimeout(searchUserTimeoutRef.current);
            }

            // Set new timeout
            searchUserTimeoutRef.current = setTimeout(async () => {
                try {
                    const results = await axiosInstance.get(`/user/search?q=${query}`);
                    // setMockUsers(mockUsersBefore.concat(results.data));
                    setSearchUserResults(results.data);
                } catch (error) {
                    console.error('Error searching users:', error);
                    setSearchUserResults([]);
                }
            }, 500); // 500ms delay
        } else {
            setSearchUserResults([]);
        }
    };

    const handleSelectUser = (userId: string) => {
        if (!selectedUsers.includes(userId)) {
            setSelectedUsers([...selectedUsers, userId]);
            const newMockUsers = searchUserResults.filter(user => user.id == userId);
            setMockUsers(mockUsers.concat(newMockUsers));
        }
        setSearchUserQuery('');
        setShowUserSearch(false);
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
        setMockUsers(mockUsers.filter(user => user.id !== userId));
    };

    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (searchUserTimeoutRef.current) {
                clearTimeout(searchUserTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-background/30 backdrop-blur-sm z-20 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}
            {/* 'w-68' : 'w-16' */}
            <aside ref={sidebarRef} className={`fixed bg-zinc-900 z-50 text-white h-screen transition-transform duration-600 ease-in-out w-68 ${open ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-4">
                </div>
                <div className="px-4">
                    <div className={`flex flex-col gap-2 bg-zinc-800 border border-zinc-700 p-2 rounded-lg`}>
                        <div className="flex gap-2 flex-1 items-center justify-start w-full">
                            <div className="w-10 h-10 min-w-10 min-h-10 rounded-full overflow-hidden border-2 border-zinc-700">
                                {avatar !== 'null' ? (
                                    <Image src={avatar} alt="avatar" width={40} height={40} />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <span className="text-zinc-400 text-lg font-bold">{name.charAt(0).toUpperCase()}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-md font-bold truncate">{name}</p>
                            <IoSettingsOutline title="Settings" className="text-zinc-300 hover:text-zinc-200 min-w-5 min-h-5 cursor-pointer ml-auto" />
                        </div>
                    </div>
                    <div className={`flex gap-2 py-2 items-center justify-between`}>
                        <p className="text-sm text-zinc-300">My Note</p>
                        <div className="relative" ref={dropdownRef}>
                            <div className="flex items-center justify-center border border-zinc-700 rounded-md">
                                <button
                                    title="Create New Note"
                                    className="flex pe-2 items-center justify-center cursor-pointer hover:bg-zinc-700 p-1"
                                    onClick={handleShowCreateNoteModal}
                                >
                                    <FaPlus className="text-zinc-300" />
                                </button>
                                <div className="absolute h-full w-[2px] bg-zinc-700"></div>
                                <button className="flex ps-2 items-center justify-center cursor-pointer hover:bg-zinc-700 p-1" onClick={() => setShowDropdownAction(!showDropdown)}>
                                    <IoIosArrowDown
                                        className="text-zinc-300"
                                    />
                                </button>
                            </div>
                            {shouldRenderDropdown && (
                                <div className={`absolute left-7 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg z-50 transition-all duration-300 ${showDropdown ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                                    <div className="py-1">
                                        <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                                            New Note
                                        </button>
                                        <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                                            New Folder
                                        </button>
                                        <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                                            Import Note
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-[1px] w-full bg-zinc-700 my-2"></div>
                    <div ref={notesContainerRef} className="flex flex-col gap-1 overflow-y-auto pe-1 max-h-[calc(90vh-10rem)] custom-scrollbar">
                        {/* <div className="bg-zinc-700 hover:bg-zinc-600 cursor-pointer rounded-md p-2">
                                <p className="text-md">My Note</p>
                            </div>
                            <div className=" hover:bg-zinc-700 cursor-pointer rounded-md p-2">
                                <p className="text-md text-zinc-300">My Note</p>
                            </div> */}
                        {isLoading ? (
                            <>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="bg-zinc-700 cursor-pointer rounded-md p-2 min-h-10 animate-pulse">
                                        <div className="h-4 bg-zinc-600 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            notes.length === 0 ? (
                                <div className="text-center py-4 text-zinc-500">
                                    No Notes
                                </div>
                            ) : (
                                notes.map((note: any) => (
                                    <div key={note.id} className={`group rounded-md p-2
                                    ${activeNoteOptions === note.id ? (selectedNoteId === note.id ? 'bg-zinc-600' : 'bg-zinc-700') : (selectedNoteId === note.id ? 'bg-zinc-700 hover:bg-zinc-600' : 'hover:bg-zinc-700')}`} onClick={() => router.push(`/note/${note.id}`)}>
                                        <div className="flex items-center justify-between">
                                            <p className="text-md truncate">{note.title}</p>
                                            <button className="relative">
                                                <BsThreeDots
                                                    title="Options"
                                                    data-note-id={note.id}
                                                    className={`text-lg
                                                        ${activeNoteOptions === note.id
                                                            ? 'opacity-100 ' + (selectedNoteId === note.id ? 'text-zinc-100' : 'text-zinc-200')
                                                            : 'opacity-0 ' + (selectedNoteId === note.id ? 'text-zinc-300 hover:text-zinc-100' : 'text-zinc-400 hover:text-zinc-200')
                                                        }
                                                        group-hover:opacity-100 transition-opacity cursor-pointer`}
                                                    onClick={(e) => handleNoteOptionsClick(e, note.id)}
                                                />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className={`group-hover:opacity-100 transition-opacity ${activeNoteOptions === note.id ? (selectedNoteId === note.id && 'opacity-200') : (selectedNoteId === note.id ? 'opacity-100' : 'opacity-0')} text-xs text-zinc-500`}>{note.status}</p>
                                            <p className={`group-hover:opacity-100 transition-opacity ${activeNoteOptions === note.id ? (selectedNoteId === note.id && 'opacity-200') : (selectedNoteId === note.id ? 'opacity-100' : 'opacity-0')} text-xs text-zinc-500`}>{note.editable}</p>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </aside>

            {/* Note Options Dropdown */}
            {activeNoteOptions && (
                <>
                    <div
                        ref={noteOptionsRef}
                        className={`z-60 fixed w-36 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg transition-all duration-300 ${NoteOptions ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                        style={{
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`,
                            transform: 'translateY(-50%)'
                        }}
                    >
                        <button
                            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                            onClick={() => handleShowEditModal(activeNoteOptions)}
                        >
                            Edit
                        </button>
                        <button
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-zinc-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(e, activeNoteOptions);
                            }}
                        >
                            Delete
                        </button>
                    </div>
                    {/* <div className="fixed inset-0 z-50" /> */}
                </>
            )}

            {shouldRenderNoteModal && (
                <div className={`fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${showNoteModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div ref={modalRef} className={`bg-zinc-900 p-6 rounded-lg w-[400px] border border-zinc-700 transition-all duration-300 transform ${showNoteModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">{isEditMode ? 'Edit Note' : 'Create New Note'}</h2>
                            <button
                                type="button"
                                onClick={() => setShowNoteModalAction(false)}
                                className="text-zinc-400 hover:text-white cursor-pointer"
                            >
                                <BsXLg />
                            </button>
                        </div>
                        <form className="space-y-4" onSubmit={isEditMode ? handleUpdateNote : handleCreateNote}>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg focus:ring-2 bg-zinc-800 border border-zinc-700 focus:ring-zinc-500 focus:border-zinc-500 focus:bg-zinc-700 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter note title"
                                    name="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    disabled={!noteOwner}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                    Status
                                </label>
                                <div>
                                    <div className="flex items-center justify-between border-1 border-zinc-700 rounded-lg">
                                        <div className="relative w-full text-center">
                                            <label
                                                htmlFor="private"
                                                className={`cursor-pointer block px-4 py-2 text-sm rounded-s-lg transition-all ${status === 'private' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'} ${!noteOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <input
                                                    disabled={!noteOwner}
                                                    type="radio"
                                                    id="private"
                                                    name="status"
                                                    value="private"
                                                    checked={status === 'private'}
                                                    onChange={(e) => {
                                                        setStatus(e.target.value)
                                                        setEditable('me')
                                                    }}
                                                    className={`absolute opacity-0 right-0 w-full h-full ${!noteOwner ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                />
                                                Private
                                            </label>
                                        </div>
                                        <div className="relative w-full text-center">
                                            <label
                                                htmlFor="access"
                                                className={`cursor-pointer block px-4 py-2 text-sm transition-all ${status === 'access' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'} ${!noteOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <input
                                                    disabled={!noteOwner}
                                                    type="radio"
                                                    id="access"
                                                    name="status"
                                                    value="access"
                                                    checked={status === 'access'}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    className={`absolute opacity-0 left-0 w-full h-full ${!noteOwner ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                />
                                                Access
                                            </label>
                                        </div>
                                        <div className="relative w-full text-center">
                                            <label
                                                htmlFor="public"
                                                className={`cursor-pointer block px-4 py-2 text-sm rounded-e-lg transition-all ${status === 'public' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'} ${!noteOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <input
                                                    disabled={!noteOwner}
                                                    type="radio"
                                                    id="public"
                                                    name="status"
                                                    value="public"
                                                    checked={status === 'public'}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    className={`absolute opacity-0 left-0 w-full h-full ${!noteOwner ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                />
                                                Public
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                                        Editable
                                    </label>
                                    <div className="flex items-center justify-between border-1 border-zinc-700 rounded-lg">
                                        <div className="relative w-full text-center">
                                            <label
                                                title='Only you can edit'
                                                htmlFor="editable"
                                                className={`cursor-pointer block px-4 py-2 text-sm rounded-s-lg transition-all  ${editable === 'me' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'} ${!noteOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <input
                                                    disabled={!noteOwner}
                                                    type="radio"
                                                    id="editable"
                                                    name="editable"
                                                    value="me"
                                                    checked={editable === 'me'}
                                                    onChange={(e) => setEditable(e.target.value)}
                                                    className={`absolute opacity-0 left-0 w-full h-full ${!noteOwner ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                />
                                                Only Me
                                            </label>
                                        </div>
                                        <div className="relative w-full text-center">
                                            <label
                                                title='User in access list can edit'
                                                htmlFor="editable"
                                                className={`block px-4 py-2 text-sm transition-all  ${editable === 'access' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'} ${status === 'private' || !noteOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <input
                                                    disabled={!noteOwner || status === 'private'}
                                                    type="radio"
                                                    id="editable"
                                                    name="editable"
                                                    value="access"
                                                    checked={editable === 'access'}
                                                    onChange={(e) => setEditable(e.target.value)}
                                                    className={`absolute opacity-0 left-0 w-full h-full ${status === 'private' || !noteOwner ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                />
                                                Have Access
                                            </label>
                                        </div>
                                        <div className="relative w-full text-center">
                                            <label
                                                title={` ${status === 'private' ? 'turn status to public to enable this' : 'Everyone with Link can edit'}`}
                                                htmlFor="nonEditable"
                                                className={`block px-4 py-2 text-sm rounded-e-lg transition-all ${editable === 'everyone' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'} ${status === 'private' || !noteOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <input
                                                    disabled={!noteOwner || status === 'private'}
                                                    type="radio"
                                                    id="nonEditable"
                                                    name="editable"
                                                    value="everyone"
                                                    checked={editable === 'everyone'}
                                                    onChange={(e) => setEditable(e.target.value)}
                                                    className={`absolute opacity-0 right-0 w-full h-full ${status === 'private' || !noteOwner ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                />
                                                Have Link
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                                        Access Users
                                    </label>
                                    {/* {editable !== 'me' && ( */}
                                    <div className="relative" ref={userSearchRef}>
                                        <div className={`flex flex-wrap max-h-14 overflow-y-auto custom-scrollbar gap-2 ${selectedUsers.length > 0 ? 'mb-2' : ''}`}>
                                            {selectedUsers.map(userId => {
                                                const user = mockUsers.find(u => u.id === userId);
                                                return (
                                                    <div key={userId} title={user?.email} className={`flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-md ${editable === 'me' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <span className="text-sm text-zinc-300">{user?.name}</span>
                                                        <button
                                                            disabled={!noteOwner || editable === 'me'}
                                                            title='Remove User'
                                                            onClick={() => handleRemoveUser(userId)}
                                                            className="text-zinc-400 hover:text-zinc-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {noteOwner && (
                                            <input
                                                type="text"
                                                disabled={editable === 'me'}
                                                placeholder="Search users..."
                                                value={searchUserQuery}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                onFocus={() => setShowUserSearch(true)}
                                                className="w-full px-3 py-2 rounded-lg focus:ring-2 bg-zinc-800 border border-zinc-700 focus:ring-zinc-500 focus:border-zinc-500 focus:bg-zinc-700 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        )}
                                        {showUserSearch && searchUserResults.length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-40 overflow-y-auto custom-scrollbar">
                                                {searchUserResults.map(user => (
                                                    <div
                                                        key={user.id}
                                                        className="px-3 py-2 hover:bg-zinc-800 cursor-pointer flex items-center justify-between"
                                                        onClick={() => handleSelectUser(user.id)}
                                                    >
                                                        <div>
                                                            <p className="text-sm text-zinc-300">{user.name}</p>
                                                            <p className="text-xs text-zinc-500">{user.email}</p>
                                                        </div>
                                                        {selectedUsers.includes(user.id) && (
                                                            // <span className="text-green-400">✓</span>
                                                            <FaCheck className="text-green-400" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* )} */}
                                </div>
                            </div>
                            {noteModalError && (
                                <p className="text-red-400 text-sm">
                                    {noteModalError}
                                </p>
                            )}
                            {noteOwner && (
                                <div className="flex justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowNoteModalAction(false)}
                                        className="px-4 py-2 text-sm text-zinc-300 hover:text-white cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm bg-zinc-700 text-white rounded-md hover:bg-zinc-600 cursor-pointer"
                                    >
                                        {isEditMode ? 'Save Changes' : 'Create Note'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
