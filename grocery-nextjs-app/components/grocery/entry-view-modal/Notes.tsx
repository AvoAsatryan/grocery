import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type NotesProps = {
  initialNotes?: string;
  onSave: (notes: string) => Promise<void>;
  className?: string;
};

const notesSchema = z.object({
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().or(z.literal('')),
});

type NotesFormData = z.infer<typeof notesSchema>;

export function Notes({ initialNotes = '', onSave, className }: NotesProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [characterCount, setCharacterCount] = React.useState(initialNotes?.length || 0);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<NotesFormData>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: initialNotes,
    },
  });

  const notesValue = watch('notes');
  
  React.useEffect(() => {
    setCharacterCount(notesValue?.length || 0);
  }, [notesValue]);

  const handleSave = async (data: NotesFormData) => {
    try {
      setIsSaving(true);
      // Pass empty string if notes is undefined or null
      await onSave(data.notes ?? '');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset({ notes: initialNotes });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground/80">Notes</h3>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving || !isDirty}
              onClick={handleSubmit(handleSave)}
              className="h-8 gap-1"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span className="sr-only">Save</span>
            </Button>
          </div>
        </div>
        
        <div className="relative w-full overflow-hidden">
          <div className="w-full">
            <Textarea
              {...register('notes')}
              placeholder="Add detailed notes about this item..."
              className={cn(
                'min-h-[120px] max-h-[200px] overflow-y-auto w-full max-w-full resize-none pr-10',
                'focus:outline-none focus:ring-0',
                'transition-all duration-150 ease-out',
                'border-muted-foreground/30 hover:border-muted-foreground/40',
                'overflow-x-hidden whitespace-normal break-all',
                'rounded-md',
                'focus:shadow-[0_0_0_2px_rgba(99,102,241,0.4)]',
                errors.notes && 'border-destructive/50 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.3)]'
              )}
              style={{ wordBreak: 'break-word' }}
              disabled={isSaving}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {characterCount}/500
            </div>
          </div>
        </div>
        
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('group relative', className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-foreground/80">Notes</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className={cn(
            'h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-muted/50'
          )}
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit notes</span>
        </Button>
      </div>
      
      <div 
        onClick={() => setIsEditing(true)}
        className={cn(
          'rounded-lg border bg-card p-4 min-h-[120px] cursor-text',
          'transition-colors hover:border-muted-foreground/30',
          'prose prose-sm prose-slate dark:prose-invert max-w-none',
          'whitespace-pre-wrap break-words'
        )}
      >
        {initialNotes ? (
          <p className="text-foreground/90">{initialNotes}</p>
        ) : (
          <p className="text-muted-foreground italic">Click to add notes...</p>
        )}
      </div>
    </div>
  );
}