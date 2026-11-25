<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import BaseSheet from './BaseSheet.vue'

withDefaults(
  defineProps<{
    title: string
    message: string
    confirmLabel?: string
    isLoading?: boolean
  }>(),
  { confirmLabel: 'Delete', isLoading: false },
)

const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
</script>

<template>
  <BaseSheet :title="title" @close="emit('cancel')">
    <p>{{ message }}</p>
    <BaseButton variant="danger" :is-loading="isLoading" @click="emit('confirm')">
      {{ confirmLabel }}
    </BaseButton>
    <BaseButton variant="secondary" @click="emit('cancel')">Cancel</BaseButton>
  </BaseSheet>
</template>
