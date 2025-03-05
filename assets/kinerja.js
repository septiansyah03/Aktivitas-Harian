const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbysW2Yvml3yzx3GblS0XQE92klUodnoyeK3fQD6714wf48vJpB7whi1XIxDNeN_U27g/exec"; 

function openModal() {
    $('#inputModal').modal('show');
    $('#inputForm')[0].reset(); 
}

async function submitForm() {
    const tanggal = document.getElementById('tanggal').value;
    const aktivitas = document.getElementById('aktivitas').value;
    const detailAktivitas = document.getElementById('detailAktivitas').value;
    const waktuEfektif = document.getElementById('waktuEfektif').value;
    const waktuMulai = document.getElementById('waktuMulai').value;
    const waktuAkhir = document.getElementById('waktuAkhir').value;
    const volume = document.getElementById('volume').value;

    const jumlah = waktuEfektif * volume;

    if (!tanggal || !aktivitas || !detailAktivitas || !waktuEfektif || !waktuMulai || !waktuAkhir || !volume) {
        Swal.fire({
            icon: 'warning',
            title: 'Waduh...',
            text: 'Harap lengkapi semua isianya sebelum klik simpan.',
        });
        return; 
    }

    const activity = {
        tanggal,
        aktivitas,
        detailAktivitas,
        waktuEfektif,
        waktuMulai,
        waktuAkhir,
        volume,
        jumlah,
    };

        const response = await fetch(SCRIPT_URL + "?action=submitData", {
        method: "POST",
        
        header: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
    });

    const result = await response.json();

    if (result.status === "success") {
        Swal.fire({
            icon: 'success',
            title: 'Mantap bro. Aktivitas harian berhasil disimpan!',
            text: result.message,
            timer: 1500,
            showConfirmButton: false
        });
        $('#inputModal').modal('hide');
        displayActivities();     }
}

async function displayActivities() {
    const response = await fetch(SCRIPT_URL + "?action=getAllData");
    const activities = await response.json();
    const tabelKinerja = document.getElementById('tabelKinerja');
    tabelKinerja.innerHTML = '';

    let totalWaktuEfektif = 0; 
    if (activities.length === 0) {
        tabelKinerja.innerHTML = `<tr><td colspan="9" class="text-center">Belum ada aktivitas yang dinput!</td></tr>`;
    } else {
        activities.forEach((activity, index) => {
            const formattedDate = formatDate(new Date(activity[0]));
            const startTime = formatTime(activity[4]);
            const endTime = formatTime(activity[5]);

                        const waktuEfektif = parseInt(activity[6]) || 0;

                        totalWaktuEfektif += activity[7]; 

            const row = `<tr>
                <td>${formattedDate}</td>
                <td>${activity[1]}</td>
                <td>${activity[2]}</td>
                <td>${activity[3]}</td>
                <td>${startTime}</td>
                <td>${endTime}</td>
                <td>${waktuEfektif}</td>
                <td>${activity[7]}</td>
                <td><button class="btn btn-danger" onclick="deleteActivity(${index})">Hapus</button></td>
            </tr>`;
            tabelKinerja.insertAdjacentHTML('beforeend', row);
        });

                const totalRow = `<tr>
            <td colspan="8" class="text-right">Total Waktu Efektif:</td>
            <td>${totalWaktuEfektif} menit</td>
        </tr>`;
        tabelKinerja.insertAdjacentHTML('beforeend', totalRow);
        const showingInfo = document.getElementById("showingInfo");
showingInfo.innerText = `Menampilkan ${activities.length} dari ${activities.length} data`;

    }
}

function formatDate(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('id-ID', options); }

function formatTime(time) {
    if (!time || time === '1899-12-30T00:00:00.000Z') return '00:00'; 

    const date = new Date(time);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

async function addActivity(activity) {
        
        await displayActivities();
}


async function deleteActivity(index) {
    
    const result = await Swal.fire({
        title: 'Yakin nih mau dihapus?',
        text: "Aktivitas ini akan dihapus dan tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Sebentar'
    });

    
    if (result.isConfirmed) {
        const response = await fetch(SCRIPT_URL + "?action=deleteData&rowIndex=" + index, {
            method: "POST"
        });
        const deleteResult = await response.json();

        if (deleteResult.status === "success") {
            Swal.fire({
                icon: 'success',
                title: 'Dihapus!',
                text: 'Aktivitas telah berhasil dihapus.😢',
                timer: 1500,
                showConfirmButton: false
            });
            displayActivities(); 
        }
    }
}


window.onload = displayActivities;

function downloadExcel() {
    const tableBody = document.getElementById('tabelKinerja');
    if (!tableBody) {
        console.error("Table body not found!");
        return;
    }

    const rows = tableBody.getElementsByTagName('tr');
    const data = [];

    
    const title = ["Laporan Aktivitas Harian Pegawai"]; 
    data.push(title);
    data.push([]); 

    
    const headers = ["Tanggal", "Aktivitas", "Detail Aktivitas", "Waktu Efektif (Menit)", "Waktu Mulai", "Waktu Akhir", "Volume", "Jumlah (Menit)"];
    data.push(headers);

    
    if (rows.length === 0) {
        console.warn("Tidak ada data untuk diekspor.");
        alert("Tidak ada data untuk diekspor.");
        return;
    } else {
        for (let row of rows) {
            const cells = row.getElementsByTagName('td');
            if (cells.length >= 8) { // Pastikan ada 8 kolom
                data.push([
                    cells[0].innerText || "",
                    cells[1].innerText || "",
                    cells[2].innerText || "",
                    cells[3].innerText || "",
                    cells[4].innerText || "",
                    cells[5].innerText || "",
                    cells[6].innerText || "",
                    cells[7].innerText || ""
                ]);
            }
        }
    }

    // Membuat worksheet dan menambahkan data
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Mengatur lebar kolom
    const columnWidths = [
        { wch: 25 }, // Tanggal
        { wch: 30 }, // Aktivitas
        { wch: 35 }, // Detail Aktivitas
        { wch: 20 }, // Waktu Efektif
        { wch: 15 }, // Waktu Mulai
        { wch: 15 }, // Waktu Akhir
        { wch: 10 }, // Volume
        { wch: 15 }  // Jumlah (Menit)
    ];
    ws['!cols'] = columnWidths;

    // Menambahkan border pada seluruh sel
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
                alignment: { vertical: "center", horizontal: "center" }
            };
        }
    }

    // Membuat workbook dan menyimpan file
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Aktivitas Harian");
    XLSX.writeFile(wb, "Laporan_Aktivitas_Harian.xlsx");
}

function printJournal() {
    const tableBody = document.getElementById('tabelKinerja'); 

    
    if (!tableBody) {
        console.error("Table body not found!");
        return; 
    }

    const rows = tableBody.getElementsByTagName('tr');
    let printContent = `
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Aktivitas</th>
                <th>Detail Aktivitas</th>
                <th>Waktu Efektif (Menit)</th> <!-- Menampilkan kolom Waktu Efektif -->
                <th>Waktu Mulai</th>
                <th>Waktu Akhir</th>
                <th>Volume</th>
                <th>Jumlah (Menit)</th>
            </tr>
        </thead>
        <tbody>
    `;

    if (rows.length === 0) {
        printContent += '<tr><td colspan="8" class="text-center">Tidak ada data untuk dicetak.</td></tr>'; 
    } else {
        for (let row of rows) {
            const cells = row.getElementsByTagName('td');
            printContent += '<tr>';
            
            
            if (cells.length >= 7) { 
                printContent += `<td>${cells[0].innerText}</td>`; 
                printContent += `<td>${cells[1].innerText}</td>`; 
                printContent += `<td>${cells[2].innerText}</td>`; 
                printContent += `<td>${cells[3].innerText}</td>`; 
                printContent += `<td>${cells[4].innerText}</td>`; 
                printContent += `<td>${cells[5].innerText}</td>`; 
                printContent += `<td>${cells[6].innerText}</td>`; 
                printContent += `<td>${cells[7].innerText}</td>`; 
                // Kolom hapus diabaikan
            }
            
            printContent += '</tr>';
        }
    }

    printContent += '</tbody>';

    const newWindow = window.open('', '_blank', 'width=800,height=600'); 
    newWindow.document.write(`
        <html>
            <head>
                <title>Laporan Aktivitas Harian Pegawai</title>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
               <style>
    body {
        font-family: 'Ubuntu', sans-serif;
        color: #333;
        margin: 40px;
    }
    h2 {
        text-align: center;
        color: #4a4a4a;
        font-weight: bold;
        margin-bottom: 20px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        padding: 12px;
        text-align: center;
        border: 1px solid #ddd;
    }
    th {
        background-color: #2c3e50; /* Biru tua */
        color: #000000; /* Warna teks hitam agar kontras */
        font-weight: bold;
    }
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    tr:hover {
        background-color: #f1f1f1;
    }
    @media print {
        body {
            margin: 0;
            padding: 0;
        }
        th {
            background-color: #ffffff; /* Jika latar belakang tidak muncul, tetap terlihat putih */
            color: #000000; /* Teks hitam untuk cetakan */
            font-weight: bold;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        table {
            page-break-inside: avoid;
        }
    }
</style>

            </head>
            <body>
                <h2>Laporan Aktivitas Harian Pegawai</h2>
                <table class="table table-bordered text-center table-striped">
                    ${printContent}
                </table>
                <script>
                    window.print(); 
                    window.onafterprint = function() {
                        window.close(); 
                    };
                </script>
            </body>
        </html>
    `);
    newWindow.document.close(); 
}

    $(document).ready(function() {
      
      $('.select2').select2({
        placeholder: "--Pilih Aktivitas--",
        allowClear: true
      });
    });
  
    function openModal() {
      $('#inputModal').modal('show');
    }
 
    $(document).ready(function() {
        $('#inputForm').submit(function(e) {
            alert("Form berhasil dikirim!");

            
            this.reset();

            $('#aktivitas').val('').trigger('change.select2');
        });

        $('#aktivitas').select2({
            width: '100%',
            placeholder: '--Pilih Aktivitas--',
            allowClear: true,
            dropdownParent: $('#inputModal')
          });
          
        $('#inputModal').on('hidden.bs.modal', function () {
            $('#inputForm')[0].reset();
            $('#aktivitas').val('').trigger('change.select2');
        });
    });

    window.onload = displayActivities; 
document.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});

function toggleArsipForm() {
    var form = document.getElementById("arsipForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

function formatTanggal(tanggalString) {
    if (!tanggalString) return "-"; 

    let date = new Date(tanggalString);
    let day = date.getDate().toString().padStart(2, '0'); 
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    let year = date.getFullYear(); 

    return `${day}/${month}/${year}`; 
}


function formatWaktu(waktuString) {
    if (!waktuString) return "-"; // Jika kosong, tampilkan "-"

    // Jika dalam format ISO (contoh: "2024-12-23T17:00:00.000Z")
    if (waktuString.includes("T")) {
        let date = new Date(waktuString);
        let jam = date.getHours().toString().padStart(2, '0');
        let menit = date.getMinutes().toString().padStart(2, '0');
        return `${jam}:${menit}`; // Contoh: 07:30
    }

    // Jika dalam format Excel Serial Number (contoh: 0.5 untuk 12:00)
    let excelEpoch = new Date(1899, 11, 30); // Excel mulai dari 30 Des 1899
    let waktu = new Date(excelEpoch.getTime() + (parseFloat(waktuString) * 86400000));

    let jam = waktu.getHours().toString().padStart(2, '0');
    let menit = waktu.getMinutes().toString().padStart(2, '0');

    return `${jam}:${menit}`;
}


function getFilteredArsip() {
    var startDate = document.getElementById("startDate").value;
    var endDate = document.getElementById("endDate").value;

    fetch(`https://script.google.com/macros/s/AKfycbysW2Yvml3yzx3GblS0XQE92klUodnoyeK3fQD6714wf48vJpB7whi1XIxDNeN_U27g/exec?action=getFilteredArsip&start=${startDate}&end=${endDate}`)
        .then(response => response.json())
        .then(data => {
            var tbody = document.querySelector("#arsipTable tbody");
            var showingInfo = document.getElementById("showingInfoArsip");
            tbody.innerHTML = ""; // Hapus isi tabel sebelumnya

            if (data.length > 1) {
                data.slice(1).forEach(row => {
                    var tr = document.createElement("tr");

                    let tanggal = formatTanggal(row[0]); // Ubah tanggal jadi format dd/mm/yyyy
                    let aktivitas = row[1];
                    let detail = row[2];
                    let efektif = row[3];
                    let mulai = formatWaktu(row[4]); // Ubah waktu mulai
                    let akhir = formatWaktu(row[5]); // Ubah waktu akhir
                    let volume = row[6];
                    let jumlah = row[7];

                    tr.innerHTML = `
                        <td>${tanggal}</td>
                        <td>${aktivitas}</td>
                        <td>${detail}</td>
                        <td>${efektif}</td>
                        <td>${mulai}</td>
                        <td>${akhir}</td>
                        <td>${volume}</td>
                        <td>${jumlah}</td>
                    `;

                    tbody.appendChild(tr);
                });

                // Update jumlah arsip yang ditampilkan
                showingInfo.textContent = `Menampilkan ${data.length - 1} arsip kinerja dari ${startDate} hingga ${endDate}`;
            } else {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center">Belum ada riwayat arsip kinerja pada rentang tanggal tersebut</td></tr>`;
                showingInfo.textContent = "Tidak ada arsip kinerja yang ditemukan pada rentang tanggal tersebut.";
            }

            // Tampilkan modal setelah data dimuat
            var modal = new bootstrap.Modal(document.getElementById('arsipModal'));
            modal.show();
        });
}

document.getElementById("downloadExcel").addEventListener("click", function () {
    var table = document.getElementById("arsipTable"); // Ambil tabel arsip
    var wb = XLSX.utils.book_new(); // Buat workbook baru
    var ws = XLSX.utils.table_to_sheet(table); // Konversi tabel ke sheet

    XLSX.utils.book_append_sheet(wb, ws, "Arsip Kinerja"); // Tambahkan sheet ke workbook
    XLSX.writeFile(wb, "Arsip_Kinerja.xlsx"); // Simpan file dengan nama Arsip_Kinerja.xlsx
});
document.addEventListener("DOMContentLoaded", function () {
    var backToTopMain = document.getElementById("backToTopMain");
    var backToTopModal = document.getElementById("backToTopModal");
    var modal = document.getElementById("arsipModal");
    var modalBody = modal.querySelector(".modal-body"); // Pastikan ambil modal-body yang benar

    // Cek apakah sudah di bagian bawah halaman utama
    function checkScrollMain() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            backToTopMain.style.display = "block";
        } else {
            backToTopMain.style.display = "none";
        }
    }

    // Cek apakah sudah di bagian bawah modal arsip
    function checkScrollModal() {
        if (modalBody.scrollHeight - modalBody.scrollTop <= modalBody.clientHeight + 10) {
            backToTopModal.style.display = "block";
        } else {
            backToTopModal.style.display = "none";
        }
    }

    // Event listener untuk scroll halaman utama
    window.addEventListener("scroll", checkScrollMain);

    // Event listener untuk scroll modal, tapi hanya kalau modalnya sudah terbuka
    modal.addEventListener("shown.bs.modal", function () {
        modalBody.addEventListener("scroll", checkScrollModal);
    });

    // Event listener untuk menyembunyikan tombol saat modal ditutup
    modal.addEventListener("hidden.bs.modal", function () {
        backToTopModal.style.display = "none";
    });

    // Scroll ke atas untuk halaman utama
    backToTopMain.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Scroll ke atas untuk modal arsip
    backToTopModal.addEventListener("click", function () {
        modalBody.scrollTo({ top: 0, behavior: "smooth" });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    var backToTopModal = document.getElementById("backToTopModal");
    var modal = document.getElementById("arsipModal");
    var modalBody = document.getElementById("modalScrollContainer"); 

    function checkScrollModal() {
        if (modalBody.scrollTop + modalBody.clientHeight >= modalBody.scrollHeight - 10) {
            backToTopModal.style.display = "block"; 
        } else {
            backToTopModal.style.display = "none"; 
        }
    }

    
    modal.addEventListener("shown.bs.modal", function () {
        modalBody.addEventListener("scroll", checkScrollModal);
    });

    
    modal.addEventListener("hidden.bs.modal", function () {
        backToTopModal.style.display = "none"; 
    });

    
    backToTopModal.addEventListener("click", function () {
        modalBody.scrollTo({ top: 0, behavior: "smooth" });
    });
});
// Function to handle login
function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    // Check if username and password are correct
    if (username === "adminkinerja" && password === "kinerja@dmin") {
      // Hide the login form and show the content
      document.getElementById("loginContainer").style.display = "none";
      document.getElementById("contentContainer").style.display = "block";

      // Show SweetAlert success message for successful login
      Swal.fire({
        title: 'Login Berhasil!',
        text: 'Selamat datang, ' + username + '!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {
      // Show SweetAlert error message for failed login
      Swal.fire({
        title: 'Login Gagal',
        text: 'Username atau Password salah!',
        icon: 'error',
        confirmButtonText: 'Coba Lagi'
      });
    }
  }

  // Function to handle logout
  function logout() {
    // Hide the content and show the login form
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("contentContainer").style.display = "none";

    // Show SweetAlert success message for logout
    Swal.fire({
      title: 'Logout Berhasil!',
      text: 'Anda telah keluar.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  document.addEventListener("keydown", function(e) {
    
    if (e.keyCode == 123) { 
      e.preventDefault();
      alert("Terimakasih sudah berkunjung coy!");
    }
   
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73) { 
      e.preventDefault();
      alert("Terimakasih sudah berkunjung coy!");
    }
    
    if (e.ctrlKey && e.shiftKey && e.keyCode == 74) { 
      e.preventDefault();
      alert("Terimakasih sudah berkunjung coy!");
    }
  });
