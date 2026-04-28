use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use strand_score::program::StrandScore;

declare_id!("DFb1tb7GHPYaswdhjM2JA4HpHjnCzxJcRZEXzyAvmJ1q");

#[program]
pub mod strand_core {
    use super::*;

    pub fn initialize_worker_profile(ctx: Context<InitializeWorkerProfile>) -> Result<()> {
        let worker_profile = &mut ctx.accounts.worker_profile;
        worker_profile.worker = ctx.accounts.worker.key();
        worker_profile.jobs_completed = 0;
        worker_profile.total_earned_usdc = 0;
        worker_profile.unique_client_count = 0;
        worker_profile.on_time_completions = 0;
        worker_profile.ratings_sum = 0;
        worker_profile.created_at = Clock::get()?.unix_timestamp;
        worker_profile.bump = ctx.bumps.worker_profile;

        Ok(())
    }

    pub fn create_job(
        ctx: Context<CreateJob>,
        job_id: u64,
        amount_usdc: u64,
        skills_required: Vec<String>,
        work_hash: [u8; 32],
    ) -> Result<()> {
        require!(amount_usdc > 0, StrandCoreError::InvalidAmount);
        require!(skills_required.len() <= 8, StrandCoreError::TooManySkills);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.client_token_account.to_account_info(),
                    to: ctx.accounts.escrow_token_account.to_account_info(),
                    authority: ctx.accounts.client.to_account_info(),
                },
            ),
            amount_usdc,
        )?;

        let escrow = &mut ctx.accounts.escrow;
        escrow.client = ctx.accounts.client.key();
        escrow.worker = ctx.accounts.worker.key();
        escrow.job_id = job_id;
        escrow.amount_usdc = amount_usdc;
        escrow.work_hash = work_hash;
        escrow.state = JobState::Open;
        escrow.created_at = Clock::get()?.unix_timestamp;
        escrow.bump = ctx.bumps.escrow;

        emit!(WorkCreated {
            client: ctx.accounts.client.key(),
            worker: ctx.accounts.worker.key(),
            job_id,
            amount_usdc,
        });

        Ok(())
    }

    pub fn complete_job(
        ctx: Context<CompleteJob>,
        job_id: u64,
        deliverable_hash: [u8; 32],
        client_rating: u8,
    ) -> Result<()> {
        require!((1..=5).contains(&client_rating), StrandCoreError::InvalidRating);

        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.job_id == job_id, StrandCoreError::InvalidJobId);
        require!(escrow.state == JobState::Open, StrandCoreError::EscrowNotOpen);
        require_keys_eq!(escrow.client, ctx.accounts.client.key(), StrandCoreError::Unauthorized);
        require_keys_eq!(escrow.worker, ctx.accounts.worker.key(), StrandCoreError::Unauthorized);

        let signer_seeds: &[&[u8]] = &[
            b"escrow",
            escrow.client.as_ref(),
            &job_id.to_le_bytes(),
            &[escrow.bump],
        ];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.worker_token_account.to_account_info(),
                    authority: ctx.accounts.escrow.to_account_info(),
                },
                &[signer_seeds],
            ),
            escrow.amount_usdc,
        )?;

        let work_nft = &mut ctx.accounts.work_nft;
        work_nft.worker = ctx.accounts.worker.key();
        work_nft.client = ctx.accounts.client.key();
        work_nft.job_id = job_id;
        work_nft.amount_usdc = escrow.amount_usdc;
        work_nft.deliverable_hash = deliverable_hash;
        work_nft.skills = Vec::new();
        work_nft.client_rating = client_rating;
        work_nft.completed_at = Clock::get()?.unix_timestamp;
        work_nft.bump = ctx.bumps.work_nft;

        let worker_profile = &mut ctx.accounts.worker_profile;
        worker_profile.jobs_completed = worker_profile.jobs_completed.saturating_add(1);
        worker_profile.total_earned_usdc = worker_profile
            .total_earned_usdc
            .saturating_add(escrow.amount_usdc);
        worker_profile.unique_client_count = worker_profile.unique_client_count.saturating_add(1);
        worker_profile.on_time_completions = worker_profile.on_time_completions.saturating_add(1);
        worker_profile.ratings_sum = worker_profile
            .ratings_sum
            .saturating_add(u64::from(client_rating).saturating_mul(100));

        escrow.state = JobState::Closed;

        emit!(WorkCompleted {
            worker: ctx.accounts.worker.key(),
            client: ctx.accounts.client.key(),
            job_id,
            amount_usdc: escrow.amount_usdc,
            client_rating,
        });

        let cpi_program = ctx.accounts.score_program.to_account_info();
        let cpi_accounts = strand_score::cpi::accounts::ComputeScore {
            payer: ctx.accounts.client.to_account_info(),
            score_state: ctx.accounts.score_state.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        };
        let cpi_ctx =
            CpiContext::new(cpi_program, cpi_accounts).with_remaining_accounts(vec![
                ctx.accounts.worker_profile.to_account_info(),
            ]);
        strand_score::cpi::compute_score(cpi_ctx, ctx.accounts.worker.key())?;

        Ok(())
    }

    pub fn open_dispute(ctx: Context<OpenDispute>, job_id: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.job_id == job_id, StrandCoreError::InvalidJobId);
        require!(escrow.state == JobState::Open, StrandCoreError::EscrowNotOpen);

        let signer_key = ctx.accounts.signer.key();
        require!(
            signer_key == escrow.client || signer_key == escrow.worker,
            StrandCoreError::Unauthorized
        );

        escrow.state = JobState::Disputed;

        emit!(JobDisputed {
            job_id,
            raised_by: signer_key,
        });

        Ok(())
    }

    pub fn claim_skill(
        ctx: Context<ClaimSkill>,
        skill_tag: String,
        work_sample_url: String,
    ) -> Result<()> {
        require!(skill_tag.len() <= 64, StrandCoreError::SkillTagTooLong);
        require!(work_sample_url.len() <= 280, StrandCoreError::WorkSampleTooLong);

        emit!(SkillClaim {
            worker: ctx.accounts.worker.key(),
            skill_tag,
            work_sample_url,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeWorkerProfile<'info> {
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
#[instruction(job_id: u64)]
pub struct CreateJob<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    /// CHECK: Worker key is validated by PDA derivations and signatures on completion.
    pub worker: UncheckedAccount<'info>,
    #[account(
        init,
        payer = client,
        space = JobEscrow::LEN,
        seeds = [b"escrow", client.key().as_ref(), &job_id.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, JobEscrow>,
    #[account(
        init,
        payer = client,
        token::mint = usdc_mint,
        token::authority = escrow,
        seeds = [b"escrow_vault", client.key().as_ref(), &job_id.to_le_bytes()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = client_token_account.owner == client.key() @ StrandCoreError::Unauthorized,
        constraint = client_token_account.mint == usdc_mint.key() @ StrandCoreError::InvalidMint
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct CompleteJob<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(mut)]
    pub worker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", client.key().as_ref(), &job_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, JobEscrow>,
    #[account(
        mut,
        seeds = [b"escrow_vault", client.key().as_ref(), &job_id.to_le_bytes()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = worker_token_account.owner == worker.key() @ StrandCoreError::Unauthorized,
        constraint = worker_token_account.mint == usdc_mint.key() @ StrandCoreError::InvalidMint
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    pub usdc_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = client,
        space = WorkNFT::LEN,
        seeds = [b"work_nft", worker.key().as_ref(), &job_id.to_le_bytes()],
        bump
    )]
    pub work_nft: Account<'info, WorkNFT>,
    #[account(
        mut,
        seeds = [b"profile", worker.key().as_ref()],
        bump = worker_profile.bump
    )]
    pub worker_profile: Account<'info, WorkerProfile>,
    pub score_program: Program<'info, StrandScore>,
    /// CHECK: Created and validated by strand-score program during CPI.
    #[account(mut)]
    pub score_state: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct OpenDispute<'info> {
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.client.as_ref(), &job_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, JobEscrow>,
}

#[derive(Accounts)]
pub struct ClaimSkill<'info> {
    pub worker: Signer<'info>,
    #[account(
        seeds = [b"profile", worker.key().as_ref()],
        bump = worker_profile.bump
    )]
    pub worker_profile: Account<'info, WorkerProfile>,
}

#[account]
pub struct WorkerProfile {
    pub worker: Pubkey,
    pub jobs_completed: u64,
    pub total_earned_usdc: u64,
    pub unique_client_count: u32,
    pub on_time_completions: u64,
    pub ratings_sum: u64,
    pub created_at: i64,
    pub bump: u8,
}

impl WorkerProfile {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 4 + 8 + 8 + 8 + 1;
}

#[account]
pub struct WorkNFT {
    pub worker: Pubkey,
    pub client: Pubkey,
    pub job_id: u64,
    pub amount_usdc: u64,
    pub deliverable_hash: [u8; 32],
    pub skills: Vec<String>,
    pub client_rating: u8,
    pub completed_at: i64,
    pub bump: u8,
}

impl WorkNFT {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 32 + 4 + 200 + 1 + 8 + 1;
}

#[account]
pub struct JobEscrow {
    pub client: Pubkey,
    pub worker: Pubkey,
    pub job_id: u64,
    pub amount_usdc: u64,
    pub work_hash: [u8; 32],
    pub state: JobState,
    pub created_at: i64,
    pub bump: u8,
}

impl JobEscrow {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 32 + 1 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum JobState {
    Open,
    Disputed,
    Closed,
}

#[event]
pub struct WorkCreated {
    pub client: Pubkey,
    pub worker: Pubkey,
    pub job_id: u64,
    pub amount_usdc: u64,
}

#[event]
pub struct WorkCompleted {
    pub worker: Pubkey,
    pub client: Pubkey,
    pub job_id: u64,
    pub amount_usdc: u64,
    pub client_rating: u8,
}

#[event]
pub struct JobDisputed {
    pub job_id: u64,
    pub raised_by: Pubkey,
}

#[event]
pub struct SkillClaim {
    pub worker: Pubkey,
    pub skill_tag: String,
    pub work_sample_url: String,
}

#[error_code]
pub enum StrandCoreError {
    #[msg("Escrow is not open")]
    EscrowNotOpen,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid rating")]
    InvalidRating,
    #[msg("Unauthorized signer")]
    Unauthorized,
    #[msg("Invalid mint for token account")]
    InvalidMint,
    #[msg("Invalid job id")]
    InvalidJobId,
    #[msg("At most 8 required skills can be specified")]
    TooManySkills,
    #[msg("Skill tag is too long")]
    SkillTagTooLong,
    #[msg("Work sample URL is too long")]
    WorkSampleTooLong,
}
