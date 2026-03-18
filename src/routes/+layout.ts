import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { getSession, sessionStore } from '$lib/auth.ts';

const PUBLIC_ROUTES = new Set([
	'/',
	'/Map',
	'/Insights',
	'/Languages',
	'/About',
	'/Login',
	'/AdminLogin',
	'/Register',
	'/Logout',
	'/ResetPassword',
	'/VerifyEmail'
]);

export async function load({ url }) {
	if (!browser) return {};

	if (!PUBLIC_ROUTES.has(url.pathname)) {
		// Use cached store value if already known; otherwise verify with API
		const { isLoggedIn } = get(sessionStore);
		if (!isLoggedIn) {
			const session = await getSession();
			if (!session) {
				throw redirect(302, '/');
			}
		}
	}

	return {};
}
