import { Button } from '@/components/ui/button';
import { GroceryItemStatus } from '@/types/grocery';
import { CheckCircle, Trash2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

type StatusFilter = 'all' | GroceryItemStatus;

type Props = {
    statusFilter: StatusFilter;
    setStatusFilter: (filter: StatusFilter) => void;
    totalItems: number;
    isLoading: boolean;
    handleDeleteAllRunout: () => void;
};

const StatusFilters = (props: Props) => {
    const { statusFilter, setStatusFilter, totalItems, isLoading, handleDeleteAllRunout } = props;
    return (
        <div className="flex flex-wrap gap-2 items-center">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                >
                    All ({totalItems})
                </Button>
                <Button
                    variant={statusFilter === GroceryItemStatus.HAVE ? 'default' : 'outline'}
                    size="sm"
                    className={cn(statusFilter === GroceryItemStatus.HAVE ? 'text-green-50 border-green-50 bg-green-700 hover:bg-green-600' : 'text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700')}
                    onClick={() => setStatusFilter(GroceryItemStatus.HAVE)}
                >
                    <CheckCircle className="mr-2 h-4 w-4" /> Have
                </Button>
                <Button
                    variant={statusFilter === GroceryItemStatus.RANOUT ? 'default' : 'outline'}
                    size="sm"
                    className={cn(statusFilter === GroceryItemStatus.RANOUT ? 'text-red-50 border-red-50 bg-red-700 hover:bg-red-600' : 'text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700')}
                    onClick={() => setStatusFilter(GroceryItemStatus.RANOUT)}
                >
                    <XCircle className="mr-2 h-4 w-4" /> Ran Out
                </Button>
            </div>
            <Button
                variant="destructive"
                size="sm"
                className="ml-2"
                onClick={handleDeleteAllRunout}
                disabled={isLoading}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Runout
            </Button>
        </div>
    )
}

export default StatusFilters