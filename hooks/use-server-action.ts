import { useState, useTransition } from 'react'

type ServerAction<T, R> = (data: T) => Promise<R>

export function useServerAction<T, R>(action: ServerAction<T, R>) {
    const [isPending, startTransition] = useTransition()
    const [data, setData] = useState<R | null>(null)
    const [error, setError] = useState<string | null>(null)

    const execute = async (input: T) => {
        setError(null)
        startTransition(async () => {
            try {
                const result = await action(input)
                setData(result)
            } catch (err: any) {
                setError(err.message || 'Something went wrong')
            }
        })
    }

    return { execute, isPending, data, error }
}
