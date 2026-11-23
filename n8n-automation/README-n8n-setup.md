# Body Line Fitness Center - n8n Gym Manager Automation Setup Guide

**Client**: Body Line Fitness Center (GYM), Nandakumar, West Bengal  
**Phone**: 062949 02384  
**Setup by**: Debajoyti (Freelancer)  
**Setup Fee**: ₹10,000 – ₹15,000 (one-time)

---

## What This Automation Does

| Workflow | Trigger | Action |
|----------|---------|--------|
| 1. Member Entry | Owner fills a form | Auto-saves member to Google Sheet + WhatsApp welcome |
| 2. Expiry Reminder | Daily at 9 AM | Sends WhatsApp reminder 3 days before + on expiry day |
| 3. Payment Update | Razorpay payment webhook | Auto-updates payment status + extends expiry |
| 4. Daily Report | Daily at 8 AM | Sends owner a summary (active/expired/pending count) |
| 0. Error Handler | Any automation fails | Emails you immediately |

---

## Step 1 — Create Google Sheet

1. Go to [sheets.new](https://sheets.new) — sign in with gym owner's Google account
2. Rename the sheet from "Sheet1" → **Members**
3. In Row 1, add these headers **exactly** (no spaces, no caps changes):

```
member_id | name | phone | plan | plan_months | fee | start_date | expiry_date | payment_status | last_payment_date | last_reminder_date | last_payment_ref
```

4. Import test data: **File > Import** → upload `google-sheet-template.csv` from this folder → select "Append to current sheet"
5. Copy the Sheet ID from the URL bar:
   ```
   https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit
   ```
   Save it — you'll need it in every workflow.

> **Important**: Dates must always be `YYYY-MM-DD` plain text. Format column G (start_date), H (expiry_date), J (last_payment_date), K (last_reminder_date) as **Plain Text**: select column → Format > Number > Plain Text.

---

## Step 2 — Set Up n8n

### Option A: n8n Cloud (Recommended for beginners)
1. Go to [n8n.io](https://n8n.io) → Start Free Trial (14 days free)
2. Create account with owner's email
3. After trial: **Starter plan ~€20/month** (~₹1,800/month) — 2,500 executions/month is enough for one gym

### Option B: Self-hosted (Advanced — saves money)
- Need a VPS (DigitalOcean/Hetzner ~$5–10/month)
- Install n8n: `npx n8n`
- Not recommended if you're not technical with servers

---

## Step 3 — Connect Google Sheets in n8n

1. In n8n: **Settings > Credentials > New > Google Sheets OAuth2 API**
2. Follow the OAuth flow — sign in with the SAME Google account that owns the sheet
3. Name it: `Body Line Gym - Google Sheets`
4. Save and remember the **Credential ID** shown after saving

---

## Step 4 — Set Up WhatsApp Business Platform

> WhatsApp is the most complex step. Budget 1-2 days for this.

### 4a. Create Meta Business Account
1. Go to [business.facebook.com](https://business.facebook.com) → Create Account
2. Use gym owner's email and legal name

### 4b. Add WhatsApp to Your Meta App
1. Go to [developers.facebook.com](https://developers.facebook.com) → My Apps → Create App
2. Select "Business" type → Add WhatsApp product
3. Get your **Phone Number ID** and **WhatsApp Business Account ID**

### 4c. Create Message Templates (REQUIRED before sending)
Templates must be approved by Meta (usually 24-48 hours). Create these 4 templates:

**Template 1: `gym_welcome`** (Utility)
```
Namaste {{1}}! Body Line Fitness Center mein aapka swagat hai.
Plan: {{2}}
Membership valid till: {{3}}
Koi sawaal ho to call karein: 062949 02384
```

**Template 2: `gym_expiry_reminder`** (Utility)
```
Namaste {{1}}! Aapki Body Line Fitness Center membership {{2}} ko expire ho rahi hai ({{3}}).
Renewal ke liye gym mein aayein ya hamare number par call karein: 062949 02384
```

**Template 3: `gym_payment_confirmed`** (Utility)
```
Namaste {{1}}! Rs {{2}} ka payment mil gaya.
Aapki nayi membership expiry: {{3}}
Thank you! Body Line Fitness Center, Nandakumar
```

**Template 4: `gym_daily_report`** (Utility — for owner)
```
*Body Line Gym Report* - {{1}}
Active: {{2}} | Expired: {{3}} | Expiring Soon: {{4}}
Check n8n for full details.
```

### 4d. Connect WhatsApp in n8n
1. n8n: **Settings > Credentials > New > WhatsApp Business Cloud API**
2. Enter: Phone Number ID, Access Token (from Meta Developer dashboard)
3. Name it: `Body Line Gym - WhatsApp`

---

## Step 5 — Import Workflows into n8n

1. In n8n: click **+** → **Import from File**
2. Import in this order:
   - `workflow-0-error-handler.json` → Activate it
   - `workflow-1-member-entry.json`
   - `workflow-2-expiry-reminder.json`
   - `workflow-3-payment-update.json`
   - `workflow-4-daily-report.json`

### For EACH workflow, do these replacements:

| Placeholder | Replace With |
|-------------|-------------|
| `REPLACE_WITH_YOUR_SHEET_ID` | Your Google Sheet ID from Step 1 |
| `REPLACE_CREDENTIAL_ID` (Google) | Your Google Sheets credential |
| `REPLACE_CREDENTIAL_ID` (WhatsApp) | Your WhatsApp credential |
| `REPLACE_CREDENTIAL_ID` (Gmail) | Your Gmail credential |
| `REPLACE_WITH_PHONE_NUMBER_ID` | WhatsApp Phone Number ID from Meta |
| `REPLACE_WITH_OWNER_EMAIL@gmail.com` | Gym owner's email |
| `REPLACE_WITH_OWNER_WHATSAPP_NUMBER` | Owner's WhatsApp: `916294902384` |
| `REPLACE_WITH_YOUR_EMAIL@gmail.com` | Your (Debajoyti's) email for error alerts |

### Set Error Workflow on each workflow:
- Open each workflow → **Settings** (gear icon) → **Error Workflow** → select `BL Gym - 0. Error Handler`

### Activate all workflows:
- Toggle each workflow to **Active** (top-right switch)

---

## Step 6 — Set Up Razorpay Payment Links (Workflow 3)

1. Create account at [razorpay.com](https://razorpay.com) (or use existing)
2. Go to **Settings > Webhooks > Add New Webhook**
3. Webhook URL: copy from Workflow 3 in n8n (the Webhook node shows the URL)
   - Format: `https://your-n8n-instance.app.n8n.cloud/webhook/bl-gym-payment`
4. Events: select **`payment_link.paid`**
5. When creating a payment link for a member, set **Reference ID** = that member's `member_id` from the Google Sheet (e.g., `BL001`)

---

## Step 7 — Test Everything

### Test Workflow 1 (Member Entry):
1. Open `BL Gym - 1. Member Entry` in n8n
2. Click **Test Workflow** → it shows the form URL
3. Fill in a test member (use your own phone)
4. Check Google Sheet — new row should appear

### Test Workflow 2 (Reminders):
1. In the Sheet, change a test member's `expiry_date` to 3 days from today
2. Set `last_reminder_date` to empty
3. In Workflow 2, click **Execute Workflow** manually
4. Check if WhatsApp message arrives

### Test Workflow 3 (Payment):
1. Create a Razorpay Payment Link test with `reference_id` = `BL001`
2. Use Razorpay's test mode — pay with test card
3. Check Sheet — `payment_status` should update to `Paid`

### Test Workflow 4 (Daily Report):
1. Click **Execute Workflow** manually in Workflow 4
2. Check owner email inbox for the report

---

## Maintenance Notes

- **n8n executions**: Each workflow run = 1 execution. For 1 gym: ~100-200/month. Starter plan (2,500/month) is fine.
- **WhatsApp costs**: ~₹0.11 per utility template message (India, 2026 rates). For 100 members × 2 reminders/month = ~₹22/month.
- **Razorpay fees**: 2% per transaction (standard).
- **Template re-approval**: If you change template text, re-submit to Meta (takes 24-48h).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| WhatsApp message not sending | Check template is approved in Meta dashboard |
| Sheet not updating | Check Google Sheets credential is still connected (re-auth OAuth) |
| Webhook not receiving | Make sure n8n workflow is **Active**, not just saved |
| "Duplicate payment" skipped | Correct behavior! Idempotency check working. |
| Wrong expiry date calculated | Check `plan_months` column in sheet has the right number |
| n8n error emails not arriving | Check Gmail credential in Error Handler workflow |

---

## Delivery Checklist for Gym Owner Demo

- [ ] Google Sheet is set up with real member data imported
- [ ] All 5 workflows imported and active in n8n
- [ ] WhatsApp templates approved by Meta (wait 24-48h after submission)
- [ ] Workflow 1 tested: form fills sheet
- [ ] Workflow 2 tested: reminder message received on phone
- [ ] Workflow 3 tested: Razorpay payment updates sheet
- [ ] Workflow 4 tested: daily report email arrives at 8 AM
- [ ] Error handler tested: intentionally break one workflow and check email alert
- [ ] Owner demo walkthrough done

---

*Setup by Debajoyti | For Body Line Fitness Center, Nandakumar, West Bengal*
