'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingList } from '@/types/shopping-list';
import { DeleteListModal } from './DeleteListModal';
import { EditListModal } from './EditListModal';

interface ListActionsProps {
  list: ShoppingList;
  onUpdate: (id: string, data: { name: string; notes?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ListActions({ list, onUpdate, onDelete }: ListActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleUpdate = async (data: { name: string; notes?: string }) => {
    await onUpdate(list.id, data);
  };

  const handleDelete = async () => {
    try {
      await onDelete(list.id);
      // The parent component will handle the UI update via revalidation
    } catch (error) {
      console.error('Failed to delete list:', error);
      throw error; // Re-throw to be caught by DeleteListModal
    }
  };

  return (
    <>
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-zinc-700"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end"
            className="w-40"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditListModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdate}
        initialData={{
          name: list.name,
          notes: list.notes,
        }}
      />

      <DeleteListModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        listName={list.name}
      />
    </>
  );
}
