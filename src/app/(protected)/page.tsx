'use client'
import React, { useState } from 'react';

const notes = [
    { id: 1, title: 'Note 1', content: 'Ini isi note pertama.' },
    { id: 2, title: 'Note 2', content: 'Ini isi note kedua.' },
    { id: 3, title: 'Note 3', content: 'Ini isi note ketiga.' },
    { id: 4, title: 'Note 4', content: 'Ini isi note keempat.' },
    { id: 5, title: 'Note 5', content: 'Ini isi note kelima.' },
    { id: 6, title: 'Note 5', content: 'Ini isi note kelima.' },
    { id: 7, title: 'Note 7', content: 'Ini isi note ketujuh.' },
    { id: 8, title: 'Note 8', content: 'Ini isi note kedelapan.' },
    { id: 9, title: 'Note 9', content: 'Ini isi note kesembilan.' },
];

export default function Home() {
    const [noteType, setNoteType] = useState<'my' | 'shared'>('my');

    // return (
    //     <div className="min-h-screen bg-zinc-950 p-6 text-zinc-200">
    //         <h1 className="text-2xl font-bold mb-4">Baru-baru Dibuka</h1>

    //         <div className="flex space-x-4 overflow-x-auto pb-4 mb-6 custom-scrollbar">
    //             {notes.map(note => (
    //                 <div key={note.id} className="min-w-[200px] w-60 flex-shrink-0 rounded-2xl shadow bg-zinc-800 text-zinc-100 p-4">
    //                     <h2 className="font-semibold text-lg mb-2">{note.title}</h2>
    //                     <p className="text-sm text-zinc-400">{note.content}</p>
    //                 </div>
    //             ))}
    //         </div>

    //         <div className="mb-4 flex space-x-4">
    //             <label className="flex items-center space-x-2">
    //                 <input
    //                     type="radio"
    //                     name="noteType"
    //                     value="my"
    //                     checked={noteType === 'my'}
    //                     onChange={() => setNoteType('my')}
    //                     className="accent-zinc-600"
    //                 />
    //                 <span>My Notes</span>
    //             </label>
    //             <label className="flex items-center space-x-2">
    //                 <input
    //                     type="radio"
    //                     name="noteType"
    //                     value="shared"
    //                     checked={noteType === 'shared'}
    //                     onChange={() => setNoteType('shared')}
    //                     className="accent-zinc-600"
    //                 />
    //                 <span>Shared Notes</span>
    //             </label>
    //         </div>

    //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    //             {notes.slice(0, 4).map(note => (
    //                 <div key={note.id} className="rounded-2xl shadow bg-zinc-800 text-zinc-100 p-4">
    //                     <h2 className="font-semibold text-lg mb-2">{note.title}</h2>
    //                     <p className="text-sm text-zinc-400">{note.content}</p>
    //                 </div>
    //             ))}
    //         </div>
    //     </div>
    // );

    // debug
    return (
        <div className="min-h-screen bg-green-500 p-6 w-[100%]">
            <div className='min-h-screen bg-red-500'>
                <div>
                    <h1>content scroll horizontal</h1>
                    <div className='bg-blue-500 flex gap-4 overflow-x-auto pb-4 mb-6 custom-scrollbar w-full'>
                        <div className="min-w-[200px] w-60 flex-shrink-0 rounded-2xl shadow bg-zinc-800 text-zinc-100 p-4">
                            <h2 className="font-semibold text-lg mb-2">Note 1</h2>
                            <p className="text-sm text-zinc-400">Ini isi note pertama.</p>
                        </div>
                        <div className="min-w-[200px] w-60 flex-shrink-0 rounded-2xl shadow bg-zinc-800 text-zinc-100 p-4">
                            <h2 className="font-semibold text-lg mb-2">Note 1</h2>
                            <p className="text-sm text-zinc-400">Ini isi note pertama.</p>
                        </div>
                        <div className="min-w-[200px] w-60 flex-shrink-0 rounded-2xl shadow bg-zinc-800 text-zinc-100 p-4">
                            <h2 className="font-semibold text-lg mb-2">Note 1</h2>
                            <p className="text-sm text-zinc-400">Ini isi note pertama.</p>
                        </div>
                        <div className="min-w-[200px] w-60 flex-shrink-0 rounded-2xl shadow bg-zinc-800 text-zinc-100 p-4">
                            <h2 className="font-semibold text-lg mb-2">Note 1</h2>
                            <p className="text-sm text-zinc-400">Ini isi note pertama.</p>
                        </div>
                        <div className="min-w-[200px] w-60 flex-shrink-0 rounded-2xl shadow bg-zinc-800 text-zinc-100 p-4">
                            <h2 className="font-semibold text-lg mb-2">Note 1</h2>
                            <p className="text-sm text-zinc-400">Ini isi note pertama.</p>
                        </div>
                        <div className="min-w-[200px] w-60 flex-shrink-0 rounded-2xl shadow bg-zinc-800 text-zinc-100 p-4">
                            <h2 className="font-semibold text-lg mb-2">Note 1</h2>
                            <p className="text-sm text-zinc-400">Ini isi note pertama.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
