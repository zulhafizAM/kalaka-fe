<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { setSession } from '$lib/auth.ts';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let status: 'loading' | 'success' | 'error' = 'loading';
	let message = '';

	onMount(async () => {
		const token = $page.url.searchParams.get('token') ?? '';
		const email = $page.url.searchParams.get('email') ?? '';

		if (!token || !email) {
			status = 'error';
			message = 'Invalid verification link.';
			return;
		}

		try {
			const res = await fetch(
				`${API_URL}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
				{ credentials: 'include' }
			);
			const data = await res.json();

			if (res.ok) {
				const roles = data.roles ?? [];
				setSession(roles);
				status = 'success';
				message = data.message;
				// Redirect after a short delay
				setTimeout(() => {
					if (roles.includes('Admin')) {
						goto('/AdminDashboard');
					} else {
						goto('/Dashboard');
					}
				}, 2000);
			} else {
				status = 'error';
				message = data.message || 'Verification failed.';
			}
		} catch {
			status = 'error';
			message = 'Server error. Please try again.';
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow">
		{#if status === 'loading'}
			<div class="mb-4 text-4xl">⏳</div>
			<p class="text-gray-600">Verifying your email...</p>
		{:else if status === 'success'}
			<div class="mb-4 text-4xl">✅</div>
			<h2 class="mb-2 text-xl font-bold text-green-700">Email Verified!</h2>
			<p class="text-gray-600">{message}</p>
			<p class="mt-2 text-sm text-gray-500">Redirecting you to your dashboard...</p>
		{:else}
			<div class="mb-4 text-4xl">❌</div>
			<h2 class="mb-2 text-xl font-bold text-red-600">Verification Failed</h2>
			<p class="mb-4 text-gray-600">{message}</p>
			<a href="/Register" class="text-sm text-blue-600 hover:underline">Register again</a>
			<span class="mx-2 text-gray-400">|</span>
			<a href="/Login" class="text-sm text-blue-600 hover:underline">Back to Login</a>
		{/if}
	</div>
</div>
