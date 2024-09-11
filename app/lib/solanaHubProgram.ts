import { AnchorProvider, Program, BN, Idl } from "@coral-xyz/anchor";
import { PublicKey } from '@solana/web3.js';
import solanaHubIDL from "../idls/solana_hub.json";
import { SolanaHub } from "@/idls/solana_hub";

const deriveNftAuctionPubkey = (collectionName: string, nftId: number, program: Program<SolanaHub>) => {
    const nftIdBuffer = Buffer.alloc(2);
    nftIdBuffer.writeInt16LE(nftId, 0);

    const seeds = [
        Buffer.from("nft_auction"),
        Buffer.from(collectionName),
        Buffer.from("*"),
        nftIdBuffer
    ];
    const [nftAuctionPubkey] = PublicKey.findProgramAddressSync(seeds, program.programId);
    return nftAuctionPubkey;
}

const deriveMetadataPubkey = (nftName: string, nftId: number, program: Program<SolanaHub>) => {
    const METADATA_SEED = "metadata";
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(METADATA_SEED),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            predictNft(nftName, nftId, program).toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    return metadataAddress;
}

const predictNft = (
    name: string,
    nftId: number,
    program: Program<SolanaHub>,
) => {
    const nftIdBuffer = Buffer.alloc(2);
    nftIdBuffer.writeInt16LE(nftId, 0);

    const [nft] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("nft"),
            Buffer.from(name),
            Buffer.from("*"),
            nftIdBuffer,
        ],
        program.programId
    );
    return nft;
};


export async function registerCollection(
    collectionName: string,
    secondsToClose: number,
    nftList: { uri: string; name: string; symbol: string }[],
    provider: AnchorProvider
) {
    if (!provider.publicKey) {
        throw new Error("Wallet not connected");
    }

    const latestBlockhash = await provider.connection.getLatestBlockhash();
    const program = new Program(solanaHubIDL as Idl, provider);
    const txSignature = await program.methods
        .registerCollection(collectionName, new BN(secondsToClose), nftList)
        .accountsPartial({ creator: provider.publicKey })
        .rpc();

    await provider.connection.confirmTransaction(
        {
            signature: txSignature,
            ...latestBlockhash,
        },
        "processed"
    );

    return txSignature;
}

export const bid = async (
    collectionName: string,
    nftId: number,
    bidAmount: number,
    provider: AnchorProvider
) => {
    if (!provider.publicKey) {
        throw new Error("Wallet not connected");
    }

    const latestBlockhash = await provider.connection.getLatestBlockhash();
    const program = new Program<SolanaHub>(solanaHubIDL as SolanaHub, provider);

    const nftAuctionPubkey = deriveNftAuctionPubkey(collectionName, nftId, program);
    const nftAuctionAccount = await program.account.nftAuction.fetch(nftAuctionPubkey)
    const prevBidder = nftAuctionAccount.bidder.toString()

    const txSignature = await program.methods
        .bid(collectionName, nftId, new BN(bidAmount))
        .accounts({
            bidder: provider.publicKey,
            previousBidder: prevBidder,
        })
        .rpc();

    await provider.connection.confirmTransaction(
        {
            signature: txSignature,
            ...latestBlockhash,
        },
        "processed"
    );

    return txSignature;
};

export const claim = async (
    nftName: string,
    nftId: number,
    provider: AnchorProvider
) => {
    if (!provider.publicKey) {
        throw new Error("Wallet not connected");
    }

    const latestBlockhash = await provider.connection.getLatestBlockhash();
    const program = new Program<SolanaHub>(solanaHubIDL as SolanaHub, provider);
    const metadata = deriveMetadataPubkey(nftName, nftId, program);
    const txSignature = await program.methods
        .claim(nftName, nftId)
        .accounts({
            metadata,
            claimer: provider.publicKey
        })
        .rpc();

    await provider.connection.confirmTransaction(
        {
            signature: txSignature,
            ...latestBlockhash,
        },
        "processed"
    );

    return txSignature;
};

