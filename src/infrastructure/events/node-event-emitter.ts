import { EventEmitter } from "events";
import { AppEventPayloads, IEventEmitter } from "@common/interfaces/event-emitter.interface.js";
import { logger } from "@lib/logger.js";

export class NodeEventEmitter implements IEventEmitter {
  private eventEmitter = new EventEmitter();

  emit<K extends keyof AppEventPayloads>(event: K, payload: AppEventPayloads[K]): boolean {
    return this.eventEmitter.emit(event, payload);
  }

  on<K extends keyof AppEventPayloads>(
    event: K,
    listener: (payload: AppEventPayloads[K]) => void | Promise<void>,
  ): this {
    this.eventEmitter.on(event, (payload) => {
      // Catch floating promises to prevent background unhandled rejections
      Promise.resolve(listener(payload)).catch((err) => {
        // console.error(`[EventEmitter] Error handling event "${event}":`, err);
        logger.error(`[EventEmitter] Error handling event "${event}":`, err);
      });
    });
    return this;
  }
}
