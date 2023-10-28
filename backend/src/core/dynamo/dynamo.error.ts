import { GlobalError } from '../../../../frontend/src/app/shared/global-error/global-error';

export class DynamoTooManyItemsError extends GlobalError {}

export class DynamoCannotDeleteMyItemBecauseCurrentUserDoesNotOwnIt extends GlobalError {}
export class DynamoCannotUpdateMyItemBecauseCurrentUserDoesNotOwnIt extends GlobalError {}
export class DynamoNoUpdateValueOnAttributesError extends GlobalError {}
