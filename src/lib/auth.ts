import axios from 'axios';
import { writable } from 'svelte/store';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Send session cookies with every request
axios.defaults.withCredentials = true;

export const sessionStore = writable<{ isLoggedIn: boolean; roles: string[] }>({
	isLoggedIn: false,
	roles: []
});

export async function getSession(): Promise<{ user: Record<string, unknown>; roles: string[] } | null> {
	try {
		const res = await axios.get(`${API_URL}/me`);
		sessionStore.set({ isLoggedIn: true, roles: res.data.roles ?? [] });
		return res.data;
	} catch {
		sessionStore.set({ isLoggedIn: false, roles: [] });
		return null;
	}
}

export function setSession(roles: string[]): void {
	sessionStore.set({ isLoggedIn: true, roles });
}

export function clearSession(): void {
	sessionStore.set({ isLoggedIn: false, roles: [] });
}

export async function logout(): Promise<void> {
	await axios.post(`${API_URL}/logout`).catch(() => {});
	clearSession();
}
