<script setup lang="ts">
import { computed } from 'vue'
import type { Entry } from '@/types'
import { formatNumber, sumNutrition } from '@/utils/nutrition'
import EntryRow from './EntryRow.vue'

const props = defineProps<{ label: string; entries: Entry[]; canConfirm?: boolean }>()
const emit = defineEmits<{ (e: 'confirm', entry: Entry): void }>()

const eaten = computed(
  () => sumNutrition(props.entries.filter((e) => e.status === 'eaten')).calories,
)
const planned = computed(
  () => sumNutrition(props.entries.filter((e) => e.status === 'planned')).calories,
)

const subtotal = computed(() => {
  const parts: string[] = []
  if (eaten.value > 0 || planned.value === 0) parts.push(`${formatNumber(eaten.value)} kcal`)
  if (planned.value > 0) parts.push(`${formatNumber(planned.value)} kcal planned`)
  return parts.join(' · ')
})
</script>

<template>
  <section class="meal">
    <header class="head">
      <h2 class="title">{{ label }}</h2>
      <span class="subtotal">{{ subtotal }}</span>
    </header>
    <ul v-if="entries.length" class="entries">
      <EntryRow
        v-for="entry in entries"
        :key="entry.id"
        :entry="entry"
        :can-confirm="canConfirm"
        @confirm="emit('confirm', $event)"
      />
    </ul>
    <p v-else class="empty">Nothing logged yet</p>
  </section>
</template>

<style scoped>
.meal {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.title {
  font-size: var(--font-md);
}

.subtotal {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.entries {
  margin: 0;
  padding: 0;
  list-style: none;
}

.empty {
  padding: var(--space-2) 0;
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}
</style>
