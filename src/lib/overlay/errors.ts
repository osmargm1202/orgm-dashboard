export class OverlayParseError extends Error {
  public override readonly name = 'OverlayParseError'

  constructor(message: string, cause?: unknown) {
    super(message, { cause })
  }
}

export function normalizeOverlayError(error: unknown): OverlayParseError {
  if (error instanceof OverlayParseError) {
    return error
  }

  const message = error instanceof Error ? error.message : 'Unknown overlay parsing error'

  return new OverlayParseError(message, error)
}
