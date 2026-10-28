import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBYxjcIbOpjx-gaVnbrkI6n22-FahZL3AM',
  authDomain: 'ticket-tracking-system-6b6d5.firebaseapp.com',
  projectId: 'ticket-tracking-system-6b6d5',
  storageBucket: 'ticket-tracking-system-6b6d5.firebasestorage.app',
  messagingSenderId: '803970589691',
  appId: '1:803970589691:web:8d4a7ea0bafd1d301c615e'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
await setPersistence(auth, browserLocalPersistence);

const TRACKED_KEYS = [
  'premiumTicketTracker.v1',
  'premiumTicketTracker.attendance.v1',
  'premiumTicketTracker.monthlyArchives.v1',
  'premiumTicketTracker.activeMonth.v1'
];

const gate = document.getElementById('loginGate');
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');
const errorBox = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const profileName = document.getElementById('profileName');

function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

function safeId(key) {
  return key.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function backupLocalData(user) {
  const writes = [];
  for (const key of TRACKED_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    writes.push(setDoc(doc(db, 'users', user.uid, 'localBackup', safeId(key)), {
      key,
      raw,
      ownerEmail: user.email || null,
      updatedAt: serverTimestamp()
    }, { merge: true }));
  }
  await Promise.all(writes);
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email || null,
    lastSyncAt: serverTimestamp(),
    migrationVersion: 1
  }, { merge: true });
}

let syncTimer = null;
function scheduleBackup() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    if (auth.currentUser) backupLocalData(auth.currentUser).catch(console.error);
  }, 700);
}

const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
  originalSetItem.call(this, key, value);
  if (this === localStorage && TRACKED_KEYS.includes(String(key))) scheduleBackup();
};

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorBox.style.display = 'none';
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Signing in...';
  try {
    await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
    passwordInput.value = '';
  } catch (error) {
    showError('Unable to sign in. Please check your email and password.');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Sign In';
  }
});

logoutBtn?.addEventListener('click', async () => {
  try {
    if (auth.currentUser) await backupLocalData(auth.currentUser);
  } catch (error) {
    console.error(error);
  }
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    gate?.classList.remove('hidden');
    document.body.classList.add('auth-locked');
    return;
  }

  try {
    await backupLocalData(user);
  } catch (error) {
    console.error('Cloud backup failed:', error);
  }

  if (profileName) profileName.textContent = user.email || 'User';
  gate?.classList.add('hidden');
  document.body.classList.remove('auth-locked');
});
