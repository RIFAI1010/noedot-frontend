import { Level } from '@tiptap/extension-heading'
import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Undo, 
  Redo,
  Code,
  Quote,
  Image,
  Link,
  Table
} from 'lucide-react'

interface MenuBarProps {
    editor: Editor
}

const MenuBar = ({ editor }: MenuBarProps) => {
    if (!editor) {
        return null
    }

    return (
        <div className="menu-bar flex gap-2 flex-wrap p-2 border-b border-zinc-500">
            {/* Text Formatting */}
            <div className="flex gap-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive('bold') ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive('italic') ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive('underline') ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Underline"
                >
                    <Underline size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive('strike') ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Strikethrough"
                >
                    <Strikethrough size={16} />
                </button>
            </div>

            <div className="w-[1px] my-1 bg-zinc-500" />

            {/* Headings */}
            <select
                className='bg-zinc-700 text-white text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block p-2.5 hover:bg-zinc-600'
                onChange={(e) => {
                    const level = parseInt(e.target.value)
                    level ?
                        editor.chain().focus().toggleHeading({ level: level as Level }).run() :
                        editor.chain().focus().setParagraph().run()
                }}
                value={
                    editor.isActive('heading', { level: 1 }) ? '1' :
                        editor.isActive('heading', { level: 2 }) ? '2' :
                            editor.isActive('heading', { level: 3 }) ? '3' : '0'
                }
            >
                <option value="0">Normal</option>
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
            </select>

            <div className="w-[1px] my-1 bg-zinc-500" />

            {/* Lists */}
            <div className="flex gap-2">
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive('bulletList') ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Bullet List"
                >
                    <List size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive('orderedList') ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Numbered List"
                >
                    <ListOrdered size={16} />
                </button>
            </div>

            <div className="w-[1px] my-1 bg-zinc-500" />

            {/* Alignment */}
            <div className="flex gap-2">
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Align Left"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Align Center"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Align Right"
                >
                    <AlignRight size={16} />
                </button>
            </div>

            <div className="w-[1px] my-1 bg-zinc-500" />

            {/* Code & Quote */}
            <div className="flex gap-2">
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive('codeBlock') ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Code Block"
                >
                    <Code size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer ${editor.isActive('blockquote') ? 'bg-zinc-500' : 'bg-zinc-700'}`}
                    title="Quote"
                >
                    <Quote size={16} />
                </button>
            </div>

            <div className="w-[1px] my-1 bg-zinc-500" />

            {/* Media & Links */}
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        const url = window.prompt('Enter image URL:')
                        if (url) {
                            editor.chain().focus().setImage({ src: url }).run()
                        }
                    }}
                    className="p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700"
                    title="Insert Image"
                >
                    <Image size={16} />
                </button>
                <button
                    onClick={() => {
                        const url = window.prompt('Enter URL:')
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run()
                        }
                    }}
                    className="p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700"
                    title="Insert Link"
                >
                    <Link size={16} />
                </button>
            </div>

            <div className="w-[1px] my-1 bg-zinc-500" />

            {/* Undo/Redo */}
            <div className="flex gap-2">
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    className="p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700"
                    title="Undo"
                >
                    <Undo size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    className="p-2 rounded-md text-white hover:bg-zinc-500 cursor-pointer bg-zinc-700"
                    title="Redo"
                >
                    <Redo size={16} />
                </button>
            </div>
            <div className='w-[1px] my-1 bg-zinc-500' />
            
        </div>
    )
}

export default MenuBar
