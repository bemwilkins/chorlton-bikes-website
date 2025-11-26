# Safe Nameserver Migration Guide: Preserving Email Functionality

This guide will help you safely switch nameservers from SiteGround to Gandi for `chorltonbikedeliveries.coop` without disrupting email functionality.

## 🎯 Recommended Order of Operations

**If you're planning to switch `chorltonbikes.coop` to primary domain in Google Workspace:**

### ✅ DO THIS FIRST (Current Setup):
1. **Keep `chorltonbikedeliveries.coop` as PRIMARY** in Google Workspace for now
2. Set up redirects (following steps below)
3. Test everything works
4. **THEN** switch `chorltonbikes.coop` to primary domain

### ❌ DON'T DO THIS:
- Switching primary domain BEFORE setting up redirects
- Doing both DNS migrations at the same time

**Why?** This approach:
- ✅ Minimizes risk - one change at a time
- ✅ Keeps email working throughout
- ✅ Allows you to test redirects before changing primary domain
- ✅ Easier to troubleshoot if issues arise

## ⚠️ Critical: Email DNS Records

When you switch nameservers, **all DNS records** move to the new nameserver provider. If email records aren't set up in Gandi before switching, email will stop working.

## Step-by-Step Safe Migration Process

### Step 1: Current DNS Records from SiteGround

**✅ You've already documented these!** Here are the exact DNS records currently in SiteGround for `chorltonbikedeliveries.coop`:

#### Email Records (MUST be copied to Gandi):

**MX Records** (5 records for Google Workspace email):
```
Type: MX
Name: @ (root domain)
Priority: 1    Value: aspmx.l.google.com
Priority: 5    Value: alt1.aspmx.l.google.com
Priority: 5    Value: alt2.aspmx.l.google.com
Priority: 10   Value: alt3.aspmx.l.google.com
Priority: 10   Value: alt4.aspmx.l.google.com
```

**TXT Records** (3 records for email authentication):
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; aspf=r; adkim=r;

Type: TXT
Name: @ (root domain)
Value: v=spf1 include:_spf.google.com include:chorltonbikedeliveries.coop.spf.auto.dnssmarthost.net ~all

Type: TXT
Name: google._domainkey
Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqZfW0+udik9F0sJxhJqrWmEIJUqTkhBgoHdb+eqKSY7KxV7/cJeY4sWfnnZl1FmXXxfBilCLHIE0Ga6OY6Xi+O+TvSU9/F+STapewPWoGj7an1sCAYDGS7xWJmW6686fA/14+gDcqzwC3s8bwOoe6OYk5gBc+x8mBVdphEqTr8FiK195zVciEnDougODU/3gut7d8r25BaeVGVPWn7t/Iq0a2LmJplgL8ucxcPnH1at8q9KeyGnKJo7ZTZRyk10p7WW164SC1HEcS0A17dS51MfvPF2BQz10b5QTViX2B+smOcnCo0QYDS8CzICXY/3jbuYHNcmLaEsFN8aSpRfVbwIDAQAB
```

#### A Records (Website Hosting - These will be replaced by forwarding):

**Note**: These A records point to SiteGround's hosting (`35.214.38.142`). When you set up web forwarding in Gandi, these won't be needed, but you may want to keep some subdomains if they're used:

```
Type: A
Name: @ (root domain)
Value: 35.214.38.142

Type: A
Name: www
Value: 35.214.38.142

Type: A
Name: mail
Value: 35.214.38.142

Type: A
Name: autodiscover
Value: 35.214.38.142

Type: A
Name: autoconfig
Value: 35.214.38.142

Type: A
Name: ftp
Value: 35.214.38.142

Type: A
Name: ssh
Value: 35.214.38.142

Type: A
Name: localhost
Value: 127.0.0.1
```

**Important**: The A records for `mail`, `autodiscover`, and `autoconfig` may be needed for Google Workspace email functionality. Check with Google Workspace documentation or keep them if unsure.

### Step 3: Set Up All Records in Gandi (BEFORE Switching)

**This is the critical step** - set everything up in Gandi first:

1. **Log into Gandi.net**
2. Go to domain management for `chorltonbikedeliveries.coop`
3. If you haven't switched nameservers yet, you may need to:
   - Enable **LiveDNS** or switch to Gandi nameservers temporarily to access DNS editor
   - OR use Gandi's DNS preview/editor if available

4. **Copy ALL email-related records from Step 1** (exact values from SiteGround):

   **MX Records** (copy these 5 records exactly):
   ```
   Type: MX
   Name: @ (or blank for root domain)
   Priority: 1    Value: aspmx.l.google.com
   Priority: 5    Value: alt1.aspmx.l.google.com
   Priority: 5    Value: alt2.aspmx.l.google.com
   Priority: 10   Value: alt3.aspmx.l.google.com
   Priority: 10   Value: alt4.aspmx.l.google.com
   ```

   **TXT Records** (copy these 3 records exactly):
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; aspf=r; adkim=r;
   
   Type: TXT
   Name: @ (root domain)
   Value: v=spf1 include:_spf.google.com include:chorltonbikedeliveries.coop.spf.auto.dnssmarthost.net ~all
   
   Type: TXT
   Name: google._domainkey
   Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqZfW0+udik9F0sJxhJqrWmEIJUqTkhBgoHdb+eqKSY7KxV7/cJeY4sWfnnZl1FmXXxfBilCLHIE0Ga6OY6Xi+O+TvSU9/F+STapewPWoGj7an1sCAYDGS7xWJmW6686fA/14+gDcqzwC3s8bwOoe6OYk5gBc+x8mBVdphEqTr8FiK195zVciEnDougODU/3gut7d8r25BaeVGVPWn7t/Iq0a2LmJplgL8ucxcPnH1at8q9KeyGnKJo7ZTZRyk10p7WW164SC1HEcS0A17dS51MfvPF2BQz10b5QTViX2B+smOcnCo0QYDS8CzICXY/3jbuYHNcmLaEsFN8aSpRfVbwIDAQAB
   ```

   **A Records** (optional - for email subdomains, keep these if needed):
   ```
   Type: A
   Name: mail
   Value: 35.214.38.142
   
   Type: A
   Name: autodiscover
   Value: 35.214.38.142
   
   Type: A
   Name: autoconfig
   Value: 35.214.38.142
   ```
   
   **Note**: The root domain A record (`@` pointing to `35.214.38.142`) will be replaced by web forwarding, so you don't need to add it.

5. **Important**: 
   - Copy the **FULL** SPF and DKIM TXT record values from SiteGround (they may be truncated in the interface)
   - Double-check all records match exactly what's in SiteGround
   - Verify priority values for MX records are correct
6. **Save** all records

### Step 3b: Copy-Paste DNS Records for Gandi

**Simple copy-paste format - add these records in Gandi's DNS editor:**

```
MX Records (add all 5):
@ MX 1 aspmx.l.google.com
@ MX 5 alt1.aspmx.l.google.com
@ MX 5 alt2.aspmx.l.google.com
@ MX 10 alt3.aspmx.l.google.com
@ MX 10 alt4.aspmx.l.google.com

TXT Records (add all 3):
@ TXT "v=spf1 include:_spf.google.com include:chorltonbikedeliveries.coop.spf.auto.dnssmarthost.net ~all"
google._domainkey TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqZfW0+udik9F0sJxhJqrWmEIJUqTkhBgoHdb+eqKSY7KxV7/cJeY4sWfnnZl1FmXXxfBilCLHIE0Ga6OY6Xi+O+TvSU9/F+STapewPWoGj7an1sCAYDGS7xWJmW6686fA/14+gDcqzwC3s8bwOoe6OYk5gBc+x8mBVdphEqTr8FiK195zVciEnDougODU/3gut7d8r25BaeVGVPWn7t/Iq0a2LmJplgL8ucxcPnH1at8q9KeyGnKJo7ZTZRyk10p7WW164SC1HEcS0A17dS51MfvPF2BQz10b5QTViX2B+smOcnCo0QYDS8CzICXY/3jbuYHNcmLaEsFN8aSpRfVbwIDAQAB"
_dmarc TXT "v=DMARC1; p=none; aspf=r; adkim=r;"

A Records (optional - for email subdomains):
mail A 35.214.38.142
autodiscover A 35.214.38.142
autoconfig A 35.214.38.142

CNAME Records (keep www for forwarding):
www CNAME webredir.vip.gandi.net
```

**Remember to DELETE the default Gandi MX and TXT records first!**

---

### Step 3c: Detailed DNS Records for Gandi (Copy-Paste Ready)

**Delete these default Gandi records:**
- The default MX records (spool.mail.gandi.net and fb.mail.gandi.net)
- The default SPF TXT record
- The default A record pointing to 217.70.184.38
- The default SRV records (_imap, _imaps, _pop3, _pop3s, _submission)
- The webmail CNAME (unless you want to keep it)

**Add/Replace with these records:**

#### MX Records (5 records - replace the default Gandi MX records):
```
Type: MX
Name: @
TTL: 10800
Priority: 1
Value: aspmx.l.google.com

Type: MX
Name: @
TTL: 10800
Priority: 5
Value: alt1.aspmx.l.google.com

Type: MX
Name: @
TTL: 10800
Priority: 5
Value: alt2.aspmx.l.google.com

Type: MX
Name: @
TTL: 10800
Priority: 10
Value: alt3.aspmx.l.google.com

Type: MX
Name: @
TTL: 10800
Priority: 10
Value: alt4.aspmx.l.google.com
```

#### TXT Records (3 records - replace the default SPF):
```
Type: TXT
Name: @
TTL: 10800
Value: v=spf1 include:_spf.google.com include:chorltonbikedeliveries.coop.spf.auto.dnssmarthost.net ~all

Type: TXT
Name: google._domainkey
TTL: 10800
Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqZfW0+udik9F0sJxhJqrWmEIJUqTkhBgoHdb+eqKSY7KxV7/cJeY4sWfnnZl1FmXXxfBilCLHIE0Ga6OY6Xi+O+TvSU9/F+STapewPWoGj7an1sCAYDGS7xWJmW6686fA/14+gDcqzwC3s8bwOoe6OYk5gBc+x8mBVdphEqTr8FiK195zVciEnDougODU/3gut7d8r25BaeVGVPWn7t/Iq0a2LmJplgL8ucxcPnH1at8q9KeyGnKJo7ZTZRyk10p7WW164SC1HEcS0A17dS51MfvPF2BQz10b5QTViX2B+smOcnCo0QYDS8CzICXY/3jbuYHNcmLaEsFN8aSpRfVbwIDAQAB

Type: TXT
Name: _dmarc
TTL: 10800
Value: v=DMARC1; p=none; aspf=r; adkim=r;
```

#### A Records (Optional - for email subdomains, if needed):
```
Type: A
Name: mail
TTL: 10800
Value: 35.214.38.142

Type: A
Name: autodiscover
TTL: 10800
Value: 35.214.38.142

Type: A
Name: autoconfig
TTL: 10800
Value: 35.214.38.142
```

#### CNAME Records (Keep www for web forwarding):
```
Type: CNAME
Name: www
TTL: 10800
Value: webredir.vip.gandi.net
```

**Note**: 
- Keep the SOA record (don't delete it)
- The `www` CNAME pointing to `webredir.vip.gandi.net` is correct for web forwarding
- You can delete the root domain A record (`@` pointing to `217.70.184.38`) as web forwarding will handle that
- After setting up these DNS records, you'll configure the actual web forwarding target in Gandi's Web Redirections interface

### Quick Reference: What to Delete vs Add

**DELETE these default Gandi records:**
- ❌ `@ IN A 217.70.184.38` (root domain A record)
- ❌ `@ IN MX 10 spool.mail.gandi.net.` (default MX)
- ❌ `@ IN MX 50 fb.mail.gandi.net.` (default MX)
- ❌ `@ IN TXT "v=spf1 include:_mailcust.gandi.net ?all"` (default SPF)
- ❌ All SRV records (_imap, _imaps, _pop3, _pop3s, _submission)
- ❌ `webmail IN CNAME webmail.gandi.net.` (optional - only if you don't use it)

**KEEP these:**
- ✅ `@ IN SOA ...` (keep the SOA record)
- ✅ `www IN CNAME webredir.vip.gandi.net.` (needed for web forwarding)

**ADD these (your email records):**
- ✅ 5 MX records (Google Workspace)
- ✅ 3 TXT records (SPF, DKIM, DMARC)
- ✅ Optional: A records for mail/autodiscover/autoconfig

### Step 4: Verify Records in Gandi

Before switching, verify the records are correct:

1. Use a DNS checker tool: https://www.whatsmydns.net/
2. Check MX records: https://www.whatsmydns.net/#MX/chorltonbikedeliveries.coop
3. Check TXT records: https://www.whatsmydns.net/#TXT/chorltonbikedeliveries.coop
4. **Note**: These won't show Gandi's records yet (since nameservers haven't switched), but you can verify they're entered correctly in Gandi's interface

### Step 5: Switch Nameservers to Gandi

**Only after all records are set up in Gandi:**

1. **In Gandi.net**, go to domain management for `chorltonbikedeliveries.coop`
2. Find **Nameservers** or **DNS Servers** section
3. Change from "External nameservers" to **"Gandi LiveDNS"** or **"Gandi nameservers"**
4. Gandi will provide nameserver addresses (e.g., `ns1.gandi.net`, `ns2.gandi.net`)
5. **If domain is registered at Gandi**: The change happens immediately
6. **If domain is registered elsewhere**: Update nameservers at your registrar

### Step 6: Set Up Web Forwarding in Gandi

**After nameservers are switched and DNS has propagated:**

1. Go to **Web Redirections** in Gandi.net
2. Create redirect:
   - **Source**: `chorltonbikedeliveries.coop`
   - **Target**: `https://chorltonbikes.coop`
   - **Type**: 301 Permanent Redirect
   - **Preserve path**: Yes
3. Create redirect for `www.chorltonbikedeliveries.coop` as well

### Step 7: Monitor and Test

**After switching** (wait 15-30 minutes for DNS propagation):

1. **Test email**:
   - Send a test email to an address on `chorltonbikedeliveries.coop`
   - Check if it arrives
   - Send an email FROM that address
   - Verify it works

2. **Test DNS records**:
   - Check MX records: https://www.whatsmydns.net/#MX/chorltonbikedeliveries.coop
   - Should show Google's mail servers
   - Check TXT records for SPF/DKIM/DMARC

3. **Test web redirect**:
   - Visit `https://chorltonbikedeliveries.coop`
   - Should redirect to `https://chorltonbikes.coop`

## Alternative: Keep External Nameservers (Less Disruptive)

If you want to **avoid any risk of email disruption**, you can:

1. **Keep using SiteGround nameservers**
2. **Add web forwarding DNS records at SiteGround** (as specified by Gandi's message)
3. This keeps email records unchanged
4. Only adds the forwarding records

**Downside**: You'll be managing DNS in two places (SiteGround for this domain, Gandi for the new one).

## Recommended Approach

**For minimal disruption**:
1. ✅ Document all current DNS records
2. ✅ Set up all email records in Gandi first
3. ✅ Verify records are correct
4. ✅ Switch nameservers
5. ✅ Set up web forwarding
6. ✅ Test everything

**Timeline**: Plan for 1-2 hours of downtime during DNS propagation, but if you set up records correctly in advance, email should continue working.

## Quick Checklist

Before switching nameservers, ensure you have in Gandi:
- [ ] **5 MX records** (aspmx.l.google.com priority 1, alt1/alt2 priority 5, alt3/alt4 priority 10)
- [ ] **SPF TXT record** (Name: @, value: `v=spf1 include:_spf.google.com include:chorltonbikedeliveries.coop.spf.auto.dnssmarthost.net ~all`)
- [ ] **DKIM TXT record** (Name: google._domainkey, full RSA key value)
- [ ] **DMARC TXT record** (Name: _dmarc, value: `v=DMARC1; p=none; aspf=r; adkim=r;`)
- [ ] **A records for mail/autodiscover/autoconfig** (if needed for Google Workspace)
- [ ] **Web forwarding configured** (after switch)

## Step 8: Switch Primary Domain in Google Workspace (After Redirect is Working)

**Only do this AFTER the redirect is set up and working:**

1. **Wait 24-48 hours** after redirect is working to ensure stability
2. **Log into Google Workspace Admin Console**: https://admin.google.com
3. Go to **Domains** (in left sidebar)
4. Find `chorltonbikes.coop` (currently secondary)
5. Click on it and select **Make primary domain** or **Set as primary**
6. Google will guide you through the process
7. **Important**: This will:
   - Change all user email addresses from `@chorltonbikedeliveries.coop` to `@chorltonbikes.coop`
   - Update group email addresses
   - You may need to update email addresses in your website/communications
8. **After switching primary domain**:
   - Verify email still works with new addresses
   - Update any email links in your website
   - Update business cards, letterheads, etc.

**Note**: The redirect will still work - `chorltonbikedeliveries.coop` will continue redirecting to `chorltonbikes.coop` even after the primary domain switch.

## Important Notes About TXT Records

**✅ Full values documented above!**

The complete SPF and DKIM TXT record values are now documented in this guide. When copying to Gandi:
1. **Copy the exact values** as shown in Step 3
2. **Paste exactly** into Gandi (including all characters)
3. **Verify** the values match exactly after pasting

The SPF record includes `include:chorltonbikedeliveries.coop.spf.auto.dnssmarthost.net` (note the `dnssmarthost.net` part - this is important for email delivery).

## Need Help?

If you're unsure about any DNS records:
1. Click "Edit" on each record in SiteGround to see full values
2. Check Google Workspace Admin Console for the exact MX and TXT records
3. Compare with what's currently in SiteGround
4. Copy them exactly to Gandi

