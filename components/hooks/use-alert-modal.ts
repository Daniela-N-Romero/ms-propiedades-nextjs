'use client';

import { useState, useCallback } from 'react';

interface AlertState {
  isOpen: boolean;
  message: string;
  title?: string;
  type?: 'error' | 'warning' | 'success' | 'info';
}

export function useAlertModal() {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showAlert = useCallback(
    (message: string, options?: { title?: string; type?: 'error' | 'warning' | 'success' | 'info' }) => {
      setAlertState({
        isOpen: true,
        message,
        title: options?.title,
        type: options?.type || 'info',
      });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    alertState,
    showAlert,
    closeAlert,
  };
}