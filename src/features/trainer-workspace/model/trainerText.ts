import { useTranslation } from 'react-i18next';

// Vietnamese text for Trainer-portal copy and demo data that is written in English at the call site.
// Usage: `const tr = useTrainerText(); … {tr('Create appointment')}`. Unknown text falls back to itself.
const VI: Record<string, string> = {
  // Navigation, actions and generic labels
  'Select member': 'Chọn Member',
  'All Members': 'Tất cả Member',
  'All goals': 'Tất cả mục tiêu',
  'All statuses': 'Tất cả trạng thái',
  'All experience': 'Mọi trình độ',
  Goal: 'Mục tiêu',
  'Workout status': 'Trạng thái buổi tập',
  Experience: 'Trình độ',
  Beginner: 'Mới bắt đầu',
  Intermediate: 'Trung cấp',
  Advanced: 'Nâng cao',
  'On track': 'Đúng tiến độ',
  'Needs review': 'Cần xem lại',
  Paused: 'Tạm dừng',
  Confirmed: 'Đã xác nhận',
  Pending: 'Chờ xác nhận',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
  Active: 'Đang hoạt động',
  Cancel: 'Hủy',
  Close: 'Đóng',
  Date: 'Ngày',
  Time: 'Giờ',
  Duration: 'Thời lượng',
  Status: 'Trạng thái',
  Notes: 'Ghi chú',
  Member: 'Member',
  Type: 'Loại',
  Package: 'Gói',
  Income: 'Thu nhập',
  Workout: 'Buổi tập',
  Exercises: 'Bài tập',
  Load: 'Tải',
  Sets: 'Hiệp',
  Reps: 'Số lần',
  Week: 'Tuần',
  // Dashboard
  'MEMBER DATA / 7 DAYS': 'DỮ LIỆU MEMBER / 7 NGÀY',
  'AI REVIEW / 02:14': 'AI ĐÁNH GIÁ / 02:14',
  SCHEDULE: 'LỊCH HẸN',
  'Barbell Back Squat': 'Squat với thanh tạ',
  'AI detected excessive forward trunk lean during the final two repetitions.':
    'AI phát hiện thân người nghiêng quá nhiều về phía trước ở hai lần lặp cuối.',
  'View video': 'Xem video',
  'Planned workouts': 'Buổi tập theo kế hoạch',
  'Completion rate': 'Tỷ lệ hoàn thành',
  'Current weight': 'Cân nặng hiện tại',
  Calories: 'Calo',
  'Training load': 'Tải tập',
  'Est. duration': 'Thời lượng ước tính',
  'Body weight': 'Cân nặng',
  // Library and plan builder
  'Duration (sec)': 'Thời lượng (giây)',
  'Rest (sec)': 'Nghỉ (giây)',
  'Distance (km)': 'Quãng đường (km)',
  Rounds: 'Số vòng',
  'Work (sec)': 'Vận động (giây)',
  'Load (kg)': 'Tải (kg)',
  'This exercise is already scheduled for every selected day.':
    'Bài tập này đã có trong mọi ngày đã chọn.',
  'Plan name': 'Tên kế hoạch',
  'EXERCISE LIBRARY': 'THƯ VIỆN BÀI TẬP',
  'No exercises for this day': 'Chưa có bài tập cho ngày này',
  'Training day': 'Ngày tập',
  'LIVE MUSCLE MAP': 'BẢN ĐỒ CƠ THEO THỜI GIAN THỰC',
  'WORKOUT SUMMARY': 'TỔNG KẾT BUỔI TẬP',
  'Total sets': 'Tổng số hiệp',
  'Volume by muscle': 'Khối lượng theo nhóm cơ',
  'Exercise filters': 'Bộ lọc bài tập',
  'Active filters': 'Bộ lọc đang áp dụng',
  'Exercise library pagination': 'Phân trang thư viện bài tập',
  'Show fewer muscle groups': 'Hiện ít nhóm cơ hơn',
  'Show more muscle groups': 'Hiện thêm nhóm cơ',
  'Select multiple values, then apply them together.': 'Chọn nhiều giá trị rồi áp dụng cùng lúc.',
  'Search exercise, muscle or equipment': 'Tìm bài tập, nhóm cơ hoặc dụng cụ',
  // Member workout
  'Target load': 'Tải mục tiêu',
  'Actual load': 'Tải thực tế',
  TARGET: 'MỤC TIÊU',
  ACTUAL: 'THỰC TẾ',
  Completed_: 'Hoàn thành',
  'Mark complete': 'Đánh dấu hoàn thành',
  'READ ONLY': 'CHỈ XEM',
  'Training history': 'Lịch sử tập luyện',
  // Appointments
  'Create appointment': 'Tạo lịch hẹn',
  'Edit appointment': 'Sửa lịch hẹn',
  'Update appointment': 'Cập nhật lịch hẹn',
  'Save appointment': 'Lưu lịch hẹn',
  APPOINTMENT: 'LỊCH HẸN',
  'Appointment type': 'Loại lịch hẹn',
  'In-person training': 'Tập trực tiếp',
  'Video check-in': 'Check-in qua video',
  'Body assessment': 'Đánh giá thể trạng',
  'Upper-body technique and load progression.': 'Kỹ thuật thân trên và tăng tải dần.',
  'Review measurements and calorie adherence.': 'Xem lại số đo và mức tuân thủ calo.',
  'Review deadlift form video.': 'Xem lại video kỹ thuật deadlift.',
  // Coaching history
  'Workout activity': 'Hoạt động tập luyện',
  'AI assessment review': 'Xem lại đánh giá AI',
  'Trainer note': 'Ghi chú của Trainer',
  Session: 'Buổi tập',
  'Progressive load updated': 'Đã cập nhật tải tăng dần',
  'Squat form reviewed': 'Đã xem lại kỹ thuật squat',
  'Recovery adjustment': 'Điều chỉnh phục hồi',
  'Week 3 check-in': 'Check-in tuần 3',
  'Bench press target increased after two clean sessions.':
    'Đã tăng mục tiêu đẩy ngực sau hai buổi tập sạch.',
  'Added tempo squat and ankle mobility preparation.':
    'Đã thêm squat nhịp chậm và khởi động linh hoạt cổ chân.',
  'Reduced lower-body volume by 15% for this week.':
    'Giảm 15% khối lượng thân dưới trong tuần này.',
  'Technique stable and adherence remains above 90%.':
    'Kỹ thuật ổn định và mức tuân thủ vẫn trên 90%.',
  'View coaching detail': 'Xem chi tiết huấn luyện',
  // Income
  'Total income': 'Tổng thu nhập',
  'Package sales': 'Doanh số gói',
  'Active packages': 'Gói đang hoạt động',
  'Package Members': 'Member theo gói',
  'Income history': 'Lịch sử thu nhập',
  'Purchase / start date': 'Ngày mua / bắt đầu',
  'Strength Foundation · 8 sessions': 'Nền tảng sức mạnh · 8 buổi',
  'Progress Coaching · 16 sessions': 'Huấn luyện tiến bộ · 16 buổi',
  // Member goals (demo data)
  'Build muscle': 'Tăng cơ',
  'Fat loss': 'Giảm mỡ',
  Strength: 'Sức mạnh',
  Mobility: 'Linh hoạt',
  Endurance: 'Sức bền',
  // Exercise names (demo data)
  'Barbell Bench Press': 'Đẩy ngực với thanh tạ',
  'Romanian Deadlift': 'Deadlift kiểu Romania',
  'Lat Pulldown': 'Kéo xô cáp',
  'Seated Cable Row': 'Kéo cáp ngồi',
  'Plank Hold': 'Giữ plank',
  'Treadmill Run': 'Chạy máy',
  'Bike Sprint Intervals': 'Đạp xe nước rút quãng',
  // Muscles, equipment and tracking types
  Back: 'Lưng',
  Cardio: 'Tim mạch',
  Chest: 'Ngực',
  Core: 'Cơ lõi',
  Hamstrings: 'Gân kheo',
  Quadriceps: 'Cơ đùi trước',
  Barbell: 'Thanh tạ',
  Bike: 'Xe đạp',
  Bodyweight: 'Trọng lượng cơ thể',
  Cable: 'Cáp',
  Treadmill: 'Máy chạy bộ',
  strength: 'sức mạnh',
  distance: 'quãng đường',
  duration: 'thời lượng',
  interval: 'quãng',
  'INCOME HISTORY': 'LỊCH SỬ THU NHẬP',
  'AI ERROR VIDEO': 'VIDEO LỖI AI',
  exercises: 'bài tập',
  days: 'ngày',
  years: 'tuổi',
  WEEK: 'TUẦN',
  'FIT® TRAINER': 'FIT® HUẤN LUYỆN VIÊN',
  // Trainer profile demo data
  'Strength and movement coach focused on sustainable progress, safe technique and clear training decisions.':
    'Huấn luyện viên sức mạnh và vận động, tập trung vào tiến bộ bền vững, kỹ thuật an toàn và quyết định tập luyện rõ ràng.',
  'I help members understand why each exercise belongs in their plan and how to progress without sacrificing movement quality.':
    'Tôi giúp hội viên hiểu vì sao mỗi bài tập nằm trong kế hoạch của họ và cách tiến bộ mà không đánh đổi chất lượng chuyển động.',
};

export function translateTrainerText(language: string | undefined, text: string): string {
  return language?.startsWith('vi') ? (VI[text] ?? text) : text;
}

/** Returns `tr(englishText)`, which yields the Vietnamese text while the UI language is Vietnamese. */
export function useTrainerText() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage;
  return (text: string) => translateTrainerText(language, text);
}
