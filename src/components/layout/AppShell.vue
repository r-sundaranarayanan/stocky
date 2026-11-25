<script setup lang="ts">
import { useRoute } from 'vue-router'
import TheTabBar from './TheTabBar.vue'

const route = useRoute()
</script>

<template>
  <div class="shell" :class="{ 'has-tabs': route.meta.showTabs }">
    <main class="content">
      <slot />
    </main>
    <TheTabBar v-if="route.meta.showTabs" />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  min-height: 100dvh;
}

.has-tabs {
  padding-bottom: calc(var(--logbar-height) + var(--tabbar-height));
}
</style>
