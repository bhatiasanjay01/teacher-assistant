import { DateTime } from 'luxon';

export interface AbstractFrontend {
  readonly id: string;
  readonly version: string;

  isFrontendTemp?: boolean;

  lastModifiedBy?: any;
  lastModifiedTime?: DateTime;

  createdBy?: any;
  readonly createdTime?: DateTime;

  createdById?: string;
  lastModifiedById?: string;
}

export interface ModifiedAllItems<Frontend extends AbstractFrontend> {
  getAllItems: Frontend[];
  addedAllItems: Frontend[];
  updatedAllItems: Frontend[];
  deletedAllItems: Frontend[];
}

export interface ResourceNameAndModifiedAllItems<Frontend extends AbstractFrontend> {
  resourceName: string;
  modifiedAllItems: ModifiedAllItems<Frontend>;
}
