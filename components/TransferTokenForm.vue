<script setup>
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['submit'])

const formData = ref({
  address: '',
  amount: 0
})

function onSubmit () {
  emit('submit', formData.value)
}

function clearForm () {
  formData.value = {
    address: '',
    amount: 0
  }
}

defineExpose({ clearForm })
</script>

<template>
<form @submit.prevent="onSubmit">
  <div class="space-y-2">
    <div class="text-sm font-medium">Transfer Tokens</div>
    <div class="grid grid-cols-[1fr_auto] gap-2">
      <Input type="text" placeholder="Recipient Address" v-model="formData.address" />
      <Input type="number" placeholder="Amount" v-model="formData.amount" />
      <Button variant="outline" type="submit">Transfer</Button>
    </div>
  </div>
</form>
</template>
