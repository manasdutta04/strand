#!/bin/bash
set -e
source $HOME/.cargo/env
export PATH="/home/manas/solana-release/bin:$PATH"

cd "/mnt/c/Coding Workspace/open-source/strand"
echo "Checking for Cargo.lock..."
ls -l Cargo.lock || echo "Cargo.lock not found"
rm -f Cargo.lock
echo "Running cargo build..."
cd "/mnt/c/Coding Workspace/open-source/strand"
cargo build -p strand-score
