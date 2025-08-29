import { formatRupiah, hitungUlangTotal, clearBarangInputs, showTemporaryAlert, showMessageBox } from './utils.js';
import { saveDataToFirestore } from './data.js';
import { generateStockReport } from './reports.js';

export function tambahAtauUpdateBarangPenjualan() {
    const namaBarang = document.getElementById('namaBarangPenjualan').value.trim();
    const jumlahKuantitas = parseInt(document.getElementById('jumlahKuantitasPenjualan').value);
    const hargaSatuan = parseInt(document.getElementById('hargaSatuanPenjualan').value);
    const hargaBeli = parseInt(document.getElementById('hargaBeliPenjualan').value || '0');

    if (!namaBarang || isNaN(jumlahKuantitas) || isNaN(hargaSatuan)) {
        showTemporaryAlert('Mohon lengkapi Nama Barang, Kuantitas, dan Harga Satuan.', 'red');
        return;
    }
    if (jumlahKuantitas <= 0 || hargaSatuan < 0 || hargaBeli < 0) {
        showTemporaryAlert('Kuantitas dan Harga tidak boleh negatif atau nol.', 'red');
        return;
    }

    const masterItem = window.masterItems.find(mi => mi.name.toLowerCase() === namaBarang.toLowerCase());
    
    // Perbaikan: Tambahkan notifikasi jika stok kurang
    if (masterItem && masterItem.stock < jumlahKuantitas) {
        showMessageBox(`Stok untuk "${namaBarang}" tidak mencukupi. Stok saat ini: ${masterItem.stock}.`, false);
        return;
    }
    
    document.getElementById('printerCard').style.display = 'none';

    const jumlah = jumlahKuantitas * hargaSatuan;
    const labaRugi = (jumlahKuantitas * hargaSatuan) - (jumlahKuantitas * hargaBeli);

    if (window.editingItemId !== null) {
        const itemIndex = window.currentItems.findIndex(item => item.id === window.editingItemId);
        if (itemIndex > -1) {
            window.currentItems[itemIndex] = { ...window.currentItems[itemIndex], nama: namaBarang, qty: jumlahKuantitas, hargaSatuan: hargaSatuan, hargaBeli: hargaBeli, jumlah: jumlah, labaRugi: labaRugi };
        }
        window.editingItemId = null;
        document.getElementById('btnAddUpdatePenjualan').innerText = 'Update Barang';
        document.getElementById('btnCancelEditPenjualan').style.display = 'none';
    } else {
        window.itemCounter++;
        const newItem = { id: window.itemCounter, nama: namaBarang, qty: jumlahKuantitas, hargaSatuan: hargaSatuan, hargaBeli: hargaBeli, jumlah: jumlah, labaRugi: labaRugi };
        window.currentItems.push(newItem);
    }
    
    if (masterItem) {
        masterItem.price = hargaSatuan;
    } else {
        window.masterItems.push({ name: namaBarang, price: hargaSatuan, purchasePrice: hargaBeli, stock: 0 });
    }
    
    hitungUlangTotal('penjualan');
    renderTablePenjualan();
    clearBarangInputs('penjualan');
}

// ... (lanjutkan dengan fungsi lainnya, tidak ada perubahan)
