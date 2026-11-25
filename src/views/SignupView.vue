<script setup lang="ts">
import { computed, ref } from 'vue'
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

const MIN_PASSWORD_LENGTH = 6

const auth = useAuthStore()
const router = useRouter()
const { isPending, error, run } = useAsyncAction()

const google = useGoogleSignIn()

const email = ref('')
const password = ref('')
const confirm = ref('')
const hasSubmitted = ref(false)

const passwordError = computed(() =>
  String(password.value).length < MIN_PASSWORD_LENGTH
    ? `Use at least ${MIN_PASSWORD_LENGTH} characters`
    : '',
)
const confirmError = computed(() =>
  confirm.value !== password.value ? 'Passwords do not match' : '',
)

async function onSubmit() {
  hasSubmitted.value = true
  if (passwordError.value || confirmError.value) return
  const ok = await run(async () => {
    await auth.signUp(email.value.trim(), String(password.value))
    return true
  })
  // The router guard sends new users to onboarding first.
  if (ok) await router.push({ name: 'diary' })
}
</script>

<template>
  <AuthCard title="Create account" subtitle="Start tracking your daily calories">
    <form class="form" novalidate @submit.prevent="onSubmit">
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
        autocomplete="new-password"
        hint="At least 6 characters (8+ recommended)"
        :error="hasSubmitted ? passwordError : ''"
        is-required
      />
      <BaseInput
        v-model="confirm"
        label="Confirm password"
        type="password"
        autocomplete="new-password"
        :error="hasSubmitted ? confirmError : ''"
        is-required
      />
      <BaseAlert v-if="error">{{ error }}</BaseAlert>
      <BaseButton type="submit" :is-loading="isPending">Create account</BaseButton>
    </form>
    <AuthDivider />
    <BaseAlert v-if="google.error.value">{{ google.error.value }}</BaseAlert>
    <GoogleSignInButton :is-loading="google.isPending.value" @click="google.signIn" />
    <template #footer>
      <span>Already have an account? <RouterLink to="/login">Log in</RouterLink></span>
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
