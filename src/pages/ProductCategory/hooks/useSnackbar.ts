import { useState, useCallback } from 'react'
import type { SnackbarState } from '../types'

export function useSnackbar() {
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    })

    const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'warning') => {
        setSnackbar({ open: true, message, severity })
    }, [])

    const handleSnackbarClose = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }))
    }, [])

    return { snackbar, setSnackbar, showSnackbar, handleSnackbarClose }
}
