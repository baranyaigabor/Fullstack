import type { z } from 'zod'

export async function apiRequest<T>(url: string, schema: z.ZodType<T>, options?: RequestInit): Promise<T> 
{
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })

    if (response.status === 204) 
    {
        return undefined as T
    }

    const result: unknown = await response.json()

    if (!response.ok) 
    {
        throw new Error('Request failed')
    }

    const parsed = schema.safeParse(result)

    if (!parsed.success) 
    {
        throw new Error('Invalid server response')
    }

    return parsed.data
}