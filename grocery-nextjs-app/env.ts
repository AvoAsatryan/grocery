export class Environment {
    private static getEnvVar(name: string, defaultValue?: string): string {
        const value = process.env[name] || defaultValue;
        if (!value) {
            console.warn(`Environment variable ${name} is not set`);
        }
        return value || '';
    }

    // Frontend URL (for client-side redirects and API calls)
    static get frontendUrl(): string {
        return this.getEnvVar(
            'NEXT_PUBLIC_FRONTEND_URL',
            'http://localhost:3000'
        ).replace(/\/$/, ''); // Remove trailing slash
    }

    // Backend API URL
    static get apiUrl(): string {
        return this.getEnvVar(
            'NEXT_PUBLIC_API_URL',
            this.backendUrl + '/api'
        ).replace(/\/$/, ''); // Remove trailing slash
    }

    // Backend URL (for server-side API calls)
    static get backendUrl(): string {
        return this.getEnvVar(
            'NEXT_PUBLIC_BACKEND_URL',
            'http://localhost:3001'
        ).replace(/\/$/, ''); // Remove trailing slash
    }

    // Environment mode
    static get isProduction(): boolean {
        return this.getEnvVar('NODE_ENV', 'development') === 'production';
    }

    static get isDevelopment(): boolean {
        return !this.isProduction;
    }
}