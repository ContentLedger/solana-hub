import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaHub } from "../target/types/solana_hub";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

//Address:H9KwD9eQakjKuqanLpqxfEgBHPLniGsZTjpKyA9mXKgz
const accountWithLamports = anchor.web3.Keypair.fromSecretKey(
  bs58.decode(
    "DS7PFJT3GGgHtsDdnCw5EynoQ7eZb41pUhrGH3GkYVztKZ4mHJaRth3eggrHChoWjHEWAxNhVgGEb2R2jgRJy9G"
  )
);

const COLLECTION_NAME = "La Piedra Filosofal 10";
const NFT_LIST = [
  "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
  "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
  "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
  "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
  "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
  "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
  "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
  "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
  "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
  "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
];

const predictAuction = (program: Program<SolanaHub>, name: string) => {
  const SOLANA_HUB_PROGRAM_ID = new anchor.web3.PublicKey(program.programId);
  const [auction] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auction"), Buffer.from(name)],
    SOLANA_HUB_PROGRAM_ID
  );
  return auction;
};

const predictMetadataAccount = (
  program: Program<SolanaHub>,
  name: string,
  nftId: number
) => {
  const METADATA_SEED = "metadata";
  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  const [metadataAddress] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(METADATA_SEED),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      predictNft(program, name, nftId).toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  return metadataAddress;
};

const predictNft = (
  program: Program<SolanaHub>,
  name: string,
  nftId: number
) => {
  const SOLANA_HUB_PROGRAM_ID = new anchor.web3.PublicKey(program.programId);
  const [nft] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("nft"), Buffer.from(name), u16ToBigEndianBuffer(nftId)],
    SOLANA_HUB_PROGRAM_ID
  );
  return nft;
};

function u16ToBigEndianBuffer(num: number): Buffer {
  const buffer = Buffer.alloc(2); // Allocate 2 bytes for a 16-bit integer
  buffer.writeUInt16BE(num, 0); // Write the number as big-endian at offset 0
  return buffer;
}

const predictAuctionNft = (
  program: Program<SolanaHub>,
  name: string,
  nftId: number
) => {
  const SOLANA_HUB_PROGRAM_ID = new anchor.web3.PublicKey(program.programId);
  const [auctionNft] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auction"), Buffer.from(name), u16ToBigEndianBuffer(nftId)],
    SOLANA_HUB_PROGRAM_ID
  );
  return auctionNft;
};

describe("solana-hub", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaHub as Program<SolanaHub>;

  // it("Register collection!", async () => {
  //   // Add your test here.
  //   const txInstruction = await program.methods
  //     .registerCollection(COLLECTION_NAME, new anchor.BN(5 * 60), NFT_LIST)
  //     .accounts({ creator: accountWithLamports.publicKey })
  //     .instruction();
  //   const transaction = new anchor.web3.Transaction().add(txInstruction);
  //   transaction.recentBlockhash = (
  //     await program.provider.connection.getLatestBlockhash("finalized")
  //   ).blockhash;
  //   transaction.sign(accountWithLamports);
  //   const txHash = await program.provider.connection.sendRawTransaction(
  //     transaction.serialize(),
  //     { preflightCommitment: "confirmed" }
  //   );
  //   const confirmation = await program.provider.connection.confirmTransaction(
  //     txHash,
  //     "confirmed"
  //   );
  //   if (!confirmation.value.err) {
  //     console.log("Your transaction signature", txHash);
  //     const auctionAccount = predictAuction(program, COLLECTION_NAME);
  //     const accountInfo = await program.account.auction.fetch(auctionAccount);
  //     console.log(accountInfo.timestampToClose.toNumber());
  //     console.log(accountInfo.nftList);
  //   }
  // });
  it("Claim nft!", async () => {
    // Add your test here.
    const nftId = 1;
    console.log(predictNft(program, COLLECTION_NAME, nftId));
    const txInstruction = await program.methods
      .claim(COLLECTION_NAME, nftId)
      .accounts({
        metadata: predictMetadataAccount(program, COLLECTION_NAME, nftId),
        claimer: accountWithLamports.publicKey,
      })
      .instruction();
    const transaction = new anchor.web3.Transaction().add(txInstruction);
    transaction.recentBlockhash = (
      await program.provider.connection.getLatestBlockhash("finalized")
    ).blockhash;
    transaction.sign(accountWithLamports);
    const txHash = await program.provider.connection.sendRawTransaction(
      transaction.serialize(),
      { preflightCommitment: "confirmed" }
    );
    const confirmation = await program.provider.connection.confirmTransaction(
      txHash,
      "confirmed"
    );
    if (!confirmation.value.err) {
      console.log("Your transaction signature", txHash);
      const nft = predictNft(program, COLLECTION_NAME, nftId);
      console.log(nft.toBase58());
    }
  });
});
