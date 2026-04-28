#!/bin/bash
set -e

# Install Solana
sh -c "$(curl -sSfL https://release.solana.com/v1.18.11/install)"

# Add Solana to PATH for this session
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor via AVM
# Note: This requires cargo, which should be in PATH if sourced
source $HOME/.cargo/env
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.31.0
avm use 0.31.0

# Verify
solana --version
anchor --version
