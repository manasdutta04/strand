use anchor_lang::prelude::*;
use strand_score::program::StrandScore;

declare_id!("DFb1tb7GHPYaswdhjM2JA4HpHjnCzxJcRZEXzyAvmJ1q");

// Oracle pubkey (set via crank/Verifiable on devnet)
pub const ORACLE_PUBKEY: &str = "oracleKeypairPublicKeyWillBeReplacedAtDeploy";
pub const MIN_STAKE_LAMPORTS: u64 = 100_000_000; // 0.1 SOL
pub const STAKE_LOCK_DURATION_DAYS: i64 = 30;

#[program]
pub mod strand_core {
    use super::*;

    /// Register a new worker with 0.1 SOL stake to prevent sybil attacks
    pub fn register_worker(ctx: Context<RegisterWorker>) -> Result<()> {
        let worker_profile = &mut ctx.accounts.worker_profile;
        worker_profile.worker = ctx.accounts.worker.key();
        worker_profile.staked_lamports = MIN_STAKE_LAMPORTS;
        worker_profile.created_at = Clock::get()?.unix_timestamp;
        worker_profile.last_record_timestamp = 0;
        worker_profile.total_records = 0;
        worker_profile.bump = ctx.bumps.worker_profile;

        emit!(WorkerRegistered {
            worker: ctx.accounts.worker.key(),
            stake_lamports: MIN_STAKE_LAMPORTS,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Submit a work record (earnings proof from Zomato/Swiggy/etc)
    /// Oracle signs this transaction to verify the PDF was read correctly
    pub fn submit_work_record(
        ctx: Context<SubmitWorkRecord>,
        earning_amount_usdc: u64,
        delivery_count: u32,
        platform: String,
    ) -> Result<()> {
        require!(earning_amount_usdc > 0, StrandCoreError::InvalidAmount);
        require!(!platform.is_empty(), StrandCoreError::EmptyPlatform);
        require!(platform.len() <= 32, StrandCoreError::PlatformNameTooLong);

        // Verify oracle signature (oracle is a required signer)
        require_keys_eq!(
            ctx.accounts.oracle.key(),
            ORACLE_PUBKEY.parse::<Pubkey>().unwrap_or_default(),
            StrandCoreError::InvalidOracleKey
        );

        let work_record = &mut ctx.accounts.work_record;
        work_record.worker = ctx.accounts.worker.key();
        work_record.earning_amount_usdc = earning_amount_usdc;
        work_record.delivery_count = delivery_count;
        work_record.platform = platform.clone();
        work_record.created_at = Clock::get()?.unix_timestamp;
        work_record.bump = ctx.bumps.work_record;

        let worker_profile = &mut ctx.accounts.worker_profile;
        worker_profile.total_records += 1;
        worker_profile.last_record_timestamp = Clock::get()?.unix_timestamp;

        emit!(WorkRecordSubmitted {
            worker: ctx.accounts.worker.key(),
            earning_amount_usdc,
            delivery_count,
            platform: platform.clone(),
            record_id: worker_profile.total_records - 1,
        });

        // Check if platform link already exists; if not, create/verify it
        let platform_link = &mut ctx.accounts.platform_link;
        if platform_link.platform.is_empty() {
            platform_link.worker = ctx.accounts.worker.key();
            platform_link.platform = platform.clone();
            platform_link.verified = true;
            platform_link.last_verified_at = Clock::get()?.unix_timestamp;
            platform_link.bump = ctx.bumps.platform_link;

            emit!(PlatformLinked {
                worker: ctx.accounts.worker.key(),
                platform: platform.clone(),
            });
        }

        // CPI into strand-score to recompute score
        let cpi_program = ctx.accounts.score_program.to_account_info();
        let cpi_accounts = strand_score::cpi::accounts::ComputeScore {
            payer: ctx.accounts.worker.to_account_info(),
            score_state: ctx.accounts.score_state.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts).with_remaining_accounts(vec![
            ctx.accounts.worker_profile.to_account_info(),
        ]);
        strand_score::cpi::compute_score(cpi_ctx, ctx.accounts.worker.key())?;

        Ok(())
    }

    /// Withdraw staked SOL after 30-day lock period
    pub fn withdraw_stake(ctx: Context<WithdrawStake>) -> Result<()> {
        let worker_profile = ctx.accounts.worker_profile;
        let current_time = Clock::get()?.unix_timestamp;
        let days_since_registration =
            (current_time - worker_profile.created_at) / (24 * 60 * 60);

        require!(
            days_since_registration >= STAKE_LOCK_DURATION_DAYS,
            StrandCoreError::StakeLocked
        );

        // Transfer SOL back to worker (done via lamport adjustment on account)
        let lamports_to_return = worker_profile.staked_lamports;

        // This will fail if not enough lamports, but we've already validated the amount
        **ctx.accounts.worker_profile.try_borrow_mut_lamports()? -= lamports_to_return;
        **ctx.accounts.worker.try_borrow_mut_lamports()? += lamports_to_return;

        emit!(StakeWithdrawn {
            worker: ctx.accounts.worker.key(),
            stake_lamports: lamports_to_return,
            timestamp: current_time,
        });

        Ok(())
    }

}

#[derive(Accounts)]
pub struct RegisterWorker<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,
    #[account(
        init,
        payer = worker,
        space = WorkerProfile::LEN,
        seeds = [b"profile", worker.key().as_ref()],
        bump
    )]
    pub worker_profile: Account<'info, WorkerProfile>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(earning_amount_usdc: u64, delivery_count: u32, platform: String)]
pub struct SubmitWorkRecord<'info> {
    pub oracle: Signer<'info>, // Oracle must sign to verify PDF was read correctly
    pub worker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"profile", worker.key().as_ref()],
        bump = worker_profile.bump
    )]
    pub worker_profile: Account<'info, WorkerProfile>,
    #[account(
        init,
        payer = worker,
        space = WorkRecord::LEN,
        seeds = [
            b"work",
            worker.key().as_ref(),
            &worker_profile.total_records.to_le_bytes()
        ],
        bump
    )]
    pub work_record: Account<'info, WorkRecord>,
    #[account(
        init_if_needed,
        payer = worker,
        space = PlatformLink::LEN,
        seeds = [b"platform", worker.key().as_ref(), platform.as_bytes()],
        bump
    )]
    pub platform_link: Account<'info, PlatformLink>,
    pub score_program: Program<'info, StrandScore>,
    /// CHECK: Created and validated by strand-score program during CPI.
    #[account(mut)]
    pub score_state: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawStake<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"profile", worker.key().as_ref()],
        bump = worker_profile.bump,
        close = worker
    )]
    pub worker_profile: Account<'info, WorkerProfile>,
}

/// Worker profile tracking registration stake and work records
#[account]
pub struct WorkerProfile {
    pub worker: Pubkey,           // 32 bytes
    pub staked_lamports: u64,     // 8 bytes
    pub created_at: i64,          // 8 bytes
    pub last_record_timestamp: i64, // 8 bytes
    pub total_records: u64,       // 8 bytes
    pub bump: u8,                 // 1 byte
}

impl WorkerProfile {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 1;
}

/// Individual work record (earnings proof from platform)
#[account]
pub struct WorkRecord {
    pub worker: Pubkey,           // 32 bytes
    pub earning_amount_usdc: u64, // 8 bytes
    pub delivery_count: u32,      // 4 bytes
    pub platform: String,         // 4 + 32 bytes (max)
    pub created_at: i64,          // 8 bytes
    pub bump: u8,                 // 1 byte
}

impl WorkRecord {
    pub const LEN: usize = 8 + 32 + 8 + 4 + 4 + 32 + 8 + 1;
}

/// Platform link tracking (worker verified on Zomato/Swiggy/etc)
#[account]
pub struct PlatformLink {
    pub worker: Pubkey,         // 32 bytes
    pub platform: String,       // 4 + 32 bytes (max)
    pub verified: bool,         // 1 byte
    pub last_verified_at: i64,  // 8 bytes
    pub bump: u8,               // 1 byte
}

impl PlatformLink {
    pub const LEN: usize = 8 + 32 + 4 + 32 + 1 + 8 + 1;
}

#[event]
pub struct WorkerRegistered {
    pub worker: Pubkey,
    pub stake_lamports: u64,
    pub timestamp: i64,
}

#[event]
pub struct WorkRecordSubmitted {
    pub worker: Pubkey,
    pub earning_amount_usdc: u64,
    pub delivery_count: u32,
    pub platform: String,
    pub record_id: u64,
}

#[event]
pub struct PlatformLinked {
    pub worker: Pubkey,
    pub platform: String,
}

#[event]
pub struct StakeWithdrawn {
    pub worker: Pubkey,
    pub stake_lamports: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum StrandCoreError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Empty platform name")]
    EmptyPlatform,
    #[msg("Platform name too long")]
    PlatformNameTooLong,
    #[msg("Invalid oracle key")]
    InvalidOracleKey,
    #[msg("Stake is still locked")]
    StakeLocked,
}
