// utils/componentRegistry.ts
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
}
