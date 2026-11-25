<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Entry } from '@/types'
import { isFutureDate } from '@/utils/date'
import { useAuthStore } from '@/stores/auth'
import { useDiaryStore } from '@/stores/diary'
import { useSettingsStore } from '@/stores/settings'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { MEALS } from '@/utils/constants'
import DateNav from '@/components/diary/DateNav.vue'
import MealSection from '@/components/diary/MealSection.vue'
import SummaryCard from '@/components/diary/SummaryCard.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import PageHeader from '@/components/layout/PageHeader.vue'

const auth = useAuthStore()
const diary = useDiaryStore()
const settings = useSettingsStore()
const { isPending, error, run } = useAsyncAction()
const isFirstLoad = ref(true)

async function load(date = diary.date) {
  await run(() => diary.load(auth.requireUid(), date))
  isFirstLoad.value = false
}

onMounted(() => load())

// Planned food can only be confirmed as eaten on (or after) its day, not in advance.
const isFuture = computed(() => isFutureDate(diary.date))
const confirmAction = useAsyncAction()

function onConfirm(entry: Entry) {
  return confirmAction.run(() => diary.confirm(auth.requireUid(), entry.id))
}
</script>

<template>
  <PageHeader title="Diary" />
  <div class="page">
    <DateNav :model-value="diary.date" @update:model-value="load" />
    <SummaryCard
      :totals="diary.totals"
      :planned="diary.plannedTotals"
      :goal="settings.calorieGoal"
      :is-future="isFuture"
    />
    <BaseAlert v-if="error">{{ error }}</BaseAlert>
    <BaseAlert v-if="confirmAction.error.value">{{ confirmAction.error.value }}</BaseAlert>
    <BaseButton v-if="error" variant="secondary" @click="load()">Retry</BaseButton>
    <BaseSpinner v-if="isPending && isFirstLoad" />
    <template v-else>
      <MealSection
        v-for="meal in MEALS"
        :key="meal.value"
        :label="meal.label"
        :entries="diary.entriesFor(meal.value)"
        :can-confirm="!isFuture"
        @confirm="onConfirm"
      />
    </template>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4) var(--space-5);
}
</style>
