fn main() {
    let fallback = "9joKedWZaDwkq6pi2mmCMMiJzPm4beQnunCganfBNydg";
    let oracle_pubkey = std::env::var("ORACLE_PUBKEY").unwrap_or_else(|_| fallback.to_string());
    println!("cargo:rustc-env=ORACLE_PUBKEY={oracle_pubkey}");
}
