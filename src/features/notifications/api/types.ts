// Bodies of the backend NotificationsController (SRS FR-SH-04): camelCase JSON.
export interface NotificationDto {
  id: string;
  /** Machine name such as `appointment.proposed`; the message text is already localised by the backend. */
  type: string;
  title: string;
  body: string;
  relatedId: string | null;
  isRead: boolean;
  createdAtUtc: string;
}

export interface NotificationListDto {
  items: NotificationDto[];
  unreadCount: number;
}
