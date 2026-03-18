<script lang="ts">
	import { Button, Input, Label } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	// @ts-expect-error yes it does exist
	import { Eye, EyeOff } from 'lucide-svelte';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let token = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let showPassword = false;
	let showConfirm = false;
	let errorMessage = '';
	let successMessage = '';
	let loading = false;

	onMount(() => {
		token = $page.url.searchParams.get('token') ?? '';
		email = $page.url.searchParams.get('email') ?? '';

		if (!token || !email) {
			errorMessage = 'Invalid reset link. Please request a new one.';
		}
	});

	async function handleReset() {
		errorMessage = '';
		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match.';
			return;
		}
		if (password.length < 6) {
			errorMessage = 'Password must be at least 6 characters.';
			return;
		}
		loading = true;
		try {
			const res = await fetch(`${API_URL}/reset-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, token, password })
			});
			const data = await res.json();
			if (res.ok) {
				successMessage = data.message;
			} else {
				errorMessage = data.message || 'Something went wrong.';
			}
		} catch {
			errorMessage = 'Server error. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-md rounded-lg bg-white p-8 shadow">
		<h2 class="mb-6 text-center text-2xl font-bold">Set New Password</h2>

		{#if successMessage}
			<div class="mb-6 rounded-lg border border-green-200 bg-green-50 p-5 text-center">
				<p class="font-semibold text-green-800">{successMessage}</p>
				<button
					type="button"
					on:click={() => goto('/Login')}
					class="mt-4 text-sm text-blue-600 hover:underline"
				>
					Go to Login
				</button>
			</div>
		{:else}
			{#if errorMessage}
				<p class="mb-4 text-center text-sm text-red-500">{errorMessage}</p>
			{/if}

			{#if token && email}
				<div class="mb-4">
					<Label for="password" class="mb-2 block text-gray-700">New Password</Label>
					<div class="relative">
						<Input
							id="password"
							bind:value={password}
							type={showPassword ? 'text' : 'password'}
							placeholder="Enter new password"
							class="w-full pl-4 pr-10"
						/>
						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
							on:click={() => (showPassword = !showPassword)}
						>
							{#if showPassword}<EyeOff class="h-5 w-5" />{:else}<Eye class="h-5 w-5" />{/if}
						</button>
					</div>
				</div>

				<div class="mb-6">
					<Label for="confirm" class="mb-2 block text-gray-700">Confirm Password</Label>
					<div class="relative">
						<Input
							id="confirm"
							bind:value={confirmPassword}
							type={showConfirm ? 'text' : 'password'}
							placeholder="Confirm new password"
							class="w-full pl-4 pr-10"
						/>
						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
							on:click={() => (showConfirm = !showConfirm)}
						>
							{#if showConfirm}<EyeOff class="h-5 w-5" />{:else}<Eye class="h-5 w-5" />{/if}
						</button>
					</div>
				</div>

				<Button
					on:click={handleReset}
					disabled={loading}
					class="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{loading ? 'Resetting...' : 'Reset Password'}
				</Button>
			{/if}

			<div class="mt-4 text-center">
				<a href="/Login" class="text-sm text-blue-600 hover:underline">Back to Login</a>
			</div>
		{/if}
	</div>
</div>
