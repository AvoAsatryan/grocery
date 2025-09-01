'use client';

import { useParams } from 'next/navigation';
import { GroceryList } from '@/components/grocery/GroceryList';

const DashboardPage = () => {
    const params = useParams();
    const shoppingListID = params.shoppingListID as string;


    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-zinc-900">
            <main className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                        <GroceryList shoppingListId={shoppingListID} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;