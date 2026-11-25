<script setup lang="ts">
import { computed } from 'vue'
import type { BodyStats } from '@/types'
import { calculateDailyTarget, calculateMaintenance, describeWeeklyChange } from '@/utils/calories'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseSlider from '@/components/base/BaseSlider.vue'

const MAX_WEEKLY_CHANGE_LB = 2

const props = defineProps<{ stats: BodyStats }>()

const weeklyChange = defineModel<number>({ required: true })

const maintenance = computed(() => calculateMaintenance(props.stats))
const target = computed(() =>
  calculateDailyTarget(maintenance.value, weeklyChange.value, props.stats.gender),
)
const summary = computed(() => describeWeeklyChange(weeklyChange.value))
const adjustmentText = computed(() => {
  const { adjustment } = target.value
  if (adjustment === 0) return 'Same as your maintenance calories'
  return `${adjustment > 0 ? '+' : '−'}${Math.abs(adjustment)} kcal/day vs. maintenance`
})
</script>

<template>
  <div class="picker">
    <div class="result" aria-live="polite">
      <span class="calories">{{ target.calories }}</span>
      <span class="unit">calories per day</span>
      <strong class="summary">{{ summary }}</strong>
      <span class="detail">{{ adjustmentText }}</span>
    </div>

    <BaseSlider
      v-model="weeklyChange"
      label="Weekly weight goal"
      :min="-MAX_WEEKLY_CHANGE_LB"
      :max="MAX_WEEKLY_CHANGE_LB"
      :step="0.5"
      :value-text="summary"
      :min-label="`Lose ${MAX_WEEKLY_CHANGE_LB} lb`"
      :max-label="`Gain ${MAX_WEEKLY_CHANGE_LB} lb`"
    />

    <BaseAlert v-if="target.isClamped">
      To stay safe we do not suggest eating below {{ target.calories }} calories a day, so this
      works out to about {{ Math.abs(target.effectiveWeeklyChangeLb) }} lb per week instead.
    </BaseAlert>

    <p class="maintenance">
      Your maintenance level is about <strong>{{ maintenance }}</strong> calories per day.
    </p>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-5) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
  text-align: center;
}

.calories {
  color: var(--color-primary-dark);
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
}

.unit {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.summary {
  margin-top: var(--space-2);
  font-size: var(--font-lg);
}

.detail {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

.maintenance {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
  text-align: center;
}
</style>
