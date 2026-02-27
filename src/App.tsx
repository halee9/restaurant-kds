import { useEffect, useRef, useState } from 'react';
import { socket } from './socket';
import type { KDSOrder } from './types';
import OrderCard from './components/OrderCard';
import StatusBar from './components/StatusBar';
import PrintTicket from './components/PrintTicket';

type FilterType = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [printOrder, setPrintOrder] = useState<KDSOrder | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // 새 주문 수신
    socket.on('order:new', (order: KDSOrder) => {
      setOrders(prev => {
        const exists = prev.find(o => o.id === order.id);
        if (exists) return prev;
        return [order, ...prev];
      });
      try { new Audio('/notification.mp3').play(); } catch (_) {}
    });

    // 주문 상태 업데이트 - 부분 데이터를 머지 (기존 lineItems 등 보존)
    socket.on('order:updated', (updated: Partial<KDSOrder> & { id: string }) => {
      setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('order:new');
      socket.off('order:updated');
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, status: KDSOrder['status']) => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    try {
      await fetch(`${serverUrl}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
      ));
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  const handlePrint = (order: KDSOrder) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
      setPrintOrder(null);
    }, 100);
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  const orderCounts = {
    open: orders.filter(o => o.status === 'OPEN').length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* 프린트 티켓 (화면에는 숨김, 프린트 시에만 표시) */}
      <div ref={printRef}>
        {printOrder && <PrintTicket order={printOrder} />}
      </div>

      <StatusBar
        connected={connected}
        orderCounts={orderCounts}
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className="no-print px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Kitchen Display</h1>
        <span className="text-sm text-gray-400">{filteredOrders.length} orders</span>
      </div>

      <div className="flex-1 px-6 pb-6">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600">
            <div className="text-5xl mb-4">🍽️</div>
            <div className="text-lg">No orders yet</div>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                onPrint={handlePrint}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
