<template>
  <div class="c-auth-sign-in text-center" v-transition:in="{ callback: enter }">
    <p class="c-auth-sign-in__title t-h3 t-burgundy will-fade">Enter your credentials</p>
    <AuthInput
      ref="usernameEl"
      type="text"
      label="Username"
      placeholder="Your username"
      class="c-auth-sign-in__input" />
    <AuthInput
      ref="passwordEl"
      type="password"
      label="Password"
      placeholder="Your password"
      class="c-auth-sign-in__input" />
    <AuthButton
      label="Sign in"
      type="primary"
      @click="signIn"
      :loading="loading"
      class="c-auth-sign-in__btn" />
    <p v-if="error" v-transition:in="{ callback: fadeIn }" class="t-b2 will-fade">
      Wrong credentials!
    </p>
  </div>
</template>

<script lang="ts" setup>
import AuthInput from '~/components/auth/Input.vue'
import useAuthStore from '~/store/useAuthStore'
import { fadeIn } from '~/utils/animations'

const authStore = useAuthStore()

const error = ref<boolean>(false)
const loading = ref<boolean>(false)
const usernameEl = ref<typeof AuthInput>()
const passwordEl = ref<typeof AuthInput>()

async function signIn(): Promise<void> {
  if (!loading.value) {
    loading.value = true
    const signedIn = await authStore.signIn({
      username: usernameEl.value?.get(),
      password: passwordEl.value?.get(),
    })
    loading.value = false
    error.value = !signedIn
    signedIn && emit('signed-in')
  }
}

function enter(params: { el: HTMLElement }): void {
  const { el } = params
  gsap.to(el.querySelectorAll('.c-auth-sign-in__title'), {
    opacity: 1,
    duration: 0.4,
    ease: 'power1.in',
  })
  gsap.to(el.querySelectorAll('.c-auth-sign-in__input, .c-auth-sign-in__btn'), {
    opacity: 1,
    duration: 0.4,
    ease: 'power1.in',
    stagger: 0.1,
    delay: 0.1,
  })
  gsap.to(el.querySelectorAll('.c-auth-sign-in__input, .c-auth-sign-in__btn'), {
    y: 0,
    stagger: 0.1,
    delay: 0.1,
  })
}

const emit = defineEmits<{
  (e: 'sign-up'): void
  (e: 'signed-in'): void
}>()
</script>

<style lang="scss">
.c-auth-sign-in {
  &__title {
    margin-bottom: var(--l);
  }
  &__input,
  &__btn {
    opacity: 0;
    transform: translateY(2rem);
    will-change: opacity, transform;
    margin-bottom: var(--m);
  }
  &__btn {
    margin-top: var(--s);
    margin-bottom: var(--xl);
  }
}
</style>
