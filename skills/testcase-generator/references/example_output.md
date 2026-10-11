# Sample output — Feature: Login with email/password

| ID | Feature | Title | Type | Priority | Preconditions | Steps | Test Data | Expected Result | Notes |
|---|---|---|---|---|---|---|---|---|---|
| TC_LOGIN_001 | Login | Successful login with valid account | Positive | P0 | User has an active account | 1. Open the login page<br>2. Enter a valid email<br>3. Enter the correct password<br>4. Click Login | email: valid@test.com, pass: correct | Lands on home page, user name displayed | |
| TC_LOGIN_002 | Login | Wrong password | Negative | P0 | User has an account | 1–3. As above<br>4. Enter a password wrong by one character<br>5. Click Login | pass: incorrect | Error message shown, cannot log in | |
| TC_LOGIN_003 | Login | Password left empty | Boundary | P1 | — | Leave password empty, click Login | pass: "" | Client-side validation blocks; no API call made | |
| TC_LOGIN_004 | Login | Valid-format email that does not exist | Negative | P1 | — | Enter an unknown email, any password | email: notexist@test.com | Message "account does not exist" without leaking whether the email exists in the system | Confirm exact message wording with dev |
| TC_LOGIN_005 | Login | Five consecutive failed logins | Security | P0 | — | Enter a wrong password 5 times in a row | — | Account temporarily locked or captcha appears | Inferred case — confirm whether an account-lockout rule exists |
| TC_LOGIN_006 | Login | Same account logged in from two tabs | Concurrency | P2 | — | Open 2 tabs, log in with the same account near-simultaneously | — | Both sessions behave consistently, or a clear single-session policy applies | Inferred case |
| TC_LOGIN_007 | Login | Network lost right when Login is clicked | Negative | P1 | — | Cut network immediately after clicking Login | — | Clear network error shown, UI does not hang | |

## How to read this table
- A **Notes** entry of "inferred case" means the case was NOT in the user's original spec — the assistant added it from standard testing practice. Confirm with PM/dev before merging into the official suite.
- When exporting CSV, multi-line cells (like Steps) are escaped to CSV standard so the format survives Excel/Sheets import.
