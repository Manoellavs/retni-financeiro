require("@next/env").loadEnvConfig(process.cwd())

const { Pool } = require("pg")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "finance_seed" (
      "userId" text PRIMARY KEY
        REFERENCES "user"("id") ON DELETE CASCADE,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    );
  `)

  console.log("Tabela finance_seed criada ou já existente.")
}

main()
  .catch((error) => {
    console.error("Erro ao criar tabela:", error.message)
    process.exitCode = 1
  })
  .finally(() => pool.end())
