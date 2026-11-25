<script setup lang="ts">
import type { Entry } from '@/types'
import { formatNumber } from '@/utils/nutrition'

defineProps<{ entry: Entry; canConfirm?: boolean }>()
const emit = defineEmits<{ (e: 'confirm', entry: Entry): void }>()
</script>

<template>
  <li class="item">
    <RouterLink :to="{ name: 'entry-edit', params: { id: entry.id } }" class="row">
      <span class="info">
        <span class="name">
          {{ entry.foodName }}
          <span v-if="entry.status === 'planned'" class="badge">Planned</span>
        </span>
        <span class="detail">
          {{ formatNumber(entry.servings) }} × {{ formatNumber(entry.servingSize) }}
          {{ entry.servingUnit }}
        </span>
      </span>
      <span class="calories" :class="{ planned: entry.status === 'planned' }">
        {{ formatNumber(entry.calories) }}
      </span>
    </RouterLink>
    <button
      v-if="entry.status === 'planned' && canConfirm"
      type="button"
      class="confirm"
      :aria-label="`Confirm ${entry.foodName} as eaten`"
      @click="emit('confirm', entry)"
    >
      Ate it
    </button>
  </li>
</template>

<style scoped>
.item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.row {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-width: 0;
  min-height: var(--tap-size);
  padding: var(--space-2) 0;
  color: var(--color-text);
}

.info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.badge {
  margin-left: var(--space-1);
  padding: 1px var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
  font-size: 0.7rem;
  font-weight: 700;
}

.detail {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.calories {
  font-weight: 600;
}

.calories.planned {
  color: var(--color-text-muted);
  font-style: italic;
}

.confirm {
  min-height: 36px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-primary-dark);
  font-size: var(--font-sm);
  font-weight: 700;
  white-space: nowrap;
}
</style>
