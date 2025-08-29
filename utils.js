export function formatRupiah(angka) {
    // Menggunakan Intl.NumberFormat untuk format Rupiah yang lebih standar
    if (isNaN(angka) || angka === null) return 'Rp. 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

export function hitungUlangTotal(type) {
    if (type === 'penjualan') {
        window.currentGrandTotalPenjualan = window.currentItems.reduce((sum, item) => sum + item.jumlah, 0);
        window.currentGrandTotalLabaRugi = window.currentItems.reduce((sum, item) => sum + item.labaRugi, 0);
        
        document.getElementById('grandTotalPenjualan').innerText = formatRupiah(window.currentGrandTotalPenjualan);
        document.getElementById('grandTotalLabaRugi').innerText = formatRupiah(window.currentGrandTotalLabaRugi);
    } else if (type === 'pembelian') {
        window.currentGrandTotalPembelian = window.currentItems.reduce((sum, item) => sum + item.jumlah, 0);
        
        document.getElementById('grandTotalPembelian').innerText = formatRupiah(window.currentGrandTotalPembelian);
    }
}

export function clearBarangInputs(type) {
    if (type === 'penjualan') {
        document.getElementById('namaBarangPenjualan').value = '';
        document.getElementById('jumlahKuantitasPenjualan').value = '';
        document.getElementById('hargaSatuanPenjualan').value = '';
        document.getElementById('hargaBeliPenjualan').value = '';
        document.getElementById('namaBarangPenjualan').focus();
        document.getElementById('namaBarangSuggestionsPenjualan').innerHTML = '';
    } else if (type === 'pembelian') {
        document.getElementById('namaBarangPembelian').value = '';
        document.getElementById('jumlahKuantitasPembelian').value = '';
        document.getElementById('hargaBeliPembelian').value = '';
        document.getElementById('hargaJualPembelian').value = '';
        document.getElementById('namaBarangPembelian').focus();
        document.getElementById('namaBarangSuggestionsPembelian').innerHTML = '';
    }
}

export function resetCurrentTransaction(type) {
    window.currentItems = [];
    window.itemCounter = 0;
    window.editingItemId = null;
    
    if (type === 'penjualan') {
        document.getElementById('namaPembeli').value = '';
        window.currentGrandTotalPenjualan = 0;
        window.currentGrandTotalLabaRugi = 0;
        window.renderTablePenjualan();
        clearBarangInputs('penjualan');
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        document.getElementById('tanggalPenjualan').value = formattedDate;
        document.getElementById('printerCard').style.display = 'none';
    } else if (type === 'pembelian') {
        document.getElementById('namaSupplier').value = '';
        window.currentGrandTotalPembelian = 0;
        window.renderTablePembelian();
        clearBarangInputs('pembelian');
        document.getElementById('strukOutputPembelian').style.display = 'none';
        document.getElementById('shareButtonsPembelian').style.display = 'none';
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        document.getElementById('tanggalPembelian').value = formattedDate;
    }
}

export function loadNamaToko() {
    const storedNamaToko = localStorage.getItem('namaToko');
    if (storedNamaToko) {
        document.getElementById('namaToko').value = storedNamaToko;
    }
    document.getElementById('namaToko').addEventListener('input', () => {
        localStorage.setItem('namaToko', document.getElementById('namaToko').value);
    });
}

export function showMessageBox(message, isConfirm = false, onConfirm = null) {
    const modal = document.getElementById('customMessageBox');
    document.getElementById('messageBoxText').innerText = message;
    const confirmBtn = document.getElementById('messageBoxConfirmBtn');
    const cancelBtn = document.getElementById('messageBoxCancelBtn');
    
    if (isConfirm) {
        confirmBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        confirmBtn.onclick = () => { closeMessageBox(); if (onConfirm) onConfirm(); };
        cancelBtn.onclick = () => closeMessageBox();
    } else {
        confirmBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'none';
        confirmBtn.onclick = () => { closeMessageBox(); if (onConfirm) onConfirm(); };
    }
    modal.style.display = 'flex';
}

export function closeMessageBox() {
    const modal = document.getElementById('customMessageBox');
    modal.style.display = 'none';
}

export function showTemporaryAlert(message, type) {
    let alertDiv = document.querySelector('.temporary-alert');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.classList.add('temporary-alert');
        document.body.appendChild(alertDiv);
    }
    alertDiv.innerText = message;

    if (type === 'green') {
        alertDiv.style.backgroundColor = '#22c55e';
    } else if (type === 'red') {
        alertDiv.style.backgroundColor = '#ef4444';
    }

    alertDiv.style.opacity = '1';
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
    }, 3000);
}
