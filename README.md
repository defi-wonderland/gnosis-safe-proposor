[![image](https://img.shields.io/npm/v/@defi-wonderland/gnosis-safe-proposor.svg?style=flat-square)](https://www.npmjs.org/package/@defi-wonderland/gnosis-safe-proposor)

# Gnosis Safe Proposor

Just the right tool to easily propose transactions to a [Gnosis Safe](https://gnosis-safe.io/).

The private key of the delegate will be requested in runtime as a masked input. There is no need to have it in a `.env` file, nor will it be printed to the console.

Inspired by [rmeissner's gist](https://gist.github.com/rmeissner/0fa5719dc6b306ba84ee34bebddc860b).

![@defi-wonderland:gnosis-safe-proposor](https://user-images.githubusercontent.com/84932007/191055124-1e635276-dc9a-40ab-9359-feeea29c5ac0.gif)

> :warning: This project was made in a couple of hours for internal usage. Please don't bully us if the code is not the prettiest, instead, submit PR 🙈

## Usage

As simple as it gets, run:
```bash
npx @defi-wonderland/gnosis-safe-proposor --safe YOUR_SAFE_ADDRESS --to YOUR_TARGET_ADDRESS --data YOUR_TX_DATA
```

## Options

### `--safe` or `-s` (Required)
Address of the Gnosis Safe.

### `--to` or `-t` (Required)
Transaction target address.

### `--data` or `-d`
Transaction data.

Default: `0x`

### `--value` or `-v`
Transaction value. It must be a number.

### `--chainId` or `-c`

Chain ID. It must be one of the following numbers:
* `1` (Ethereum mainnet)
* `4` (Rinkeby)
* `5` (Goerli)

Default: `1`

Adding new chains should be extremely easy as long as it is supported by: `https://safe-relay.gnosis.io/` (read [gnosis.ts](https://github.com/defi-wonderland/gnosis-safe-proposor/blob/main/src/utils/gnosis.ts))

### `--operation` or `-o`

Transaction operation. It must be one of the following numbers:
* 0 (CALL)
* 1 (DELEGATE_CALL)

Default: `0`
