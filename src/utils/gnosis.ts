import axios from 'axios';

const CHAIN_PREFIXES = {
  1: '',
  4: 'rinkeby.',
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
          limit: 1,
          executed: false,
          queued: true,
          trusted: true,
        },
      },
    );
    const results = resp.data.results;
    return results.length ? results[0].nonce : undefined;
  } catch (e) {
    throw `Failed to fetch multisig latest nonce: ${JSON.stringify(e.response.data)}`;
  }
}
