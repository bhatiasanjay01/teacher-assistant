export enum AttributeType {
  /** Up to 400KiB of binary data (which must be encoded as base64 before sending to DynamoDB) */
  BINARY = 'B',
  /** Numeric values made of up to 38 digits (positive, negative or zero) */
  NUMBER = 'N',
  /** Up to 400KiB of UTF-8 encoded text */
  STRING = 'S',
}

export enum SharedIndex {
  createdByIdCreatedTimeStrIndex = 'createdById-createdTimeStr-index',
}
