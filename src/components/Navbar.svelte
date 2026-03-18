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
	</NavBrand>
	<NavHamburger />
	<NavUl>
		<NavLi
			href="/"
			class={activeUrl === '/'
				? 'font-bold text-white underline hover:scale-110'
				: 'text-white hover:scale-110'}
		>
			Home
		</NavLi>
		{#if isLoggedIn}
			<NavLi
				href='Dashboard'
				class={ activeUrl === '/Dashboard'
					? 'font-bold text-white underline hover:scale-110'
					: 'text-white hover:scale-110'}
			>
				Dashboard
			</NavLi>
		{/if}
		{#if isLoggedIn && roles.includes('Admin')}
			<NavLi
				href={'/AdminDashboard'}
				class={activeUrl === '/AdminDashboard'
					? 'font-bold text-white underline hover:scale-110'
					: 'text-white hover:scale-110'}
			>
				Admin Dashboard
			</NavLi>
		{/if}
		<NavLi
			href="/Map"
			class={activeUrl === '/Map'
				? 'font-bold text-white underline hover:scale-110'
				: 'text-white hover:scale-110'}
		>
			Map
		</NavLi>
		<NavLi
			href="/Insights"
			class={activeUrl === '/Insights'
				? 'font-bold text-white underline hover:scale-110'
				: 'text-white hover:scale-110'}
		>
			Insights
		</NavLi>
		<NavLi
			href="/Languages"
			class={activeUrl === '/Languages'
				? 'font-bold text-white underline hover:scale-110'
				: 'text-white hover:scale-110'}
		>
			Languages
		</NavLi>
		<NavLi
			href="/About"
			class={activeUrl === '/About'
				? 'font-bold text-white underline hover:scale-110'
				: 'text-white hover:scale-110'}
		>
			About
		</NavLi>

		{#if !isLoggedIn}
			<!-- Login Dropdown -->
			<NavLi href="/Login" class="cursor-pointer items-center text-white hover:scale-110">
				Login
			</NavLi>
		{/if}
		{#if isLoggedIn}
			<NavLi
				href='Logout'
				class='text-white hover:scale-110'
			>
				Logout
			</NavLi>
		{/if}
	</NavUl>
</Navbar>
