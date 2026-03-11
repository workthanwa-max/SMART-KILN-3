export const ResponseUtil = {
    success: (data?: any, message?: string) => ({
        status: 'success',
        ...(data !== undefined && { data }),
        ...(message && { message })
    }),

    error: (message: string, code: string = 'ERROR', details?: any) => ({
        status: 'error',
        code,
        message,
        ...(details && { details })
    })
};
