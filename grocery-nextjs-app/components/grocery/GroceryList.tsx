'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card } from '@/components/ui/card';
import StatusFilters from '@/components/grocery/StatusFilters';
import AddNewGroceryForm from '@/components/grocery/AddNewGroceryForm';
import { EntryViewModal } from '@/components/grocery/entry-view-modal/EntryViewModal';
import {
  GroceryItem,
  GroceryItemStatus,
  CreateGroceryItemInput,
} from '@/types/grocery';
import {
  getGroceryItems,
  createGroceryItem as createGroceryItemAction,
  updateGroceryStatus as updateGroceryStatusAction,
  deleteGroceryItem,
  deleteAllRunoutItems,
} from '@/actions/grocery';
import GroceryListHeader from './GroceryListHeader';
import { SortField, SortDirection, StatusFilter, GroceryQueryParams } from './grocery-types';
import GroceryTable from './GroceryTable';

const ITEMS_PER_PAGE = 10;

interface GroceryListProps {
  shoppingListId: string;
}

export function GroceryList({ shoppingListId }: GroceryListProps) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [isEntryViewOpen, setIsEntryViewOpen] = useState(false);



  // Confirm dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  } | null>(null);

  const openConfirmDialog = (config: {
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }) => {
    setConfirmConfig(config);
    setIsConfirmOpen(true);
  };

  const closeConfirmDialog = () => {
    setIsConfirmOpen(false);
  };

  const closeEntryViewModal = () => {
    setIsEntryViewOpen(false);
    setSelectedItem(null);
  };

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Fetch grocery items with pagination and filters
  const fetchItems = useCallback(async (pageNum: number, search: string) => {
    if (!shoppingListId) {
      setItems([]);
      setIsLoading(false);
      console.error('shoppingListId is required');
      toast.error('Shopping list ID is missing');
      return;
    }

    const isNewSearch = search !== searchQuery || pageNum === 1;
    if (isNewSearch) {
      setIsLoading(true);
      setPage(1);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params: GroceryQueryParams = {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        sortBy: sortField,
        sortOrder: sortDirection,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
        shoppingListId
      };

      console.log('Fetching items with params:', params);
      const response = await getGroceryItems(shoppingListId, params);
      console.log('API Response:', response);

      // Ensure we have a valid response with data array
      let itemsData: GroceryItem[] = [];

      if (Array.isArray(response)) {
        // Handle case where response is directly an array
        itemsData = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        // Handle case where response has data property
        itemsData = Array.isArray(response.data) ? response.data : [];
      }

      console.log('Processed items data:', itemsData);

      if (isNewSearch) {
        console.log('Setting new items:', itemsData);
        setItems(itemsData);
      } else {
        console.log('Appending items:', itemsData);
        setItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = itemsData.filter((item: GroceryItem) => !existingIds.has(item.id));
          const updatedItems = [...prev, ...newItems];
          console.log('Updated items:', updatedItems);
          return updatedItems;
        });
      }

      // Ensure we have a valid meta object with total count
      let totalItems = 0;
      if (response && typeof response === 'object' && 'meta' in response && response.meta) {
        totalItems = Number(response.meta.total) || 0;
      } else if (Array.isArray(response)) {
        totalItems = response.length;
      }
      setTotalItems(totalItems);

      console.log('Total items:', totalItems, 'Current page:', pageNum, 'Items per page:', ITEMS_PER_PAGE);
      setHasMore(totalItems > (pageNum * ITEMS_PER_PAGE));
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching grocery items:', err);
      toast.error('Failed to load grocery items.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [shoppingListId, sortField, sortDirection, statusFilter, searchQuery]);

  // Load more items when scrolled to bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      fetchItems(page + 1, searchQuery);
    }
  }, [inView, hasMore, isLoading, isLoadingMore, page, searchQuery, fetchItems]);

  // Initial load
  useEffect(() => {
    fetchItems(1, '');
  }, [fetchItems]);

  const generateTempId = useMemo(() => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, []);

  // Handle adding a new item with optimistic update
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !shoppingListId) return;

    const tempId = generateTempId;
    const optimisticItem: GroceryItem = {
      id: tempId,
      name: newItemName.trim(),
      priority: newItemPriority,
      shoppingListId,
      status: GroceryItemStatus.HAVE,
      quantity: 1,
      history: [{
        id: `history-${tempId}`,
        status: GroceryItemStatus.HAVE,
        changedAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOptimistic: true // Mark as optimistic update
    };

    // Optimistically update the UI
    setItems(prevItems => [optimisticItem, ...prevItems]);
    setNewItemName('');
    setNewItemPriority(3);

    try {
      const newItem: CreateGroceryItemInput = {
        name: newItemName.trim(),
        priority: newItemPriority,
        shoppingListId: shoppingListId,
        status: GroceryItemStatus.HAVE,
        quantity: 1
      };

      console.log('Making API call to create item:', newItem);
      // Make the API call
      const response = await createGroceryItemAction(newItem);
      console.log('API response:', response);

      // Handle the server response which could be either the item directly or wrapped in a data property
      const createdItem = response && typeof response === 'object' && 'data' in response
        ? response.data as GroceryItem
        : response as GroceryItem;
      console.log('Created item after processing:', createdItem);

      if (createdItem) {
        console.log('Replacing optimistic item with server response');
        // Create a clean item object with all required fields
        const serverItem: GroceryItem = {
          id: createdItem.id,
          name: createdItem.name,
          quantity: createdItem.quantity || 1,
          priority: createdItem.priority || 3,
          status: createdItem.status || GroceryItemStatus.HAVE,
          shoppingListId: createdItem.shoppingListId || shoppingListId,
          notes: createdItem.notes || '',
          history: Array.isArray(createdItem.history) ? createdItem.history : [],
          createdAt: createdItem.createdAt || new Date().toISOString(),
          updatedAt: createdItem.updatedAt || new Date().toISOString()
        };

        console.log('Processed server item:', serverItem);

        // Replace the optimistic item with the actual item from the server
        setItems(prevItems => {
          const updatedItems = prevItems.map(item =>
            item.id === tempId ? serverItem : item
          );
          console.log('Updated items after replacement:', updatedItems);
          return updatedItems;
        });
      } else {
        // If no valid response, remove the optimistic item
        setItems(prevItems => prevItems.filter(item => item.id !== tempId));
      }
    } catch (error) {
      console.error('Failed to add item:', error);
      // Rollback the optimistic update
      setItems(prevItems => prevItems.filter(item => item.id !== tempId));
      toast.error('Failed to add item. Please try again.');
    }
  };

  // Toggle item status between HAVE and RAN_OUT with optimistic update
  const toggleItemStatus = async (id: string, currentStatus: GroceryItemStatus) => {
    const newStatus = currentStatus === GroceryItemStatus.HAVE
      ? GroceryItemStatus.RANOUT
      : GroceryItemStatus.HAVE;

    // Optimistically update the UI
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? {
            ...item,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            // Keep the optimistic flag if it exists, otherwise don't set it
            ...(item.isOptimistic !== undefined && { isOptimistic: true })
          }
          : item
      )
    );

    try {
      await updateGroceryStatusAction(id, newStatus);
      // No need to refetch, we've already updated optimistically
    } catch (error) {
      console.error('Failed to update item status:', error);
      // Rollback the optimistic update
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id
            ? {
              ...item,
              status: currentStatus,
              updatedAt: new Date().toISOString(),
              isOptimistic: undefined
            }
            : item
        )
      );
      toast.error('Failed to update item status.');
    }
  };

  // Remove item with optimistic update
  const removeItem = (id: string) => {
    openConfirmDialog({
      title: 'Delete Item',
      description: 'Are you sure you want to delete this item?',
      variant: 'destructive',
      onConfirm: async () => {
        // Store the item being deleted in case we need to rollback
        const itemToDelete = items.find(item => item.id === id);
        if (!itemToDelete) return;

        // Optimistically remove the item from the UI
        setItems(prevItems => prevItems.filter(item => item.id !== id));

        try {
          await deleteGroceryItem(id);
          // No need to refetch, we've already updated optimistically
        } catch (error) {
          console.error('Failed to delete item:', error);
          // Rollback the optimistic update
          setItems(prevItems => {
            const updatedItems = [...prevItems, itemToDelete];
            return updatedItems.sort((a, b) => a.name.localeCompare(b.name));
          });
          toast.error('Failed to delete item.');
        }
      }
    });
  };

  // Delete all runout items
  const handleDeleteAllRunout = () => {
    openConfirmDialog({
      title: 'Delete All Runout Items',
      description: 'Are you sure you want to delete all runout items? This action cannot be undone.',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          const result = await deleteAllRunoutItems(shoppingListId);
          // Refresh the list after deletion
          fetchItems(1, searchQuery);
          // Show success message
          toast.success(result.message || 'Runout items deleted successfully');
        } catch (error) {
          console.error('Failed to delete runout items:', error);
          toast.error('Failed to delete runout items. Please try again.');
        }
      }
    });
  };

  const renderLoading = () => {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <GroceryListHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsAddingItem={setIsAddingItem}
      />

      {/* Status Filter */}
      <StatusFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalItems={totalItems}
        isLoading={isLoading}
        handleDeleteAllRunout={handleDeleteAllRunout}
      />

      {/* Add New Item Form */}
      {isAddingItem && (
        <AddNewGroceryForm
          handleAddItem={handleAddItem}
          newItemName={newItemName}
          setNewItemName={setNewItemName}
          newItemPriority={newItemPriority}
          setNewItemPriority={setNewItemPriority}
          setIsAddingItem={setIsAddingItem}
        />
      )}

      {/* Grocery List */}
      <Card>
        {isLoading ? renderLoading() : <GroceryTable
          items={items}
          shoppingListId={shoppingListId}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          sortField={sortField}
          sortDirection={sortDirection}
          setSelectedItem={setSelectedItem}
          setSortField={setSortField}
          setSortDirection={setSortDirection}
          setIsEntryViewOpen={setIsEntryViewOpen}
          removeItem={removeItem}
          toggleItemStatus={toggleItemStatus}
        />}
      </Card>

      {/* Loading indicator and infinite scroll trigger */}
      <div className="flex justify-center py-4" ref={ref}>
        {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirmDialog}
        title={confirmConfig?.title || 'Confirm'}
        description={confirmConfig?.description || 'Are you sure you want to continue?'}
        variant={confirmConfig?.variant || 'default'}
        onConfirm={() => {
          confirmConfig?.onConfirm?.();
          closeConfirmDialog();
        }}
      />

      {/* Entry View Modal */}
      <EntryViewModal
        isOpen={isEntryViewOpen}
        onClose={closeEntryViewModal}
        item={selectedItem}
        onDelete={removeItem}
        onUpdate={(updatedItem) => {
          // Update the item in the local state
          setItems(prevItems =>
            prevItems.map(item =>
              item.id === updatedItem.id ? { ...item, ...updatedItem } : item
            )
          );
        }}
      />
    </div>
  );
}
