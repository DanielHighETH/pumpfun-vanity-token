# Solana Token Creation Script

This project is a Node.js script for creating VANITY Solana tokens on pump.fun

## Grind your VANITY token address

You can use SOLANA CLI: [QuickNode tutorial](https://www.quicknode.com/guides/solana-development/getting-started/how-to-create-a-custom-vanity-wallet-address-using-solana-cli)
or [vanity-solana](https://github.com/m2-labs/vanity-solana/) package by M2 Labs.

## How to Use

1. Clone this repository.
2. Install the dependencies:
   ```bash
   pnpm install
   ```
3. Update the `config.json` file with your desired parameters.
4. Run the script:
   ```bash
   node app.js
   ```

## Configuration File: `config.json`

Below is the structure of the `config.json` file:

```json
{
  "endpoint": "RPC endpoint URL",
  "signerPrivateKey": "Base58_or_Hex_encoded_private_key_for_signer",
  "mintPrivateKey": "Base58_or_Hex_encoded_private_key_for_mint",
  "filePath": "Path_to_token_image_file",
  "metadata": {
    "name": "Token name",
    "symbol": "Token symbol",
    "description": "Token description",
    "twitter": "Twitter URL",
    "telegram": "Telegram URL",
    "website": "Website URL"
  },
  "transactionOptions": {
    "amount": 1,
    "slippage": 10,
    "priorityFee": 0.001
  },
  "jito": true,
  "jitoTip": 0.001
}
```

### Description of Configuration Fields:

- **`endpoint`**: The Solana RPC endpoint URL (e.g., Helius RPC).
- **`signerPrivateKey`**: The private key for the signer account. Can be either Base58 or Hex-encoded.
- **`mintPrivateKey`**: The private key for the mint account. Can be either Base58 or Hex-encoded. Use the grinded VANITY private key here.
- **`filePath`**: The path to the token image file, which will be uploaded as part of the token metadata.
- **`metadata`**: An object containing metadata fields for the token:
  - `name`: The name of the token (e.g., "PPTest").
  - `symbol`: The token symbol (e.g., "TEST").
  - `description`: A description of the token.
  - `twitter`: A link to the associated Twitter account.
  - `telegram`: A link to the associated Telegram account.
  - `website`: The website URL for the token.
- **`transactionOptions`**: An object defining transaction-specific parameters:
  - `amount`: The amount of the token to be transacted (in SOL).
  - `slippage`: The slippage percentage allowed for the transaction.
  - `priorityFee`: The priority fee for the transaction (in SOL).
- **`jito`**: A boolean (`true` or `false`) indicating whether to use Jito bundles for the transaction.
- **`jitoTip`**: The priority fee for Jito bundles (in SOL).

## Output

- If `jito` is set to `false`, the script sends a standard transaction and logs the transaction link:
  ```
  Transaction: https://solscan.io/tx/<transaction_signature>
  ```
- If `jito` is set to `true`, the script sends a Jito bundle and logs the Solscan link for the Jito transaction:
  ```
  Transaction: https://explorer.jito.wtf/bundle/<jito_transaction_signature>
  ```

## Error Handling

- If the private keys (`signerKeyPair` or `mintKeyPair`) are invalid, the script will throw an error.
- Ensure that the file specified in `filePath` exists and is a valid PNG file.
- Make sure the RPC endpoint and API keys are correct and accessible.

## Dependencies

- Node.js
- `@solana/web3.js`
- `bs58`
- `buffer`
- `fs`
