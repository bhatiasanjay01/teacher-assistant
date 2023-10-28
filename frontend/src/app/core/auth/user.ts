import { UserAuth0Backend } from '../user/user-auth0';

export interface User {
  userAuth0: UserAuth0Backend;
}

export enum LoginProduct {
  googleDrive = 'googleDrive',
  googleCalendar = 'googleCalendar',
  googleAnalytics = 'googleAnalytics',
}
