---
title: Host screens match the test sheet after deverlop merge
date: 2026-11-16
summary: "Merged deverlop, fixed a silent auto-merge bug, matched Host UI to the sheet; Azure E2E 10/11 Pass"
---

# Host screens match the test sheet after deverlop merge

## What happened
- Azure backend token 500 was fixed upstream (Bearer abc now 401). Ran the Host Selenium suite against Azure with a dedicated Host test account (OTP via the user's Gmail alias) and admin-moderated listings for every status.
- Merging `origin/deverlop` into `feature/quan-dashbds` conflicted in `hostMockApi.js`, `hostMockApi.test.jsx`, `package-lock.json`. Kept the Host branch's mocks/tests and both lockfile additions.
- Auto-merge silently kept deverlop's `if (USE_MOCK) return viaMock('getHostListings', …)` in `hostApi.js`. It passed `trangThai: 'ALL'` straight to the mock, which rejects it, so the dashboard failed in mock mode (8 E2E cases Error, MOCK-02 red). Removed it in the merge commit `44c5961`.
- A stray `git checkout <same-commit> --` mid-merge detached HEAD and dropped MERGE_HEAD; recovered by switching back and restoring MERGE_HEAD before committing. Nothing lost.
- Changed Host UI to the sheet wording: 4 stat cards, `?trangThai=ALL`, warning color on 'Rút lại', 'Xác nhận rút'/'Xác nhận xóa', lock icons, 'Lưu thay đổi', Sidebar name refresh via `login()`, 'Lưu' + sheet error texts. One shared edit allowed by the user: Pending color in `StatusBadge.jsx`.

## Decision
- User chose "follow the sheet verbatim" over updating the sheet; this reverses the earlier plan's "do not change UI to match sheet".
- TC_PRF_03 "Mật khẩu cũ không chính xác" in the same submit as a short new password is not achievable: backend `@Valid` rejects newPassword before checking the old one, and the FE must not send with a mismatched confirmation. Recommend splitting the case.

## Next steps
- Commit the UI changes and push (updates PR #3), after the user reviews.
- Decide the "Phường/Xã" column (API contract has no `tenPhuong`).
- Report to backend: timestamps 7h behind, relative `/uploads/...` URLs on Host endpoints.
- Remove debug `console.*` lines added to `ListingEditor.jsx` by `232ebe8`.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
