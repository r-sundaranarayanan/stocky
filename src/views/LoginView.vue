<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { useGoogleSignIn } from '@/composables/useGoogleSignIn'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthDivider from '@/components/auth/AuthDivider.vue'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const auth = useAuthStore()
const router = useRouter()
const { isPending, error, run } = useAsyncAction()

const google = useGoogleSignIn()

const email = ref('')
const password = ref('')

async function onSubmit() {
  const ok = await run(async () => {
    await auth.logIn(email.value.trim(), String(password.value))
    return true
  })
  if (ok) await router.push({ name: 'diary' })
}
</script>

<template>
  <AuthCard title="Welcome back" subtitle="Log in to track your meals">
    <form class="form" @submit.prevent="onSubmit">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        inputmode="email"
        is-required
      />
      <BaseInput
        v-model="password"
        label="Password"
        type="password"
        autocomplete="current-password"
        is-required
      />
      <BaseAlert v-if="error">{{ error }}</BaseAlert>
      <BaseButton type="submit" :is-loading="isPending">Log in</BaseButton>
    </form>
    <AuthDivider />
    <BaseAlert v-if="google.error.value">{{ google.error.value }}</BaseAlert>
    <GoogleSignInButton :is-loading="google.isPending.value" @click="google.signIn" />
    <template #footer>
      <RouterLink to="/reset">Forgot password?</RouterLink>
      <span>New here? <RouterLink to="/signup">Create account</RouterLink></span>
    </template>
  </AuthCard>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
