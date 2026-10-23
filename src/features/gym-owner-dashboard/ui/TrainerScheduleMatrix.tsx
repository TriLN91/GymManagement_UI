import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { SessionDetailModal, type TrainerOption } from './SessionDetailModal';

import {
  marketplaceApi,
  type GymBranchCardView,
  type TrainerAppointmentView,
} from '@/features/marketplace';
import { useLocale } from '@/shared/hooks/useLocale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { WorkspacePanel } from '@/shared/ui/workspace';

// Operating hours for schedule: 07:00 to 21:00
const TIME_SLOTS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export function TrainerScheduleMatrix() {
  const { language, locale } = useLocale();
  const isVi = language === 'vi';

  // State
  const [branches, setBranches] = useState<GymBranchCardView[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [appointments, setAppointments] = useState<TrainerAppointmentView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Date selection (default today)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]!;
  });

  // Filter state
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState<TrainerAppointmentView | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Load branches on mount
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const myBrands = await marketplaceApi.getMyBrands();
        let branchList: GymBranchCardView[] = [];
        if (myBrands && myBrands.length > 0) {
          branchList = await marketplaceApi.getBrandBranches(myBrands[0]!.id);
        }
        if (!branchList || branchList.length === 0) {
          branchList = await marketplaceApi.getBranches();
        }
        if (active && branchList && branchList.length > 0) {
          setBranches(branchList);
          setSelectedBranchId(branchList[0]!.id);
        }
      } catch {
        if (active) {
          const fallback: GymBranchCardView = {
            id: 'branch-main',
            gymId: 'b0000000-0000-0000-0000-000000000001',
            brandName: 'Fit Central',
            branchName: 'Fit Central District 1',
            addressLine1: '123 Đường Nguyễn Huệ, Phường Bến Nghé',
            city: 'Hồ Chí Minh',
            latitude: 10.7769,
            longitude: 106.7009,
            averageRating: 4.8,
            reviewCount: 38,
          };
          setBranches([fallback]);
          setSelectedBranchId('branch-main');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 2. Load appointments when branch changes
  const loadAppointments = useCallback(
    async (branchId: string, showToast = false) => {
      if (!branchId) return;
      setIsLoading(true);
      try {
        const data = await marketplaceApi.getBranchAppointments(branchId);
        setAppointments(data ?? []);
        if (showToast) {
          toast.success(isVi ? 'Đã cập nhật lịch tập của chi nhánh.' : 'Schedule updated.');
        }
      } catch {
        toast.error(isVi ? 'Không thể tải lịch tập chi nhánh.' : 'Failed to load branch schedule.');
        setAppointments([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isVi],
  );

  useEffect(() => {
    if (selectedBranchId) {
      void loadAppointments(selectedBranchId);
    }
  }, [selectedBranchId, loadAppointments]);

  // Extract unique trainers from appointments + fallback active trainers
  const trainers: TrainerOption[] = useMemo(() => {
    const map = new Map<string, TrainerOption>();
    // Default seeded trainers
    const defaults: TrainerOption[] = [
      { id: 'trainer-01', fullName: 'Nguyễn Văn Tuấn', role: 'Senior PT' },
      { id: 'trainer-02', fullName: 'Trần Quang Minh', role: 'Strength Coach' },
      { id: 'trainer-03', fullName: 'Lê Thu Trang', role: 'Mobility & Pilates' },
      { id: 'trainer-04', fullName: 'Phạm Đức Hùng', role: 'Hypertrophy Specialist' },
    ];
    defaults.forEach((d) => map.set(d.id, d));

    // Add any from appointments
    appointments.forEach((a) => {
      if (a.currentTrainerProfileId && !map.has(a.currentTrainerProfileId)) {
        map.set(a.currentTrainerProfileId, {
          id: a.currentTrainerProfileId,
          fullName: a.currentTrainerName,
          role: 'Personal Trainer',
        });
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  // Filter appointments by selected date
  const dayAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const apptDate = a.scheduledAtUtc.split('T')[0];
      return apptDate === selectedDate;
    });
  }, [appointments, selectedDate]);

  // Filtered by search & trainer filter
  const visibleAppointments = useMemo(() => {
    return dayAppointments.filter((a) => {
      const matchesTrainer =
        selectedTrainerId === 'all' || a.currentTrainerProfileId === selectedTrainerId;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (a.memberName && a.memberName.toLowerCase().includes(term)) ||
        a.currentTrainerName.toLowerCase().includes(term) ||
        (a.notes && a.notes.toLowerCase().includes(term));
      return matchesTrainer && matchesSearch;
    });
  }, [dayAppointments, selectedTrainerId, searchTerm]);

  // Filtered trainers to display as columns
  const visibleTrainers = useMemo(() => {
    if (selectedTrainerId === 'all') return trainers;
    return trainers.filter((t) => t.id === selectedTrainerId);
  }, [trainers, selectedTrainerId]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]!);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]!);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]!);
  };

  const handleOpenDetail = (appt: TrainerAppointmentView) => {
    setSelectedAppointment(appt);
    setIsModalOpen(true);
  };

  const handleAppointmentUpdated = (updated: TrainerAppointmentView) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedAppointment(updated);
  };

  // KPIs
  const totalDaySessions = dayAppointments.length;
  const completedDaySessions = dayAppointments.filter((a) => a.status === 'Completed').length;
  const scheduledDaySessions = dayAppointments.filter((a) => a.status === 'Scheduled').length;
  const reassignedDaySessions = dayAppointments.filter((a) => a.status === 'Reassigned').length;

  // Formatted date string for header
  const dateHeading = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(selectedDate));

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 1. Header Toolbar: Branch & Date Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          background: 'hsl(var(--card))',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid hsl(var(--border))',
        }}
      >
        {/* Left: Branch & Date Selection */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
          {/* Branch Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: 'hsl(var(--muted-foreground))' }} />
            <Select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              style={{ fontWeight: 600, minWidth: '200px' }}
              aria-label={isVi ? 'Chọn chi nhánh' : 'Select branch'}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.brandName ? `${b.brandName} - ${b.branchName}` : b.branchName}
                </option>
              ))}
            </Select>
          </div>

          {/* Date Navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevDay}
              title={isVi ? 'Hôm trước' : 'Previous day'}
            >
              <ChevronLeft size={16} />
            </Button>

            <Button
              size="sm"
              variant={
                selectedDate === new Date().toISOString().split('T')[0] ? 'default' : 'outline'
              }
              onClick={handleToday}
            >
              {isVi ? 'Hôm nay' : 'Today'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleNextDay}
              title={isVi ? 'Hôm sau' : 'Next day'}
            >
              <ChevronRight size={16} />
            </Button>

            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              style={{ width: '150px', fontSize: '13px', padding: '6px 10px' }}
            />
          </div>
        </div>

        {/* Right: Search, Filter & Refresh */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'hsl(var(--muted-foreground))',
              }}
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isVi ? 'Tìm học viên / PT...' : 'Search member / PT...'}
              style={{ paddingLeft: '32px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} style={{ color: 'hsl(var(--muted-foreground))' }} />
            <Select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              style={{ fontSize: '13px', minWidth: '160px' }}
              aria-label={isVi ? 'Lọc theo PT' : 'Filter by Trainer'}
            >
              <option value="all">{isVi ? 'Tất cả Huấn luyện viên' : 'All Trainers'}</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsRefreshing(true);
              void loadAppointments(selectedBranchId, true);
            }}
            disabled={isLoading || isRefreshing}
            title={isVi ? 'Làm mới lịch' : 'Refresh schedule'}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* 2. KPI Summary Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        <div
          style={{
            background: 'hsl(var(--card))',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'hsl(var(--muted-foreground))',
              fontWeight: 700,
            }}
          >
            {isVi ? 'Tổng ca tập trong ngày' : 'Total Sessions Today'}
          </span>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>
            {totalDaySessions}{' '}
            <span
              style={{ fontSize: '13px', fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}
            >
              ({visibleTrainers.length} PTs)
            </span>
          </div>
        </div>

        <div
          style={{
            background: 'hsl(var(--card))',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: '#16a34a',
              fontWeight: 700,
            }}
          >
            {isVi ? 'Đã hoàn thành' : 'Completed'}
          </span>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: '#16a34a' }}>
            {completedDaySessions}
          </div>
        </div>

        <div
          style={{
            background: 'hsl(var(--card))',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: '#2563eb',
              fontWeight: 700,
            }}
          >
            {isVi ? 'Sắp diễn ra / Đang tập' : 'Scheduled / In-Progress'}
          </span>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: '#2563eb' }}>
            {scheduledDaySessions}
          </div>
        </div>

        <div
          style={{
            background: 'hsl(var(--card))',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: '#d97706',
              fontWeight: 700,
            }}
          >
            {isVi ? 'Đã đổi PT / Cần theo dõi' : 'Reassigned'}
          </span>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: '#d97706' }}>
            {reassignedDaySessions}
          </div>
        </div>
      </div>

      {/* 3. Multi-Column Trainer Grid (Phương án 1) */}
      <WorkspacePanel style={{ padding: '0', overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid hsl(var(--border))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--energy-lime-faint, #f0fdf4)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'capitalize' }}>
              {dateHeading}
            </h3>
            <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
              {isVi
                ? 'Chế độ xem cột theo từng Huấn luyện viên (Multi-Column Trainer View)'
                : 'Multi-Column Resource Grid'}
            </span>
          </div>

          <Badge
            variant="accent"
            style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}
          >
            {visibleTrainers.length} {isVi ? 'Huấn luyện viên phụ trách' : 'Trainers on duty'}
          </Badge>
        </div>

        {isLoading ? (
          <div
            style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}
          >
            <RefreshCw className="animate-spin" size={26} style={{ margin: '0 auto 10px' }} />
            <p>{isVi ? 'Đang tải ma trận lịch tập...' : 'Loading trainer schedule matrix...'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: `${120 + visibleTrainers.length * 220}px`,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'hsl(var(--muted))',
                    borderBottom: '1px solid hsl(var(--border))',
                  }}
                >
                  {/* Sticky Time Column */}
                  <th
                    style={{
                      width: '100px',
                      padding: '14px 16px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'hsl(var(--muted-foreground))',
                      textAlign: 'center',
                      position: 'sticky',
                      left: 0,
                      background: 'hsl(var(--muted))',
                      zIndex: 2,
                      borderRight: '1px solid hsl(var(--border))',
                    }}
                  >
                    {isVi ? 'Khung Giờ' : 'Time'}
                  </th>

                  {/* Trainer Columns */}
                  {visibleTrainers.map((trainer) => {
                    // Count how many sessions this trainer has today
                    const trainerDayCount = dayAppointments.filter(
                      (a) => a.currentTrainerProfileId === trainer.id,
                    ).length;

                    return (
                      <th
                        key={trainer.id}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          borderRight: '1px solid hsl(var(--border))',
                          minWidth: '220px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: '#1c6a5b',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                            }}
                          >
                            {trainer.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong
                              style={{
                                fontSize: '13px',
                                display: 'block',
                                color: 'hsl(var(--foreground))',
                              }}
                            >
                              {trainer.fullName}
                            </strong>
                            <span
                              style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}
                            >
                              {trainer.role || 'Personal Trainer'} ·{' '}
                              <span style={{ fontWeight: 600, color: 'var(--brand)' }}>
                                {trainerDayCount} {isVi ? 'ca' : 'sessions'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {TIME_SLOTS.map((slot) => {
                  return (
                    <tr key={slot} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      {/* Time Slot Label */}
                      <td
                        style={{
                          padding: '14px 10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textAlign: 'center',
                          color: 'hsl(var(--muted-foreground))',
                          position: 'sticky',
                          left: 0,
                          background: 'hsl(var(--card))',
                          zIndex: 1,
                          borderRight: '1px solid hsl(var(--border))',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Clock
                          size={12}
                          style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }}
                        />
                        {slot}
                      </td>

                      {/* Cells for each Trainer */}
                      {visibleTrainers.map((trainer) => {
                        // Find appointment for this trainer in this time slot
                        const appt = visibleAppointments.find((a) => {
                          if (a.currentTrainerProfileId !== trainer.id) return false;
                          const apptTime = new Date(a.scheduledAtUtc);
                          const hour = String(apptTime.getUTCHours()).padStart(2, '0');
                          const apptSlot = `${hour}:00`;
                          return apptSlot === slot;
                        });

                        if (appt) {
                          const isCompleted = appt.status === 'Completed';
                          const isReassigned = appt.status === 'Reassigned';
                          const isNoShow =
                            appt.status === 'NoShow' || appt.status === 'TrainerNoShow';

                          return (
                            <td
                              key={trainer.id}
                              style={{
                                padding: '8px 10px',
                                borderRight: '1px solid hsl(var(--border))',
                                verticalAlign: 'top',
                              }}
                            >
                              <div
                                onClick={() => handleOpenDetail(appt)}
                                style={{
                                  background: isCompleted
                                    ? '#f0fdf4'
                                    : isReassigned
                                      ? '#fffbeb'
                                      : isNoShow
                                        ? '#fef2f2'
                                        : 'hsl(var(--card))',
                                  border: `1px solid ${
                                    isCompleted
                                      ? '#86efac'
                                      : isReassigned
                                        ? '#fde68a'
                                        : isNoShow
                                          ? '#fca5a5'
                                          : '#93c5fd'
                                  }`,
                                  borderRadius: '8px',
                                  padding: '10px 12px',
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.transform = 'translateY(-2px)')
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.transform = 'translateY(0)')
                                }
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '6px',
                                    marginBottom: '4px',
                                  }}
                                >
                                  <strong
                                    style={{ fontSize: '13px', color: 'hsl(var(--foreground))' }}
                                  >
                                    {appt.memberName || 'Học viên'}
                                  </strong>
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      padding: '2px 5px',
                                      borderRadius: '4px',
                                      background: isCompleted
                                        ? '#dcfce7'
                                        : isReassigned
                                          ? '#fef3c7'
                                          : '#dbeafe',
                                      color: isCompleted
                                        ? '#15803d'
                                        : isReassigned
                                          ? '#b45309'
                                          : '#1d4ed8',
                                    }}
                                  >
                                    {appt.status}
                                  </span>
                                </div>

                                <div
                                  style={{
                                    fontSize: '11px',
                                    color: 'hsl(var(--muted-foreground))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    marginBottom: '6px',
                                  }}
                                >
                                  <Clock size={11} /> {slot} ({appt.durationMinutes}m)
                                </div>

                                {appt.notes && (
                                  <p
                                    style={{
                                      fontSize: '11px',
                                      color: 'hsl(var(--muted-foreground))',
                                      lineHeight: 1.3,
                                      margin: 0,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                    }}
                                  >
                                    {appt.notes}
                                  </p>
                                )}

                                {appt.isReassigned && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      color: '#b45309',
                                      fontWeight: 600,
                                      display: 'block',
                                      marginTop: '4px',
                                    }}
                                  >
                                    ⚠ {isVi ? 'Đã đổi PT' : 'Reassigned'}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }

                        // Free Slot
                        return (
                          <td
                            key={trainer.id}
                            style={{
                              padding: '8px 10px',
                              borderRight: '1px solid hsl(var(--border))',
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              background: 'transparent',
                            }}
                          >
                            <div
                              style={{
                                padding: '12px 8px',
                                borderRadius: '6px',
                                border: '1px dashed hsl(var(--border))',
                                color: 'hsl(var(--muted-foreground))',
                                fontSize: '11px',
                                opacity: 0.6,
                              }}
                            >
                              {isVi ? 'Trống lịch' : 'Free slot'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>

      {/* 4. Session Detail Modal */}
      <SessionDetailModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trainers={trainers}
        allAppointments={appointments}
        onAppointmentUpdated={handleAppointmentUpdated}
      />
    </div>
  );
}
