import type { CreateOrderInput, CreateOrderResult, PaymentProvider } from "./provider";

// Simulates a payment gateway for local dev / demos before Cashfree is wired
// in. Skips straight to the confirm route, which marks the payment "paid"
// immediately - no real money moves. Never enable this in production.
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const providerOrderId = `mock_${input.bookingId}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    return {
      providerOrderId,
      redirectUrl: `${siteUrl}/api/payments/mock/confirm?bookingId=${input.bookingId}`,
    };
  }
}
