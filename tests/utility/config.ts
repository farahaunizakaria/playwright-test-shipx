import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Playwright test configuration loaded from environment variables for playwright to run tests
 */
export const config = {
  playWright: {
    botEmail: process.env.BOT_EMAIL || "",
    botPassword: process.env.BOT_PASSWORD || "",
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    baseCompany: process.env.BASE_COMPANY || "",
  },
  auth0: {
    domain: process.env.AUTH0_DOMAIN || "",
  },
  entity: {
    appUrl: process.env.ENTITY_APP_URL || "http://localhost:3001",
  },
};

// Export individual values for convenience
export const { botEmail, botPassword, baseUrl, baseCompany } =
  config.playWright;
export const { domain: auth0Domain } = config.auth0;

export default config;
