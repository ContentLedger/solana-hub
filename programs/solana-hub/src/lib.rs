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
        nft_list: Vec<NftMetadata>,
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
        else{
            //TODO: return error
        }
        Ok(())
    }

    //This method tries to pay back the prev bidder
    //It has a "bug" that we dont want to consider in this mvp
    //that is, if the prev bidder transfer out its rent
    //the payment will fail and in some way
    //it will not allow others to bid because the tx will fail
    pub fn bid(ctx: Context<Bid>, _name: String, _nft_id: u16, bid_amount:u64) -> Result<()> {

        let get_clock = Clock::get();
        if let Ok(clock) = get_clock {
            let current_timestamp = clock.unix_timestamp;
            if current_timestamp>ctx.accounts.auction.timestamp_to_close{
                //TODO change for an error, bids are not allowed anymore, auction is closed
                return Ok(());
            }

            let prev_nft_auction_bidder = ctx.accounts.nft_auction.bidder;

            if prev_nft_auction_bidder == ctx.accounts.bidder.key() {
                return Ok(())//The auction is already of the bidder
            }

            let prev_nft_auction_bid_in_lamports = ctx.accounts.nft_auction.get_lamports();
            
            if bid_amount<=prev_nft_auction_bid_in_lamports{
                //TODO change for an error, the bid can not be equals or lower
                return Ok(())
            }

            //Is need to check the bidder, because if someone transfer lamports to the pda
            //could break this
            if  prev_nft_auction_bidder!=Pubkey::default() && prev_nft_auction_bid_in_lamports > 0{

                if prev_nft_auction_bidder != ctx.accounts.previous_bidder.key() {
                    //TODO return the previous bidder PASSED is invalid
                    return Ok(());
                }

            }

            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.bidder.key(),
                &ctx.accounts.nft_auction.key(),
                bid_amount,
            );

            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.bidder.to_account_info(),
                    ctx.accounts.nft_auction.to_account_info(),
                ],
            )?;

            //Had to execute this after the transfer
            //because the prev transfer and this transfer with borrow 
            //uses the same account
            if  prev_nft_auction_bidder!=Pubkey::default() && prev_nft_auction_bid_in_lamports > 0{
            **ctx
                    .accounts
                    .nft_auction
                    .to_account_info()
                    .try_borrow_mut_lamports()? -= prev_nft_auction_bid_in_lamports;
                **ctx
                    .accounts
                    .previous_bidder
                    .to_account_info()
                    .try_borrow_mut_lamports()? += prev_nft_auction_bid_in_lamports;

            }
            ctx.accounts.nft_auction.bidder=ctx.accounts.bidder.key();
        }
        else{
            //TODO: return error
        }
        
        return Ok(())
    }

    // Currently, the creator receives their payment only when the NFT is claimed.
    // This approach may pose an issue if the bidder never claims the NFT, potentially
    // leaving the creator unpaid. To address this, we plan to implement a mechanism
    // that allows the creator to collect the funds raised independently of the NFT
    // claim process, ensuring that the creator receives their payment regardless of
    // whether the NFT is claimed.
    pub fn claim(ctx: Context<Claim>, name: String, nft_id: u16) -> Result<()> {
        
        let get_clock = Clock::get();
        if let Ok(clock) = get_clock {

            let current_timestamp = clock.unix_timestamp;
            if current_timestamp<=ctx.accounts.auction.timestamp_to_close{
                //TODO change for an error, can not claim until the auction is closed
                return Ok(());
            }

            require!((nft_id as usize) <= ctx.accounts.auction.nft_list.len(), ErrorCode::InvalidNftId);
        
            let metadata = ctx.accounts.auction.nft_list.get(nft_id as usize-1);

            let nft_name =  metadata.unwrap().name.clone();
            let symbol =  metadata.unwrap().symbol.clone();
            let uri = metadata.unwrap().uri.clone();
    
            let nft_data: DataV2 = DataV2 {
                name: nft_name,
                symbol, 
                uri,                        
                seller_fee_basis_points: 3,
                creators: None,   //TODO: [ctx.accounts.auction.creator.key()],
                collection: None, //TODO: See how to put all the nfts under the same collection
                uses: None,
            };
    
            let nft_signer_seeds = &[
                "nft".as_bytes(),
                name.as_bytes(),
                "*".as_bytes(),
                &nft_id.to_le_bytes(),
                &[ctx.bumps.nft],
            ];
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
    
            create_metadata_accounts_v3(metadata_ctx, nft_data, false, true, None)?;
    
            mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    MintTo {
                        authority: ctx.accounts.nft.to_account_info(),
                        to: ctx.accounts.receiver_account.to_account_info(),
                        mint: ctx.accounts.nft.to_account_info(),
                    },
                    &nft_signer,
                ),
                1,
            )?;
            ctx.accounts.nft_auction.bidder=Pubkey::default();
        }
        else{
              //TODO: return error
        }
        

        Ok(())
    }

    //TODO: The creator who register the collection needs a method
    //to claim all the funds from the nft_auctions pdas
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
#[instruction(name:String, nft_id:u16, bid_amount:u64)]
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
    /// CHECK: Can be warever
    #[account(mut)]
    pub previous_bidder: UncheckedAccount<'info>,
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
        mut,
        seeds = ["nft_auction".as_bytes(),name.as_bytes(),"*".as_bytes(),&nft_id.to_le_bytes()],
        bump,
        constraint = nft_auction.bidder.key() == claimer.key()
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
        init_if_needed,
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

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone)]
pub struct NftMetadata {
    pub uri: String,
    pub name: String,
    pub symbol: String,
}

#[account]
#[derive(Default)]
pub struct Auction {
    pub creator: Pubkey,
    pub timestamp_to_close: i64,
    pub nft_list: Vec<NftMetadata>,
}

impl Auction {
    //up to 10 nfts
    //length nft_list string up to 63
    pub const MAX_SIZE: usize = 8 + 32 + 8 + (4 + 10 * (4 + 63));
}

#[account]
#[derive(Default)]
pub struct NftAuction {
    pub bidder: Pubkey,
}

impl NftAuction {
    pub const MAX_SIZE: usize = 8 + 32;
}

#[error_code]
pub enum ErrorCode {
    #[msg("NFT ID invalid")]
    InvalidNftId,
}