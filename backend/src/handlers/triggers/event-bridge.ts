import 'reflect-metadata';
import { initSecrets } from '../../core/_secret/secret';
import { initTableNames } from '../../core/dynamo/table-names';

export const handler = async (event, context) => {
  initTableNames();
  await initSecrets();
};
