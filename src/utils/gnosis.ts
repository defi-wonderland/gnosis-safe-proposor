import axios from 'axios';

const CHAIN_PREFIXES = {
  1: '',
  4: '.rinkeby',
  5: '.goerli',
};

export const SUPPORTED_CHAINS = Object.keys(CHAIN_PREFIXES).map(Number);

export async function estimateTransaction(safe: string, chainId: number, tx: any): Promise<any> {
  try {
    const chainPrefix = CHAIN_PREFIXES[chainId];
    const resp = await axios.post(
      `https://safe-relay${chainPrefix}.gnosis.pm/api/v2/safes/${safe}/transactions/estimate/`,
      tx,
    );
    return resp.data;
  } catch (e) {
    throw `Failed to estimate tx: ${JSON.stringify(e.response.data)}`;
  }
}

export async function proposeTx(safe: string, chainId: number, tx: any): Promise<any> {
  try {
    const chainPrefix = CHAIN_PREFIXES[chainId];
    const resp = await axios.post(
      `https://safe-transaction${chainPrefix}.gnosis.io/api/v1/safes/${safe}/transactions/`,
      tx,
    );
    return resp.data;
  } catch (e) {
    throw `Failed to propose tx: ${JSON.stringify(e.response.data)}`;
  }
}

export async function getLatestNonce(safe: string, chainId: number): Promise<number | undefined> {
  try {
    const chainPrefix = CHAIN_PREFIXES[chainId];
    const resp = await axios.get(
      `https://safe-transaction${chainPrefix}.gnosis.io/api/v1/safes/${safe}/all-transactions/`,
      {
        params: {
          ordering: 'nonce',
          executed: false,
          queued: true,
          trusted: true,
        },
      },
    );
    return resp.data.results.find(result => result.nonce)?.nonce;
  } catch (e) {
    console.log(e);
    throw `Failed to fetch multisig latest nonce: ${JSON.stringify(e.response.data)}`;
  }
}
