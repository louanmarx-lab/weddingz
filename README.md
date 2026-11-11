# ðŸ’ Modern Wedding Website Template

A beautiful, responsive, mobile-first wedding website with **Passcode Gate**, **Live Google Sheets RSVP Logging**, **Dual Email Notifications**, and **Live Google Drive Guest Photo Albums with QR Code**.

Designed with a warm **Rustic Minimalist ("Olive Garden")** aesthetic and built-in protection against mobile forced dark-mode inversion.

---

## âœ¨ Features

- ðŸ”’ **Guest Passcode Gate:** Only invited guests with your passcode (default: LOVE2027) can access your details.
- â±ï¸ **Live Countdown Timer:** Ticking down to your ceremony date and time.
- ðŸ“¸ **Live Guest Photo Albums:** Guests can scan the wedding QR code or open the website on their phone, enter their name, and upload photos directly to your Google Drive. Photos are automatically organized into individual guest albums!
- âœ‰ï¸ **Multi-Guest RSVP Form:** Household / partner RSVPs in a single submission, menu selections, allergy tracking, song requests, and notes for the couple.
- ðŸ“Š **Instant Google Sheets Logging + Dual Email Alerts:** All RSVPs automatically append to your Google Sheet and send email notifications to both partners instantly.
- ðŸ· **BYOB Callout Banner:** Clearly communicate drink arrangements with zero confusion.
- ðŸ¨ **Travel & Accommodation Guide:** Distance-grouped lodging suggestions with direct links.
- ðŸŽ **Wishing Well / Banking Card:** One-tap copy button for your banking details.
- ðŸŽ¨ **Anti-Inversion Engine:** Prevents aggressive mobile dark-mode browsers (e.g. Samsung Internet, Chrome Android) from distorting your light aesthetic.

---

## ðŸš€ Quick Setup & Deployment

1. **Clone or Download:**
   `ash
   git clone https://github.com/louanmarx-lab/wedding-website-template.git
   `
2. **Deploy Anywhere:**
   - **GitHub Pages:** Go to Settings -> Pages -> Deploy from branch main -> root folder /.
   - **Netlify / Vercel:** Drag and drop the folder.
   - **Any Web Host / cPanel:** Upload the files directly to public_html.

---

## âš™ï¸ Connecting Google Sheets & Google Drive (Takes 2 Minutes)

1. Create a new [Google Sheet](https://sheets.new).
2. Click **Extensions** -> **Apps Script**.
3. Replace all default code with the contents of google-apps-script.js.
4. Update:
   - RECIPIENT_EMAILS with your email address(es).
   - PHOTO_FOLDER_NAME with the name of your desired Google Drive photo folder.
5. Click **Deploy** -> **New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**, approve the permissions, and copy the **Web App URL** (https://script.google.com/macros/s/.../exec).
7. Paste this URL into script.js under CONFIG.googleAppsScriptUrl.

---

## ðŸŽ¨ Personalizing Content

- **Passcode & Date:** Change passcode and weddingDateISO in script.js.
- **Names, Venue & Text:** Edit index.html to update names, date, venue, dress code, and banking details.
- **Photos:** Replace hero-hands.jpg, photo-1.jpg, photo-2.jpg, and photo-3.jpg with your own couple photos.

---

## ðŸ“„ License
Open source â€” feel free to customize and use for your own special day!
