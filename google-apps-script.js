/**
 * ============================================================================
 * HERMAN & DANIELLE WEDDING:
 * 1) GOOGLE SHEETS RSVP + DUAL EMAIL NOTIFICATIONS
 * 2) GOOGLE DRIVE GUEST PHOTO UPLOADS + LIVE SHARED GALLERY
 * ============================================================================
 * HOW TO UPDATE YOUR EXISTING APPS SCRIPT (Takes 1 minute):
 * 1. Open your Google Sheet -> Click "Extensions" -> "Apps Script".
 * 2. Replace all existing code with this entire file and click Save (Ctrl+S).
 * 3. Click "Deploy" -> "Manage deployments" -> Click the Pencil (Edit) icon
 *    OR click "Deploy" -> "New deployment" (Web app, Execute as: Me, Access: Anyone).
 * 4. Click "Deploy" and authorize Google Drive access when prompted!
 */

const RECIPIENT_EMAILS = 'your-email@example.com';
const PHOTO_FOLDER_NAME = 'Wedding Photos (Shared)';

/**
 * Finds or creates the shared Google Drive folder for wedding photos.
 */
function getOrCreatePhotoFolder() {
  const folders = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
  let folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(PHOTO_FOLDER_NAME);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
  return folder;
}

/**
 * Handles GET requests to list uploaded wedding photos for the live website gallery.
 */
function doGet(e) {
  try {
    const folder = getOrCreatePhotoFolder();
    const files = folder.getFiles();
    const photos = [];

    while (files.hasNext() && photos.length < 2000) {
      const file = files.next();
      const mime = file.getMimeType() || '';
      if (mime.indexOf('image/') === 0) {
        const id = file.getId();
        photos.push({
          id: id,
          name: file.getName(),
          uploadedBy: file.getDescription() || 'Wedding Guest',
          createdTime: file.getDateCreated().getTime(),
          thumbnailUrl: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w800',
          fullUrl: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1600',
          downloadUrl: 'https://drive.google.com/uc?export=download&id=' + id
        });
      }
    }

    // Sort newest photos first
    photos.sort(function (a, b) {
      return b.createdTime - a.createdTime;
    });

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        folderUrl: folder.getUrl(),
        photos: photos
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles POST requests for:
 *  - Guest Photo Uploads (when data.action === 'upload_photo')
 *  - Wedding RSVPs (default)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ------------------------------------------------------------------------
    // A. GUEST PHOTO UPLOAD TO GOOGLE DRIVE
    // ------------------------------------------------------------------------
    if (data.action === 'upload_photo') {
      const folder = getOrCreatePhotoFolder();
      const guestName = (data.guestName || 'Guest').trim();
      const safeName = guestName.replace(/[^a-zA-Z0-9 _-]/g, '') || 'Guest';
      const fileName = safeName + ' - ' + (data.fileName || 'wedding-photo.jpg');

      const decoded = Utilities.base64Decode(data.base64);
      const blob = Utilities.newBlob(decoded, data.mimeType || 'image/jpeg', fileName);
      const file = folder.createFile(blob);
      file.setDescription(guestName);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      const fileId = file.getId();
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'success',
          photo: {
            id: fileId,
            name: fileName,
            uploadedBy: guestName,
            createdTime: new Date().getTime(),
            thumbnailUrl: 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800',
            fullUrl: 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1600',
            downloadUrl: 'https://drive.google.com/uc?export=download&id=' + fileId
          }
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // ------------------------------------------------------------------------
    // B. WEDDING RSVP SUBMISSION TO GOOGLE SHEETS + DUAL EMAIL
    // ------------------------------------------------------------------------
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Guest Full Name',
        'Attending',
        'Food Choice',
        'Allergies / Dietary',
        'Contact Email',
        'Contact Phone',
        'Song Requests',
        'Personal Note'
      ]);
    }

    const timestamp = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
    const songsJoined = (data.songs || []).join('; ');

    (data.guests || []).forEach(function (guest) {
      sheet.appendRow([
        timestamp,
        guest.name,
        guest.attending,
        guest.food,
        guest.allergies || 'None',
        data.email,
        data.phone,
        songsJoined,
        data.notes || ''
      ]);
    });

    const guestSummaryHtml = (data.guests || [])
      .map(function (g) {
        return (
          '<li><strong>' +
          g.name +
          '</strong> â€” Attending: <strong>' +
          g.attending +
          '</strong> | Meal: ' +
          g.food +
          ' | Allergies: ' +
          (g.allergies || 'None') +
          '</li>'
        );
      })
      .join('');

    const htmlBody =
      '<h2>New Wedding RSVP Received!</h2>' +
      '<p><strong>Submitted:</strong> ' + timestamp + '</p>' +
      '<p><strong>Contact Email:</strong> ' + data.email + '<br/>' +
      '<strong>Contact Phone:</strong> ' + data.phone + '</p>' +
      '<h3>Household Guests:</h3>' +
      '<ul>' + guestSummaryHtml + '</ul>' +
      '<p><strong>Song Requests:</strong> ' + (songsJoined || 'None') + '</p>' +
      '<p><strong>Personal Note:</strong> ' + (data.notes || 'None') + '</p>';

    MailApp.sendEmail({
      to: RECIPIENT_EMAILS,
      subject: 'Wedding RSVP: ' + (data.guests[0] ? data.guests[0].name : data.email),
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

