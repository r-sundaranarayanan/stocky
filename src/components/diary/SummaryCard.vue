<script setup lang="ts">
import { computed } from 'vue'
import type { Nutrition } from '@/types'
import { EMPTY_NUTRITION, formatNumber } from '@/utils/nutrition'

const props = withDefaults(
  defineProps<{
    /** Totals of food that has been eaten. */
    totals: Nutrition
    /** Totals of planned (not yet confirmed) food. */
    planned?: Nutrition
    goal: number
    /** Future day: show the planned intake instead of the eaten intake. */
    isFuture?: boolean
  }>(),
  { planned: () => ({ ...EMPTY_NUTRITION }), isFuture: false },
)

const shown = computed(() => (props.isFuture ? props.planned : props.totals))
const hasGoal = computed(() => props.goal > 0)
const remaining = computed(() => Math.round((props.goal - shown.value.calories) * 10) / 10)
const isOver = computed(() => remaining.value < 0)
const percent = computed(() =>
  hasGoal.value ? Math.min(100, (shown.value.calories / props.goal) * 100) : 0,
)
const hasPlannedToConfirm = computed(() => !props.isFuture && props.planned.calories > 0)
</script>

<template>
  <section class="card" aria-label="Daily summary">
    <p v-if="isFuture" class="caption">Planned calorie intake</p>
    <div class="stats">
      <div v-if="hasGoal" class="stat">
        <strong>{{ formatNumber(goal) }}</strong>
        <span>Goal</span>
      </div>
      <div class="stat">
        <strong>{{ formatNumber(shown.calories) }}</strong>
        <span>{{ isFuture ? 'Planned' : 'Eaten' }}</span>
      </div>
      <div v-if="hasGoal" class="stat" :class="{ over: isOver }">
        <strong>{{ formatNumber(Math.abs(remaining)) }}</strong>
        <span>{{ isOver ? 'Over' : 'Remaining' }}</span>
      </div>
    </div>
    <div
      v-if="hasGoal"
      class="bar"
      role="progressbar"
      :aria-valuenow="Math.round(percent)"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="bar-fill"
        :class="{ over: isOver, planned: isFuture }"
        :style="{ width: `${percent}%` }"
      />
    </div>
    <p class="macros">
      Protein {{ formatNumber(shown.protein) }}g · Carbs {{ formatNumber(shown.carbs) }}g · Fat
      {{ formatNumber(shown.fat) }}g
    </p>
    <p v-if="hasPlannedToConfirm" class="note">
      {{ formatNumber(planned.calories) }} kcal planned. Confirm it as eaten to count it.
    </p>
  </section>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.caption {
  color: var(--color-primary-dark);
  font-size: var(--font-sm);
  font-weight: 700;
  text-align: center;
}

.stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat strong {
  font-size: var(--font-xl);
}

.stat span {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.stat.over strong {
  color: var(--color-danger);
}

.bar {
  height: 10px;
  overflow: hidden;
  border-radius: 5px;
  background: var(--color-border);
}

.bar-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.bar-fill.planned {
  background: repeating-linear-gradient(
    45deg,
    var(--color-primary),
    var(--color-primary) 6px,
    var(--color-primary-soft) 6px,
    var(--color-primary-soft) 12px
  );
}

.bar-fill.over {
  background: var(--color-danger);
}

.macros {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
  text-align: center;
}

.note {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
  font-size: var(--font-sm);
  text-align: center;
}
</style>
