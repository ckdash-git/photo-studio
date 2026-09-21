import { notFound } from "next/navigation";
import { getServiceDetail } from "@/lib/services";
import { CheckoutForm } from "./checkout-form";
import { FreeformCheckoutForm } from "./freeform-checkout-form";

export default async function BookServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const result = await getServiceDetail(serviceId);

  if (!result) notFound();
  const { service, slots } = result;
  const photographer = service.photographers as unknown as { display_name: string } | null;

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
      <h1 className="text-3xl font-semibold text-ink">{service.name}</h1>
      {photographer && <p className="text-sm text-stone mt-1">by {photographer.display_name}</p>}
      {service.description && <p className="mt-2 text-slate">{service.description}</p>}
      <p className="mt-1 text-sm text-stone">
        {service.duration_minutes} min &middot; ₹{service.price_inr}
      </p>

      <div className="mt-10">
        {service.photographer_id ? (
          <FreeformCheckoutForm serviceId={service.id} priceInr={service.price_inr} />
        ) : slots && slots.length > 0 ? (
          <CheckoutForm serviceId={service.id} priceInr={service.price_inr} slots={slots} />
        ) : (
          <p className="text-stone">
            No open slots for this session right now. Please check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
