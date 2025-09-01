'use client';

import Image from 'next/image';

const Page = () => {    
    return (
        <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-zinc-900">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="w-40 h-40 mx-auto relative opacity-80">
                        <Image 
                            src="/shopping-bag.svg" 
                            alt="Empty shopping bag" 
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">No shopping lists yet?</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Get started by creating your first shopping list. Keep track of your groceries and never forget an item again!
                        </p>
                    </div>
                    <div className="pt-8 border-t border-gray-200 dark:border-zinc-800 mt-8">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Tips</h3>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Organize by store or occasion</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Track items as you shop</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;