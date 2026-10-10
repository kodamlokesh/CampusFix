exports.asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.httpError = (status, message) => Object.assign(new Error(message), { status });
exports.str = (v) => (typeof v === 'string' ? v.trim() : '');
exports.isObjectId = (s) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);
exports.pickFields = (body, keys) =>
  Object.fromEntries(keys.filter((k) => body && k in body).map((k) => [k, body[k]]));
