<script>
  import { Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
  import { HomeOutline, ChevronDoubleRightOutline } from 'flowbite-svelte-icons';
  import { page } from '$app/stores';

  $: segments = $page.url.pathname.split('/').filter((segment) => segment !== '');
  $: isHomePage = $page.url.pathname === '/';
</script>

<slot /> {#if !isHomePage}
  <Breadcrumb aria-label="Dynamic breadcrumb example" class="bg-gray-50 py-3 px-5 dark:bg-gray-900 breadcrumb">
    <BreadcrumbItem href="/" home>
      <svelte:fragment slot="icon">
        <HomeOutline class="w-4 h-4 me-2" />
      </svelte:fragment>
      Home
    </BreadcrumbItem>

    {#each segments as segment, index}
      <BreadcrumbItem href={'/' + segments.slice(0, index + 1).join('/')}>
        <svelte:fragment slot="icon">
          <ChevronDoubleRightOutline class="w-5 h-5 mx-2 dark:text-white" />
        </svelte:fragment>
        {segment.charAt(0).toUpperCase() + segment.slice(1)}
      </BreadcrumbItem>
    {/each}
  </Breadcrumb>
{/if}

<style>
  /* Optional: Add any global styles here */
  .breadcrumb :global(.breadcrumb-item:not(:last-child) .breadcrumb-link::after) {
    @apply !content-['/']; /* Ensure the separator is a forward slash */
  }
</style>