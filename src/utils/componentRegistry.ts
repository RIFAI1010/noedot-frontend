// utils/componentRegistry.ts
import DocumentEditor from "@/components/DocumentEditor/Editor";
import BoardNoteComponent from "@/components/Note/boardNoteComponent";
import TableBlock from "@/components/Note/tableNoteComponent"

export interface BlockProps {
    id: string;
    noteId: string;
    noteEditable: boolean;
    onComponentDeleted?: () => void;
}

export interface Block {
    id: string;
    type: string;
    referenceId: string;
    position: number;
    details: {
        name: string;
    }
}

export const blockRegistry: Record<
    string,
    React.FC<BlockProps>
> = {
    table: TableBlock,
    document: DocumentEditor,
    board: BoardNoteComponent
}
