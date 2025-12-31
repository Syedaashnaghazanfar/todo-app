# User Registration (Signup) - Testing Guide

## Prerequisites

### 1. Environment Setup
```bash
# Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
# Ensure .env has:
# - DATABASE_URL (PostgreSQL connection)
# - JWT_SECRET (32+ character secret)
# - JWT_ALGORITHM=HS256
# - JWT_EXPIRY_DAYS=30

# Frontend
cd frontend/todo-app
# Ensure .env.local has:
# - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2. Start Servers
```bash
# Terminal 1 - Backend
cd backend
uvicorn src.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend/todo-app
npm run dev

# Verify:
# Backend: http://localhost:8000/docs
# Frontend: http://localhost:3000
```

### 3. Database Check
```bash
# Ensure users table exists
psql $DATABASE_URL -c "\d users"

# Should show columns:
# - id (uuid)
# - email (varchar, unique)
# - password_hash (varchar)
# - created_at (timestamp)
# - updated_at (timestamp)
```

## Manual Testing Scenarios

### Test 1: Valid Signup Flow ✅
**Objective**: Verify successful account creation with auto-login

**Steps**:
1. Open browser to http://localhost:3000/signup
2. Enter valid email: `test@example.com`
3. Enter valid password: `password123` (8+ characters)
4. Click "Create Account" button

**Expected Results**:
- ✅ Submit button shows loading spinner
- ✅ SweetAlert2 success popup appears: "Account created successfully! Welcome to TodoApp."
- ✅ Alert auto-closes after 2 seconds
- ✅ Redirects to http://localhost:3000/tasks
- ✅ Cookie `auth_token` set in browser (check DevTools → Application → Cookies)
- ✅ User record created in database:
  ```sql
  SELECT * FROM users WHERE email = 'test@example.com';
  ```

**Backend Logs**:
```
INFO: POST /api/v1/auth/signup 201 Created
```

---

### Test 2: Duplicate Email Error ✅
**Objective**: Verify 409 error handling

**Steps**:
1. Complete Test 1 (create user)
2. Navigate to http://localhost:3000/signup
3. Enter SAME email: `test@example.com`
4. Enter any password: `newpassword123`
5. Click "Create Account"

**Expected Results**:
- ✅ Submit button shows loading spinner briefly
- ✅ SweetAlert2 error popup appears: "Email already registered. Please login instead."
- ✅ User must click "OK" to dismiss
- ✅ Stays on /signup page
- ✅ Form fields remain filled
- ✅ No new user created in database

**Backend Logs**:
```
INFO: POST /api/v1/auth/signup 409 Conflict
```

---

### Test 3: Invalid Email Format ✅
**Objective**: Verify client-side email validation

**Steps**:
1. Navigate to http://localhost:3000/signup
2. Enter invalid email: `invalid-email`
3. Tab out of email field (trigger blur)

**Expected Results**:
- ✅ Red error message appears below email field: "Invalid email format"
- ✅ Email input border turns red
- ✅ Submit button remains DISABLED
- ✅ No API call made

**Try These Invalid Emails**:
- `noatsign.com` → "Invalid email format"
- `@example.com` → "Invalid email format"
- `user@` → "Invalid email format"
- (empty) → "Email is required"

---

### Test 4: Password Too Short ✅
**Objective**: Verify client-side password validation

**Steps**:
1. Navigate to http://localhost:3000/signup
2. Enter valid email: `user@example.com`
3. Enter short password: `abc123` (6 characters)
4. Tab out of password field (trigger blur)

**Expected Results**:
- ✅ Red error message appears below password field: "Password must be at least 8 characters"
- ✅ Password input border turns red
- ✅ Submit button remains DISABLED
- ✅ No API call made

**Try These Invalid Passwords**:
- `abc` (3 chars) → Error shown
- `1234567` (7 chars) → Error shown
- (empty) → "Password is required"
- `12345678` (8 chars) → Valid ✅

---

### Test 5: Submit Button Disabled State ✅
**Objective**: Verify submit button disabled when form invalid

**Steps**:
1. Navigate to http://localhost:3000/signup
2. Leave both fields empty
3. Observe submit button

**Expected Results**:
- ✅ Submit button appears grayed out (opacity-50)
- ✅ Cursor shows "not-allowed" on hover
- ✅ Button shows purple gradient but faded
- ✅ Clicking button does nothing

**Try These Scenarios**:
- Empty email + valid password → Disabled
- Valid email + empty password → Disabled
- Invalid email + valid password → Disabled
- Valid email + short password → Disabled
- Valid email + valid password → ENABLED ✅

---

### Test 6: Real-Time Validation ✅
**Objective**: Verify validation updates as user types

**Steps**:
1. Navigate to http://localhost:3000/signup
2. Enter invalid email: `user`
3. Tab out (error appears)
4. Continue typing: `user@example.com`

**Expected Results**:
- ✅ Error message disappears as soon as email becomes valid
- ✅ Red border changes to purple border
- ✅ Submit button enables when all fields valid

---

### Test 7: Loading State ✅
**Objective**: Verify UI updates during API call

**Steps**:
1. Navigate to http://localhost:3000/signup
2. Enter valid credentials
3. Click "Create Account"
4. Observe button state (before alert appears)

**Expected Results**:
- ✅ Button text changes to "Creating Account..."
- ✅ Spinner icon appears (animated circle)
- ✅ Button remains disabled during request
- ✅ Email and password inputs disabled during request

**Network Throttling Test**:
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Submit form
4. Observe loading state persists longer

---

### Test 8: Navigation Links ✅
**Objective**: Verify all navigation works

**Steps**:
1. Navigate to http://localhost:3000/signup
2. Click "Back to Home" link
3. Verify redirects to http://localhost:3000
4. Navigate back to /signup
5. Scroll to bottom
6. Click "Log in" link

**Expected Results**:
- ✅ "Back to Home" → redirects to /
- ✅ "Log in" link → redirects to /login (will be 404 until Phase 4)
- ✅ Links have purple color
- ✅ Hover effect visible

---

### Test 9: Purple Theme Consistency ✅
**Objective**: Verify visual theme matches homepage

**Steps**:
1. Open http://localhost:3000 (homepage)
2. Note purple gradient and colors
3. Navigate to http://localhost:3000/signup
4. Compare colors

**Expected Results**:
- ✅ Same purple gradient background (from-purple-50 via-white to-pink-50)
- ✅ Same purple text colors
- ✅ Same button gradient (from-purple-600 to-pink-600)
- ✅ Animated gradient blobs visible
- ✅ Purple focus rings on inputs
- ✅ Consistent typography

---

### Test 10: Accessibility ✅
**Objective**: Verify keyboard navigation and screen reader support

**Steps**:
1. Navigate to http://localhost:3000/signup
2. Use only keyboard (no mouse):
   - Press Tab (should focus email input)
   - Press Tab (should focus password input)
   - Press Tab (should focus submit button)
   - Press Enter (should submit if valid)

**Expected Results**:
- ✅ All inputs focusable with Tab
- ✅ Focus ring visible (purple ring-2)
- ✅ Enter key submits form
- ✅ Error messages announced (role="alert")
- ✅ ARIA labels present:
  ```html
  aria-invalid="true"
  aria-describedby="email-error"
  ```

**Screen Reader Test** (Optional):
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through form
3. Verify all labels and errors read aloud

---

### Test 11: Responsive Design ✅
**Objective**: Verify mobile/tablet/desktop layouts

**Steps**:
1. Open http://localhost:3000/signup
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M)
4. Test different viewports

**Expected Results**:

**Mobile (375px)**:
- ✅ Single column layout
- ✅ Card takes full width with padding
- ✅ Buttons stack vertically
- ✅ Text remains readable

**Tablet (768px)**:
- ✅ Card centered with max-width
- ✅ Increased padding
- ✅ Larger text

**Desktop (1440px+)**:
- ✅ Card centered with max-width
- ✅ Decorative blobs visible
- ✅ Animations smooth

---

### Test 12: Animation & Motion ✅
**Objective**: Verify Framer Motion animations

**Steps**:
1. Navigate to http://localhost:3000/signup
2. Observe page load animation
3. Enable "Reduce Motion" in OS settings
4. Reload page

**Expected Results (Normal)**:
- ✅ Card fades in from bottom (y: 20 → 0)
- ✅ Spring animation (bounces slightly)
- ✅ Gradient blobs animate continuously

**Expected Results (Reduced Motion)**:
- ✅ No slide animation (y: 0)
- ✅ Still fades in (opacity: 0 → 1)
- ✅ Gradient blobs still visible but static

---

## Backend API Testing

### Test API Directly with curl

```bash
# 1. Valid Signup
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "api-test@example.com", "password": "password123"}' \
  -c cookies.txt \
  -v

# Expected:
# HTTP/1.1 201 Created
# Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Lax
# {"user": {"id": "...", "email": "api-test@example.com", ...}, "message": "..."}

# 2. Duplicate Email
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "api-test@example.com", "password": "different123"}' \
  -v

# Expected:
# HTTP/1.1 409 Conflict
# {"detail": "Email already registered. Please login instead."}

# 3. Invalid Email
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "password123"}' \
  -v

# Expected:
# HTTP/1.1 400 Bad Request
# {"detail": "Invalid email format"}

# 4. Short Password
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "short@example.com", "password": "abc123"}' \
  -v

# Expected:
# HTTP/1.1 400 Bad Request
# {"detail": "Password must be at least 8 characters"}
```

---

## Database Verification

### Check User Creation
```sql
-- Connect to database
psql $DATABASE_URL

-- View all users
SELECT id, email, created_at FROM users;

-- Check password is hashed
SELECT email, password_hash FROM users WHERE email = 'test@example.com';
-- password_hash should be a bcrypt hash (starts with $2b$)

-- Verify timestamps
SELECT email, created_at, updated_at FROM users;
-- Both should be set to current timestamp
```

### Check Sessions (if BetterAuth uses sessions table)
```sql
-- View active sessions
SELECT * FROM sessions WHERE user_id = (
  SELECT id FROM users WHERE email = 'test@example.com'
);
```

---

## Browser DevTools Checks

### 1. Cookie Inspection
1. Open DevTools → Application → Cookies → http://localhost:3000
2. Find `auth_token` cookie

**Verify**:
- ✅ Name: `auth_token`
- ✅ Value: JWT string (3 parts separated by dots)
- ✅ Domain: `localhost`
- ✅ Path: `/`
- ✅ HttpOnly: ✓ (checked)
- ✅ Secure: ✓ (if HTTPS)
- ✅ SameSite: `Lax`
- ✅ Expires: ~30 days from now

### 2. Network Tab
1. Open DevTools → Network → Filter: Fetch/XHR
2. Submit signup form
3. Click on `signup` request

**Verify Request**:
```
Request URL: http://localhost:8000/api/v1/auth/signup
Request Method: POST
Request Headers:
  Content-Type: application/json
Request Payload:
  {email: "test@example.com", password: "password123"}
```

**Verify Response**:
```
Status Code: 201 Created
Response Headers:
  Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000; Path=/
Response Body:
  {
    "user": {
      "id": "550e8400-...",
      "email": "test@example.com",
      "created_at": "2025-12-15T21:00:00Z"
    },
    "message": "Account created successfully"
  }
```

### 3. Console Tab
1. Open DevTools → Console
2. Submit form
3. Check for errors

**Expected**:
- ✅ No console errors
- ✅ No CORS errors
- ✅ No TypeScript errors

---

## Error Scenarios

### Network Errors
**Simulate**: Stop backend server

**Test**:
1. Stop backend: `Ctrl+C` in backend terminal
2. Submit signup form

**Expected**:
- ✅ SweetAlert2 error: "Signup failed. Please try again."
- ✅ Form remains filled
- ✅ Loading state clears

### CORS Errors
**Simulate**: Change API_URL to different domain

**Test**:
1. Edit `.env.local`: `NEXT_PUBLIC_API_URL=http://different-domain.com/api/v1`
2. Restart frontend
3. Submit form

**Expected**:
- ✅ CORS error in console
- ✅ SweetAlert2 error shown
- ✅ No cookie set

### Timeout Errors
**Simulate**: Add delay in backend endpoint

**Test**:
1. Add `time.sleep(10)` in backend signup endpoint
2. Submit form
3. Wait 10 seconds

**Expected**:
- ✅ Loading state persists for 10 seconds
- ✅ Eventually shows success or timeout error
- ✅ User can't submit again during loading

---

## Performance Testing

### Lighthouse Audit
1. Open DevTools → Lighthouse
2. Select "Desktop" or "Mobile"
3. Run audit on http://localhost:3000/signup

**Expected Scores**:
- ✅ Performance: 90+
- ✅ Accessibility: 95+
- ✅ Best Practices: 95+
- ✅ SEO: 90+

### Bundle Size Check
```bash
cd frontend/todo-app
npm run build

# Check output:
# - /signup page chunk should be <50 KB
```

---

## Regression Testing

### After Code Changes
Run these quick checks:

1. **TypeScript Compilation**
   ```bash
   npx tsc --noEmit
   # Should show no errors in new auth files
   ```

2. **ESLint**
   ```bash
   npx next lint
   # Should show no critical errors
   ```

3. **Build**
   ```bash
   npm run build
   # Should complete successfully
   ```

4. **Quick Smoke Test**
   - Navigate to /signup
   - Submit valid form
   - Verify success flow

---

## Common Issues & Solutions

### Issue 1: 404 on /signup
**Solution**: Ensure Next.js dev server is running and file exists at `app/signup/page.tsx`

### Issue 2: API 404
**Solution**: Check backend is running on port 8000 and `NEXT_PUBLIC_API_URL` is correct

### Issue 3: Cookie not set
**Solution**: Verify `credentials: 'include'` in fetch call and backend sets `Set-Cookie` header

### Issue 4: CORS errors
**Solution**: Backend must allow `http://localhost:3000` origin with credentials

### Issue 5: TypeScript errors
**Solution**: Run `npm install` and check imports match exported types

### Issue 6: SweetAlert2 not showing
**Solution**: Verify `sweetalert2` is installed: `npm list sweetalert2`

### Issue 7: Validation not working
**Solution**: Check `EMAIL_REGEX` and `MIN_PASSWORD_LENGTH` constants

### Issue 8: Redirect fails
**Solution**: Verify `useRouter()` from `next/navigation` and `/tasks` page exists

---

## Test Checklist

Before marking tasks complete, verify:

- [ ] All 9 tasks (T033-T041) implemented
- [ ] TypeScript compilation successful
- [ ] No ESLint errors
- [ ] Valid signup creates user
- [ ] Duplicate email shows error
- [ ] Invalid email prevented
- [ ] Short password prevented
- [ ] SweetAlert2 success shown
- [ ] SweetAlert2 error shown
- [ ] Auto-redirect to /tasks works
- [ ] "Already have account?" link works
- [ ] "Back to Home" link works
- [ ] Purple theme consistent
- [ ] Loading state visible
- [ ] Keyboard navigation works
- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations smooth
- [ ] Cookie set correctly
- [ ] No console errors
- [ ] Database record created

---

## Next Steps

After all tests pass:

1. **Commit Changes**
   ```bash
   git add frontend/todo-app/types/auth.ts
   git add frontend/todo-app/utils/authAlerts.ts
   git add frontend/todo-app/services/authApi.ts
   git add frontend/todo-app/components/auth/
   git add frontend/todo-app/app/signup/
   git add specs/006-auth-integration/tasks.md
   git commit -m "feat: implement user registration (signup) frontend - Phase 3 US1"
   ```

2. **Update Documentation**
   - Mark Phase 3 complete in tasks.md
   - Update README with signup feature

3. **Begin Phase 4**
   - Implement login functionality (T042-T055)
   - Create /login page
   - Add AuthContext for global state

---

## Support

If tests fail, check:
1. Backend logs for errors
2. Frontend console for errors
3. Network tab for failed requests
4. Database for missing tables/columns
5. Environment variables (.env, .env.local)

For help, refer to:
- **Spec**: specs/006-auth-integration/spec.md
- **API Contract**: specs/006-auth-integration/contracts/auth-api.yaml
- **Tasks**: specs/006-auth-integration/tasks.md
- **Implementation Summary**: SIGNUP_IMPLEMENTATION_SUMMARY.md
- **Architecture**: SIGNUP_ARCHITECTURE.md
