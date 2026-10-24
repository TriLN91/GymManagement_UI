# 🛡️ Frontend Pre-Push Verification Checklist (GymManagement_UI)

Tài liệu này được thiết lập để **đảm bảo 100% các bước CI trên GitHub Actions đều xanh trước khi `git push`**, phòng ngừa việc pipeline bị fail hoặc treo như hình chụp CI thực tế.

---

## 📊 Bảng đối chiếu trực tiếp với GitHub Actions CI

| Trạng thái CI (Ảnh chụp)     | GitHub Actions Job | Script tương ứng ở Local                      | Tiêu chuẩn Đạt (Passing Criteria)                          |
| :--------------------------- | :----------------- | :-------------------------------------------- | :--------------------------------------------------------- |
| ✅ **CI / Lint**             | `lint`             | `npm run lint` & `npm run format:check`       | `0 errors, 0 warnings`                                     |
| ✅ **CI / Typecheck**        | `typecheck`        | `npm run typecheck`                           | `tsc -b --noEmit` thoát mã 0, không có lỗi kiểu TypeScript |
| ✅ **CI / Unit tests**       | `Unit tests`       | `npm run test` (hoặc `npm run test:coverage`) | 199/199 tests passed, 57/57 files                          |
| ✅ **CI / Build**            | `Build`            | `npm run build`                               | Thư mục `dist/` được biên dịch thành công                  |
| ❌ **CI / E2E (Playwright)** | `E2E (Playwright)` | `npm run e2e`                                 | 89/89 tests passed (không bị timeout 10m)                  |
| ✅ **Vercel**                | `Deployment`       | `npm run build`                               | Không có dynamic import hoặc biến môi trường bị lỗi        |

---

## ⚡ 1-Click Fast Verification (Lệnh chạy nhanh 1 bước)

Trước khi commit và push, mở terminal tại thư mục `GymManagement_UI` và chạy lệnh chuỗi sau:

### Dành cho Windows PowerShell:

```powershell
# Tự động format code, kiểm tra lint, typecheck, unit tests, build và e2e:
npm run format ; npm run format:check ; npm run lint ; npm run typecheck ; npm test ; npm run build ; npm run e2e
```

### Dành cho Git Bash / macOS / Linux:

```bash
npm run format && npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run e2e
```

Nếu lệnh trên kết thúc mà không có thông báo lỗi màu đỏ, **100% commit sẽ vượt qua GitHub Actions CI**.

---

## 🔍 Hướng dẫn chi tiết từng bước kiểm tra (Step-by-Step)

### Bước 1: Kiểm tra Code Quality & Format (`CI / Lint`)

GitHub Actions chạy ESLint với cờ `--max-warnings=0` (bất kỳ warning nào cũng bị coi là lỗi) và Prettier `format:check`.

```powershell
# 1.1 Tự động format toàn bộ file theo chuẩn Prettier (Tránh lỗi format:check):
npm run format

# 1.2 Kiểm tra xác nhận lại chuẩn format
npm run format:check

# 1.3 Kiểm tra lỗi lint
npm run lint

# 1.4 Nếu có lỗi lint có thể fix tự động:
npm run lint:fix
```

> [!NOTE]
> **Lỗi thường gặp:**
>
> - Biến trong `catch (err)` không sử dụng. Quy tắc ESLint yêu cầu đổi tên thành `catch (_err)`.
> - Ép kiểu `any` không an toàn: Sử dụng type cụ thể thay vì `any`.

---

### Bước 2: Kiểm tra kiểu dữ liệu TypeScript (`CI / Typecheck`)

```powershell
npm run typecheck
```

- Lệnh này tương đương `tsc -b --noEmit`.
- **Lưu ý:** Không bỏ qua các lỗi missing properties trong `interface` (ví dụ: `WorkoutDayPlan`, `WorkoutExercise`).

---

### Bước 3: Kiểm tra Unit & Component Tests (`CI / Unit tests`)

```powershell
# Chạy unit tests thông thường
npm test

# Hoặc chạy kiểm tra kèm độ bao phủ (Coverage) như CI
npm run test:coverage
```

---

### Bước 4: Kiểm tra bản đóng gói sản phẩm (`CI / Build`)

```powershell
npm run build
```

- Đảm bảo Vite bundle không bị lỗi thiếu file, lỗi path alias `@/...`, hoặc import sai tên file (case-sensitive trên Linux CI).

---

### Bước 5: Chạy kiểm thử End-to-End (`CI / E2E (Playwright)`)

Đây là bước **quan trọng nhất** thường tốn nhiều thời gian và dễ fail nếu không kiểm tra tại local.

```powershell
# Chạy toàn bộ 91 kịch bản E2E Playwright trên Chromium:
npm run e2e
```

#### 💡 Mẹo chạy nhanh khi chỉ sửa đổi một module cụ thể:

Thay vì chờ toàn bộ 91 bài test (~1.5 phút), bạn có thể chạy riêng spec vừa sửa:

```powershell
# Kiểm tra luồng tập luyện & ghi nhận kết quả:
npx playwright test e2e/workout-flow.spec.ts e2e/workout-plans.spec.ts e2e/member-workout-tools.spec.ts

# Kiểm tra Gym Owner Dashboard & Training:
npx playwright test e2e/gym-owner-dashboard.spec.ts e2e/gym-owner-training.spec.ts

# Kiểm tra Profile & Settings:
npx playwright test e2e/member-profile.spec.ts

# Mở giao diện trực quan Playwright UI để debug từng bước:
npm run e2e:ui
```

---

## ⚠️ Danh sách các lỗi E2E phổ biến đã xử lý & Cách phòng ngừa

1. **Treo màn hình chờ do `isPending` (Dẫn đến Timeout 10m):**
   - _Nguyên nhân:_ Khi màn hình kiểm tra `if (live.isPending)` mà MSW mock hoặc network chưa trả về, trang web hiển thị "Loading..." vĩnh viễn trong test.
   - _Cách phòng ngừa:_ Luôn có fallback dữ liệu demo (`demoDay`, `isDemo`) hoặc kiểm tra `if (live.isPending && !demoData)`.

2. **Strict Mode Violation trong Playwright:**
   - _Nguyên nhân:_ `page.getByText('2.20 km')` tìm thấy **2 phần tử** giống hệt nhau (ví dụ: 1 ở tổng kết Header và 1 ở chi tiết bài tập).
   - _Cách phòng ngừa:_ Phân tách rõ ràng text giữa summary và detail, hoặc dùng locator có scope hẹp hơn như `page.locator('article').getByText(...)`.

3. **Lỗi tràn màn hình trên thiết bị di động (390px Mobile Viewport Overflow):**
   - _Nguyên nhân:_ Thẻ `div` có `min-width`, chuỗi dài không wrap (`break-words`), hoặc `body[data-scroll-locked]` khi mở Dialog gây overflow trục X.
   - _Cách phòng ngừa:_ Sử dụng `flex-wrap`, `max-w-full`, và class `.overflow-x-hidden`.

4. **Lỗi dịch thuật i18n khi chuyển đổi Tiếng Việt / Tiếng Anh:**
   - _Nguyên nhân:_ Tên bài tập hoặc trạng thái bị hardcode tiếng Anh khiến test case tiếng Việt tìm không ra (ví dụ: `Kéo tạ đòn gập người` vs `Bent-over barbell row`).
   - _Cách phòng ngừa:_ Luôn bọc qua `t('flow.exercises.' + id, { defaultValue: name })`.

5. **Thiếu MSW Mock Handlers:**
   - _Nguyên nhân:_ Test gọi API mà chưa được mock trong `src/mocks/handlers/` dẫn đến lỗi Network Error 404/Network failure hoặc `ERR_CONNECTION_REFUSED`.
   - _Cách phòng ngừa:_ Đảm bảo các route trong `ENDPOINTS` đều có handler tương ứng trong `src/mocks/handlers/`, và tránh bắt nhầm `net::ERR_` resource errors trong `consoleErrors`.

---

## 📋 Checklist tích hợp trước khi Commit

- [ ] Đã chạy `npm run lint` -> Không có lỗi.
- [ ] Đã chạy `npm run typecheck` -> Không có lỗi TypeScript.
- [ ] Đã chạy `npm test` -> Toàn bộ Unit test pass.
- [ ] Đã chạy `npm run build` -> Build thành công `dist/`.
- [ ] Đã chạy `npm run e2e` -> Toàn bộ Playwright test pass.
- [ ] Git commit message tuân thủ chuẩn Conventional Commits (ví dụ: `fix(e2e): ...`, `feat(workout): ...`).
