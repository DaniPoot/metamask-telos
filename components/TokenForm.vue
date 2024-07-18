<script setup>
import { ref, defineEmits } from 'vue'

const emits = defineEmits(['submit'])

const formData = ref({
  address: '',
  symbol: '',
  decimals: 18
})


function onSubmit() {
  emits('submit', formData.value)
  formData.value = {
    address: '',
    symbol: '',
    decimals: 18
  }
}

function clearForm() {
  formData.value = {
    address: '',
    symbol: '',
    decimals: 18
  }
}

defineExpose({ clearForm })
</script>

<template>
<form @submit.prevent="onSubmit" class="space-y-2">
  <div class="text-sm font-medium">Add Token</div>
  <div class="grid grid-cols-[1fr_auto] gap-2">
    <Input type="text" placeholder="Token Address" v-model="formData.address" />
    <Input type="text" placeholder="Symbol" v-model="formData.symbol" />
    <Input type="number" placeholder="Decimals" v-model="formData.decimals" />
  </div>
  <Button variant="outline" type="submit">Add</Button>
</form>
</template>
