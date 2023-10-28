import * as zlib from 'zlib';

export function compress(input, headers) {
  // Parse the acceptable encoding, if any
  const acceptEncodingHeader = headers['accept-encoding'] || '';

  // Build a set of acceptable encodings, there could be multiple
  const acceptableEncodings = new Set(
    acceptEncodingHeader
      .toLowerCase()
      .split(',')
      .map((str) => str.trim()),
  );

  // Handle Brotli compression (Only supported in Node v10 and later)
  if (acceptableEncodings.has('br') && typeof zlib.brotliCompressSync === 'function') {
    return {
      // Brotli
      data: zlib.brotliCompressSync(input),
      contentEncoding: 'br',
    };
  }

  // Handle Gzip compression
  if (acceptableEncodings.has('gzip')) {
    // Gzip
    return {
      data: zlib.gzipSync(input),
      contentEncoding: 'gzip',
    };
  }

  // Handle deflate compression
  if (acceptableEncodings.has('deflate')) {
    // Deflate
    return {
      data: zlib.deflateSync(input),
      contentEncoding: 'deflate',
    };
  }
  // No Match
  return {
    data: input,
    contentEncoding: null,
  };
}
