use anchor_lang::prelude::*;

declare_id!("68LstwZhYt14pDyVtzLKQ9yfXntNDauhAaH5TMQD1fRj");

#[program]
pub mod solana_hub {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
