import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';

export const HostLayout = () => {
  return (
    <div className="flex h-screen bg-[#F8F4E8] overflow-hidden">
      <Sidebar role="HOST" />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-6 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
