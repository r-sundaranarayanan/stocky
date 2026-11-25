<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  min: number
  max: number
  step: number
  /** Human-readable value for screen readers, e.g. "Lose 1 lb per week". */
  valueText?: string
  minLabel?: string
  maxLabel?: string
}>()

const model = defineModel<number>({ required: true })
const id = useId()
</script>

<template>
  <div class="slider">
    <label :for="id" class="label">{{ label }}</label>
    <input
      :id="id"
      v-model.number="model"
      class="range"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :aria-valuetext="valueText"
    />
    <div v-if="minLabel || maxLabel" class="ends">
      <span>{{ minLabel }}</span>
      <span>{{ maxLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.slider {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label {
  font-size: var(--font-sm);
  font-weight: 600;
}

.range {
  width: 100%;
  height: var(--tap-size);
  margin: 0;
  accent-color: var(--color-primary);
}

.ends {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}
</style>
