<template>
  <div class="spinner-wrap" role="status" aria-label="Loading">
    <span class="spinner" />
  </div>
</template>

<style scoped>
.spinner-wrap {
  display: flex;
  justify-content: center;
  padding: var(--space-6);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
