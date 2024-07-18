<script setup>

defineProps({
  token: Object,
})
</script>

<template >
  <div className="grid grid-cols-[auto_1fr_auto] gap-4">
    <Avatar className="w-8 h-8">
      <AvatarImage :src="token.token.logo" />
      <AvatarFallback>{{ token.token.symbol }}</AvatarFallback>
    </Avatar>
    <div className="space-y-1">
      <div className="font-medium">{{ token.token.symbol }}</div>
    </div>
    <div className="text-right text-muted-foreground">{{ token.amount.toFixed(token.token.decimals) }}</div>
  </div>
</template>
