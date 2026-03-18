import { writable } from 'svelte/store'

export const defaultHeader = ""

export const header = writable(defaultHeader)