---
title: Transfer to SIP Address and Dynamic SIP Headers
description: Configure outbound campaign call transfers to SIP destinations and pass custom SIP headers.
---
Use this guide when you want outbound campaign calls to transfer from AI agent to human destination over SIP instead of regular phone number.

This feature is configured in **Campaign** call settings.

## Before you begin

- You need deployed agent.
- You need outbound campaign.
- You need SIP transfer destination.
- If you want dynamic SIP headers, your contact CSV must contain required columns.

## What this feature does

When **Transfer Call to Human** is enabled in campaign settings, agent can escalate live call to transfer destination based on your transfer criteria.

You can set:

- **Transfer Type** = `SIP`
- **Transfer Destination** = SIP address
- **SIP Headers** = constant or dynamic headers sent with transfer request

## Configure SIP transfer

1. In Agent Studio, open **Campaign**.
2. Create campaign or edit draft campaign.
3. In **Call Settings**, enable **Transfer Call to Human**.
4. Set **Transfer Type** to **SIP**.
5. Enter **Transfer Destination**.
6. Enter **Transfer Criteria** to describe when agent should transfer.

Example criteria:

```text
Transfer the call when user explicitly asks for a human agent, or when request requires account actions that agent cannot complete.
```

## Valid SIP destination formats

Agent Studio accepts SIP targets such as:

- `sip:031122@112.13.168.197:5060`
- `sip:112.13.168.197:5060`
- `sip:user@domain.com:5060`

It also accepts value without `sip:` prefix in UI, but stored transfer target is normalized as SIP address.

## Add SIP headers

Use **SIP Headers** when downstream SIP system expects extra metadata.

Each header has:

- **Name**
- **Type**: `Constant` or `Dynamic`
- **Value**

Header names are normalized with `sip_h_` prefix when sent.

### Constant headers

Use constant headers when every transfer should send same value.

Example:

```text
Name: queue
Type: Constant
Value: support-l2
```

### Dynamic headers

Use dynamic headers when value should come from campaign CSV row.

Dynamic values must contain at least one CSV column wrapped in double curly braces.

Examples:

```text
{{first_name}}
vip-{{account_tier}}
{{case_id}}-{{region}}
```

Rules:

- Variable names are case-sensitive.
- Each variable must match uploaded CSV column name exactly.
- If dynamic value is missing or invalid for contact, that header is omitted from transfer request.

## Prepare CSV data for dynamic headers

If you want to use dynamic headers, add matching columns to your contact list.

Example:

```text
phone_number,first_name,account_tier,case_id,region
+19168888860,John,gold,C-1024,us-west
```

Then configure headers like:

- `customer_name` -> `{{first_name}}`
- `priority` -> `{{account_tier}}`
- `case_context` -> `{{case_id}}-{{region}}`

## Test checklist

Before you launch campaign, verify:

- SIP destination is valid.
- Transfer criteria is clear and specific.
- Dynamic header variables match CSV columns exactly.
- Sample transfer reaches expected SIP system.
- Receiving system can read custom SIP headers.

## Troubleshooting

- Transfer destination rejected: Check SIP address format and port.
- Header missing on transferred call: Check header type, CSV column name, and whether value exists for that contact.
- Transfer never happens: Tighten transfer criteria in call settings and agent prompt.
- Call transfers to wrong place: Re-check destination field and whether you selected `SIP` instead of `Number`.

## Next steps

- [Set up a campaign](campaign): Build outbound call flow
- [Set up SIP trunk](sip-trunk): Prepare telephony for outbound calling
- [Analytics](../observe/analytics): Monitor transfer outcomes after launch
