export class ServerError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

export function isMongoDuplicate(error) {
  return error?.code && error.code == 11000;
}
