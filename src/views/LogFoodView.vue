<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDiaryStore } from '@/stores/diary'
import { useFoodsStore } from '@/stores/foods'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Food, Meal } from '@/types'
import { defaultMealForNow, isMeal } from '@/utils/constants'
import { isFutureDate, isValidDateString } from '@/utils/date'
import { pickNutrition, scaleNutrition } from '@/utils/nutrition'
import FoodListItem from '@/components/food/FoodListItem.vue'
import LogFoodDetails from '@/components/food/LogFoodDetails.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import PageHeader from '@/components/layout/PageHeader.vue'

const auth = useAuthStore()
const diary = useDiaryStore()
const foodsStore = useFoodsStore()
const route = useRoute()
const router = useRouter()
const loadAction = useAsyncAction()
const logAction = useAsyncAction()

// Log to the day currently open in the diary unless a date is given.
const date = isValidDateString(route.query.date) ? route.query.date : diary.date
// Food logged for a future day is only planned until it is confirmed on the day.
const isPlanned = isFutureDate(date)
const initialMeal: Meal = isMeal(route.query.meal) ? route.query.meal : defaultMealForNow()

const searchTerm = ref('')
const selectedFood = ref<Food | null>(null)

// Only the signed-in user's own foods are loaded, so suggestions never include other users' items.
const suggestions = computed(() => foodsStore.search(searchTerm.value))
const hasNoFoods = computed(() => foodsStore.foods.length === 0)
const trimmedTerm = computed(() => searchTerm.value.trim())
const hasExactMatch = computed(() =>
  Boolean(trimmedTerm.value && foodsStore.findByName(trimmedTerm.value)),
)

onMounted(async () => {
  await loadAction.run(() => foodsStore.load(auth.requireUid()))
  // Coming back from "create new food": go straight to the details screen for it.
  const pick = route.query.pick
  if (typeof pick === 'string') selectedFood.value = foodsStore.findById(pick) ?? null
})

function onBack() {
  if (selectedFood.value) {
    selectedFood.value = null
    logAction.error.value = ''
  } else {
    router.back()
  }
}

function createNewFood() {
  router.push({
    name: 'food-new',
    query: { date, meal: initialMeal, name: trimmedTerm.value, from: 'log' },
  })
}

async function onLog({ servings, meal }: { servings: number; meal: Meal }) {
  const food = selectedFood.value
  if (!food) return
  const uid = auth.requireUid()
  const ok = await logAction.run(async () => {
    await diary.add(uid, {
      date,
      meal,
      status: isPlanned ? 'planned' : 'eaten',
      foodId: food.id,
      foodName: food.name,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      servings,
      ...scaleNutrition(pickNutrition(food), servings),
    })
    // Recent-list bookkeeping must not fail the log itself.
    await foodsStore.markUsed(uid, food.id).catch(() => undefined)
    return true
  })
  if (ok) {
    await diary.load(uid, date)
    await router.replace({ name: 'diary' })
  }
}
</script>

<template>
  <PageHeader :title="selectedFood ? 'Log food' : 'Search foods'" has-back @back="onBack" />
  <div class="page">
    <LogFoodDetails
      v-if="selectedFood"
      :key="selectedFood.id"
      :food="selectedFood"
      :initial-meal="initialMeal"
      :is-planned="isPlanned"
      :is-loading="logAction.isPending.value"
      :error="logAction.error.value"
      @confirm="onLog"
    />

    <template v-else>
      <BaseInput
        v-model="searchTerm"
        label="Search my foods"
        type="search"
        autocomplete="off"
        is-autofocus
      />

      <BaseSpinner v-if="loadAction.isPending.value" />
      <template v-else>
        <BaseAlert v-if="loadAction.error.value">{{ loadAction.error.value }}</BaseAlert>
        <p v-if="!trimmedTerm && !hasNoFoods" class="section-label">Recent foods</p>
        <ul v-if="suggestions.length" class="list" aria-label="Matching foods">
          <FoodListItem
            v-for="food in suggestions"
            :key="food.id"
            :food="food"
            @select="selectedFood = $event"
          />
        </ul>
        <BaseEmptyState
          v-else
          :title="hasNoFoods ? 'No foods yet' : 'No matching foods'"
          :text="
            hasNoFoods
              ? 'Create your first food to start tracking.'
              : 'Try another search or create a new food.'
          "
        />
        <BaseButton v-if="!hasExactMatch" variant="secondary" @click="createNewFood">
          {{ trimmedTerm ? `+ Create “${trimmedTerm}”` : '+ Create new food' }}
        </BaseButton>
      </template>
    </template>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4) var(--space-5);
}

.section-label {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
  font-weight: 600;
}

.list {
  margin: 0;
  padding: 0;
  overflow: hidden;
  border-radius: var(--radius-md);
  list-style: none;
}
</style>
