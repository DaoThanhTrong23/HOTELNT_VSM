import { it } from 'vitest';
import { error as webdriverError } from 'selenium-webdriver';
import { ProfilePage } from '../pages/profile-page.js';
import { FIGMA_COLORS } from '../support/design-tokens.js';
import { DEFAULT_TIMEOUT, browserSession } from '../support/driver.js';
import { HOST_USER } from '../support/session.js';
import { normalizeText, toHex } from '../support/soft-check.js';

// TC_PRF_01–03, tab "TC - Host (Chủ cơ sở)" of docs/Test-case-HOTELNT.xlsx.
// Each point of the Expected Result is one check, worded as in the sheet; a point that differs fails the case.

const session = browserSession();
const profilePage = () => new ProfilePage(session.driver, session.baseUrl);

const FIELDS = [
  { id: 'profile-hoTen', name: 'Họ tên' },
  { id: 'profile-soDienThoai', name: 'SĐT' },
  { id: 'profile-email', name: 'Email' },
  { id: 'profile-cccd', name: 'CCCD' },
];
const LOCKED_FIELDS = FIELDS.slice(2);
const NEW_NAME = 'Nguyễn Văn Host Mới';
const NEW_PHONE = '0905999888';
const WRONG_OLD_PASSWORD = 'SaiMatKhau@1';
const SHORT_NEW_PASSWORD = 'Ab1@';
const MISMATCHED_CONFIRM = 'Ab1@x';
const VALID_NEW_PASSWORD = 'Abcdefg1_';
const PASSWORD_ERRORS = [
  { id: 'password-oldPassword', field: 'mật khẩu cũ', message: 'Mật khẩu cũ không chính xác' },
  { id: 'password-newPassword', field: 'mật khẩu mới', message: 'Mật khẩu mới phải từ 8 ký tự trở lên' },
  { id: 'password-confirmPassword', field: 'xác nhận', message: 'Mật khẩu xác nhận không trùng khớp' },
];
// Typing into a read-only input may be refused by the driver instead of being ignored; both mean "not editable".
const NOT_EDITABLE_ERRORS = [webdriverError.InvalidElementStateError, webdriverError.ElementNotInteractableError];

const textsOf = (buttons) =>
  buttons
    .filter((button) => button.text)
    .map((button) => `'${button.text}'${button.enabled ? '' : ' (đang tắt)'}`)
    .join(', ') || '(không có)';

// Gray = low saturation, neither near black nor near white (slate/gray 300–700 such as #64748B).
const isGray = (hex) => {
  const match = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/.exec(hex);
  if (!match) return false;
  const [r, g, b] = match.slice(1).map((part) => parseInt(part, 16));
  const average = (r + g + b) / 3;
  return Math.max(r, g, b) - Math.min(r, g, b) <= 60 && average >= 60 && average <= 215;
};

const fillPasswords = async (page, { oldPassword, newPassword, confirmPassword }) => {
  await page.replaceText('password-oldPassword', oldPassword);
  await page.replaceText('password-newPassword', newPassword);
  await page.replaceText('password-confirmPassword', confirmPassword);
};

it('TC_PRF_01: Hiển thị thông tin cá nhân Host và KHÓA trường Email, CCCD', async (context) => {
  const soft = session.start(context);
  const page = profilePage();
  await page.open();
  const values = Object.fromEntries(await Promise.all(FIELDS.map(async ({ id }) => [id, await page.valueOf(id)])));

  await soft.check('Hiển thị đầy đủ Họ tên, SĐT, Email, CCCD', () => ({
    ok: FIELDS.every(({ id }) => values[id]),
    actual: FIELDS.map(({ id, name }) => `${name} '${values[id] ?? ''}'`).join(', '),
  }));
  await soft.check('CCCD (12 số)', () => {
    const cccd = values['profile-cccd'] ?? '';
    return {
      ok: /^[0-9*]{12}$/.test(cccd),
      actual: `CCCD '${cccd}' (${cccd.length} ký tự${cccd.includes('*') ? ', che một phần' : ''})`,
    };
  });
  await soft.check('Trường Email và CCCD BẮT BUỘC BỊ KHÓA (Read-only)', async () => {
    const states = await Promise.all(
      LOCKED_FIELDS.map(async ({ id, name }) => {
        const input = await page.field(id);
        return { name, locked: (await input.getAttribute('readonly')) !== null || !(await input.isEnabled()) };
      }),
    );
    return {
      ok: states.every((state) => state.locked),
      actual: states.map((state) => `${state.name} ${state.locked ? 'chỉ đọc' : 'sửa được'}`).join(', '),
    };
  });
  await soft.check('Có icon ổ khóa xám', async () => {
    const icons = await page.lockIcons(LOCKED_FIELDS.map(({ id }) => id));
    const results = icons.map((icon, index) => {
      const { name } = LOCKED_FIELDS[index];
      if (!icon.color) return { ok: false, text: `${name} không có icon ổ khóa` };
      const hex = toHex(icon.color);
      return { ok: isGray(hex), text: `${name} có icon ổ khóa màu ${hex}` };
    });
    return { ok: results.every((result) => result.ok), actual: results.map((result) => result.text).join(', ') };
  });
  await soft.check('Không thể click chỉnh sửa', async () => {
    const results = [];
    for (const { id, name } of LOCKED_FIELDS) {
      const before = await page.valueOf(id);
      try {
        const input = await page.field(id);
        await input.click();
        await input.sendKeys('x');
      } catch (error) {
        if (!NOT_EDITABLE_ERRORS.some((type) => error instanceof type)) throw error;
      }
      results.push({ name, changed: (await page.valueOf(id)) !== before });
    }
    return {
      ok: results.every((result) => !result.changed),
      actual: results.map((result) => `${result.name} ${result.changed ? 'gõ được' : 'gõ không đổi giá trị'}`).join(', '),
    };
  });

  soft.note('Cách đọc: "CCCD (12 số)" là 12 ký tự đã che một phần (ví dụ 079******234), đúng như API trả về và SRS FR-13.');
  soft.assertAll();
});

it('TC_PRF_02: Cập nhật Họ tên và Số điện thoại cá nhân hợp lệ', async (context) => {
  const soft = session.start(context);
  const page = profilePage();
  const { driver } = session;
  await page.open();

  const typedName = await page.replaceText('profile-hoTen', NEW_NAME);
  const typedPhone = await page.replaceText('profile-soDienThoai', NEW_PHONE);
  if (typedName !== NEW_NAME || typedPhone !== NEW_PHONE) {
    throw new Error(`Không nhập được dữ liệu test: họ tên '${typedName}', SĐT '${typedPhone}'`);
  }

  const buttons = await page.buttonsOf(await page.profileForm());
  const asked = buttons.find((button) => button.text === 'Lưu thay đổi');
  await soft.check("Bấm 'Lưu thay đổi' (bước 3)", () => ({
    ok: Boolean(asked),
    actual: asked ? "Có nút 'Lưu thay đổi'" : `Không có nút 'Lưu thay đổi' (nút hiện có: ${textsOf(buttons)})`,
  }));
  const save = asked?.el ?? (await page.submitButtonOf(await page.profileForm()));
  const saveText = (await save.getText()).trim();
  if (!asked) soft.note(`Đã bấm nút lưu thật '${saveText}' để kiểm tiếp các ý sau.`);
  await save.click();

  // The toast closes after 4s, so it is read right away and checked in sheet order below.
  const toast = await page.toast().catch(() => null);
  const toastSeen = toast ? { text: normalizeText(await toast.getText()), color: toHex(await toast.getCssValue('color')) } : null;

  await soft.check('Hệ thống lưu thành công', async () => {
    const banners = await page.banners(await page.profileForm());
    const name = await page.valueOf('profile-hoTen');
    const phone = await page.valueOf('profile-soDienThoai');
    return {
      ok: banners.length === 0 && name === NEW_NAME && phone === NEW_PHONE,
      actual: banners.length ? `Báo lỗi: ${normalizeText(banners[0])}` : `Không báo lỗi, ô Họ tên '${name}', SĐT '${phone}'`,
    };
  });
  await soft.check("Toast xanh 'Cập nhật thông tin thành công'", () => ({
    ok: Boolean(toastSeen?.text.includes('Cập nhật thông tin thành công')) && toastSeen.color === FIGMA_COLORS.success,
    actual: toastSeen ? `Toast "${toastSeen.text}", chữ ${toastSeen.color}` : 'Không có toast',
  }));
  await soft.check('Tên trên thanh Sidebar/Navbar tự động cập nhật', async () => {
    let text = '';
    await driver
      .wait(async () => {
        text = await page.sidebarText();
        return text.includes(NEW_NAME);
      }, 2000)
      .catch(() => {});
    if (text.includes(NEW_NAME)) return { ok: true, actual: `Sidebar hiện '${NEW_NAME}'` };
    return { ok: false, actual: text.includes(HOST_USER.name) ? `Sidebar vẫn hiện '${HOST_USER.name}'` : 'Sidebar không hiện tên mới' };
  });
  soft.assertAll();
});

it('TC_PRF_03: Validate form Đổi mật khẩu tài khoản Host', async (context) => {
  const soft = session.start(context);
  const page = profilePage();
  const { driver } = session;

  // Extra pass, recorded in the notes only: the old password message needs a valid new password to reach the server.
  // It runs first so a failure screenshot shows the sheet's own pass.
  try {
    await page.open();
    await fillPasswords(page, { oldPassword: WRONG_OLD_PASSWORD, newPassword: VALID_NEW_PASSWORD, confirmPassword: VALID_NEW_PASSWORD });
    const submit = await page.submitButtonOf(await page.passwordForm());
    const submitText = (await submit.getText()).trim();
    await submit.click();
    await driver.wait(async () => (await page.errorOf('password-oldPassword')) !== '', DEFAULT_TIMEOUT).catch(() => {});
    const message = await page.errorOf('password-oldPassword');
    soft.note(
      `Lượt phụ (mật khẩu cũ sai, mật khẩu mới hợp lệ '${VALID_NEW_PASSWORD}', bấm '${submitText}'): dưới ô mật khẩu cũ ${message ? `hiện '${message}'` : 'không có lỗi'}`,
    );
  } catch (error) {
    soft.note(`Lượt phụ không chạy được: ${String(error?.message ?? error).split('\n')[0]}`);
  }

  await page.open();
  await fillPasswords(page, { oldPassword: WRONG_OLD_PASSWORD, newPassword: SHORT_NEW_PASSWORD, confirmPassword: MISMATCHED_CONFIRM });
  const buttons = await page.buttonsOf(await page.passwordForm());
  const asked = buttons.find((button) => button.text === 'Lưu');

  await soft.check('Bấm Lưu (bước 4)', () => ({
    ok: Boolean(asked?.enabled),
    actual: asked ? `Nút 'Lưu' ${asked.enabled ? 'bấm được' : 'đang tắt'}` : `Không có nút 'Lưu' (nút hiện có: ${textsOf(buttons)})`,
  }));
  const submit = asked ?? buttons.at(-1);
  if (submit?.enabled) {
    if (!asked) soft.note(`Đã bấm nút thật '${submit.text}' để kiểm tiếp các ý sau.`);
    await submit.el.click();
    await driver.wait(async () => (await page.errorOf('password-oldPassword')) !== '', 3000).catch(() => {});
  } else if (submit) {
    soft.note(`Nút '${submit.text}' đang tắt nên không gửi được; các câu lỗi được kiểm là câu hiện ngay khi nhập.`);
  }

  for (const { id, field, message } of PASSWORD_ERRORS) {
    await soft.check(`Hệ thống báo lỗi '${message}'`, async () => {
      const shown = await page.errorOf(id);
      return {
        ok: normalizeText(shown).includes(normalizeText(message)),
        actual: `Dưới ô ${field}: ${shown ? `'${shown}'` : '(không có lỗi)'}`,
      };
    });
  }

  soft.note('Post-condition "Mật khẩu mới được cập nhật, yêu cầu đăng nhập lại" là của trường hợp đổi thành công, không áp dụng cho dữ liệu sai của case này.');
  soft.assertAll();
});
