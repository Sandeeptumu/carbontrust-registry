# Retired provider authentication

The 2026-10-10 requirements replace Google/phone/Firebase authentication with email/password authentication. Provider code, SDK dependencies, configuration and navigation were removed. Legacy provider identity data is not deleted by migrations. Accounts retain IDs and registry ownership; users without passwords use the email recovery flow and verify their email. See `07_DEPLOYMENT.md` for migration instructions.
