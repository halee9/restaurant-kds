import { describe, it, expect } from 'vitest';

/**
 * payrollSnapshot 로직 단위 테스트
 *
 * StaffManager에서 사용하는 핵심 로직:
 * - finalized된 staff는 저장된 스냅샷 금액을 사용
 * - 미 finalize된 staff는 실시간 계산
 */

// 스냅샷에서 값을 가져오거나 실시간 계산하는 헬퍼 (StaffManager에서 추출할 로직)
type PayrollSnap = {
  total_hours: number;
  base_pay: number;
  tip_share: number;
  top_up: number;
  gross_pay: number;
};

function resolvePayroll(
  staffId: string,
  snapshots: Record<string, PayrollSnap>,
  calculated: { totalPayHours: number; basePay: number; tipShare: number; topUp: number; grossPay: number },
) {
  const snap = snapshots[staffId];
  if (snap) {
    return {
      totalPayHours: snap.total_hours,
      basePay: snap.base_pay,
      tipShare: snap.tip_share,
      topUp: snap.top_up,
      grossPay: snap.gross_pay,
    };
  }
  return calculated;
}

describe('resolvePayroll — snapshot vs live calculation', () => {
  const liveCalc = {
    totalPayHours: 40,
    basePay: 60000,  // $600
    tipShare: 30000, // $300
    topUp: 0,
    grossPay: 90000, // $900
  };

  it('uses snapshot values when finalized', () => {
    const snapshots: Record<string, PayrollSnap> = {
      'staff-1': {
        total_hours: 35,
        base_pay: 52500,   // $525 (old wage)
        tip_share: 25000,  // $250 (old tip calc)
        top_up: 0,
        gross_pay: 77500,  // $775
      },
    };

    const result = resolvePayroll('staff-1', snapshots, liveCalc);

    // Should use snapshot, NOT live calculation
    expect(result.totalPayHours).toBe(35);
    expect(result.basePay).toBe(52500);
    expect(result.tipShare).toBe(25000);
    expect(result.grossPay).toBe(77500);
  });

  it('uses live calculation when no snapshot exists', () => {
    const snapshots: Record<string, PayrollSnap> = {};

    const result = resolvePayroll('staff-1', snapshots, liveCalc);

    // Should fall back to live calculation
    expect(result.totalPayHours).toBe(40);
    expect(result.basePay).toBe(60000);
    expect(result.tipShare).toBe(30000);
    expect(result.grossPay).toBe(90000);
  });

  it('different staff can have different resolution (one finalized, one not)', () => {
    const snapshots: Record<string, PayrollSnap> = {
      'staff-1': {
        total_hours: 35,
        base_pay: 52500,
        tip_share: 25000,
        top_up: 0,
        gross_pay: 77500,
      },
    };

    const s1 = resolvePayroll('staff-1', snapshots, liveCalc);
    const s2 = resolvePayroll('staff-2', snapshots, liveCalc);

    expect(s1.grossPay).toBe(77500);  // snapshot
    expect(s2.grossPay).toBe(90000);  // live
  });
});
