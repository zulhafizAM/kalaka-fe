<script>
	import { Label, Input, Button } from 'flowbite-svelte';
	import { EnvelopeSolid } from 'flowbite-svelte-icons';
	// @ts-expect-error yes it does exist
	import { Eye, EyeOff } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { adminStore } from '../stores/adminStore.js';
	import axios from 'axios';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let showPassword = false;
	let email = '';
	let password = '';
	let errorMessage = '';
	let isLoading = false;

	async function handleAdminLogin() {
		errorMessage = '';
		isLoading = true;

		try {
			const res = await axios.post(`${API_URL}/login`, { email, password });
			const { user, roles } = res.data;

			if (!roles || !roles.includes('Admin')) {
				errorMessage = 'Access denied. Admin privileges required.';
				return;
			}

			adminStore.set({
				email: user.email,
				username: user.full_name,
				lastLogin: new Date().toLocaleString()
			});

			goto('/AdminDashboard');
		} catch (err) {
			errorMessage = err.response?.data?.message || 'Invalid email or password.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-white">
	<div class="w-full max-w-md rounded-lg bg-white p-6">
		<h2 class="mb-6 text-center text-2xl font-bold">Admin Login</h2>

		{#if errorMessage}
			<div class="mb-4 text-center text-sm text-red-500">{errorMessage}</div>
		{/if}

		<!-- Email Input -->
		<div class="mb-4">
			<Label for="email" class="mb-2 block text-gray-700">Email</Label>
			<div class="relative">
				<Input
					id="email"
					bind:value={email}
					type="email"
					placeholder="admin@example.com"
					class="w-full pl-10 pr-4"
				/>
				<EnvelopeSolid
					class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400"
				/>
			</div>
		</div>

		<!-- Password Input -->
		<div class="mb-6">
			<Label for="password" class="mb-2 block text-gray-700">Password</Label>
			<div class="relative">
				<Input
					id="password"
					bind:value={password}
					type={showPassword ? 'text' : 'password'}
					placeholder="Enter your password"
					class="w-full pl-4 pr-10"
				/>
				<button
					type="button"
					class="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500"
					on:click={() => (showPassword = !showPassword)}
				>
					{#if showPassword}
						<EyeOff class="h-5 w-5" />
					{:else}
						<Eye class="h-5 w-5" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Login Button -->
		<Button
			on:click={handleAdminLogin}
			disabled={isLoading}
			class="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
		>
			{isLoading ? 'Logging in...' : 'Login'}
		</Button>

		<!-- Footer Links -->
		<div class="mt-6 text-center text-sm text-gray-600">
			<a href="/" class="text-blue-600 hover:underline">Forgot password?</a> |
			<a href="/Register" class="text-blue-600 hover:underline">Sign Up</a>
		</div>
	</div>
</div>
