import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
    PublicKey
  } from "@solana/web3.js";
  import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    getMintLen,
    createInitializeMetadataPointerInstruction,
    getMint,
    getMetadataPointerState,
    getTokenMetadata,
    TYPE_SIZE,
    LENGTH_SIZE,
  } from "@solana/spl-token";
  import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    createRemoveKeyInstruction,
    pack,
  } from "@solana/spl-token-metadata";
import { getKeypairFromFile } from '@solana-developers/helpers'
  
const payer = await getKeypairFromFile("~/.config/solana/id.json")

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
let transaction,transaction1,transaction2, transaction3;
  
let transactionSignature, transactionSignature1, transactionSignature2, transactionSignature3;

  // Generate new keypair for Mint Account
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  const decimals = 2;
  // Authority that can mint new tokens
  const mintAuthority = new PublicKey('E53C1jTq7dPJqRdw4iU2zsxzzSNmjegXLH4y1NAZWb5L');
  // Authority that can update the metadata pointer and token metadata
  const updateAuthority = new PublicKey('E53C1jTq7dPJqRdw4iU2zsxzzSNmjegXLH4y1NAZWb5L');

  const res = await fetch(`https://token.jup.ag/all`)
  const coins = await res.json()
  const data_px = coins.slice(0,200)
  const data = data_px.filter((coin) => {return coin.tags.includes("community")}).slice(0,50)

  let meta_arr = []
  for(let i=0;i<(data.length);i++){
    meta_arr.push([data[i].symbol,data[i].name])
  }
  console.log(meta_arr)

  // Metadata to store in Mint Account
  const metaData = {
    updateAuthority: updateAuthority,
    mint: mint,
    name: "MEME50",
    symbol: "MEME50",
    uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
    additionalMetadata: meta_arr,
  };
  
  // Size of MetadataExtension 2 bytes for type, 2 bytes for length
  const metadataExtension = (TYPE_SIZE + LENGTH_SIZE)*3;
  // Size of metadata
  const metadataLen = pack(metaData).length;
  // Size of Mint Account with extension
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  
  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataExtension + metadataLen
  );
  
  // Instruction to invoke System Program to create new account
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey, 
    newAccountPubkey: mint, 
    space: mintLen, 
    lamports, 
    programId: TOKEN_2022_PROGRAM_ID,
  });
  
  // Instruction to initialize the MetadataPointer Extension
  const initializeMetadataPointerInstruction =
    createInitializeMetadataPointerInstruction(
      mint, // Mint Account address
      updateAuthority, // Authority that can set the metadata address
      mint, // Account address that holds the metadata
      TOKEN_2022_PROGRAM_ID
    );
  
  const initializeMintInstruction = createInitializeMintInstruction(
    mint,
    decimals, // Decimals of Mint
    payer.publicKey, // Designated Mint Authority
    null, // Optional Freeze Authority
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
  );
  
  // Instruction to initialize Metadata Account data
  const initializeMetadataInstruction = createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID, 
    metadata: mint, // Account address that holds the metadata
    updateAuthority: updateAuthority,
    mint: mint, // Mint Account address
    mintAuthority: payer.publicKey, // Designated Mint Authority
    name: metaData.name,
    symbol: metaData.symbol,
    uri: metaData.uri,
  });
  
  // Instruction to update metadata, adding custom field
  // const updateFieldInstruction = createUpdateFieldInstruction({
  //   programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
  //   metadata: mint, // Account address that holds the metadata
  //   updateAuthority: updateAuthority, // Authority that can update the metadata
  //   field: metaData.additionalMetadata[0][0], // key
  //   value: metaData.additionalMetadata[0][1], // value
  // });

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

  // Add instructions to new transaction
  //splitting the transaction into 2 or more txns(to avoid one large transaction>1232 bytes)
  transaction = new Transaction().add(
    createAccountInstruction,
    initializeMetadataPointerInstruction,
    // note: the above instructions are required before initializing the mint
    initializeMintInstruction,
    initializeMetadataInstruction,
    // updateFieldInstruction,
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
  
  // Send transaction
  console.log("public key: ",payer.publicKey.toString())
  console.log("private key: ",payer.secretKey.toString())
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
  
  console.log(
    "\nCreate Mint Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
  );
  console.log(
    "\nCreate Mint Account:",
    `https://solana.fm/tx/${transactionSignature1}?cluster=devnet-solana`
  );
  console.log(
    "\nCreate Mint Account:",
    `https://solana.fm/tx/${transactionSignature2}?cluster=devnet-solana`
  );
  console.log(
    "\nCreate Mint Account:",
    `https://solana.fm/tx/${transactionSignature3}?cluster=devnet-solana`
  );
  // Retrieve mint information
  const mintInfo = await getMint(
    connection,
    mint,
    "confirmed",
    TOKEN_2022_PROGRAM_ID
  );
  
  // Retrieve and log the metadata pointer state
  const metadataPointer = getMetadataPointerState(mintInfo);
  console.log("\nMetadata Pointer:", JSON.stringify(metadataPointer, null, 2));
  
  // Retrieve and log the metadata state
  const metadata = await getTokenMetadata(
    connection,
    mint // Mint Account address
  );
  console.log("\nMetadata:", JSON.stringify(metadata, null, 2));