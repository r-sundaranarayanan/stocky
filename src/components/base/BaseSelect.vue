<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  options: { value: string; label: string }[]
}>()

const model = defineModel<string>({ required: true })
const id = useId()
</script>

<template>
  <div class="field">
    <label :for="id" class="label">{{ label }}</label>
    <select :id="id" v-model="model" class="select">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.label {
  font-size: var(--font-sm);
  font-weight: 600;
}

.select {
  min-height: var(--tap-size);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  width: 100%;
}

.select:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}
</style>
