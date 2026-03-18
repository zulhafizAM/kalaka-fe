import { writable } from 'svelte/store';

export const userStore = writable({
  email: "",
  kalaka_id: "",
  username: "Loading...",
  lastLogin: "Fetching...",
  roles: [],
});