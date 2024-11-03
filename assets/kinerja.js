
function openModal() {
    $('#inputModal').modal('show');
    $('#inputForm')[0].reset(); 
}


function submitForm() {
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

    
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push(activity);

    
    localStorage.setItem('activities', JSON.stringify(activities));

    
    Swal.fire({
        icon: 'success',
        title: 'Yeayy..berhasil!',
        text: 'Aktivitas kamu berhasil disimpan.',
        timer: 1500,
        showConfirmButton: false
    });

    
    document.getElementById('inputForm').reset();
    $('#inputModal').modal('hide');

    
    displayActivities();
}


function displayActivities() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const tabelKinerja = document.getElementById('tabelKinerja');
    tabelKinerja.innerHTML = ''; 

    let totalWaktu = 0; 
    
    if (activities.length === 0) {
        const noDataRow = `<tr><td colspan="9" class="text-center">Belum ada jurnal harian!</td></tr>`;
        tabelKinerja.insertAdjacentHTML('beforeend', noDataRow);
    } else {
        activities.forEach((activity, index) => {
            const row = `<tr>
                <td>${activity.tanggal}</td>
                <td>${activity.aktivitas}</td>
                <td>${activity.detailAktivitas}</td>
                <td>${activity.waktuEfektif}</td>
                <td>${activity.waktuMulai}</td>
                <td>${activity.waktuAkhir}</td>
                <td>${activity.volume}</td>
                <td>${activity.jumlah}</td>
                <td><button class="btn btn-danger" onclick="deleteActivity(${index})">Hapus</button></td>
            </tr>`;
            tabelKinerja.insertAdjacentHTML('beforeend', row);
            totalWaktu += parseInt(activity.jumlah); 
        });
    }

    document.getElementById('totalWaktu').textContent = totalWaktu; 
}


function deleteActivity(index) {
    Swal.fire({
        title: 'Yakin nih mau dihapus?',
        text: "Data aktivitas ini akan dihapus dan tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Sebentar'
    }).then((result) => {
        if (result.isConfirmed) {
            
            const activities = JSON.parse(localStorage.getItem('activities'));
            activities.splice(index, 1); 
            localStorage.setItem('activities', JSON.stringify(activities)); 

            
            Swal.fire({
                icon: 'success',
                title: 'Dihapus!',
                text: 'Aktivitas telah berhasil dihapus.😢',
                timer: 1500,
                showConfirmButton: false
            });

            
            displayActivities();
        }
    });
}


function printJournal() {
    const activities = JSON.parse(localStorage.getItem('activities')) || []; 
    let printContent = '<thead><tr><th>Tanggal</th><th>Aktivitas</th><th>Detail Aktivitas</th><th>Waktu Efektif (Menit)</th><th>Waktu Mulai</th><th>Waktu Akhir</th><th>Volume</th><th>Jumlah (Menit)</th></tr></thead><tbody>';

    
    activities.forEach(activity => {
        printContent += `<tr>
            <td>${activity.tanggal}</td>
            <td>${activity.aktivitas}</td>
            <td>${activity.detailAktivitas}</td>
            <td>${activity.waktuEfektif}</td>
            <td>${activity.waktuMulai}</td>
            <td>${activity.waktuAkhir}</td>
            <td>${activity.volume}</td>
            <td>${activity.jumlah}</td>
        </tr>`;
    });

    printContent += '</tbody>';

    const newWindow = window.open('', '_blank', 'width=600,height=400'); 
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
            background-color: #f5f5f5;
            color: #333;
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