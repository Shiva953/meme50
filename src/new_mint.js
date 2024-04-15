//THIS WOULD CONTAIN THE LOGIC OF EVERY CONSECUTIVE MINT, AFTER THE INITIAL TOKEN MINT HAPPENED.
// THE MINT ADDRESS AND THE OWNER/MINT AUTHORITY ARE ALREADY PROVIDED AS INPUT HERE, THEY'RE NOT CREATED AGAIN.

// ULTIMATELY, TRANSFER THE MINT AUTHORITY FROM YOUR ADDRESS TO RAM'S ADDRESS

import { Connection, Keypair, PublicKey, clusterApiUrl, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, TOKEN_2022_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, getMint, createUpdateFieldInstruction } from '@solana/spl-token';
import { getKeypairFromFile } from '@solana-developers/helpers'

async function mintTokens(
  connection,
  payer,
  mint,
  destination,
  authority,
  amount
) {
  const mintInfo = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID)

  const transactionSignature = await mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount * 10 ** mintInfo.decimals,
    [payer],
    "confirmed",
    TOKEN_2022_PROGRAM_ID
  )

  return transactionSignature;
}

async function main() {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  const payer = await getKeypairFromFile("~/.config/solana/id.json")
  const updateAuthority = payer.publicKey;

  console.log("PublicKey:", payer.publicKey.toBase58())

  const mintKeypair = await getKeypairFromFile("./mint_keypair.json") //this should contain the mintkeypair, as created in mint.js
  // the above mintKeyPair would be required in metadata update txns
  console.log(mintKeypair)
  const mint = mintKeypair.publicKey //mint address here
  console.log("MINT ADDRESS: ", mintKeypair.publicKey.toBase58())

  //COMMENT THIS FOR GETTING METADATA
  // const res = await fetch(`https://token.jup.ag/all`)
  // const coins = await res.json()
  // const data_px = coins.slice(0,250)
  // const data = data_px.filter((coin) => {return coin.tags.includes("community")}).slice(0,50)

  // let meta_arr = []
  // for(let i=0;i<(data.length);i++){
  //   meta_arr.push([data[i].symbol,data[i].name])
  // }
  // console.log(meta_arr)

  // const metaData = {
  //   updateAuthority: updateAuthority,
  //   mint: mint,
  //   name: "MEME50",
  //   symbol: "MEME50",
  //   uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
  //   additionalMetadata: meta_arr,
  // };

  // const updateInstructions = metaData.additionalMetadata.slice(0,Math.round(data.length/4)).map(([key, value], index) => {
  //   return createUpdateFieldInstruction({
  //     programId: TOKEN_2022_PROGRAM_ID, 
  //     metadata: mint, 
  //     updateAuthority: updateAuthority, 
  //     field: key, 
  //     value: value,
  //   });
  // })

  // const updateInstructions1 = metaData.additionalMetadata.slice(Math.round(data.length/4),Math.round(2*data.length/4)).map(([key, value], index) => {
  //   return createUpdateFieldInstruction({
  //     programId: TOKEN_2022_PROGRAM_ID, 
  //     metadata: mint, 
  //     updateAuthority: updateAuthority, 
  //     field: key, 
  //     value: value,
  //   });
  // });

  //   const updateInstructions2 = metaData.additionalMetadata.slice(Math.round(2*data.length/4),(3*data.length/4)).map(([key, value], index) => {
  //     return createUpdateFieldInstruction({
  //       programId: TOKEN_2022_PROGRAM_ID, 
  //       metadata: mint, 
  //       updateAuthority: updateAuthority, 
  //       field: key, 
  //       value: value,
  //     });
  //   });

  //   const updateInstructions3 = metaData.additionalMetadata.slice(Math.round(3*data.length/4),(data.length)).map(([key, value], index) => {
  //     return createUpdateFieldInstruction({
  //       programId: TOKEN_2022_PROGRAM_ID, 
  //       metadata: mint, 
  //       updateAuthority: updateAuthority, 
  //       field: key, 
  //       value: value,
  //     });
  //   });

    //COMMENT THIS PART OUT FOR METADATA UPDATE TRANSACTIONS
  // let transaction, transaction1, transaction2, transaction3;

  // transaction = new Transaction().add(
  //   ...updateInstructions,
  // );

  // transaction1 = new Transaction().add(
  //   ...updateInstructions1,
  // );

  // transaction2 = new Transaction().add(
  //   ...updateInstructions2,
  // );

  // transaction3 = new Transaction().add(
  //   ...updateInstructions3,
  // );
  
  //COMMENT THIS PART OUT FOR METADATA UPDATE TXNS
  // let transactionSignature, transactionSignature1, transactionSignature2, transactionSignature3;
  // transactionSignature = await sendAndConfirmTransaction(
  //   connection,
  //   transaction,
  //   [payer, mintKeypair] 
  // );
  // transactionSignature1 = await sendAndConfirmTransaction(
  //   connection,
  //   transaction1,
  //   [payer, mintKeypair]
  // );
  // transactionSignature2 = await sendAndConfirmTransaction(
  //   connection,
  //   transaction2,
  //   [payer, mintKeypair]
  // );
  // transactionSignature3 = await sendAndConfirmTransaction(
  //   connection,
  //   transaction3,
  //   [payer, mintKeypair]
  // );
  // console.log("metadata update txn signature: ", transactionSignature)

  //HERE, I'M TAKING THE ALREADY CREATED TOKEN FOR EXAMPLE.
  // Mint 10000 tokens to our address
  const owner = new PublicKey("CUdHPZyyuMCzBJEgTZnoopxhp9zjp1pog3Tgx2jEKP7E")
  const mintP = new PublicKey("9sqLQwYYeGMbRTBQhKqgjipTYhYLNddkdV5py2f2tP7w")
  const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mintP, owner, false, "confirmed", "confirmed", TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
  console.log(tokenAccount.address)
  const amount = 100000
  // const signer = Keypair.fromSecretKey(new Uint8Array(bs58.decode(payer.secretKey)));
  
    // const transaction = new Transaction().add(
    //   createAssociatedTokenAccountInstruction(
    //     payer.publicKey,
    //     tokenAddress,
    //     payer.publicKey,
    //     mintP,
    //     TOKEN_2022_PROGRAM_ID,
    //     ASSOCIATED_TOKEN_PROGRAM_ID
    //   )
    // );;
    // If the account does not exist, add the create account instruction to the transaction
    // Logic from node_modules/@solana/spl-token/src/actions/getOrCreateAssociatedTokenAccount.ts
    
  const mintTransactionSignature = await mintTokens(
    connection,
    payer,
    mintP,
    tokenAccount.address,
    payer.publicKey,
    amount
  )
  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${mintTransactionSignature}?cluster=mainnet-beta`
  )
}

main()
  .then(() => {
    console.log("Finished successfully")
  })
  .catch((error) => {
    console.log(error)
  })