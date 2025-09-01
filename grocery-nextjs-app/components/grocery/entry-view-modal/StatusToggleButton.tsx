import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GroceryItemStatus } from '@/types/grocery'
import { Loader2, ArrowRightLeft } from 'lucide-react'
import React from 'react'

type Props = {
    currentStatus: GroceryItemStatus;
    isLoading: boolean;
    handleStatusToggle: () => void;
}

const StatusToggleButton = ({ currentStatus, isLoading, handleStatusToggle }: Props) => {
    const statusLabel = currentStatus === GroceryItemStatus.HAVE ? 'In Stock' : 'Out of Stock';

    return (
        <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStatusToggle}
                    disabled={isLoading}
                    aria-live="polite"
                    aria-busy={isLoading}
                    className={`group relative overflow-hidden transition-all duration-200 ${isLoading ? 'cursor-wait' : 'hover:shadow-md'} flex-1 justify-between`}
                    data-status={currentStatus}
                >
                    {/* Animated background for visual feedback */}
                    <span className="absolute inset-0 bg-current opacity-0 group-hover:opacity-5 group-active:opacity-10 transition-opacity duration-200" />
                    
                    {/* Main content */}
                    <div className="flex items-center gap-2 relative z-10">
                        {/* Status indicator dot */}
                        <span 
                            className={`h-2.5 w-2.5 rounded-full ${currentStatus === GroceryItemStatus.HAVE ? 'bg-green-500' : 'bg-amber-500'} ring-2 ring-offset-1 ${currentStatus === GroceryItemStatus.HAVE ? 'ring-green-500/30' : 'ring-amber-500/30'}`} 
                            aria-hidden="true"
                        />
                        
                        {/* Status label with loading state */}
                        <span className="font-medium text-sm">
                            {isLoading ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                                    <span>Saving...</span>
                                </span>
                            ) : statusLabel}
                        </span>
                    </div>

                    {/* Action indicator */}
                    <span className="relative z-10 inline-flex items-center gap-1.5 text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                        {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <>
                                <span className="hidden sm:inline">Click to toggle</span>
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                            </>
                        )}
                    </span>

                    {/* Ripple effect on click */}
                    <span className="absolute inset-0 overflow-hidden">
                        <span className="absolute inset-0 bg-current opacity-0 group-active:opacity-20 group-active:animate-ripple" />
                    </span>
                </Button>
            </div>
        </div>
    )
}

export default StatusToggleButton