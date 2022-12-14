#!/usr/bin/env node

import EIP712Domain from 'eth-typed-data';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { BigNumber, ethers } from 'ethers';
import { parseAddress, parsePrivateKey, parseNumber, promiseRead, createSafeTx, safeSign } from './utils/misc';
import { SUPPORTED_CHAINS, getLatestNonce, estimateTransaction, proposeTx } from './utils/gnosis';

(async () => {
  const { safe, chainId, to, data, value, operation } = getArguments();

  // wait for user to input delegate private key
  const signer = parsePrivateKey(
    await promiseRead({
      prompt: 'Delegate private key (hidden)',
      silent: true,
      replace: '*',
    }),
  );
  const signerAddress = new ethers.Wallet(signer.privateKey).address;

  const safeDomain = new EIP712Domain({ verifyingContract: safe, chainId });
  const SafeTx = createSafeTx(safeDomain);
  const baseTx = { to, data, value: value.toString(), operation };

  console.debug('Fetching current safe nonce...');

  // get default nonce, taking queued txs into account
  const latestNonce = await getLatestNonce(safe, chainId);
  const defaultNonce = String(latestNonce === undefined ? 0 : latestNonce + 1);
  // let user override default nonce
  const nonce = parseNumber(await promiseRead({ prompt: 'Transaction nonce', default: defaultNonce }), 'nonce');
  console.debug('');

  // Let the Safe service estimate the tx
  const { safeTxGas } = await estimateTransaction(safe, chainId, baseTx);

  const tx = {
    ...baseTx,
    safeTxGas,
    // Here we can also set any custom nonce
    nonce,
    // We don't want to use the refund logic of the safe to lets use the default values
    baseGas: 0,
    gasPrice: 0,
    gasToken: '0x0000000000000000000000000000000000000000',
    refundReceiver: '0x0000000000000000000000000000000000000000',
  };

  const safeTx = new SafeTx({
    ...tx,
    data: ethers.utils.arrayify(tx.data),
  });
  const signature = await safeSign(safeTx, signer.privateKey);

  const toSend = {
    ...tx,
    sender: signerAddress,
    contractTransactionHash: '0x' + safeTx.signHash().toString('hex'),
    signature,
  };

  console.info('Transaction Details');
  console.info('-------------------');
  console.info(`Delegator: ${signerAddress}`);
  console.info(`Safe: ${safe}`);
  console.info(`Chain ID: ${chainId}`);
  console.info(`To: ${to}`);
  console.info(`Data: ${data}`);
  console.info(`Value: ${value.toString()}`);
  console.info(`Nonce: ${nonce}`);
  console.info(`Operation: ${operation === 0 ? 'Call' : 'Delegate call'}`);
  console.info('');

  // wait for user confirmation before sending tx proposal
  const confirmation = await promiseRead({ prompt: 'Confirm', default: 'Y' });
  if (['y', 'yes', 'yeah'].indexOf(confirmation.toLowerCase()) === -1) {
    console.warn('Confirmation declined');
    return;
  }

  // send tx proposal
  await proposeTx(safe, chainId, toSend);
  console.info('Transaction proposed successfully!');
})().catch(console.error);

function getArguments() {
  return yargs(hideBin(process.argv))
    .options({
      safe: {
        type: 'string',
        alias: 's',
        description: 'Address of the Gnosis Safe',
        require: true,
        coerce: (address) => parseAddress(address, 'safe'),
      },
      chainId: {
        type: 'number',
        alias: 'c',
        description: 'Chain ID',
        default: 1,
        choices: SUPPORTED_CHAINS,
      },
      to: {
        type: 'string',
        alias: 't',
        description: 'Transaction target address',
        require: true,
        coerce: (address) => parseAddress(address, 'target'),
      },
      data: {
        type: 'string',
        alias: 'd',
        description: 'Transaction data',
        default: '0x',
      },
      value: {
        type: 'string',
        alias: 'v',
        description: 'Transaction value',
        default: 0,
        coerce: BigNumber.from,
      },
      operation: {
        type: 'number',
        alias: 'o',
        description: 'Transaction operation (0 = CALL, 1 = DELEGATE_CALL)',
        default: 0,
        choices: [0, 1],
      },
    })
    .parseSync();
}
