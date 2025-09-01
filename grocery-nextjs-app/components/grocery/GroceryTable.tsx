import { CheckCircle, ChevronDown, ChevronsUpDown, ChevronUp, XCircle } from 'lucide-react';
import React from 'react'
import { SortDirection, SortField, StatusFilter } from './grocery-types';
import { GroceryItem, GroceryItemStatus, priorityColors, priorityLabels } from '@/types/grocery';

type Props = {
    items: GroceryItem[];
    shoppingListId: string;
    searchQuery: string;
    statusFilter: StatusFilter;
    sortField: SortField;
    sortDirection: SortDirection;
    setSelectedItem: (item: GroceryItem | null) => void;
    setIsEntryViewOpen: (open: boolean) => void;
    removeItem: (id: string) => void;
    toggleItemStatus: (id: string, status: GroceryItemStatus) => void;
    setSortField: (field: SortField) => void;
    setSortDirection: (direction: SortDirection | ((prev: SortDirection) => SortDirection)) => void;
}

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const GroceryTable = (props: Props) => {
    const { items, shoppingListId, searchQuery, statusFilter, sortField, sortDirection, setSelectedItem, setSortField, setSortDirection, setIsEntryViewOpen, removeItem, toggleItemStatus } = props;

    // Handle sort direction toggle
    const handleSortToggle = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Create sort handler for a specific field
    const createSortHandler = (field: SortField) => {
        return (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            handleSortToggle(field);
        };
    };


    // Filter, sort, and mark optimistic items
    const filteredItems = items
        .filter(item => {
            // Skip invalid items
            if (!item || typeof item !== 'object') return false;

            // Create a safe item with default values for required properties
            const safeItem: GroceryItem = {
                id: item.id || '',
                name: String(item.name || ''),
                status: item.status || GroceryItemStatus.HAVE,
                priority: Number(item.priority) || 3,
                quantity: Number(item.quantity) || 1,
                shoppingListId: item.shoppingListId || shoppingListId,
                notes: item.notes || '',
                history: Array.isArray(item.history) ? item.history : [],
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: item.updatedAt || new Date().toISOString(),
                ...(item.isOptimistic !== undefined && { isOptimistic: item.isOptimistic })
            };

            // Skip items without a name
            if (!safeItem.name.trim()) return false;

            const searchQueryLower = searchQuery.toLowerCase();
            const itemNameLower = safeItem.name.toLowerCase();
            const matchesSearch = itemNameLower.includes(searchQueryLower);
            const matchesStatus = statusFilter === 'all' || safeItem.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

    const sortedItems = [...filteredItems].sort((a, b) => {
        if (sortField === 'priority') {
            return sortDirection === 'asc'
                ? a.priority - b.priority
                : b.priority - a.priority;
        } else {
            return sortDirection === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-4 w-12"></th>
                        <th className="text-left p-4">
                            <button
                                className="flex items-center gap-1 font-medium"
                                onClick={createSortHandler('name')}
                            >
                                Item Name
                                {sortField === 'name' ? (
                                    sortDirection === 'asc' ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )
                                ) : (
                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                )}
                            </button>
                        </th>
                        <th className="text-left p-4 w-32">
                            <button
                                className="flex items-center gap-1 font-medium"
                                onClick={createSortHandler('priority')}
                            >
                                Priority
                                {sortField === 'priority' ? (
                                    sortDirection === 'asc' ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )
                                ) : (
                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                )}
                            </button>
                        </th>
                        <th className="text-right p-4 w-24">Status</th>
                        <th className="text-right p-4 w-32">Last Updated</th>
                        <th className="p-4 w-12"></th>
                    </tr>
                </thead>
                <tbody>
                    {sortedItems.length > 0 ? (
                        sortedItems.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => {
                                    setSelectedItem(item);
                                    setIsEntryViewOpen(true);
                                }}
                            >
                                <td className="p-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleItemStatus(item.id, item.status);
                                        }}
                                        className={`p-1 rounded-full ${item.status === GroceryItemStatus.HAVE ? 'text-green-500' : 'text-gray-300'
                                            }`}
                                        aria-label={item.status === GroceryItemStatus.HAVE ? 'Mark as ran out' : 'Mark as have'}
                                    >
                                        {item.status === GroceryItemStatus.HAVE ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                        )}
                                    </button>
                                </td>
                                <td className="p-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <span className={`${item.status === GroceryItemStatus.HAVE ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${priorityColors[item.priority as keyof typeof priorityColors]}`}
                                    >
                                        {priorityLabels[item.priority as 1 | 2 | 3 | 4 | 5]}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <span className={`text-sm font-medium ${item.status === GroceryItemStatus.HAVE ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {item.status === GroceryItemStatus.HAVE ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </td>
                                <td className="p-4 text-right text-sm text-muted-foreground">
                                    {formatTimeAgo(new Date(item.updatedAt))}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeItem(item.id);
                                        }}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                        aria-label="Delete item"
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                {searchQuery ? 'No items match your search.' : 'No items found. Add your first item to get started.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default GroceryTable