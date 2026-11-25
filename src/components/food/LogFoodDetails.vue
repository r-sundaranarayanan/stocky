<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Food, Meal } from '@/types'
import { formatNumber, pickNutrition, scaleNutrition } from '@/utils/nutrition'
import MealPicker from '@/components/diary/MealPicker.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const props = withDefaults(
  defineProps<{
    food: Food
    initialMeal: Meal
    isLoading?: boolean
    error?: string
    /** Logging for a future day: the food is only planned, not eaten. */
    isPlanned?: boolean
  }>(),
  { isLoading: false, error: '', isPlanned: false },
)

const emit = defineEmits<{ (e: 'confirm', value: { servings: number; meal: Meal }): void }>()

const servings = ref<string | number>(1)
const meal = ref<Meal>(props.initialMeal)

const servingsValue = computed(() => (typeof servings.value === 'number' ? servings.value : NaN))
const isValid = computed(() => servingsValue.value > 0 && servingsValue.value <= 100)
const preview = computed(() =>
  scaleNutrition(pickNutrition(props.food), isValid.value ? servingsValue.value : 0),
)

function onConfirm() {
  if (isValid.value) emit('confirm', { servings: servingsValue.value, meal: meal.value })
}
</script>

<template>
  <div class="details">
    <div class="food">
      <h2 class="name">{{ food.name }}</h2>
      <p class="per-serving">
        1 serving = {{ formatNumber(food.servingSize) }} {{ food.servingUnit }} ·
        {{ formatNumber(food.calories) }} kcal
      </p>
    </div>

    <BaseInput
      v-model="servings"
      label="Number of servings"
      type="number"
      inputmode="decimal"
      step="any"
      :min="0"
      :error="isValid ? '' : 'Enter a number between 0 and 100'"
    />

    <div class="group">
      <span class="group-label">Meal</span>
      <MealPicker v-model="meal" />
    </div>

    <div class="preview" aria-live="polite">
      <strong>{{ formatNumber(preview.calories) }} kcal</strong>
      <span>
        P {{ formatNumber(preview.protein) }}g · C {{ formatNumber(preview.carbs) }}g · F
        {{ formatNumber(preview.fat) }}g
      </span>
    </div>

    <BaseAlert v-if="isPlanned" variant="success">
      This day is in the future, so it will be saved as planned. Confirm it on the day to count it
      as eaten.
    </BaseAlert>
    <BaseAlert v-if="error">{{ error }}</BaseAlert>
    <BaseButton :is-loading="isLoading" :is-disabled="!isValid" @click="onConfirm">
      {{ isPlanned ? 'Plan food' : 'Log food' }}
    </BaseButton>
  </div>
</template>

<style scoped>
.details {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.name {
  font-size: var(--font-lg);
}

.per-serving {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.group-label {
  font-size: var(--font-sm);
  font-weight: 600;
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
