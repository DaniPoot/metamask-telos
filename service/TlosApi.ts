import axios from 'axios'

export default class TlosApi {
  constructor({
    baseURL = 'https://api.teloscan.io'
  }) {
    this.client = axios.create({
      baseURL: baseURL,
    })
  }

  async getTransactionsByAddress(address) {
    try {
      const response = await this.client.get(`/v1/address/${address}/transactions`)
      return response.data
    } catch (error) {
      console.error('Error fetching transactios for and address:', error)
      throw error
    }
  }

  async getAccountApprovals(account) {
    try {
      const response = await this.client.get(`/v1/account/${account}/approvals`)
      return response.data
    } catch (error) {
      console.error('Error fetching account approvals:', error)
      throw error
    }
  }

  async getAccountBalances(account) {
    try {
      const response = await this.client.get(`/v1/account/${account}/balances`)
      return response.data
    } catch (error) {
      console.error('Error fetching account balances:', error)
      throw error
    }
  }

  async getAccountNfts(account) {
    try {
      const response = await this.client.get(`/v1/account/${account}/nfts`)
      return response.data
    } catch (error) {
      console.error('Error fetching account nfts:', error)
      throw error
    }
  }

  async getAccountTransfers(account) {
    try {
      const response = await this.client.get(`/v1/account/${account}/transfers`)
      return response.data
    } catch (error) {
      console.error('Error fetching account transfers:', error)
      throw error
    }
  }

  async getContractByAddress(address) {
    try {
      const response = await this.client.get(`/v1/contract/${address}`)
      return response.data
    } catch (error) {
      console.error('Error fetching contract by address:', error)
      throw error
    }
  }

  async getContractLogs(address) {
    try {
      const response = await this.client.get(`/v1/contract/${address}/logs`)
      return response.data
    } catch (error) {
      console.error('Error fetching contract logs:', error)
      throw error
    }
  }

  async getContractMetrics(address, options = { type: 'daily' }) {
    try {
      const response = await this.client.get(`/v1/contract/${address}/metrics/${options.type}`)
      return response.data
    } catch (error) {
      console.error('Error fetching contract metrics:', error)
      throw error
    }
  }

  async getContractNfts(address) {
    try {
      const response = await this.client.get(`/v1/contract/${address}/nfts`)
      return response.data
    } catch (error) {
      console.error('Error fetching contract nfts:', error)
      throw error
    }
  }

  async getContracts() {
    try {
      const response = await this.client.get(`/v1/contracts`)
      return response.data
    } catch (error) {
      console.error('Error fetching contracts:', error)
      throw error
    }
  }

  async getToken({ address }) {
    try {
      const response = await this.client.get(`/v1/token/${address}`)
      return response.data
    } catch (error) {
      console.error('Error fetching token by address:', error)
      throw error
    }
  }

  async getTokenApprovals({ address }) {
    try {
      const response = await this.client.get(`/v1/token/${address}/approvals`)
      return response.data
    } catch (error) {
      console.error('Error fetching token approvals:', error)
      throw error
    }
  }

  async getTokenHolders({ address }) {
    try {
      const response = await this.client.get(`/v1/token/${address}/holders`)
      return response.data
    } catch (error) {
      console.error('Error fetching token holders:', error)
      throw error
    }
  }

  async getTokenTransfers({ address }) {
    try {
      const response = await this.client.get(`/v1/token/${address}/transfers`)
      return response.data
    } catch (error) {
      console.error('Error fetching token transfers:', error)
      throw error
    }
  }

  async getTokens() {
    try {
      const response = await this.client.get(`/v1/tokens`)
      return response.data
    } catch (error) {
      console.error('Error fetching tokens:', error)
      throw error
    }
  }

  async getTokenPrice({ address }) {
    try {
      const response = await this.client.get(`/v1/token/${address}/marketdata`)
      return response.data
    } catch (error) {
      console.error('Error fetching token price:', error)
      throw error
    }
  }

  async getBlockTransfers({ block }) {
    try {
      const response = await this.client.get(`/v1/block/${block}/transfers`)
      return response.data
    } catch (error) {
      console.error('Error fetching block transfers:', error)
      throw error
    }
  }

  async getTransaction({ hash }) {
    try {
      const response = await this.client.get(`/v1/transaction/${hash}?full=true&includeAbi=true`)
      return response.data
    } catch (error) {
      console.error('Error fetching transaction:', error)
      throw error
    }
  }
}

