use anchor_lang::prelude::*;

declare_id!("DF89vhYKM3Rj9KMhWiM2pjdknYrd8YafYq2TBMK6evEA");

#[program]
pub mod strand_score {
    use super::*;

    /// Compute gig-worker score from 6 components
    /// Formula per D-011:
    /// - delivery_volume (0-200): min(total_deliveries, 1000) × 200 / 1000
    /// - earnings_consistency (0-150): min(on_time_ratio × 100, 100) × 150 / 100
    /// - tenure_months (0-150): min(account_age_days, 180) × 150 / 180
    /// - rating_points (0-200): min(average_rating × 50, 200)
    /// - cross_platform (0-150): min(platform_count × 30, 150)
    /// - repayment (0-150): min(loans_repaid × 15, 150)
    /// TOTAL: max 1000 points
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
        let age_days = if now > profile.created_at {
            (now - profile.created_at) / (24 * 3600)
        } else {
            0
        };

        // Component 1: delivery_volume (0-200)
        let delivery_volume = profile
            .total_records
            .min(1000)
            .saturating_mul(200)
            .saturating_div(1000) as u16;

        // Component 2: earnings_consistency (0-150)
        // on_time_deliveries tracks repaid_loans; consistency = on_time / total
        let earnings_consistency = if profile.total_records == 0 {
            0
        } else {
            let consistency_pct = profile
                .on_time_records
                .saturating_mul(100)
                .saturating_div(profile.total_records)
                .min(100);
            consistency_pct.saturating_mul(150).saturating_div(100) as u16
        };

        // Component 3: tenure_months (0-150)
        // age_days -> convert to 0-150 scale over 180 days
        let tenure = age_days.min(180).saturating_mul(150).saturating_div(180) as u16;

        // Component 4: rating_points (0-200)
        // ratings_sum tracks total rating points (can be > 100 if we track different rating sources)
        let rating_pts = (profile.ratings_sum as u16).min(200);

        // Component 5: cross_platform (0-150)
        // platform_count: min(platforms × 30, 150)
        let cross_platform = (profile.platform_count as u32)
            .saturating_mul(30)
            .min(150) as u16;

        // Component 6: repayment (0-150)
        // repaid_loans tracking
        let repayment = profile
            .repaid_loans
            .min(10)
            .saturating_mul(15) as u16;

        let total_score = (delivery_volume as u32)
            .saturating_add(earnings_consistency as u32)
            .saturating_add(tenure as u32)
            .saturating_add(rating_pts as u32)
            .saturating_add(cross_platform as u32)
            .saturating_add(repayment as u32)
            .min(1000) as u16;

        let score_state = &mut ctx.accounts.score_state;
        if score_state.version == 0 {
            score_state.worker = worker;
            score_state.bump = ctx.bumps.score_state;
        } else {
            require_keys_eq!(score_state.worker, worker, StrandScoreError::WorkerMismatch);
        }

        score_state.total_score = total_score;
        score_state.delivery_volume = delivery_volume;
        score_state.earnings_consistency = earnings_consistency;
        score_state.tenure = tenure;
        score_state.rating_points = rating_pts;
        score_state.cross_platform = cross_platform;
        score_state.repayment = repayment;
        score_state.computed_at = now;
        score_state.version = score_state.version.saturating_add(1);

        emit!(ScoreUpdated {
            worker,
            total_score,
            components: ScoreComponents {
                delivery_volume,
                earnings_consistency,
                tenure,
                rating_points: rating_pts,
                cross_platform,
                repayment,
            },
            version: score_state.version,
        });

        Ok(())
    }

    /// Attest a specific skill (GitHub URL, etc) - oracle-gated
    pub fn attest_skill(
        ctx: Context<AttestSkill>,
        worker: Pubkey,
        skill_tag: String,
        confidence: u8,
    ) -> Result<()> {
        require!((1..=100).contains(&confidence), StrandScoreError::InvalidConfidence);
        require!(skill_tag.len() <= 64, StrandScoreError::SkillTagTooLong);

        let attestation = &mut ctx.accounts.skill_attestation;
        attestation.worker = worker;
        attestation.skill_tag = skill_tag.clone();
        attestation.confidence = confidence;
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
#[instruction(worker: String)]
pub struct AttestSkill<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub oracle: Signer<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        space = SkillAttestation::LEN,
        seeds = [b"skill", worker.as_bytes()],
        bump
    )]
    pub skill_attestation: Account<'info, SkillAttestation>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ScoreState {
    pub worker: Pubkey,           // 32 bytes
    pub total_score: u16,         // 2 bytes
    pub delivery_volume: u16,     // 2 bytes (0-200)
    pub earnings_consistency: u16, // 2 bytes (0-150)
    pub tenure: u16,              // 2 bytes (0-150)
    pub rating_points: u16,       // 2 bytes (0-200)
    pub cross_platform: u16,      // 2 bytes (0-150)
    pub repayment: u16,           // 2 bytes (0-150)
    pub computed_at: i64,         // 8 bytes
    pub version: u32,             // 4 bytes
    pub bump: u8,                 // 1 byte
}

impl ScoreState {
    pub const LEN: usize = 8 + 32 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 8 + 4 + 1;
}

#[account]
pub struct SkillAttestation {
    pub worker: Pubkey,       // 32 bytes
    pub skill_tag: String,    // 4 + 64 bytes
    pub confidence: u8,       // 1 byte
    pub attested_at: i64,     // 8 bytes
    pub bump: u8,             // 1 byte
}

impl SkillAttestation {
    pub const LEN: usize = 8 + 32 + 4 + 64 + 1 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct WorkerProfileSnapshot {
    pub worker: Pubkey,        // 32 bytes
    pub staked_lamports: u64,  // 8 bytes
    pub created_at: i64,       // 8 bytes
    pub total_records: u64,    // 8 bytes (number of work records)
    pub on_time_records: u64,  // 8 bytes (on-time deliveries)
    pub platform_count: u32,   // 4 bytes (unique platforms)
    pub ratings_sum: u16,      // 2 bytes (total rating points)
    pub repaid_loans: u64,     // 8 bytes (number of repaid loans)
    pub bump: u8,              // 1 byte
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ScoreComponents {
    pub delivery_volume: u16,
    pub earnings_consistency: u16,
    pub tenure: u16,
    pub rating_points: u16,
    pub cross_platform: u16,
    pub repayment: u16,
}

#[event]
pub struct ScoreUpdated {
    pub worker: Pubkey,
    pub total_score: u16,
    pub components: ScoreComponents,
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
}
