// Logs in as a Host the way AuthContext.login does (localStorage user + token). The login and OTP screens
// belong to another member and the test cases only require "Host đã đăng nhập".
export const HOST_USER = {
  id: 'host-e2e',
  // With a real backend, E2E_HOST_NAME makes the Sidebar show the test account's own name.
  name: process.env.E2E_HOST_NAME || 'Chủ cơ sở HotelNT',
  email: 'host.demo@hotelnt.vn',
  phone: '',
  role: 'HOST',
};

const hostToken = () => process.env.E2E_HOST_TOKEN || 'e2e-mock-token';

// Every call reloads the app, so the in-memory mock store starts from its seed data again.
export const seedHostSession = async (driver, baseUrl, path) => {
  await driver.get(`${baseUrl}/login`);
  await driver.executeScript(
    (user, token) => {
      localStorage.setItem('user', user);
      localStorage.setItem('token', token);
    },
    JSON.stringify(HOST_USER),
    hostToken(),
  );
  await driver.get(`${baseUrl}${path}`);
};
