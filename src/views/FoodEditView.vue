<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFoodsStore } from '@/stores/foods'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { FoodInput } from '@/types'
import FoodForm from '@/components/food/FoodForm.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseConfirmSheet from '@/components/base/BaseConfirmSheet.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import PageHeader from '@/components/layout/PageHeader.vue'

const props = defineProps<{ id?: string }>()

const auth = useAuthStore()
const foodsStore = useFoodsStore()
const route = useRoute()
const router = useRouter()
const loadAction = useAsyncAction()
const saveAction = useAsyncAction()
const deleteAction = useAsyncAction()

const isConfirmingDelete = ref(false)
const isEdit = computed(() => Boolean(props.id))
const food = computed(() => (props.id ? foodsStore.findById(props.id) : undefined))
const cameFromAdd = route.query.from === 'log'
const prefillName = typeof route.query.name === 'string' ? route.query.name : ''

onMounted(() => loadAction.run(() => foodsStore.load(auth.requireUid())))

function goBack() {
  router.back()
}

async function onSubmit(input: FoodInput) {
  const uid = auth.requireUid()
  const saved = await saveAction.run(async () => {
    if (props.id) {
      await foodsStore.update(uid, props.id, input)
      return props.id
    }
    return (await foodsStore.create(uid, input)).id
  })
  if (!saved) return
  if (cameFromAdd) {
    await router.replace({
      name: 'log-food',
      query: { date: route.query.date, meal: route.query.meal, pick: saved },
    })
  } else {
    await router.replace({ name: 'foods' })
  }
}

async function onDelete() {
  if (!props.id) return
  const id = props.id
  const ok = await deleteAction.run(async () => {
    await foodsStore.remove(auth.requireUid(), id)
    return true
  })
  if (ok) await router.replace({ name: 'foods' })
}
</script>

<template>
  <PageHeader :title="isEdit ? 'Edit food' : 'New food'" has-back @back="goBack" />
  <div class="page">
    <BaseSpinner v-if="loadAction.isPending.value" />
    <BaseAlert v-else-if="loadAction.error.value">{{ loadAction.error.value }}</BaseAlert>
    <BaseAlert v-else-if="isEdit && !food">This food no longer exists.</BaseAlert>
    <template v-else>
      <FoodForm
        :initial="food"
        :initial-name="prefillName"
        :is-loading="saveAction.isPending.value"
        :submit-label="cameFromAdd ? 'Save and add' : 'Save'"
        @submit="onSubmit"
      />
      <BaseAlert v-if="saveAction.error.value">{{ saveAction.error.value }}</BaseAlert>
      <BaseButton v-if="isEdit" variant="danger" @click="isConfirmingDelete = true">
        Delete food
      </BaseButton>
    </template>

    <BaseConfirmSheet
      v-if="isConfirmingDelete"
      title="Delete food?"
      message="Past diary entries that used this food will be kept."
      :is-loading="deleteAction.isPending.value"
      @confirm="onDelete"
      @cancel="isConfirmingDelete = false"
    />
    <BaseAlert v-if="deleteAction.error.value">{{ deleteAction.error.value }}</BaseAlert>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-4) var(--space-5);
}
</style>
