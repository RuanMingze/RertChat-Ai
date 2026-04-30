"use client"

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  onConfirm: (() => void) | null
}

interface ConfirmDialogContextType {
  confirm: (title: string, message: string) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType>({
  confirm: async () => false,
})

export function useConfirm() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}

interface ConfirmDialogProviderProps {
  children: ReactNode
}

export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  })

  const confirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title,
        message,
        onConfirm: () => resolve(true),
      })
    })
  }, [])

  const handleCancel = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const handleConfirm = useCallback(() => {
    if (state.onConfirm) {
      state.onConfirm()
    }
    setState(prev => ({ ...prev, isOpen: false }))
  }, [state.onConfirm])

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {state.isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={handleCancel}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-foreground">{state.title}</h3>
            <p className="mb-6 text-sm text-muted-foreground whitespace-pre-wrap">{state.message}</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="min-w-[80px]"
              >
                取消
              </Button>
              <Button
                variant="default"
                onClick={handleConfirm}
                className="min-w-[80px]"
              >
                确定
              </Button>
            </div>
          </div>
        </>
      )}
    </ConfirmDialogContext.Provider>
  )
}
