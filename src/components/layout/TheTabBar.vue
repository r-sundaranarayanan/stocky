<script setup lang="ts">
const tabs = [
  { to: '/', label: 'Diary', icon: '📓' },
  { to: '/foods', label: 'My Foods', icon: '🍎' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]
</script>

<template>
  <div class="footer">
    <div class="log">
      <RouterLink :to="{ name: 'log-food' }" class="log-btn">
        <svg class="log-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Log food
      </RouterLink>
    </div>
    <nav class="tabs" aria-label="Main">
      <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab">
        <span aria-hidden="true">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 50;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--content-max-width);
  height: calc(var(--logbar-height) + var(--tabbar-height));
  transform: translateX(-50%);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.log {
  display: flex;
  align-items: center;
  height: var(--logbar-height);
  padding: 0 var(--space-4);
}

.log-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  height: var(--tap-size);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  font-weight: 700;
}

.log-btn:active {
  background: var(--color-primary-dark);
}

.log-btn:focus-visible {
  outline: 2px solid var(--color-primary-dark);
  outline-offset: 2px;
}

.log-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 2.6;
  stroke-linecap: round;
}

.tabs {
  display: flex;
  height: var(--tabbar-height);
}

.tab {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 1.2rem;
}

.tab-label {
  font-size: 0.72rem;
  font-weight: 600;
}

.tab.router-link-exact-active {
  color: var(--color-primary);
}
</style>
