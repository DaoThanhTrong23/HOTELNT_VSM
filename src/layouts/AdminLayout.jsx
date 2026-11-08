import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-[#F8F4E8] overflow-hidden">
      <Sidebar role="ADMIN" pendingCount={12} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <main className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
