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
      <template v-if="balances">
        <Token v-for="token in balances" :key="token.token.symbol" :token="token" />
      </template>
    </div>
    <Separator />
      <TransactionsList :transactions="transactions" :account="account" />
    <Separator />
    <div class="space-y-4" v-if="isConnected">
      <TokenForm @submit="addToken" />
      <TransferTokenForm @submit="transferToken" :account="account"  ref="tokenFormRef"/>
    </div>
    <Separator />
    <div class="flex justify-end" v-if="isConnected">
      <Button @click="sendTransaction">Send Transaction</Button>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useToast } from './ui/toast/use-toast.ts'
import { useAccount } from '../composables/useAccount.ts'
import { useTokensStore } from '../store/tokens.ts'
import ABI from '../const/TLOSAbi.ts'
import { metamask } from '@/boot/metamask'
import { ToastAction } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'


const { toast } = useToast()
const tokensStore = useTokensStore()
const { setAccount, account, balances, transactions, reset, getAccountInformation } = useAccount()

const isConnected = ref(false)
const chainId = ref(null)
const lastResponse = ref('')
const tokenFormRef = ref(null)

// provider.value?.on('chainChanged', (chain) => {
//   console.log(`App::Chain changed:'`, chain)
//   chainId.value = chain
//   getBalance()
// })
//
// // Accounts changed
// provider.value?.on('accountsChanged', (accounts) => {
//   console.log(`App::Accounts changed:'`, accounts);
//   account.value = accounts[0]
// })
//
// // Connected event
// provider.value?.on('connect', (_connectInfo) => {
//   console.log(`App::connect`, _connectInfo);
//   // onConnect()
//   isConnected.value = true
// })
//
// // Disconnect event
// provider.value?.on('disconnect', (error) => {
//   console.log(`App::disconnect`, error)
// })


async function onConnect() {
  try {
    await metamask.connect()

    const response = await Promise.all([
      metamask.getAccount(),
      metamask.getChainId()
    ])

    setAccount(response[0])
    chainId.value = response[1]

    isConnected.value = true
  } catch (error) {
    console.log('request accounts ERR', error)
    isConnected.value = false 
  }
}

async function onDisconnect() {
  try {
    await metamask.disconnect()
    isConnected.value = false
    chainId.value = null
    reset()
  } catch (error) {
    console.log('disconnect ERR', error)
  }
}

async function sendTransaction({ to, amount }) {
  to = to ?? '0x0000000000000000000000000000000000000000'
  const transactionParameters = {
    to, // Required except during contract publications.
    from: account.value, // must match user's active address.
    value: amount // ?? '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
  }
  try {
    const response = await metamask.sendTransaction(transactionParameters)
    toast({
      title: 'Success',
      description: 'Transaction successfully',
      action: h(
        ToastAction, 
        {
          altText: 'View on Telos',
          onClick: () => {
            window.open(`https://testnet.teloscan.io/tx/${response.transactionHash}`, '_blank', 'noopener noreferrer')
          }
        }, {
          default: () => 'View on Telos'
        }, 
      ),
    })
    updateInformation()
  } catch (e) {
    console.log(e)
  }
}

async function addToken({ address, symbol, decimals }) {
  try {
    const response = await metamask.addToken({ address, abi: ABI })
    tokensStore.addToken(account.value, { contract: address })
    toast({ title: 'Success', description: 'Token added successfully' })
    updateInformation()
  } catch (e) {
    console.log(e)
    toast({ title: 'Error', description: e.error?.data?.message || 'Token add failed', variant: 'destructive' })
  }
}

async function transferToken({ address, amount, contract }) {
  try {

    let responseTransfer
    if (contract === '___NATIVE_CURRENCY___') {
      responseTransfer = await sendTransaction({ to: address , amount })
    } else {
      responseTransfer = await metamask.transferToken({
        contractAddress: contract,
        to: address,
        value: amount,
        gasPrice: '21000',
        abi: ABI,
        from: account.value
      })
    }

    if (tokenFormRef.value) {
      tokenFormRef.value.clearForm()
    }

    toast({
      title: 'Success',
      description: 'Token transfer successfully',
      action: h(
        ToastAction, 
        {
          altText: 'View on Telos',
          onClick: () => {
            window.open(`https://testnet.teloscan.io/tx/${responseTransfer.transactionHash}`, '_blank', 'noopener noreferrer')
          }
        }, {
          default: () => 'View on Telos'
        }, 
      ),
    })

    updateInformation()
  } catch (error) {
    toast({ title: 'Error', description: error.error?.data?.message || 'Token transfer failed', variant: 'destructive' })
    console.log('error', error)
  }
}

function updateInformation () {
  setTimeout(() => {
    getAccountInformation()
  }, 1000)
}
</script>
