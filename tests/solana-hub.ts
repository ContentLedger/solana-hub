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

//Address:2ijVMniqgVgwyRebdPduJaVSAyqeR5Q9ftLJyAYYB7Qc
const account2WithLamports = anchor.web3.Keypair.fromSecretKey(
  bs58.decode(
    "8YGuLJGSHw4pTTeL8NERw11xDViWBUmqygBbjFGw19DdQyePcZSME4wHtxBAiKcHRzfdweR92a14cB279HKBbg4"
  )
);

const random = new anchor.web3.Keypair();

const COLLECTION_NAME = "La Piedra Filosofal 39";
const NFT_LIST = [
  {
    name: "Harry Potter",
    uri: "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
    symbol: "SHUB",
  },
  {
    name: "Hermione Granger",
    uri: "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
    symbol: "SHUB",
  },
  {
    name: "Ron Weasley",
    uri: "https://arweave.net/trLCtzS7x9YlA3cpwCIdugdrEYghgT6mQEM7hmZDcA4",
    symbol: "SHUB",
  },
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
    [
      Buffer.from("nft"),
      Buffer.from(name),
      Buffer.from("*"),
      u16ToLEBuffer(nftId),
    ],
    SOLANA_HUB_PROGRAM_ID
  );
  return nft;
};

function u16ToLEBuffer(num: number): Buffer {
  const buffer = Buffer.alloc(2); // Allocate 2 bytes for a 16-bit integer
  buffer.writeInt16LE(num, 0); // Write the number as big-endian at offset 0
  return buffer;
}

const predictAuctionNft = (
  program: Program<SolanaHub>,
  name: string,
  nftId: number
) => {
  const SOLANA_HUB_PROGRAM_ID = new anchor.web3.PublicKey(program.programId);
  const [auctionNft] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("nft_auction"),
      Buffer.from(name),
      Buffer.from("*"),
      u16ToLEBuffer(nftId),
    ],
    SOLANA_HUB_PROGRAM_ID
  );
  return auctionNft;
};

function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

//PRECONDITION;
//ADD LAMPORTS TO H9KwD9eQakjKuqanLpqxfEgBHPLniGsZTjpKyA9mXKgz AND 2ijVMniqgVgwyRebdPduJaVSAyqeR5Q9ftLJyAYYB7Qc
//CHANGE COLLECTION_NAME
describe("solana-hub", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaHub as Program<SolanaHub>;

  const auctionTime = 0.2 * 60;

  const nftToBid = 1;

  it("Register collection!", async () => {
    // Add your test here.
    const txInstruction = await program.methods
      .registerCollection(COLLECTION_NAME, new anchor.BN(auctionTime), NFT_LIST)
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
    const confirmation = await program.provider.connection.confirmTransaction(
      txHash,
      "confirmed"
    );
    if (!confirmation.value.err) {
      console.log("Your transaction signature", txHash);
      const auctionAccount = predictAuction(program, COLLECTION_NAME);
      const accountInfo = await program.account.auction.fetch(auctionAccount);
      console.log(accountInfo.timestampToClose.toNumber());
      console.log(accountInfo.nftList);
    }
  });

  it("Bid!", async () => {
    // Add your test here.
    const auctionNft = predictAuctionNft(program, COLLECTION_NAME, nftToBid);

    const bid = async (amountToBid: anchor.BN, bidder: anchor.web3.Keypair) => {
      try {
        const accountInfo = await program.account.nftAuction.fetch(auctionNft);
        console.log(accountInfo);
        console.log(
          "balance before",
          await program.provider.connection.getBalance(auctionNft)
        );
      } catch (e) {
        console.log(e);
      }
      let prevBidder = random.publicKey; //new anchor.web3.PublicKey(anchor.web3.VOTE_PROGRAM_ID);
      try {
        prevBidder = (await program.account.nftAuction.fetch(auctionNft))
          .bidder;
      } catch (e) {}

      const txInstruction = await program.methods
        .bid(COLLECTION_NAME, nftToBid, amountToBid)
        .accounts({
          bidder: bidder.publicKey,
          previousBidder: prevBidder,
        })
        .instruction();
      const transaction = new anchor.web3.Transaction().add(txInstruction);
      transaction.recentBlockhash = (
        await program.provider.connection.getLatestBlockhash("finalized")
      ).blockhash;
      transaction.sign(bidder);
      const txHash = await program.provider.connection.sendRawTransaction(
        transaction.serialize(),
        { preflightCommitment: "confirmed" }
      );
      const confirmation = await program.provider.connection.confirmTransaction(
        txHash,
        "confirmed"
      );
      console.log(txHash);
      if (!confirmation.value.err) {
        console.log("Your transaction signature", txHash);

        const accountInfo = await program.account.nftAuction.fetch(auctionNft);
        console.log(accountInfo);
        console.log(
          "balance after",
          await program.provider.connection.getBalance(auctionNft)
        );
      }
    };

    await bid(new anchor.BN(0.06 * 10 ** 9), accountWithLamports);
    await bid(new anchor.BN(0.07 * 10 ** 9), account2WithLamports);
  });

  it("Claim nft!", async () => {
    // Add your test here.
    await wait(auctionTime + 5);

    const txInstruction = await program.methods
      .claim(COLLECTION_NAME, nftToBid)
      .accounts({
        metadata: predictMetadataAccount(program, COLLECTION_NAME, nftToBid),
        claimer: account2WithLamports.publicKey,
      })
      .instruction();
    const transaction = new anchor.web3.Transaction().add(txInstruction);
    transaction.recentBlockhash = (
      await program.provider.connection.getLatestBlockhash("finalized")
    ).blockhash;
    transaction.sign(account2WithLamports);
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
      const nft = predictNft(program, COLLECTION_NAME, nftToBid);
      console.log(nft.toBase58());
    }
  });
});
