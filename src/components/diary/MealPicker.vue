<script setup lang="ts">
import type { Meal } from '@/types'
import { MEALS } from '@/utils/constants'

const meal = defineModel<Meal>({ required: true })
</script>

<template>
  <div class="meals" role="radiogroup" aria-label="Meal">
    <button
      v-for="m in MEALS"
      :key="m.value"
      type="button"
      role="radio"
      class="meal"
      :class="{ active: meal === m.value }"
      :aria-checked="meal === m.value"
      @click="meal = m.value"
    >
      {{ m.label }}
    </button>
  </div>
</template>

<style scoped>
.meals {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-1);
}

.meal {
  min-height: var(--tap-size);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--font-sm);
  font-weight: 600;
}

.meal.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
}
</style>
