import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HostProfilePage } from '../HostProfilePage';
import { AuthContext } from '../../../context/AuthContext';

const mockUser = {
  name: 'Nguyễn Văn Quân',
  phone: '0905123456',
  email: 'quan.host@nhatranghotels.vn',
  role: 'HOST',
};

const renderComponent = (customUser = mockUser) => {
  return render(
    <AuthContext.Provider
      value={{
        user: customUser,
        token: 'mock-token',
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true,
        isHost: true,
        isAdmin: false,
      }}
    >
      <HostProfilePage />
    </AuthContext.Provider>
  );
};

describe('HostProfilePage (TDD Suite: PROF-01 -> PROF-10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // PROF-01: Email field is readOnly, cannot be edited, has lock icon, CBD5E1 styling
  it('PROF-01: locks email field with readOnly attribute and legal protection note (FR-13)', () => {
    renderComponent();

    const emailInput = screen.getByTestId('readonly-email-input');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('readonly');
    expect(emailInput).toHaveValue('quan.host@nhatranghotels.vn');

    // Attempting to type should not change value
    fireEvent.change(emailInput, { target: { value: 'hacker@malicious.com' } });
    expect(emailInput).toHaveValue('quan.host@nhatranghotels.vn');

    // Check lock icon indicator
    expect(screen.getByTestId('email-lock-icon')).toBeInTheDocument();
  });

  // PROF-02: CCCD field is readOnly, displays masked format 056******432 and lock icon
  it('PROF-02: locks and masks legal CCCD number as 056******432 by default (FR-13)', () => {
    renderComponent();

    const cccdInput = screen.getByTestId('readonly-cccd-input');
    expect(cccdInput).toBeInTheDocument();
    expect(cccdInput).toHaveAttribute('readonly');
    expect(cccdInput).toHaveValue('056******432');
    expect(screen.getByTestId('cccd-lock-icon')).toBeInTheDocument();
  });

  // PROF-03: Toggle CCCD eye icon switches between masked 056******432 and full 056098765432
  it('PROF-03: allows host to toggle unmasking CCCD number to verify full 12 digits', () => {
    renderComponent();

    const cccdInput = screen.getByTestId('readonly-cccd-input');
    const toggleBtn = screen.getByTestId('toggle-cccd-visibility-btn');

    expect(cccdInput).toHaveValue('056******432');

    // Click to reveal
    fireEvent.click(toggleBtn);
    expect(cccdInput).toHaveValue('056098765432');

    // Click again to mask
    fireEvent.click(toggleBtn);
    expect(cccdInput).toHaveValue('056******432');
  });

  // PROF-04: Phone number validation for 10 digits starting with 0
  it('PROF-04: validates Vietnamese mobile phone format and blocks invalid submissions', () => {
    renderComponent();

    const phoneInput = screen.getByTestId('profile-phone-input');
    const submitBtn = screen.getByTestId('save-profile-btn');

    // Enter invalid phone: 9 digits
    fireEvent.change(phoneInput, { target: { value: '090123456' } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/Số điện thoại phải gồm 10 chữ số bắt đầu bằng số 0/i)
    ).toBeInTheDocument();

    // Enter invalid phone: does not start with 0
    fireEvent.change(phoneInput, { target: { value: '1905123456' } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/Số điện thoại phải gồm 10 chữ số bắt đầu bằng số 0/i)
    ).toBeInTheDocument();
  });

  // PROF-05: Submit name and valid phone successfully, displays green success toast
  it('PROF-05: displays green success toast when updating contact information with valid data', () => {
    renderComponent();

    const nameInput = screen.getByTestId('profile-name-input');
    const phoneInput = screen.getByTestId('profile-phone-input');
    const submitBtn = screen.getByTestId('save-profile-btn');

    fireEvent.change(nameInput, { target: { value: 'Nguyễn Văn Quân Mới' } });
    fireEvent.change(phoneInput, { target: { value: '0912345678' } });
    fireEvent.click(submitBtn);

    const successToast = screen.getByTestId('profile-feedback-toast');
    expect(successToast).toBeInTheDocument();
    expect(successToast.className).toMatch(/bg-\[#DCFCE7\]|text-\[#15803D\]/);
    expect(screen.getByText(/Cập nhật thông tin liên lạc thành công/i)).toBeInTheDocument();
  });

  // PROF-06: Password strength indicator for new password (FR-11)
  it('PROF-06: evaluates password strength dynamically according to 5 criteria (FR-11)', () => {
    renderComponent();

    const newPasswordInput = screen.getByTestId('new-password-input');
    const strengthMeter = screen.getByTestId('password-strength-meter');

    // Weak password: only 6 chars
    fireEvent.change(newPasswordInput, { target: { value: '123456' } });
    expect(strengthMeter).toHaveAttribute('data-strength', 'weak');

    // Strong password meeting all 5 requirements: >=8 chars, uppercase, lowercase, number, special char
    fireEvent.change(newPasswordInput, { target: { value: 'HotelNT@2026' } });
    expect(strengthMeter).toHaveAttribute('data-strength', 'strong');
  });

  // PROF-07: Confirm password mismatch error in realtime
  it('PROF-07: displays realtime error and blocks submission when password confirmation does not match', () => {
    renderComponent();

    const newPasswordInput = screen.getByTestId('new-password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const submitPasswordBtn = screen.getByTestId('change-password-btn');

    fireEvent.change(newPasswordInput, { target: { value: 'HotelNT@2026' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'HotelNT@9999' } });

    expect(
      screen.getByText(/Xác nhận mật khẩu mới không trùng khớp/i)
    ).toBeInTheDocument();

    fireEvent.click(submitPasswordBtn);
    // Should block and keep showing error
    expect(
      screen.getByText(/Xác nhận mật khẩu mới không trùng khớp/i)
    ).toBeInTheDocument();
  });

  // PROF-08: Change password succeeds when valid, shows success toast and clears password fields
  it('PROF-08: resets password inputs and shows success feedback on valid password change', () => {
    renderComponent();

    const oldPasswordInput = screen.getByTestId('old-password-input');
    const newPasswordInput = screen.getByTestId('new-password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const submitPasswordBtn = screen.getByTestId('change-password-btn');

    fireEvent.change(oldPasswordInput, { target: { value: 'CurrentPass@123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'HotelNT@2026' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'HotelNT@2026' } });

    fireEvent.click(submitPasswordBtn);

    const successToast = screen.getByTestId('password-feedback-toast');
    expect(successToast).toBeInTheDocument();
    expect(screen.getByText(/Đổi mật khẩu thành công/i)).toBeInTheDocument();

    // Inputs cleared
    expect(oldPasswordInput).toHaveValue('');
    expect(newPasswordInput).toHaveValue('');
    expect(confirmPasswordInput).toHaveValue('');
  });

  // PROF-09: Dev Kit black color check (buttons have bg-black text-white)
  it('PROF-09: enforces Dev Kit black color (#000000) for all primary form submit buttons', () => {
    renderComponent();

    const saveProfileBtn = screen.getByTestId('save-profile-btn');
    const changePasswordBtn = screen.getByTestId('change-password-btn');

    expect(saveProfileBtn.className).toMatch(/bg-black/);
    expect(saveProfileBtn.className).toMatch(/text-white/);
    expect(saveProfileBtn.className).not.toMatch(/102A3A/);

    expect(changePasswordBtn.className).toMatch(/bg-black/);
    expect(changePasswordBtn.className).toMatch(/text-white/);
    expect(changePasswordBtn.className).not.toMatch(/102A3A/);
  });

  // PROF-10: Touch target ergonomics: submit buttons have min-h-[44px], toggle buttons have proper dimensions
  it('PROF-10: ensures touch target ergonomics (min 44px) for mobile usability', () => {
    renderComponent();

    const saveProfileBtn = screen.getByTestId('save-profile-btn');
    const changePasswordBtn = screen.getByTestId('change-password-btn');
    const toggleCccdBtn = screen.getByTestId('toggle-cccd-visibility-btn');

    expect(saveProfileBtn.className).toMatch(/min-h-\[44px\]|h-11/);
    expect(changePasswordBtn.className).toMatch(/min-h-\[44px\]|h-11/);
    expect(toggleCccdBtn.className).toMatch(/min-h-\[44px\]|w-11|h-11|p-2\.5|p-3/);
  });
});
