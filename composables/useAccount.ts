import { ref } from 'vue'
import TlosApi from '../service/TlosApi'
import { mapTransaction } from '../lib/TransactionUtils'
import { useTokensStore } from '@/store/tokens'
import { metamask } from '@/boot/metamask'
import ABI from '../const/TLOSAbi.ts'

const api = new TlosApi({ baseURL: 'https://api.testnet.teloscan.io' })

export const useAccount = () => {
  const balances = ref([])
  const transactions = ref([])
  const account = ref<string | null>()
  const tokensStore = useTokensStore()
  const { tokens } = storeToRefs(tokensStore)

  async function getBalances() {
    try {
      const balancesResponse = await api.getAccountBalances(account.value)

      balances.value = balancesResponse.results.map((balance) => {
        const { contract } = balance
        const amount = parseInt(balance.balance) / Math.pow(10, 18)
        const token = balancesResponse.contracts[balance.contract]
        return {
          amount,
          token: {
            contract,
            symbol: token?.symbol || 'TLOS',
            decimals: token?.decimals || 4,
            logo: token?.logoURI || ''
          }
        }
      })

      const missingTokens = tokens.value.filter((token) => !balances.value.find((balance) => balance.token.contract === token.contract))
      const missingBalances = await Promise.all(missingTokens.map(async (token) => {
        const tokenBalance = await metamask.getBalanceToken({ contractAddress: token.contract, account: account.value, abi: ABI })
        console.log(tokenBalance)
        return {
          amount: 0,
          token,
          isFetching: true
        }
      }))

      balances.value = [...balances.value, ...missingBalances]

      balances.value.forEach((balance) => {
        const { token: { symbol, decimals, contract }, isFetching } = balance
        tokensStore.addToken(account.value, { contract, symbol, decimals, isFetching: isFetching ?? false })
      })

    } catch (error) {
      console.log(error, 'error getting balances composable')
    }
  }

  async function getTransactions() {
    try {
      const { results } = await api.getTransactionsByAddress(account.value)

      const transactionWithInformation = await Promise.all(results.map(async (transaction) => {
        const { hash } = transaction
        const transactionData = await api.getTransaction({ hash })
        return transactionData
      }))

      transactions.value = transactionWithInformation.map(mapTransaction)
    } catch (error) {
    }
  }

  function setAccount(accountAddres: string) {
    account.value = accountAddres
  }

  function getAccountInformation() {
    getBalances()
    getTransactions()
  }

  function reset() {
    tokensStore.reset(account.value)
    balances.value = []
    transactions.value = []
    account.value = null
  }

  watch(account, () => {
    if (account.value) {
      getAccountInformation()
    }
  })

  return {
    account,
    balances,
    transactions,
    setAccount,
    getAccountInformation,
    reset
  }
}
