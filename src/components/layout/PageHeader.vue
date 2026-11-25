<script setup lang="ts">
defineProps<{ title: string; hasBack?: boolean }>()
const emit = defineEmits<{ (e: 'back'): void }>()
</script>

<template>
  <header class="header">
    <button v-if="hasBack" type="button" class="back" aria-label="Go back" @click="emit('back')">
      ‹
    </button>
    <h1 class="title">{{ title }}</h1>
    <div class="actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 56px;
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.title {
  flex: 1;
  font-size: var(--font-lg);
}

.back {
  width: var(--tap-size);
  height: var(--tap-size);
  margin-left: calc(var(--space-2) * -1);
  border: none;
  background: transparent;
  font-size: 2rem;
  line-height: 1;
  color: var(--color-primary);
}
</style>
