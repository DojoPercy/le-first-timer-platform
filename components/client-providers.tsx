"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { Toaster } from "sonner"

export function ClientProviders() {
  const { theme = "system" } = useTheme()

  return (
    <Toaster
      theme={theme as any}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          success:
            "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800",
          error:
            "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800",
          info:
            "bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800",
          warning:
            "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
    />
  )
}
