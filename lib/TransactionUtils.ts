import StatusCode from '../const/StatusCode'
import { toChecksumAddress } from './utils'

export const tryToExtractMethod = (abi: { [hash: string]: string }, input: string) => {
  if (!abi || !input) {
    return undefined
  }
  const methodSignature = input.slice(0, 10);
  const functionSignature = abi[methodSignature];

  const method = functionSignature?.match(/function\s+(\w+)\(/);
  if (!method) {
    return undefined;
  }
  if (method[1]) {
    return {
      name: method[1],
    }
  } else {
    return undefined;
  }
};


export const mapTransaction = (transaction) => {
  try {
    const abi = transaction.abi
    if (transaction.results.length === 0) {
      console.error(`Transaction ${hash} not found`)
      return
    }
    const aux = transaction.results[0]
    let logsArray = [];
    if (aux.logs) {
      const fixedStr = aux.logs.replace('transaction_hash', 'transactionHash')
      try {
        logsArray = JSON.parse(fixedStr)
      } catch (e) {
        console.error('Error parsing logs', e)
      }
    }

    const parsedTransaction = tryToExtractMethod(abi, aux.input)

    const _trx = {
      ...aux,
      status: StatusCode[aux.status],
      gasUsedBn: BigInt(aux.gasUsed),
      gasLimitBn: BigInt(aux.gasLimit),
      valueBn: BigInt(aux.value),
      value: parseInt(aux.value) / Math.pow(10, 18),
      gasPriceBn: BigInt(aux.gasPrice),
      contract: undefined,
      parsedTransaction,
      functionParams: [],
      logsArray,
    };
    return _trx
  } catch (e) {
    console.error('Error resolving method name', e)
    return null
  }

}

export const getDirection = (address: string, data: { from: string, to: string }) => {
  if (toChecksumAddress(data.to) === toChecksumAddress(data.from)) {
    return 'self'
  } else if (toChecksumAddress(address) === toChecksumAddress(data.from)) {
    return 'out'
  } else if (toChecksumAddress(address) === toChecksumAddress(data.to)) {
    return 'in'
  } else {
    return 'to'
  }
}
