// src/config/env.js
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];

const validateEnv = () => {
  for (const var_ of requiredEnvVars) {
    if (!process.env[var_]) {
      throw new Error(`Environment variable ${var_} is missing`);
    }
  }
};

module.exports = validateEnv;