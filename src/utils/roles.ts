import type { PosRole } from '../types';

/** 역할별 접근 가능 경로 (Admin은 별도 앱으로 분리됨) */
const ROLE_ROUTES: Record<PosRole, Set<string>> = {
  staff:   new Set(['/', '/kds', '/counter', '/clock', '/display']),
  manager: new Set(['/', '/kds', '/counter', '/clock', '/orders', '/cash', '/display']),
  owner:   new Set(['/', '/kds', '/counter', '/clock', '/orders', '/cash', '/display']),
};

/** 역할별 기본 랜딩 경로 */
export const DEFAULT_ROUTE: Record<PosRole, string> = {
  staff:   '/',
  manager: '/',
  owner:   '/',
};

/** 해당 역할이 특정 경로에 접근 가능한지 확인 */
export function canAccess(role: PosRole, path: string): boolean {
  return ROLE_ROUTES[role].has(path);
}

/** 사이드바 상단 네비게이션에 표시할 경로 목록 */
export function getVisibleNavPaths(role: PosRole): string[] {
  const allNav = ['/', '/kds', '/counter', '/clock', '/orders', '/cash'];
  return allNav.filter((p) => ROLE_ROUTES[role].has(p));
}

/** 사이드바 하단 항목 중 표시할 항목 (label 기준) */
export function getVisibleBottomItems(role: PosRole): Set<string> {
  const items = new Set(['Display', 'Logout']);
  if (role === 'owner') items.add('Admin');
  return items;
}
