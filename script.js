// Fungsi untuk membaca database
async function readDatabase() {
  return fetch('database.txt')
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n');
      return rows.map(row => {
        const [id, url, code, customUrl, password] = row.split('|');
        return { id, url, code, customUrl, password };
      });
    });
}

// Fungsi untuk menulis database
async function writeDatabase(database) {
  const data = database.map(row => `${row.id}|${row.url}|${row.code}|${row.customUrl}|${row.password}`).join('\n');
  return fetch('database.txt', {
    method: 'PUT',
    body: data
  });
}

// Fungsi untuk menghasilkan kode
function generateCode(url) {
  return encodeURIComponent(url).replace(/=/g, '').replace(/%/g, '').substring(0, 8);
}

// Fungsi untuk menambahkan data
async function tambahData(url, customUrl, password) {
  const database = await readDatabase();
  const id = database.length + 1;
  const code = generateCode(url);
  database.push({ id, url, code, customUrl, password });
  await writeDatabase(database);
}

// Fungsi untuk mengenerate safelink
function generateSafelink(code, customUrl, password) {
  let url = `https://unduhyuk.my.id/`;
  if (customUrl) {
    url += customUrl;
  } else {
    url += code;
  }
  if (password) {
    url += `?key=${encodeURIComponent(password)}`;
  }
  return url;
}

// Index.html
if (document.getElementById('safelink-form')) {
  const form = document.getElementById('safelink-form');
  const urlInput = document.getElementById('url');
  const customUrlInput = document.getElementById('custom-url');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('submit-btn');
  const resultDiv = document.getElementById('result');

  submitBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const originalUrl = urlInput.value.trim();
  const customUrl = customUrlInput.value.trim();
  const password = passwordInput.value.trim();

  await tambahData(originalUrl, customUrl, password);
  const code = generateCode(originalUrl);
  const safelink = generateSafelink(code, customUrl, password);
  resultDiv.innerHTML = `Safelink: <a href="${safelink}" target="_blank">${safelink}</a>`;
});

// Interstitial.html
if (document.getElementById('get-link-btn')) {
  const passwordInput = document.getElementById('password-input');
  const getLinkBtn = document.getElementById('get-link-btn');
  const waktuTunggu = document.getElementById('waktu-tunggu');

  getLinkBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const password = passwordInput.value.trim();
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key');

    if (password === decodeURIComponent(key)) {
      // Redirect ke URL asli
      window.location.href = await getUrlOriginal();
    } else {
      waktuTunggu.textContent = 'Password salah!';
    }
  });
}

// Fungsi untuk mendapatkan URL asli
async function getUrlOriginal() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = window.location.pathname.split('/')[1];
  const database = await readDatabase();
  const data = database.find(row => row.code === code);

  return data.url;
}