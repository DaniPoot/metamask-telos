import { MetaMaskSDK } from '@metamask/sdk'
import Web3 from 'web3'

export class Metamask {
  constructor(metamaskSdk) {
    this.sdk = metamaskSdk
  }

  async onInit() {
    try {
      await this.sdk.init()

      this.web3 = new Web3(this.sdk.getProvider())
    } catch (error) {
      console.log(error, 'error initializing')
    } finally {
      console.log('finally on init')
    }
  }

  async getAccount() {
    try {
      const account = await this.web3.eth.getAccounts()
      console.log(account, 'account')
      return account[0]
    } catch (error) {
      console.log(error, 'error getting account')
    }
  }

  async getBalance(address: string) {
    try {
      const balance = await this.web3.eth.getBalance(address)
      return parseInt(balance) / Math.pow(10, 18)
    } catch (error) {
      console.log(error, 'error getting balance')
    }
  }

  async getChainId() {
    try {
      return await this.web3.eth.getChainId()
    } catch (error) {
      console.log(error, 'error getting chain id')
    }
  }

  async addToken({
    type = 'ERC20',
    address,
    symbol,
    decimals
  }: {
    type: string
    address: string
    symbol: string
    decimals: number
  }) {
    try {
      return await this.web3.currentProvider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol,
            decimals
          }
        }
      })
    } catch (error) {
      console.log(error, 'error adding token')
    }
  }

  async sendTransaction(params = { gasPrice: '21000' }) {
    try {
      console.log(params, 'params')
      const value = this.web3.utils.toWei(params.value.toString(), 'ether')
      const gasPrice = this.web3.utils.toWei(params.gasPrice?.toString() || '21000', 'gwei')
      const gas = await this.web3.eth.estimateGas({ ...params, value })

      return await this.web3.eth.sendTransaction({
        ...params,
        gas,
        gasPrice,
      })
    } catch (error) {
      console.log(error, 'error sending transaction')
    }
  }

  async transferToken({ contractAddress = '', to = '', value = 0, gasPrice = '21000', abi = [], from }) {
    const contract = new this.web3.eth.Contract(abi, contractAddress, { from })
    const web3Value = this.web3.utils.toWei(value.toString(), 'ether')

    try {
      const transfer = await contract.methods.transfer(to, web3Value)
      const gas = await transfer.estimateGas({ from })

      return await transfer.send({
        gasPrice: this.web3.utils.toWei(gasPrice, 'gwei'),
        gas: gas.toString()
      })
    } catch (error) {
      console.log(error, 'error on transfer token')
    }
  }

  async getLogs({
    address
  }) {
    try {
      console.log(await this.web3.eth.getTransactionCount(address))
      const defaultBlock = await this.web3.eth.getBlockNumber()

      const logs = await this.web3.eth.getPastLogs({
        address
      })
      console.log(logs, 'logs')
      return logs
    } catch (error) {
      console.log(error, 'error getting logs')
    }
  }

  async getPastEvents({ contractAddress = '', abi = [], fromBlock = 0, toBlock = 'latest' }) {
    console.log(await this.web3.eth.getTransactionCount('0xB3E5fa23C53CB368CD225142331E3dF8A4661884'))
    const contract = new this.web3.eth.Contract(abi, contractAddress)
    const logs = await contract.getPastEvents('allEvents', {
      fromBlock,
      toBlock
    })
    console.log(logs, 'logs')
    return logs
  }

  async getBalanceToken({ contractAddress = '', account = '', abi = [] }) {
    const contract = new this.web3.eth.Contract(abi, contractAddress)
    const balance = await contract.methods.balanceOf(account).call()

    return parseInt(balance) / Math.pow(10, 18)
  }

  async disconnect() {
    try {
      await this.sdk.disconnect()
    } catch (error) {
      console.log(error, 'error disconnecting')
    }
  }

  async connect() {
    try {
      await this.sdk.connect()
    } catch (error) {
      console.log(error, 'error connecting')
    }
  }
}
