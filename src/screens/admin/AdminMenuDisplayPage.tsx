import { useAdminStore } from '../../stores/adminStore';
import MenuDisplayEditor from '../../components/MenuDisplayEditor';

export default function AdminMenuDisplayPage() {
  const restaurantCode = useAdminStore((s) => s.restaurantCode)!;
  const pin = useAdminStore((s) => s.pin);

  return (
    <div className="px-4 py-6">
      <MenuDisplayEditor restaurantCode={restaurantCode} pin={pin} />
    </div>
  );
}
