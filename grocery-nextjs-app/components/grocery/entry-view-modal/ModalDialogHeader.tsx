import { Badge } from '@/components/ui/badge'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GroceryItem } from '@/types/grocery'
import { Clock } from 'lucide-react'
import React from 'react'
import { priorityColors, priorityLabels } from '@/types/grocery'
import { format } from 'date-fns'

type Props = {
    item: GroceryItem;
}

const ModalDialogHeader = (props: Props) => {
    const { item } = props;
    return (
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex justify-between items-start">
                <div>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {item.name}
                        <Badge variant="outline" className={priorityColors[item.priority as keyof typeof priorityColors]}>
                            {priorityLabels[item.priority as keyof typeof priorityLabels]} Priority
                        </Badge>
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>Last updated {format(new Date(item.updatedAt), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(item.updatedAt), 'h:mm a')}
                        </span>
                    </div>
                </div>
            </div>
        </DialogHeader>
    )
}

export default ModalDialogHeader