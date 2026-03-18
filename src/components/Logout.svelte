<script>
	import { goto } from '$app/navigation';
	import { clearSession } from '$lib/auth.ts';
	import { onMount } from 'svelte';
	import { userStore } from '../stores/userStore.js';
	import { adminStore } from '../stores/adminStore.js';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	async function logout() {
		try {
			await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			userStore.set({
				email: '',
				username: 'Loading...',
				lastLogin: 'Fetching...',
				roles: [],
				kalaka_id: ''
			});
			adminStore.set({
				email: '',
				username: 'Loading...',
				lastLogin: 'Fetching...'
			});
			clearSession();
			goto('/Login');
		}
	}

	onMount(() => {
		logout();
	});
</script>

<div class="h-screen"></div>
