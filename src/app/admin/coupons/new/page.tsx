import { requireAdmin } from "@/lib/admin/auth";
import { CouponForm } from "./form";

export default async function NewCouponPage() {
  await requireAdmin();
  return (
    <main className="flex-1 mx-auto max-w-lg w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">New coupon</h1>
      <CouponForm />
    </main>
  );
}
