'use client';

import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ListActions } from './ListActions';
import { ShoppingList } from '@/types/shopping-list';

export interface ShoppingListTableItem extends ShoppingList {
    itemCount: number;
    totalItems: number;
    isCompleted?: boolean;
}

interface ListsTableProps {
    isLoading?: boolean;
    lists: ShoppingListTableItem[];
    selectedListId?: string;
    onUpdateList?: (id: string, data: { name: string; notes?: string }) => Promise<void>;
    onDeleteList?: (id: string) => Promise<void>;
}

export function ListsTable({
    isLoading = false,
    lists,
    selectedListId,
    onUpdateList,
    onDeleteList
}: ListsTableProps) {
    const router = useRouter();

    // Calculate progress percentage based on items and total items
    const calculateProgress = (items: number, total: number) => {
        if (total === 0) return 0;
        return Math.min(100, (items / total) * 100);
    };
    if (isLoading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (lists.length === 0) {
        return (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                No lists found
            </div>
        );
    }

    return (
        <div className="space-y-4">

            <div className="space-y-2">
                {lists.map((list) => (
                    <Card
                        key={list.id}
                        className={cn(
                            "p-3 transition-all hover:shadow-sm border relative",
                            selectedListId === list.id
                                ? "border-primary dark:border-primary bg-primary/5 dark:bg-primary/10"
                                : "border-transparent hover:border-gray-200 dark:hover:border-zinc-700",
                            "dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70"
                        )}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => router.push(`/dashboard/${list.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-sm truncate dark:text-white">
                                            {list.name}
                                        </h3>
                                        {list.itemCount === list.totalItems && list.totalItems > 0 && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                </div>

                                {list.itemCount !== list.totalItems && (
                                    <div className="mt-1.5">
                                        <Progress
                                            value={calculateProgress(list.itemCount, list.totalItems)}
                                            className="h-1.5"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(list.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <ListActions
                                list={list}
                                onUpdate={async (id, data) => {
                                    if (onUpdateList) {
                                        await onUpdateList(id, data);
                                    }
                                }}
                                onDelete={async (id) => {
                                    if (!onDeleteList) return;
                                    return onDeleteList(id);
                                }}
                            />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
