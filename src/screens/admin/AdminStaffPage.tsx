import { useAdminStore } from '../../stores/adminStore';
import StaffManager from '../../components/StaffManager';

export default function AdminStaffPage() {
  const config = useAdminStore((s) => s.config)!;
  const pin = useAdminStore((s) => s.pin);
  const updateConfig = useAdminStore((s) => s.updateConfig);

  return (
    <div className="px-4 py-6">
      <StaffManager
        restaurantCode={config.restaurant_code}
        restaurantName={config.name}
        pin={pin}
        payPeriodStart={config.pay_period_start ?? null}
        onPayPeriodStartSaved={(d) => updateConfig({ ...config, pay_period_start: d })}
      />
    </div>
  );
}
