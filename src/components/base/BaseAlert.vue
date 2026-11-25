<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'error' | 'success' }>(), { variant: 'error' })
</script>

<template>
  <p class="alert" :class="`alert-${variant}`" :role="variant === 'error' ? 'alert' : 'status'">
    <slot />
  </p>
</template>

<style scoped>
.alert {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
}

.alert-error {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.alert-success {
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
}
</style>
