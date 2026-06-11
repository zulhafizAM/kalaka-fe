import { writable } from 'svelte/store';

/**
 * Controls the dashboard sidebar drawer on mobile screens.
 * On `md` and up the sidebar is always visible, so this only matters below that breakpoint.
 * @type {import('svelte/store').Writable<boolean>}
 */
export const sidebarOpen = writable(false);
