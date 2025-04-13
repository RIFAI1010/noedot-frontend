// extensions/CustomComponentNode.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const CustomComponentNode = Node.create({
    name: 'customComponent',

    group: 'block',
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            componentId: {
                default: '',
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-custom-component]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            {
                ...HTMLAttributes,
                'data-dynamic-component': 'true',
                'contenteditable': 'false', // ini penting
            },
        ]
    },

    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement('div')
            dom.setAttribute('data-custom-component', 'true')

            // React render ke div ini
            import('react-dom/client').then(({ createRoot }) => {
                const MyComponent = require('./MyCustomComponent').default
                const root = createRoot(dom)
                root.render(<MyComponent id={ node.attrs.componentId } />)
            })

            return {
                dom,
            }
        }
    },
})
