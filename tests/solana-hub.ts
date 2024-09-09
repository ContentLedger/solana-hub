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

const COLLECTION_NAME = "La Piedra Filosofal 6";

const predictAuction = (program: Program<SolanaHub>, name: string) => {
  const SOLANA_HUB_PROGRAM_ID = new anchor.web3.PublicKey(program.programId);
  const [auction] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auction"), Buffer.from(name)],
    SOLANA_HUB_PROGRAM_ID
  );
  return auction;
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

  it("Register collection!", async () => {
    // Add your test here.
    const txInstruction = await program.methods
      .registerCollection(COLLECTION_NAME, 10, new anchor.BN(5 * 60))
      .accounts({ creator: accountWithLamports.publicKey })
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
    console.log("Your transaction signature", txHash);
    // const auctionAccount = predictAuction(program, COLLECTION_NAME);
    // const accountInfo = await program.account.auction.fetch(auctionAccount);
    // console.log(accountInfo.timestampToClose.toNumber());
  });
});
