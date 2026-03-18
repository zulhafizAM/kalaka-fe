<script>
    import { Label, Input, Button } from 'flowbite-svelte';
    import { EnvelopeSolid } from 'flowbite-svelte-icons';
    import { Eye, EyeOff } from 'lucide-svelte';
    import { goto } from '$app/navigation';

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    let showPassword = false;
    let showConfirmPassword = false;
    let name = "";
    let email = "";
    let password = "";
    let confirmPassword = "";
    let errorMessage = "";
    let successMessage = "";

    async function registerUser() {
        errorMessage = "";
        successMessage = "";

        if (password !== confirmPassword) {
            errorMessage = "Passwords do not match!";
            return;
        }

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                successMessage = data.message;
                // Clear form
                name = "";
                email = "";
                password = "";
                confirmPassword = "";
            } else {
                errorMessage = data.message || "Registration failed!";
            }
        } catch (err) {
            console.error("Fetch error:", err);
            errorMessage = "Server error. Check console for details.";
        }
    }
</script>

<div class="flex justify-center items-center min-h-[600px] bg-white-100">
    <div class="w-full max-w-md bg-white rounded-lg p-6">
        <h2 class="text-2xl font-bold text-center mb-4">Sign Up</h2>

        {#if successMessage}
            <div class="mb-6 rounded-lg bg-green-50 border border-green-200 p-5 text-center">
                <div class="mb-2 text-4xl">📧</div>
                <p class="text-green-800 font-semibold mb-1">Check your email!</p>
                <p class="text-green-700 text-sm">{successMessage}</p>
                <button
                    type="button"
                    on:click={() => goto('/Login')}
                    class="mt-4 text-sm text-blue-600 hover:underline"
                >
                    Back to Login
                </button>
            </div>
        {:else}
            {#if errorMessage}
                <p class="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
            {/if}

            <!-- Name Field -->
            <div class="mb-4">
                <Label for="name" class="block mb-2 text-gray-700">Full Name</Label>
                <Input id="name" bind:value={name} type="text" placeholder="Enter your full name" class="w-full" />
            </div>

            <!-- Email Field -->
            <div class="mb-4">
                <Label for="email" class="block mb-2 text-gray-700">Your Email</Label>
                <div class="relative">
                    <Input id="email" bind:value={email} type="email" placeholder="name@example.com" class="pl-10 pr-4 w-full" />
                    <EnvelopeSolid class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
            </div>

            <!-- Password Field -->
            <div class="mb-4">
                <Label for="password" class="block mb-2 text-gray-700">Password</Label>
                <div class="relative">
                    <Input id="password" bind:value={password} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" class="pl-4 pr-10 w-full" />
                    <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" on:click={() => showPassword = !showPassword}>
                        {#if showPassword}
                            <EyeOff class="w-5 h-5" />
                        {:else}
                            <Eye class="w-5 h-5" />
                        {/if}
                    </button>
                </div>
                <p class="text-sm text-gray-600 mt-1">(At least 6 characters with letters and numbers)</p>
            </div>

            <!-- Confirm Password Field -->
            <div class="mb-4">
                <Label for="confirmPassword" class="block mb-2 text-gray-700">Confirm Password</Label>
                <div class="relative">
                    <Input id="confirmPassword" bind:value={confirmPassword} type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" class="pl-4 pr-10 w-full" />
                    <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" on:click={() => showConfirmPassword = !showConfirmPassword}>
                        {#if showConfirmPassword}
                            <EyeOff class="w-5 h-5" />
                        {:else}
                            <Eye class="w-5 h-5" />
                        {/if}
                    </button>
                </div>
            </div>

            <!-- Register Button -->
            <Button on:click={registerUser} class="w-full hover:bg-blue-700 text-white font-semibold py-2 rounded-lg" style="background-color: #004aad;">
                Sign Up
            </Button>

            <!-- Already have an account? -->
            <div class="text-center mt-4 text-gray-600">
                Already have an account? <a href="/Login" class="text-blue-600 hover:underline text-sm">Login</a>
            </div>
        {/if}
    </div>
</div>
