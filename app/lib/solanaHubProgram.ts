import { AnchorProvider, Program, BN, Idl } from "@coral-xyz/anchor";
import solanaHubIDL from "../idls/solana_hub.json";

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

export const bid = async () => { };

export const claim = async () => { };
