import buffer from "node:buffer";

// Polyfill SlowBuffer for legacy dependencies (buffer-equal-constant-time via jwa/jsonwebtoken) on Node.js 24+
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}
