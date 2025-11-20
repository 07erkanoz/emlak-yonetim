export interface MulkSahibi {
  id: number;
  adi: string;
  username: string | null;
}

export interface DashboardSummary {
  totalRentAmount: number;
  totalCollected: number;
  remainingBalance: number;
  cashInSafe: number;
  tenantCount: number;
}
