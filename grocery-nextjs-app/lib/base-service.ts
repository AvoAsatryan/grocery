import { HttpClient } from './http-client';
import { revalidatePaths } from '@/actions/revalidation';

// This is a no-op function for client-side
const clientRevalidatePath = (path: string) => {
  if (typeof window !== 'undefined') {
    // Client-side revalidation logic if needed
    console.log('Revalidating path:', path);
  }
};

export abstract class BaseService<
  T,
  CreateDto extends Record<string, any>,
  UpdateDto extends Record<string, any>,
  DeleteDto extends Record<string, any> = { ids: string[] }
> extends HttpClient {
  protected abstract getRevalidationPaths(id?: string): string[];

  async getAll(params: Record<string, any> = {}): Promise<{ data: T[]; meta: any }> {
    return this.get('', params);
  }

  async getOne(id: string): Promise<T> {
    return this.get(id);
  }

  async create(data: CreateDto): Promise<T> {
    const result = await this.post<T>('', data);
    await this.revalidate();
    return result;
  }

  async update(id: string, data: UpdateDto, partial: boolean = false): Promise<T> {
    const result = partial 
      ? await this.patch<T>(id, data as Partial<UpdateDto>)
      : await this.put<T>(id, data);
    await this.revalidate(id);
    return result;
  }

  async delete(id: string): Promise<void> {
    await super.delete(id);
    await this.revalidate(id);
  }

  protected async deleteByIds(ids: string[]): Promise<void> {
    const deleteDto = { ids } as unknown as DeleteDto;
    await super.delete('bulk', deleteDto);
  }

  protected async revalidate(id?: string) {
    const paths = this.getRevalidationPaths(id);
    if (typeof window === 'undefined') {
      // Server-side revalidation
      await revalidatePaths(paths);
    } else {
      // Client-side revalidation
      paths.forEach(path => clientRevalidatePath(path));
    }
  }
}
