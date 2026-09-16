-- Atomic increment for coupon redemption count, called from the booking
-- flow. Using a DB function avoids a read-then-write race between two
-- customers redeeming the same coupon at the same moment.
create or replace function increment_coupon_redemption(coupon_id_input uuid)
returns void as $$
  update coupons
  set redemptions_count = redemptions_count + 1
  where id = coupon_id_input;
$$ language sql;
