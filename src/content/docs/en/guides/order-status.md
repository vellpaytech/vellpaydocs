---
title: Order status
description: VellPay pay-in, payout, and checkout order statuses.
---

# Order status

VellPay uses string statuses to represent the current order stage. A processing status returned by a create endpoint does not mean the transaction ultimately succeeded. Merchants must confirm the final result using query endpoints and asynchronous callbacks.

## Pay-in and checkout statuses

| Status        | Description             | Final status |
|-----------|----------------|------|
| `INIT`    | Order accepted; waiting for the payment flow | No    |
| `PAYING`  | Payment processing          | No    |
| `SUCCESS` | Pay-in completed successfully | Yes    |
| `FAIL`    | Pay-in failed           | Yes    |
| `REFUND`  | Pay-in funds refunded        | Yes    |

## Payout statuses

| Status            | Description        | Final status |
|---------------|-----------|------|
| `INIT`        | Payout accepted     | No    |
| `PAYING`      | Payout processing     | No    |
| `SUCCESS`     | Payout completed successfully | Yes    |
| `FAIL`        | Payout failed      | Yes    |
| `REFUND`      | Payout funds fully returned | Yes    |
| `PART_REFUND` | Payout funds partially returned | No    |

## Integration recommendations

- Do not determine the transaction result from only the HTTP status code or response `code`.
- `INIT` and `PAYING` are non-final statuses; continue receiving callbacks or querying the order.
- Handle duplicate callbacks idempotently using `tradeNo` and status.
- If query and callback results differ, use the platform final status and contact technical support to investigate an abnormal status reversal.

## KYC statuses

| Status          | Description     | Final status |
|-------------|--------|------|
| `PENDING`   | Waiting for user verification | No    |
| `REVIEWING` | Verification under review  | No    |
| `APPROVED`  | Verification approved   | Yes    |
| `REJECTED`  | Verification rejected  | Yes    |
| `FILA`      | Verification failed   | Yes    |
