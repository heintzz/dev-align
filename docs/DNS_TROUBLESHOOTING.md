# 🔧 DNS Configuration Troubleshooting for Hostinger

## Issue: "DNS resource record is not valid or conflicts with another resource record"

This error occurs when trying to add a WWW A record in Hostinger.

---

## ✅ Solution 1: Delete Existing WWW Record (Recommended)

### Step 1: Find the Conflicting Record

In Hostinger DNS Zone Editor, look for:

```
Type: CNAME
Name: www
Points to: devalign.site (or @ or parking.hostinger.com)
```

**Common default CNAME records that Hostinger creates:**
- `www → devalign.site`
- `www → @`
- `www → parking.hostinger.com`

### Step 2: Delete the Conflicting Record

1. Find the **www** record
2. Click the **trash/delete icon** (🗑️) next to it
3. Confirm deletion
4. Wait for it to be removed (~30 seconds)

### Step 3: Add New A Record

Now add:
```
Type: A
Name: www
Points to: 18.141.166.14
TTL: 14400
```

Should work without conflicts! ✅

---

## ✅ Solution 2: Edit Existing Record

Instead of deleting and re-adding:

### Step 1: Edit the WWW Record

1. Find the existing **www** record
2. Click **Edit** (pencil icon ✏️)
3. Change these fields:
   - **Type:** Change from `CNAME` to `A`
   - **Points to:** Change to `18.141.166.14`
   - **TTL:** Set to `14400` or `300`
4. Click **Save** or **Update**

---

## ✅ Solution 3: Use Only devalign.site (No WWW)

If you can't resolve the conflict, you can skip the www subdomain:

### DNS Configuration (Only Root Domain)

**Add only this record:**
```
Type: A
Name: @
Points to: 18.141.166.14
TTL: 14400
```

**Skip the www record completely.**

### Use the Alternative Setup Script

I've created a special script for this scenario:

**Upload this script instead:**
```bash
scp -i devalign-fe-key.pem scripts/setup-https-frontend-no-www.sh ubuntu@18.141.166.14:~/
```

**On EC2, run:**
```bash
chmod +x setup-https-frontend-no-www.sh
sudo bash setup-https-frontend-no-www.sh
```

**This will configure SSL for:**
- ✅ `https://devalign.site` (works)
- ❌ `https://www.devalign.site` (will not work - redirect needed)

### Add WWW Redirect Later

If you want www to work later, you can add it by:

1. Resolving the DNS conflict (Solutions 1 or 2)
2. Running this command on EC2:
   ```bash
   sudo certbot --nginx -d devalign.site -d www.devalign.site --expand
   ```

---

## 🔍 Identifying DNS Conflicts in Hostinger

### Common Conflict Scenarios:

#### Scenario 1: Default CNAME for WWW
```
❌ Existing:
Type: CNAME | Name: www | Points to: @ or devalign.site

✅ You want to add:
Type: A | Name: www | Points to: 18.141.166.14

🔧 Solution: Delete CNAME, then add A record
```

#### Scenario 2: Parking Page CNAME
```
❌ Existing:
Type: CNAME | Name: www | Points to: parking.hostinger.com

✅ You want to add:
Type: A | Name: www | Points to: 18.141.166.14

🔧 Solution: Delete CNAME, then add A record
```

#### Scenario 3: Multiple WWW Records
```
❌ You have:
Type: CNAME | Name: www | Points to: someplace
Type: A     | Name: www | Points to: old.ip.address

✅ You want:
Type: A | Name: www | Points to: 18.141.166.14

🔧 Solution: Delete ALL www records, add new A record
```

---

## 📋 Step-by-Step: Fixing WWW Conflict in Hostinger

### Step 1: Login to Hostinger
1. Go to https://www.hostinger.com/
2. Click **Login**
3. Enter credentials

### Step 2: Navigate to DNS Zone
1. Click **Domains** (left sidebar)
2. Find **devalign.site**
3. Click **Manage**
4. Click **DNS / Nameservers** or **DNS Zone**

### Step 3: Review All DNS Records
Look at the list of records. You should see:

```
Type    Name    Points To           TTL
────────────────────────────────────────────
NS      ...     ns1.hostinger.com   ...
NS      ...     ns2.hostinger.com   ...
SOA     ...     ...                 ...
A       @       18.141.166.14       14400    ← You added this ✅
CNAME   www     @                   14400    ← THIS IS THE PROBLEM ⚠️
```

### Step 4: Delete Conflicting WWW Record
1. Find the row with **Name: www** and **Type: CNAME**
2. Click the **delete/trash icon** at the end of the row
3. Confirm: "Are you sure you want to delete this record?"
4. Click **Yes** or **Delete**

### Step 5: Wait for Deletion
- Wait ~30-60 seconds
- Refresh the page
- The www CNAME should be gone

### Step 6: Add New WWW A Record
1. Click **"Add Record"** or **"+ Add New Record"**
2. Fill in:
   ```
   Type:      A
   Name:      www
   Points to: 18.141.166.14
   TTL:       14400
   ```
3. Click **"Add Record"** or **"Save"**

### Step 7: Verify
You should now see:
```
Type    Name    Points To           TTL
────────────────────────────────────────────
A       @       18.141.166.14       14400    ✅
A       www     18.141.166.14       14400    ✅
```

---

## 🧪 Testing DNS After Changes

### Test from Command Line:
```bash
# Test root domain
nslookup devalign.site

# Test www subdomain
nslookup www.devalign.site

# Both should return: 18.141.166.14
```

### Test with Online Tools:
1. Visit: https://dnschecker.org/
2. Enter: `devalign.site`
3. Type: `A Record`
4. Should show `18.141.166.14` globally

Repeat for `www.devalign.site`

---

## ⚠️ Important Notes

### 1. Don't Delete These Records:
- **NS (Nameserver)** records - Required for domain to work
- **SOA (Start of Authority)** records - Required for DNS zone
- **MX (Mail Exchange)** records - If you use email with this domain

### 2. Only Delete:
- **CNAME** records for **www** that conflict
- **Old A** records for **www** pointing to wrong IP

### 3. TTL Matters:
- **TTL 14400** = 4 hours (Hostinger default)
- **TTL 300** = 5 minutes (faster updates, more DNS queries)
- Lower TTL = faster propagation when you make changes
- Higher TTL = less DNS load, but slower updates

---

## 📞 If Nothing Works

### Contact Hostinger Support:

1. **Live Chat:**
   - Login to Hostinger
   - Click **Help** or **Support** (bottom right)
   - Start chat with support agent

2. **Tell them:**
   ```
   I need to add an A record for www.devalign.site pointing to 18.141.166.14
   but I'm getting "DNS resource record is not valid or conflicts with another
   resource record". Can you help me delete the conflicting record and add
   the new A record?
   ```

3. **They can:**
   - See all your DNS records
   - Delete conflicting records
   - Add the correct A record
   - Explain what was conflicting

---

## 🎯 Quick Decision Tree

```
Can you delete the conflicting www CNAME record?
│
├─ YES → Delete it, then add www A record → Use setup-https-frontend.sh
│
└─ NO → Skip www for now → Use setup-https-frontend-no-www.sh
         └─ Add www later when conflict is resolved
```

---

## ✅ Final DNS Configuration

### Option A: With WWW (Recommended)
```
Type    Name    Points To           TTL
────────────────────────────────────────────
A       @       18.141.166.14       14400
A       www     18.141.166.14       14400
```

**Users can access:**
- ✅ http://devalign.site
- ✅ http://www.devalign.site
- ✅ https://devalign.site (after SSL setup)
- ✅ https://www.devalign.site (after SSL setup)

### Option B: Without WWW (If Conflict Can't Be Resolved)
```
Type    Name    Points To           TTL
────────────────────────────────────────────
A       @       18.141.166.14       14400
```

**Users can access:**
- ✅ http://devalign.site
- ✅ https://devalign.site (after SSL setup)
- ❌ www.devalign.site (will not work)

---

## 🚀 After DNS is Fixed

Once your DNS is configured correctly:

1. **Wait 15-30 minutes** for propagation
2. **Verify:** `nslookup devalign.site` returns `18.141.166.14`
3. **Continue with HTTPS setup** (see `HTTPS_SETUP_COMMANDS.md`)

---

**Need more help?** Check the full guide: `HTTPS_SETUP_GUIDE.md`
