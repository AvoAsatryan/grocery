// components/dashboard/sidebar.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Search, List, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ListsTable } from '../lists/ListsTable';
import { AddListModal } from '../lists/AddListModal';
import { getShoppingLists, createShoppingList, deleteShoppingList, updateShoppingList } from '@/actions/shopping-lists';
import { ShoppingListQueryParams } from '@/types/shopping-list';
import { ShoppingListTableItem } from '../lists/ListsTable';
import { useInView } from 'react-intersection-observer';

const ITEMS_PER_PAGE = 10;

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [lists, setLists] = useState<ShoppingListTableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const params = useParams();
  const selectedListId = params?.shoppingListID as string;

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Fetch shopping lists with pagination
  const fetchLists = useCallback(async (pageNum: number, search: string = '') => {
    try {
      const isInitialLoad = pageNum === 1;
      const isNewSearch = search !== searchQuery;
      
      if (isInitialLoad || isNewSearch) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params: ShoppingListQueryParams = {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        ...(search && { search })
      };

      const response = await getShoppingLists(params);
      
      // Transform the API response to match the ShoppingListTableItem type
      const formattedLists = response.data.map(list => ({
        id: list.id,
        name: list.name,
        itemCount: 0, // Will be updated when we implement items
        lastUpdated: new Date(list.updatedAt).toLocaleDateString(),
        totalItems: 0, // Will be updated when we implement items
        isCompleted: false, // Will be updated when we implement completion status
        updatedAt: list.updatedAt,
        // Add missing required fields with default values
        createdAt: list.createdAt || new Date().toISOString(),
        createdBy: list.createdBy || { id: 'unknown', name: 'Unknown' }
      }));

      // For new searches or initial load, replace the entire list
      // For pagination, append to existing list
      setLists(prev => {
        if (isInitialLoad || isNewSearch) {
          return formattedLists;
        }
        // For pagination, merge and deduplicate
        const merged = [...prev, ...formattedLists];
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
        return unique;
      });
      
      setHasMore(response.meta.page < response.meta.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch shopping lists:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLists(1, searchQuery);
  }, [fetchLists, searchQuery]);

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && !isLoading && !isLoadingMore && hasMore) {
      fetchLists(page + 1, searchQuery);
    }
  }, [inView, isLoading, isLoadingMore, hasMore, fetchLists, page, searchQuery]);

  const handleAddList = async (name: string, notes: string = '') => {
    try {
      const newList = await createShoppingList({
        name,
        notes
      });
      
      // Transform the new list to match the ShoppingListTableItem type
      const formattedList = {
        id: newList.id,
        name: newList.name,
        itemCount: 0,
        lastUpdated: new Date(newList.updatedAt).toLocaleDateString(),
        totalItems: 0,
        isCompleted: false,
        updatedAt: newList.updatedAt,
        // Add missing required fields with default values
        createdAt: newList.createdAt || new Date().toISOString(),
        createdBy: newList.createdBy || { id: 'unknown', name: 'Unknown' }
      };
      setLists([formattedList, ...lists]);
      return newList;
    } catch (error) {
      console.error('Failed to create shopping list:', error);
      throw error;
    }
  };

  const handleDeleteList = async (id: string): Promise<void> => {
    try {
      await deleteShoppingList(id);
      // Optimistically update the UI by removing the deleted item
      setLists(prev => prev.filter(list => list.id !== id));
    } catch (error) {
      console.error('Failed to delete list:', error);
      throw error;
    }
  };

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPage(1);
      fetchLists(1, searchQuery.trim() || '');
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchLists]);

  return (
    <div className="hidden md:flex flex-col w-80 h-[calc(100vh-4rem)] bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shopping Lists</h1>
      </div>

      {/* Search and Filter */}
      <div className="p-4 space-y-3 border-b border-gray-200 dark:border-zinc-800">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search lists..."
            className="w-full pl-9 pr-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && page === 1 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-md animate-pulse" />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <List className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No lists found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Try a different search term' : 'Create your first shopping list'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <ListsTable 
              lists={lists} 
              selectedListId={selectedListId}
              onDeleteList={handleDeleteList}
              onUpdateList={async (id, data) => {
                try {
                  const updatedList = await updateShoppingList(id, data);
                  setLists(prev => prev.map(list => 
                    list.id === id 
                      ? { 
                          ...list, 
                          name: updatedList.name,
                          notes: updatedList.notes,
                          updatedAt: updatedList.updatedAt,
                          lastUpdated: new Date(updatedList.updatedAt).toLocaleDateString()
                        } 
                      : list
                  ));
                } catch (error) {
                  console.error('Failed to update list:', error);
                  throw error;
                }
              }}
            />
            {isLoadingMore && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}
            <div ref={ref} className="h-1" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <AddListModal
        onAddList={handleAddList}
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}