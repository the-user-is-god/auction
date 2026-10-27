export interface AppEventPayloads {
  "user.registered": {
    email: string;
    rawToken: string;
  };
  "forgot.password": {
    email: string;
    rawToken: string;
  };
  "resend.verification": {
    email: string;
    rawToken: string;
  };
  "reset.success": {
    email: string;
  };
}

export interface IEventEmitter {
  emit<K extends keyof AppEventPayloads>(event: K, payload: AppEventPayloads[K]): boolean;
  on<K extends keyof AppEventPayloads>(
    event: K,
    listener: (payload: AppEventPayloads[K]) => void | Promise<void>,
  ): this;
}
