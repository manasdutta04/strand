use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use strand_score::program::StrandScore;
use strand_score::ScoreState;

declare_id!("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

#[program]
pub mod strand_credit {
    use super::*;

    pub fn open_credit_line(
        ctx: Context<OpenCreditLine>,
        max_usdc: u64,
        annual_rate_bps: u16,
        min_score_required: u16,
    ) -> Result<()> {
        require!(max_usdc > 0, StrandCreditError::InvalidAmount);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.lender_token_account.to_account_info(),
                    to: ctx.accounts.lender_vault.to_account_info(),
                    authority: ctx.accounts.lender.to_account_info(),
                },
            ),
            max_usdc,
        )?;

        let credit_line = &mut ctx.accounts.credit_line;
        credit_line.lender = ctx.accounts.lender.key();
        credit_line.worker = ctx.accounts.worker.key();
        credit_line.max_usdc = max_usdc;
        credit_line.annual_rate_bps = annual_rate_bps;
        credit_line.min_score_required = min_score_required;
        credit_line.active = true;
        credit_line.bump = ctx.bumps.credit_line;

        Ok(())
    }

    pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
        require!(amount > 0, StrandCreditError::InvalidAmount);

        let worker_key = ctx.accounts.worker.key();
        require_keys_eq!(
            ctx.accounts.credit_line.worker,
            worker_key,
            StrandCreditError::WorkerMismatch
        );
        require!(ctx.accounts.credit_line.active, StrandCreditError::CreditLineInactive);

        if !ctx.remaining_accounts.is_empty() {
            let cpi_program = ctx.accounts.score_program.to_account_info();
            let cpi_accounts = strand_score::cpi::accounts::ComputeScore {
                payer: ctx.accounts.worker.to_account_info(),
                score_state: ctx.accounts.score_state.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            };
            let cpi_ctx =
                CpiContext::new(cpi_program, cpi_accounts).with_remaining_accounts(
                    ctx.remaining_accounts.to_vec(),
                );
            strand_score::cpi::compute_score(cpi_ctx, worker_key)?;
            ctx.accounts.score_state.reload()?;
        }

        require_keys_eq!(
            ctx.accounts.score_state.worker,
            worker_key,
            StrandCreditError::WorkerMismatch
        );
        require!(
            ctx.accounts.score_state.score >= ctx.accounts.credit_line.min_score_required,
            StrandCreditError::InsufficientScore
        );

        let existing_principal = ctx.accounts.loan_position.principal;
        let credit_limit = (ctx.accounts.score_state.score as u64)
            .saturating_mul(10)
            .saturating_mul(1_000_000);
        let remaining_limit = credit_limit.saturating_sub(existing_principal);
        require!(
            amount <= remaining_limit,
            StrandCreditError::BorrowExceedsCreditLimit
        );
        require!(
            amount <= ctx.accounts.lender_vault.amount,
            StrandCreditError::InsufficientVaultLiquidity
        );

        let lender_key = ctx.accounts.credit_line.lender;
        let signer_seeds: &[&[u8]] = &[
            b"credit_line",
            lender_key.as_ref(),
            worker_key.as_ref(),
            &[ctx.accounts.credit_line.bump],
        ];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.lender_vault.to_account_info(),
                    to: ctx.accounts.worker_token_account.to_account_info(),
                    authority: ctx.accounts.credit_line.to_account_info(),
                },
                &[signer_seeds],
            ),
            amount,
        )?;

        let loan_position = &mut ctx.accounts.loan_position;
        if loan_position.principal == 0 {
            loan_position.lender = lender_key;
            loan_position.worker = worker_key;
            loan_position.opened_at = Clock::get()?.unix_timestamp;
            loan_position.bump = ctx.bumps.loan_position;
        }
        loan_position.principal = existing_principal.saturating_add(amount);

        emit!(Borrowed {
            worker: worker_key,
            lender: lender_key,
            amount,
            new_principal: loan_position.principal,
        });

        Ok(())
    }

    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        require!(amount > 0, StrandCreditError::InvalidAmount);
        require_keys_eq!(
            ctx.accounts.loan_position.worker,
            ctx.accounts.worker.key(),
            StrandCreditError::WorkerMismatch
        );
        require_keys_eq!(
            ctx.accounts.loan_position.lender,
            ctx.accounts.credit_line.lender,
            StrandCreditError::LenderMismatch
        );

        let loan_position = &mut ctx.accounts.loan_position;
        require!(
            amount <= loan_position.principal,
            StrandCreditError::RepayExceedsPrincipal
        );

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.worker_token_account.to_account_info(),
                    to: ctx.accounts.lender_vault.to_account_info(),
                    authority: ctx.accounts.worker.to_account_info(),
                },
            ),
            amount,
        )?;

        loan_position.principal = loan_position.principal.saturating_sub(amount);
        let remaining_principal = loan_position.principal;

        if remaining_principal == 0 {
            ctx.accounts
                .loan_position
                .close(ctx.accounts.worker.to_account_info())?;
        }

        emit!(Repaid {
            worker: ctx.accounts.worker.key(),
            lender: ctx.accounts.credit_line.lender,
            amount,
            remaining_principal,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct OpenCreditLine<'info> {
    #[account(mut)]
    pub lender: Signer<'info>,
    /// CHECK: Worker pubkey is carried in PDA seeds and validated in downstream instructions.
    pub worker: UncheckedAccount<'info>,
    #[account(
        init,
        payer = lender,
        space = CreditLine::LEN,
        seeds = [b"credit_line", lender.key().as_ref(), worker.key().as_ref()],
        bump
    )]
    pub credit_line: Account<'info, CreditLine>,
    #[account(
        init,
        payer = lender,
        token::mint = usdc_mint,
        token::authority = credit_line,
        seeds = [b"lender_vault", lender.key().as_ref(), worker.key().as_ref()],
        bump
    )]
    pub lender_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = lender_token_account.owner == lender.key() @ StrandCreditError::Unauthorized,
        constraint = lender_token_account.mint == usdc_mint.key() @ StrandCreditError::InvalidMint
    )]
    pub lender_token_account: Account<'info, TokenAccount>,
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,
    /// CHECK: Lender pubkey must match credit line lender.
    pub lender: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"credit_line", lender.key().as_ref(), worker.key().as_ref()],
        bump = credit_line.bump,
        constraint = credit_line.lender == lender.key() @ StrandCreditError::LenderMismatch
    )]
    pub credit_line: Account<'info, CreditLine>,
    #[account(
        mut,
        seeds = [b"lender_vault", lender.key().as_ref(), worker.key().as_ref()],
        bump
    )]
    pub lender_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = worker_token_account.owner == worker.key() @ StrandCreditError::Unauthorized,
        constraint = worker_token_account.mint == usdc_mint.key() @ StrandCreditError::InvalidMint
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = score_state.worker == worker.key() @ StrandCreditError::WorkerMismatch
    )]
    pub score_state: Account<'info, ScoreState>,
    #[account(
        init_if_needed,
        payer = worker,
        space = LoanPosition::LEN,
        seeds = [b"loan", lender.key().as_ref(), worker.key().as_ref()],
        bump
    )]
    pub loan_position: Account<'info, LoanPosition>,
    pub usdc_mint: Account<'info, Mint>,
    pub score_program: Program<'info, StrandScore>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,
    /// CHECK: Lender pubkey must match credit line lender.
    pub lender: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"credit_line", lender.key().as_ref(), worker.key().as_ref()],
        bump = credit_line.bump,
        constraint = credit_line.lender == lender.key() @ StrandCreditError::LenderMismatch
    )]
    pub credit_line: Account<'info, CreditLine>,
    #[account(
        mut,
        seeds = [b"lender_vault", lender.key().as_ref(), worker.key().as_ref()],
        bump
    )]
    pub lender_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = worker_token_account.owner == worker.key() @ StrandCreditError::Unauthorized,
        constraint = worker_token_account.mint == lender_vault.mint @ StrandCreditError::InvalidMint
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"loan", lender.key().as_ref(), worker.key().as_ref()],
        bump = loan_position.bump
    )]
    pub loan_position: Account<'info, LoanPosition>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct CreditLine {
    pub lender: Pubkey,
    pub worker: Pubkey,
    pub max_usdc: u64,
    pub annual_rate_bps: u16,
    pub min_score_required: u16,
    pub active: bool,
    pub bump: u8,
}

impl CreditLine {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 2 + 2 + 1 + 1;
}

#[account]
pub struct LoanPosition {
    pub lender: Pubkey,
    pub worker: Pubkey,
    pub principal: u64,
    pub opened_at: i64,
    pub bump: u8,
}

impl LoanPosition {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1;
}

#[event]
pub struct Borrowed {
    pub worker: Pubkey,
    pub lender: Pubkey,
    pub amount: u64,
    pub new_principal: u64,
}

#[event]
pub struct Repaid {
    pub worker: Pubkey,
    pub lender: Pubkey,
    pub amount: u64,
    pub remaining_principal: u64,
}

#[error_code]
pub enum StrandCreditError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Unauthorized signer")]
    Unauthorized,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Credit line is inactive")]
    CreditLineInactive,
    #[msg("Worker mismatch")]
    WorkerMismatch,
    #[msg("Lender mismatch")]
    LenderMismatch,
    #[msg("Score is below the lender's minimum requirement")]
    InsufficientScore,
    #[msg("Requested borrow exceeds available credit limit")]
    BorrowExceedsCreditLimit,
    #[msg("Lender vault has insufficient liquidity")]
    InsufficientVaultLiquidity,
    #[msg("Repay amount exceeds current principal")]
    RepayExceedsPrincipal,
}
