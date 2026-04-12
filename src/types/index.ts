// src/types/index.ts
export type Role = 'STUDENT' | 'JUNIOR' | 'SENIOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  verified: boolean;
  supervisorId?: string | null;
  createdAt: string;
}

export interface WorkLog {
  id: string;
  userId: string;
  hours: number;
  description: string;
  date: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface TimerSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string | null;
}

export interface Analytics {
  totalHoursToday: number;
  totalLogsToday: number;
  totalHoursWeek: number;
  perStudentHours: Array<{
    userId: string;
    name: string;
    email: string;
    totalHours: number;
    logsCount: number;
    todayHours: number;
  }>;
  dailyHours: Array<{
    date: string;
    hours: number;
    logs: number;
  }>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}
