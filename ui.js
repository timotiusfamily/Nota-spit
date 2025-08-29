import { formatRupiah, showMessageBox } from './utils.js';
import { loadDataFromFirestore, saveDataToFirestore, addOrUpdateMasterItem, deleteMasterItem, clearMasterItems } from './data.js';
import { renderDashboard, generateSalesReport, showSalesDetails, hideSalesDetails, generateStockReport, filterHistory, renderPendingSales, generateProfitLossReport } from './reports.js';

// Fungsi untuk navigasi antar tab
export function showSection(sectionId, clickedButton, keepCurrentTransaction = false) {
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
            window.resetCurrentTransaction('penjualan');
        } else if (sectionId === 'pembelian') {
            window.resetCurrentTransaction('pembelian');
        }
    }
    
    if (sectionId === 'dashboard') {
        renderDashboard();
    } else if (sectionId === 'history') {
        filterHistory();
    } else if (sectionId === 'pending') {
        renderPendingSales();
    } else if (sectionId === 'profitLoss') {
        generateProfitLossReport();
    } else if (sectionId === 'salesReport') {
        generateSalesReport();
    } else if (sectionId === 'stock') {
        generateStockReport();
    }
}

// Fungsi Autocomplete dan Pencarian
export function showSuggestions(type) {
    const inputElement = (type === 'penjualan') ? document.getElementById('namaBarangPenjualan') : document.getElementById('namaBarangPembelian');
    const suggestionsDivElement = (type === 'penjualan') ? document.getElementById('namaBarangSuggestionsPenjualan') : document.getElementById('namaBarangSuggestionsPembelian');
    const filter = inputElement.value.toLowerCase();
    suggestionsDivElement.innerHTML = '';

    const itemsToShow = window.masterItems.filter(item => item.name.toLowerCase().includes(filter));

    if (itemsToShow.length === 0) {
        const message = filter ? 'Tidak ada barang yang cocok.' : 'Daftar barang kosong.';
        suggestionsDivElement.innerHTML = `<div class="p-2 text-gray-500">${message}</div>`;
        suggestionsDivElement.style.display = 'block';
        return;
    }

    itemsToShow.forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-100', 'border-b', 'border-gray-200');
        suggestionItem.innerText = `${item.name} (Jual: ${formatRupiah(item.price || 0)} | Beli: ${formatRupiah(item.purchasePrice || 0)})`;
        suggestionItem.addEventListener('mousedown', (e) => {
            e.preventDefault();
            inputElement.value = item.name;
            if (type === 'penjualan') {
                document.getElementById('hargaSatuanPenjualan').value = item.price;
                document.getElementById('hargaBeliPenjualan').value = item.purchasePrice;
                document.getElementById('jumlahKuantitasPenjualan').focus();
            } else {
                document.getElementById('hargaBeliPembelian').value = item.purchasePrice;
                document.getElementById('hargaJualPembelian').value = item.price;
                document.getElementById('jumlahKuantitasPembelian').focus();
            }
            suggestionsDivElement.innerHTML = '';
            suggestionsDivElement.style.display = 'none';
        });
        suggestionsDivElement.appendChild(suggestionItem);
    });
    
    suggestionsDivElement.style.display = 'block';
}

// Fungsi untuk Modal Master Items
export function openMasterItemModal(callerType) {
    window.currentTransactionType = callerType;
    document.getElementById('masterItemModal').style.display = 'flex';
    renderModalMasterItems();
    document.getElementById('masterItemSearchInput').value = '';
    document.getElementById('masterItemSearchInput').focus();
}

export function closeMasterItemModal() {
    document.getElementById('masterItemModal').style.display = 'none';
}

export function renderModalMasterItems() {
    const modalListBody = document.getElementById('modalMasterItemsList');
    modalListBody.innerHTML = '';
    const searchFilter = document.getElementById('masterItemSearchInput').value.toLowerCase();
    const filteredMasterItems = window.masterItems.filter(item => item.name.toLowerCase().includes(searchFilter));

    if (filteredMasterItems.length === 0) {
        modalListBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Tidak ada barang yang cocok.</td></tr>';
        return;
    }

    filteredMasterItems.forEach(item => {
        const row = modalListBody.insertRow();
        row.classList.add('hover:bg-gray-50');
        row.insertCell(0).innerText = item.name;
        row.insertCell(1).innerText = formatRupiah(item.price || 0);
        row.insertCell(2).innerText = formatRupiah(item.purchasePrice || 0);
        row.insertCell(3).innerText = item.stock || 0;
        const selectCell = row.insertCell(4);
        const selectButton = document.createElement('button');
        selectButton.innerText = 'Pilih';
        selectButton.classList.add('bg-green-500', 'hover:bg-green-600', 'text-white', 'py-1', 'px-2', 'rounded-md', 'text-xs');
        selectButton.onclick = () => selectMasterItemFromModal(item.name, item.price, item.purchasePrice);
        selectCell.appendChild(selectButton);
    });
}

export function selectMasterItemFromModal(name, sellingPrice, purchasePrice) {
    if (window.currentTransactionType === 'penjualan') {
        document.getElementById('namaBarangPenjualan').value = name;
        document.getElementById('hargaSatuanPenjualan').value = sellingPrice;
        document.getElementById('hargaBeliPenjualan').value = purchasePrice;
        document.getElementById('jumlahKuantitasPenjualan').focus();
    } else if (window.currentTransactionType === 'pembelian') {
        document.getElementById('namaBarangPembelian').value = name;
        document.getElementById('hargaBeliPembelian').value = purchasePrice;
        document.getElementById('hargaJualPembelian').value = sellingPrice;
        document.getElementById('jumlahKuantitasPembelian').value = '';
        document.getElementById('jumlahKuantitasPembelian').focus();
    }
    closeMasterItemModal();
}

// Manajemen Daftar Barang Master
export function renderMasterItems() {
    const masterItemsListBody = document.querySelector('#masterItemsList');
    masterItemsListBody.innerHTML = '';
    if (window.masterItems.length === 0) {
        masterItemsListBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Belum ada barang master.</td></tr>';
        return;
    }
    window.masterItems.forEach((item, index) => {
        const row = masterItemsListBody.insertRow();
        row.classList.add('hover:bg-gray-50');
        row.insertCell(0).innerText = item.name;
        row.insertCell(1).innerText = formatRupiah(item.price || 0);
        row.insertCell(2).innerText = formatRupiah(item.purchasePrice || 0);
        row.insertCell(3).innerText = item.stock || 0;
        const actionCell = row.insertCell(4);
        actionCell.classList.add('master-item-actions', 'flex', 'gap-2', 'py-2');
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'py-1', 'px-2', 'rounded-md', 'text-xs');
        editButton.onclick = () => window.editMasterItemInModal(index);
        actionCell.appendChild(editButton);
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Hapus';
        deleteButton.classList.add('bg-red-500', 'hover:bg-red-600', 'text-white', 'py-1', 'px-2', 'rounded-md', 'text-xs');
        deleteButton.onclick = () => window.deleteMasterItem(index);
        actionCell.appendChild(deleteButton);
    });
}

export function editMasterItemInModal(index) {
    const item = window.masterItems[index];
    if (item) {
        window.editingMasterItemIndex = index;
        document.getElementById('editMasterItemName').value = item.name;
        document.getElementById('editMasterItemSellingPrice').value = item.price;
        document.getElementById('editMasterItemPurchasePrice').value = item.purchasePrice;
        document.getElementById('editMasterItemStock').value = item.stock;
        document.getElementById('editMasterItemModal').style.display = 'flex';
    }
}

export function closeEditMasterItemModal() {
    document.getElementById('editMasterItemModal').style.display = 'none';
    window.editingMasterItemIndex = null;
}
