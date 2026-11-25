<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useAsyncAction } from '@/composables/useAsyncAction'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import PageHeader from '@/components/layout/PageHeader.vue'

const auth = useAuthStore()
const settings = useSettingsStore()
const router = useRouter()
const saveAction = useAsyncAction()
const logoutAction = useAsyncAction()

const goal = ref<string | number>(settings.calorieGoal)
const goalError = ref('')
const isSaved = ref(false)

async function onSaveGoal() {
  isSaved.value = false
  const value = Number(goal.value)
  if (goal.value === '' || !Number.isFinite(value) || value < 0 || value > 10000) {
    goalError.value = 'Enter a goal between 0 and 10000'
    return
  }
  goalError.value = ''
  const ok = await saveAction.run(async () => {
    await settings.saveGoal(auth.requireUid(), value)
    return true
  })
  isSaved.value = Boolean(ok)
}

async function onLogout() {
  const ok = await logoutAction.run(async () => {
    await auth.logOut()
    return true
  })
  if (ok) await router.push({ name: 'login' })
}
</script>

<template>
  <PageHeader title="Settings" />
  <div class="page">
    <p class="email">
      Signed in as <strong>{{ auth.user?.email }}</strong>
    </p>
    <form class="card" @submit.prevent="onSaveGoal">
      <BaseInput
        v-model="goal"
        label="Daily calorie goal (kcal)"
        type="number"
        inputmode="numeric"
        hint="Set to 0 to hide goal progress"
        :error="goalError"
        :min="0"
        :max="10000"
      />
      <BaseAlert v-if="saveAction.error.value">{{ saveAction.error.value }}</BaseAlert>
      <BaseAlert v-if="isSaved" variant="success">Goal saved.</BaseAlert>
      <BaseButton type="submit" :is-loading="saveAction.isPending.value">Save goal</BaseButton>
    </form>
    <BaseButton variant="secondary" @click="router.push({ name: 'onboarding' })">
      Recalculate goal from my details
    </BaseButton>
    <BaseAlert v-if="logoutAction.error.value">{{ logoutAction.error.value }}</BaseAlert>
    <BaseButton variant="danger" :is-loading="logoutAction.isPending.value" @click="onLogout">
      Log out
    </BaseButton>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.email {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow);
}
</style>
