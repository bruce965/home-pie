import { ReactNode } from 'react'

export interface WindowState {
    title: string
    x: number
    y: number
    width: number
    height: number
    content: ReactNode
}

export interface WindowManagerState {
    windows: { [handle: string]: WindowState }
}
