# M7 Backend Contract — Gym Owner Orders & Settlement

## 1. Purpose

This document defines the backend data and API responsibilities required by the Gym Owner M7 frontend.

The frontend must only display authoritative financial values supplied by the backend. It must not calculate commission, discount allocation, settlement totals, or net received.

## 2. Confirmed business boundaries

- Gym Owner can view commercial orders and settlement periods for their own Gym.
- Gym Owner can submit a refund/dispute request to Platform.
- Gym Owner cannot execute a refund, approve a dispute, edit commission, edit AI Plus pricing, or alter reconciliation results.
- AI Plus pricing and commission configuration are Platform-managed.
- Commission is based on the Gym-service value and excludes AI Plus.
- The baseline commission rate is 10%, but the backend must use the configured rate effective for the order.
- PT settlement belongs to the Gym. Trainer compensation is outside this module.
- CSV exports for Orders and Settlements are separate.
- Exports must not contain health, workout, AI-assessment, or unnecessary personal data.

## 3. Financial responsibility

The backend must persist and return an immutable financial snapshot for every paid order.

Required values:

- `gymServicePriceVnd`
- `discountVnd`
- `discountAttribution`, when a discount exists
- `aiPlusVnd`
- `commissionRateBps`
- `commissionVnd`
- `netReceivedVnd`
- `currency`
- `calculatedAt`
- configuration/version reference used for the calculation

`netReceivedVnd` is authoritative backend data. The frontend must not reconstruct it from other fields.

Before production implementation, the backend/product team must define the exact net-received formula, including:

- whether a Gym-funded discount reduces the commission base;
- how Platform-funded and shared discounts affect Gym settlement;
- rounding rules;
- treatment of failed, cancelled, refunded, partially refunded, or disputed orders;
- whether financial adjustments create a new ledger entry or mutate an existing snapshot.

The SRS-confirmed invariant remains:

```text
Commission Base = Gym Service Amount
Platform Commission = Commission Base × configured commission rate
AI Plus is excluded from Gym marketplace commission
```

The backend must not rely on a frontend-calculated total.

## 4. Order resource

Recommended response shape:

```json
{
  "id": "FIT-2026-1048",
  "gymId": "gym-001",
  "purchaser": {
    "displayName": "Mai Nguyen"
  },
  "item": {
    "kind": "gym_offer",
    "referenceId": "offer-001",
    "displayName": "90-day Progress"
  },
  "purchasedAt": "2026-09-30T08:45:00.000Z",
  "paymentMethod": "card",
  "paymentStatus": "succeeded",
  "fulfillmentStatus": "pending_gym_confirmation",
  "settlementPeriodId": "SET-2026-09",
  "financial": {
    "currency": "VND",
    "gymServicePriceVnd": 1800000,
    "discountVnd": 200000,
    "discountAttribution": [],
    "aiPlusVnd": 249000,
    "commissionRateBps": 1000,
    "commissionVnd": 180000,
    "netReceivedVnd": 1420000,
    "calculatedAt": "2026-09-30T08:45:00.000Z",
    "calculationVersion": "commerce-v1"
  }
}
```

The numerical values above demonstrate the payload shape only. They do not define the missing net-received formula.

Suggested endpoints:

```text
GET /gym-owner/orders
GET /gym-owner/orders/{orderId}
```

List endpoint requirements:

- tenant/Gym scope must come from authenticated authorization context;
- support server pagination when the dataset grows;
- return financial snapshots without recomputing them differently for list and detail responses;
- never return Member health, workout, body, or AI-assessment data.

## 5. Settlement resource

A settlement period is read-only for Gym Owner.

Recommended response shape:

```json
{
  "id": "SET-2026-09",
  "gymId": "gym-001",
  "startsAt": "2026-09-01T00:00:00.000Z",
  "endsAt": "2026-09-30T23:59:59.999Z",
  "orderCount": 4,
  "reconciliation": {
    "statusCode": "platform_reconciled",
    "displayName": "Reconciled by Platform",
    "updatedAt": "2026-10-01T02:00:00.000Z"
  },
  "financial": {
    "currency": "VND",
    "gymServicePriceVnd": 11350000,
    "discountVnd": 550000,
    "aiPlusVnd": 398000,
    "commissionVnd": 1135000,
    "netReceivedVnd": 9665000,
    "calculatedAt": "2026-10-01T02:00:00.000Z",
    "calculationVersion": "commerce-v1"
  }
}
```

Suggested endpoints:

```text
GET /gym-owner/settlements
GET /gym-owner/settlements/{settlementPeriodId}
```

The backend team must define the official reconciliation status codes and period-generation rules. The frontend treats the returned status as read-only and exposes no reconciliation transition action.

## 6. Refund/dispute request

Gym Owner submits a request to Platform. Submission must not directly change payment, refund, settlement, or reconciliation data.

Suggested endpoint:

```text
POST /gym-owner/orders/{orderId}/refund-dispute-requests
```

Request:

```json
{
  "requestType": "refund",
  "reason": "The service could not be fulfilled. Please review this order."
}
```

Response:

```json
{
  "requestId": "RDR-2026-0018",
  "orderId": "FIT-2026-1048",
  "requestType": "refund",
  "statusCode": "submitted",
  "statusDisplayName": "Submitted to Platform",
  "submittedAt": "2026-10-01T08:30:00.000Z"
}
```

Backend requirements:

- validate that the order belongs to the authenticated Gym;
- use an idempotency key to prevent duplicate requests;
- store an audit trail;
- return stable request and status identifiers;
- keep approval/rejection and financial execution under Platform permissions;
- define official eligibility rules and status codes before production rollout.

## 7. CSV export

Orders and Settlements must use separate exports.

Recommended production endpoints when list APIs are paginated:

```text
GET /gym-owner/orders/export.csv
GET /gym-owner/settlements/export.csv
```

Order export fields:

```text
order_id
item_type
item_name
purchased_at
payment_status
fulfillment_status
settlement_period_id
currency
gym_service_price
discount
ai_plus
commission
net_received
```

Settlement export fields:

```text
settlement_period_id
period_start
period_end
order_count
reconciliation_code
currency
gym_service_price
discount
ai_plus
commission
net_received
```

Do not include purchaser email, phone, address, health information, workout information, body measurements, or AI-assessment data.

## 8. Authorization and audit requirements

- Every query must be scoped to the authenticated Gym tenant.
- Gym Owner has read access to orders and settlements.
- Gym Owner has create-only access to refund/dispute requests.
- Commission configuration and AI Plus pricing remain Platform Admin only.
- Financial snapshots and reconciliation changes require audit records.
- Historical orders and financial records must not be destructively deleted when an Offer, Trainer, or Gym listing is hidden/unpublished.

## 9. Frontend integration acceptance criteria

Backend integration is ready when:

- list and detail return identical financial snapshots for the same order;
- all five financial components are present as explicit fields;
- `netReceivedVnd` is supplied and does not require frontend calculation;
- settlement periods include backend-defined reconciliation state;
- refund/dispute submission returns a stable request record;
- separate complete CSV exports are available, or list endpoints can return the entire approved export dataset;
- authorization prevents access to another Gym's records;
- no health, workout, or AI-assessment data appears in any M7 response or export.
