# Fix Signup Page Undefined API Base URL

- [x] 1. Diagnose the issue: `VITE_API_BASE_URL` is missing on Vercel causing `undefined` in API_BASE_URL.
- [x] 2. Edit `Frontend/src/config/constants.js` to add a production fallback default.
- [x] 3. Confirm the fix resolves the broken `undefined/auth/google` URL.
- [x] 4. Diagnose OAuth redirect issue: backend defaults to `http://localhost:3000`.
- [x] 5. Edit `Backend/routes/authRoutes.js` to add production frontend fallback.
- [ ] 6. Redeploy backend and frontend to apply fixes.

