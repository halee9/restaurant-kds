import { useRef, useEffect, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { KDSOrder } from '../types';
import { useKDSStore } from '../stores/kdsStore';
import { TicketContent } from './OrderTicketModal';

interface Props {
  order: KDSOrder;
  onDone: () => void;
}

/**
 * Invisible component — auto-triggers a full ticket print on mount via react-to-print.
 * Used for auto-print (order → IN_PROGRESS) and direct print icon click.
 * Calls onDone() after print completes (or if print dialog is cancelled).
 */
export default function SilentPrintTicket({ order, onDone }: Props) {
  const { menuDisplayConfig } = useKDSStore();
  const { menuItems, modifiers } = menuDisplayConfig;
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Order-${order.displayId}`,
    onAfterPrint: onDone,
  });

  const triggerPrint = useCallback(handlePrint, [handlePrint]);

  useEffect(() => {
    const timer = setTimeout(triggerPrint, 100);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hidden">
      <div ref={printRef}>
        <div className="p-5 font-mono text-black bg-white text-sm" style={{ width: 280 }}>
          <TicketContent order={order} menuItems={menuItems} modifiers={modifiers} />
        </div>
      </div>
    </div>
  );
}
