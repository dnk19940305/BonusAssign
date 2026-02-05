<template>
  <el-button v-if="allowed" v-bind="$attrs" @click="$emit('click')">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

const props = defineProps({
  permissions: {
    type: Array as () => string[],
    default: () => ['admin', '*']
  }
})

const emit = defineEmits(['click'])
const userStore = useUserStore()

const allowed = computed(() => {
  try {
    return userStore.hasAnyPermission(props.permissions)
  } catch (e) {
    return false
  }
})
</script>

<style scoped>
</style>
