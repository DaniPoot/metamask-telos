<script setup>
import { ref } from 'vue'
import { useTokensStore } from '@/store/tokens'

const props = defineProps({
  account: String 
})

const tokensStore = useTokensStore()

tokensStore.getTokens(props.account)
const { tokens } = storeToRefs(tokensStore)

const emit = defineEmits(['submit'])

const formData = ref({
  address: '',
  amount: 0,
  contract: ''
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
    <div class="grid grid-cols-3 gap-2">
    <Select v-model="formData.contract">
        <SelectTrigger>
          <SelectValue placeholder="Select token" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem v-for="token in tokens" :value="token.contract">
              {{ token.symbol }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input type="text" placeholder="Recipient Address" v-model="formData.address" />
      <Input type="number" placeholder="Amount" v-model="formData.amount" />
      <Button class="col-start-3" variant="outline" type="submit">Transfer</Button>
    </div>
  </div>
</form>
</template>
