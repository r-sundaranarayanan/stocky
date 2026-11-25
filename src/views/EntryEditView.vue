<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDiaryStore } from '@/stores/diary'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Entry, Meal } from '@/types'
import { MEALS } from '@/utils/constants'
import { formatNumber, pickNutrition, scaleNutrition } from '@/utils/nutrition'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseConfirmSheet from '@/components/base/BaseConfirmSheet.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import PageHeader from '@/components/layout/PageHeader.vue'

const props = defineProps<{ id: string }>()

const auth = useAuthStore()
const diary = useDiaryStore()
const router = useRouter()
const loadAction = useAsyncAction()
const saveAction = useAsyncAction()
const deleteAction = useAsyncAction()

const entry = ref<Entry | null>(null)
const servings = ref<string | number>(1)
const meal = ref<Meal>('breakfast')
const isConfirmingDelete = ref(false)

const servingsValue = computed(() => (typeof servings.value === 'number' ? servings.value : NaN))
const isValid = computed(() => servingsValue.value > 0 && servingsValue.value <= 100)
const preview = computed(() => {
  if (!entry.value || !isValid.value) return null
  const perServing = scaleNutrition(pickNutrition(entry.value), 1 / entry.value.servings)
  return scaleNutrition(perServing, servingsValue.value)
})

onMounted(() =>
  loadAction.run(async () => {
    entry.value = await diary.getEntry(auth.requireUid(), props.id)
    if (entry.value) {
      servings.value = entry.value.servings
      meal.value = entry.value.meal
    }
  }),
)

async function onSave() {
  const current = entry.value
  if (!current || !isValid.value) return
  const ok = await saveAction.run(async () => {
    await diary.update(auth.requireUid(), current, {
      meal: meal.value,
      servings: servingsValue.value,
    })
    return true
  })
  if (ok) router.back()
}

async function onDelete() {
  const ok = await deleteAction.run(async () => {
    await diary.remove(auth.requireUid(), props.id)
    return true
  })
  if (ok) router.back()
}
</script>

<template>
  <PageHeader title="Edit entry" has-back @back="router.back()" />
  <div class="page">
    <BaseSpinner v-if="loadAction.isPending.value" />
    <BaseAlert v-else-if="loadAction.error.value">{{ loadAction.error.value }}</BaseAlert>
    <BaseAlert v-else-if="!entry">This entry no longer exists.</BaseAlert>
    <template v-else>
      <h2>{{ entry.foodName }}</h2>
      <BaseInput
        v-model="servings"
        label="Number of servings"
        type="number"
        inputmode="decimal"
        step="any"
        :min="0"
        :error="isValid ? '' : 'Enter a number between 0 and 100'"
      />
      <BaseSelect v-model="meal" label="Meal" :options="MEALS" />
      <div v-if="preview" class="preview">
        <strong>{{ formatNumber(preview.calories) }} kcal</strong>
        <span>
          P {{ formatNumber(preview.protein) }}g · C {{ formatNumber(preview.carbs) }}g · F
          {{ formatNumber(preview.fat) }}g
        </span>
      </div>
      <BaseAlert v-if="saveAction.error.value">{{ saveAction.error.value }}</BaseAlert>
      <BaseButton :is-loading="saveAction.isPending.value" :is-disabled="!isValid" @click="onSave">
        Save
      </BaseButton>
      <BaseButton variant="danger" @click="isConfirmingDelete = true">Delete entry</BaseButton>
    </template>

    <BaseConfirmSheet
      v-if="isConfirmingDelete"
      title="Delete entry?"
      message="This removes it from your diary."
      :is-loading="deleteAction.isPending.value"
      @confirm="onDelete"
      @cancel="isConfirmingDelete = false"
    />
    <BaseAlert v-if="deleteAction.error.value">{{ deleteAction.error.value }}</BaseAlert>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-4) var(--space-5);
}

.preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
}
</style>
