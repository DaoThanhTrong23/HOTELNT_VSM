import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { HostLayout } from '../HostLayout';

const renderAt = (url) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route element={<HostLayout />}>
            <Route path="/host/*" element={<div>Nội dung trang</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );

const mobileTabs = () => screen.getByRole('navigation', { name: 'Điều hướng chính' });
const activeTab = () => within(mobileTabs()).getByRole('link', { current: 'page' });

describe('HostLayout: mobile navigation (Figma M11–M13)', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Khánh Quỳnh', role: 'HOST' }));
  });

  it('LAYOUT-01: renders the top bar and the 3-tab bottom bar', () => {
    renderAt('/host/dashboard');

    const topBar = screen.getByRole('banner');
    expect(within(topBar).getByRole('link', { name: 'LOGO' })).toHaveAttribute('href', '/host/dashboard');
    expect(within(topBar).getByRole('link', { name: 'Tài khoản của tôi' })).toHaveAttribute('href', '/host/profile');
    expect(within(topBar).getByRole('link', { name: 'Tài khoản của tôi' })).toHaveTextContent('K');

    const links = within(mobileTabs()).getAllByRole('link');
    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Quản lí cơ sở', '/host/dashboard'],
      ['Thêm cơ sở', '/host/hotels/new'],
      ['Tài khoản', '/host/profile'],
    ]);
    expect(screen.getByText('Nội dung trang')).toBeInTheDocument();
  });

  it.each([
    ['/host/dashboard?trangThai=PENDING', 'Quản lí cơ sở'],
    ['/host/hotels', 'Quản lí cơ sở'],
    ['/host/hotels/12/edit', 'Quản lí cơ sở'],
    ['/host/hotels/new?id=12&step=2', 'Thêm cơ sở'],
    ['/host/profile', 'Tài khoản'],
  ])('LAYOUT-02: marks the active tab for %s', (url, label) => {
    renderAt(url);
    expect(activeTab()).toHaveTextContent(label);
  });

  it('LAYOUT-03: keeps logout out of the mobile top bar (Figma puts it at the bottom of the Tài khoản page)', () => {
    renderAt('/host/dashboard');
    expect(within(screen.getByRole('banner')).queryByRole('button', { name: 'Đăng xuất' })).not.toBeInTheDocument();
  });
});
