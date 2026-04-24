use sqlx::postgres::PgPoolOptions;

const SEED_SQL: &str = include_str!("../../seeds/seed.sql");

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    let database_url = std::env::var("APP__DATABASE_URL")
        .or_else(|_| std::env::var("DATABASE_URL"))
        .expect("set APP__DATABASE_URL or DATABASE_URL");

    eprintln!("connecting to database…");
    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await?;

    eprintln!("running migrations…");
    sqlx::migrate!("./migrations").run(&pool).await?;

    eprintln!("seeding data…");
    sqlx::raw_sql(SEED_SQL).execute(&pool).await?;

    eprintln!("done — 1 tenant, 3 sites, 8 rooms, 22 devices, 12 alerts, 28 software version rows, 30 utilization records");
    Ok(())
}
