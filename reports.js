import { formatRupiah, showTemporaryAlert } from './utils.js';

// ... (Fungsi renderDashboard, filterHistory)

export function renderFilteredSalesHistory(filteredSales) {
    const historyListBody = document.querySelector('#salesHistoryListBody');
    historyListBody.innerHTML = filteredSales.length === 0 ? '<tr><td colspan="6" class="text-center py-4 text-gray-500">Belum ada riwayat penjualan.</td></tr>' : '';
    filteredSales.forEach(struk => {
        const row = historyListBody.insertRow();
        row.classList.add('hover:bg-gray-50');
        row.insertCell(0).innerText = struk.id;
        row.insertCell(1).innerText = struk.tanggal;
        row.insertCell(2).innerText = struk.pembeli;
        row.insertCell(3).innerText = formatRupiah(struk.totalPenjualan);
        row.insertCell(4).innerText = formatRupiah(struk.totalLabaRugi || 0);
        const actionCell = row.insertCell(5);
        actionCell.classList.add('history-actions', 'flex', 'gap-2', 'py-2');
        const viewButton = document.createElement('button');
        viewButton.innerText = 'Lihat';
        viewButton.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'py-1', 'px-2', 'rounded-md', 'text-xs');
        viewButton.onclick = (e) => { // Perbaikan: Tambahkan e sebagai parameter
            e.stopPropagation(); // Mencegah event menyebar ke baris tabel
            window.viewHistoryStruk(struk.id, 'penjualan');
        };
        actionCell.appendChild(viewButton);
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Hapus';
        deleteButton.classList.add('bg-red-500', 'hover:bg-red-600', 'text-white', 'py-1', 'px-2', 'rounded-md', 'text-xs');
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            window.deleteHistoryStruk(struk.id, 'penjualan');
        };
        actionCell.appendChild(deleteButton);
    });
}
export function renderFilteredPurchaseHistory(filteredPurchases) {
    const historyListBody = document.querySelector('#purchaseHistoryListBody');
    historyListBody.innerHTML = filteredPurchases.length === 0 ? '<tr><td colspan="5" class="text-center py-4 text-gray-500">Belum ada riwayat pembelian.</td></tr>' : '';
    filteredPurchases.forEach(struk => {
        const row = historyListBody.insertRow();
        row.classList.add('hover:bg-gray-50');
        row.insertCell(0).innerText = struk.id;
        row.insertCell(1).innerText = struk.tanggal;
        row.insertCell(2).innerText = struk.supplier;
        row.insertCell(3).innerText = formatRupiah(struk.totalPembelian);
        const actionCell = row.insertCell(4);
        actionCell.classList.add('history-actions', 'flex', 'gap-2', 'py-2');
        const viewButton = document.createElement('button');
        viewButton.innerText = 'Lihat';
        viewButton.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'py-1', 'px-2', 'rounded-md', 'text-xs');
        viewButton.onclick = (e) => {
            e.stopPropagation();
            window.viewHistoryStruk(struk.id, 'pembelian');
        };
        actionCell.appendChild(viewButton);
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Hapus';
        deleteButton.classList.add('bg-red-500', 'hover:bg-red-600', 'text-white', 'py-1', 'px-2', 'rounded-md', 'text-xs');
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            window.deleteHistoryStruk(struk.id, 'pembelian');
        };
        actionCell.appendChild(deleteButton);
    });
}

// ... (Fungsi lainnya)
