use anchor_lang::prelude::*;
use solana_program::sysvar::clock::Clock;

// use anchor_spl::{
//     associated_token::AssociatedToken,
//     token::{Mint, Token, TokenAccount},
// };

declare_id!("68LstwZhYt14pDyVtzLKQ9yfXntNDauhAaH5TMQD1fRj");

#[program]
pub mod solana_hub {
    use super::*;

    pub fn register_collection(
        ctx: Context<RegisterCollection>,
        name: String,
        quantity: u16,
        timestamp_to_close: i64,
    ) -> Result<()> {
        msg!(
            "{0},{1},{2},{3}",
            ctx.accounts.auction.key(),
            name,
            quantity.to_string(),
            timestamp_to_close.to_string()
        );
        Ok(())
    }

    pub fn bid(ctx: Context<Bid>, name: String, nft_id: u16) -> Result<()> {
        //TODO: bid only while time < ctx.auction.timestamp_to_close
        msg!(
            "{0},{1},{2}",
            ctx.accounts.auction.key(),
            name.to_string(),
            nft_id.to_string()
        );
        Ok(())
    }

    // Currently, the creator receives their payment only when the NFT is claimed.
    // This approach may pose an issue if the bidder never claims the NFT, potentially
    // leaving the creator unpaid. To address this, we plan to implement a mechanism
    // that allows the creator to collect the funds raised independently of the NFT
    // claim process, ensuring that the creator receives their payment regardless of
    // whether the NFT is claimed.
    pub fn claim(ctx: Context<Claim>, name: String, nft_id: u16) -> Result<()> {
        //TODO: claim only if timestamp_to_close
        msg!(
            "{0},{1},{2}",
            ctx.accounts.auction.key(),
            name.to_string(),
            nft_id.to_string()
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name:String, quantity:u16, timestamp_to_close:i64)]
pub struct RegisterCollection<'info> {
    #[account(
        init,
        seeds = ["auction".as_bytes(),name.as_bytes()],
        bump,
        payer = creator,
        space = 8+32+8
    )]
    pub auction: Account<'info, Auction>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name:String, nft_id:u16)]
pub struct Bid<'info> {
    #[account(
        seeds = ["auction".as_bytes(),name.as_bytes()],
        bump,
    )]
    pub auction: Account<'info, Auction>,
    #[account(
        init_if_needed,
        seeds = ["nft-auction".as_bytes(),name.as_bytes(),&nft_id.to_be_bytes()],
        bump,
        payer = bidder,
        space = 8+2+32+8
    )]
    pub nft_auction: Account<'info, NftAuction>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name:String, nft_id:u16)]
pub struct Claim<'info> {
    #[account(
        seeds = ["auction".as_bytes(),name.as_bytes()],
        bump
    )]
    pub auction: Account<'info, Auction>,
    #[account(
        seeds = ["nft-auction".as_bytes(),name.as_bytes(),&nft_id.to_be_bytes()],
        bump,
    )]
    pub nft_auction: Account<'info, NftAuction>,
    // #[account(mut)]
    // pub token: Account<'info, Mint>,
    // #[account(
    //     init,
    //     payer = claimer,
    //     associated_token::mint = token,
    //     associated_token::authority = claimer,
    // )]
    // pub receiver_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub claimer: Signer<'info>,
    pub system_program: Program<'info, System>,
    // pub token_program: Program<'info, Token>,
    //pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
#[derive(Default)]
pub struct Auction {
    pub creator: Pubkey,
    pub timestamp_to_close: i64,
}

#[account]
#[derive(Default)]
pub struct NftAuction {
    pub nft_id: u16,
    pub bidder: Pubkey,
    pub price: u64, //in lamports
}
