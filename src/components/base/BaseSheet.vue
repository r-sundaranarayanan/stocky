<script setup lang="ts">
defineProps<{ title: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('close')" @keydown.esc="emit('close')">
      <section class="sheet" role="dialog" aria-modal="true" :aria-label="title">
        <h2 class="sheet-title">{{ title }}</h2>
        <slot />
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: var(--color-overlay);
}

.sheet {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  max-width: var(--content-max-width);
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-5) var(--space-4) var(--space-6);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--color-surface);
  color: var(--color-text);
}

.sheet-title {
  font-size: var(--font-lg);
}
</style>
