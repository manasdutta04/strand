fn main() {
    let fallback = "9xQeWvG816bUx9EPf5P8xQPk7fP5AnbcW2CYwiVdcgGq";
    let oracle_pubkey = std::env::var("ORACLE_PUBKEY").unwrap_or_else(|_| fallback.to_string());
    println!("cargo:rustc-env=ORACLE_PUBKEY={oracle_pubkey}");
}
