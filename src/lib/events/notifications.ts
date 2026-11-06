import "server-only";

/**
 * Notification hooks for the events module.
 *
 * The Society's approved channels are not connected in this build, so every
 * hook logs an intent and returns without sending anything. When an approved
 * email provider (or an authorised WhatsApp business integration) is supplied,
 * implement `deliver` and nothing else in the module has to change.
 *
 * Rules the implementation must keep:
 *   * only message people who gave consent for event communications;
 *   * never use the registration list for unrelated marketing;
 *   * send event-critical messages (postponement, cancellation) to confirmed
 *     registrants even where marketing consent was withheld, because they are
 *     transactional;
 *   * never log message bodies or personal data.
 */

export type NotificationKind =
  | "event-published"
  | "registration-confirmation"
  | "event-approaching"
  | "event-postponed"
  | "event-cancelled"
  | "event-updated";

export type NotificationPayload = {
  kind: NotificationKind;
  eventSlug: string;
  eventTitle: string;
  recipientCount?: number;
};

export async function queueEventNotification(payload: NotificationPayload): Promise<void> {
  const channel = process.env.EVENT_NOTIFICATION_CHANNEL ?? "none";

  if (channel === "none") {
    // Intentionally silent: no provider is configured.
    return;
  }

  console.info("Event notification queued", {
    kind: payload.kind,
    event: payload.eventSlug,
    recipients: payload.recipientCount ?? 0,
    channel,
  });
}

/**
 * Registration confirmation copy. Kept here so the wording is reviewed once,
 * rather than being written into templates in several places.
 */
export function registrationConfirmation(eventTitle: string, startsOn: string): {
  subject: string;
  body: string;
} {
  return {
    subject: `Registration received — ${eventTitle}`,
    body: [
      `Thank you for registering for ${eventTitle}.`,
      "",
      `The event begins on ${startsOn}. Keep this message as confirmation.`,
      "If your plans change, contact the Secretariat so your place can be released.",
    ].join("\n"),
  };
}
