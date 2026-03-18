<script lang="ts">
	import { Button, Input, Label } from 'flowbite-svelte';
	import { EnvelopeSolid } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import { setSession } from '$lib/auth.ts';
	// @ts-expect-error yes it does exist
	import { Eye, EyeOff } from 'lucide-svelte';

	const API_URL = import.meta.env.VITE_API_BASE_URL;
	let showPassword = false;
	let email = '';
	let password = '';
	let errorMessage = '';

	// Forgot password modal state
	let showForgotModal = false;
	let forgotEmail = '';
	let forgotMessage = '';
	let forgotError = '';
	let forgotLoading = false;

	async function handleLogin() {
		errorMessage = '';
		try {
			const response = await axios.post(`${API_URL}/login`, { email, password });
			const roles = response.data.roles ?? [];
			setSession(roles);
			if (roles.includes('Admin')) {
				goto('/AdminDashboard');
			} else {
				goto('/Dashboard');
			}
		} catch (err) {
			const e = err as { response?: { data?: { message?: string } } };
			errorMessage = e.response?.data?.message ?? 'Invalid email or password.';
		}
	}

	async function handleForgotPassword() {
		forgotError = '';
		forgotMessage = '';
		forgotLoading = true;
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email: forgotEmail });
			forgotMessage = response.data.message;
		} catch (err) {
			const e = err as { response?: { data?: { message?: string } } };
			forgotError = e.response?.data?.message ?? 'Something went wrong. Please try again.';
		} finally {
			forgotLoading = false;
		}
	}

	function openForgotModal() {
		forgotEmail = '';
		forgotMessage = '';
		forgotError = '';
		showForgotModal = true;
	}

	function closeForgotModal() {
		showForgotModal = false;
	}
</script>

<div class="flex min-h-[540px] items-center justify-center bg-white">
	<div class="w-full max-w-md rounded-lg bg-white p-6">
		<h2 class="mb-4 text-center text-2xl font-bold">Login</h2>

		{#if errorMessage}
			<p class="mb-4 text-center text-red-500">{errorMessage}</p>
		{/if}

		<!-- Email Field -->
		<div class="mb-4">
			<Label for="email" class="mb-2 block text-gray-700">Your Email</Label>
			<div class="relative">
				<Input
					id="email"
					bind:value={email}
					type="email"
					placeholder="name@example.com"
					class="w-full pl-10 pr-4"
				/>
				<EnvelopeSolid
					class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-500"
				/>
			</div>
		</div>

		<!-- Password Field -->
		<div class="mb-4">
			<Label for="password" class="mb-2 block text-gray-700">Your Password</Label>
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
			on:click={handleLogin}
			class="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
		>
			Login
		</Button>

		<!-- Forgot Password & Register -->
		<div class="mt-4 text-center text-gray-600">
			<button
				type="button"
				on:click={openForgotModal}
				class="text-sm text-blue-600 hover:underline"
			>
				Forgot password?
			</button>
			|
			<a
				href="/Register"
				on:click={(e) => {
					e.preventDefault();
					goto('/Register');
				}}
				class="text-sm text-blue-600 hover:underline">Sign Up</a
			>
		</div>
	</div>
</div>

<!-- Forgot Password Modal -->
{#if showForgotModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
			<h3 class="mb-4 text-xl font-semibold">Reset Password</h3>

			{#if forgotMessage}
				<p class="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{forgotMessage}</p>
			{:else}
				<p class="mb-4 text-sm text-gray-600">
					Enter your email address and we'll send you a link to reset your password.
				</p>

				{#if forgotError}
					<p class="mb-3 text-sm text-red-500">{forgotError}</p>
				{/if}

				<div class="mb-4">
					<Label for="forgotEmail" class="mb-2 block text-gray-700">Email</Label>
					<Input
						id="forgotEmail"
						bind:value={forgotEmail}
						type="email"
						placeholder="name@example.com"
						class="w-full"
					/>
				</div>

				<Button
					on:click={handleForgotPassword}
					disabled={forgotLoading}
					class="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{forgotLoading ? 'Sending...' : 'Send Reset Link'}
				</Button>
			{/if}

			<button
				type="button"
				on:click={closeForgotModal}
				class="mt-3 w-full rounded border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50"
			>
				Close
			</button>
		</div>
	</div>
{/if}
