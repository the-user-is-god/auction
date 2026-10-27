// src/modules/auth/auth.factory.ts
import { BcryptHasher } from "@infrastructure/security/bcrypt-hasher.service.js";
import { AuthRepository } from "./repositories/auth.repository.js";
import { AuthService } from "./auth.service.js";
import { CryptoJwtTokenService } from "@infrastructure/security/crypto-jwt.service.js";
import { SessionRepository } from "./repositories/session.repository.js";
import { NodeEventEmitter } from "@infrastructure/events/node-event-emitter.js";
import { AuthEmailListener } from "@infrastructure/events/listeners/auth-event.listener.js";
import { ResilientEmailProvider } from "@infrastructure/email/resilient-email.provider.js";
import { ResendEmailProvider } from "@infrastructure/email/resend-mailer.provider.js";

export function createAuthModule() {
  const authRepository = new AuthRepository();
  const sessionRepository = new SessionRepository();
  const passwordHasher = new BcryptHasher(10);
  const tokenService = new CryptoJwtTokenService();
  const emailProvider = new ResilientEmailProvider(new ResendEmailProvider(), {
    retries: 3,
    delay: 1000,
  });
  const eventEmitter = new NodeEventEmitter();

  // Initialize and attach the background listeners
  const authEmailListener = new AuthEmailListener(eventEmitter, emailProvider);
  authEmailListener.listen();

  const authService = new AuthService(
    authRepository,
    sessionRepository,
    passwordHasher,
    tokenService,
    eventEmitter,
  );

  return {
    authService,
    // You can return controller methods or controller instances here
  };
}

export const { authService } = createAuthModule();
