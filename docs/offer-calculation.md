# Offer Calculation

The comparison engine never ranks by percentage alone. It validates active status, verification status, date range, day, time, meal type and minimum bill before calculating savings.

Percentage saving:

`bill_amount * discount_percent / 100`

If a cap exists, the saving is `min(saving, cap)`.

Cashback is shown separately and does not reduce final payable. Final payable is:

`bill_amount - instant_saving`

Every result includes source URL, last checked time, verification status and the disclaimer: “Offers may change anytime. Please verify on the platform before booking or payment.”
