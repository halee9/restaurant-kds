import { useAdminStore } from '../../stores/adminStore';
import OnlineStoreEditor from '../../components/OnlineStoreEditor';

export default function AdminOnlineStorePage() {
  const config = useAdminStore((s) => s.config)!;
  const pin = useAdminStore((s) => s.pin);
  const updateConfig = useAdminStore((s) => s.updateConfig);

  return (
    <div className="px-4 py-6">
      <OnlineStoreEditor config={config} pin={pin} onSaved={updateConfig} />
    </div>
  );
}
