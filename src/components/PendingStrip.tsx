import { Clock } from 'lucide-react';
import type { KDSOrder } from '../types';
import { formatTime } from '../utils';

interface Props {
  orders: KDSOrder[];
  now: number;
}

export default function PendingStrip({ orders, now }: Props) {
  return (
    <div className="no-print px-4 py-2 border-b border-border bg-muted/20">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1 pr-1">
          <Clock className="h-3 w-3" />
          UPCOMING
        </span>

        {orders.map((order) => {
          const mins = Math.round((new Date(order.pickupAt).getTime() - now) / 60_000);
          return (
            <div
              key={order.id}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/10 text-sm"
            >
              <span className="font-bold text-purple-300">#{order.displayId}</span>
              {order.displayName && (
                <span className="text-muted-foreground">{order.displayName}</span>
              )}
              <span className="text-purple-400 font-bold">
                {formatTime(order.pickupAt)}
              </span>
              <span className="text-purple-300/70 text-xs">
                ({mins}m)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
