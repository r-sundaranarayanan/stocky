<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    type?: 'button' | 'submit'
    isLoading?: boolean
    isDisabled?: boolean
    isBlock?: boolean
  }>(),
  { variant: 'primary', type: 'button', isLoading: false, isDisabled: false, isBlock: true },
)
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn-${variant}`, { 'btn-block': isBlock }]"
    :disabled="isDisabled || isLoading"
  >
    <span v-if="isLoading" class="btn-spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--tap-size);
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: 600;
}

.btn-block {
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
}

.btn-secondary {
  background: var(--color-surface);
  border-color: var(--color-border);
}

.btn-danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.btn-ghost {
  background: transparent;
  color: var(--color-primary);
}

.btn-spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentcolor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
