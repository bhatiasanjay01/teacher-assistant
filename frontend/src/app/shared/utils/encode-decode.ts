const xform = require('x-www-form-urlencode');

export class EncodeDecodeUtils {
  static decodeWwwFormUrlencoded(str: string) {
    return JSON.parse(xform.decode(str));
  }
}
