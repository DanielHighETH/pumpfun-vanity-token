import fs from "fs";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { Blob } from "buffer";

const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
const {
  endpoint,
  signerPrivateKey,
  mintPrivateKey,
  filePath,
  metadata,
  transactionOptions,
  jito,
  jitoTip,
} = config;

const web3Connection = new Connection(endpoint, "confirmed");

function decodeKeyPair(key) {
  try {
    return Keypair.fromSecretKey(bs58.decode(key));
  } catch (error) {
    try {
      return Keypair.fromSecretKey(Uint8Array.from(Buffer.from(key, "hex")));
    } catch (innerError) {
      throw new Error(
        "Invalid key format. Ensure it is either bs58 or hex encoded."
      );
    }
  }
}

async function sendLocalCreateTx() {
  const signerKeyPairDecoded = decodeKeyPair(signerPrivateKey);
  const mintKeypairDecoded = decodeKeyPair(mintPrivateKey);

  const formData = new FormData();
  const fileBuffer = await fs.promises.readFile(filePath);
  formData.append("file", new Blob([fileBuffer], { type: "image/png" }));
  for (const [key, value] of Object.entries(metadata)) {
    formData.append(key, value);
  }
  formData.append("showName", "true");

  const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: formData,
  });
  const metadataResponseJSON = await metadataResponse.json();

  if (jito) {
    const bundledTxArgs = [
      {
        publicKey: signerKeyPairDecoded.publicKey.toBase58(),
        action: "create",
        tokenMetadata: {
          name: metadataResponseJSON.metadata.name,
          symbol: metadataResponseJSON.metadata.symbol,
          uri: metadataResponseJSON.metadataUri,
        },
        mint: mintKeypairDecoded.publicKey.toBase58(),
        denominatedInSol: "true",
        amount: transactionOptions.amount,
        slippage: transactionOptions.slippage,
        priorityFee: jitoTip,
        pool: "pump",
      },
    ];

    const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bundledTxArgs),
    });

    if (response.status === 200) {
      const transactions = await response.json();
      const encodedSignedTransactions = [];

      for (let i = 0; i < bundledTxArgs.length; i++) {
        const tx = VersionedTransaction.deserialize(
          new Uint8Array(bs58.decode(transactions[i]))
        );
        tx.sign([mintKeypairDecoded, signerKeyPairDecoded]);
        encodedSignedTransactions.push(bs58.encode(tx.serialize()));
      }

      const jitoResponse = await fetch(
        `https://mainnet.block-engine.jito.wtf/api/v1/bundles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "sendBundle",
            params: [encodedSignedTransactions],
          }),
        }
      );
      const jitoResult = await jitoResponse.json();
      console.log(
        `Transaction: https://explorer.jito.wtf/bundle/${jitoResult.result}`
      );
    } else {
      console.error("Error in Jito transaction:", response.statusText);
    }
  } else {
    const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicKey: signerKeyPairDecoded.publicKey.toBase58(),
        action: "create",
        tokenMetadata: {
          name: metadataResponseJSON.metadata.name,
          symbol: metadataResponseJSON.metadata.symbol,
          uri: metadataResponseJSON.metadataUri,
        },
        mint: mintKeypairDecoded.publicKey.toBase58(),
        ...transactionOptions,
        denominatedInSol: "true",
        pool: "pump",
      }),
    });

    if (response.status === 200) {
      const data = await response.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(data));
      tx.sign([mintKeypairDecoded, signerKeyPairDecoded]);
      const signature = await web3Connection.sendTransaction(tx);
      console.log("Transaction: https://solscan.io/tx/" + signature);
    } else {
      console.error("Error:", response.statusText);
    }
  }
}

sendLocalCreateTx().catch(console.error);
