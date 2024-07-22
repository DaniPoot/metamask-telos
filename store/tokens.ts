import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'

type Token = {
  contract: string
  symbol: string
  decimals: number
  isFetching?: boolean
}

export const useTokensStore = defineStore('tokens', () => {
  const tokens = ref<Token[]>([])

  function addToken(accountAddress: string, { contract, symbol, decimals, isFetching }: Token) {
    if (tokens.value.find((token) => token.contract === contract)) return
    tokens.value.push({ contract, symbol, decimals, isFetching })
    localStorage.setItem(`tokens-${accountAddress}`, JSON.stringify(tokens.value))
  }

  function getTokens(accountAddress: string) {
    const storageTokens = localStorage.getItem(`tokens-${accountAddress}`) ? JSON.parse(localStorage.getItem(`tokens-${accountAddress}`)!) : []
    tokens.value = storageTokens
  }

  function reset(accountAddress: string) {
    tokens.value = []
  }

  return {
    tokens: readonly(tokens),
    addToken,
    getTokens,
    reset
  }
})
