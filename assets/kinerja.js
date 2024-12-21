
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
            title: 'Mantap bro. aktivitas harian berhasil disimpan!',
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
window.onload = displayActivities; 
document.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});
