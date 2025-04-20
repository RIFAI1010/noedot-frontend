'use client'
import { axiosInstance } from '@/utils/config';
import React, { useEffect, useState } from 'react';
import { FaPlus, FaStar } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

// const notes = [
//     { id: 1, title: 'Note 1', content: 'Ini isi note pertama.', isFavorite: true },
//     { id: 2, title: 'Note 2', content: 'Ini isi note kedua.', isFavorite: false },
//     { id: 3, title: 'Note 3', content: 'Ini isi note ketiga.', isFavorite: true },
//     { id: 4, title: 'Note 4', content: 'Ini isi note keempat.', isFavorite: false },
//     { id: 5, title: 'Note 5', content: 'Ini isi note kelima.', isFavorite: true },
//     { id: 6, title: 'Note 6', content: 'Ini isi note keenam.', isFavorite: false },
//     { id: 7, title: 'Note 7', content: 'Ini isi note ketujuh.', isFavorite: true },
//     { id: 8, title: 'Note 8', content: 'Ini isi note kedelapan.', isFavorite: false },
// ];

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.abs(now.getTime() - date.getTime()) / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        const minutes = Math.floor(diffInMinutes);
        return `${minutes} minutes ago`;
    } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} hours ago`;
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }
};

export default function Home() {
    const router = useRouter();
    const [noteType, setNoteType] = useState<'my' | 'shared' | 'favorite'>('my');
    const [notesRecentlyOpened, setNotesRecentlyOpened] = useState<[]>([]);
    const [notes, setNotes] = useState<[]>([]);
    
    const handleNoteClick = (noteId: string) => {
        router.push(`/note/${noteId}`);
    };

    const fetchRecentlyOpenedNotes = async () => {
        try {
            const response = await axiosInstance.get('/note?filter=all&sort=openAt');
            const data = await response.data;
            setNotesRecentlyOpened(data);
        } catch (error) {
            console.error('Error fetching recently opened notes:', error);
        }
    };

    const fetchNotes = async () => {
        try {
            const response = await axiosInstance.get('/note?filter=' + noteType);
            const data = await response.data;
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [noteType]);
    
    useEffect(() => {
        fetchRecentlyOpenedNotes();
        fetchNotes();
    }, []);

    return (
        <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-[80vw] mx-auto">
            {/* Recently Opened */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-semibold text-zinc-300">Recently Opened</h2>
                    <div className="flex items-center gap-1 text-zinc-400 text-xs">
                        <span>Scroll to see more</span>
                        <span className="animate-pulse">→</span>
                    </div>
                </div>
                <div className="flex overflow-x-auto gap-2 sm:gap-4 pb-2 custom-scrollbar">
                    {notesRecentlyOpened.map((note: any) => (
                        <div 
                            key={note.id} 
                            onClick={() => handleNoteClick(note.id)}
                            className="group flex-shrink-0 w-48 sm:w-64 h-32 sm:h-40 bg-zinc-800 rounded-lg p-3 sm:p-4 hover:bg-zinc-700 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-zinc-900/50"
                        >
                            <div className="flex items-start justify-between">
                                <h3 className="text-sm sm:text-base text-zinc-200 font-medium">{note.title || 'Untitled'}</h3>
                                {/* {note.isFavorite && (
                                    <FaStar className="text-yellow-400 text-sm" />
                                )} */}
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-400 mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3">{note.content}</p>
                            <div className="mt-2 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                Opened {note.noteUserOpen.length > 0 ? formatDate(note.noteUserOpen[0].openAt) : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Radio Button untuk My Note / Shared Note */}
            <div className="flex items-center justify-between border border-zinc-700 rounded-lg">
                <div className="relative w-full text-center">
                    <label
                        htmlFor="myNote"
                        className={`cursor-pointer block px-4 py-2 text-sm rounded-s-lg transition-all ${noteType === 'my' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <input
                            type="radio"
                            id="myNote"
                            name="noteType"
                            value="my"
                            checked={noteType === 'my'}
                            onChange={(e) => setNoteType(e.target.value as 'my' | 'shared' | 'favorite')}
                            className="absolute opacity-0 right-0 w-full h-full cursor-pointer"
                        />
                        My Notes
                    </label>
                </div>
                <div className="relative w-full text-center">
                    <label
                        htmlFor="sharedNote"
                        className={`cursor-pointer block px-4 py-2 text-sm transition-all ${noteType === 'shared' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <input
                            type="radio"
                            id="sharedNote"
                            name="noteType"
                            value="shared"
                            checked={noteType === 'shared'}
                            onChange={(e) => setNoteType(e.target.value as 'my' | 'shared' | 'favorite')}
                            className="absolute opacity-0 left-0 w-full h-full cursor-pointer"
                        />
                        Shared Notes
                    </label>
                </div>
                <div className="relative w-full text-center">
                    <label
                        htmlFor="favoriteNote"
                        className={`cursor-pointer block px-4 py-2 text-sm rounded-e-lg transition-all ${noteType === 'favorite' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <input
                            type="radio"
                            id="favoriteNote"
                            name="noteType"
                            value="favorite"
                            checked={noteType === 'favorite'}
                            onChange={(e) => setNoteType(e.target.value as 'my' | 'shared' | 'favorite')}
                            className="absolute opacity-0 left-0 w-full h-full cursor-pointer"
                        />
                        Favorites
                    </label>
                </div>
            </div>

            {/* Grid Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {notes.map((note: any) => (
                    <div 
                        key={note.id} 
                        onClick={() => handleNoteClick(note.id)}
                        className="group bg-zinc-800 rounded-lg p-3 sm:p-4 hover:bg-zinc-700 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-zinc-900/50"
                    >
                        <div className="flex items-start justify-between">
                            <h3 className="text-sm sm:text-base text-zinc-200 font-medium">{note.title || 'Untitled'}</h3>
                            {note.isFavorite && (
                                <FaStar className="text-yellow-400 text-sm" />
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3">{note.content}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            <span>Last modified: {note.updatedAt ? formatDate(note.updatedAt) : ''}</span>
                            <span className="px-2 py-0.5 bg-zinc-700 rounded-full text-zinc-300">{note.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Action Button */}
            {/* <button className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-zinc-700 rounded-full flex items-center justify-center hover:bg-zinc-600 transition-all duration-200 hover:shadow-lg hover:shadow-zinc-900/50 group">
                <FaPlus className="text-sm sm:text-base text-zinc-300 group-hover:rotate-90 transition-transform duration-200" />
            </button> */}
        </div>
    );
}