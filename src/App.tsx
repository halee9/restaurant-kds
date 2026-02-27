import { useEffect, useRef, useState } from 'react';
import { socket } from './socket';
import type { KDSOrder } from './types';
import OrderCard from './components/OrderCard';
import StatusBar from './components/StatusBar';
import PrintTicket from './components/PrintTicket';
import RestaurantLogin from './components/RestaurantLogin';

type FilterType = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export default function App() {
  const [restaurantCode, setRestaurantCode] = useState<string | null>(
    () => localStorage.getItem('kds_restaurant_code')
  );
  const [restaurantName, setRestaurantName] = useState<string>(
    () => localStorage.getItem('kds_restaurant_name') ?? ''
  );
  const [connected, setConnected] = useState(false);
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [printOrder, setPrintOrder] = useState<KDSOrder | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // restaurant_code로 Socket.io room join
  useEffect(() => {
    if (!restaurantCode) return;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', restaurantCode);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('joined', ({ room }: { room: string }) => {
      console.log('[KDS] Joined room:', room);
    });

    socket.on('order:new', (order: KDSOrder) => {
      setOrders(prev => {
        if (prev.find(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
      try { new Audio('/notification.mp3').play(); } catch (_) {}
    });

    socket.on('order:updated', (updated: Partial<KDSOrder> & { id: string }) => {
      setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
    });

    // 이미 연결돼 있으면 바로 join
    if (socket.connected) {
      setConnected(true);
      socket.emit('join', restaurantCode);
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('joined');
      socket.off('order:new');
      socket.off('order:updated');
    };
  }, [restaurantCode]);

  const handleJoin = (code: string, name: string) => {
    setRestaurantCode(code);
    setRestaurantName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('kds_restaurant_code');
    localStorage.removeItem('kds_restaurant_name');
    setRestaurantCode(null);
    setRestaurantName('');
    setOrders([]);
  };

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
    setTimeout(() => { window.print(); setPrintOrder(null); }, 100);
  };

  // 로그인 화면
  if (!restaurantCode) {
    return <RestaurantLogin onJoin={handleJoin} />;
  }

  const filteredOrders = orders.filter(o =>
    filter === 'ALL' ? true : o.status === filter
  );

  const orderCounts = {
    open: orders.filter(o => o.status === 'OPEN').length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <div ref={printRef}>
        {printOrder && <PrintTicket order={printOrder} />}
      </div>

      <StatusBar
        connected={connected}
        restaurantName={restaurantName}
        orderCounts={orderCounts}
        filter={filter}
        onFilterChange={setFilter}
        onLogout={handleLogout}
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
