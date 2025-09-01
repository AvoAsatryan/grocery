'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';

export async function revalidatePaths(paths: string[]) {
  try {
    paths.forEach(path => revalidatePath(path));
    return { success: true };
  } catch (error) {
    console.error('Failed to revalidate paths:', error);
    return { success: false, error };
  }
}
