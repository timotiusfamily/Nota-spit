import { showMessageBox, showTemporaryAlert } from './utils.js';
import { renderMasterItems } from './ui.js';

// Mengambil data dari Firestore
export async function loadDataFromFirestore() {
    try {
        const docRef = window.db.collection('users').doc(window.userId);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            window.masterItems = data.masterItems || [];
            window.salesHistory = data.salesHistory || [];
            window.purchaseHistory = data.purchaseHistory || [];
            window.pendingSales = data.pendingSales || [];
        } else {
            console.log("No data found for user, initializing new data.");
        }
        renderMasterItems();
    } catch (error) {
        console.error("Error loading data:", error);
        showMessageBox("Gagal memuat data dari server. Coba muat ulang halaman.");
    }
}

// Menyimpan data ke Firestore
export async function saveDataToFirestore() {
    try {
        const docRef = window.db.collection('users').doc(window.userId);
        await docRef.set({
            masterItems: window.masterItems,
            salesHistory: window.salesHistory,
            purchaseHistory: window.purchaseHistory,
            pendingSales: window.pendingSales
        }, { merge: true });
        console.log("Data berhasil disimpan ke Firestore.");
    } catch (error) {
        console.error("Error saving data:", error);
        showMessageBox("Gagal menyimpan data ke server. Periksa koneksi internet Anda.");
    }
}

// Logout
export function logout() {
    window.auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch(error => {
        console.error("Logout error:", error);
        showMessageBox("Gagal logout. Silakan coba lagi.");
    });
}

// Operasi CRUD Master Items
export async function addOrUpdateMasterItem(name, sellingPrice, purchasePrice, stockChange = 0) {
    const existingItemIndex = window.masterItems.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
    if (existingItemIndex > -1) {
        window.masterItems[existingItemIndex].price = sellingPrice;
        window.masterItems[existingItemIndex].purchasePrice = purchasePrice;
        window.masterItems[existingItemIndex].stock = (window.masterItems[existingItemIndex].stock || 0) + stockChange;
    } else {
        window.masterItems.push({ name: name, price: sellingPrice, purchasePrice: purchasePrice, stock: stockChange });
    }
    await saveDataToFirestore();
    renderMasterItems();
    window.renderModalMasterItems();
}

export async function saveEditedMasterItem() {
    if (window.editingMasterItemIndex === null) return;
    
    const name = document.getElementById('editMasterItemName').value.trim();
    const sellingPrice = parseInt(document.getElementById('editMasterItemSellingPrice').value);
    const purchasePrice = parseInt(document.getElementById('editMasterItemPurchasePrice').value);
    const stock = parseInt(document.getElementById('editMasterItemStock').value);
    
    if (!name || isNaN(sellingPrice) || isNaN(purchasePrice) || isNaN(stock)) {
        showTemporaryAlert('Mohon lengkapi semua field.', 'red');
        return;
    }
    
    window.masterItems[window.editingMasterItemIndex] = {
        name: name,
        price: sellingPrice,
        purchasePrice: purchasePrice,
        stock: stock
    };
    
    await saveDataToFirestore();
    renderMasterItems();
    window.closeEditMasterItemModal();
    showTemporaryAlert('Barang master berhasil diperbarui.', 'green');
}

export function deleteMasterItem(index) {
    showMessageBox(`Yakin ingin menghapus "${window.masterItems[index].name}"?`, true, async () => {
        window.masterItems.splice(index, 1);
        await saveDataToFirestore();
        renderMasterItems();
        window.renderModalMasterItems();
        showTemporaryAlert('Barang master berhasil dihapus.', 'green');
    });
}

export function clearMasterItems() {
    showMessageBox('Yakin ingin menghapus SEMUA daftar barang master?', true, async () => {
        window.masterItems = [];
        await saveDataToFirestore();
        renderMasterItems();
        window.renderModalMasterItems();
        showTemporaryAlert('Semua barang master telah dihapus.', 'green');
    });
}

export async function restoreMasterItems(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const loadedData = JSON.parse(e.target.result);
            if (Array.isArray(loadedData) && loadedData.every(item => typeof item.name === 'string')) {
                showMessageBox('Yakin ingin me-restore daftar barang master? Ini akan menimpa data yang ada.', true, async () => {
                    window.masterItems = loadedData;
                    await saveDataToFirestore();
                    renderMasterItems();
                    window.renderModalMasterItems();
                    showTemporaryAlert('Daftar barang master berhasil di-restore!', 'green');
                });
            } else {
                showTemporaryAlert('Format file JSON tidak valid.', 'red');
            }
        } catch (error) {
            showTemporaryAlert('Gagal membaca atau memproses file JSON. Error: ' + error.message, 'red');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}
