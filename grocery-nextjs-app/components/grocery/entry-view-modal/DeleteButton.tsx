import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trash2 } from 'lucide-react';

export interface DeleteButtonProps {
    onDelete: () => Promise<void>;
    isLoading: boolean;
}

export function DeleteButton({ onDelete, isLoading }: DeleteButtonProps) {
    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete item
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Permanently delete this item</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    );
}