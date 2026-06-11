<script lang="ts">
	import { page } from '$app/stores';
	import {
		Dropdown,
		DropdownItem,
		Navbar,
		NavBrand,
		NavHamburger,
		NavLi,
		NavUl
	} from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { getSession, sessionStore } from '$lib/auth.ts';
	import { onMount } from 'svelte';

	$: isLoggedIn = $sessionStore.isLoggedIn;
	$: roles = $sessionStore.roles;

	onMount(async () => {
		await getSession();
	});

	$: activeUrl = $page.url.pathname;
</script>

<Navbar style="background-color: #092e6d;" class="p-0">
	<NavBrand href="/">
		<img src="/kalaka_home.png" class="me-4 h-10 sm:h-20" alt="Kalaka Logo" />
		<span class="text-sm font-semibold leading-tight text-white sm:text-base"
			>Language Map of Malaysia</span
		>
	</NavBrand>
	<NavHamburger class="text-white hover:bg-blue-800 focus:ring-blue-800" />
	<NavUl
		class="rounded-lg border border-blue-950 bg-[#061a3d] p-4 md:border-0 md:bg-transparent md:p-0"
	>
		<NavLi
			href="/"
			class={activeUrl === '/'
				? 'font-bold text-blue-200 underline hover:scale-110'
				: 'text-blue-200 hover:scale-110'}
		>
			Home
		</NavLi>
		{#if isLoggedIn}
			<NavLi
				href="Dashboard"
				class={activeUrl === '/Dashboard'
					? 'font-bold text-blue-200 underline hover:scale-110'
					: 'text-blue-200 hover:scale-110'}
			>
				Dashboard
			</NavLi>
		{/if}
		{#if isLoggedIn && roles.includes('Admin')}
			<NavLi
				href={'/AdminDashboard'}
				class={activeUrl === '/AdminDashboard'
					? 'font-bold text-blue-200 underline hover:scale-110'
					: 'text-blue-200 hover:scale-110'}
			>
				Admin Dashboard
			</NavLi>
		{/if}
		<NavLi
			href="/Map"
			class={activeUrl === '/Map'
				? 'font-bold text-blue-200 underline hover:scale-110'
				: 'text-blue-200 hover:scale-110'}
		>
			Map
		</NavLi>
		<NavLi
			href="/Insights"
			class={activeUrl === '/Insights'
				? 'font-bold text-blue-200 underline hover:scale-110'
				: 'text-blue-200 hover:scale-110'}
		>
			Insights
		</NavLi>
		<NavLi
			href="/Languages"
			class={activeUrl === '/Languages'
				? 'font-bold text-blue-200 underline hover:scale-110'
				: 'text-blue-200 hover:scale-110'}
		>
			Languages
		</NavLi>
		<NavLi
			href="/About"
			class={activeUrl === '/About'
				? 'font-bold text-blue-200 underline hover:scale-110'
				: 'text-blue-200 hover:scale-110'}
		>
			About
		</NavLi>

		{#if !isLoggedIn}
			<!-- Login Dropdown -->
			<NavLi href="/Login" class="cursor-pointer items-center text-blue-200 hover:scale-110">
				Login
			</NavLi>
		{/if}
		{#if isLoggedIn}
			<NavLi href="Logout" class="text-blue-200 hover:scale-110">Logout</NavLi>
		{/if}
	</NavUl>
</Navbar>
