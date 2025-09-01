import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { priorityLabels, priorityColors } from '@/types/grocery';
import type { GroceryItem } from '@/types/grocery';

type PriorityLevel = 1 | 2 | 3 | 4 | 5;

interface PrioritiesDropdownProps {
  previewData: Partial<GroceryItem>;
  item: GroceryItem;
  handlePriorityChange: (priority: number) => void;
  className?: string;
}

export function PrioritiesDropdown({
  previewData,
  item,
  handlePriorityChange,
  className,
}: PrioritiesDropdownProps) {
  const currentPriority = (previewData.priority ?? item.priority) as PriorityLevel;
  const currentColor = priorityColors[currentPriority];
  
  const priorityOptions = ([1, 2, 3, 4, 5] as const).map((level) => ({
    value: level.toString(),
    label: priorityLabels[level],
    level,
    color: priorityColors[level],
  }));

  return (
    <div className={cn('w-full', className)}>
      <Select
        value={currentPriority.toString()}
        onValueChange={(value) => handlePriorityChange(Number(value))}
      >
        <SelectTrigger className="w-full h-10 bg-background hover:bg-accent/50 transition-colors">
          <SelectValue asChild>
            <div className="flex items-center gap-2">
              <span 
                className={cn(
                  'inline-block h-2.5 w-2.5 rounded-full',
                  currentColor
                )}
                aria-hidden="true"
              />
              <span className="font-medium">
                {priorityLabels[currentPriority]} Priority
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-[var(--radix-select-trigger-width)] p-1.5">
          <SelectGroup>
            <SelectLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Select Priority
            </SelectLabel>
            {priorityOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={cn(
                  'relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none',
                  'focus:bg-accent/50 cursor-pointer transition-colors',
                  'data-[state=checked]:bg-accent/30 data-[state=checked]:font-medium',
                  'hover:bg-accent/40',
                  'justify-between',
                  'group/item'
                )}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className={cn(
                      'inline-block h-2.5 w-2.5 rounded-full flex-shrink-0',
                      option.color
                    )}
                    aria-hidden="true"
                  />
                  <span>{option.label} Priority</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}