import React from 'react'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { priorityLabels } from '@/types/grocery'

type Props = {
    handleAddItem: (e: React.FormEvent) => void;
    newItemName: string;
    setNewItemName: (name: string) => void;
    newItemPriority: 1 | 2 | 3 | 4 | 5;
    setNewItemPriority: (priority: 1 | 2 | 3 | 4 | 5) => void;
    setIsAddingItem: (adding: boolean) => void;
}

const AddNewGroceryForm = (props: Props) => {
    const { handleAddItem, newItemName, setNewItemName, newItemPriority, setNewItemPriority, setIsAddingItem } = props;
    return (
        <form onSubmit={handleAddItem}>
            <Card className="p-4 my-2 bg-muted/20">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Item name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(e as unknown as React.FormEvent)}
                    />
                    <select
                        value={newItemPriority}
                        onChange={(e) => setNewItemPriority(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                        className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                    >
                        {[1, 2, 3, 4, 5].map((priority) => (
                            <option key={priority} value={priority}>
                                {priorityLabels[priority as keyof typeof priorityLabels]} Priority
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={!newItemName.trim()}>
                            Add
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddingItem(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Card>
        </form>
    )
}

export default AddNewGroceryForm