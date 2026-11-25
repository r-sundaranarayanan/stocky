<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAsyncAction } from '@/composables/useAsyncAction'
import AuthCard from '@/components/auth/AuthCard.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const auth = useAuthStore()
const { isPending, error, run } = useAsyncAction()

const email = ref('')
const isSent = ref(false)

async function onSubmit() {
  await run(async () => {
    try {
      await auth.resetPassword(email.value.trim())
    } catch (e) {
      // Do not reveal whether an account exists; only surface non-account errors.
      const code = (e as { code?: string }).code
      if (code !== 'auth/user-not-found') throw e
    }
    isSent.value = true
  })
}
</script>

<template>
  <AuthCard title="Reset password" subtitle="We will email you a link to set a new password">
    <form class="form" @submit.prevent="onSubmit">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        inputmode="email"
        is-required
      />
      <BaseAlert v-if="isSent" variant="success">
        If an account exists for that email, a reset link is on its way.
      </BaseAlert>
      <BaseAlert v-if="error">{{ error }}</BaseAlert>
      <BaseButton type="submit" :is-loading="isPending">Send reset link</BaseButton>
    </form>
    <template #footer>
      <RouterLink to="/login">Back to log in</RouterLink>
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
