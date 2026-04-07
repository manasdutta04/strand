use anchor_lang::prelude::*;
use std::str::FromStr;

declare_id!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

const USDC_SCALE: u64 = 1_000_000;
const SECONDS_PER_MONTH: i64 = 30 * 24 * 3600;
const ORACLE_PUBKEY_STR: &str = env!("ORACLE_PUBKEY");

#[program]
pub mod strand_score {
    use super::*;

    pub fn compute_score(ctx: Context<ComputeScore>, worker: Pubkey) -> Result<()> {
        let worker_profile_info = ctx
            .remaining_accounts
            .first()
            .ok_or(error!(StrandScoreError::MissingWorkerProfile))?;

        let profile_data = worker_profile_info.try_borrow_data()?;
        require!(
            profile_data.len() >= 8,
            StrandScoreError::InvalidWorkerProfileData
        );

        let mut profile_slice: &[u8] = &profile_data[8..];
        let profile = WorkerProfileSnapshot::deserialize(&mut profile_slice)
            .map_err(|_| error!(StrandScoreError::InvalidWorkerProfileData))?;

        require_keys_eq!(profile.worker, worker, StrandScoreError::WorkerMismatch);

        let now = Clock::get()?.unix_timestamp;
        let age_months = if now > profile.created_at {
            ((now - profile.created_at) / SECONDS_PER_MONTH) as u64
        } else {
            0
        };

        let total_earned_whole_usdc = profile.total_earned_usdc / USDC_SCALE;

        let volume = total_earned_whole_usdc
            .min(50_000)
            .saturating_mul(250)
            .saturating_div(50_000);
        let consistency = profile
            .jobs_completed
            .min(100)
            .saturating_mul(250)
            .saturating_div(100);
        let diversity = u64::from(profile.unique_client_count)
            .min(20)
            .saturating_mul(150)
            .saturating_div(20);
        let longevity = age_months.min(24).saturating_mul(100).saturating_div(24);

        let attested_skill_count = count_attested_skills(worker, &ctx.remaining_accounts[1..])?;
        let skills = (attested_skill_count.saturating_mul(15)).min(150);

        let reliability = if profile.jobs_completed == 0 {
            0
        } else {
            profile
                .on_time_completions
                .saturating_mul(100)
                .saturating_div(profile.jobs_completed)
                .min(100)
        };

        let total_score = volume
            .saturating_add(consistency)
            .saturating_add(diversity)
            .saturating_add(longevity)
            .saturating_add(skills)
            .saturating_add(reliability)
            .min(1000) as u16;

        let score_state = &mut ctx.accounts.score_state;
        if score_state.version == 0 {
            score_state.worker = worker;
            score_state.bump = ctx.bumps.score_state;
            score_state.version = 0;
        } else {
            require_keys_eq!(score_state.worker, worker, StrandScoreError::WorkerMismatch);
        }

        score_state.score = total_score;
        score_state.computed_at = now;
        score_state.version = score_state.version.saturating_add(1);

        emit!(ScoreUpdated {
            worker,
            score: total_score,
            version: score_state.version,
        });

        Ok(())
    }

    pub fn attest_skill(
        ctx: Context<AttestSkill>,
        worker: Pubkey,
        skill_tag: String,
        confidence: u8,
        evidence_hash: [u8; 32],
    ) -> Result<()> {
        require!((1..=100).contains(&confidence), StrandScoreError::InvalidConfidence);
        require!(skill_tag.len() <= 64, StrandScoreError::SkillTagTooLong);
        require!(
            skill_tag.as_bytes().len() <= 32,
            StrandScoreError::SeedTooLong
        );

        let expected_oracle = Pubkey::from_str(ORACLE_PUBKEY_STR)
            .map_err(|_| error!(StrandScoreError::InvalidOraclePubkey))?;
        require_keys_eq!(
            ctx.accounts.oracle.key(),
            expected_oracle,
            StrandScoreError::UnauthorizedOracle
        );

        let attestation = &mut ctx.accounts.skill_attestation;
        attestation.worker = worker;
        attestation.skill_tag = skill_tag.clone();
        attestation.confidence = confidence;
        attestation.evidence_hash = evidence_hash;
        attestation.attested_at = Clock::get()?.unix_timestamp;
        attestation.bump = ctx.bumps.skill_attestation;

        emit!(SkillAttested {
            worker,
            skill_tag,
            confidence,
        });

        Ok(())
    }
}

fn count_attested_skills(worker: Pubkey, accounts: &[AccountInfo<'_>]) -> Result<u64> {
    let mut count = 0u64;

    for account_info in accounts {
        if account_info.owner != &crate::ID {
            continue;
        }

        let account_data = account_info.try_borrow_data()?;
        let mut raw: &[u8] = &account_data;

        if let Ok(attestation) = SkillAttestation::try_deserialize(&mut raw) {
            if attestation.worker == worker && attestation.confidence >= 65 {
                count = count.saturating_add(1);
            }
        }
    }

    Ok(count)
}

#[derive(Accounts)]
#[instruction(worker: Pubkey)]
pub struct ComputeScore<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        space = ScoreState::LEN,
        seeds = [b"score", worker.as_ref()],
        bump
    )]
    pub score_state: Account<'info, ScoreState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(worker: Pubkey, skill_tag: String)]
pub struct AttestSkill<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub oracle: Signer<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        space = SkillAttestation::LEN,
        seeds = [b"skill", worker.as_ref(), skill_tag.as_bytes()],
        bump
    )]
    pub skill_attestation: Account<'info, SkillAttestation>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ScoreState {
    pub worker: Pubkey,
    pub score: u16,
    pub computed_at: i64,
    pub version: u32,
    pub bump: u8,
}

impl ScoreState {
    pub const LEN: usize = 8 + 32 + 2 + 8 + 4 + 1;
}

#[account]
pub struct SkillAttestation {
    pub worker: Pubkey,
    pub skill_tag: String,
    pub confidence: u8,
    pub evidence_hash: [u8; 32],
    pub attested_at: i64,
    pub bump: u8,
}

impl SkillAttestation {
    pub const LEN: usize = 8 + 32 + 4 + 64 + 1 + 32 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct WorkerProfileSnapshot {
    pub worker: Pubkey,
    pub jobs_completed: u64,
    pub total_earned_usdc: u64,
    pub unique_client_count: u32,
    pub on_time_completions: u64,
    pub ratings_sum: u64,
    pub created_at: i64,
    pub bump: u8,
}

#[event]
pub struct ScoreUpdated {
    pub worker: Pubkey,
    pub score: u16,
    pub version: u32,
}

#[event]
pub struct SkillAttested {
    pub worker: Pubkey,
    pub skill_tag: String,
    pub confidence: u8,
}

#[error_code]
pub enum StrandScoreError {
    #[msg("Missing worker profile account in remaining accounts")]
    MissingWorkerProfile,
    #[msg("Worker profile account data is invalid")]
    InvalidWorkerProfileData,
    #[msg("Worker does not match provided account data")]
    WorkerMismatch,
    #[msg("Confidence must be between 1 and 100")]
    InvalidConfidence,
    #[msg("Skill tag length exceeds maximum")]
    SkillTagTooLong,
    #[msg("Skill tag cannot be used as PDA seed because it exceeds 32 bytes")]
    SeedTooLong,
    #[msg("Oracle pubkey configured at build time is invalid")]
    InvalidOraclePubkey,
    #[msg("Unauthorized oracle signer")]
    UnauthorizedOracle,
}
