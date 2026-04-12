/**
 * Server-only environment reads for the M2M oracle and integrations.
 * Do not import this file from Client Components ("use client").
 *
 * Values are defined in `.env.example`. Copy to `.env.local` for local dev.
 */

function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

/** Oracle / infrastructure */
export const serverOracleEnv = {
  publicBaseUrl: optional("M2M_ORACLE_PUBLIC_BASE_URL"),
  chargerWebhookSecret: optional("M2M_CHARGER_WEBHOOK_SECRET"),
  oracleApiKey: optional("M2M_ORACLE_API_KEY"),
  jwtSecret: optional("M2M_JWT_SECRET"),
  jwtIssuer: optional("M2M_JWT_ISSUER"),
  cronSecret: optional("CRON_SECRET"),
} as const;

/** Solana (server) */
export const serverSolanaEnv = {
  rpcUrl: optional("SOLANA_RPC_URL"),
  rpcWsUrl: optional("SOLANA_RPC_WS_URL"),
  escrowProgramId: optional("SOLANA_ESCROW_PROGRAM_ID"),
  treasuryOrEscrowPubkey: optional("M2M_TREASURY_OR_ESCROW_PUBKEY"),
  oracleKeypairJson: optional("ORACLE_KEYPAIR_JSON"),
} as const;

/** Vehicle OEM credentials (see .env.example for full list) */
export const serverVehicleEnv = {
  teslaClientId: optional("TESLA_CLIENT_ID"),
  teslaClientSecret: optional("TESLA_CLIENT_SECRET"),
  teslaRedirectUri: optional("TESLA_REDIRECT_URI"),
  teslaFleetApiBase: optional("TESLA_FLEET_API_BASE"),
  fordClientId: optional("FORD_CLIENT_ID"),
  fordClientSecret: optional("FORD_CLIENT_SECRET"),
  gmClientId: optional("GM_CLIENT_ID"),
  gmClientSecret: optional("GM_CLIENT_SECRET"),
} as const;

/** Charger cloud APIs (subset; extend as you wire each vendor) */
export const serverChargerEnv = {
  chargepointApiKey: optional("CHARGEPOINT_API_KEY"),
  wallboxEmail: optional("WALLBOX_EMAIL"),
  wallboxPassword: optional("WALLBOX_PASSWORD"),
  evboxApiKey: optional("EVBOX_API_KEY"),
  zaptecApiToken: optional("ZAPTEC_API_TOKEN"),
} as const;
