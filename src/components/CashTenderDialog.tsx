import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Delete, Banknote, X } from 'lucide-react';
import { formatMoney } from '../utils';
import type { KDSOrder } from '../types';

interface Props {
  order: KDSOrder | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, cashTendered?: number, cashChange?: number) => Promise<void>;
  onReject: (orderId: string) => Promise<void>;
}

export default function CashTenderDialog({ order, open, onClose, onConfirm, onReject }: Props) {
  const [cents, setCents] = useState(0); // all input in cents
  const [loading, setLoading] = useState(false);

  // Reset input when dialog opens
  useEffect(() => {
    if (open) setCents(0);
  }, [open]);

  const totalCents = order?.totalMoney ?? 0;
  const changeCents = cents - totalCents;
  const canConfirm = cents >= totalCents && cents > 0;

  const handleDigit = useCallback((digit: string) => {
    setCents((prev) => {
      const next = prev * 10 + Number(digit);
      if (next > 99999) return prev; // max $999.99
      return next;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setCents((prev) => Math.floor(prev / 10));
  }, []);

  const handleClear = useCallback(() => {
    setCents(0);
  }, []);

  const handleQuickAmount = useCallback((dollars: number) => {
    setCents((prev) => prev + dollars * 100); // accumulate
  }, []);

  const handleExact = useCallback(() => {
    setCents(totalCents);
  }, [totalCents]);

  const handleConfirm = async () => {
    if (!order || !canConfirm) return;
    setLoading(true);
    try {
      await onConfirm(order.id, cents, changeCents);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!order) return;
    setLoading(true);
    try {
      await onReject(order.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Keyboard support
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Escape') onClose();
      else if (e.key === 'Enter' && canConfirm) handleConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (!order) return null;

  const digitBtn = (digit: string) => (
    <button
      key={digit}
      type="button"
      onClick={() => handleDigit(digit)}
      disabled={loading}
      className="w-16 h-16 rounded-xl bg-secondary hover:bg-secondary/80 active:scale-95 text-xl font-bold text-foreground transition-all disabled:opacity-50"
    >
      {digit}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Banknote className="text-amber-500" size={20} />
            Cash Payment — #{order.displayId} {order.displayName}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Order items summary */}
          <div className="text-sm space-y-1 max-h-32 overflow-auto">
            {order.lineItems.map((item, i) => (
              <div key={i} className="flex justify-between text-muted-foreground">
                <span>{item.name} ×{item.quantity}</span>
                <span>{formatMoney(item.totalMoney)}</span>
              </div>
            ))}
          </div>

          {/* Total due */}
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="font-semibold">Total Due</span>
            <span className="text-2xl font-bold">{formatMoney(totalCents)}</span>
          </div>

          {/* Amount display */}
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Amount Tendered</div>
            <div className="text-3xl font-bold font-mono tracking-wider">
              {formatMoney(cents)}
            </div>
          </div>

          {/* Change display */}
          {canConfirm && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">Change Due</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatMoney(changeCents)}
              </div>
            </div>
          )}

          {/* Quick amounts (accumulative) */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleExact}>
              Exact
            </Button>
            {[1, 5, 10, 20, 50].map((amt) => (
              <Button key={amt} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleQuickAmount(amt)}>
                +${amt}
              </Button>
            ))}
          </div>

          {/* Keypad */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => digitBtn(d))}
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="w-16 h-16 rounded-xl bg-muted hover:bg-muted/80 active:scale-95 text-sm font-semibold text-muted-foreground transition-all disabled:opacity-50"
              >
                CLR
              </button>
              {digitBtn('0')}
              <button
                type="button"
                onClick={handleBackspace}
                disabled={loading}
                className="w-16 h-16 rounded-xl bg-muted hover:bg-muted/80 active:scale-95 flex items-center justify-center text-muted-foreground transition-all disabled:opacity-50"
              >
                <Delete size={20} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="destructive" size="sm" onClick={handleReject} disabled={loading} className="gap-1">
              <X size={16} /> Cancel Order
            </Button>
            <Button
              className="flex-1 gap-1"
              onClick={handleConfirm}
              disabled={!canConfirm || loading}
            >
              <Banknote size={16} /> Cash Paid
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
