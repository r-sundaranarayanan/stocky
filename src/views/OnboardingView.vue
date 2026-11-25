<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { BodyStats } from '@/types'
import { calculateDailyTarget, calculateMaintenance } from '@/utils/calories'
import AboutYouForm from '@/components/onboarding/AboutYouForm.vue'
import CalorieTargetPicker from '@/components/onboarding/CalorieTargetPicker.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import PageHeader from '@/components/layout/PageHeader.vue'

const DEFAULT_WEEKLY_CHANGE_LB = -1

const auth = useAuthStore()
const settings = useSettingsStore()
const router = useRouter()
const saveAction = useAsyncAction()
const skipAction = useAsyncAction()

const step = ref<'about' | 'plan'>('about')
const stats = ref<BodyStats | null>(settings.stats)
const weeklyChange = ref(settings.weeklyChangeLb ?? DEFAULT_WEEKLY_CHANGE_LB)

const finalCalories = computed(() => {
  if (!stats.value) return 0
  const maintenance = calculateMaintenance(stats.value)
  return calculateDailyTarget(maintenance, weeklyChange.value, stats.value.gender).calories
})

function onAbout(value: BodyStats) {
  stats.value = value
  step.value = 'plan'
}

async function onSave() {
  const current = stats.value
  if (!current) return
  const ok = await saveAction.run(async () => {
    await settings.saveOnboarding(
      auth.requireUid(),
      current,
      weeklyChange.value,
      finalCalories.value,
    )
    return true
  })
  if (ok) await router.replace({ name: 'diary' })
}

async function onSkip() {
  const ok = await skipAction.run(async () => {
    await settings.skipOnboarding(auth.requireUid())
    return true
  })
  if (ok) await router.replace({ name: 'diary' })
}
</script>

<template>
  <PageHeader
    :title="step === 'about' ? 'About you' : 'Your daily calories'"
    :has-back="step === 'plan'"
    @back="step = 'about'"
  />
  <div class="page">
    <template v-if="step === 'about'">
      <p class="intro">
        Tell us a little about yourself and we will work out how many calories you should eat each
        day.
      </p>
      <AboutYouForm :initial="stats" @submit="onAbout" />
      <BaseAlert v-if="skipAction.error.value">{{ skipAction.error.value }}</BaseAlert>
      <BaseButton
        v-if="!settings.onboardingCompleted"
        variant="ghost"
        :is-loading="skipAction.isPending.value"
        @click="onSkip"
      >
        Skip for now
      </BaseButton>
    </template>

    <template v-else-if="stats">
      <p class="intro">
        Drag the slider to see how your daily calories change with how fast you want to lose or gain
        weight.
      </p>
      <CalorieTargetPicker v-model="weeklyChange" :stats="stats" />
      <BaseAlert v-if="saveAction.error.value">{{ saveAction.error.value }}</BaseAlert>
      <BaseButton :is-loading="saveAction.isPending.value" @click="onSave">
        Set {{ finalCalories }} calories as my daily goal
      </BaseButton>
    </template>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-4) var(--space-5);
}

.intro {
  color: var(--color-text-muted);
}
</style>
