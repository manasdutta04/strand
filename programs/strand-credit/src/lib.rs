use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use strand_score::program::StrandScore;

declare_id!("AVSZ1XY45nhYtcqUMUboHhXLLoR2hzSGz95oCRqbyn7x");

pub const MIN_CREDIT_SCORE: u16 = 400;
pub const ANNUAL_RATE_BPS: u16 = 1200; // 12% APR

#[program]
pub mod strand_credit {
    use super::*;

    /// Initialize the protocol vault (admin-only for MVP)
    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.protocol_vault;
        vault.total_usdc_deposited = 0;
        vault.total_usdc_loaned = 0;
        vault.created_at = Clock::get()?.unix_timestamp;
        vault.bump = ctx.bumps.protocol_vault;

        emit!(VaultInitialized {
            created_at: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Fund the protocol vault (can be called by anyone/lenders)
    pub fn fund_vault(ctx: Context<FundVault>, amount: u64) -> Result<()> {
        require!(amount > 0, StrandCreditError::InvalidAmount);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.funder_token_account.to_account_info(),
                    to: ctx.accounts.vault_token_account.to_account_info(),
                    authority: ctx.accounts.funder.to_account_info(),
                },
            ),
            amount,
        )?;

        let vault = &mut ctx.accounts.protocol_vault;
        vault.total_usdc_deposited = vault.total_usdc_deposited.saturating_add(amount);

        emit!(VaultFunded {
            funder: ctx.accounts.funder.key(),
            amount,
            new_total: vault.total_usdc_deposited,
        });

        Ok(())
    }

    /// Open a credit line for a worker (worker-initiated)
    pub fn open_credit_line(ctx: Context<OpenCreditLine>) -> Result<()> {
        let worker_key = ctx.accounts.worker.key();

        // Recompute score if needed
        if !ctx.remaining_accounts.is_empty() {
            let cpi_program = ctx.accounts.score_program.to_account_info();
            let cpi_accounts = strand_score::cpi::accounts::ComputeScore {
                payer: ctx.accounts.worker.to_account_info(),
                score_state: ctx.accounts.score_state.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            };
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts)
                .with_remaining_accounts(ctx.remaining_accounts.to_vec());
            strand_score::cpi::compute_score(cpi_ctx, worker_key)?;
            ctx.accounts.score_state.reload()?;
        }

        require_keys_eq!(
            ctx.accounts.score_state.worker,
            worker_key,
            StrandCreditError::WorkerMismatch
        );
        require!(
            ctx.accounts.score_state.total_score >= MIN_CREDIT_SCORE,
            StrandCreditError::InsufficientScore
        );

        let credit_line = &mut ctx.accounts.credit_line;
        credit_line.worker = worker_key;
        credit_line.score_at_opening = ctx.accounts.score_state.total_score;
        credit_line.opened_at = Clock::get()?.unix_timestamp;
        credit_line.bump = ctx.bumps.credit_line;

        // Calculate credit limit per D-011: (score - 400) × $10 USDC
        let credit_limit_usdc = (ctx.accounts.score_state.total_score as u64)
            .saturating_sub(MIN_CREDIT_SCORE as u64)
            .saturating_mul(10)
            .saturating_mul(1_000_000); // convert to 6-decimal USDC

        emit!(CreditLineOpened {
            worker: worker_key,
            score: ctx.accounts.score_state.total_score,
            credit_limit_usdc,
            opened_at: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Borrow against credit line from protocol vault
    pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
        require!(amount > 0, StrandCreditError::InvalidAmount);

        let worker_key = ctx.accounts.worker.key();
        let credit_line = &ctx.accounts.credit_line;
        require_keys_eq!(
            credit_line.worker,
            worker_key,
            StrandCreditError::WorkerMismatch
        );

        // Calculate credit limit: (score_at_opening - 400) × $10
        let credit_limit_usdc = (credit_line.score_at_opening as u64)
            .saturating_sub(MIN_CREDIT_SCORE as u64)
            .saturating_mul(10)
            .saturating_mul(1_000_000);

        let loan_position = &ctx.accounts.loan_position;
        let existing_principal = loan_position.principal;
        let remaining_limit = credit_limit_usdc.saturating_sub(existing_principal);

        require!(
            amount <= remaining_limit,
            StrandCreditError::BorrowExceedsCreditLimit
        );
        require!(
            amount <= ctx.accounts.vault_token_account.amount,
            StrandCreditError::InsufficientVaultLiquidity
        );

        let vault = &ctx.accounts.protocol_vault;
        let signer_seeds: &[&[u8]] = &[b"vault", &[vault.bump]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    to: ctx.accounts.worker_token_account.to_account_info(),
                    authority: ctx.accounts.protocol_vault.to_account_info(),
                },
                &[signer_seeds],
            ),
            amount,
        )?;

        let loan_position_mut = &mut ctx.accounts.loan_position;
        if loan_position_mut.principal == 0 {
            loan_position_mut.worker = worker_key;
            loan_position_mut.borrowed_at = Clock::get()?.unix_timestamp;
            loan_position_mut.bump = ctx.bumps.loan_position;
        }
        loan_position_mut.principal = existing_principal.saturating_add(amount);

        // Update vault total loaned
        let protocol_vault = &mut ctx.accounts.protocol_vault;
        protocol_vault.total_usdc_loaned = protocol_vault.total_usdc_loaned.saturating_add(amount);

        emit!(Borrowed {
            worker: worker_key,
            amount,
            new_principal: loan_position_mut.principal,
            credit_limit_usdc,
        });

        Ok(())
    }

    /// Repay loan to protocol vault
    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        require!(amount > 0, StrandCreditError::InvalidAmount);

        let worker_key = ctx.accounts.worker.key();
        require_keys_eq!(
            ctx.accounts.loan_position.worker,
            worker_key,
            StrandCreditError::WorkerMismatch
        );

        let loan_position = &ctx.accounts.loan_position;
        require!(
            amount <= loan_position.principal,
            StrandCreditError::RepayExceedsPrincipal
        );

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.worker_token_account.to_account_info(),
                    to: ctx.accounts.vault_token_account.to_account_info(),
                    authority: ctx.accounts.worker.to_account_info(),
                },
            ),
            amount,
        )?;

        let loan_position_mut = &mut ctx.accounts.loan_position;
        loan_position_mut.principal = loan_position_mut.principal.saturating_sub(amount);
        loan_position_mut.last_repaid_at = Clock::get()?.unix_timestamp;

        let protocol_vault = &mut ctx.accounts.protocol_vault;
        protocol_vault.total_usdc_loaned = protocol_vault.total_usdc_loaned.saturating_sub(amount);

        emit!(Repaid {
            worker: worker_key,
            amount,
            remaining_principal: loan_position_mut.principal,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = ProtocolVault::LEN,
        seeds = [b"vault"],
        bump
    )]
    pub protocol_vault: Account<'info, ProtocolVault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundVault<'info> {
    #[account(mut)]
    pub funder: Signer<'info>,
    #[account(mut)]
    pub protocol_vault: Account<'info, ProtocolVault>,
    #[account(
        mut,
        constraint = funder_token_account.owner == funder.key() @ StrandCreditError::Unauthorized,
        constraint = funder_token_account.mint == usdc_mint.key() @ StrandCreditError::InvalidMint
    )]
    pub funder_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault_token", b"usdc"],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct OpenCreditLine<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,
    #[account(
        init,
        payer = worker,
        space = CreditLine::LEN,
        seeds = [b"credit", worker.key().as_ref()],
        bump
    )]
    pub credit_line: Account<'info, CreditLine>,
    pub protocol_vault: Account<'info, ProtocolVault>,
    #[account(
        mut,
        constraint = score_state.worker == worker.key() @ StrandCreditError::WorkerMismatch
    )]
    pub score_state: Account<'info, ScoreState>,
    pub score_program: Program<'info, StrandScore>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"credit", worker.key().as_ref()],
        bump = credit_line.bump
    )]
    pub credit_line: Account<'info, CreditLine>,
    pub protocol_vault: Account<'info, ProtocolVault>,
    #[account(
        mut,
        seeds = [b"vault_token", b"usdc"],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = worker_token_account.owner == worker.key() @ StrandCreditError::Unauthorized
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = worker,
        space = LoanPosition::LEN,
        seeds = [b"loan", worker.key().as_ref()],
        bump
    )]
    pub loan_position: Account<'info, LoanPosition>,
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,
    pub credit_line: Account<'info, CreditLine>,
    pub protocol_vault: Account<'info, ProtocolVault>,
    #[account(
        mut,
        seeds = [b"vault_token", b"usdc"],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = worker_token_account.owner == worker.key() @ StrandCreditError::Unauthorized
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"loan", worker.key().as_ref()],
        bump = loan_position.bump
    )]
    pub loan_position: Account<'info, LoanPosition>,
    pub token_program: Program<'info, Token>,
}


#[account]
pub struct ProtocolVault {
    pub total_usdc_deposited: u64, // 8 bytes
    pub total_usdc_loaned: u64,    // 8 bytes
    pub created_at: i64,            // 8 bytes
    pub bump: u8,                   // 1 byte
}

impl ProtocolVault {
    pub const LEN: usize = 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct CreditLine {
    pub worker: Pubkey,         // 32 bytes
    pub score_at_opening: u16,  // 2 bytes
    pub opened_at: i64,         // 8 bytes
    pub bump: u8,               // 1 byte
}

impl CreditLine {
    pub const LEN: usize = 8 + 32 + 2 + 8 + 1;
}

#[account]
pub struct LoanPosition {
    pub worker: Pubkey,       // 32 bytes
    pub principal: u64,       // 8 bytes
    pub borrowed_at: i64,     // 8 bytes
    pub last_repaid_at: i64,  // 8 bytes
    pub bump: u8,             // 1 byte
}

impl LoanPosition {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 1;
}

#[event]
pub struct VaultInitialized {
    pub created_at: i64,
}

#[event]
pub struct VaultFunded {
    pub funder: Pubkey,
    pub amount: u64,
    pub new_total: u64,
}

#[event]
pub struct CreditLineOpened {
    pub worker: Pubkey,
    pub score: u16,
    pub credit_limit_usdc: u64,
    pub opened_at: i64,
}

#[event]
pub struct Borrowed {
    pub worker: Pubkey,
    pub amount: u64,
    pub new_principal: u64,
    pub credit_limit_usdc: u64,
}

#[event]
pub struct Repaid {
    pub worker: Pubkey,
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
    #[msg("Worker mismatch")]
    WorkerMismatch,
    #[msg("Score is below minimum requirement")]
    InsufficientScore,
    #[msg("Requested borrow exceeds credit limit")]
    BorrowExceedsCreditLimit,
    #[msg("Vault has insufficient liquidity")]
    InsufficientVaultLiquidity,
    #[msg("Repay amount exceeds principal")]
    RepayExceedsPrincipal,
}
