import { logger } from "@lib/logger.js";

export interface RetryOptions {
  retries?: number;
  delay?: number; // initial delay in ms
  factor?: number; // backoff multiplier
  shouldRetry?: (error: unknown) => boolean;
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const { retries = 3, delay = 1000, factor = 2, shouldRetry = () => true } = options;
  let currentDelay = delay;

  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) throw error;

      // small jitter avoids many failing jobs retrying at the same instant
      const wait = currentDelay + Math.random() * 100;
      logger.warn(`Attempt ${attempt} failed. Retrying in ${Math.round(wait)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, wait));
      currentDelay *= factor;
    }
  }
};
