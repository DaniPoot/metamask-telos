<script setup>
defineProps({
  transactions: Array,
  account: String 
})
</script>

<template>
<div className="space-y-2">
  <div className="text-sm font-medium">Recent Transactions</div>
  <div>
  </div>
  <template v-if="transactions.length === 0">
    <div className="text-muted-foreground">No transactions</div>
  </template>
  <template v-else>
    <ScrollArea class="h-[200px] w-full px-5">
      <div class="flex flex-col gap-5">
        <template v-for="transaction in transactions">
          <Transaction :transaction="transaction" :account="account" />
        </template>
      </div>
    </ScrollArea>
  </template>
</div>
</template>
