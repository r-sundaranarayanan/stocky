<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { FoodInput } from '@/types'
import { SERVING_UNITS } from '@/utils/constants'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

const props = withDefaults(
  defineProps<{
    initial?: FoodInput
    initialName?: string
    submitLabel?: string
    isLoading?: boolean
  }>(),
  { initial: undefined, initialName: '', submitLabel: 'Save', isLoading: false },
)

const emit = defineEmits<{ (e: 'submit', value: FoodInput): void }>()

type Field = number | ''

const form = reactive({
  name: props.initial?.name ?? props.initialName,
  servingSize: (props.initial?.servingSize ?? 1) as Field,
  servingUnit: props.initial?.servingUnit ?? 'serving',
  calories: (props.initial?.calories ?? '') as Field,
  protein: (props.initial?.protein ?? 0) as Field,
  carbs: (props.initial?.carbs ?? 0) as Field,
  fat: (props.initial?.fat ?? 0) as Field,
})

const unitOptions = SERVING_UNITS.map((u) => ({ value: u, label: u }))
const showErrors = ref(false)

function checkNumber(value: Field, max: number, min = 0): string {
  if (value === '') return 'Required'
  if (value < min || value > max) return `Enter a number between ${min} and ${max}`
  return ''
}

const errors = computed(() => ({
  name: !form.name.trim()
    ? 'Name is required'
    : form.name.trim().length > 100
      ? 'Name must be 100 characters or fewer'
      : '',
  servingSize: form.servingSize === '' || form.servingSize <= 0 ? 'Must be greater than 0' : '',
  calories: checkNumber(form.calories, 10000),
  protein: checkNumber(form.protein, 1000),
  carbs: checkNumber(form.carbs, 1000),
  fat: checkNumber(form.fat, 1000),
}))

const isValid = computed(() => Object.values(errors.value).every((e) => !e))
const shown = (key: keyof typeof errors.value) => (showErrors.value ? errors.value[key] : '')

function onSubmit() {
  showErrors.value = true
  if (!isValid.value) return
  emit('submit', {
    name: form.name.trim(),
    servingSize: Number(form.servingSize),
    servingUnit: form.servingUnit,
    calories: Number(form.calories),
    protein: Number(form.protein),
    carbs: Number(form.carbs),
    fat: Number(form.fat),
  })
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <BaseInput v-model="form.name" label="Name" :error="shown('name')" autocomplete="off" />
    <div class="row">
      <BaseInput
        v-model="form.servingSize"
        label="Serving size"
        type="number"
        inputmode="decimal"
        step="any"
        :error="shown('servingSize')"
      />
      <BaseSelect v-model="form.servingUnit" label="Unit" :options="unitOptions" />
    </div>
    <BaseInput
      v-model="form.calories"
      label="Calories (kcal per serving)"
      type="number"
      inputmode="decimal"
      step="any"
      :error="shown('calories')"
    />
    <div class="row three">
      <BaseInput
        v-model="form.protein"
        label="Protein (g)"
        type="number"
        inputmode="decimal"
        step="any"
        :error="shown('protein')"
      />
      <BaseInput
        v-model="form.carbs"
        label="Carbs (g)"
        type="number"
        inputmode="decimal"
        step="any"
        :error="shown('carbs')"
      />
      <BaseInput
        v-model="form.fat"
        label="Fat (g)"
        type="number"
        inputmode="decimal"
        step="any"
        :error="shown('fat')"
      />
    </div>
    <BaseButton type="submit" :is-loading="isLoading">{{ submitLabel }}</BaseButton>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.row.three {
  grid-template-columns: repeat(3, 1fr);
}
</style>
