<template>
<div class="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
  <div class="max-w-5xl w-full space-y-6 p-6 rounded-lg border">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <WalletIcon class="h-6 w-6" />
        <span class="font-medium">Wallet Connection</span>
      </div>
      <Button variant="outline" size="sm" @click="onConnect" v-if="!isConnected">
        Connect Wallet
      </Button>
      <Button variant="outline" size="sm" @click="onDisconnect" v-if="isConnected">
        Disconnect Wallet
      </Button>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1">
        <div class="text-sm font-medium">Chain</div>
        <div class="text-muted-foreground"> {{ chainId }} </div>
      </div>
      <div class="space-y-1">
        <div class="text-sm font-medium">Balance</div>
        <div class="text-muted-foreground"> {{ balance }} </div>
      </div>
      <div class="space-y-1">
        <div class="text-sm font-medium">Account</div>
        <div class="text-muted-foreground line-clamp-1"> {{ account }} </div>
      </div>
      <div class="space-y-1">
        <div class="text-sm font-medium">Last response</div>
        <div class="text-muted-foreground line-clamp-1"> {{ lastResponse }} </div>
      </div>
      <div class="space-y-1">
        <div class="text-sm font-medium">Status</div>
        <div class="text-muted-foreground"> {{ isConnected ? 'Connected' : 'Disconnected' }}</div>
      </div>
    </div>
    <Separator />
    <div className="space-y-2">
      <div className="text-sm font-medium">Token List</div>
      <template v-if="telosToken">
        <Token v-for="token in telosToken" :key="token.token.symbol" :token="token" />
      </template>
    </div>
    <Separator />
      <TransactionsList :transactions="telosTransactions" :account="account" />
    <Separator />
    <div class="space-y-4" v-if="isConnected">
      <TokenForm @submit="addToken" />
      <TransferTokenForm @submit="transferToken" ref="tokenFormRef"/>
    </div>
    <Separator />
    <div class="flex justify-end" v-if="isConnected">
      <Button @click="sendTransaction">Send Transaction</Button>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { Metamask } from '../service/Metamask.ts'
import TlosApi from '../service/TlosApi.ts'
import { MetaMaskSDK } from '@metamask/sdk'
import Web3 from 'web3'
import { useToast } from './ui/toast/use-toast.ts'
import { mapTransaction } from '../lib/TransactionUtils.ts'

const { toast } = useToast()

const sdk = new MetaMaskSDK({
  dappMetadata: {
    url: window.location.href,
    name: 'MetaMask VueJS Example Dapp',
  },
  infuraAPIKey: 'eb6e72acce7e40d18ece7747c0315bac',
  enableAnalytics: true,
  checkInstallationImmediately: false,
  logging: {
    developerMode: false,
    sdk: false
  },
  i18nOptions: {
    enabled: true,
  }
})

const metamaskService = new Metamask(sdk)
metamaskService.onInit()

const isConnected = ref(false)
const provider = ref(null)
const chainId = ref(null)
const account = ref(null)
const balance = ref(0)
const lastResponse = ref('')

const tokenFormRef = ref(null)

const tlosApi = new TlosApi({ baseURL: 'https://api.testnet.teloscan.io' })

const telosToken = ref(null)
const telosTransactions = ref([])

// await sdk.init()

provider.value = sdk.getProvider()
const web3 = new Web3(provider.value)

provider.value?.on('chainChanged', (chain) => {
  console.log(`App::Chain changed:'`, chain)
  chainId.value = chain
  getBalance()
})

// Accounts changed
provider.value?.on('accountsChanged', (accounts) => {
  console.log(`App::Accounts changed:'`, accounts);
  account.value = accounts[0]
})

// Connected event
provider.value?.on('connect', (_connectInfo) => {
  console.log(`App::connect`, _connectInfo);
  // onConnect()
  isConnected.value = true
})

// Disconnect event
provider.value?.on('disconnect', (error) => {
  console.log(`App::disconnect`, error)
})


async function onConnect() {
  try {
    await metamaskService.connect()

    const response = await Promise.all([
      metamaskService.getAccount(),
      metamaskService.getChainId()
    ])


    account.value = response[0]
    chainId.value = response[1]

    balance.value = await metamaskService.getBalance(account.value)
    await getTelosInformation()

    isConnected.value = true
  } catch (error) {
    console.log('request accounts ERR', error)
    isConnected.value = false 
  }
}

async function onDisconnect() {
  try {
    await metamaskService.disconnect()
    isConnected.value = false
    balance.value = 0
    chainId.value = null
    account.value = null
  } catch (error) {
    console.log('disconnect ERR', error)
  }
}

async function sendTransaction() {
  const to = '0x0000000000000000000000000000000000000000';
  const transactionParameters = {
    to, // Required except during contract publications.
    from: account.value, // must match user's active address.
    value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
  }

  try {
    const response = await metamaskService.sendTransaction(transactionParameters)
    console.log('response', response)
  } catch (e) {
    console.log(e)
  }
}

async function addToken({
  address,
  symbol,
  decimals
}) {
  try {
    const response = await metamaskService.addToken({
      address,
      symbol,
      decimals
    })

    toast({ title: 'Success', description: 'Token added successfully' })
  } catch (e) {
    toast({ title: 'Error', description: 'Token add failed', variant: 'destructive' })
  }
}

const abiTransfer = [
  {"type":"constructor","inputs":[{"name":"asset_","type":"address","internalType":"contract IERC20Metadata"},{"name":"escrow_","type":"address","internalType":"contract ITelosEscrow"},{"name":"admin_","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
  {"name":"Approval","type":"event","inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"spender","type":"address","indexed":true,"internalType":"address"},{"name":"value","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"name":"Deposit","type":"event","inputs":[{"name":"caller","type":"address","indexed":true,"internalType":"address"},{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"assets","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"shares","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {
    "name":"Transfer",
    "type":"event",
    "inputs":[
      {
        "name":"from",
        "type":"address",
        "indexed":true,
        "internalType":"address"
      },
      {
        "name":"to",
        "type":"address",
        "indexed":true,
        "internalType":"address"
      },
      {
        "name":"value",
        "type":"uint256",
        "indexed":false,
        "internalType":"uint256"
      }
    ],
    "anonymous":false
  },
  {"name":"Withdraw","type":"event","inputs":[{"name":"caller","type":"address","indexed":true,"internalType":"address"},{"name":"receiver","type":"address","indexed":true,"internalType":"address"},{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"assets","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"shares","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"name":"_admin","type":"function","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"name":"_escrow","type":"function","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract ITelosEscrow"}],"stateMutability":"view"},
  {"name":"allowance","type":"function","inputs":[{"name":"owner","type":"address","internalType":"address"},{"name":"spender","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"name":"approve","type":"function","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},
  {"name":"asset","type":"function","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"name":"balanceOf","type":"function","inputs":[{"name":"account","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"name":"convertToAssets","type":"function","inputs":[{"name":"shares","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"assets","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"name":"convertToShares","type":"function","inputs":[{"name":"assets","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"shares","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"name":"decimals","type":"function","inputs":[],"outputs":[{"name":"","type":"uint8","internalType":"uint8"}],"stateMutability":"view"},
  {"name":"decreaseAllowance","type":"function","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"subtractedValue","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},
  {"name":"deposit","type":"function","inputs":[{"name":"assets","type":"uint256","internalType":"uint256"},{"name":"receiver","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},
  {"name":"depositTLOS","type":"function","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"payable"},
  {"name":"increaseAllowance","type":"function","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"addedValue","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},
  {"name":"maxDeposit","type":"function","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"name":"maxMint","type":"function","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"name":"maxRedeem","type":"function","inputs":[{"name":"owner","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"name":"maxWithdraw","type":"function","inputs":[{"name":"owner","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"name":"mint","type":"function","inputs":[{"name":"shares","type":"uint256","internalType":"uint256"},{"name":"receiver","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},{"name":"name","type":"function","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"name":"previewDeposit","type":"function","inputs":[{"name":"assets","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"name":"previewMint","type":"function","inputs":[{"name":"shares","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"name":"previewRedeem","type":"function","inputs":[{"name":"shares","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"name":"previewWithdraw","type":"function","inputs":[{"name":"assets","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"name":"redeem","type":"function","inputs":[{"name":"shares","type":"uint256","internalType":"uint256"},{"name":"receiver","type":"address","internalType":"address"},{"name":"owner","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},{"name":"setAdmin","type":"function","inputs":[{"name":"admin_","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"name":"setEscrow","type":"function","inputs":[{"name":"escrow_","type":"address","internalType":"contract ITelosEscrow"}],"outputs":[],"stateMutability":"nonpayable"},{"name":"symbol","type":"function","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"name":"totalAssets","type":"function","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"name":"totalSupply","type":"function","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"name":"transfer","type":"function","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"name":"transferFrom","type":"function","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"name":"withdraw","type":"function","inputs":[{"name":"assets","type":"uint256","internalType":"uint256"},{"name":"receiver","type":"address","internalType":"address"},{"name":"owner","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},{"type":"receive","stateMutability":"payable"}
]

async function transferToken({ address, amount }) {
  try {
    const contractAddress = '0xa9991E4daA44922D00a78B6D986cDf628d46C4DD'
    const gasPrice = '21000' // Default gas price (20 Gwei)

    console.log({
      contractAddress,
      to: address,
      value: amount,
      gasPrice,
      abi: abiTransfer,
      from: account.value
    })

   const responseTransfer = await metamaskService.transferToken({
      contractAddress,
      to: address,
      value: amount,
      gasPrice,
      abi: abiTransfer,
      from: account.value
    })

    if (tokenFormRef.value) {
      tokenFormRef.value.clearForm()
    }

    toast({ title: 'Success', description: 'Token transfer successfully' })
  } catch (error) {
    toast({ title: 'Error', description: 'Token transfer failed', variant: 'destructive' })
    console.log('error', error)
  }
}

async function getTelosInformation () {
  try {
    const [balances, transactions] = await Promise.all([
      tlosApi.getAccountBalances(account.value),
      tlosApi.getTransactionsByAddress(account.value)
    ])

    const balancesWithTokens = await Promise.all(balances.results.map(async (balance) => {
      const amount = parseInt(balance.balance) / Math.pow(10, 18)
      if (balance.contract === '___NATIVE_CURRENCY___') {
        return {
          amount,
          token: {
            symbol: 'TLOS',
            decimals: 4
          }
        }
      }

      const token = balances.contracts[balance.contract]
      console.log('token', token)

      return {
        amount,
        token: {
          symbol: token.symbol,
          decimals: token.decimals,
          logo: token.logoURI
        }
      }
    }))

    telosToken.value = balancesWithTokens

    const transactionParameters = await Promise.all(transactions.results.map(async (transaction) => {
      const { hash } = transaction
      const transactionData = await tlosApi.getTransaction({ hash })
      return transactionData
    }))

    telosTransactions.value = transactionParameters.map(mapTransaction)
    console.log('telosTransactions', telosTransactions.value)
  } catch (error) {
    console.log('error', error)
  }
}
</script>
