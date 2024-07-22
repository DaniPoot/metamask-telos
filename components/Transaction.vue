<script setup>
import { onMounted, computed, ref } from 'vue'
import { getDirection } from '../lib/TransactionUtils.ts'

const props = defineProps({
  transaction: Object,
  account: String
})

const ZERO_ADDRESSES = '0x0000000000000000000000000000000000000000'

const methodSignature = computed(() => {
    if (props.transaction?.input && props.transaction.input !== '0x') {
        // the first 10 characters of the input data are the method signature, including leading '0x'
        return props.transaction.input.slice(0, 10);
    }

    return '';
});
const methodNameOrSignature = computed(() => {
    if (methodName.value) {
        return methodName.value;
    }

    if (props.transaction.input && props.transaction.input !== '0x') {
        return methodSignature.value;
    }

    return '';
});

const action = computed(() => {
    try {
        let method = methodNameOrSignature.value;
        return method
    } catch (e) {
        console.error(e)
    }
    return '';
});

const methodName = ref('')
const propValue = computed(() => +(props.transaction.value || '0x0'));

onMounted(async () => {
  await setValues()
})

const setValues = async () => {
  if (!props.transaction?.parsedTransaction && props.transaction?.from === ZERO_ADDRESSES && propValue.value && parseInt(props.transaction?.gasPrice) === 0) {
    methodName.value = 'Deposit'
  } else if (!props.transaction?.parsedTransaction && props.transaction?.to === ZERO_ADDRESSES && propValue.value && parseInt(props.transaction?.gasPrice) === 0) {
      methodName.value = 'Witdraw'
  } else if (!props.transaction.parsedTransaction && props.transaction.input === '0x' && propValue.value) {
      methodName.value = 'Transfer TLOS'
  } else if (!props.transaction.parsedTransaction && props.transaction.to === null) {
      methodName.value = 'Contract Deployment'
  } else if (props.transaction.parsedTransaction) {
      methodName.value = props.transaction.parsedTransaction.name
  }
}

const direction = computed(() => {
  return getDirection(props.account, props.transaction)
})

const value = computed(() => propValue.value < 0.000001 ? '< 0.000001' : propValue.value)
</script>

<template>
<div className="flex gap-4 items-center w-full">
  <Avatar className="w-8 h-8">
    <AvatarImage src="/placeholder-user.jpg" />
    <AvatarFallback>T</AvatarFallback>
  </Avatar>
  <div className="space-y-1 w-[50%]">
    <div className="font-medium">{{ action }} {{ value }} </div>
    <div className="text-muted-foreground truncate">To: {{ transaction.to }}</div>
  </div>
  <div className="text-muted-foreground ml-auto"> {{ direction }}</div>
  <div className="text-muted-foreground ml-auto"> {{ transaction.status }}</div>
</div>
</template>
