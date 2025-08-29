import { formatRupiah, hitungUlangTotal, clearBarangInputs, showTemporaryAlert, showMessageBox } from './utils.js';
import { saveDataToFirestore } from './data.js';
import { generateStockReport } from './reports.js';

export async function tambahAtauUpdateBarangPembelian() {
    const namaBarang = document.getElementById('namaBarangPembelian').value.trim();
    const jumlahKuantitas = parseInt(document.getElementById('jumlahKuantitasPembelian').value);
    const hargaBeli = parseInt(document.getElementById('hargaBeliPembelian').value);
    const hargaJual = parseInt(document.getElementById('hargaJualPembelian').value);

    if (!namaBarang || isNaN(jumlahKuantitas) || isNaN(hargaBeli) || isNaN(hargaJual)) {
        showTemporaryAlert('Mohon lengkapi semua field: Nama Barang, Kuantitas, Harga Beli, dan Harga Jual.', 'red');
        return;
    }
    if (jumlahKuantitas <= 0 || hargaBeli < 0 || hargaJual < 0) {
        showTemporaryAlert('Kuantitas dan Harga tidak boleh negatif atau nol.', 'red');
        return;
    }
    
    const jumlah = jumlahKuantitas * hargaBeli;
    const masterItemIndex = window.masterItems.findIndex(mi => mi.name.toLowerCase() === namaBarang.toLowerCase());

    if (window.editingItemId !== null) {
        const itemIndex = window.currentItems.findIndex(item => item.id === window.editingItemId);
        if (itemIndex > -1) {
            const oldQty = window.currentItems[itemIndex].qty;
            const oldName = window.currentItems[itemIndex].nama;
            
            const oldMasterItem = window.masterItems.find(mi => mi.name === oldName);
            if(oldMasterItem) oldMasterItem.stock -= oldQty;

            window.currentItems[itemIndex] = { ...window.currentItems[itemIndex], nama: namaBarang, qty: jumlahKuantitas, hargaBeli: hargaBeli, jumlah: jumlah };
            
            if(masterItemIndex > -1) {
                const masterItem = window.masterItems[masterItemIndex];
                const totalOldValue = (masterItem.stock) * masterItem.purchasePrice;
                masterItem.stock += jumlahKuantitas;
                masterItem.purchasePrice = (totalOldValue + (jumlahKuantitas * hargaBeli)) / (masterItem.stock);
            }
        }
        window.editingItemId = null;
        document.getElementById('btnAddUpdatePembelian').innerText = 'Update Barang';
        document.getElementById('btnCancelEditPembelian').style.display = 'none';
    } else {
        window.itemCounter++;
        const newItem = { id: window.itemCounter, nama: namaBarang, qty: jumlahKuantitas, hargaBeli: hargaBeli, jumlah: jumlah, hargaJual: hargaJual };
        window.currentItems.push(newItem);

        if (masterItemIndex > -1) {
            const masterItem = window.masterItems[masterItemIndex];
            const oldStock = masterItem.stock || 0;
            const oldPurchasePrice = masterItem.purchasePrice || 0;
            const newStock = oldStock + jumlahKuantitas;
            const totalValueOld = oldStock * oldPurchasePrice;
            const totalValueNew = jumlahKuantitas * hargaBeli;
            const newPurchasePrice = (totalValueOld + totalValueNew) / newStock;
            
            masterItem.stock = newStock;
            masterItem.purchasePrice = newPurchasePrice;
            masterItem.price = hargaJual;
        } else {
            window.masterItems.push({ name: namaBarang, price: hargaJual, purchasePrice: hargaBeli, stock: jumlahKuantitas });
        }
    }
    
    hitungUlangTotal('pembelian');
    renderTablePembelian();
    clearBarangInputs('pembelian');
}

export function editBarangPembelian(id) {
    const itemToEdit = window.currentItems.find(item => item.id === id);
    if (itemToEdit) {
        document.getElementById('namaBarangPembelian').value = itemToEdit.nama;
        document.getElementById('jumlahKuantitasPembelian').value = itemToEdit.qty;
        document.getElementById('hargaBeliPembelian').value = itemToEdit.hargaBeli;
        document.getElementById('hargaJualPembelian').value = itemToEdit.hargaJual;

        document.getElementById('btnAddUpdatePembelian').innerText = 'Update Barang';
        document.getElementById('btnCancelEditPembelian').style.display = 'inline-block';
        window.editingItemId = id;
    }
}

export function deleteBarangPembelian(id) {
    showMessageBox('Apakah Anda yakin ingin menghapus barang ini?', true, async () => {
        const deletedItem = window.currentItems.find(item => item.id === id);
        if (deletedItem) {
            const masterItem = window.masterItems.find(mi => mi.name === deletedItem.nama);
            if (masterItem) {
                masterItem.stock -= deletedItem.qty;
            }
            await saveDataToFirestore();
        }
        window.currentItems = window.currentItems.filter(item => item.id !== id);
        hitungUlangTotal('pembelian');
        renderTablePembelian();
        batalEditPembelian();
        document.getElementById('strukOutputPembelian').style.display = 'none';
    });
}

export function batalEditPembelian() {
    window.editingItemId = null;
    document.getElementById('btnAddUpdatePembelian').innerText = 'Tambah Barang';
    document.getElementById('btnCancelEditPembelian').style.display = 'none';
    clearBarangInputs('pembelian');
}

export function renderTablePembelian() {
    const daftarBelanja = document.getElementById('daftarBelanjaPembelian');
    daftarBelanja.innerHTML = '';
    if (window.currentItems.length === 0) {
        daftarBelanja.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">Belum ada barang.</td></tr>';
    }
    window.currentItems.forEach(item => {
        const row = daftarBelanja.insertRow();
        row.classList.add('hover:bg-gray-50');
        row.insertCell(0).innerText = item.id;
        row.insertCell(1).innerText = item.nama;
        row.insertCell(2).innerText = item.qty;
        row.insertCell(3).innerText = formatRupiah(item.hargaBeli);
        row.insertCell(4).innerText = formatRupiah(item.jumlah);
        const actionCell = row.insertCell(5);
        actionCell.classList.add('action-buttons', 'flex', 'gap-2', 'py-2');
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'py-1', 'px-2', 'rounded-md', 'text-xs');
        editButton.onclick = () => editBarangPembelian(item.id);
        actionCell.appendChild(editButton);
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Hapus';
        deleteButton.classList.add('bg-red-500', 'hover:bg-red-600', 'text-white', 'py-1', 'px-2', 'rounded-md', 'text-xs');
        deleteButton.onclick = () => deleteBarangPembelian(item.id);
        actionCell.appendChild(deleteButton);
    });
}

export async function simpanNotaPembelian() {
    if (window.currentItems.length === 0) {
        showTemporaryAlert('Tidak ada barang untuk disimpan.', 'red');
        return;
    }
    const tanggal = document.getElementById('tanggalPembelian').value;
    const namaSupplier = document.getElementById('namaSupplier').value || 'Supplier Umum';
    const newStruk = {
        id: Date.now(),
        tanggal: tanggal,
        supplier: namaSupplier,
        items: JSON.parse(JSON.stringify(window.currentItems)),
        totalPembelian: window.currentGrandTotalPembelian
    };
    window.purchaseHistory.push(newStruk);
    await saveDataToFirestore();
    renderStrukPreviewPembelian(newStruk);
    document.getElementById('strukOutputPembelian').style.display = 'block';
    document.getElementById('shareButtonsPembelian').style.display = 'flex';
    
    showTemporaryAlert('Nota pembelian berhasil disimpan!', 'green');

}

export function renderStrukPreviewPembelian(strukData) {
    const namaToko = document.getElementById('namaToko').value || 'Nama Toko';
    const tanggal = strukData.tanggal;
    const namaSupplier = strukData.supplier || 'Supplier Umum';

    let strukHTML = `<h3 class="text-center font-bold text-lg">${namaToko}</h3>`;
    strukHTML += `<p class="text-center text-sm">Tgl: ${tanggal} | Supplier: ${namaSupplier}</p><hr class="my-2 border-dashed border-gray-400">`;
    strukHTML += `<ul>`;
    strukData.items.forEach(item => {
        strukHTML += `<li class="flex justify-between text-sm py-1"><span>${item.nama} (${item.qty} x ${formatRupiah(item.hargaBeli)})</span><span>${formatRupiah(item.jumlah)}</span></li>`;
    });
    strukHTML += `</ul>`;
    strukHTML += `<hr class="my-2 border-dashed border-gray-400">`;
    strukHTML += `<p class="flex justify-between text-lg font-bold"><span>TOTAL:</span><span>${formatRupiah(strukData.totalPembelian)}</span></p>`;
    
    document.getElementById('strukContentPembelian').innerHTML = strukHTML;
}

export function shareViaWhatsAppPembelian() {
    const lastStruk = window.purchaseHistory[window.purchaseHistory.length - 1];
    if (!lastStruk) {
        showTemporaryAlert('Tidak ada nota untuk dibagikan.', 'red');
        return;
    }
    const namaToko = document.getElementById('namaToko').value || 'Nama Toko';
    let message = `*NOTA PEMBELIAN*\n\n*${namaToko}*\nTanggal: ${lastStruk.tanggal}\nSupplier: ${lastStruk.supplier}\n\n*Daftar Barang:*\n`;
    lastStruk.items.forEach((item, index) => {
        message += `${index + 1}. ${item.nama} (${item.qty} x ${formatRupiah(item.hargaBeli)}) = ${formatRupiah(item.jumlah)}\n`;
    });
    message += `\n*TOTAL: ${formatRupiah(lastStruk.totalPembelian)}*\n\nTerima kasih!\n_Dibuat dengan Aplikasi Nota & Stok_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}
