use config::{Config, ConfigError, Environment};
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Settings {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub db_max_connections: u32,
    pub auth_username: String,
    pub auth_password: String,
    pub log_level: String,
    pub max_body_bytes: usize,
    pub request_timeout_secs: u64,
}

impl Settings {
    pub fn load() -> Result<Self, ConfigError> {
        Config::builder()
            .set_default("host", "0.0.0.0")?
            .set_default("port", 3000_i64)?
            .set_default("db_max_connections", 5_i64)?
            .set_default("log_level", "info")?
            .set_default("max_body_bytes", 1_048_576_i64)?
            .set_default("request_timeout_secs", 30_i64)?
            .add_source(
                Environment::with_prefix("APP")
                    .separator("__")
                    .try_parsing(true),
            )
            .build()?
            .try_deserialize()
    }
}

#[cfg(test)]
pub fn test_settings() -> Settings {
    Settings {
        host: "127.0.0.1".into(),
        port: 3000,
        database_url: "postgres://localhost/test".into(),
        db_max_connections: 1,
        auth_username: "testuser".into(),
        auth_password: "testpass".into(),
        log_level: "off".into(),
        max_body_bytes: 1_048_576,
        request_timeout_secs: 30,
    }
}
