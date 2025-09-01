import Link from 'next/link'
import React from 'react'
import { ThemeToggle } from './theme/theme-toggle'
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

async function NavBar() {
    const session = await getServerSession(options)
    return (
        <header className="border-b">
            <div className="container px-4 md:px-6 flex h-16 items-center justify-between">
                <Link href="/" className="text-lg font-semibold">
                    GroceryList
                </Link>
                <div className="flex items-center gap-4">
                    {session ? (
                        <Link
                            href="/api/auth/signout"
                            className="px-4 py-2 rounded-lg bg-[#EAC471] text-[#333F4B] hover:bg-[#D0A35D]"
                        >
                            Logout
                        </Link>
                    ) : (
                        <Link
                            href="/api/auth/signin"
                            className="px-4 py-2 rounded-lg bg-[#EAC471] text-[#333F4B] hover:bg-[#D0A35D]"
                        >
                            Login
                        </Link>
                    )}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}

export default NavBar