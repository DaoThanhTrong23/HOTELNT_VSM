import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AiChatbot } from '../components/common/AiChatbot';

export const TouristLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F4E8]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AiChatbot />
    </div>
  );
};
