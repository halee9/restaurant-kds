import { Badge } from '@/components/ui/badge';
import type { KDSOrder } from '../types';
import OrderCard from './OrderCard';

interface Props {
  orders: KDSOrder[];
  onUpdateStatus: (orderId: string, status: KDSOrder['status']) => void;
  onPrint: (order: KDSOrder) => void;
  onConfirmCash?: (orderId: string) => void;
  onRejectCash?: (orderId: string) => void;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 select-none">
      <div className="text-3xl mb-2">—</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase px-1 pt-3 pb-1">
      {label}
    </div>
  );
}

function sortColumn(orders: KDSOrder[]): { pending: KDSOrder[]; inProg: KDSOrder[]; open: KDSOrder[] } {
  const pending = orders
    .filter((o) => o.status === 'PENDING_PAYMENT')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const inProg = orders
    .filter((o) => o.status === 'IN_PROGRESS')
    .sort((a, b) => (a.startedAt ?? a.createdAt).localeCompare(b.startedAt ?? b.createdAt));
  const open = orders
    .filter((o) => o.status === 'OPEN')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { pending, inProg, open };
}

function Column({
  orders,
  label,
  headerClass,
  emptyLabel,
  onUpdateStatus,
  onPrint,
  onConfirmCash,
  onRejectCash,
}: {
  orders: KDSOrder[];
  label: string;
  headerClass: string;
  emptyLabel: string;
  onUpdateStatus: Props['onUpdateStatus'];
  onPrint: Props['onPrint'];
  onConfirmCash?: Props['onConfirmCash'];
  onRejectCash?: Props['onRejectCash'];
}) {
  const { pending, inProg, open } = sortColumn(orders);
  const total = pending.length + inProg.length + open.length;

  return (
    <div className="flex-1 min-w-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border last:border-0 min-h-0">
      {/* 컬럼 헤더 */}
      <div className={`sticky top-0 z-10 flex items-center gap-2 px-3 py-2.5 border-b border-border ${headerClass}`}>
        <span className="text-xs font-bold tracking-widest uppercase">{label}</span>
        <Badge variant="secondary" className="h-5 px-2 text-xs">{total}</Badge>
        {pending.length > 0 && (
          <Badge className="h-5 px-2 text-xs bg-amber-500 text-black hover:bg-amber-500">
            {pending.length} cash
          </Badge>
        )}
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {total === 0 && <EmptyState label={emptyLabel} />}

        {pending.length > 0 && (
          <>
            <SectionLabel label="💵 Cash — Awaiting Payment" />
            {pending.map((o) => (
              <OrderCard key={o.id} order={o} onUpdateStatus={onUpdateStatus} onPrint={onPrint} onConfirmCash={onConfirmCash} onRejectCash={onRejectCash} />
            ))}
          </>
        )}

        {inProg.length > 0 && (
          <>
            {(open.length > 0 || pending.length > 0) && <SectionLabel label="In Progress" />}
            {inProg.map((o) => (
              <OrderCard key={o.id} order={o} onUpdateStatus={onUpdateStatus} onPrint={onPrint} />
            ))}
          </>
        )}

        {open.length > 0 && (
          <>
            {(inProg.length > 0 || pending.length > 0) && <SectionLabel label="Incoming" />}
            {open.map((o) => (
              <OrderCard key={o.id} order={o} onUpdateStatus={onUpdateStatus} onPrint={onPrint} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function ActiveTabView({ orders, onUpdateStatus, onPrint, onConfirmCash, onRejectCash }: Props) {
  const kioskOrders  = orders.filter((o) => o.source === 'Kiosk');
  const onlineOrders = orders.filter((o) => o.source !== 'Kiosk');

  return (
    // portrait (< 1024px): 위아래 스택 / landscape (≥ 1024px): 좌우 50/50
    <div className="flex flex-col lg:flex-row h-full min-h-0 overflow-hidden">
      <Column
        orders={kioskOrders}
        label="Kiosk"
        headerClass="bg-blue-900/20"
        emptyLabel="No Kiosk Orders"
        onUpdateStatus={onUpdateStatus}
        onPrint={onPrint}
        onConfirmCash={onConfirmCash}
        onRejectCash={onRejectCash}
      />
      <Column
        orders={onlineOrders}
        label="Online / Delivery"
        headerClass="bg-purple-900/20"
        emptyLabel="No Online Orders"
        onUpdateStatus={onUpdateStatus}
        onPrint={onPrint}
      />
    </div>
  );
}
