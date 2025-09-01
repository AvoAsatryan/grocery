import { Filter, Plus } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import debounce from 'lodash.debounce';

type Props = {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setIsAddingItem: (value: boolean) => void;
}

const GroceryListHeader = (props: Props) => {
    const { searchQuery, setSearchQuery, setIsAddingItem } = props;
    const [localQuery, setLocalQuery] = useState(searchQuery);

    // Create debounced update function
    const debouncedSetSearchQuery = useMemo(
        () => debounce((query: string) => {
            setSearchQuery(query);
        }, 600),
        [setSearchQuery]
    );

    // Update local query when searchQuery prop changes
    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    // Call debounced function when localQuery changes
    useEffect(() => {
        if (localQuery !== searchQuery) {
            debouncedSetSearchQuery(localQuery);
        }
        
        // Cleanup function
        return () => {
            debouncedSetSearchQuery.cancel();
        };
    }, [localQuery, searchQuery, debouncedSetSearchQuery]);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Grocery List</h2>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                    <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search items..."
                        className="pl-8"
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddingItem(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>
        </div>
    )
}

export default GroceryListHeader