import {
  getCurrentAccount,
  getLeaderboard,
  loginAccount,
  logoutAccount,
  recordScore,
  registerAccount,
} from '../api/authApi';
import type { AuthGateway } from './types';

export const mockAuthGateway: AuthGateway = {
  register: registerAccount,
  login: loginAccount,
  logout: logoutAccount,
  getCurrentAccount,
  getLeaderboard,
  recordScore,
};
