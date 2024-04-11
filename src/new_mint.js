//THIS WOULD CONTAIN THE LOGIC OF EVERY CONSECUTIVE MINT, AFTER THE INITIAL TOKEN MINT HAPPENED.
// THE MINT ADDRESS AND THE OWNER/MINT AUTHORITY ARE ALREADY PROVIDED AS INPUT HERE, THEY'RE NOT CREATED AGAIN.

// ULTIMATELY, TRANSFER THE MINT AUTHORITY FROM YOUR ADDRESS TO RAM'S ADDRESS

import { Connection, Keypair, PublicKey, clusterApiUrl, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, getMint, createUpdateFieldInstruction } from '@solana/spl-token';
import { getKeypairFromFile } from '@solana-developers/helpers'


async function mintTokens(
  connection,
  payer,
  mint,
  destination,
  authority,
  amount
) {
  const mintInfo = await getMint(connection, mint)

  const transactionSignature = await mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount * 10 ** mintInfo.decimals
  )

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet-beta`
  )
}

async function main() {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const payer = await getKeypairFromFile("~/.config/solana/id.json")
  const updateAuthority = payer.publicKey;

  console.log("PublicKey:", payer.publicKey.toBase58())

  const mintKeypair = await getKeypairFromFile("./mint_keypair.json")
  console.log(mintKeypair)
  const mint = mintKeypair.publicKey //mint address here

  const res = await fetch(`https://token.jup.ag/all`)
  const coins = await res.json()
  const data_px = coins.slice(0,250)
  const data = data_px.filter((coin) => {return coin.tags.includes("community")}).slice(0,50)

  let meta_arr = []
  for(let i=0;i<(data.length);i++){
    meta_arr.push([data[i].symbol,data[i].name])
  }
  console.log(meta_arr)

  const metaData = {
    updateAuthority: updateAuthority,
    mint: mint,
    name: "MEME50",
    symbol: "MEME50",
    uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
    additionalMetadata: meta_arr,
  };

  const updateInstructions = metaData.additionalMetadata.slice(0,Math.round(data.length/4)).map(([key, value], index) => {
    return createUpdateFieldInstruction({
      programId: TOKEN_2022_PROGRAM_ID, 
      metadata: mint, 
      updateAuthority: updateAuthority, 
      field: key, 
      value: value,
    });
  })

  const updateInstructions1 = metaData.additionalMetadata.slice(Math.round(data.length/4),Math.round(2*data.length/4)).map(([key, value], index) => {
    return createUpdateFieldInstruction({
      programId: TOKEN_2022_PROGRAM_ID, 
      metadata: mint, 
      updateAuthority: updateAuthority, 
      field: key, 
      value: value,
    });
  });

    const updateInstructions2 = metaData.additionalMetadata.slice(Math.round(2*data.length/4),(3*data.length/4)).map(([key, value], index) => {
      return createUpdateFieldInstruction({
        programId: TOKEN_2022_PROGRAM_ID, 
        metadata: mint, 
        updateAuthority: updateAuthority, 
        field: key, 
        value: value,
      });
    });

    const updateInstructions3 = metaData.additionalMetadata.slice(Math.round(3*data.length/4),(data.length)).map(([key, value], index) => {
      return createUpdateFieldInstruction({
        programId: TOKEN_2022_PROGRAM_ID, 
        metadata: mint, 
        updateAuthority: updateAuthority, 
        field: key, 
        value: value,
      });
    });

  let transaction, transaction1, transaction2, transaction3;

  transaction = new Transaction().add(
    ...updateInstructions,
  );

  transaction1 = new Transaction().add(
    ...updateInstructions1,
  );

  transaction2 = new Transaction().add(
    ...updateInstructions2,
  );

  transaction3 = new Transaction().add(
    ...updateInstructions3,
  );
  
  let transactionSignature, transactionSignature1, transactionSignature2, transactionSignature3;

  transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair] 
  );
  transactionSignature1 = await sendAndConfirmTransaction(
    connection,
    transaction1,
    [payer, mintKeypair]
  );
  transactionSignature2 = await sendAndConfirmTransaction(
    connection,
    transaction2,
    [payer, mintKeypair]
  );
  transactionSignature3 = await sendAndConfirmTransaction(
    connection,
    transaction3,
    [payer, mintKeypair]
  );


  const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey)
  // Mint 10000 tokens to our address
  await mintTokens(connection, payer, mint, tokenAccount.address, payer.publicKey, 10000)
}

main()
  .then(() => {
    console.log("Finished successfully")
  })
  .catch((error) => {
    console.log(error)
  })