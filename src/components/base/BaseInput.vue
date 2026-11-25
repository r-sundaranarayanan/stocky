<script setup lang="ts">
import { useId } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    type?: 'text' | 'email' | 'password' | 'number' | 'search'
    error?: string
    hint?: string
    autocomplete?: string
    inputmode?: 'text' | 'decimal' | 'numeric' | 'email' | 'search'
    min?: number
    max?: number
    step?: number | 'any'
    isRequired?: boolean
    isAutofocus?: boolean
  }>(),
  {
    type: 'text',
    error: '',
    hint: '',
    autocomplete: undefined,
    inputmode: undefined,
    min: undefined,
    max: undefined,
    step: undefined,
  },
)

const model = defineModel<string | number>({ required: true })
const id = useId()

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  model.value = props.type === 'number' && value !== '' ? Number(value) : value
}
</script>

<template>
  <div class="field">
    <label :for="id" class="label">{{ label }}</label>
    <input
      :id="id"
      class="input"
      :class="{ 'input-error': error }"
      :type="type"
      :value="model"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :min="min"
      :max="max"
      :step="step"
      :required="isRequired"
      :autofocus="isAutofocus"
      :aria-invalid="error ? 'true' : undefined"
      @input="onInput"
    />
    <p v-if="error" class="message message-error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="message">{{ hint }}</p>
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

.input {
  min-height: var(--tap-size);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  width: 100%;
}

.input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.input-error {
  border-color: var(--color-danger);
}

.message {
  font-size: var(--font-sm);
  color: var(--color-text-muted);
}

.message-error {
  color: var(--color-danger);
}
</style>
