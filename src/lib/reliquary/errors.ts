export class ReliquaryError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "INVALID") {
    super(message);
    this.name = "ReliquaryError";
    this.status = status;
    this.code = code;
  }
}

export function notFound(entity = "Artifact"): never {
  throw new ReliquaryError(`${entity} not found`, 404, "NOT_FOUND");
}

export function conflict(message: string): never {
  throw new ReliquaryError(message, 409, "CONFLICT");
}
