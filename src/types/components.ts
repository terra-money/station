import { ReactNode } from "react"

export type Content = { title: ReactNode; content: ReactNode }
export type Contents = Content[]
export type Color = "info" | "warning" | "success" | "danger" | "default"

export type RenderButton = (open: () => void) => ReactNode

export interface Contacts {
  email?: string
  website?: string
  medium?: string
  discord?: string
  telegram?: string
  twitter?: string
}
