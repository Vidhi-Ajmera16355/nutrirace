/** Names of BullMQ queues. Add new queues here so producers and workers agree on them. */
export const QUEUE_NAMES = {
  /** Infrastructure queue used for diagnostics only; carries no product behaviour. */
  system: 'system',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/** Default BullMQ key prefix; configurable so tests can isolate themselves. */
export const DEFAULT_QUEUE_PREFIX = 'nutrirace';
