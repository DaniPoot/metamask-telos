import { defineStore } from 'pinia'

export const useTokensStore = defineStore('tokens', {
  state: () => ({
    tokens: []
  }),
})
