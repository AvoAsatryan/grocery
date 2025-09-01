'use client';

import { useState, useEffect } from 'react';
import { updateGroceryItem } from '@/actions/grocery';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroceryItem, GroceryItemStatus } from '@/types/grocery';
import { DeleteButton } from './DeleteButton';
import CloseAndSaveButtons from './CloseAndSaveButtons';
import HistoryTab from './HistoryTab';
import StatusToggleButton from './StatusToggleButton';
import { PrioritiesDropdown } from './PrioritiesDropdown';
import { Notes } from './Notes';
import ModalDialogHeader from './ModalDialogHeader';

interface EntryViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: GroceryItem | null;
    onDelete: (id: string) => void;
    onUpdate: (updatedItem: GroceryItem) => void;
}

export function EntryViewModal({ isOpen, onClose, item, onDelete, onUpdate }: EntryViewModalProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [isLoading, setIsLoading] = useState(false);
    const [previewData, setPreviewData] = useState<Partial<GroceryItem>>({});
    const [hasChanges, setHasChanges] = useState(false);

    const handleStatusToggle = () => {
        const currentStatus = previewData.status ?? item?.status;
        const newStatus = currentStatus === GroceryItemStatus.HAVE
            ? GroceryItemStatus.RANOUT
            : GroceryItemStatus.HAVE;

        setPreviewData(prev => ({
            ...prev,
            status: newStatus
        }));
    };

    const handlePriorityChange = (priority: number) => {
        setPreviewData(prev => ({
            ...prev,
            priority: priority as 1 | 2 | 3 | 4 | 5
        }));
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await onDelete(item?.id || '');
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!hasChanges || !item) {
            onClose();
            return;
        }

        try {
            setIsLoading(true);

            // Only include changed fields in the update
            const updateData: Partial<GroceryItem> = {};

            // Check each field for changes
            if (previewData.name !== undefined && previewData.name !== item.name) {
                updateData.name = previewData.name;
            }
            if (previewData.priority !== undefined && previewData.priority !== item.priority) {
                updateData.priority = previewData.priority;
            }
            if (previewData.status !== undefined && previewData.status !== item.status) {
                updateData.status = previewData.status;
            }
            if (previewData.notes !== undefined) {
                // Compare with item.notes, handling the case where item.notes might be null/undefined
                const currentNotes = item.notes || '';
                if (previewData.notes !== currentNotes) {
                    updateData.notes = previewData.notes;
                }
            }

            // Only proceed with API call if there are actual changes
            if (Object.keys(updateData).length > 0) {
                const updatedItem = await updateGroceryItem(item.id, updateData);
                onUpdate(updatedItem);
            }

            onClose();
        } catch (error) {
            console.error('Failed to save changes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /************************ UseEffects ************************/

    // Reset form when item changes or when opening/closing the modal
    useEffect(() => {
        if (item) {
            setPreviewData({
                ...item,
                priority: item.priority,
                status: item.status,
                notes: item.notes
            });
            setHasChanges(false);
        }
    }, [item]);

    // Track changes between previewData and original item
    useEffect(() => {
        if (item) {
            const hasAnyChanges = Object.entries(previewData).some(([key, value]) => {
                if (key === 'updatedAt') return false;
                // Handle notes comparison specially to account for null/undefined
                if (key === 'notes') {
                    const currentNotes = item.notes || '';
                    const newNotes = value || '';
                    return newNotes !== currentNotes;
                }
                return value !== item[key as keyof GroceryItem];
            });
            setHasChanges(hasAnyChanges);
        }
    }, [previewData, item]);


    if (!item) return null;

    const currentStatus = previewData.status ?? item.status;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden">
                
                <ModalDialogHeader item={item} />

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="px-6 pt-2"
                >
                    <TabsList className="grid w-full grid-cols-2 max-w-xs">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-6 space-y-6 pb-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StatusToggleButton
                                    currentStatus={currentStatus}
                                    isLoading={isLoading}
                                    handleStatusToggle={handleStatusToggle}
                                />

                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <PrioritiesDropdown
                                        previewData={previewData}
                                        item={item}
                                        handlePriorityChange={handlePriorityChange}
                                    />
                                </div>
                            </div>

                            <Notes 
                                initialNotes={previewData.notes ?? item.notes ?? ''}
                                onSave={async (notes) => {
                                    setPreviewData(prev => ({
                                        ...prev,
                                        notes
                                    }));
                                }}
                            />
                        </div>
                    </TabsContent>

                    <HistoryTab item={item} />

                </Tabs>

                <div className="flex justify-between items-center px-6 py-4 border-t bg-muted/20">

                    <DeleteButton onDelete={handleDelete} isLoading={isLoading} />

                    <CloseAndSaveButtons onClose={onClose} isLoading={isLoading} handleSaveChanges={handleSaveChanges} hasChanges={hasChanges} />

                </div>
            </DialogContent>
        </Dialog>
    );
}
