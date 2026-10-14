# ANTIGRAVITY — STITCH VISUAL FIDELITY RULE

## CRITICAL PURPOSE
Từ thời điểm này, Antigravity **KHÔNG được tự thiết kế lại UI** dựa trên các mô tả chung như "modern", "premium", "clean", v.v. Các từ khóa trên chỉ là định hướng.

### SOURCE OF TRUTH
Khi một page/function đã có thiết kế hoặc screenshot/reference từ **Google Stitch**, thì **STITCH DESIGN LÀ SOURCE OF TRUTH CHO VISUAL DESIGN CỦA PAGE ĐÓ.**
Nhiệm vụ của Antigravity là ANALYZE -> RECONSTRUCT -> IMPLEMENT.

# 01. DO NOT REDESIGN STITCH
Không được tự ý thay đổi layout, proportions, hierarchy, hoặc thêm bớt các elements/widgets/cards nếu không có trong thiết kế gốc.

# 02. VISUAL RECONSTRUCTION, NOT INTERPRETATION
Phải phân tích chi tiết canvas size, grid structure, proportions, gaps, padding, typogrpahy hierarchy, v.v.

# 03. PIXEL-LEVEL INTENT
Mục tiêu là **HIGH VISUAL FIDELITY**.

# 04. LAYOUT HAS PRIORITY OVER COMPONENTS
Thứ tự ưu tiên: Overall composition > Layout proportions > Spacing > Typography > Component dimensions > Colors > Borders.

# 05. NEVER DEFAULT TO GENERIC DASHBOARD
Không được biến mọi page thành pattern dashboard đại trà nếu thiết kế gốc không như vậy.

# 06. PLAN BUILDER — EXACT STRUCTURE
Phải giữ cấu trúc 3 panel với tỉ lệ chính xác:
LEFT (Exercise Library) = 23%
CENTER (Workout Builder Canvas) = 50%
RIGHT (Live Muscle Map & Summary) = 27%

# 07. LEFT PANEL — EXERCISE LIBRARY
Phải compact. Chứa Search, Target Muscle, Exercise cards (thumbnail, name, metadata, nút + rõ ràng).

# 08. CENTER PANEL — PRIMARY WORKSPACE
Là vùng quan trọng nhất. Phải có cảm giác "xây dựng giáo án". Chứa Name, Info, Sequence, Config, Target Prescription, Save. Phải có whitespace có chủ đích.

# 09. RIGHT PANEL — LIVE MUSCLE MAP + SUMMARY
Nhỏ gọn (27%). Chứa Live muscle map, Summary (Exercises, Sets, Time, Volume by Muscle). Không phải là dashboard thứ hai.

# 10. SIDEBAR NAVIGATION
Workout Builder phải là expandable menu. Khi ở Plan Builder thì Workout Builder được expanded và Plan Builder active (bg: #A7F0DD, text: #345C32).

# 11. HYER VISUAL SYSTEM
Màu được LOCK: Forest Green (#345C32), White (#FFFFFF), Mint (#A7F0DD), Cool Ash (#97CD97), Pebble (#9CAC54). Không thêm màu lạ.

# 12. SHAPE LANGUAGE
Structure (Card, Panel, Image, Input) -> square / restrained radius.
Interaction (Button, Navigation, Tab, Badge, Chip) -> pill.

# 13. NO EXCESSIVE SHADOW
Không sử dụng box-shadow trừ khi reference có.

# 14. TYPOGRAPHY
Plus Jakarta Sans (App UI), Barlow (Workout metrics), Space Grotesk (AI/analytics), IBM Plex Sans (Dense admin UI), Syne (Brand/display).

# 15. DENSITY
Trainer UI phải Clean/Spacious, nhưng không Empty.

# 16. MEDIA PRIORITY
Media phải đủ lớn để nhận diện movement.

# 17. TARGET / ACTUAL
Không được trộn dữ liệu Target và Actual.

# 18. EDIT EXERCISE
Dùng Modal (Target Prescription, Actual Execution Overrides), không dùng right drawer nếu reference không có.

# 19. COMPONENT REUSE
Tái sử dụng các component hiện có (Sidebar, ExerciseCard, v.v.).

# 20. IMPLEMENTATION PROCESS
Inspect -> Locate components -> Analyze design -> Skeleton -> Proportions -> Typography -> Spacing -> Components -> Interaction -> Verification.

# 21. VISUAL VERIFICATION IS MANDATORY
Tự kiểm tra implementation so với design gốc.

# 22. DO NOT OPTIMIZE AWAY DESIGN
Không được tự ý "làm sạch" hay "đơn giản hóa" nếu làm thay đổi visual gốc.

# 23. WHEN STITCH AND OLD CODE CONFLICT
Ưu tiên Stitch design cho visual, giữ lại business logic.

# 24. FINAL RULE
Hyer Design System quyết định visual language, Stitch quyết định page composition.
