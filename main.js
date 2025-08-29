import { loadDataFromFirestore, logout, restoreMasterItems, saveDataToFirestore } from './data.js';
import * as ui from './ui.js';
import * as sales from './sales.js';
import * as purchases from './purchases.js';
import * as reports from './reports.js';
import * as utils from './utils.js';

// Inisialisasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDD_42nIWOt0StwtlShqa9T1KS22qGVEAg",
    authDomain: "nota-toko-6c293.firebaseapp.com",
    projectId: "nota-toko-6c293",
    storageBucket: "nota-toko-6c293.firebasestorage.app",
    messagingSenderId: "1060376706378",
    appId: "1:1060376706378:web:97602bb05d2833af23d5b3"
};
firebase.initializeApp(firebaseConfig);

// Deklarasikan variabel global untuk Firebase Auth dan Firestore
window.auth = firebase.auth();
window.db = firebase.firestore();

// Mengatur variabel global
window.salesHistory = [];
window.purchaseHistory = [];
window.pendingSales = [];
window.currentItems = [];
window.currentTransactionType = 'penjualan';
window.currentGrandTotalPenjualan = 0;
window.currentGrandTotalLabaRugi = 0;
window.currentGrandTotalPembelian = 0;
window.itemCounter = 0;
window.editingItemId = null;
window.masterItems = [];
window.userId = null;
window.currentStrukData = null;
window.editingMasterItemIndex = null;
window.currentDetailedSales = [];

// Fungsi untuk navigasi antar tab
function showSection(sectionId, clickedButton, keepCurrentTransaction = false) {
    const sections = document.querySelectorAll('.main-content-wrapper.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(`${sectionId}Section`);
    if (activeSection) {
        activeSection.style.display = 'block';
        activeSection.classList.add('active');
    }

    const navButtons = document.querySelectorAll('.mobile-nav button');
    navButtons.forEach(btn => btn.classList.remove('active'));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    window.currentTransactionType = sectionId;

    if (!keepCurrentTransaction) {
        if (sectionId === 'penjualan') {
            utils.resetCurrentTransaction('penjualan');
        } else if (sectionId === 'pembelian') {
            utils.resetCurrentTransaction('pembelian');
        }
    }
    
    if (sectionId === 'dashboard') {
        reports.renderDashboard();
    } else if (sectionId === 'history') {
        reports.filterHistory();
    } else if (sectionId === 'pending') {
        reports.renderPendingSales();
    } else if (sectionId === 'profitLoss') {
        reports.generateProfitLossReport();
    } else if (sectionId === 'salesReport') {
        reports.generateSalesReport();
    } else if (sectionId === 'stock') {
        reports.generateStockReport();
    }
}

// Mengekspos fungsi-fungsi dari modul ke scope global agar bisa dipanggil dari HTML
Object.assign(window, { ...ui, ...sales, ...purchases, ...reports, ...utils, restoreMasterItems, showSection });

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', (event) => {
    // Cek status autentikasi Firebase
    window.auth.onAuthStateChanged(async (user) => {
        if (user) {
            window.userId = user.uid;
            
            // Periksa apakah pengguna berada di halaman login, jika ya, arahkan ke index.html
            if (window.location.pathname.endsWith('/login.html')) {
                window.location.href = 'index.html';
                return;
            }

            await loadDataFromFirestore();

            const today = new Date();
            const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            document.getElementById('tanggalPenjualan').value = formattedDate;
            document.getElementById('tanggalPembelian').value = formattedDate;

            utils.loadNamaToko();
            
            document.getElementById('namaBarangPenjualan').addEventListener('input', () => ui.showSuggestions('penjualan'));
            document.getElementById('namaBarangPenjualan').addEventListener('focus', () => ui.showSuggestions('penjualan'));
            document.getElementById('namaBarangPenjualan').addEventListener('blur', () => { setTimeout(() => { document.getElementById('namaBarangSuggestionsPenjualan').innerHTML = ''; }, 100); });
            
            document.getElementById('namaBarangPembelian').addEventListener('input', () => ui.showSuggestions('pembelian'));
            document.getElementById('namaBarangPembelian').addEventListener('focus', () => ui.showSuggestions('pembelian'));
            document.getElementById('namaBarangPembelian').addEventListener('blur', () => { setTimeout(() => { document.getElementById('namaBarangSuggestionsPembelian').innerHTML = ''; }, 100); });
            
            document.getElementById('restoreFileInput').addEventListener('change', restoreMasterItems);
            
            showSection('dashboard', document.getElementById('navDashboard'));

            const firstDayOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
            document.getElementById('salesFilterStartDate').value = firstDayOfMonth;
            document.getElementById('salesFilterEndDate').value = formattedDate;
            document.getElementById('filterStartDate').value = firstDayOfMonth;
            document.getElementById('filterEndDate').value = formattedDate;
            document.getElementById('historyFilterStartDate').value = firstDayOfMonth;
            document.getElementById('historyFilterEndDate').value = formattedDate;
            
            document.getElementById('dailySalesList').addEventListener('click', (event) => {
                const row = event.target.closest('tr');
                if (row && row.cells.length > 1) {
                    const date = row.cells[0].innerText;
                    reports.showSalesDetails(date);
                }
            });

        } else {
            // Jika tidak ada user dan tidak di halaman login, redirect ke halaman login
            if (!window.location.pathname.endsWith('/login.html')) {
                window.location.href = 'login.html';
            }
        }
    });
});

// Fungsi untuk login
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        await window.auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'index.html';
    } catch (error) {
        utils.showTemporaryAlert('Login gagal. Periksa email dan password Anda.', 'red');
    }
}
window.login = login;
