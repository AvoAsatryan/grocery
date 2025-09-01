import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import React from 'react'

type Props = {
    onClose: () => void;
    isLoading: boolean;
    handleSaveChanges: () => void;
    hasChanges: boolean;
}

const CloseAndSaveButtons = (props: Props) => {
    const { onClose, isLoading, handleSaveChanges, hasChanges } = props;
    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Close
            </Button>
            <Button
                onClick={handleSaveChanges}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : hasChanges ? (
                    'Save Changes'
                ) : (
                    'Done'
                )}
            </Button>
        </div>
    )
}

export default CloseAndSaveButtons
