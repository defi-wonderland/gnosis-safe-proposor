import read from 'read';
import util from 'util';
import EIP712Domain from 'eth-typed-data';
import { ethers } from 'ethers';
import { ecsign, toBuffer, toRpcSig } from 'ethereumjs-util';

export const promiseRead = util.promisify(read);

export function createSafeTx(domain: EIP712Domain): any {
  return domain.createType('SafeTx', [
    { type: 'address', name: 'to' },
    { type: 'uint256', name: 'value' },
    { type: 'bytes', name: 'data' },
    { type: 'uint8', name: 'operation' },
    { type: 'uint256', name: 'safeTxGas' },
    { type: 'uint256', name: 'baseGas' },
    { type: 'uint256', name: 'gasPrice' },
    { type: 'address', name: 'gasToken' },
    { type: 'address', name: 'refundReceiver' },
    { type: 'uint256', name: 'nonce' },
  ]);
}

export function parseNumber(input: string, errorLabel: string): number {
  const number = Number(input);
  if (Number.isNaN(number)) throw `Error: Invalid ${errorLabel}`;
  return number;
}

export function parseAddress(input: string, errorLabel: string): string {
  if (!ethers.utils.isAddress(input)) throw `Error: Invalid ${errorLabel} address`;
  return ethers.utils.getAddress(input.toLowerCase());
}

export function parsePrivateKey(input: string): ethers.utils.SigningKey {
  const prefixedInput = input.substring(0, 2) === '0x' ? input : `0x${input}`;
  try {
    return new ethers.utils.SigningKey(prefixedInput);
  } catch {
    throw 'Error: Invalid private key';
  }
}

export function safeSign(safeTx: any, privateKey: string): Promise<string> {
  return safeTx.sign((data: Buffer) => {
    const { r, s, v } = ecsign(data, toBuffer(privateKey));
    return toRpcSig(v, r, s);
  });
}
