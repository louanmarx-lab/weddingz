// ============================================================================
// CONFIGURATION (Update when your Google Apps Script & Photo Album URLs are ready)
// ============================================================================
const CONFIG = {
  passcode: 'LOVE2027',
  weddingDateISO: '2027-02-06T16:00:00+02:00', // 6 Feb 2027 at 16:00 SAST
  // Paste your deployed Google Apps Script Web App URL here (see google-apps-script.js)
  googleAppsScriptUrl: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
  // Paste your shared Google Drive / Google Photos or WedUploader link here
  sharedPhotoAlbumUrl: 'https://photos.google.com/',
  whatsappNumbers: {
    partner1: '27123456789',   // 072 818 9714
    partner2: '27987654321'  // 082 608 7172
  },
  // Wedding Menu Options
  foodOptions: [
    'Option 1: Chicken Roulade',
    'Option 2: Slow Roasted Beef Short Rib'
  ]
};

// ============================================================================
// 1. PASSCODE GATE
// ============================================================================
const passcodeGate = document.getElementById('passcode-gate');
const passcodeForm = document.getElementById('passcode-form');
const passcodeInput = document.getElementById('passcode-input');
const passcodeError = document.getElementById('passcode-error');
const togglePasscodeBtn = document.getElementById('toggle-passcode');

function unlockSite() {
  passcodeGate.classList.add('unlocked');
  document.body.classList.remove('locked');
  sessionStorage.setItem('wedding_unlocked', 'true');
}

if (sessionStorage.getItem('wedding_unlocked') === 'true') {
  unlockSite();
}

passcodeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const entered = passcodeInput.value.trim();
  if (entered.toLowerCase() === CONFIG.passcode.toLowerCase()) {
    passcodeError.hidden = true;
    unlockSite();
  } else {
    passcodeError.hidden = false;
    passcodeInput.select();
  }
});

togglePasscodeBtn.addEventListener('click', () => {
  const isPassword = passcodeInput.type === 'password';
  passcodeInput.type = isPassword ? 'text' : 'password';
  togglePasscodeBtn.textContent = isPassword ? 'Hide' : 'Show';
});

// ============================================================================
// 2. MOBILE MENU
// ============================================================================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// ============================================================================
// 3. COUNTDOWN TIMER (6 Feb 2027 @ 16:00)
// ============================================================================
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');

function updateCountdown() {
  const target = new Date(CONFIG.weddingDateISO).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    cdDays.textContent = '0';
    cdHours.textContent = '00';
    cdMins.textContent = '00';
    cdSecs.textContent = '00';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  cdDays.textContent = String(days);
  cdHours.textContent = String(hours).padStart(2, '0');
  cdMins.textContent = String(mins).padStart(2, '0');
  cdSecs.textContent = String(secs).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ============================================================================
// 4. DYNAMIC FAMILY / HOUSEHOLD RSVP FORM
// ============================================================================
const guestsContainer = document.getElementById('guests-container');
const addGuestBtn = document.getElementById('add-guest-btn');
const songsContainer = document.getElementById('songs-container');
const addSongBtn = document.getElementById('add-song-btn');
const rsvpForm = document.getElementById('rsvp-form');
const rsvpSuccess = document.getElementById('rsvp-success');
const rsvpSubmitBtn = document.getElementById('rsvp-submit-btn');
const rsvpResetBtn = document.getElementById('rsvp-reset-btn');

let guestCounter = 0;

function createGuestCard(index, isRemovable = true) {
  const card = document.createElement('div');
  card.className = 'guest-card';
  card.dataset.guestIndex = index;

  const foodOptionsHtml = CONFIG.foodOptions
    .map((opt) => `<option value="${opt}">${opt}</option>`)
    .join('');

  card.innerHTML = `
    <div class="guest-card-header">
      <h4>Guest ${index} ${index === 1 ? '(You)' : '(Family / Household Member)'}</h4>
      ${isRemovable ? `<button type="button" class="remove-guest-btn">Remove</button>` : ''}
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Full Name &amp; Surname *</label>
        <input type="text" class="guest-name" placeholder="e.g. Jan Swanepoel" required />
      </div>
      <div class="form-field">
        <label>Will you be attending? *</label>
        <select class="guest-attending" required>
          <option value="Yes">Yes, joyfully attending!</option>
          <option value="No">Regretfully unable to attend</option>
        </select>
      </div>
    </div>
    <div class="guest-attending-fields">
      <div class="form-row">
        <div class="form-field">
          <label>Food / Meal Choice *</label>
          <select class="guest-food">
            ${foodOptionsHtml}
          </select>
        </div>
        <div class="form-field">
          <label>Allergies or Dietary Requirements (If any)</label>
          <input type="text" class="guest-allergies" placeholder="None, or e.g. Nut allergy, Gluten-free" />
        </div>
      </div>
    </div>
  `;

  // Toggle food/allergy fields when attendance changes
  const attendingSelect = card.querySelector('.guest-attending');
  const attendingFields = card.querySelector('.guest-attending-fields');
  attendingSelect.addEventListener('change', () => {
    if (attendingSelect.value === 'No') {
      attendingFields.style.display = 'none';
    } else {
      attendingFields.style.display = 'block';
    }
  });

  if (isRemovable) {
    card.querySelector('.remove-guest-btn').addEventListener('click', () => {
      card.remove();
      renumberGuests();
    });
  }

  return card;
}

function renumberGuests() {
  const cards = guestsContainer.querySelectorAll('.guest-card');
  cards.forEach((card, idx) => {
    const num = idx + 1;
    const heading = card.querySelector('h4');
    heading.textContent = `Guest ${num} ${num === 1 ? '(You)' : '(Family / Household Member)'}`;
  });
  guestCounter = cards.length;
}

// Initialize with Guest 1
guestCounter = 1;
guestsContainer.appendChild(createGuestCard(1, false));

addGuestBtn.addEventListener('click', () => {
  guestCounter += 1;
  guestsContainer.appendChild(createGuestCard(guestCounter, true));
});

// Add multiple songs
addSongBtn.addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'song-row';
  row.innerHTML = `
    <input type="text" name="song[]" class="song-input" placeholder="Another song title &amp; artist..." />
    <button type="button" class="remove-guest-btn" aria-label="Remove song">Remove</button>
  `;
  row.querySelector('button').addEventListener('click', () => row.remove());
  songsContainer.appendChild(row);
});

// Build WhatsApp message text from RSVP payload
function buildWhatsAppText(payload) {
  const lines = [
    `*Wedding RSVP: Herman & Danielle (6 Feb 2027)*`,
    `Contact Email: ${payload.email}`,
    `Contact Phone: ${payload.phone}`,
    ``,
    `*Guests (${payload.guests.length}):*`
  ];

  payload.guests.forEach((g, i) => {
    if (g.attending === 'Yes') {
      lines.push(
        `${i + 1}. *${g.name}* - ATTENDING`,
        `   â€¢ Meal: ${g.food}`,
        `   â€¢ Allergies: ${g.allergies || 'None'}`
      );
    } else {
      lines.push(`${i + 1}. *${g.name}* - NOT ATTENDING`);
    }
  });

  if (payload.songs.length > 0) {
    lines.push(``, `*Song Requests:* ${payload.songs.join('; ')}`);
  }

  if (payload.notes) {
    lines.push(``, `*Note:* ${payload.notes}`);
  }

  return lines.join('\n');
}

// Handle Form Submit
rsvpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const notes = document.getElementById('rsvp-notes').value.trim();

  const guests = Array.from(guestsContainer.querySelectorAll('.guest-card')).map((card) => {
    const attending = card.querySelector('.guest-attending').value;
    return {
      name: card.querySelector('.guest-name').value.trim(),
      attending,
      food: attending === 'Yes' ? card.querySelector('.guest-food').value : 'N/A',
      allergies: attending === 'Yes' ? card.querySelector('.guest-allergies').value.trim() : 'N/A'
    };
  });

  const songs = Array.from(songsContainer.querySelectorAll('.song-input'))
    .map((input) => input.value.trim())
    .filter(Boolean);

  const payload = {
    submittedAt: new Date().toISOString(),
    email: 'N/A',
    phone: 'N/A',
    guests,
    songs,
    notes
  };

  rsvpSubmitBtn.disabled = true;
  rsvpSubmitBtn.textContent = 'Submitting RSVP...';

  // Send to Google Sheets + Dual Email via Google Apps Script
  if (CONFIG.googleAppsScriptUrl) {
    try {
      await fetch(CONFIG.googleAppsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Error sending to Google Sheets:', err);
    }
  }

  rsvpForm.hidden = true;
  rsvpSuccess.hidden = false;
  rsvpSubmitBtn.disabled = false;
  rsvpSubmitBtn.textContent = 'Submit RSVP';
  rsvpSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ============================================================================
// 5. COPY BANK ACCOUNT NUMBER
// ============================================================================
const copyBankBtn = document.getElementById('copy-bank-btn');
const accNumber = document.getElementById('acc-number');

copyBankBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(accNumber.textContent.trim());
    const original = copyBankBtn.textContent;
    copyBankBtn.textContent = 'Copied: 1234567890 âœ“';
    setTimeout(() => {
      copyBankBtn.textContent = original;
    }, 2500);
  } catch {
    alert('Account Number: 1234567890');
  }
});

// ============================================================================
// 6. DIRECT GOOGLE DRIVE PHOTO UPLOADER + GUEST ALBUMS GALLERY + QR CODE
// ============================================================================
const qrCodeImg = document.getElementById('qr-code-img');
const photoUploadForm = document.getElementById('photo-upload-form');
const uploaderNameInput = document.getElementById('uploader-name');
const existingAlbumsDatalist = document.getElementById('existing-albums-list');
const photoFileInput = document.getElementById('photo-file-input');
const selectPhotosBtn = document.getElementById('select-photos-btn');
const selectedFilesInfo = document.getElementById('selected-files-info');
const uploadSubmitBtn = document.getElementById('upload-submit-btn');
const uploadProgressBox = document.getElementById('upload-progress-box');
const uploadProgressBar = document.getElementById('upload-progress-bar');
const uploadStatusText = document.getElementById('upload-status-text');

const galleryHeading = document.getElementById('gallery-heading');
const gallerySubheading = document.getElementById('gallery-subheading');
const galleryGrid = document.getElementById('gallery-grid');
const backToAlbumsBtn = document.getElementById('back-to-albums-btn');
const refreshGalleryBtn = document.getElementById('refresh-gallery-btn');
const saveAllPhotosBtn = document.getElementById('save-all-photos-btn');

let currentGalleryPhotos = [];
let currentAlbums = [];
let activeAlbumKey = null; // null = show all guest album covers; string = show that guest's photos

const UPLOADER_STORAGE_KEY = 'wedding_uploader_name';

// Pre-fill guest name if they already uploaded from this phone earlier
try {
  const savedUploaderName = localStorage.getItem(UPLOADER_STORAGE_KEY);
  if (savedUploaderName && uploaderNameInput) {
    uploaderNameInput.value = savedUploaderName;
  }
} catch (e) {
  // Ignore storage errors in private browsing
}

const lightbox = document.getElementById('photo-lightbox');
const lightboxBackdrop = document.getElementById('lightbox-backdrop');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxDownload = document.getElementById('lightbox-download');

// Automatically generate QR code pointing to this website's #photos section
const currentSitePhotoUrl = window.location.href.startsWith('http')
  ? `${window.location.origin}${window.location.pathname}#photos`
  : 'https://your-domain.com/#photos';

qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=2A2C22&bgcolor=F3EFE6&data=${encodeURIComponent(currentSitePhotoUrl)}`;

// Open native phone camera roll picker (require guest name first so album is known)
selectPhotosBtn.addEventListener('click', () => {
  if (!uploaderNameInput.value.trim()) {
    uploaderNameInput.focus();
    if (typeof uploaderNameInput.reportValidity === 'function') {
      uploaderNameInput.reportValidity();
    }
    return;
  }
  photoFileInput.click();
});

photoFileInput.addEventListener('change', () => {
  const files = Array.from(photoFileInput.files || []);
  if (files.length === 0) {
    selectedFilesInfo.hidden = true;
    uploadSubmitBtn.hidden = true;
    return;
  }
  const guestName = uploaderNameInput.value.trim();
  selectedFilesInfo.textContent = guestName
    ? `${files.length} photo${files.length > 1 ? 's' : ''} ready to upload to ${guestName}'s Album.`
    : `${files.length} photo${files.length > 1 ? 's' : ''} selected and ready to upload.`;
  selectedFilesInfo.hidden = false;
  uploadSubmitBtn.hidden = false;
});

// Helper: Normalize & format a guest name nicely (e.g., "carli" -> "Carli")
function formatAlbumDisplayName(rawName) {
  const cleaned = String(rawName || 'Wedding Guest').trim().replace(/\s+/g, ' ');
  if (!cleaned) return 'Wedding Guest';
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getAlbumTitleText(displayName) {
  return displayName.endsWith('s') || displayName.endsWith('S')
    ? `${displayName}' Album`
    : `${displayName}'s Album`;
}

// Helper: Read & optimize image to base64 (max 2000px so phone uploads are fast & sharp)
function fileToOptimizedBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        // Fallback: raw base64
        const rawBase64 = String(e.target.result).split(',')[1];
        resolve({ base64: rawBase64, mimeType: file.type || 'image/jpeg' });
      };
      img.onload = () => {
        const MAX_DIM = 2000;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({
          base64: dataUrl.split(',')[1],
          mimeType: 'image/jpeg'
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Upload selected photos to Google Drive via Google Apps Script
photoUploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const rawGuestName = uploaderNameInput.value.trim();
  if (!rawGuestName) {
    uploaderNameInput.focus();
    if (typeof uploaderNameInput.reportValidity === 'function') {
      uploaderNameInput.reportValidity();
    }
    return;
  }

  const files = Array.from(photoFileInput.files || []);
  if (files.length === 0) return;

  const guestName = formatAlbumDisplayName(rawGuestName);
  uploaderNameInput.value = guestName;

  try {
    localStorage.setItem(UPLOADER_STORAGE_KEY, guestName);
  } catch (err) {
    // Ignore storage errors
  }

  selectPhotosBtn.disabled = true;
  uploadSubmitBtn.disabled = true;
  uploadProgressBox.hidden = false;
  uploadProgressBar.style.width = '0%';

  let uploadedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    uploadStatusText.textContent = `Uploading photo ${i + 1} of ${files.length} to ${getAlbumTitleText(guestName)}...`;

    try {
      const { base64, mimeType } = await fileToOptimizedBase64(file);

      const response = await fetch(CONFIG.googleAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'upload_photo',
          guestName,
          fileName: file.name.replace(/\.[^.]+$/, '') + '.jpg',
          mimeType,
          base64
        })
      });

      const result = await response.json();
      if (result && result.status === 'success') {
        uploadedCount++;
      } else {
        console.error('Apps Script returned error:', result);
        uploadStatusText.textContent = `Error from Google Drive: ${result.message || 'Please check Apps Script deployment.'}`;
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
      uploadStatusText.textContent = 'Upload failed â€” please make sure the new script is deployed as a "Web app" (not Library) and authorized.';
    }

    const pct = Math.round(((i + 1) / files.length) * 100);
    uploadProgressBar.style.width = `${pct}%`;
  }

  if (uploadedCount > 0) {
    uploadStatusText.textContent = `âœ“ Added ${uploadedCount} photo${uploadedCount !== 1 ? 's' : ''} to ${getAlbumTitleText(guestName)}!`;
    photoFileInput.value = '';
    selectedFilesInfo.hidden = true;
    uploadSubmitBtn.hidden = true;
    // Open this guest's album automatically once refreshed
    activeAlbumKey = guestName.toLowerCase();
    setTimeout(loadGalleryPhotos, 800);
  }

  selectPhotosBtn.disabled = false;
  uploadSubmitBtn.disabled = false;
});

// Lightbox preview
function openLightbox(photo) {
  lightboxImg.src = photo.fullUrl || photo.thumbnailUrl;
  lightboxCaption.textContent = `Album: ${formatAlbumDisplayName(photo.uploadedBy || 'Wedding Guest')}`;
  lightboxDownload.href = photo.downloadUrl;
  lightbox.hidden = false;
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);

// Group flat photo array into Guest Albums (case-insensitive matching)
function buildAlbumsFromPhotos(photos) {
  const albumMap = new Map();

  photos.forEach((photo) => {
    const rawName = String(photo.uploadedBy || 'Wedding Guest').trim().replace(/\s+/g, ' ') || 'Wedding Guest';
    const key = rawName.toLowerCase();

    if (!albumMap.has(key)) {
      albumMap.set(key, {
        key,
        displayName: formatAlbumDisplayName(rawName),
        photos: [],
        latestTime: photo.createdTime || 0
      });
    }

    const album = albumMap.get(key);
    album.photos.push(photo);
    if ((photo.createdTime || 0) > album.latestTime) {
      album.latestTime = photo.createdTime || 0;
    }
  });

  // Sort albums with most recently updated first
  const albums = Array.from(albumMap.values()).sort((a, b) => b.latestTime - a.latestTime);

  // Update autocomplete datalist so guests can see existing album names
  if (existingAlbumsDatalist) {
    existingAlbumsDatalist.innerHTML = albums
      .map((a) => `<option value="${a.displayName}"></option>`)
      .join('');
  }

  return albums;
}

// Render either the Guest Albums Grid OR the Photos inside the selected Guest Album
function renderGalleryView() {
  if (currentAlbums.length === 0) {
    activeAlbumKey = null;
    backToAlbumsBtn.hidden = true;
    saveAllPhotosBtn.hidden = true;
    galleryHeading.textContent = 'Guest Photo Albums';
    gallerySubheading.textContent = "Tap on any guest's album below to open and save their photos.";
    galleryGrid.innerHTML = `
      <p class="gallery-empty-msg">
        No guest albums created yet â€” enter your name and upload a photo above to create the first album!
      </p>
    `;
    return;
  }

  // Check if we are viewing a specific guest's album
  const selectedAlbum = activeAlbumKey
    ? currentAlbums.find((a) => a.key === activeAlbumKey)
    : null;

  if (!selectedAlbum) {
    // VIEW 1: ALL GUEST ALBUMS (Loads only 1 cover photo per album!)
    activeAlbumKey = null;
    backToAlbumsBtn.hidden = true;
    saveAllPhotosBtn.hidden = true;
    galleryHeading.textContent = `Guest Photo Albums (${currentAlbums.length})`;
    gallerySubheading.textContent = "Tap on a guest's album below to open and view their photos.";
    galleryGrid.innerHTML = '';

    currentAlbums.forEach((album) => {
      const coverPhoto = album.photos[0];
      const count = album.photos.length;
      const card = document.createElement('div');
      card.className = 'album-card';
      card.innerHTML = `
        <div class="album-cover-wrap">
          <img src="${coverPhoto.thumbnailUrl}" alt="${getAlbumTitleText(album.displayName)}" loading="lazy" referrerpolicy="no-referrer" />
          <span class="album-count-badge">&#128247; ${count} Photo${count === 1 ? '' : 's'}</span>
        </div>
        <div class="album-card-body">
          <h4 class="album-title">${getAlbumTitleText(album.displayName)}</h4>
          <span class="album-open-link">Open &rarr;</span>
        </div>
      `;
      card.addEventListener('click', () => {
        activeAlbumKey = album.key;
        renderGalleryView();
      });
      galleryGrid.appendChild(card);
    });
  } else {
    // VIEW 2: INSIDE A SPECIFIC GUEST'S ALBUM (Loads only that person's photos!)
    const albumTitle = getAlbumTitleText(selectedAlbum.displayName);
    backToAlbumsBtn.hidden = false;
    saveAllPhotosBtn.hidden = false;
    saveAllPhotosBtn.textContent = `â¬‡ Save All in ${albumTitle} (${selectedAlbum.photos.length})`;
    galleryHeading.textContent = `${albumTitle} (${selectedAlbum.photos.length} Photo${selectedAlbum.photos.length === 1 ? '' : 's'})`;
    gallerySubheading.textContent = 'Tap any photo to view full size or save it to your phone.';
    galleryGrid.innerHTML = '';

    selectedAlbum.photos.forEach((photo) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.innerHTML = `
        <div class="gallery-img-wrap" title="Tap to view full size">
          <img src="${photo.thumbnailUrl}" alt="${photo.name}" loading="lazy" referrerpolicy="no-referrer" />
        </div>
        <div class="gallery-card-footer">
          <span class="gallery-uploader">${selectedAlbum.displayName}</span>
          <a href="${photo.downloadUrl}" target="_blank" rel="noopener noreferrer" class="gallery-save-link">
            &#11015; Save
          </a>
        </div>
      `;
      card.querySelector('.gallery-img-wrap').addEventListener('click', () => openLightbox(photo));
      galleryGrid.appendChild(card);
    });
  }
}

backToAlbumsBtn.addEventListener('click', () => {
  activeAlbumKey = null;
  renderGalleryView();
});

// Fetch & render live gallery from Google Drive
async function loadGalleryPhotos() {
  if (!CONFIG.googleAppsScriptUrl) return;

  refreshGalleryBtn.disabled = true;
  refreshGalleryBtn.textContent = 'Loading...';

  try {
    const res = await fetch(`${CONFIG.googleAppsScriptUrl}?action=list_photos`);
    const data = await res.json();

    const ignoredTestPhotoIds = new Set([
      '11OsRZ-HX5gw8rfjr-DINuFCpHLStAg7_',
      '1TiBWOFvv4jW5vpZDiszOF_JvU-AVjyA4'
    ]);
    const photos = (data.photos || []).filter((p) => !ignoredTestPhotoIds.has(p.id));
    currentGalleryPhotos = photos;
    currentAlbums = buildAlbumsFromPhotos(photos);
    renderGalleryView();
  } catch (err) {
    console.warn('Gallery will activate once the updated google-apps-script.js is deployed:', err);
  } finally {
    refreshGalleryBtn.disabled = false;
    refreshGalleryBtn.textContent = 'â†» Refresh Albums';
  }
}

refreshGalleryBtn.addEventListener('click', loadGalleryPhotos);

// Save / Download All Photos inside the currently open Guest Album
saveAllPhotosBtn.addEventListener('click', () => {
  const selectedAlbum = activeAlbumKey
    ? currentAlbums.find((a) => a.key === activeAlbumKey)
    : null;
  const photosToSave = selectedAlbum ? selectedAlbum.photos : currentGalleryPhotos;
  if (photosToSave.length === 0) return;

  const albumTitle = selectedAlbum ? getAlbumTitleText(selectedAlbum.displayName) : 'All Photos';
  saveAllPhotosBtn.disabled = true;

  photosToSave.forEach((photo, idx) => {
    setTimeout(() => {
      saveAllPhotosBtn.textContent = `Saving ${idx + 1} of ${photosToSave.length}...`;
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = photo.downloadUrl;
      document.body.appendChild(iframe);
      setTimeout(() => iframe.remove(), 15000);

      if (idx === photosToSave.length - 1) {
        setTimeout(() => {
          saveAllPhotosBtn.disabled = false;
          saveAllPhotosBtn.textContent = `â¬‡ Save All in ${albumTitle} (${photosToSave.length})`;
        }, 1200);
      }
    }, idx * 900);
  });
});

loadGalleryPhotos();

