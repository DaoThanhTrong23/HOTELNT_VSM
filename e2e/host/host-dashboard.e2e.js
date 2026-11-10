import { it } from 'vitest';
import { By } from 'selenium-webdriver';
import { DashboardPage } from '../pages/dashboard-page.js';
import { ListingEditPage } from '../pages/listing-edit-page.js';
import { DRAFT_TOKEN_NOT_IN_TEST_PLAN, FIGMA_COLORS } from '../support/design-tokens.js';
import { browserSession, waitForUrl } from '../support/driver.js';
import { normalizeText, toHex } from '../support/soft-check.js';

// TC_HDB_01–08, tab "TC - Host (Chủ cơ sở)" of docs/Test-case-HOTELNT.xlsx.
// Each point of the Expected Result is one check, worded as in the sheet; a point that differs fails the case.

const session = browserSession();
const dashboard = () => new DashboardPage(session.driver, session.baseUrl);
const isMock = () => session.target === 'mock';

// Tab and badge labels as the sheet writes them.
const TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'DRAFT', label: 'Bản nháp' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Bị từ chối' },
  { key: 'HIDDEN', label: 'Ẩn' },
];
const STATUS_LABELS = TABS.slice(1).map((tab) => tab.label);
const STAT_CARDS = ['Tổng số', 'Đang hiển thị', 'Chờ duyệt', 'Bị từ chối'];
const BADGE_COLORS = [
  { label: 'Đã duyệt', hex: FIGMA_COLORS.approved },
  { label: 'Chờ duyệt', hex: FIGMA_COLORS.pending },
  { label: 'Bị từ chối', hex: FIGMA_COLORS.rejected },
];
// Seed reason of listing 2 in src/pages/host/api/hostMockApi.js.
const MOCK_REJECT_REASON =
  'Ảnh bìa không đúng với cơ sở và địa chỉ chưa khớp với vị trí ghim trên bản đồ. Vui lòng sửa rồi gửi kiểm duyệt lại.';
const DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;
const DEBOUNCE_MS = 400;
// performance.now() and the browser timer can differ by a few ms.
const TIMER_SLACK_MS = 5;

const pathOf = async (driver) => new URL(await driver.getCurrentUrl()).pathname;
const urlText = (url) => `${url.pathname}${url.search}`;
const textsOf = (items) =>
  items
    .filter((item) => item.text)
    .map((item) => `'${item.text}'`)
    .join(', ') || '(không có)';
const sameSet = (actual, expected) => actual.length === expected.length && expected.every((value) => actual.includes(value));

const followLink = async (driver, element) => {
  const before = await pathOf(driver);
  await element.click();
  await waitForUrl(driver, (url) => url.pathname !== before).catch(() => {});
  return pathOf(driver);
};

// Labels shown as standalone text in <main>, outside the status tabs, the table and dialogs.
const findStandaloneLabels = (labels) => {
  const excluded = '[data-testid^="filter-chip-"], [data-testid="desktop-data-table"], [data-testid="mobile-hotel-list"], [role="alertdialog"]';
  const leaves = [...document.querySelectorAll('main *')].filter((el) => el.children.length === 0 && !el.closest(excluded));
  return labels.filter((label) => leaves.some((el) => el.textContent.trim() === label));
};

// Records each keystroke and URL change with performance.now(), plus a marker that a reload would erase.
const instrumentSearch = () => {
  window.__e2e = { marker: true, inputs: [], urlChanges: [] };
  document.querySelector('input[type="search"]').addEventListener('input', () => window.__e2e.inputs.push(performance.now()));
  ['pushState', 'replaceState'].forEach((method) => {
    const original = history[method].bind(history);
    history[method] = (...args) => {
      const result = original(...args);
      window.__e2e.urlChanges.push({ at: performance.now(), url: location.href });
      return result;
    };
  });
};

it('TC_HDB_01: Hiển thị bảng danh sách cơ sở lưu trú và 4 thẻ thống kê', async (context) => {
  const soft = session.start(context);
  const page = dashboard();
  await page.open();
  await page.waitThumbnails();
  const { headers, rows } = await page.readTable();

  await soft.check('Hiển thị 4 thẻ thống kê (Tổng số, Đang hiển thị, Chờ duyệt, Bị từ chối)', async () => {
    const found = await session.driver.executeScript(findStandaloneLabels, STAT_CARDS);
    const missing = STAT_CARDS.filter((label) => !found.includes(label));
    return {
      ok: missing.length === 0,
      actual: missing.length ? `Không có thẻ thống kê ${missing.map((label) => `'${label}'`).join(', ')}` : 'Có đủ 4 thẻ',
    };
  });
  await soft.check('Bảng hiển thị thumbnail', () => {
    const withImage = rows.filter((row) => row.hasThumbnail).length;
    return { ok: rows.length > 0 && withImage === rows.length, actual: `${withImage}/${rows.length} hàng hiện ảnh` };
  });
  await soft.check('Bảng hiển thị tên CSLT', () => {
    const named = rows.filter((row) => row.name).length;
    return { ok: rows.length > 0 && named === rows.length, actual: `${named}/${rows.length} hàng có tên` };
  });
  await soft.check('Bảng hiển thị ngày tạo', () => {
    if (!headers.includes('Ngày tạo')) return { ok: false, actual: `Không có cột 'Ngày tạo' (cột: ${headers.join(', ')})` };
    const dated = rows.filter((row) => DATE_PATTERN.test(row.created)).length;
    return { ok: rows.length > 0 && dated === rows.length, actual: `Cột 'Ngày tạo', ${dated}/${rows.length} hàng dạng dd/mm/yyyy` };
  });
  await soft.check('StatusBadge đúng màu sắc Figma', () => {
    const results = BADGE_COLORS.map(({ label, hex }) => {
      const row = rows.find((item) => item.status === label);
      const color = row ? toHex(row.statusColor) : 'không có hàng';
      return { ok: color === hex, text: color === hex ? `${label} ${color}` : `${label} ${color} (Figma ${hex})` };
    });
    return { ok: results.every((result) => result.ok), actual: results.map((result) => result.text).join(', ') };
  });

  const draft = rows.find((row) => row.status === 'Bản nháp');
  soft.note(
    `Bản nháp và Ẩn không kiểm màu vì test plan không ghi màu cho hai nhãn này (bảng token nội bộ ghi Bản nháp ${DRAFT_TOKEN_NOT_IN_TEST_PLAN}, trên trang là ${draft ? toHex(draft.statusColor) : '—'}).`,
  );
  soft.assertAll();
});

it('TC_HDB_02: Chuyển đổi các Tab trạng thái lọc (ALL, DRAFT, PENDING, APPROVED, REJECTED, HIDDEN)', async (context) => {
  const soft = session.start(context);
  const page = dashboard();
  await page.open();

  for (const { key, label } of TABS) {
    await page.selectTab(key);
    const url = new URL(await session.driver.getCurrentUrl());
    await soft.check(`URL cập nhật query param ?trangThai=... khi bấm '${label}'`, () => {
      const ok = url.searchParams.get('trangThai') === key;
      return { ok, actual: ok ? urlText(url) : `URL là ${urlText(url)}, không có trangThai=${key}` };
    });

    const isAll = key === 'ALL';
    const filtered = (items) =>
      items.length > 0 &&
      (isAll ? STATUS_LABELS.every((status) => items.some((item) => item.status === status)) : items.every((item) => item.status === label));
    const rows = await page.waitRows(filtered);
    await soft.check(`Bảng lọc chính xác các cơ sở theo trạng thái '${label}'`, () => {
      const statuses = [...new Set(rows.map((row) => row.status))];
      const expectedRows = isAll ? 5 : 1;
      const ok = filtered(rows) && (!isMock() || rows.length === expectedRows);
      return { ok, actual: `${rows.length} hàng, trạng thái: ${statuses.join(', ') || '(trống)'}` };
    });
  }

  soft.note("Cách đọc: tab 'Tất cả' cần ?trangThai=ALL, vì tiêu đề case liệt kê ALL cùng 5 trạng thái.");
  soft.assertAll();
});

it('TC_HDB_03: Tìm kiếm cơ sở lưu trú theo từ khóa với cơ chế Debounce', async (context) => {
  const soft = session.start(context);
  const page = dashboard();
  const { driver } = session;
  await page.open();
  await driver.executeScript(instrumentSearch);

  await page.search().sendKeys('Breeze');
  await waitForUrl(driver, (url) => url.searchParams.get('keyword') === 'Breeze', 3000).catch(() => {});
  const probe = await driver.executeScript(() => window.__e2e ?? null);

  const inputs = probe?.inputs ?? [];
  const longestGap = Math.max(0, ...inputs.slice(1).map((at, index) => at - inputs[index]));
  if (longestGap >= DEBOUNCE_MS) {
    // Typing itself paused for 400ms, so the debounce cannot be told apart from a slow machine.
    throw new Error(`Không đo được debounce: hai lần gõ cách nhau ${Math.round(longestGap)}ms. Chạy lại case này.`);
  }
  const searches = (probe?.urlChanges ?? []).filter((change) => new URL(change.url).searchParams.has('keyword'));

  await soft.check('Hệ thống chờ 400ms sau khi người dùng ngừng gõ mới gửi request tìm kiếm', () => {
    if (inputs.length === 0) return { ok: false, actual: 'Không ghi nhận được lần gõ nào' };
    if (searches.length === 0) return { ok: false, actual: 'Không có lần tìm kiếm nào sau khi gõ' };
    const delay = searches[0].at - inputs[inputs.length - 1];
    return {
      ok: searches.length === 1 && delay >= DEBOUNCE_MS - TIMER_SLACK_MS,
      actual: `Tìm kiếm ${searches.length} lần cho ${inputs.length} ký tự, lần đầu sau ${Math.round(delay)}ms kể từ phím cuối`,
    };
  });
  await soft.check('Không gây reload cả trang', () => ({
    ok: probe?.marker === true,
    actual: probe?.marker === true ? 'Trang không tải lại' : 'Trang đã tải lại',
  }));

  const url = new URL(await driver.getCurrentUrl());
  await soft.check('URL cập nhật query params (Post-condition)', () => ({
    ok: url.searchParams.get('keyword') === 'Breeze',
    actual: `URL là ${urlText(url)}`,
  }));

  await page.waitLoaded();
  const hasKeyword = (row) => row.name.toLowerCase().includes('breeze');
  const rows = await page.waitRows((items) => items.length > 0 && items.every(hasKeyword));
  await soft.check('Danh sách kết quả hiển thị đúng theo tiêu chí lọc (Post-condition)', () => {
    const matching = rows.filter(hasKeyword).length;
    return {
      ok: rows.length > 0 && matching === rows.length && (!isMock() || rows.length === 3),
      actual: `${matching}/${rows.length} hàng có 'Breeze' trong tên`,
    };
  });

  soft.note('App gọi API danh sách ngay khi keyword trên URL đổi, nên thời điểm gửi request được đo bằng thời điểm URL đổi.');
  soft.assertAll();
});

it('TC_HDB_04: Nút Action theo trạng thái: Cơ sở APPROVED (Đã duyệt)', async (context) => {
  const soft = session.start(context);
  const page = dashboard();
  const { driver } = session;
  await page.open();
  const row = await page.rowByStatus('Đã duyệt');
  const actions = await page.actionsOf(row.id);

  await soft.check("Hiển thị 2 nút: 'Xem' và 'Sửa'", () => ({
    ok: sameSet(
      actions.map((action) => action.text),
      ['Xem', 'Sửa'],
    ),
    actual: `Nút: ${textsOf(actions)}`,
  }));
  await soft.check("'Xem' mở /hotel/:id", async () => {
    const path = await followLink(driver, await page.action(row.id, 'Xem'));
    return { ok: path === `/hotel/${row.id}`, actual: `Mở ${path}` };
  });

  await page.open();
  await soft.check("'Sửa' mở /host/hotels/:id/edit", async () => {
    const path = await followLink(driver, await page.action(row.id, 'Sửa'));
    return { ok: path === `/host/hotels/${row.id}/edit`, actual: `Mở ${path}` };
  });
  soft.assertAll();
});

it('TC_HDB_05: Nút Action theo trạng thái: Cơ sở PENDING (Chờ duyệt)', async (context) => {
  const soft = session.start(context);
  const page = dashboard();
  const { driver } = session;
  await page.open();
  const row = await page.rowByStatus('Chờ duyệt');
  const actions = await page.actionsOf(row.id);
  const editPath = `/host/hotels/${row.id}/edit`;

  await soft.check("Hiển thị nút 'Xem' và nút 'Rút lại'", () => ({
    ok: sameSet(
      actions.map((action) => action.text),
      ['Xem', 'Rút lại'],
    ),
    actual: `Nút: ${textsOf(actions)}`,
  }));
  await soft.check("'Rút lại' (màu cảnh báo)", async () => {
    const button = await page.action(row.id, 'Rút lại');
    const colors = [
      ['chữ', toHex(await button.getCssValue('color'))],
      ['viền', toHex(await button.getCssValue('border-top-color'))],
      ['nền', toHex(await button.getCssValue('background-color'))],
    ];
    return {
      ok: colors.some(([, hex]) => hex === FIGMA_COLORS.warning),
      actual: `${colors.map(([part, hex]) => `${part} ${hex}`).join(', ')}; màu cảnh báo Figma là ${FIGMA_COLORS.warning}`,
    };
  });

  let path = null;
  await soft.check("'Xem' dẫn đến trang edit", async () => {
    path = await followLink(driver, await page.action(row.id, 'Xem'));
    return { ok: path === editPath, actual: `Mở ${path}` };
  });
  await soft.check('Trang edit ở chế độ Read-only', async () => {
    if (path !== editPath) return { ok: false, actual: 'Không mở được trang edit' };
    const edit = new ListingEditPage(driver);
    await edit.waitLoaded();
    const editable = (await edit.controls()).filter((control) => control.editable);
    const nameShown = (await edit.mainText()).includes(row.name);
    return {
      ok: editable.length === 0 && nameShown,
      actual: `${editable.length} ô còn sửa được${editable.length ? ` (${editable.map((control) => control.id || control.tag).join(', ')})` : ''}, tên cơ sở ${nameShown ? 'có' : 'không'} hiện`,
    };
  });
  soft.assertAll();
});

it("TC_HDB_06: Bấm nút 'Rút lại' yêu cầu kiểm duyệt trên Dashboard", async (context) => {
  const soft = session.start(context);
  const page = dashboard();
  await page.open();
  const row = await page.rowByStatus('Chờ duyệt');
  soft.note(`Sheet ghi "Mã cơ sở = 12"; test dùng cơ sở Chờ duyệt có sẵn (mã ${row.id}).`);
  const pendingBefore = await page.tabCount('PENDING');
  const draftBefore = await page.tabCount('DRAFT');

  await (await page.action(row.id, 'Rút lại')).click();
  const dialog = await page.dialog();
  const buttons = await page.dialogButtons(dialog);

  await soft.check('Popup ConfirmDialog hiển thị cảnh báo', async () => {
    const title = (await dialog.findElement(By.css('h2')).getText()).trim();
    const icons = await dialog.findElements(By.xpath('.//*[local-name()="svg"][not(ancestor::button)]'));
    return { ok: title !== '' && icons.length > 0, actual: `Hộp '${title}', ${icons.length ? 'có' : 'không có'} icon cảnh báo` };
  });
  await soft.check("Bấm 'Xác nhận rút' (bước 3)", () => {
    const found = buttons.some((button) => button.text === 'Xác nhận rút');
    return { ok: found, actual: found ? "Có nút 'Xác nhận rút'" : `Không có nút 'Xác nhận rút' (nút hiện có: ${textsOf(buttons)})` };
  });

  const confirm = buttons.find((button) => button.text === 'Xác nhận rút') ?? buttons.at(-1);
  if (confirm.text !== 'Xác nhận rút') soft.note(`Đã bấm nút xác nhận thật '${confirm.text}' để kiểm tiếp ý sau.`);
  await confirm.el.click();
  await page.waitDialogClosed();

  await soft.check('Sau khi xác nhận, cơ sở chuyển trạng thái từ PENDING về BẢN NHÁP (DRAFT)', async () => {
    const statusOf = (items) => items.find((item) => item.id === row.id)?.status;
    const status = statusOf(await page.waitRows((items) => statusOf(items) === 'Bản nháp')) ?? '(không còn trong bảng)';
    const pendingAfter = await page.tabCount('PENDING', pendingBefore - 1);
    const draftAfter = await page.tabCount('DRAFT', draftBefore + 1);
    return {
      ok: status === 'Bản nháp' && pendingAfter === pendingBefore - 1 && draftAfter === draftBefore + 1,
      actual: `Nhãn '${status}'; tab Chờ duyệt ${pendingBefore}→${pendingAfter}, Bản nháp ${draftBefore}→${draftAfter}`,
    };
  });
  soft.assertAll();
});

it('TC_HDB_07: Nút Action theo trạng thái: Cơ sở REJECTED (Bị từ chối)', async (context) => {
  const soft = session.start(context);
  const page = dashboard();
  const { driver } = session;
  await page.open();
  const row = await page.rowByStatus('Bị từ chối');
  const actions = await page.actionsOf(row.id);
  const editPath = `/host/hotels/${row.id}/edit`;

  await soft.check("Hiển thị nút 'Xem & sửa' và nút 'Xóa'", () => ({
    ok: sameSet(
      actions.map((action) => action.text),
      ['Xem & sửa', 'Xóa'],
    ),
    actual: `Nút: ${textsOf(actions)}`,
  }));
  await soft.check("'Xóa' (màu đỏ)", async () => {
    const color = toHex(await (await page.action(row.id, 'Xóa')).getCssValue('color'));
    return { ok: color === FIGMA_COLORS.danger, actual: `Chữ ${color}` };
  });

  let path = null;
  await soft.check("'Xem & sửa' (mở trang edit)", async () => {
    path = await followLink(driver, await page.action(row.id, 'Xem & sửa'));
    return { ok: path === editPath, actual: `Mở ${path}` };
  });
  await soft.check('Trang edit để sửa theo lý do từ chối', async () => {
    if (path !== editPath) return { ok: false, actual: 'Không mở được trang edit' };
    const edit = new ListingEditPage(driver);
    await edit.waitLoaded();
    const reasons = await driver.findElements(By.xpath("//main//p[starts-with(normalize-space(.), 'Lý do:')]"));
    const reason = reasons.length ? normalizeText(await reasons[0].getText()) : '';
    const reasonOk = isMock()
      ? reason === normalizeText(`Lý do: ${MOCK_REJECT_REASON}`)
      : /^Lý do: (?!Không có ghi chú).+/.test(reason);
    const [nameInput] = await edit.nameInput();
    const editable = nameInput ? (await nameInput.isEnabled()) && (await nameInput.getAttribute('readonly')) === null : false;
    return {
      ok: reasonOk && editable,
      actual: `${reason || 'Không có dòng lý do'}; ô 'Tên cơ sở lưu trú' ${editable ? 'sửa được' : 'không sửa được'}`,
    };
  });
  soft.assertAll();
});

it('TC_HDB_08: Xóa cơ sở lưu trú (Bản nháp / Bị từ chối)', async (context) => {
  const soft = session.start(context);
  const page = dashboard();

  // Two passes, each on a fresh page load (the mock store starts again from its seed data).
  for (const { key, label } of [
    { key: 'DRAFT', label: 'Bản nháp' },
    { key: 'REJECTED', label: 'Bị từ chối' },
  ]) {
    const tag = ` [${key}]`;
    await page.open();
    const row = await page.rowByStatus(label);
    const allBefore = await page.tabCount('ALL');

    await (await page.action(row.id, 'Xóa')).click();
    const dialog = await page.dialog();
    const buttons = await page.dialogButtons(dialog);
    const confirm = buttons.find((button) => button.text === 'Xác nhận xóa') ?? buttons.at(-1);

    await soft.check(`Bật ConfirmDialog màu đỏ${tag}`, async () => {
      const background = toHex(await confirm.el.getCssValue('background-color'));
      return { ok: background === FIGMA_COLORS.danger, actual: `Nút xác nhận nền ${background}` };
    });
    await soft.check(`Cảnh báo xóa vĩnh viễn cơ sở cùng toàn bộ ảnh/video${tag}`, async () => {
      const description = normalizeText(await dialog.findElement(By.css('p')).getText());
      const lower = description.toLowerCase();
      return { ok: ['xóa vĩnh viễn', 'toàn bộ ảnh', 'video'].every((part) => lower.includes(part)), actual: `"${description}"` };
    });
    await soft.check(`Bấm 'Xác nhận xóa' (bước 3)${tag}`, () => {
      const found = confirm.text === 'Xác nhận xóa';
      return { ok: found, actual: found ? "Có nút 'Xác nhận xóa'" : `Không có nút 'Xác nhận xóa' (nút hiện có: ${textsOf(buttons)})` };
    });
    if (confirm.text !== 'Xác nhận xóa') soft.note(`Đã bấm nút xác nhận thật '${confirm.text}' để kiểm tiếp${tag}.`);

    await confirm.el.click();
    // The toast closes after 4s, so it is read right away and checked after the list.
    const toast = await page.toast().catch(() => null);
    const toastSeen = toast
      ? { text: normalizeText(await toast.getText()), color: toHex(await toast.getCssValue('color')) }
      : null;

    await soft.check(`Xác nhận thành công cơ sở bị xóa khỏi danh sách${tag}`, async () => {
      const rows = await page.waitRows((items) => !items.some((item) => item.id === row.id));
      const stillListed = rows.some((item) => item.id === row.id);
      const allAfter = await page.tabCount('ALL', allBefore - 1);
      return {
        ok: !stillListed && allAfter === allBefore - 1,
        actual: `${stillListed ? 'Vẫn còn' : 'Không còn'} hàng mã ${row.id}; tab Tất cả ${allBefore}→${allAfter}`,
      };
    });
    await soft.check(`Toast thông báo xanh${tag}`, () => ({
      ok: toastSeen?.color === FIGMA_COLORS.success,
      actual: toastSeen ? `Toast "${toastSeen.text}", chữ ${toastSeen.color}` : 'Không có toast',
    }));
  }
  soft.assertAll();
});
