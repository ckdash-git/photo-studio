import type { PaymentProvider } from "./provider";
import { MockPaymentProvider } from "./mock";

// Swap providers here once Cashfree is implemented, e.g.:
//   process.env.PAYMENT_PROVIDER === "cashfree" ? new CashfreeProvider() : new MockPaymentProvider()
export function getPaymentProvider(): PaymentProvider {
  return new MockPaymentProvider();
}
