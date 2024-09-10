use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
        Metadata as Metaplex,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

declare_id!("EsE5KPaDVc5wrrmJSDCUbaWSds35x56A3XkDUKkexHb6");

#[program]
pub mod solana_hub {
    use std::ops::Add;

    use super::*;

    pub fn register_collection(
        ctx: Context<RegisterCollection>,
        _name: String,
        seconds_to_close: u64,
        nft_list: Vec<String>,
    ) -> Result<()> {
        let get_clock = Clock::get();
        if let Ok(clock) = get_clock {
            let current_timestamp = clock.unix_timestamp;
            ctx.accounts.auction.creator = ctx.accounts.creator.key();
            let timestamp_to_close = current_timestamp.add(seconds_to_close as i64);
            ctx.accounts.auction.timestamp_to_close = timestamp_to_close;
            ctx.accounts.auction.nft_list = nft_list;
            msg!("{0} and {1}", current_timestamp, timestamp_to_close,);
        }
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

        if nft_id as usize > ctx.accounts.auction.nft_list.len() {
            return Ok(()); //TODO: Throw error
        }

        let uri = ctx
            .accounts
            .auction
            .nft_list
            .get(nft_id as usize - 1)
            .unwrap()
            .to_string();

        let nft_data: DataV2 = DataV2 {
            name: name.clone(),
            symbol: String::from("PRB"), //TODO: Change this with metadata.name
            uri,                         //TODO: Change this with metadata.symbol
            seller_fee_basis_points: 3,
            creators: None,   //TODO: [ctx.accounts.auction.creator.key()],
            collection: None, //TODO: See how to put all the nfts under the same collection
            uses: None,
        };

        let nft_signer_seeds = &["nft".as_bytes(), name.as_bytes(), &nft_id.to_le_bytes()];
        let nft_signer = [&nft_signer_seeds[..]];
        let metadata_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                payer: ctx.accounts.claimer.to_account_info(),
                update_authority: ctx.accounts.nft.to_account_info(),
                mint: ctx.accounts.nft.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                mint_authority: ctx.accounts.nft.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &nft_signer,
        );

        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    authority: ctx.accounts.nft.to_account_info(),
                    to: ctx.accounts.claimer.to_account_info(),
                    mint: ctx.accounts.nft.to_account_info(),
                },
                &nft_signer,
            ),
            1,
        )?;

        create_metadata_accounts_v3(metadata_ctx, nft_data, false, true, None)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name:String, seconds_to_close:u64, nft_list:Vec<String>)]
pub struct RegisterCollection<'info> {
    #[account(
        init,
        seeds = ["auction".as_bytes(),name.as_bytes()],
        bump,
        payer = creator,
        space = Auction::MAX_SIZE
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
        constraint = !name.contains("*"),
        seeds = ["nft_auction".as_bytes(),name.as_bytes(),"*".as_bytes(),&nft_id.to_le_bytes()],
        bump,
        payer = bidder,
        space = NftAuction::MAX_SIZE,
    )]
    pub nft_auction: Account<'info, NftAuction>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name:String, nft_id:u16)]
pub struct Claim<'info> {
    /// CHECK: New Metaplex Account being created
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    #[account(
        seeds = ["auction".as_bytes(),name.as_bytes()],
        bump
    )]
    pub auction: Account<'info, Auction>,
    #[account(
        init_if_needed,//this because maybe none bid but we need to check into it
        constraint = !name.contains("*"),//To avoid collisions  name: name, nft_id: 11 and name: name1 nft_id:1
        seeds = ["nft_auction".as_bytes(),name.as_bytes(),"*".as_bytes(),&nft_id.to_le_bytes()],
        bump,
        payer=claimer,
        space = NftAuction::MAX_SIZE,
        //TODO: Uncomment this
        //constraint = nft_auction.bidder.key() == claimer.key()
    )]
    pub nft_auction: Account<'info, NftAuction>,
    #[account(
        init,
        constraint = !name.contains("*"),//To avoid collisions  name: name, nft_id: 11 and name: name1 nft_id:1
        seeds = ["nft".as_bytes(),name.as_bytes(),"*".as_bytes(),&nft_id.to_le_bytes()],
        bump,
        payer = claimer,
        mint::decimals = 0,
        mint::authority = nft,
    )]
    pub nft: Account<'info, Mint>,
    #[account(
        init,
        payer = claimer,
        associated_token::mint = nft,
        associated_token::authority = claimer,
    )]
    pub receiver_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub claimer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metaplex>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
#[derive(Default)]
pub struct Auction {
    pub creator: Pubkey,
    pub timestamp_to_close: i64,
    pub nft_list: Vec<String>, //TODO: Vec<struct with metadata (uri, name, symbol)>
}

impl Auction {
    //up to 10 nfts
    //length nft_list string up to 63
    pub const MAX_SIZE: usize = 8 + 32 + 8 + (4 + 10 * (4 + 63));
}

#[account]
#[derive(Default)]
pub struct NftAuction {
    pub nft_id: u16,
    pub bidder: Pubkey,
    pub price: u64, //in lamports
}

impl NftAuction {
    pub const MAX_SIZE: usize = 8 + 2 + 32 + 8;
}
