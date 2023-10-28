import { GlobalErrorDefinition } from '../../../../../frontend/src/app/shared/global-error/global-error-definition';

const noGooglePermission: GlobalErrorDefinition = {
  key: 'SMT533FK',
  skipOnCall: true,
  message: 'Need to grant the Google permissions.',
};

const noSufficientPermissions: GlobalErrorDefinition = {
  key: 'VCY6JB5B',
  skipOnCall: true,
  message: 'Try to regrant the Google permissions.',
};

export const Auth0Errors = {
  noGooglePermission,
  noSufficientPermissions,
};
