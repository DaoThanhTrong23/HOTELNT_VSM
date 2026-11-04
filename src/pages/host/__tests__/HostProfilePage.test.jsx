import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import { HostProfilePage } from '../HostProfilePage';
import { ApiError, changeHostPassword, getHostProfile, updateHostProfile } from '../api/hostApi';

vi.mock('../api/hostApi', async (importOriginal) => ({
  ...(await importOriginal()),
  getHostProfile: vi.fn(),
  updateHostProfile: vi.fn(),
  changeHostPassword: vi.fn(),
}));

const PROFILE = {
  id: 7,
  vaiTro: 'HOST',
  trangThai: 'ACTIVE',
  hoTen: 'Khánh Quỳnh',
  soDienThoai: '0918736452',
  email: 'kq@gmail.vn',
  cccd: '079******234',
  ngayTao: '2026-09-01T00:00:00Z',
};

const renderPage = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/host/profile']}>
        <Routes>
          <Route path="/host/profile" element={<HostProfilePage />} />
          <Route path="/login" element={<div>Trang đăng nhập</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );

const renderReady = async () => {
  getHostProfile.mockResolvedValue(PROFILE);
  renderPage();
  await screen.findByDisplayValue('Khánh Quỳnh');
};

const nameInput = () => screen.getByLabelText('Họ và tên');
const phoneInput = () => screen.getByLabelText('Số điện thoại di động');
const saveButton = () => screen.getByRole('button', { name: 'Lưu thông tin' });
const cancelButton = () => screen.getByRole('button', { name: 'Hủy thay đổi' });
const oldPwd = () => screen.getByLabelText('Mật khẩu hiện tại');
const newPwd = () => screen.getByLabelText('Mật khẩu mới');
const confirmPwd = () => screen.getByLabelText('Xác nhận mật khẩu mới');
const pwdButton = () => screen.getByRole('button', { name: 'Cập nhật mật khẩu' });

const fillPasswords = (oldValue, newValue, confirmValue = newValue) => {
  fireEvent.change(oldPwd(), { target: { value: oldValue } });
  fireEvent.change(newPwd(), { target: { value: newValue } });
  fireEvent.change(confirmPwd(), { target: { value: confirmValue } });
};

describe('HostProfilePage: profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PROF-01: shows a spinner and loads the profile once', () => {
    getHostProfile.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByText('Đang tải hồ sơ...')).toBeInTheDocument();
    expect(getHostProfile).toHaveBeenCalledTimes(1);
  });

  it('PROF-02: renders API values, read-only identity fields and no Figma-only fields', async () => {
    await renderReady();

    expect(screen.getByRole('heading', { name: 'Hồ sơ cá nhân' })).toBeInTheDocument();
    expect(phoneInput()).toHaveValue('0918736452');
    expect(screen.getByLabelText('Căn cước công dân')).toHaveValue('079******234');
    expect(screen.getByLabelText('Căn cước công dân')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Địa chỉ Email')).toHaveValue('kq@gmail.vn');
    expect(screen.getByLabelText('Địa chỉ Email')).toHaveAttribute('readonly');
    expect(screen.getByTestId('profile-avatar')).toHaveTextContent('Q');
    expect(screen.getByText('Host')).toBeInTheDocument();

    expect(screen.queryByText(/Giới tính/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ngày sinh/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /CCCD/ })).not.toBeInTheDocument();
  });

  it('PROF-03: shows ErrorState on 500 and recovers on retry', async () => {
    getHostProfile
      .mockRejectedValueOnce(new ApiError({ status: 500, code: 'INTERNAL_ERROR' }))
      .mockResolvedValueOnce(PROFILE);
    renderPage();

    expect(await screen.findByText('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByDisplayValue('Khánh Quỳnh')).toBeInTheDocument();
    expect(getHostProfile).toHaveBeenCalledTimes(2);
  });

  it('PROF-04: shows the API message for ACCOUNT_LOCKED', async () => {
    getHostProfile.mockRejectedValue(
      new ApiError({ status: 403, code: 'ACCOUNT_LOCKED', message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' }),
    );
    renderPage();

    expect(await screen.findByText('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.')).toBeInTheDocument();
  });

  it('PROF-05: disables both buttons when nothing changed', async () => {
    await renderReady();
    expect(saveButton()).toBeDisabled();
    expect(cancelButton()).toBeDisabled();
  });

  it('PROF-06: "Hủy thay đổi" restores server values without calling the API', async () => {
    await renderReady();
    fireEvent.change(nameInput(), { target: { value: 'Tên mới' } });
    expect(cancelButton()).toBeEnabled();

    fireEvent.click(cancelButton());
    expect(nameInput()).toHaveValue('Khánh Quỳnh');
    expect(updateHostProfile).not.toHaveBeenCalled();
  });

  it('PROF-07: strips letters from the phone, flags the format and blocks saving', async () => {
    await renderReady();
    fireEvent.change(phoneInput(), { target: { value: '09ab12' } });

    expect(phoneInput()).toHaveValue('0912');
    expect(screen.getByText('Số điện thoại phải gồm 10 chữ số, bắt đầu bằng số 0.')).toBeInTheDocument();
    expect(phoneInput()).toHaveAttribute('aria-invalid', 'true');
    expect(saveButton()).toBeDisabled();
    fireEvent.submit(saveButton().closest('form'));
    expect(updateHostProfile).not.toHaveBeenCalled();
  });

  it('PROF-08: requires a name and caps it at 100 characters', async () => {
    await renderReady();
    expect(nameInput()).toHaveAttribute('maxLength', '100');

    fireEvent.change(nameInput(), { target: { value: '   ' } });
    expect(screen.getByText('Vui lòng nhập họ và tên.')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
    expect(updateHostProfile).not.toHaveBeenCalled();
  });

  it('PROF-09: sends only the changed phone and shows a toast', async () => {
    await renderReady();
    updateHostProfile.mockResolvedValue({ id: 7, hoTen: 'Khánh Quỳnh', soDienThoai: '0905111222', email: 'kq@gmail.vn' });

    fireEvent.change(phoneInput(), { target: { value: '0905111222' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(updateHostProfile).toHaveBeenCalledWith({ soDienThoai: '0905111222' }));
    expect(await screen.findByText('Cập nhật thông tin thành công')).toBeInTheDocument();
    expect(phoneInput()).toHaveValue('0905111222');
    expect(saveButton()).toBeDisabled();
  });

  it('PROF-10: shows ACCOUNT_DUPLICATED under the phone field', async () => {
    await renderReady();
    updateHostProfile.mockRejectedValue(
      new ApiError({ status: 409, code: 'ACCOUNT_DUPLICATED', message: 'Email, số điện thoại hoặc CCCD đã được sử dụng.' }),
    );

    fireEvent.change(phoneInput(), { target: { value: '0905111222' } });
    fireEvent.click(saveButton());

    expect(await screen.findByText('Email, số điện thoại hoặc CCCD đã được sử dụng.')).toBeInTheDocument();
    expect(phoneInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('PROF-11: maps VALIDATION_ERROR details[] to the name field', async () => {
    await renderReady();
    updateHostProfile.mockRejectedValue(
      new ApiError({
        status: 400,
        code: 'VALIDATION_ERROR',
        details: [{ field: 'hoTen', message: 'Họ tên chứa ký tự không hợp lệ' }],
      }),
    );

    fireEvent.change(nameInput(), { target: { value: 'Tên <script>' } });
    fireEvent.click(saveButton());

    expect(await screen.findByText('Họ tên chứa ký tự không hợp lệ')).toBeInTheDocument();
    expect(nameInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('PROF-12: shows the SRS banner on network or server failure', async () => {
    await renderReady();
    updateHostProfile.mockRejectedValue(new ApiError({ code: 'NETWORK_ERROR' }));

    fireEvent.change(nameInput(), { target: { value: 'Tên mới' } });
    fireEvent.click(saveButton());

    const banner = await screen.findByRole('alert');
    expect(banner).toHaveTextContent('Cập nhật thông tin không thành công do sự cố hệ thống. Vui lòng thử lại sau.');
  });

  it('PROF-13: calls the API once on a double click', async () => {
    await renderReady();
    updateHostProfile.mockReturnValue(new Promise(() => {}));

    fireEvent.change(nameInput(), { target: { value: 'Tên mới' } });
    const button = saveButton();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.submit(button.closest('form'));

    expect(updateHostProfile).toHaveBeenCalledTimes(1);
    expect(button).toHaveTextContent('Đang lưu...');
    expect(button).toBeDisabled();
  });
});

describe('HostProfilePage: logout on mobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Khánh Quỳnh', role: 'HOST' }));
  });

  it('PROF-14: "Đăng xuất" at the bottom of the page logs out (Figma mobile Hồ sơ)', async () => {
    await renderReady();

    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));

    expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('HostProfilePage: change password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PWD-01: lists the missing criteria and blocks submit', async () => {
    await renderReady();
    fillPasswords('Old@1234', 'Abcdefg1');

    expect(screen.getByText('Còn thiếu: ký tự đặc biệt')).toBeInTheDocument();
    expect(pwdButton()).toBeDisabled();
    fireEvent.submit(pwdButton().closest('form'));
    expect(changeHostPassword).not.toHaveBeenCalled();
  });

  it('PWD-02: accepts a password that meets all 5 criteria', async () => {
    await renderReady();
    fillPasswords('Old@1234', 'Abcdefg1_');

    expect(screen.queryByText(/Còn thiếu/)).not.toBeInTheDocument();
    expect(pwdButton()).toBeEnabled();
  });

  it('PWD-03: flags a mismatched confirmation', async () => {
    await renderReady();
    fillPasswords('Old@1234', 'Abcdefg1_', 'Abcdefg1-');

    expect(screen.getByText('Xác nhận mật khẩu mới không trùng khớp.')).toBeInTheDocument();
    expect(pwdButton()).toBeDisabled();
    expect(changeHostPassword).not.toHaveBeenCalled();
  });

  it('PWD-04: rejects a new password equal to the current one', async () => {
    await renderReady();
    fillPasswords('Abcdefg1_', 'Abcdefg1_');

    expect(screen.getByText('Mật khẩu mới phải khác mật khẩu hiện tại.')).toBeInTheDocument();
    expect(pwdButton()).toBeDisabled();
  });

  it('PWD-05: submits, clears the fields and shows a toast', async () => {
    await renderReady();
    changeHostPassword.mockResolvedValue({ message: 'Đổi mật khẩu thành công' });
    fillPasswords('Old@1234', 'Abcdefg1_');
    fireEvent.click(pwdButton());

    await waitFor(() =>
      expect(changeHostPassword).toHaveBeenCalledWith({ oldPassword: 'Old@1234', newPassword: 'Abcdefg1_' }),
    );
    expect(
      await screen.findByText('Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được đăng xuất.'),
    ).toBeInTheDocument();
    expect(oldPwd()).toHaveValue('');
    expect(newPwd()).toHaveValue('');
    expect(confirmPwd()).toHaveValue('');
  });

  it('PWD-06: shows OLD_PASSWORD_INCORRECT under the current password', async () => {
    await renderReady();
    changeHostPassword.mockRejectedValue(
      new ApiError({ status: 400, code: 'OLD_PASSWORD_INCORRECT', message: 'Mật khẩu cũ không chính xác.' }),
    );
    fillPasswords('Wrong@123', 'Abcdefg1_');
    fireEvent.click(pwdButton());

    expect(await screen.findByText('Mật khẩu cũ không chính xác.')).toBeInTheDocument();
    expect(oldPwd()).toHaveAttribute('aria-invalid', 'true');
  });

  it('PWD-07: shows a server VALIDATION_ERROR under the new password', async () => {
    await renderReady();
    changeHostPassword.mockRejectedValue(
      new ApiError({ status: 400, code: 'VALIDATION_ERROR', message: 'Mật khẩu mới không đạt chuẩn.' }),
    );
    fillPasswords('Old@1234', 'Abcdefg1_');
    fireEvent.click(pwdButton());

    expect(await screen.findByText('Mật khẩu mới không đạt chuẩn.')).toBeInTheDocument();
    expect(newPwd()).toHaveAttribute('aria-invalid', 'true');
  });
});
