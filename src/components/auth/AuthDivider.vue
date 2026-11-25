<template>
  <div class="divider" role="separator">
    <span class="text"><slot>or</slot></span>
  </div>
</template>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.divider::before,
.divider::after {
  flex: 1;
  height: 1px;
  background: var(--color-border);
  content: '';
}
</style>
