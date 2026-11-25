<script setup lang="ts">
import { computed } from 'vue'
import { formatDateLabel, shiftDate, todayString } from '@/utils/date'

const date = defineModel<string>({ required: true })

const label = computed(() => formatDateLabel(date.value))
const isToday = computed(() => date.value === todayString())
</script>

<template>
  <div class="datenav">
    <button
      type="button"
      class="arrow"
      aria-label="Previous day"
      @click="date = shiftDate(date, -1)"
    >
      ‹
    </button>
    <button
      type="button"
      class="label"
      :disabled="isToday"
      :title="isToday ? '' : 'Jump to today'"
      @click="date = todayString()"
    >
      {{ label }}
    </button>
    <button type="button" class="arrow" aria-label="Next day" @click="date = shiftDate(date, 1)">
      ›
    </button>
  </div>
</template>

<style scoped>
.datenav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.arrow {
  width: var(--tap-size);
  height: var(--tap-size);
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 2rem;
  line-height: 1;
}

.label {
  flex: 1;
  min-height: var(--tap-size);
  border: none;
  background: transparent;
  font-size: var(--font-lg);
  font-weight: 700;
}

.label:not(:disabled) {
  color: var(--color-primary);
}
</style>
