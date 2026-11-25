<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import AppShell from '@/components/layout/AppShell.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'

const auth = useAuthStore()
</script>

<template>
  <BaseSpinner v-if="!auth.isReady" />
  <AppShell v-else>
    <RouterView />
  </AppShell>
</template>
