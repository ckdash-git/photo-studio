// Abstraction over the payment backend. Implement this interface once per
// provider (mock now, Cashfree later) and swap via PAYMENT_PROVIDER env var —
// nothing in the booking flow needs to change when Cashfree is added.

export interface CreateOrderInput {
  bookingId: string;
  amountInr: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export interface CreateOrderResult {
  providerOrderId: string;
  /** Where to send the customer to pay. For the mock provider this is our
   * own confirm route; for Cashfree this is their hosted checkout URL. */
  redirectUrl: string;
}

export interface PaymentProvider {
  readonly name: string;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
}
