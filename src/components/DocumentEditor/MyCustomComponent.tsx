// components/MyCustomComponent.tsx
export default function MyCustomComponent({ id }: { id: string }) {
    return (
        <div className="border p-4">
            <input type="text" placeholder="Input 1" />
            <input type="text" placeholder="Input 2" />
            <p>Component ID: {id}</p>
        </div>
    )
}
