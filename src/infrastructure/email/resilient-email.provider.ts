import { IEmailProvider, SendEmailPayload } from "@common/interfaces/email-provider.interface.js";
import { EmailSendError } from "@common/errors/email-send.error.js";
import { RetryOptions, retryWithBackoff } from "@common/utils/emailRetry.js";

// Retry network errors, rate limits (429) and server errors (5xx).
// Don't retry 4xx (invalid key, bad address, unverified domain): they'll never succeed.
const isRetryable = (error: unknown): boolean => {
  if (error instanceof EmailSendError && error.statusCode !== undefined) {
    return error.statusCode === 429 || error.statusCode >= 500;
  }
  return true; // no status code -> likely a network failure
};

export class ResilientEmailProvider implements IEmailProvider {
  constructor(
    private readonly inner: IEmailProvider,
    private readonly options: RetryOptions = { retries: 3, delay: 1000 },
  ) {}

  sendEmail(payload: SendEmailPayload): Promise<void> {
    return retryWithBackoff(() => this.inner.sendEmail(payload), {
      ...this.options,
      shouldRetry: isRetryable,
    });
  }
}
