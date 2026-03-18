<script>
  import { Carousel, Card, Button } from 'flowbite-svelte';
  import { ArrowRightOutline } from 'flowbite-svelte-icons';
</script>

<Carousel indicators controls class="h-64 md:h-96">
  <div class="relative h-full duration-700 ease-in-out" data-carousel-item>
    <Card class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4 sm:p-6 md:p-8">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
      <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
      <Button href="#" class="w-fit">
        Read more <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
      </Button>
    </Card>
  </div>
  <div class="relative h-full duration-700 ease-in-out" data-carousel-item>
    <Card class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4 sm:p-6 md:p-8">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Another Noteworthy Topic</h5>
      <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Some different content for the second slide.</p>
      <Button href="#" class="w-fit">
        Learn More <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
      </Button>
    </Card>
  </div>
  <div class="relative h-full duration-700 ease-in-out" data-carousel-item>
    <Card class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4 sm:p-6 md:p-8">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Yet Another Interesting Subject</h5>
      <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">The content for the third slide in our carousel.</p>
      <Button href="#" class="w-fit">
        Explore <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
      </Button>
    </Card>
  </div>
  </Carousel>