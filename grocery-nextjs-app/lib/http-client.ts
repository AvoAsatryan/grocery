import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { options as authOptions } from '@/app/api/auth/[...nextauth]/options';
import { Environment } from '@/env';

export abstract class HttpClient {
  protected baseUrl: string;
  protected resource: string;

  constructor(resource: string, baseUrl: string = Environment.apiUrl) {
    this.resource = resource;
    this.baseUrl = baseUrl;
  }

  protected async fetchWithAuth(url: string, options: RequestInit = {}) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(url)}`);
    }

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (session?.accessToken) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
    }

    console.log('API URL:', url); // For debugging
    console.log('API Headers:', headers); // For debugging
    console.log('API Options:', options); // For debugging
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(url)}`);
      }
      
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return response;
  }

  protected async get<T>(path: string = '', params: Record<string, any> = {}): Promise<T> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const url = `${this.getUrl(path)}${queryString ? `?${queryString}` : ''}`;
    
    console.log('API GET URL:', url);
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  protected async post<T>(path: string = '', data: Record<string, any>): Promise<T> {
    const response = await this.fetchWithAuth(
      this.getUrl(path),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  }

  protected async put<T>(path: string, data: Record<string, any>): Promise<T> {
    const response = await this.fetchWithAuth(
      this.getUrl(path),
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  }

  protected async patch<T>(path: string, data: Record<string, any>): Promise<T> {
    const response = await this.fetchWithAuth(
      this.getUrl(path),
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  }

  protected getUrl(path: string = ''): string {
    // Ensure we don't have double slashes in the URL
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const resource = this.resource.startsWith('/') ? this.resource.slice(1) : this.resource;
    const pathPart = path ? `/${path}` : '';
    
    return `${baseUrl}/${resource}${pathPart}`;
  }

  protected async delete(path: string = '', data?: Record<string, any>): Promise<void> {
    const isBulkDelete = path === 'bulk' && data?.ids;
    const url = isBulkDelete ? this.getUrl('bulk') : this.getUrl(path);
    console.log('DELETE URL:', url);
    
    const options: RequestInit = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (isBulkDelete) {
      options.body = JSON.stringify(data);
      console.log('Bulk DELETE request body:', options.body);
    } else if (data) {
      options.body = JSON.stringify(data);
      console.log('DELETE request body:', options.body);
    }
    
    try {
      const response = await this.fetchWithAuth(url, options);
      console.log('DELETE response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('DELETE error:', error);
        throw new Error(error.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }
}
