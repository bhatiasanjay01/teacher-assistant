import { GlobalErrorDefinition } from '../../shared/global-error/global-error-definition';

const loginPopupClosed: GlobalErrorDefinition = {
  key: 'F6E2EWEZ',
  skipOnCall: true,
};

export const unexpectedLoginPopupError: GlobalErrorDefinition = {
  key: 'RGBY23ZN',
  skipOnCall: false,
};

export const Auth0ClientErrors = {
  loginPopupClosed,
  unexpectedLoginPopupError,
};
