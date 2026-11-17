import { it } from 'vitest';
import { DashboardPage } from '../pages/dashboard-page.js';
import { browserSession } from '../support/driver.js';

const session = browserSession();

it('smoke: Host đã đăng nhập mở được /host/dashboard', async (context) => {
  const soft = session.start(context);
  const page = new DashboardPage(session.driver, session.baseUrl);

  await page.open();

  await soft.check('Bảng danh sách có dữ liệu', async () => {
    const count = (await page.rows()).length;
    return { ok: session.target === 'mock' ? count === 5 : count > 0, actual: `${count} hàng` };
  });
  soft.assertAll();
});
