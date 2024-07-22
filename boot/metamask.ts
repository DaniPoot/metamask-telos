import { MetaMaskSDK } from '@metamask/sdk'
import { Metamask } from '../service/Metamask.js'

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

export const metamask = new Metamask(sdk)
metamask.onInit()
