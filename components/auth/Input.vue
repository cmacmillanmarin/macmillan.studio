<template>
  <div class="c-auth-input">
    <input
      ref="inputEl"
      :type="type"
      v-model="model"
      :placeholder="placeholder"
      class="c-auth-input__el t-b1 t-burgundy" />
    <template v-if="type === 'password'">
      <button
        class="c-auth-input__psw-btn t-b3 t-burgundy"
        @click="passwordVisible = !passwordVisible"
        aria-label="Show password">
        {{ passwordVisible ? 'Hide' : 'Show' }}
      </button>
      <span v-if="passwordVisible" class="c-auth-input__psw-revealed t-b1">{{ model }}</span>
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  type: 'text' | 'password'
  initValue?: string
  label?: string
  placeholder?: string
}>()

const focusable = useFocusable()

const model = ref<string>('')
const inputEl = ref<HTMLElement>()

const passwordVisible = ref<boolean>(false)

onBeforeMount((): void => {
  props.initValue && set(props.initValue)
})

onMounted((): void => {
  focusable.add(inputEl.value as HTMLElement)
})

watch(model, (): void => {
  if (model.value === props.initValue) return
  emit('change', model.value)
})

function get(): string {
  return model.value
}

function set(value: string): void {
  model.value = value
}

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

defineExpose({
  get,
})
</script>

<style lang="scss">
.c-auth-input {
  position: relative;

  &__el {
    height: 4.8rem;
    border: 0.2rem solid var(--burgundy);
    border-radius: var(--border-radius--m);
    padding: 0 var(--m);
  }

  &__psw-btn,
  &__psw-revealed {
    position: absolute;
    z-index: 2;
    top: 50%;
    transform: translate(0, -50%);
    display: inline-block;
    width: auto;
  }

  &__psw-btn {
    right: var(--m);
    border: none;
    padding: 0;
    margin: 0;
  }

  &__psw-revealed {
    left: var(--m);
    background-color: var(--beige);
    pointer-events: none;
  }
}
</style>
