<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { ActivityLevel, BodyStats, Gender } from '@/types'
import { ACTIVITY_LEVELS, GENDERS, MIN_AGE } from '@/utils/calories'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

const props = withDefaults(defineProps<{ initial?: BodyStats | null }>(), { initial: null })

const emit = defineEmits<{ (e: 'submit', stats: BodyStats): void }>()

type Field = number | ''

const initialFeet = props.initial ? Math.floor(props.initial.heightIn / 12) : ''
const initialInches = props.initial ? Math.round(props.initial.heightIn % 12) : ''

const form = reactive({
  gender: (props.initial?.gender ?? 'female') as Gender,
  age: (props.initial?.age ?? '') as Field,
  heightFt: initialFeet as Field,
  heightIn: initialInches as Field,
  weightLb: (props.initial?.weightLb ?? '') as Field,
  activityLevel: (props.initial?.activityLevel ?? 'light') as ActivityLevel,
})

const hasSubmitted = ref(false)

const errors = computed(() => ({
  age:
    form.age === '' || form.age < MIN_AGE || form.age > 100
      ? `Enter an age between ${MIN_AGE} and 100`
      : '',
  heightFt: form.heightFt === '' || form.heightFt < 3 || form.heightFt > 8 ? 'Feet: 3 to 8' : '',
  heightIn:
    form.heightIn === '' || form.heightIn < 0 || form.heightIn > 11 ? 'Inches: 0 to 11' : '',
  weightLb:
    form.weightLb === '' || form.weightLb < 60 || form.weightLb > 700
      ? 'Enter a weight between 60 and 700 lb'
      : '',
}))

const isValid = computed(() => Object.values(errors.value).every((e) => !e))
const shown = (key: keyof typeof errors.value) => (hasSubmitted.value ? errors.value[key] : '')

function onSubmit() {
  hasSubmitted.value = true
  if (!isValid.value) return
  emit('submit', {
    gender: form.gender,
    age: Number(form.age),
    heightIn: Number(form.heightFt) * 12 + Number(form.heightIn),
    weightLb: Number(form.weightLb),
    activityLevel: form.activityLevel,
  })
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <BaseSelect v-model="form.gender" label="Gender" :options="GENDERS" />
    <BaseInput
      v-model="form.age"
      label="Age"
      type="number"
      inputmode="numeric"
      :error="shown('age')"
    />
    <div class="row">
      <BaseInput
        v-model="form.heightFt"
        label="Height (ft)"
        type="number"
        inputmode="numeric"
        :error="shown('heightFt')"
      />
      <BaseInput
        v-model="form.heightIn"
        label="Height (in)"
        type="number"
        inputmode="numeric"
        :error="shown('heightIn')"
      />
    </div>
    <BaseInput
      v-model="form.weightLb"
      label="Current weight (lb)"
      type="number"
      inputmode="decimal"
      step="any"
      :error="shown('weightLb')"
    />
    <BaseSelect v-model="form.activityLevel" label="Activity level" :options="ACTIVITY_LEVELS" />
    <BaseButton type="submit">Next</BaseButton>
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
</style>
