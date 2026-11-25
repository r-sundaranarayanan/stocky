<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="auth">
    <div class="brand" aria-hidden="true">🥗</div>
    <h1 class="title">{{ title }}</h1>
    <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    <div class="body"><slot /></div>
    <div class="footer"><slot name="footer" /></div>
  </div>
</template>

<style scoped>
.auth {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-4);
}

.brand {
  font-size: 3rem;
  text-align: center;
}

.title {
  font-size: var(--font-xl);
  text-align: center;
}

.subtitle {
  color: var(--color-text-muted);
  text-align: center;
}

.body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-3);
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
  font-size: var(--font-sm);
}
</style>
