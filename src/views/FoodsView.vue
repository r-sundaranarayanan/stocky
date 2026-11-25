<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFoodsStore } from '@/stores/foods'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Food } from '@/types'
import FoodListItem from '@/components/food/FoodListItem.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import PageHeader from '@/components/layout/PageHeader.vue'

const auth = useAuthStore()
const foodsStore = useFoodsStore()
const router = useRouter()
const { isPending, error, run } = useAsyncAction()

const searchTerm = ref('')

const results = computed(() => {
  const q = searchTerm.value.trim().toLowerCase()
  return q
    ? foodsStore.sortedByName.filter((f) => f.name.toLowerCase().includes(q))
    : foodsStore.sortedByName
})

const load = () => run(() => foodsStore.load(auth.requireUid(), true))
onMounted(load)

function edit(food: Food) {
  router.push({ name: 'food-edit', params: { id: food.id } })
}
</script>

<template>
  <PageHeader title="My Foods">
    <template #actions>
      <RouterLink to="/foods/new" class="add" aria-label="Create new food">+</RouterLink>
    </template>
  </PageHeader>
  <div class="page">
    <BaseInput v-model="searchTerm" label="Search" type="search" autocomplete="off" />
    <BaseSpinner v-if="isPending" />
    <template v-else>
      <BaseAlert v-if="error">{{ error }}</BaseAlert>
      <BaseButton v-if="error" variant="secondary" @click="load">Retry</BaseButton>
      <ul v-if="results.length" class="list">
        <FoodListItem v-for="food in results" :key="food.id" :food="food" @select="edit" />
      </ul>
      <BaseEmptyState
        v-else-if="!error"
        :title="foodsStore.foods.length ? 'No matching foods' : 'No foods yet'"
        :text="foodsStore.foods.length ? '' : 'Foods you create are saved here for reuse.'"
      >
        <RouterLink v-if="!foodsStore.foods.length" to="/foods/new"
          >Create your first food</RouterLink
        >
      </BaseEmptyState>
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

.add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tap-size);
  height: var(--tap-size);
  font-size: 2rem;
  line-height: 1;
}

.list {
  margin: 0;
  padding: 0;
  overflow: hidden;
  border-radius: var(--radius-md);
  list-style: none;
}
</style>
