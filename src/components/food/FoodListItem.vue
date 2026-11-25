<script setup lang="ts">
import type { Food } from '@/types'
import { formatNumber } from '@/utils/nutrition'

defineProps<{ food: Food }>()
const emit = defineEmits<{ (e: 'select', food: Food): void }>()
</script>

<template>
  <li>
    <button type="button" class="item" @click="emit('select', food)">
      <span class="info">
        <span class="name">{{ food.name }}</span>
        <span class="serving">
          {{ formatNumber(food.servingSize) }} {{ food.servingUnit }} · P
          {{ formatNumber(food.protein) }} · C {{ formatNumber(food.carbs) }} · F
          {{ formatNumber(food.fat) }}
        </span>
      </span>
      <span class="calories">{{ formatNumber(food.calories) }} <small>kcal</small></span>
    </button>
  </li>
</template>

<style scoped>
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  min-height: var(--tap-size);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  text-align: left;
}

.info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  font-weight: 600;
}

.serving {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.calories {
  font-weight: 700;
  white-space: nowrap;
}

.calories small {
  color: var(--color-text-muted);
  font-weight: 400;
}
</style>
