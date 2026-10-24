import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { marketplaceApi, type TrainerAppointmentView } from '@/features/marketplace';
import { useLocale } from '@/shared/hooks/useLocale';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

export interface TrainerOption {
  id: string;
  fullName: string;
  role?: string;
  avatar?: string;
}

interface SessionDetailModalProps {
  appointment: TrainerAppointmentView | null;
  isOpen: boolean;
  onClose: () => void;
  trainers: TrainerOption[];
  allAppointments: TrainerAppointmentView[];
  onAppointmentUpdated: (updated: TrainerAppointmentView) => void;
}

export function SessionDetailModal({
  appointment,
  isOpen,
  onClose,
  trainers,
  allAppointments,
  onAppointmentUpdated,
}: SessionDetailModalProps) {
  const { language, locale } = useLocale();
  const isVi = language === 'vi';

  const [activeTab, setActiveTab] = useState<'attendance' | 'content' | 'reassign'>('attendance');

  // Attendance & Notes state
  const [sessionNotes, setSessionNotes] = useState('');
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(false);

  // Reassign state
  const [selectedNewTrainerId, setSelectedNewTrainerId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    if (appointment) {
      setSessionNotes(appointment.notes ?? '');
      setSelectedNewTrainerId('');
      setReassignReason('');
      setActiveTab('attendance');
    }
  }, [appointment]);

  if (!appointment) return null;

  const scheduledDate = new Date(appointment.scheduledAtUtc);
  const timeFormatted = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(scheduledDate);
  const dateFormatted = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(scheduledDate);

  // Status Presentation
  const statusMap: Record<
    string,
    { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }
  > = {
    Completed: {
      label: isVi ? 'Đã hoàn thành' : 'Completed',
      color: '#15803d',
      bg: '#dcfce7',
      border: '#86efac',
      icon: CheckCircle2,
    },
    Scheduled: {
      label: isVi ? 'Sắp diễn ra' : 'Scheduled',
      color: '#1d4ed8',
      bg: '#dbeafe',
      border: '#93c5fd',
      icon: Clock,
    },
    Reassigned: {
      label: isVi ? 'Đã đổi PT' : 'Reassigned',
      color: '#b45309',
      bg: '#fef3c7',
      border: '#fde68a',
      icon: AlertCircle,
    },
    NoShow: {
      label: isVi ? 'Học viên vắng mặt' : 'Member No-Show',
      color: '#b91c1c',
      bg: '#fee2e2',
      border: '#fca5a5',
      icon: UserX,
    },
    TrainerNoShow: {
      label: isVi ? 'PT vắng mặt' : 'Trainer No-Show',
      color: '#b91c1c',
      bg: '#fee2e2',
      border: '#fca5a5',
      icon: AlertCircle,
    },
    Cancelled: {
      label: isVi ? 'Đã huỷ' : 'Cancelled',
      color: '#4b5563',
      bg: '#f3f4f6',
      border: '#d1d5db',
      icon: AlertCircle,
    },
  };

  const fallbackStatusInfo = {
    label: appointment.status,
    color: '#1d4ed8',
    bg: '#dbeafe',
    border: '#93c5fd',
    icon: Clock,
  };
  const currentStatusInfo = statusMap[appointment.status] ?? fallbackStatusInfo;
  const StatusIcon = currentStatusInfo.icon;

  // Handle Mark Attendance
  const handleMarkAttendance = async (
    status: 'Completed' | 'NoShow' | 'TrainerNoShow' | 'Scheduled',
  ) => {
    setIsUpdatingAttendance(true);
    try {
      const updated = await marketplaceApi.updateAppointmentAttendance(appointment.id, {
        status,
        notes: sessionNotes.trim() || undefined,
      });
      onAppointmentUpdated(updated);
      toast.success(
        status === 'Completed'
          ? isVi
            ? 'Đã điểm danh ca tập hoàn thành!'
            : 'Session marked as completed!'
          : status === 'NoShow'
            ? isVi
              ? 'Đã ghi nhận học viên vắng mặt (No-Show).'
              : 'Marked as Member No-Show.'
            : isVi
              ? 'Đã ghi nhận Huấn luyện viên vắng mặt.'
              : 'Marked as Trainer No-Show.',
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isVi
            ? 'Lỗi cập nhật điểm danh'
            : 'Attendance update failed';
      toast.error(msg);
    } finally {
      setIsUpdatingAttendance(false);
    }
  };

  // Handle Save Notes
  const handleSaveNotes = async () => {
    setIsUpdatingAttendance(true);
    try {
      const updated = await marketplaceApi.updateAppointmentAttendance(appointment.id, {
        status: appointment.status as 'Scheduled' | 'Completed',
        notes: sessionNotes.trim(),
      });
      onAppointmentUpdated(updated);
      toast.success(isVi ? 'Đã cập nhật nội dung giáo án buổi tập!' : 'Workout content saved!');
    } catch {
      toast.error(isVi ? 'Không thể lưu nội dung tập.' : 'Failed to save notes.');
    } finally {
      setIsUpdatingAttendance(false);
    }
  };

  // Handle Reassign Trainer
  const handleReassign = async () => {
    if (!selectedNewTrainerId) {
      toast.error(
        isVi ? 'Vui lòng chọn Huấn luyện viên thay thế.' : 'Please select a replacement trainer.',
      );
      return;
    }
    if (!reassignReason.trim()) {
      toast.error(
        isVi ? 'Vui lòng nhập lý do chuyển đổi PT.' : 'Please provide a reason for reassignment.',
      );
      return;
    }

    setIsReassigning(true);
    try {
      const updated = await marketplaceApi.reassignAppointment(appointment.id, {
        newTrainerProfileId: selectedNewTrainerId,
        reason: reassignReason.trim(),
      });
      onAppointmentUpdated(updated);
      toast.success(
        isVi
          ? `Đã điều phối chuyển lịch sang PT mới thành công!`
          : `Session successfully reassigned to new trainer!`,
      );
      setActiveTab('attendance');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : isVi ? 'Không thể đổi PT' : 'Reassignment failed';
      toast.error(msg);
    } finally {
      setIsReassigning(false);
    }
  };

  // Conflict Detection for Reassigning Trainer:
  // Check if a trainer already has another session at the same time
  const isTrainerBusy = (trainerId: string) => {
    if (trainerId === appointment.currentTrainerProfileId) return true;
    const sessionTime = new Date(appointment.scheduledAtUtc).getTime();
    const sessionDurationMs = appointment.durationMinutes * 60 * 1000;

    return allAppointments.some((other) => {
      if (other.id === appointment.id) return false;
      if (other.currentTrainerProfileId !== trainerId) return false;
      if (other.status === 'Cancelled' || other.status === 'NoShow') return false;

      const otherTime = new Date(other.scheduledAtUtc).getTime();
      const otherDurationMs = other.durationMinutes * 60 * 1000;

      // Overlap check
      return (
        sessionTime < otherTime + otherDurationMs && sessionTime + sessionDurationMs > otherTime
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent style={{ maxWidth: '640px', padding: '0', overflow: 'hidden' }}>
        {/* Header Hero */}
        <div
          style={{
            background:
              'linear-gradient(135deg, hsl(var(--card)) 0%, var(--energy-lime-faint, #f0fdf4) 100%)',
            padding: '24px',
            borderBottom: '1px solid hsl(var(--border))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '6px',
                    background: currentStatusInfo.bg,
                    color: currentStatusInfo.color,
                    border: `1px solid ${currentStatusInfo.border}`,
                  }}
                >
                  <StatusIcon size={13} /> {currentStatusInfo.label}
                </span>

                <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                  {appointment.gymBranchName || 'Chi nhánh trung tâm'}
                </span>
              </div>

              <DialogTitle style={{ fontSize: '20px', fontWeight: 800 }}>
                {isVi ? 'Ca tập 1-on-1:' : '1-on-1 Session:'} {appointment.memberName || 'Học viên'}
              </DialogTitle>
              <DialogDescription style={{ marginTop: '4px', fontSize: '13px' }}>
                <Calendar
                  size={14}
                  style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }}
                />
                {dateFormatted} · <strong>{timeFormatted}</strong> ({appointment.durationMinutes}{' '}
                {isVi ? 'phút' : 'mins'})
              </DialogDescription>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  color: 'hsl(var(--muted-foreground))',
                  fontWeight: 700,
                }}
              >
                {isVi ? 'PT Phụ trách' : 'Current Trainer'}
              </span>
              <strong
                style={{
                  display: 'block',
                  fontSize: '15px',
                  color: 'hsl(var(--foreground))',
                  marginTop: '2px',
                }}
              >
                {appointment.currentTrainerName}
              </strong>
              {appointment.isReassigned && (
                <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
                  ({isVi ? 'Ban đầu:' : 'Orig:'} {appointment.originalTrainerName})
                </span>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginTop: '20px',
              background: 'hsl(var(--muted))',
              padding: '3px',
              borderRadius: '8px',
              width: 'fit-content',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === 'attendance' ? 'hsl(var(--card))' : 'transparent',
                color:
                  activeTab === 'attendance'
                    ? 'hsl(var(--foreground))'
                    : 'hsl(var(--muted-foreground))',
                boxShadow: activeTab === 'attendance' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <UserCheck size={14} />
              <span>{isVi ? 'Điểm danh' : 'Attendance'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('content')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === 'content' ? 'hsl(var(--card))' : 'transparent',
                color:
                  activeTab === 'content'
                    ? 'hsl(var(--foreground))'
                    : 'hsl(var(--muted-foreground))',
                boxShadow: activeTab === 'content' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Dumbbell size={14} />
              <span>{isVi ? 'Nội dung bài tập' : 'Workout Content'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reassign')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === 'reassign' ? 'hsl(var(--card))' : 'transparent',
                color:
                  activeTab === 'reassign'
                    ? 'hsl(var(--foreground))'
                    : 'hsl(var(--muted-foreground))',
                boxShadow: activeTab === 'reassign' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Users size={14} />
              <span>{isVi ? 'Gán / Đổi PT' : 'Reassign PT'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* TAB 1: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div style={{ display: 'grid', gap: '18px' }}>
              <div
                style={{
                  background: 'hsl(var(--muted))',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                    {isVi ? 'Trạng thái điểm danh hiện tại:' : 'Current Attendance Status:'}
                  </span>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>
                    {currentStatusInfo.label}
                  </div>
                </div>

                {appointment.completedAtUtc && (
                  <div
                    style={{
                      textAlign: 'right',
                      fontSize: '12px',
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  >
                    <span>{isVi ? 'Hoàn thành lúc:' : 'Completed at:'}</span>
                    <strong style={{ display: 'block', color: '#15803d' }}>
                      {new Intl.DateTimeFormat(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      }).format(new Date(appointment.completedAtUtc))}
                    </strong>
                  </div>
                )}
              </div>

              <div>
                <Label
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  {isVi ? 'Hành động điểm danh ca tập:' : 'Attendance Actions:'}
                </Label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '10px',
                  }}
                >
                  <Button
                    type="button"
                    variant={appointment.status === 'Completed' ? 'default' : 'outline'}
                    disabled={isUpdatingAttendance}
                    onClick={() => void handleMarkAttendance('Completed')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '12px 10px',
                      height: 'auto',
                      borderColor: appointment.status === 'Completed' ? undefined : '#86efac',
                      color: appointment.status === 'Completed' ? undefined : '#15803d',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>
                      {isVi ? 'Đã hoàn thành' : 'Mark Completed'}
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant={appointment.status === 'NoShow' ? 'default' : 'outline'}
                    disabled={isUpdatingAttendance}
                    onClick={() => void handleMarkAttendance('NoShow')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '12px 10px',
                      height: 'auto',
                      borderColor: appointment.status === 'NoShow' ? undefined : '#fca5a5',
                      color: appointment.status === 'NoShow' ? undefined : '#b91c1c',
                    }}
                  >
                    <UserX size={18} />
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>
                      {isVi ? 'Học viên vắng (No-Show)' : 'Member No-Show'}
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant={appointment.status === 'TrainerNoShow' ? 'default' : 'outline'}
                    disabled={isUpdatingAttendance}
                    onClick={() => void handleMarkAttendance('TrainerNoShow')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '12px 10px',
                      height: 'auto',
                      borderColor: appointment.status === 'TrainerNoShow' ? undefined : '#fca5a5',
                      color: appointment.status === 'TrainerNoShow' ? undefined : '#b91c1c',
                    }}
                  >
                    <AlertCircle size={18} />
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>
                      {isVi ? 'PT vắng mặt' : 'Trainer No-Show'}
                    </span>
                  </Button>
                </div>
              </div>

              {appointment.reassignmentReason && (
                <div
                  style={{
                    background: '#fef3c7',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #fde68a',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#b45309',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isVi ? 'Lý do đổi PT trước đó:' : 'Previous Reassignment Reason:'}
                  </span>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#92400e',
                      marginTop: '2px',
                      lineHeight: 1.4,
                    }}
                  >
                    {appointment.reassignmentReason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WORKOUT CONTENT */}
          {activeTab === 'content' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <Label
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  {isVi ? 'Nhóm cơ tập trung:' : 'Target Muscle Groups:'}
                </Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    'Ngực (Chest)',
                    'Tay sau (Triceps)',
                    'Lưng (Back)',
                    'Chân (Legs)',
                    'Bụng (Core)',
                    'Mobility',
                  ].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'hsl(var(--muted))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="session-notes-input" style={{ fontWeight: 700, fontSize: '13px' }}>
                  {isVi ? 'Giáo án & Ghi chú kỹ thuật buổi tập:' : 'Session Workout Plan & Notes:'}
                </Label>
                <Textarea
                  id="session-notes-input"
                  rows={5}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder={
                    isVi
                      ? 'Nhập các bài tập (Sets x Reps x Weight kg) và ghi chú thể trạng của học viên...'
                      : 'Enter exercise breakdown and notes...'
                  }
                  style={{ marginTop: '6px', fontSize: '13px', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => void handleSaveNotes()}
                  disabled={isUpdatingAttendance}
                  size="sm"
                >
                  {isUpdatingAttendance
                    ? isVi
                      ? 'Đang lưu...'
                      : 'Saving...'
                    : isVi
                      ? 'Lưu nội dung buổi tập'
                      : 'Save Workout Notes'}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: REASSIGN PT */}
          {activeTab === 'reassign' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div
                style={{
                  background: 'var(--energy-lime-faint, #f0fdf4)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #86efac',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                  {isVi ? 'Huấn luyện viên hiện tại:' : 'Current Trainer:'}{' '}
                  <strong>{appointment.currentTrainerName}</strong>
                </span>
                <p style={{ fontSize: '12px', color: '#166534', marginTop: '2px' }}>
                  {isVi
                    ? 'Hệ thống tự động kiểm tra xung đột lịch. Các PT đã có ca trong giờ này sẽ được đánh dấu bận.'
                    : 'System checks for scheduling conflicts. Busy trainers during this time will be disabled.'}
                </p>
              </div>

              <div>
                <Label htmlFor="new-trainer-select" style={{ fontWeight: 700, fontSize: '13px' }}>
                  {isVi ? 'Chọn Huấn luyện viên thay thế:' : 'Select Substitute Trainer:'}
                </Label>
                <Select
                  id="new-trainer-select"
                  value={selectedNewTrainerId}
                  onChange={(e) => setSelectedNewTrainerId(e.target.value)}
                  style={{ marginTop: '6px' }}
                >
                  <option value="">
                    {isVi ? '-- Chọn Huấn luyện viên --' : '-- Select Trainer --'}
                  </option>
                  {trainers.map((t) => {
                    const busy = isTrainerBusy(t.id);
                    const isCurrent = t.id === appointment.currentTrainerProfileId;
                    return (
                      <option key={t.id} value={t.id} disabled={busy || isCurrent}>
                        {t.fullName}{' '}
                        {isCurrent
                          ? isVi
                            ? '(Hiện tại)'
                            : '(Current)'
                          : busy
                            ? isVi
                              ? '(Đang bận ca khác)'
                              : '(Busy)'
                            : isVi
                              ? '(Khả dụng)'
                              : '(Available)'}
                      </option>
                    );
                  })}
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="reassign-reason-input"
                  style={{ fontWeight: 700, fontSize: '13px' }}
                >
                  {isVi ? 'Lý do chuyển đổi PT (Bắt buộc):' : 'Reassignment Reason (Required):'}
                </Label>
                <Textarea
                  id="reassign-reason-input"
                  rows={3}
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder={
                    isVi
                      ? 'VD: PT Tuấn bị ốm đột xuất, điều phối PT Minh hỗ trợ buổi tập...'
                      : 'e.g. Trainer emergency, assigned backup trainer...'
                  }
                  style={{ marginTop: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button
                  onClick={() => void handleReassign()}
                  disabled={isReassigning || !selectedNewTrainerId || !reassignReason.trim()}
                >
                  {isReassigning
                    ? isVi
                      ? 'Đang điều phối...'
                      : 'Reassigning...'
                    : isVi
                      ? 'Xác nhận chuyển đổi PT'
                      : 'Confirm Reassignment'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter
          style={{
            padding: '16px 24px',
            background: 'hsl(var(--muted))',
            borderTop: '1px solid hsl(var(--border))',
          }}
        >
          <DialogClose asChild>
            <Button variant="ghost">{isVi ? 'Đóng' : 'Close'}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
