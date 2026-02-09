const policyVersion = process.env.PRIVACY_POLICY_VERSION || "1.0";
const orderRetentionYears =
  Number(process.env.ORDER_RETENTION_YEARS) || 5;
const accessLogRetentionDays =
  Number(process.env.ACCESS_LOG_RETENTION_DAYS) || 365;

module.exports = {
  policyVersion,
  orderRetentionYears,
  accessLogRetentionDays,
};
