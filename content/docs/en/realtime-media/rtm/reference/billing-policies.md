---
title: "Policies"
description: "Provides you with information on billing, fee deductions, free-of-charge policy, account settlement and any suspension to your account based on the account type."
---

# Policies

This page explains billing, account settlement, end-of-life policies, and any applicable free-of-charge policies for this product.

## Billing and account policies

Agora Console provides billing information, fee deduction details, and account suspension notices based on your account type.

:::info
If you have signed a contract with Agora, the contract terms override all billing, deduction, and suspension details described on this page.

:::

### Paid accounts

Your account is a paid account if you have registered with Agora and completed any of the following:

- Added a credit card to your account or topped up your balance using a bank account.
- Made a recent payment.
- Signed a contract with Agora.

### Billing cycle

On the first day of each month, Agora issues your bill for the previous calendar month. 

To view billing information for your projects:

1. In [Agora Console](https://console.agora.io/v2), click home.

2. Click **Billing**.

    You see the detailed billing information for your projects, including billing period, due date, and amount.

    ![View bills](/images/video-sdk/bills.png)

#### Additional charges

This section describes the additional charges applicable to your account.

#### Singapore goods and services tax

As of November 2021, Agora Singapore charges [9% Singapore Goods and Services Tax (GST)](https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/basics-of-gst/goods-and-services-tax-(gst)-what-it-is-and-how-it-works) on invoices for all Agora services provided to accounts located in Singapore. Agora determines the account location based on the tax identification number, contact address, or billing address that you have provided. All GST collected from Singapore accounts is paid to the Singapore tax authority.

If you have any questions, contact support@agora.io.

#### Fee deduction

On the sixth day of each month, Agora automatically deducts the fee for the previous month and notifies you by email. No fee is deducted if you meet both of the following conditions:

- Your monthly usage does not exceed the free quota.
- You do not use any other charged Agora services or products.

If your account balance is negative after the deduction, Agora sends you an email, reminding you to [top up your account](pricing.md) at your earliest convenience and avoid account suspension.

#### Account suspension

If your account balance remains negative for 5 days after the deduction date, Agora suspends your account and notifies you by email. During suspension, none of your projects can access Agora services.

To restore access, top up your account as soon as possible. Once your balance is zero or greater, Agora unfreezes your account.

### Free accounts

Your account is a free account if you have registered with Agora and have not completed any of the following:

- Added a credit card to your account or topped up your balance using a bank account.
- Made a recent payment.
- Signed a contract with Agora.

#### Free account suspension 

Agora suspends your account on the second day after any of the following occur:

- Your total usage exceeds the free quota of a service or product.
- You use Agora services or products not included in the free quota. 

After account suspension, none of your projects can access Agora services. To restore access:

1. Add a credit card to your account or top up your balance using a bank account. This unfreezes your account and upgrades it to a paid account.

2. Purchase a [pre-paid monthly package](subscription-packages.md) or [top-up package](subscription-packages.md). This option is highly recommended.

## Account settlement

To ensure billing transparency and smooth service continuity, Agora implements real-time account balance reservation based on estimated usage across all Agora products for SSP customers. This does not apply to customers with a signed contract.

:::info
For uninterrupted access to Agora's products and services, ensure at least one of the following:
- Add a valid credit card for auto-recharge to your Agora account, **or**
- Maintain sufficient funds in your Agora Console balance to cover your estimated usage.

:::

Agora employs the following policies to manage your account balance and ensure uninterrupted access to its products and services.

### Real-time usage and estimated bill
 
You can view your real-time usage and estimated monthly bill at any time directly in the Agora Console.

![bill estimate preview](/images/console/bill-estimate-preview.png)
 
### Real-time reservation of balance
 
Your reserved balance is updated continuously based on your real-time bill estimation. The corresponding estimated amount is reserved from your available balance at all times.
 
![Available and reserved balance](/images/console/available-reserved-balance.png)

### Auto-recharge and account suspension
 
On the **7th, 14th, 21st, and 28th** of each calendar month (excluding February 28), if your available balance is in arrears by more than **$50**:
 
- If a valid credit card is linked, the system automatically recharges your balance to zero.
- If no credit card is linked, or if auto-recharge fails, a notification email is sent to you.
- Top up your wallet within the **24-hour grace period** to avoid account suspension.
- If your balance remains in arrears after 24 hours, your account is suspended until the balance is restored to zero or above.

### Monthly billing
 
Your final bill is issued monthly. After bill finalization:
 
- Any overpaid amount is refunded to your balance.
- Any undercharged amount is deducted accordingly.

### Balance withdrawal
 
You can withdraw your available balance at any time directly from the Agora Console.

![Withdraw balance](/images/console/withdraw-balance.png)

## End-of-life policy

Agora is committed to providing regular updates to core products, extensions, and tools. These updates include new features, updated APIs, bug fixes, security patches, and documentation improvements. Agora strongly encourages developers to update to the latest product releases to benefit from new features, security enhancements, and other improvements.

This section outlines the stages that an Agora product or service moves through, from pre-GA Beta to general availability to retirement, and the support Agora provides during each phase.

### Default introduction period

Agora guarantees a minimum introduction period of 12 months from the release of a product on the [Agora Developer Center](https://docs.agora.io/en/). During this period, Agora does not initiate any end-of-support or end-of-life actions. After the 12-month period, Agora may transition a product into the Maintenance phase, which marks the beginning of the end-of-support phase.

### SDK lifecycle

| Phase | Description |
|-------|-------------|
|Beta | During this phase, SDKs are intended solely for early access and feedback purposes. They are not recommended for use in production environments. Beta products fall outside of the EOL policy and are intended for evaluation purposes only. For more information, see the Beta Service Agreement.|
|General Availability (GA)|SDKs in this phase are fully supported by Agora. Agora provides support for new services, API updates, feature enhancements, bug fixes, and security patches. Agora guarantees a minimum of 12 months of support for GA SDKs. For details on client SDK support periods, see [Client SDK support periods​](#client-sdk-support-periods).|
|Retirement (EOL) SDKs: (Maintenance)| When an SDK enters the Retirement phase, Agora announces its retirement with a minimum notice period of 60 days, which is approximately 2 months. This announcement will include crucial timelines and guidelines to assist developers in migrating to the latest recommended SDK version. Agora communicates retirement announcements through email, the Agora Console notifications center, and SDK documentation, and may also post announcements on social media or the [Agora blog](https://www.agora.io/en/blog/). When a product or service reaches the end-of-support or end-of-life stage, Agora stops providing security updates, non-security updates, and assisted support.

### Client SDK support periods

Agora provides the following support periods for client SDKs:

| Release | Support |
|---------|---------|
| Major release | Agora guarantees support for at least 12 months starting from the date of a major release.  |
| Minor release | For minor releases, Agora ensures support for at least 6 months from the release date.  |

### Maintenance support for retired SDKs

Occasionally, Agora may transition a product SDK into a maintenance support phase focused primarily on bug fixes and security patches. In such cases, Agora notifies customers at least 60 days, approximately 2 months, in advance of the retirement period for the affected SDK.

During the Retirement phase, products entering the EOS/EOL phase will continue to be supported as follows:

| Duration | Support |
|---|---|
| Months 1–6 after EOL announcement | Agora provides bug fixes and security updates. New feature requests are not accepted. |
| Months 7–12 after EOL announcement | Agora provides security updates only. |
| After 12 months | Agora no longer supports the product or service, unless a support extension was arranged before the end of the 12-month period. |

:::info
Using an SDK beyond its maintenance support cycle is not recommended and is entirely at the developer's discretion and risk.

:::

Agora is committed to delivering the best SDK experience to its developers. This policy ensures that you have access to the latest features and security updates with clear guidance on the support timelines.

### Support extensions

Customers may apply to extend support for a retired SDK for a temporary period, subject to Agora's discretion and commercial terms. Agora reviews each request and decides whether to grant the customer a license to use the product or service for a limited period beyond the EOL timeline.

### Additional information

If you need more time to transition to the latest version of a product or service, contact your Agora account manager, partnership manager, or device manufacturer for assistance.

Agora is committed to providing support throughout the lifecycle of its products and services to ensure the best possible developer experience.

### Signaling version retirement schedule

| Version | Release date | Retirement date |
|---|---|---|
| v2.2.1 | July 17, 2024 | July 18, 2027, or 1 year after the release of v2.4.x (whichever comes first) |
| v2.2.0 | April 23, 2024 | April 24, 2027, or 1 year after the release of v2.4.x (whichever comes first) |
| v2.1.12 | June 7, 2024 | June 8, 2027, or 1 year after the release of v2.3.x (whichever comes first) |
| v2.1.11 | April 30, 2024 | May 1, 2027, or 1 year after the release of v2.3.x (whichever comes first) |
| v2.1.10 | February 26, 2024 | February 27, 2027, or 1 year after the release of v2.3.x (whichever comes first) |
| v2.1.9 | January 10, 2024 | January 11, 2027, or 1 year after the release of v2.3.x (whichever comes first) |
| v2.1.8 | December 4, 2023 | December 5, 2026, or 1 year after the release of v2.3.x (whichever comes first) |
| v2.1.7 | October 20, 2023 | October 21, 2026, or 1 year after the release of v2.3.x (whichever comes first) |
| v2.1.6 | September 19, 2023 | September 20, 2026, or 1 year after the release of v2.3.x (whichever comes first) |
| v2.1.4 | August 16, 2023 | August 17, 2026, or 1 year after the release of v2.3.x (whichever comes first) |
| v1.5.3 | October 17, 2022 | August 17, 2024 |
| v1.5.2 | October 12, 2022 | August 17, 2024 |
| v1.5.1 | September 1, 2022 | August 17, 2024 |
| v1.5.0 | July 27, 2022 | August 17, 2024 |
| v1.4.10 | March 1, 2022 | August 17, 2024 |
| v1.4.9 | November 19, 2021 | August 17, 2024 |
| v1.4.7 | July 19, 2021 | July 20, 2024 |
| v1.4.6 | June 21, 2021 | June 22, 2024 |
| v1.4.5 | April 30, 2021 | May 1, 2024 |
| v1.4.4 | April 20, 2021 | April 21, 2024 |
| v1.4.3 | February 10, 2021 | February 11, 2024 |
| v1.4.2 | November 23, 2020 | November 24, 2023 |
| v1.4.1 | September 30, 2020 | October 1, 2023 |
| v1.4.0 | September 1, 2020 | September 2, 2023 |
| v1.3.0 | May 11, 2020 | May 12, 2023 |
| v1.2.2 | December 13, 2019 | September 2, 2021 |
| v1.2.1 | November 29, 2019 | September 2, 2021 |
| v1.2.0 | November 6, 2019 | September 2, 2021 |
| v1.1.0 | September 18, 2019 | May 12, 2021 |
| v1.0.1 | August 1, 2019 | November 7, 2020 |
| v1.0.0 | July 24, 2019 | November 7, 2020 |
| v0.9.3 | June 7, 2019 | September 19, 2020 |
| v0.9.2 | May 8, 2019 | September 19, 2020 |
| v0.9.1 | April 4, 2019 | September 19, 2020 |
| v0.9.0 | February 4, 2019 | September 19, 2020 |