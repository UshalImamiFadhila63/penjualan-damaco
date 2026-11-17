import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { damacoService } from '../services';

const DamacoContext = createContext(null);

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-001',
    nama: 'PT Nusantara Geospasial',
    contact: 'Hendra Wijaya',
    email: 'hendra@geospasial.co.id',
    telepon: '0811-2233-4455',
    alamat: 'Gedung Cyber 2 Tower Lt. 14, Jl. HR Rasuna Said, Jakarta Selatan',
    totalPesanan: 5,
    totalNilai: 408700000,
  },
  {
    id: 'CUST-002',
    nama: 'CV Tani Makmur Sejahtera',
    contact: 'Ir. Bambang Soeprapto',
    email: 'sales@tanimakmur.com',
    telepon: '0812-3456-7890',
    alamat: 'Kawasan Agrobisnis Puspa Agro Blok B-12, Sidoarjo, Jawa Timur',
    totalPesanan: 3,
    totalNilai: 625000000,
  },
  {
    id: 'CUST-003',
    nama: 'Dinas Pertanian Kab. Malang',
    contact: 'Ibu Hj. Sri Wahyuni, M.Si',
    email: 'pertanian@malangkab.go.id',
    telepon: '0341-395123',
    alamat: 'Jl. Panji No. 119, Kepanjen, Kabupaten Malang, Jawa Timur',
    totalPesanan: 4,
    totalNilai: 854100000,
  },
  {
    id: 'CUST-004',
    nama: 'PT Cakra Survei Utama',
    contact: 'Aditya Pratama, S.T.',
    email: 'aditya@cakrasurvei.id',
    telepon: '0813-9988-7766',
    alamat: 'Grand Surya Office Park No. 8, Jl. Soekarno Hatta, Bandung',
    totalPesanan: 3,
    totalNilai: 385500000,
  },
  {
    id: 'CUST-005',
    nama: 'PT Samudra Visual Media',
    contact: 'Dimas Prasetyo',
    email: 'dimas@samudravm.com',
    telepon: '0817-0011-2233',
    alamat: 'Studio 9 Creative Hub, Kebayoran Baru, Jakarta Selatan',
    totalPesanan: 2,
    totalNilai: 93600000,
  },
  {
    id: 'CUST-006',
    nama: 'PT Geo Solusi Mandiri',
    contact: 'Citra Lestari, M.Sc.',
    email: 'citra@geosolusi.co.id',
    telepon: '0818-5566-7788',
    alamat: 'Yogya Technopark Blok C-4, Jl. Babarsari, D.I. Yogyakarta',
    totalPesanan: 3,
    totalNilai: 527800000,
  },
];

// Exact 30 Products matching the B2B Catalog categories:
// Drone (7), Starter Pack (4), Baterai (4), Propeller (4), Controller (2), Charger (2), Payload & Kamera (2), Tas & Case (2), Aksesoris (3) = 30 produk
export const INITIAL_PRODUCTS = [
  // ── Drone (7) ─────────────────────────────────────────────────────────────
  {
    id: 'PRD-M4',
    kode: 'AVN-M4',
    brand: 'Avian',
    nama: 'Atlas M4 RTK',
    kategori: 'Drone',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 148500000,
    stok: 11,
    satuan: 'unit',
    durasi: '55 mnt',
    jarak: '15 km',
    kamera: '20 MP mekanis',
    berat: '0,9 kg',
    isPilihan: true,
    badgeText: 'Pilihan tim survei',
    deskripsi: 'Drone survei generasi mutakhir dengan sistem navigasi RTK tingkat sentimeter, sensor shutter mekanis, dan transmisi stabil hingga 15 km.',
    fitur: ['Akurasi posisi RTK sentimeter', 'Shutter mekanis 1/2000s bebas jello', 'Ketahanan angin hingga 12 m/s', 'Sertifikasi IP55 tahan percikan air'],
  },
  {
    id: 'PRD-TW2',
    kode: 'TW2-01',
    brand: 'Terra Wing',
    nama: 'Terra Wing S2',
    kategori: 'Drone',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 144000000,
    stok: 6,
    satuan: 'unit',
    durasi: '90 mnt',
    jarak: '40 km',
    kamera: '45 MP Full-Frame',
    berat: '2,8 kg',
    isPilihan: false,
    badgeText: 'Long Range Fixed Wing',
    deskripsi: 'Drone Fixed Wing aerodinamis efisiensi tinggi untuk pemetaan koridor jalan, tambang luas, dan batas wilayah.',
    fitur: ['Jangkauan jelajah hingga 40 km', 'Mode peluncuran tangan otomatis', 'Sensor Full-frame 45 MP', 'Baterai dual-redundant'],
  },
  {
    id: 'PRD-AGR',
    kode: 'AG20-STD',
    brand: 'Kestrel Aero',
    nama: 'Agri 20 Pro Sprayer',
    kategori: 'Drone',
    keperluan: 'Pertanian',
    ketersediaan: 'ready_stock',
    harga: 387050000,
    stok: 5,
    satuan: 'unit',
    durasi: '35 mnt',
    jarak: '10 km',
    kamera: 'Radar RTK + FPV HD',
    berat: '19,5 kg',
    isPilihan: false,
    badgeText: 'Pertanian Presisi',
    deskripsi: 'Drone semprot pertanian kapasitas tangki 20 liter dengan radar penyesuaian kontur tanah dan nozel sentrifugal ganda.',
    fitur: ['Kapasitas payload 20 liter', 'Cakupan semprot hingga 12 hektar/jam', 'Radar penghindar rintangan 360°', 'Pengisian baterai cepat 10 menit'],
  },
  {
    id: 'PRD-L5P',
    kode: 'L5P-01',
    brand: 'Halcyon',
    nama: 'Lumen 5 Pro',
    kategori: 'Drone',
    keperluan: 'Fotografi & Video',
    ketersediaan: 'ready_stock',
    harga: 42000000,
    stok: 14,
    satuan: 'unit',
    durasi: '46 mnt',
    jarak: '15 km',
    kamera: '4/3 CMOS 5.1K',
    berat: '0,89 kg',
    isPilihan: false,
    badgeText: 'Cinema Grade',
    deskripsi: 'Drone visual profesional dengan kamera Hasselblad 4/3 CMOS dan profil warna D-Log 10-bit untuk dokumenter dan inspeksi visual.',
    fitur: ['Perekaman video 5.1K/50fps ProRes', 'Dynamic range 12.8 stops', 'Sensor halangan omnidirectional', 'Gimbal 3-axis ultra stabil'],
  },
  {
    id: 'PRD-SCM',
    kode: 'SCM-01',
    brand: 'Kestrel Aero',
    nama: 'Scout Mini Rover UGV',
    kategori: 'Drone',
    keperluan: 'Inspeksi Ringan',
    ketersediaan: 'stok_terbatas',
    harga: 37500000,
    stok: 4,
    satuan: 'unit',
    durasi: '120 mnt',
    jarak: '5 km',
    kamera: 'Lidar 3D + HD Night',
    berat: '12,5 kg',
    isPilihan: false,
    badgeText: 'Autonomous Rover',
    deskripsi: 'Robot UGV penjelajah darat multi-terrain dengan kontrol telemetri ROS2 dan sensor pemindai terowongan.',
    fitur: ['Suspensi 4-wheel independent drive', 'Kecepatan hingga 10 km/jam', 'Dukungan mount kamera thermal', 'Daya tahan baterai 2 jam kerja'],
  },
  {
    id: 'PRD-VX8',
    kode: 'AVN-X8',
    brand: 'Avian',
    nama: 'Vector X8 Heavy Lift',
    kategori: 'Drone',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'indent_14_hari',
    harga: 215000000,
    stok: 2,
    satuan: 'unit',
    durasi: '45 mnt',
    jarak: '20 km',
    kamera: 'Triple Sensor Thermal',
    berat: '4,5 kg',
    isPilihan: false,
    badgeText: 'Heavy Duty Carrier',
    deskripsi: 'Platform drone oktokopter heavy-duty dengan daya angkut muatan sensor lidar besar hingga 8 kg.',
    fitur: ['Sistem propulsi oktokopter redundant', 'Dukungan payload ganda simultan', 'Koneksi satelit darurat', 'Material serat karbon aviation grade'],
  },
  {
    id: 'PRD-SPT',
    kode: 'LUM-SP',
    brand: 'Halcyon',
    nama: 'Spectra Dual Thermal',
    kategori: 'Drone',
    keperluan: 'Inspeksi Ringan',
    ketersediaan: 'ready_stock',
    harga: 68000000,
    stok: 7,
    satuan: 'unit',
    durasi: '42 mnt',
    jarak: '12 km',
    kamera: 'Thermal FLIR 640x512',
    berat: '1,4 kg',
    isPilihan: false,
    badgeText: 'Thermal Inspection',
    deskripsi: 'Drone inspeksi termal presisi untuk utilitas PLN, instalasi solar panel, dan regu penyelamat darurat.',
    fitur: ['Resolusi radiometrik 640x512', 'Kamera visual 48 MP zoom 32x', 'Isotherm & alarm suhu otomatis', 'Sistem suar lampu penerangan malam'],
  },

  // ── Starter Pack (4) ───────────────────────────────────────────────────────
  {
    id: 'PRD-ATLAS-SP',
    kode: 'SP-ATL01',
    brand: 'Avian',
    nama: 'Starter Pack Survei Atlas',
    kategori: 'Starter Pack',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 159900000,
    stok: 9,
    satuan: 'paket',
    durasi: '3x Baterai',
    jarak: '15 km',
    kamera: '20 MP + RTK Base',
    berat: '12 kg pack',
    isPilihan: true,
    badgeText: 'Paket Terlengkap',
    deskripsi: 'Paket operasional lengkap: 1x drone Atlas M4 RTK, 3x Smart Battery TB65, 1x Charging Station Hub, 1x Hardcase IP67, dan pelatihan operator 2 hari.',
    fitur: ['Siap pakai tanpa biaya tambahan', 'Include Hardcase anti banting IP67', 'Garansi ganti unit 2 tahun Damaco', 'Dukungan teknisi hotline 24/7'],
  },
  {
    id: 'PRD-AG20-SP',
    kode: 'SP-AGR02',
    brand: 'Kestrel Aero',
    nama: 'Starter Pack Agri 20',
    kategori: 'Starter Pack',
    keperluan: 'Pertanian',
    ketersediaan: 'ready_stock',
    harga: 143900000,
    stok: 8,
    satuan: 'paket',
    durasi: '4x Baterai',
    jarak: '10 km',
    kamera: 'Full Kit Semprot',
    berat: '35 kg pack',
    isPilihan: false,
    badgeText: 'Solusi Agrobisnis',
    deskripsi: 'Paket starter semprot lahan: unit Agri 20, generator genset fast-charge, 4 unit baterai cerdas, dan tangki spare ekstra.',
    fitur: ['Generator 7200W hemat bahan bakar', 'Pompa desinfektan kimia anti-karat', 'Sertifikasi kelayakan terbang Kementan', 'Aplikasi peta lahan otomatis'],
  },
  {
    id: 'PRD-LUM-SP',
    kode: 'SP-LUM03',
    brand: 'Halcyon',
    nama: 'Starter Pack Cinema Lumen 5',
    kategori: 'Starter Pack',
    keperluan: 'Fotografi & Video',
    ketersediaan: 'ready_stock',
    harga: 54000000,
    stok: 6,
    satuan: 'paket',
    durasi: '3x Baterai',
    jarak: '15 km',
    kamera: 'Kit ND Filter + Cine',
    berat: '4,2 kg pack',
    isPilihan: false,
    badgeText: 'Cinema Production',
    deskripsi: 'Paket kreasi visual: drone Lumen 5 Pro, 3x baterai cadangan, set filter polaroid/ND, smart remote pro, dan tas selempang kulit.',
    fitur: ['Set 6 filter cinema ND8/16/32/64', 'Remote kontrol layar ultra cerah 1000 nits', 'Kabel data high-speed transfer', 'Pelindung gimbal berbahan aloi'],
  },
  {
    id: 'PRD-TERRA-SP',
    kode: 'SP-TER04',
    brand: 'Terra Wing',
    nama: 'Starter Pack Fixed Wing Explorer',
    kategori: 'Starter Pack',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'stok_terbatas',
    harga: 172000000,
    stok: 3,
    satuan: 'paket',
    durasi: '2x LiPo Pack',
    jarak: '40 km',
    kamera: 'Antena Tracker Set',
    berat: '18 kg pack',
    isPilihan: false,
    badgeText: 'Pemetaan Skala Luas',
    deskripsi: 'Solusi lengkap pemetaan batas tambang dan perkebunan: Terra Wing S2, antena pelacak sinyal otomatis, modul RTK stasiun bumi, dan laptop kontrol.',
    fitur: ['Antena tracking sinyal otomatis', 'Software pengolah fotogrametri seumur hidup', 'Spare sayap dan motor ekstra', 'Kotak pengiriman berstandar kargo udara'],
  },

  // ── Baterai (4) ────────────────────────────────────────────────────────────
  {
    id: 'BAT-01',
    kode: 'BAT-TB65',
    brand: 'Avian',
    nama: 'Smart Flight Battery TB65 (Atlas M4)',
    kategori: 'Baterai',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 8500000,
    stok: 24,
    satuan: 'buah',
    durasi: '55 mnt waktu terbang',
    jarak: 'Manajemen daya cerdas',
    kamera: 'Indikator LED 4 titik',
    berat: '0,42 kg',
    isPilihan: false,
    badgeText: 'Aksesoris Asli',
    deskripsi: 'Baterai lithium berkapasitas tinggi 5880 mAh dengan sistem pemanas otomatis untuk performa maksimal di daerah dingin maupun panas.',
  },
  {
    id: 'BAT-02',
    kode: 'BAT-AG30',
    brand: 'Kestrel Aero',
    nama: 'Intelligent Battery Agri 20 (30.000mAh)',
    kategori: 'Baterai',
    keperluan: 'Pertanian',
    ketersediaan: 'ready_stock',
    harga: 18200000,
    stok: 15,
    satuan: 'buah',
    durasi: '35 mnt beban penuh',
    jarak: 'Siklus 1.500 kali isi',
    kamera: 'Proteksi tahan banting',
    berat: '6,2 kg',
    isPilihan: false,
    badgeText: 'Heavy Duty',
    deskripsi: 'Baterai khusus traksi tinggi dengan sel polimer generasi terbaru, bersertifikat tahan cairan pestisida dan kelembaban sawah.',
  },
  {
    id: 'BAT-03',
    kode: 'BAT-TERRA',
    brand: 'Terra Wing',
    nama: 'Ultra Endurance LiPo Terra Wing',
    kategori: 'Baterai',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 16200000,
    stok: 10,
    satuan: 'buah',
    durasi: '90 mnt jelajah',
    jarak: 'Voltase stabil 24V',
    kamera: 'Konektor emas solid',
    berat: '1,3 kg',
    isPilihan: false,
    badgeText: 'Long Range',
    deskripsi: 'Baterai LiPo multi-cell berdaya simpan tinggi untuk penerbangan Fixed Wing jarak jauh tanpa penurunan tegangan mendadak.',
  },
  {
    id: 'BAT-04',
    kode: 'BAT-LUMEN',
    brand: 'Halcyon',
    nama: 'High Capacity Battery Lumen 5',
    kategori: 'Baterai',
    keperluan: 'Fotografi & Video',
    ketersediaan: 'ready_stock',
    harga: 3800000,
    stok: 30,
    satuan: 'buah',
    durasi: '46 mnt terbang',
    jarak: 'Sistem proteksi overcharge',
    kamera: 'Desain kompak',
    berat: '0,33 kg',
    isPilihan: false,
    badgeText: 'Quick Swap',
    deskripsi: 'Baterai penerbangan cadangan untuk Lumen 5 Pro, mendukung pengisian cepat via USB-C Power Delivery 100W.',
  },

  // ── Propeller (4) ──────────────────────────────────────────────────────────
  {
    id: 'PRP-01',
    kode: 'PRP-CFM4',
    brand: 'Avian',
    nama: 'Carbon Fiber Low-Noise Propellers (Atlas M4)',
    kategori: 'Propeller',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 1450000,
    stok: 40,
    satuan: 'set',
    durasi: '1 pasang (CW+CCW)',
    jarak: 'Serat karbon murni',
    kamera: 'Reduksi kebisingan -4dB',
    berat: '45 gram',
    isPilihan: false,
    badgeText: 'High Aerodynamics',
    deskripsi: 'Baling-baling serat karbon berpresisi tinggi dengan rancangan aerodinamis ujung melengkung untuk mengurangi kebisingan dan hemat baterai.',
  },
  {
    id: 'PRP-02',
    kode: 'PRP-AGR20',
    brand: 'Kestrel Aero',
    nama: 'High-Lift Folding Propeller Set Agri 20',
    kategori: 'Propeller',
    keperluan: 'Pertanian',
    ketersediaan: 'ready_stock',
    harga: 2800000,
    stok: 18,
    satuan: 'set',
    durasi: 'Ukuran 38 inch',
    jarak: 'Torsi angkat 25 kg',
    kamera: 'Material polimer nylon',
    berat: '180 gram',
    isPilihan: false,
    badgeText: 'Heavy Lift',
    deskripsi: 'Baling-baling lipat tahan benturan ranting pohon dan debu lumpur, menghasilkan gaya angkat maksimal untuk drone semprot.',
  },
  {
    id: 'PRP-03',
    kode: 'PRP-LUM5',
    brand: 'Halcyon',
    nama: 'Quick-Release Propeller Lumen 5',
    kategori: 'Propeller',
    keperluan: 'Fotografi & Video',
    ketersediaan: 'ready_stock',
    harga: 850000,
    stok: 50,
    satuan: 'set',
    durasi: '1 set isi 4 buah',
    jarak: 'Mekanisme kunci pegas',
    kamera: 'Ujung silikon oranye',
    berat: '28 gram',
    isPilihan: false,
    badgeText: 'Original Spare',
    deskripsi: 'Set baling-baling cadangan resmi dengan mekanisme pasang cepat putar-dan-kunci tanpa memerlukan obeng.',
  },
  {
    id: 'PRP-04',
    kode: 'PRP-TW20',
    brand: 'Terra Wing',
    nama: 'Propeller Set Fixed Wing Terra Wing',
    kategori: 'Propeller',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 1950000,
    stok: 12,
    satuan: 'set',
    durasi: 'Model pusher prop',
    jarak: 'High pitch cruising',
    kamera: 'Balancing test lolos ISO',
    berat: '65 gram',
    isPilihan: false,
    badgeText: 'Fixed Wing Prop',
    deskripsi: 'Baling-baling pendorong (pusher) untuk motor brushless Terra Wing S2, memaksimalkan efisiensi jelajah pada kecepatan 65 km/jam.',
  },

  // ── Controller (2) ─────────────────────────────────────────────────────────
  {
    id: 'CTR-01',
    kode: 'CTR-MST7',
    brand: 'Damaco',
    nama: 'Damaco Master Remote Controller V2 with 7" High-Bright Screen',
    kategori: 'Controller',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 18500000,
    stok: 14,
    satuan: 'unit',
    durasi: 'Baterai 6 jam kerja',
    jarak: 'Transmisi hingga 15 km',
    kamera: 'Layar 2000 nits anti silau',
    berat: '0,75 kg',
    isPilihan: true,
    badgeText: 'All-in-One Controller',
    deskripsi: 'Remote kontrol profesional terintegrasi layar sentuh FHD 7 inci dengan kecerahan 2.000 nits, tetap terlihat jelas di bawah terik matahari pantai.',
  },
  {
    id: 'CTR-02',
    kode: 'CTR-GCS2',
    brand: 'Damaco',
    nama: 'Dual-Screen Ground Control Station Rugged',
    kategori: 'Controller',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'stok_terbatas',
    harga: 32000000,
    stok: 5,
    satuan: 'unit',
    durasi: 'Baterai ganda hot-swap',
    jarak: 'Modem 4G/LTE + Radio 915Mhz',
    kamera: 'Dual monitor 10.1 inci',
    berat: '4,2 kg',
    isPilihan: false,
    badgeText: 'Command Center',
    deskripsi: 'Stasiun komando darat berlayar ganda dalam koper militer IP67 untuk koordinasi misi armada drone multi-unit dan mapping terpadu.',
  },

  // ── Charger (2) ────────────────────────────────────────────────────────────
  {
    id: 'CHG-01',
    kode: 'CHG-OCTA',
    brand: 'Damaco',
    nama: 'Octa-Hub Fast Charging Station 2000W',
    kategori: 'Charger',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 14500000,
    stok: 12,
    satuan: 'unit',
    durasi: 'Isi 8 baterai sekaligus',
    jarak: 'Daya output 2000 Watt',
    kamera: 'Smart cooling fan',
    berat: '5,5 kg',
    isPilihan: false,
    badgeText: 'Fast Fleet Charging',
    deskripsi: 'Stasiun pengisi daya cerdas 8 saluran simultan untuk baterai Atlas M4 dan TB65 dengan proteksi lonjakan arus dan monitoring voltase sel.',
  },
  {
    id: 'CHG-02',
    kode: 'CHG-DUAL',
    brand: 'Damaco',
    nama: 'Dual Intelligent Battery Charger Hub',
    kategori: 'Charger',
    keperluan: 'Fotografi & Video',
    ketersediaan: 'ready_stock',
    harga: 3200000,
    stok: 22,
    satuan: 'unit',
    durasi: 'Isi 2 baterai berurutan',
    jarak: 'Port USB-C PD 100W',
    kamera: 'Indikator digital LCD',
    berat: '0,35 kg',
    isPilihan: false,
    badgeText: 'Compact Field Charger',
    deskripsi: 'Hub pengisi daya portabel kompak untuk kerja lapangan, dapat dialiri daya dari powerbank besar atau soket mobil 12V.',
  },

  // ── Payload & Kamera (2) ───────────────────────────────────────────────────
  {
    id: 'PLD-01',
    kode: 'PLD-LIDAR',
    brand: 'Avian',
    nama: 'Lidar Scanner Sensor V3 Millimeter Accuracy',
    kategori: 'Payload & Kamera',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'stok_terbatas',
    harga: 98000000,
    stok: 4,
    satuan: 'unit',
    durasi: '240.000 titik pantul/detik',
    jarak: 'Rentang deteksi 300 meter',
    kamera: 'Sensor RGB 20 MP terpadu',
    berat: '0,95 kg',
    isPilihan: true,
    badgeText: 'Pemetaan 3D Lidar',
    deskripsi: 'Sensor pemindai Lidar terpasang gimbal terintegrasi kamera fotogrametri RGB untuk menghasilkan point cloud 3D vegetasi tebal dan topografi.',
  },
  {
    id: 'PLD-02',
    kode: 'PLD-MULTI',
    brand: 'Kestrel Aero',
    nama: 'Multispectral 5-Band Sensor Agrobisnis',
    kategori: 'Payload & Kamera',
    keperluan: 'Pertanian',
    ketersediaan: 'ready_stock',
    harga: 45000000,
    stok: 6,
    satuan: 'unit',
    durasi: '5 pita spektral (NDVI/NDRE)',
    jarak: 'Kalibrasi sinar matahari DLS-2',
    kamera: 'Resolusi 3.2 MP per pita',
    berat: '0,48 kg',
    isPilihan: false,
    badgeText: 'Analisis Kesehatan Tanaman',
    deskripsi: 'Sensor multispektral 5-band untuk monitoring indeks vegetasi tanaman, deteksi penyakit hama, dan optimasi pemupukan presisi.',
  },

  // ── Tas & Case (2) ─────────────────────────────────────────────────────────
  {
    id: 'CAS-01',
    kode: 'CAS-M4HD',
    brand: 'Damaco',
    nama: 'Rugged IP67 Hardcase Foam Atlas M4',
    kategori: 'Tas & Case',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 4200000,
    stok: 20,
    satuan: 'buah',
    durasi: 'IP67 tahan air & debu',
    jarak: 'Busa EVA potong laser presisi',
    kamera: 'Katup pelepas tekanan otomatis',
    berat: '3,8 kg',
    isPilihan: false,
    badgeText: 'Proteksi Maksimal',
    deskripsi: 'Koper pelindung berbahan polimer resin tahan banting ekstrem dengan busa pelindung khusus yang muat unit drone, 4 baterai, remote, dan charger.',
  },
  {
    id: 'CAS-02',
    kode: 'CAS-BP01',
    brand: 'Damaco',
    nama: 'Modular Tactical Field Backpack Kit',
    kategori: 'Tas & Case',
    keperluan: 'Inspeksi Ringan',
    ketersediaan: 'ready_stock',
    harga: 2100000,
    stok: 25,
    satuan: 'buah',
    durasi: 'Bahan Cordura 1000D',
    jarak: 'Raincover terintegrasi',
    kamera: 'Kompartemen laptop 16 inci',
    berat: '1,4 kg',
    isPilihan: false,
    badgeText: 'Nyaman Mendaki',
    deskripsi: 'Ransel ergonomis khusus surveyor lapangan yang sering bekerja di medan perbukitan, hutan lindung, dan lokasi terpencil.',
  },

  // ── Aksesoris (3) ──────────────────────────────────────────────────────────
  {
    id: 'ACC-01',
    kode: 'ACC-DRTK',
    brand: 'Avian',
    nama: 'D-RTK 2 High Precision GNSS Mobile Station',
    kategori: 'Aksesoris',
    keperluan: 'Survei & Pemetaan',
    ketersediaan: 'ready_stock',
    harga: 38000000,
    stok: 8,
    satuan: 'unit',
    durasi: 'Baterai internal 12 jam',
    jarak: 'Multi-konstelasi GPS/Glonass/Beidou',
    kamera: 'Tripod serat karbon include',
    berat: '4,6 kg',
    isPilihan: false,
    badgeText: 'Akurasi Sentimeter',
    deskripsi: 'Stasiun referensi GNSS dasar mobile dengan kemampuan koreksi diferensial real-time untuk akurasi peta koordinat tingkat global.',
  },
  {
    id: 'ACC-02',
    kode: 'ACC-DROP',
    brand: 'Damaco',
    nama: 'Heavy Payload Drop Mechanism System',
    kategori: 'Aksesoris',
    keperluan: 'Inspeksi Ringan',
    ketersediaan: 'ready_stock',
    harga: 7500000,
    stok: 14,
    satuan: 'unit',
    durasi: 'Kapasitas lepas muatan 5 kg',
    jarak: 'Aktivasi via remote kontrol',
    kamera: 'Servo aloi presisi',
    berat: '0,28 kg',
    isPilihan: false,
    badgeText: 'Logistik Darurat',
    deskripsi: 'Modul pelepas kargo darurat untuk pengantaran pelampung SAR, obat-obatan di pulau terisolir, dan sampel air tambang.',
  },
  {
    id: 'ACC-03',
    kode: 'ACC-SPML',
    brand: 'Damaco',
    nama: 'Searchlight & Megaphone Combo Unit',
    kategori: 'Aksesoris',
    keperluan: 'Inspeksi Ringan',
    ketersediaan: 'ready_stock',
    harga: 9200000,
    stok: 10,
    satuan: 'unit',
    durasi: 'Sorot 10.200 Lumens / 100m',
    jarak: 'Suara jangkau 400 meter',
    kamera: 'Gimbal tilt otomatis',
    berat: '0,45 kg',
    isPilihan: false,
    badgeText: 'Patroli Malam',
    deskripsi: 'Kombinasi lampu sorot berdaya tinggi dan pengeras suara jarak jauh untuk patroli keamanan perimeter industri dan evakuasi bencana.',
  },
];

export const INITIAL_ORDERS = [
  // 1. Group: Terbitkan penawaran (2 items)
  {
    id: 'ord-01',
    nomor: 'QT/2026/11/0021',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    contact: 'Raka Pradipta',
    telepon: '0812-3456-7890',
    email: 'raka@nusantarageo.co.id',
    npwp: '01.234.567.8-012.000',
    detail: '2x Atlas M4 RTK',
    items: [
      {
        nama: 'Atlas M4 RTK',
        qty: 2,
        harga: 148500000,
        hargaBeli: 131200000,
        margin: '12%',
        subtotal: 297000000,
      },
    ],
    total: 297000000,
    estimasiMarginKotor: 34600000,
    actionGroup: 'terbitkan_penawaran',
    tanggal: '2026-11-11',
    status: 'draft_penawaran',
    statusLabel: 'Menunggu Penawaran',
    catatan: 'Permintaan 2 unit drone survei Atlas M4 RTK dengan kelengkapan GNSS & dual battery kit',
  },
  {
    id: 'ord-02',
    nomor: 'QT/2026/11/0014',
    customerId: 'CUST-002',
    customerNama: 'CV Tani Makmur Sejahtera',
    detail: '3x Starter Pack Agri 20',
    items: [
      { nama: 'Starter Pack Agri 20', qty: 3, harga: 143900000, subtotal: 431700000 },
    ],
    total: 431700000,
    actionGroup: 'terbitkan_penawaran',
    tanggal: '2026-11-11',
    status: 'draft_penawaran',
    statusLabel: 'Draft Penawaran',
    catatan: 'Permintaan penawaran 3 set drone semprot sawah modern',
  },

  // 2. Group: Input PO (2 items)
  {
    id: 'ord-11',
    nomor: 'QT/2026/11/0013',
    customerId: 'CUST-006',
    customerNama: 'PT Geo Solusi Mandiri',
    detail: 'Starter Pack Survei Atlas + RTK',
    items: [
      { nama: 'Starter Pack Survei Atlas', qty: 1, harga: 159900000, subtotal: 159900000 },
      { nama: 'Lumen 5 Pro', qty: 1, harga: 42000000, subtotal: 42000000 },
    ],
    total: 201900000,
    actionGroup: 'input_po',
    tanggal: '2026-11-10',
    status: 'menunggu_po',
    statusLabel: 'Menunggu Input PO',
    catatan: 'Customer telah menyetujui quote dan mengirim softcopy dokumen PO',
  },
  {
    id: 'ord-09',
    nomor: 'QT/2026/11/0010',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    contact: 'Raka Pradipta',
    telepon: '0812-3456-7890',
    detail: '2x Starter Pack Lumen Pro',
    items: [
      { nama: 'Starter Pack Cinema Lumen 5', qty: 2, harga: 47900000, subtotal: 95800000 },
    ],
    total: 95800000,
    actionGroup: 'input_po',
    tanggal: '2026-11-09',
    status: 'menunggu_po',
    statusLabel: 'Menunggu Input PO',
    catatan: 'Penawaran harga resmi terbit, menunggu konfirmasi nomor PO resmi dari customer',
  },

  // 3. Group: Urus dealer (2 items)
  {
    id: 'ord-10',
    nomor: 'QT/2026/11/0011',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    contact: 'Raka Pradipta',
    telepon: '0812-3456-7890',
    detail: '1x Starter Pack Survei Atlas',
    items: [
      { nama: 'Starter Pack Survei Atlas', qty: 1, harga: 159900000, subtotal: 159900000 },
    ],
    total: 159900000,
    actionGroup: 'urus_dealer',
    tanggal: '2026-11-08',
    status: 'po_diterima',
    statusLabel: 'PO Diterima',
    poNumber: 'PO-NG/1110/2026',
    catatan: 'PO resmi PO-NG/1110/2026 diterima, sedang koordinasi kuota dealer Jakarta',
  },
  {
    id: 'ord-14',
    nomor: 'QT/2026/11/0008',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    contact: 'Raka Pradipta',
    telepon: '0812-3456-7890',
    detail: 'Terra Wing S2 Long Range',
    items: [
      { nama: 'Terra Wing S2', qty: 1, harga: 144000000, subtotal: 144000000 },
      { nama: 'Antena Tracker Otomatis', qty: 1, harga: 22000000, subtotal: 22000000 },
    ],
    total: 166000000,
    actionGroup: 'urus_dealer',
    tanggal: '2026-11-07',
    status: 'koordinasi_dealer',
    statusLabel: 'Urus Dealer',
    catatan: 'Pengurusan diskon dealer khusus & sertifikasi frekuensi radio telemetri',
  },

  // 4. Group: Buat invoice (2 items)
  {
    id: 'ord-12',
    nomor: 'QT/2026/11/0016',
    customerId: 'CUST-003',
    customerNama: 'Dinas Pertanian Kab. Malang',
    detail: '2x Starter Pack Agri 20',
    items: [
      { nama: 'Starter Pack Agri 20', qty: 2, harga: 143900000, subtotal: 287800000 },
    ],
    total: 287800000,
    actionGroup: 'buat_invoice',
    tanggal: '2026-11-06',
    status: 'siap_invoice',
    statusLabel: 'Siap Buat Invoice',
    catatan: 'Dealer clearance selesai, siap generate Faktur Pajak dan Invoice komersial',
  },
  {
    id: 'ord-13',
    nomor: 'QT/2026/11/0009',
    customerId: 'CUST-005',
    customerNama: 'PT Samudra Visual Media',
    detail: 'Lumen 5 Pro + Sensor Cine',
    items: [
      { nama: 'Lumen 5 Pro', qty: 1, harga: 42000000, subtotal: 42000000 },
      { nama: 'Lensa Cinema Anamorphic', qty: 1, harga: 14800000, subtotal: 14800000 },
    ],
    total: 56800000,
    actionGroup: 'buat_invoice',
    tanggal: '2026-11-05',
    status: 'siap_invoice',
    statusLabel: 'Siap Buat Invoice',
    catatan: 'PO terverifikasi, pembuatan tagihan proforma invoice termin 1',
  },

  // 5. Group: Tandai Lunas (2 items) -> Exactly Rp 587.250.000 (160.2M + 427.05M)
  {
    id: 'ord-03',
    nomor: 'QT/2026/11/0007',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    detail: 'Terra Wing S2 +1',
    items: [
      { nama: 'Terra Wing S2', qty: 1, harga: 144000000, subtotal: 144000000 },
      { nama: 'Baterai Cadangan Ultra', qty: 1, harga: 16200000, subtotal: 16200000 },
    ],
    total: 160200000,
    actionGroup: 'tandai_lunas',
    tanggal: '2026-11-04',
    status: 'menunggu_pembayaran',
    statusLabel: 'Menunggu Pembayaran',
    invoiceNomor: 'INV/2026/11/0007',
    catatan: 'Invoice telah dikirim, bukti transfer via Bank Mandiri sedang diverifikasi finance',
  },
  {
    id: 'ord-04',
    nomor: 'QT/2026/11/0017',
    customerId: 'CUST-003',
    customerNama: 'Dinas Pertanian Kab. Malang',
    detail: 'Agri 20 +1',
    items: [
      { nama: 'Agri 20 Pro Sprayer', qty: 1, harga: 387050000, subtotal: 387050000 },
      { nama: 'Paket Pelatihan Operator & Sertifikasi', qty: 1, harga: 40000000, subtotal: 40000000 },
    ],
    total: 427050000,
    actionGroup: 'tandai_lunas',
    tanggal: '2026-11-04',
    status: 'menunggu_pembayaran',
    statusLabel: 'Menunggu Pembayaran',
    invoiceNomor: 'INV/2026/11/0017',
    catatan: 'SPK Dinas Pertanian telah terbit, proses verifikasi SP2D bendahara',
  },

  // 6. Group: Kirim barang (1 item in group, + 1 in-transit = 2 in shipping)
  {
    id: 'ord-05',
    nomor: 'QT/2026/11/0018',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    contact: 'Raka Pradipta',
    telepon: '0812-3456-7890',
    detail: '1x Starter Pack Survei Atlas',
    items: [
      { nama: 'Starter Pack Survei Atlas', qty: 1, harga: 159900000, subtotal: 159900000 },
    ],
    total: 159900000,
    actionGroup: 'kirim_barang',
    tanggal: '2026-11-03',
    status: 'siap_dikirim',
    statusLabel: 'Siap Dikirim',
    catatan: 'Pembayaran telah lunas diverifikasi, paket telah dipacking aman di gudang utama',
  },

  // 7. Group: Tutup transaksi (2 items)
  {
    id: 'ord-06',
    nomor: 'QT/2026/10/0004',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    detail: 'Scout Mini +1',
    items: [
      { nama: 'Scout Mini Rover UGV', qty: 1, harga: 37500000, subtotal: 37500000 },
      { nama: 'Sensor Kalibrasi Lidar', qty: 1, harga: 4200000, subtotal: 4200000 },
    ],
    total: 41700000,
    actionGroup: 'tutup_transaksi',
    tanggal: '2026-10-28',
    status: 'diterima',
    statusLabel: 'Diterima Customer',
    catatan: 'BAP (Berita Acara Serah Terima) telah ditandatangani oleh customer',
  },
  {
    id: 'ord-07',
    nomor: 'QT/2026/11/0019',
    customerId: 'CUST-005',
    customerNama: 'PT Samudra Visual Media',
    detail: 'Lumen 5 Pro +1',
    items: [
      { nama: 'Lumen 5 Pro', qty: 1, harga: 42000000, subtotal: 42000000 },
      { nama: 'Gimbal Stabilizer Pro', qty: 1, harga: 4800000, subtotal: 4800000 },
    ],
    total: 46800000,
    actionGroup: 'tutup_transaksi',
    tanggal: '2026-11-02',
    status: 'diterima',
    statusLabel: 'Diterima Customer',
    catatan: 'Unit telah diuji coba berfungsi normal, menunggu penutupan resmi',
  },

  // Active in transit (card 3: Dalam pengiriman = 2)
  {
    id: 'ord-08',
    nomor: 'QT/2026/11/0015',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    contact: 'Raka Pradipta',
    telepon: '0812-3456-7890',
    detail: 'Terra Wing S2 +1',
    items: [
      { nama: 'Terra Wing S2', qty: 1, harga: 144000000, subtotal: 144000000 },
      { nama: 'Stasiun RTK Base', qty: 1, harga: 28000000, subtotal: 28000000 },
    ],
    total: 172000000,
    actionGroup: 'dalam_pengiriman_berjalan',
    tanggal: '2026-11-02',
    status: 'dalam_pengiriman',
    statusLabel: 'Sedang Dikirim',
    ekspedisi: 'Damaco Secure Fleet (Driver: Pak Joko - 0812-9988-1122)',
    noResi: 'DMC-EXP-20261102-08',
    catatan: 'Estimasi tiba di lokasi site sore hari, pengawalan teknisi kalibrasi',
  },

  // Completed past orders (to make total = 20 pesanan)
  {
    id: 'ord-15',
    nomor: 'QT/2026/09/0001',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    detail: 'Starter Pack Survei Atlas',
    items: [{ nama: 'Starter Pack Survei Atlas', qty: 1, harga: 159900000, subtotal: 159900000 }],
    total: 159900000,
    actionGroup: 'selesai',
    tanggal: '2026-09-10',
    status: 'selesai',
    statusLabel: 'Selesai',
    catatan: 'Transaksi sukses ditutup',
  },
  {
    id: 'ord-16',
    nomor: 'QT/2026/09/0002',
    customerId: 'CUST-002',
    customerNama: 'CV Tani Makmur Sejahtera',
    detail: '1x Agri 20 Pro Sprayer',
    items: [{ nama: 'Agri 20 Pro Sprayer', qty: 1, harga: 387050000, subtotal: 387050000 }],
    total: 387050000,
    actionGroup: 'selesai',
    tanggal: '2026-09-14',
    status: 'selesai',
    statusLabel: 'Selesai',
    catatan: 'Transaksi selesai, unit telah beroperasi',
  },
  {
    id: 'ord-17',
    nomor: 'QT/2026/09/0003',
    customerId: 'CUST-003',
    customerNama: 'Dinas Pertanian Kab. Malang',
    detail: 'Lumen 5 Pro',
    items: [{ nama: 'Lumen 5 Pro', qty: 1, harga: 42000000, subtotal: 42000000 }],
    total: 42000000,
    actionGroup: 'selesai',
    tanggal: '2026-09-20',
    status: 'selesai',
    statusLabel: 'Selesai',
    catatan: 'Transaksi sukses',
  },
  {
    id: 'ord-18',
    nomor: 'QT/2026/08/0001',
    customerId: 'CUST-004',
    customerNama: 'PT Cakra Survei Utama',
    detail: 'Terra Wing S2',
    items: [{ nama: 'Terra Wing S2', qty: 1, harga: 144000000, subtotal: 144000000 }],
    total: 144000000,
    actionGroup: 'selesai',
    tanggal: '2026-08-11',
    status: 'selesai',
    statusLabel: 'Selesai',
    catatan: 'Proyek tambang selesai',
  },
  {
    id: 'ord-19',
    nomor: 'QT/2026/08/0002',
    customerId: 'CUST-005',
    customerNama: 'PT Samudra Visual Media',
    detail: 'Scout Mini Rover UGV',
    items: [{ nama: 'Scout Mini Rover UGV', qty: 1, harga: 37500000, subtotal: 37500000 }],
    total: 37500000,
    actionGroup: 'selesai',
    tanggal: '2026-08-25',
    status: 'selesai',
    statusLabel: 'Selesai',
    catatan: 'Shooting pantai sukses',
  },
  {
    id: 'ord-20',
    nomor: 'QT/2026/07/0001',
    customerId: 'CUST-006',
    customerNama: 'PT Geo Solusi Mandiri',
    detail: 'Starter Pack Survei Atlas',
    items: [{ nama: 'Starter Pack Survei Atlas', qty: 1, harga: 159900000, subtotal: 159900000 }],
    total: 159900000,
    actionGroup: 'selesai',
    tanggal: '2026-07-30',
    status: 'selesai',
    statusLabel: 'Selesai',
    catatan: 'Pemetaan IKN tahap 1',
  },
  {
    id: 'ord-21',
    nomor: 'QT/2026/10/0002',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    contact: 'Raka Pradipta',
    telepon: '0812-3456-7890',
    detail: '1x Gimbal Zoom Optik 30x',
    items: [{ nama: 'Kamera Gimbal Zoom Optik 30x', qty: 1, harga: 24500000, subtotal: 24500000 }],
    total: 24500000,
    actionGroup: 'tidak_aktif',
    tanggal: '2026-10-10',
    status: 'ditolak',
    statusLabel: 'Ditolak',
    catatan: 'Permintaan dibatalkan atas permintaan pemohon karena penyesuaian anggaran tahunan.',
  },
  {
    id: 'ord-22',
    nomor: 'QT/2026/10/0001',
    customerId: 'CUST-001',
    customerNama: 'PT Nusantara Geospasial',
    contact: 'Raka Pradipta',
    telepon: '0812-3456-7890',
    detail: '2x Lumen 5 Pro',
    items: [{ nama: 'Lumen 5 Pro Standard Unit', qty: 2, harga: 42900000, subtotal: 42900000 }],
    total: 42900000,
    actionGroup: 'tidak_aktif',
    tanggal: '2026-10-01',
    status: 'kedaluwarsa',
    statusLabel: 'Kedaluwarsa',
    catatan: 'Masa berlaku penawaran harga 14 hari telah habis tanpa konfirmasi penerbitan PO.',
  },
];

export const INITIAL_ACTIVITY_LOG = [
  {
    id: 'act-1',
    timestamp: '11 Nov 2026, 11:45 WIB',
    user: 'Admin',
    action: 'Menerbitkan penawaran',
    detail: 'Draf QT/2026/11/0014 untuk CV Tani Makmur Sejahtera siap dikonfirmasi',
    type: 'quote',
  },
  {
    id: 'act-2',
    timestamp: '11 Nov 2026, 09:30 WIB',
    user: 'Finance System',
    action: 'Notifikasi pembayaran masuk',
    detail: 'Verifikasi pelunasan QT/2026/11/0007 (PT Nusantara Geospasial) Rp 160.200.000',
    type: 'payment',
  },
  {
    id: 'act-3',
    timestamp: '10 Nov 2026, 16:15 WIB',
    user: 'Gudang Damaco',
    action: 'Packing selesai',
    detail: 'QT/2026/11/0018 untuk PT Cakra Survei Utama siap dikirim',
    type: 'shipping',
  },
  {
    id: 'act-4',
    timestamp: '10 Nov 2026, 14:00 WIB',
    user: 'Admin',
    action: 'Membuat pesanan baru',
    detail: 'Pesanan QT/2026/11/0019 untuk PT Samudra Visual Media',
    type: 'order',
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-adm-1',
    title: 'Penawaran Menunggu Penerbitan',
    desc: 'PT Nusantara Geospasial menunggu penerbitan dokumen penawaran harga resmi untuk QT/2026/11/0021.',
    time: '10 menit lalu',
    orderNomor: 'QT/2026/11/0021',
    type: 'urgent',
    targetRole: 'admin',
    read: false,
  },
  {
    id: 'notif-adm-2',
    title: 'Verifikasi Pembayaran Masuk',
    desc: 'SP2D Dinas Pertanian Kab. Malang senilai Rp 427.050.000 menunggu konfirmasi Admin.',
    time: '35 menit lalu',
    orderNomor: 'QT/2026/11/0017',
    type: 'info',
    targetRole: 'admin',
    read: false,
  },
  {
    id: 'notif-adm-3',
    title: 'Gudang Siap Kirim Barang',
    desc: 'Paket Starter Pack Survei Atlas untuk PT Cakra Survei Utama telah dikemas siap berangkat.',
    time: '1 jam lalu',
    orderNomor: 'QT/2026/11/0018',
    type: 'shipping',
    targetRole: 'admin',
    read: false,
  },
  {
    id: 'notif-cust-1',
    title: 'Penawaran Resmi Diterbitkan',
    desc: 'Penawaran harga untuk QT/2026/11/0010 telah diterbitkan. Silakan periksa dokumen dan terbitkan PO.',
    time: 'Hari ini, 10:15 WIB',
    orderNomor: 'QT/2026/11/0010',
    type: 'urgent',
    targetRole: 'customer',
    read: false,
  },
  {
    id: 'notif-cust-2',
    title: 'Stok Baru Tiba di Cikarang',
    desc: '11 unit Atlas M4 RTK siap kirim dari gudang pusat Cikarang.',
    time: 'Hari ini, 09:30 WIB',
    type: 'info',
    targetRole: 'customer',
    read: false,
  },
  {
    id: 'notif-cust-3',
    title: 'Update Garansi & Asuransi',
    desc: 'Paket pemeliharaan & kalibrasi tahunan kini termasuk garansi proteksi jatuh.',
    time: 'Kemarin, 16:45 WIB',
    type: 'info',
    targetRole: 'customer',
    read: false,
  },
];

export const mapOrderToCustomerView = (order) => {
  if (!order) return null;

  let statusType = 'menunggu_penawaran';
  let statusText = 'Menunggu Penawaran';
  let isGiliranAnda = false;
  let tabCategory = 'berjalan';
  let actionPrompt = null;
  let keterangan = order.catatan || order.keterangan || 'Pesanan dalam proses operasional Damaco.';

  // Map from order.actionGroup and order.status
  switch (order.actionGroup) {
    case 'terbitkan_penawaran':
      statusType = 'menunggu_penawaran';
      statusText = 'Menunggu Penawaran';
      isGiliranAnda = false;
      tabCategory = 'berjalan';
      keterangan = 'Tim Commercial Damaco sedang memverifikasi spesifikasi teknis dan ketersediaan unit di gudang pusat Cikarang.';
      break;

    case 'input_po':
      statusType = 'penawaran_terbit';
      statusText = 'Penawaran Terbit';
      isGiliranAnda = true;
      actionPrompt = 'Setujui Penawaran & Input Nomor PO Resmi';
      tabCategory = 'perlu_tindakan';
      keterangan = 'Dokumen penawaran harga resmi (Quotation) telah diterbitkan. Silakan tinjau dan terbitkan PO resmi perusahaan Anda.';
      break;

    case 'urus_dealer':
      statusType = 'po_diterima';
      statusText = 'PO Diterima';
      isGiliranAnda = false;
      tabCategory = 'berjalan';
      keterangan = `PO resmi ${order.poNumber || order.nomorPo || 'PO-NG/1112/2026'} telah diterima sistem Damaco dan sedang diproses verifikasi keabsahan dokumen.`;
      break;

    case 'buat_invoice':
      statusType = 'proses_dealer';
      statusText = 'Proses Dealer';
      isGiliranAnda = false;
      tabCategory = 'berjalan';
      keterangan = 'Alokasi nomor seri unit drone dan kalibrasi sensor sedang dikerjakan authorized dealer Damaco.';
      break;

    case 'tandai_lunas':
      statusType = 'menunggu_pembayaran';
      statusText = 'Menunggu Pembayaran';
      isGiliranAnda = true;
      actionPrompt = 'Unggah Bukti Transfer / Pembayaran';
      tabCategory = 'perlu_tindakan';
      keterangan = `Invoice resmi ${order.invoiceNomor || 'INV/2026/11/0007'} telah terbit. Silakan lakukan pembayaran ke rekening Bank Mandiri PT Damaco Teknologi Presisi.`;
      break;

    case 'kirim_barang':
      statusType = 'lunas';
      statusText = 'Lunas';
      isGiliranAnda = false;
      tabCategory = 'berjalan';
      keterangan = 'Pembayaran telah terverifikasi Lunas. Unit drone sedang disiapkan di bagian packing & ekspedisi Damaco.';
      break;

    case 'tutup_transaksi':
    case 'dalam_pengiriman_berjalan':
      statusType = 'dalam_pengiriman';
      statusText = 'Dalam Pengiriman';
      isGiliranAnda = true;
      actionPrompt = 'Konfirmasi Penerimaan Barang';
      tabCategory = 'perlu_tindakan';
      keterangan = `Paket telah keluar dari gudang dan sedang dalam perjalanan ekspedisi ${order.ekspedisi || 'Damaco Secure Fleet (Driver: Pak Joko)'}. No. Resi: ${order.noResi || 'DMC-EXP-20261111-21'}.`;
      break;

    case 'selesai':
      statusType = 'selesai';
      statusText = 'Selesai';
      isGiliranAnda = false;
      tabCategory = 'selesai';
      keterangan = 'Seluruh proses administrasi, pengiriman, pembayaran, dan garansi resmi telah aktif penuh.';
      break;

    case 'dibekukan':
      statusType = 'dibekukan';
      statusText = 'Dibekukan';
      isGiliranAnda = false;
      actionPrompt = null;
      tabCategory = 'tidak_aktif';
      keterangan = 'Pesanan ini dibekukan secara permanen karena akun customer telah dihapus. Transaksi tidak dapat dilanjutkan.';
      break;

    default:
      if (order.status === 'penawaran_terbit') {
        statusType = 'penawaran_terbit';
        statusText = 'Penawaran Terbit';
        isGiliranAnda = true;
        actionPrompt = 'Setujui Penawaran & Input Nomor PO Resmi';
        tabCategory = 'perlu_tindakan';
      } else if (order.status === 'po_diterima') {
        statusType = 'po_diterima';
        statusText = 'PO Diterima';
        tabCategory = 'berjalan';
      } else if (order.status === 'ditolak') {
        statusType = 'ditolak';
        statusText = 'Ditolak';
        tabCategory = 'tidak_aktif';
      } else if (order.status === 'kedaluwarsa') {
        statusType = 'kedaluwarsa';
        statusText = 'Kedaluwarsa';
        tabCategory = 'tidak_aktif';
      } else if (order.status === 'dibatalkan') {
        statusType = 'dibatalkan';
        statusText = 'Dibatalkan';
        tabCategory = 'tidak_aktif';
      }
      break;
  }

  // Format date if needed
  let displayDate = order.tanggal || '11 Nov 2026';
  if (displayDate.includes('-') && displayDate.length === 10) {
    const parts = displayDate.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const mIdx = parseInt(parts[1], 10) - 1;
    displayDate = `${parseInt(parts[2], 10)} ${months[mIdx] || 'Nov'} ${parts[0]}`;
  }

  const items = order.items && order.items.length > 0 ? order.items : [
    { nama: order.detail || 'Drone Unit Damaco', qty: 1, harga: order.total || 0, subtotal: order.total || 0 }
  ];

  return {
    ...order,
    tanggal: displayDate,
    items,
    ringkasan: order.ringkasan || order.detail || items.map(i => `${i.qty}× ${i.nama}`).join(', '),
    statusType,
    statusText,
    isGiliranAnda,
    tabCategory,
    actionPrompt,
    keterangan,
    nomorPo: order.poNumber || order.nomorPo,
  };
};

export const DamacoProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;

  const userCartKey = useMemo(() => {
    const email = (user?.email || '').toLowerCase().trim();
    return email ? `damaco_cart_user_${email}` : 'damaco_cart_guest';
  }, [user]);

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('damaco_orders_v6');
    const baseOrders = saved ? JSON.parse(saved) : INITIAL_ORDERS;
    try {
      const savedCusts = JSON.parse(localStorage.getItem('damaco_customers_v3') || '[]');
      const activeNames = new Set(savedCusts.map(c => (c.nama || '').toLowerCase().trim()));
      const activeEmails = new Set(savedCusts.map(c => (c.email || '').toLowerCase().trim()));
      const frozenSet = new Set(JSON.parse(localStorage.getItem('damaco_frozen_orders_v1') || '[]'));

      return baseOrders.map(o => {
        const cName = (o.customerNama || '').toLowerCase().trim();
        const cEmail = (o.email || '').toLowerCase().trim();
        const isMissing = cName && savedCusts.length > 0 && !activeNames.has(cName) && (!cEmail || !activeEmails.has(cEmail));

        if (isMissing || frozenSet.has(o.id) || frozenSet.has(o.nomor) || o.isFrozen || o.actionGroup === 'dibekukan') {
          return {
            ...o,
            actionGroup: 'dibekukan',
            status: 'dibekukan',
            statusLabel: 'Dibekukan',
            isFrozen: true,
            catatan: o.catatan || 'Pesanan dibekukan karena customer tidak ditemukan atau telah dihapus.',
          };
        }
        return o;
      });
    } catch {
      return baseOrders;
    }
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('damaco_customers_v3');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('damaco_products_v3');
    const raw = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    return raw.map(p => ({
      ...p,
      harga: Number(p.harga || p.sell_price || 0),
      sell_price: Number(p.sell_price || p.harga || 0),
      buy_price: Number(p.buy_price || 0),
      hargaBeli: Number(p.hargaBeli || p.buy_price || 0),
      stok: Number(p.stok ?? p.stock ?? 0),
    }));
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('damaco_activity_v4');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOG;
  });

  // Quotation Request Cart ("Permintaan") - Scoped per user account
  const [permintaanCart, setPermintaanCart] = useState(() => {
    // Bersihkan residu cart guest dari localStorage agar web saat default dibuka selalu bersih
    try {
      localStorage.removeItem('damaco_cart_guest');
      localStorage.removeItem('damaco_cart_v3');
    } catch {}

    if (!user) return [];

    try {
      const email = (user.email || '').toLowerCase().trim();
      const saved = localStorage.getItem(`damaco_cart_user_${email}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Switch cart when user logs in / out
  useEffect(() => {
    if (!user) {
      setPermintaanCart([]);
      try {
        localStorage.removeItem('damaco_cart_guest');
        localStorage.removeItem('damaco_cart_v3');
      } catch {}
      return;
    }
    try {
      const email = (user.email || '').toLowerCase().trim();
      const saved = localStorage.getItem(`damaco_cart_user_${email}`);
      setPermintaanCart(saved ? JSON.parse(saved) : []);
    } catch {
      setPermintaanCart([]);
    }
  }, [user]);

  // Compare tray
  const [compareList, setCompareList] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Modals & drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isPesananSayaOpen, setIsPesananSayaOpen] = useState(false);
  const [isProfilPerusahaanOpen, setIsProfilPerusahaanOpen] = useState(false);

  // Unread customer orders state (for notification badge on Pesanan Saya)
  const [customerUnreadOrderIds, setCustomerUnreadOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('damaco_customer_unread_orders_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('damaco_customer_unread_orders_v1', JSON.stringify(customerUnreadOrderIds));
    } catch {}
  }, [customerUnreadOrderIds]);

  const markCustomerOrdersAsRead = (orderId = null) => {
    if (!orderId) {
      setCustomerUnreadOrderIds([]);
    } else {
      setCustomerUnreadOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  // Admin Modals
  const [selectedOrderForCustomerView, setSelectedOrderForCustomerView] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isStyleGuideOpen, setIsStyleGuideOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [modalActionOrder, setModalActionOrder] = useState(null);
  const [activeActionModalType, setActiveActionModalType] = useState(null);

  // Dynamic system notifications for both Admin and Customer
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('damaco_notifications_v3');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('damaco_orders_v6', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('damaco_customers_v3', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('damaco_products_v3', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('damaco_activity_v4', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    if (!user) {
      try {
        localStorage.removeItem('damaco_cart_guest');
        localStorage.removeItem('damaco_cart_v3');
      } catch {}
      return;
    }
    try {
      const email = (user.email || '').toLowerCase().trim();
      localStorage.setItem(`damaco_cart_user_${email}`, JSON.stringify(permintaanCart));
    } catch {}
  }, [user, permintaanCart]);

  useEffect(() => {
    localStorage.setItem('damaco_notifications_v3', JSON.stringify(notifications));
  }, [notifications]);

  // Persist order update to MySQL database penjualan_db
  const persistOrderToDb = (order) => {
    if (!order) return;
    damacoService.saveOrder(order).catch((err) => {
      console.warn('Sync to MySQL warning:', err?.message);
    });
  };

  // Hydrate data from MySQL database penjualan_db
  const syncWithDatabase = async (silent = false) => {
    try {
      const res = await damacoService.getSyncData();
      if (res?.data?.success && res.data.data) {
        const { products: dbProducts, orders: dbOrders, customers: dbCustomers, notifications: dbNotifs } = res.data.data;
        
        if (dbProducts && dbProducts.length > 0) {
          setProducts(prev => {
            const dbMap = new Map(dbProducts.map(p => [p.kode || p.sku || String(p.id), p]));
            return prev.map(p => {
              const matched = dbMap.get(p.kode) || dbMap.get(String(p.id));
              return matched ? { ...p, ...matched } : p;
            });
          });
        }

        if (dbOrders && dbOrders.length > 0) {
          const frozenSet = new Set(JSON.parse(localStorage.getItem('damaco_frozen_orders_v1') || '[]'));
          const activeCustomerNames = new Set((dbCustomers || []).map(c => (c.perusahaan || c.nama || '').toLowerCase().trim()));
          const activeCustomerEmails = new Set((dbCustomers || []).map(c => (c.email || '').toLowerCase().trim()));

          setOrders(dbOrders.map(o => {
            const ordCustName = (o.customerNama || o.customer_nama || '').toLowerCase().trim();
            const ordCustEmail = (o.email || '').toLowerCase().trim();
            const isCustMissing = ordCustName && !activeCustomerNames.has(ordCustName) && (!ordCustEmail || !activeCustomerEmails.has(ordCustEmail));

            if (frozenSet.has(o.id) || frozenSet.has(o.nomor) || o.isFrozen || o.actionGroup === 'dibekukan' || isCustMissing) {
              return {
                ...o,
                actionGroup: 'dibekukan',
                status: 'dibekukan',
                statusLabel: 'Dibekukan',
                isFrozen: true,
                catatan: o.catatan || 'Pesanan dibekukan karena customer tidak ditemukan atau telah dihapus.',
              };
            }

            const hasPo = Boolean(o.nomorPo || o.po_number || o.poNumber);
            const isPenawaranTerbit = o.isPenawaranTerbit ?? (o.actionGroup !== 'terbitkan_penawaran' && o.status !== 'draft_penawaran' && o.status !== 'menunggu_penawaran');

            return {
              ...o,
              isPenawaranTerbit,
              poNumber: hasPo ? (o.nomorPo || o.po_number || o.poNumber) : null,
              nomorPo: hasPo ? (o.nomorPo || o.po_number || o.poNumber) : null,
            };
          }));
        }

        if (dbCustomers && dbCustomers.length > 0) {
          setCustomers(dbCustomers.map(dc => {
            const custEmail = (dc.email || '').toLowerCase().trim();
            const custComp = (dc.perusahaan || dc.nama || '').toLowerCase().trim();
            const related = (dbOrders || []).filter(o => {
              const oEmail = (o.email || '').toLowerCase().trim();
              const oComp = (o.customerNama || '').toLowerCase().trim();
              return (custEmail && oEmail === custEmail) || (custComp && oComp === custComp);
            });
            return {
              id: `CUST-00${dc.id}`,
              nama: dc.perusahaan || dc.nama,
              contact: dc.nama,
              email: dc.email,
              telepon: dc.telepon,
              alamat: dc.alamat || 'Kantor Operasional Customer',
              npwp: dc.npwp || '01.234.567.8-012.000',
              totalPesanan: related.length,
              totalNilai: related.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
            };
          }));
        }

        if (dbNotifs && dbNotifs.length > 0) {
          setNotifications(dbNotifs);
        }
        if (!silent) {
          toast.success('Data tersinkronisasi dengan database penjualan_db! 🔄');
        }
      }
    } catch (err) {
      if (!silent) {
        console.warn('Database backend belum aktif, menggunakan penyimpanan lokal:', err?.message);
      }
    }
  };

  useEffect(() => {
    syncWithDatabase(true);
  }, []);

  // Broadcast helper for real-time cross-tab synchronization
  const broadcastSync = (type, data) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('damaco_sync_channel');
        bc.postMessage({ type, data });
        bc.close();
      } catch (e) {
        // BroadcastChannel fallback
      }
    }
  };

  // Cross-tab real-time sync with BroadcastChannel and storage events
  useEffect(() => {
    let channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('damaco_sync_channel');
        channel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type === 'PENAWARAN_TERBIT' && data) {
            // Customer tab received real-time notification that quotation was published
            toast.success(
              `📄 Penawaran resmi ${data.orderNomor} telah diterbitkan oleh Admin! Periksa di Pesanan Saya.`,
              {
                duration: 800,
                icon: '📄',
                style: {
                  borderRadius: '10px',
                  background: '#18251F',
                  color: '#fff',
                },
              }
            );
            const savedOrders = localStorage.getItem('damaco_orders_v6');
            if (savedOrders) setOrders(JSON.parse(savedOrders));
            const savedNotifs = localStorage.getItem('damaco_notifications_v3');
            if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
          } else if (type === 'QUOTATION_SUBMITTED' && data) {
            const savedOrders = localStorage.getItem('damaco_orders_v6');
            if (savedOrders) setOrders(JSON.parse(savedOrders));
            const savedNotifs = localStorage.getItem('damaco_notifications_v3');
            if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
          } else if (type === 'SYNC_ALL') {
            const savedOrders = localStorage.getItem('damaco_orders_v6');
            if (savedOrders) setOrders(JSON.parse(savedOrders));
            const savedNotifs = localStorage.getItem('damaco_notifications_v3');
            if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    const handleStorage = (e) => {
      if (!e.key) return;
      try {
        if (e.key === 'damaco_orders_v6' && e.newValue) {
          setOrders(JSON.parse(e.newValue));
        }
        if (e.key === 'damaco_notifications_v3' && e.newValue) {
          setNotifications(JSON.parse(e.newValue));
        }
        if (e.key === 'damaco_cart_v3' && e.newValue) {
          setPermintaanCart(JSON.parse(e.newValue));
        }
        if (e.key === 'damaco_customers_v3' && e.newValue) {
          setCustomers(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  const addNotification = ({ title, desc, time = 'Baru saja', orderNomor = null, type = 'info', targetRole = 'admin', targetEmail = null }) => {
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title,
      desc,
      time,
      orderNomor,
      type,
      targetRole,
      targetEmail,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = (role) => {
    setNotifications(prev => prev.map(n => (!role || n.targetRole === role) ? { ...n, read: true } : n));
  };

  const addActivity = (action, detail, type = 'info') => {
    const now = new Date();
    const timeStr = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const newLog = {
      id: 'act-' + Date.now(),
      timestamp: timeStr,
      user: auth.user?.nama || 'Admin',
      action,
      detail,
      type,
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Cart operations
  const addToPermintaanCart = (product, qty = 1) => {
    if (!product) return;
    setPermintaanCart(prev => {
      const existingIndex = prev.findIndex(item => String(item.product.id) === String(product.id));
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], qty: next[existingIndex].qty + qty };
        return next;
      }
      return [...prev, { product, qty }];
    });
    toast.success(`${product.nama} ditambahkan ke daftar Permintaan! 🛒`, {
      style: { border: '1px solid #286845', color: '#18251F' },
      iconTheme: { primary: '#286845', secondary: '#fff' },
    });
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setPermintaanCart(prev => prev.map(item => String(item.product.id) === String(productId) ? { ...item, qty: newQty } : item));
  };

  const removeFromCart = (productId) => {
    setPermintaanCart(prev => prev.filter(item => String(item.product.id) !== String(productId)));
    toast('Item dihapus dari daftar permintaan.', { icon: '🗑️' });
  };

  const clearCart = () => {
    setPermintaanCart([]);
  };

  // Compare operations
  const toggleCompare = (product) => {
    if (!product) return;
    setCompareList(prev => {
      const exists = prev.find(p => String(p.id) === String(product.id));
      if (exists) {
        toast(`Batal membandingkan ${product.nama}`, { icon: 'ℹ️' });
        return prev.filter(p => String(p.id) !== String(product.id));
      }
      if (prev.length >= 3) {
        toast.error('Maksimal 3 produk untuk dibandingkan sekaligus');
        return prev;
      }
      toast.success(`${product.nama} ditambahkan ke perbandingan! ⚖️`, {
        iconTheme: { primary: '#286845', secondary: '#fff' },
      });
      return [...prev, product];
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    setIsCompareOpen(false);
  };

  // Update customer address in state, orders, and storage
  const updateCustomerAddress = (userEmail, newAddress, companyName) => {
    if (!newAddress) return;
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    const cleanComp = (companyName || '').toLowerCase().trim();

    // 1. Update in customers state
    setCustomers(prev => {
      const next = prev.map(c => {
        const cEmail = (c.email || '').toLowerCase().trim();
        const cNama = (c.nama || '').toLowerCase().trim();
        if ((cleanEmail && cEmail === cleanEmail) || (cleanComp && cNama === cleanComp)) {
          return { ...c, alamat: newAddress };
        }
        return c;
      });
      localStorage.setItem('damaco_customers_v3', JSON.stringify(next));
      return next;
    });

    // 2. Update in all orders for this customer
    setOrders(prev => {
      const next = prev.map(o => {
        const oEmail = (o.email || '').toLowerCase().trim();
        const oNama = (o.customerNama || '').toLowerCase().trim();
        if ((cleanEmail && oEmail === cleanEmail) || (cleanComp && oNama === cleanComp)) {
          return { ...o, alamat: newAddress, alamatPengiriman: newAddress };
        }
        return o;
      });
      localStorage.setItem('damaco_orders_v6', JSON.stringify(next));
      return next;
    });
  };

  // Customer submits quotation request
  const handleCustomerSubmitQuotation = ({ companyName, contactName, email, phone, notes, alamat }) => {
    if (permintaanCart.length === 0) {
      toast.error('Keranjang permintaan masih kosong');
      return;
    }

    const newId = 'ord-' + Date.now();
    const count = orders.length + 1;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const orderNomor = `QT/${year}/${month}/${String(count).padStart(4, '0')}`;

    const items = permintaanCart.map(i => ({
      nama: i.product.nama,
      qty: i.qty,
      harga: i.product.harga,
      hargaBeli: Math.round(i.product.harga * 0.88),
      margin: '12%',
      subtotal: i.qty * i.product.harga,
    }));

    const total = items.reduce((sum, it) => sum + it.subtotal, 0);

    const matchedCust = customers.find(c =>
      (c.nama && c.nama.toLowerCase() === (companyName || '').toLowerCase()) ||
      (c.email && c.email.toLowerCase() === (email || '').toLowerCase())
    );
    const customerId = matchedCust?.id || ('CUST-' + String(customers.length + 1).padStart(3, '0'));

    // Alamat pengiriman resmi dari profil customer
    const finalAlamat = (
      alamat ||
      matchedCust?.alamat ||
      'Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan 12430'
    ).trim();

    const newOrder = {
      id: newId,
      nomor: orderNomor,
      customerId,
      customerNama: companyName || 'Perusahaan B2B',
      contact: contactName || 'PIC',
      telepon: phone || '0812-3456-7890',
      email: email || '',
      npwp: matchedCust?.npwp || '01.234.567.8-012.000',
      alamat: finalAlamat,
      alamatPengiriman: finalAlamat,
      ekspedisi: 'Damaco Secure Fleet (Driver: Pak Joko - 0812-9988-1122)',
      noResi: `DMC-EXP-${year}${month}${String(count).padStart(2, '0')}-01`,
      detail: items.map(i => `${i.qty}x ${i.nama}`).join(', '),
      items,
      total,
      estimasiMarginKotor: Math.round(total * 0.12),
      actionGroup: 'terbitkan_penawaran',
      tanggal: new Date().toISOString().split('T')[0],
      status: 'draft_penawaran',
      statusLabel: 'Menunggu Penawaran',
      isPenawaranTerbit: false,
      nomorPenawaran: null,
      catatan: `Permintaan via Katalog Online oleh ${contactName || 'PIC'} (${phone || '-'}). Catatan: ${notes || 'Kebutuhan segera'}`,
    };

    setOrders(prev => [newOrder, ...prev]);
    persistOrderToDb(newOrder);

    // Update or add customer record
    if (matchedCust) {
      setCustomers(prev => prev.map(c => c.id === matchedCust.id ? {
        ...c,
        alamat: finalAlamat,
        totalPesanan: (c.totalPesanan || 0) + 1,
        totalNilai: (c.totalNilai || 0) + total,
      } : c));
    } else {
      const newCustomerRecord = {
        id: customerId,
        nama: newOrder.customerNama,
        contact: newOrder.contact,
        email: newOrder.email,
        telepon: newOrder.telepon,
        alamat: finalAlamat,
        totalPesanan: 1,
        totalNilai: total,
      };
      setCustomers(prev => [...prev, newCustomerRecord]);
    }

    addActivity('Permintaan Penawaran Baru', `Klien ${newOrder.customerNama} meminta penawaran untuk ${items.length} jenis produk (${orderNomor})`, 'quote');

    // Notify Admin
    addNotification({
      title: 'Permintaan Penawaran Baru',
      desc: `${newOrder.customerNama} mengajukan penawaran untuk ${newOrder.detail} (${orderNomor})`,
      time: 'Baru saja',
      orderNomor: orderNomor,
      type: 'urgent',
      targetRole: 'admin',
    });

    // Notify Customer
    addNotification({
      title: `Permintaan Penawaran Terkirim (${orderNomor})`,
      desc: `Permintaan penawaran harga Anda sedang diproses oleh Tim Commercial Damaco.`,
      time: 'Baru saja',
      orderNomor: orderNomor,
      type: 'info',
      targetRole: 'customer',
      targetEmail: newOrder.email,
    });

    // Mark as unread for Customer so badge on "Pesanan Saya" increases
    setCustomerUnreadOrderIds(prev => Array.from(new Set([...prev, orderNomor])));

    clearCart();
    setIsCartOpen(false);
    toast.success(`Permintaan penawaran (${orderNomor}) berhasil dikirim! Tim Damaco akan segera menghubungi Anda. 📄✨`, {
      duration: 800,
      iconTheme: { primary: '#286845', secondary: '#fff' },
    });

    // Broadcast cross-tab so Admin tabs immediately update their dashboard & orders table
    broadcastSync('QUOTATION_SUBMITTED', { orderNomor, customerNama: newOrder.customerNama });
  };

  // Quick look detail
  const openProductDetail = (product) => {
    setSelectedProductDetail(product);
    setIsProductDetailOpen(true);
  };

  // Helper to verify if an order's customer exists or if order is frozen
  const isOrderCustomerMissingOrFrozen = (ord) => {
    if (!ord) return false;
    if (ord.isFrozen || ord.actionGroup === 'dibekukan' || ord.status === 'dibekukan') return true;

    // Check against active customers list
    const cName = (ord.customerNama || '').toLowerCase().trim();
    const cEmail = (ord.email || '').toLowerCase().trim();
    const hasNameMatch = customers.some(c => (c.nama || '').toLowerCase().trim() === cName);
    const hasEmailMatch = cEmail ? customers.some(c => (c.email || '').toLowerCase().trim() === cEmail) : false;

    if (!hasNameMatch && !hasEmailMatch) {
      return true;
    }
    return false;
  };

  // 1. Terbitkan Penawaran -> Moves to input_po
  const handleTerbitkanPenawaran = (orderId, options = {}) => {
    const existing = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (isOrderCustomerMissingOrFrozen(existing)) {
      toast.error('Gagal memproses: Customer pesanan ini tidak ditemukan atau telah dihapus. Transaksi dibekukan.', {
        icon: '🔒',
        duration: 800,
      });
      return;
    }
    let targetOrder = null;

    setOrders(prev => {
      const next = prev.map(ord => {
        if (ord.id === orderId || ord.nomor === orderId) {
          targetOrder = {
            ...ord,
            actionGroup: 'input_po',
            status: 'penawaran_terbit',
            statusLabel: 'Penawaran Terbit',
            isPenawaranTerbit: true,
            nomorPenawaran: options.nomorPenawaran || ord.nomor,
            tanggalPenawaran: new Date().toISOString().split('T')[0],
            masaBerlaku: options.masaBerlaku || '14 Hari Kerja',
            metodePengiriman: options.metodePengiriman || 'Damaco Direct Secure Courier + Asuransi Transit Penuh',
            syaratPembayaran: options.syaratPembayaran || 'Bank Mandiri Transfer (100% Full Payment sebelum kirim)',
            catatanPenawaran: options.catatan || 'Penawaran harga resmi telah disetujui Commercial Operations Lead.',
            poNumber: null,
            nomorPo: null,
          };
          return targetOrder;
        }
        return ord;
      });
      localStorage.setItem('damaco_orders_v6', JSON.stringify(next));
      return next;
    });

    // Fallback if not found in current closure
    if (!targetOrder) {
      try {
        const stored = JSON.parse(localStorage.getItem('damaco_orders_v6') || '[]');
        targetOrder = stored.find(o => o.id === orderId || o.nomor === orderId);
      } catch (e) {}
    }

    if (targetOrder) {
      persistOrderToDb(targetOrder);
    }

    const orderNomor = targetOrder?.nomor || orderId;
    const custNama = targetOrder?.customerNama || 'Customer';

    setSelectedOrderForCustomerView(prev => {
      if (prev && (prev.id === orderId || prev.nomor === orderId)) {
        return {
          ...prev,
          actionGroup: 'input_po',
          status: 'penawaran_terbit',
          statusLabel: 'Penawaran Terbit',
          isPenawaranTerbit: true,
          nomorPenawaran: options.nomorPenawaran || prev.nomor,
          tanggalPenawaran: new Date().toISOString().split('T')[0],
          masaBerlaku: options.masaBerlaku || '14 Hari Kerja',
          metodePengiriman: options.metodePengiriman || 'Damaco Direct Secure Courier + Asuransi Transit Penuh',
          syaratPembayaran: options.syaratPembayaran || 'Bank Mandiri Transfer (100% Full Payment sebelum kirim)',
          catatanPenawaran: options.catatan || 'Penawaran harga resmi telah disetujui Commercial Operations Lead.',
          poNumber: null,
          nomorPo: null,
        };
      }
      return prev;
    });

    toast.success(`Surat Penawaran ${orderNomor} untuk ${custNama} resmi diterbitkan! 📄`, {
      duration: 800,
    });
    addActivity('Menerbitkan Penawaran', `Surat penawaran resmi ${orderNomor} berhasil diterbitkan ke ${custNama}`, 'quote');

    // Notify Customer with urgent notification
    const notifPayload = {
      title: `Penawaran Harga Resmi Terbit`,
      desc: `Penawaran resmi untuk ${orderNomor} telah diterbitkan oleh Admin. Silakan periksa dokumen dan terbitkan PO resmi perusahaan Anda.`,
      time: 'Baru saja',
      orderNomor: orderNomor,
      type: 'urgent',
      targetRole: 'customer',
      targetEmail: targetOrder?.email || null,
    };
    addNotification(notifPayload);

    // Broadcast to customer tabs & windows in real-time
    broadcastSync('PENAWARAN_TERBIT', { orderNomor, customerNama: custNama, targetEmail: targetOrder?.email || null });
  };

  // 2. Input PO -> Moves to urus_dealer
  const handleInputPO = (orderId, poNumber = '') => {
    const existing = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (isOrderCustomerMissingOrFrozen(existing)) {
      toast.error('Gagal memproses: Customer pesanan ini tidak ditemukan atau telah dihapus. Transaksi dibekukan.', {
        icon: '🔒',
        duration: 800,
      });
      return;
    }
    const finalPO = poNumber || `PO-CUST-${Date.now().toString().slice(-6)}`;
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId || ord.nomor === orderId) {
        return {
          ...ord,
          actionGroup: 'urus_dealer',
          status: 'koordinasi_dealer',
          statusLabel: 'Urus Dealer',
          poNumber: finalPO,
          nomorPo: finalPO,
        };
      }
      return ord;
    }));

    setSelectedOrderForCustomerView(prev => {
      if (prev && (prev.id === orderId || prev.nomor === orderId)) {
        return {
          ...prev,
          actionGroup: 'urus_dealer',
          status: 'koordinasi_dealer',
          statusLabel: 'Urus Dealer',
          poNumber: finalPO,
          nomorPo: finalPO,
        };
      }
      return prev;
    });

    const targetOrder = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (targetOrder) {
      persistOrderToDb({
        ...targetOrder,
        actionGroup: 'urus_dealer',
        status: 'koordinasi_dealer',
        statusLabel: 'Urus Dealer',
        poNumber: finalPO,
        nomorPo: finalPO,
      });
      toast.success(`Nomor PO "${finalPO}" untuk ${targetOrder.nomor} berhasil diinput! 📝`, {
        duration: 800,
      });
      addActivity('Input PO Customer', `PO resmi ${finalPO} dicatat untuk pesanan ${targetOrder.nomor}`, 'order');

      addNotification({
        title: `PO Dikonfirmasi (${targetOrder.nomor})`,
        desc: `PO resmi ${finalPO} telah diverifikasi sistem dan diteruskan ke dealer resmi.`,
        time: 'Baru saja',
        orderNomor: targetOrder.nomor,
        type: 'info',
        targetRole: 'customer',
        targetEmail: targetOrder.email,
      });
    }
    setActiveActionModalType(null);
  };

  // 3. Urus Dealer -> Moves to buat_invoice
  const handleUrusDealer = (orderId, dealerNote = 'Damaco Authorized Partner Hub Jakarta (Unit Alokasi Ready)') => {
    const existing = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (isOrderCustomerMissingOrFrozen(existing)) {
      toast.error('Gagal memproses: Customer pesanan ini tidak ditemukan atau telah dihapus. Transaksi dibekukan.', {
        icon: '🔒',
        duration: 800,
      });
      return;
    }
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId || ord.nomor === orderId) {
        return {
          ...ord,
          actionGroup: 'buat_invoice',
          status: 'siap_invoice',
          statusLabel: 'Siap Buat Invoice',
          dealerNote,
        };
      }
      return ord;
    }));

    setSelectedOrderForCustomerView(prev => {
      if (prev && (prev.id === orderId || prev.nomor === orderId)) {
        return {
          ...prev,
          actionGroup: 'buat_invoice',
          status: 'siap_invoice',
          statusLabel: 'Siap Buat Invoice',
          dealerNote,
        };
      }
      return prev;
    });

    const targetOrder = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (targetOrder) {
      persistOrderToDb({
        ...targetOrder,
        actionGroup: 'buat_invoice',
        status: 'siap_invoice',
        statusLabel: 'Siap Buat Invoice',
        dealerNote,
      });
      toast.success(`Alokasi dealer untuk ${targetOrder.nomor} berhasil disetujui! 🤝`, {
        duration: 800,
      });
      addActivity('Urus Dealer', `Koordinasi dealer (${dealerNote}) untuk ${targetOrder.nomor} selesai`, 'info');
    }
    setActiveActionModalType(null);
  };

  // 4. Buat Invoice -> Moves to tandai_lunas
  const handleBuatInvoice = (orderId) => {
    const existing = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (isOrderCustomerMissingOrFrozen(existing)) {
      toast.error('Gagal memproses: Customer pesanan ini tidak ditemukan atau telah dihapus. Transaksi dibekukan.', {
        icon: '🔒',
        duration: 800,
      });
      return;
    }
    const invNo = `INV/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Date.now().toString().slice(-4)}`;
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId || ord.nomor === orderId) {
        return {
          ...ord,
          actionGroup: 'tandai_lunas',
          status: 'menunggu_pembayaran',
          statusLabel: 'Menunggu Pembayaran',
          invoiceNomor: invNo,
        };
      }
      return ord;
    }));

    setSelectedOrderForCustomerView(prev => {
      if (prev && (prev.id === orderId || prev.nomor === orderId)) {
        return {
          ...prev,
          actionGroup: 'tandai_lunas',
          status: 'menunggu_pembayaran',
          statusLabel: 'Menunggu Pembayaran',
          invoiceNomor: invNo,
        };
      }
      return prev;
    });

    const targetOrder = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (targetOrder) {
      persistOrderToDb({
        ...targetOrder,
        actionGroup: 'tandai_lunas',
        status: 'menunggu_pembayaran',
        statusLabel: 'Menunggu Pembayaran',
        invoiceNomor: invNo,
      });
      toast.success(`Invoice resmi ${invNo} untuk ${targetOrder.nomor} berhasil diterbitkan! 🧾`, {
        duration: 800,
      });
      addActivity('Penerbitan Invoice', `Invoice ${invNo} diterbitkan ke ${targetOrder.customerNama}`, 'payment');

      // Notify Customer
      addNotification({
        title: `Invoice Tagihan Resmi Terbit`,
        desc: `Invoice tagihan resmi ${invNo} untuk pesanan ${targetOrder.nomor} telah diterbitkan. Silakan unggah bukti transfer.`,
        time: 'Baru saja',
        orderNomor: targetOrder.nomor,
        type: 'urgent',
        targetRole: 'customer',
        targetEmail: targetOrder.email,
      });
    }
  };

  // 5. Tandai Lunas -> Moves to kirim_barang
  const handleTandaiLunas = (orderId) => {
    const existing = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (isOrderCustomerMissingOrFrozen(existing)) {
      toast.error('Gagal memproses: Customer pesanan ini tidak ditemukan atau telah dihapus. Transaksi dibekukan.', {
        icon: '🔒',
        duration: 800,
      });
      return;
    }
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId || ord.nomor === orderId) {
        return {
          ...ord,
          actionGroup: 'kirim_barang',
          status: 'siap_dikirim',
          statusLabel: 'Siap Dikirim',
          paidAt: new Date().toISOString(),
        };
      }
      return ord;
    }));

    setSelectedOrderForCustomerView(prev => {
      if (prev && (prev.id === orderId || prev.nomor === orderId)) {
        return {
          ...prev,
          actionGroup: 'kirim_barang',
          status: 'siap_dikirim',
          statusLabel: 'Siap Dikirim',
          paidAt: new Date().toISOString(),
        };
      }
      return prev;
    });

    const targetOrder = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (targetOrder) {
      persistOrderToDb({
        ...targetOrder,
        actionGroup: 'kirim_barang',
        status: 'siap_dikirim',
        statusLabel: 'Siap Dikirim',
        paidAt: new Date().toISOString(),
      });
      toast.success(`Pembayaran ${targetOrder.nomor} berhasil diverifikasi Lunas! 💳`, {
        duration: 800,
      });
      addActivity('Verifikasi Pembayaran', `Pembayaran ${targetOrder.nomor} senilai Rp ${targetOrder.total.toLocaleString('id-ID')} ditandai Lunas`, 'payment');

      // Notify Customer
      addNotification({
        title: `Pembayaran Terverifikasi Lunas`,
        desc: `Pembayaran ${targetOrder.nomor} telah terverifikasi Lunas. Unit sedang dipersiapkan di divisi pengiriman.`,
        time: 'Baru saja',
        orderNomor: targetOrder.nomor,
        type: 'info',
        targetRole: 'customer',
        targetEmail: targetOrder.email,
      });
    }
  };

  // 6. Kirim Barang -> Moves to tutup_transaksi
  const handleKirimBarang = (orderId, ekspedisiInfo = 'Damaco Secure Fleet (Driver: Bpk. Joko - 0812-9988-1122)') => {
    const existing = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (isOrderCustomerMissingOrFrozen(existing)) {
      toast.error('Gagal memproses: Customer pesanan ini tidak ditemukan atau telah dihapus. Transaksi dibekukan.', {
        icon: '🔒',
        duration: 800,
      });
      return;
    }
    const noResi = `DMC-EXP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId || ord.nomor === orderId) {
        return {
          ...ord,
          actionGroup: 'tutup_transaksi',
          status: 'dalam_pengiriman',
          statusLabel: 'Dalam Pengiriman',
          ekspedisi: ekspedisiInfo,
          noResi,
          shippedAt: new Date().toISOString(),
        };
      }
      return ord;
    }));

    setSelectedOrderForCustomerView(prev => {
      if (prev && (prev.id === orderId || prev.nomor === orderId)) {
        return {
          ...prev,
          actionGroup: 'tutup_transaksi',
          status: 'dalam_pengiriman',
          statusLabel: 'Dalam Pengiriman',
          ekspedisi: ekspedisiInfo,
          noResi,
          shippedAt: new Date().toISOString(),
        };
      }
      return prev;
    });

    const targetOrder = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (targetOrder) {
      persistOrderToDb({
        ...targetOrder,
        actionGroup: 'tutup_transaksi',
        status: 'dalam_pengiriman',
        statusLabel: 'Dalam Pengiriman',
        ekspedisi: ekspedisiInfo,
        noResi,
        shippedAt: new Date().toISOString(),
      });
      toast.success(`Barang untuk ${targetOrder.nomor} sedang dikirim via ${ekspedisiInfo}! 🚚`, {
        duration: 800,
      });
      addActivity('Pengiriman Barang', `Pesanan ${targetOrder.nomor} dikirim via ${ekspedisiInfo} (Resi: ${noResi})`, 'shipping');

      // Notify Customer
      addNotification({
        title: `Pesanan Sedang Dikirim`,
        desc: `Unit pesanan ${targetOrder.nomor} telah keluar dari gudang via ${ekspedisiInfo} (No. Resi: ${noResi}). Mohon konfirmasi saat tiba.`,
        time: 'Baru saja',
        orderNomor: targetOrder.nomor,
        type: 'shipping',
        targetRole: 'customer',
        targetEmail: targetOrder.email,
      });
    }
  };

  // 7. Tutup Transaksi -> Selesai
  const handleTutupTransaksi = (orderId) => {
    const existing = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (isOrderCustomerMissingOrFrozen(existing)) {
      toast.error('Gagal memproses: Customer pesanan ini tidak ditemukan atau telah dihapus. Transaksi dibekukan.', {
        icon: '🔒',
        duration: 800,
      });
      return;
    }
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId || ord.nomor === orderId) {
        return {
          ...ord,
          actionGroup: 'selesai',
          status: 'selesai',
          statusLabel: 'Selesai',
          closedAt: new Date().toISOString(),
        };
      }
      return ord;
    }));

    setSelectedOrderForCustomerView(prev => {
      if (prev && (prev.id === orderId || prev.nomor === orderId)) {
        return {
          ...prev,
          actionGroup: 'selesai',
          status: 'selesai',
          statusLabel: 'Selesai',
          closedAt: new Date().toISOString(),
        };
      }
      return prev;
    });

    const targetOrder = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (targetOrder) {
      persistOrderToDb({
        ...targetOrder,
        actionGroup: 'selesai',
        status: 'selesai',
        statusLabel: 'Selesai',
        closedAt: new Date().toISOString(),
      });
      toast.success(`Transaksi ${targetOrder.nomor} resmi ditutup! 🎉`, {
        duration: 800,
      });
      addActivity('Tutup Transaksi', `Transaksi ${targetOrder.nomor} resmi selesai dan diarsipkan`, 'success');

      // Notify Customer
      addNotification({
        title: `Transaksi Selesai & Garansi Aktif`,
        desc: `Seluruh proses transaksi ${targetOrder.nomor} telah tuntas. Garansi resmi 2 tahun Damaco kini aktif penuh.`,
        time: 'Baru saja',
        orderNomor: targetOrder.nomor,
        type: 'info',
        targetRole: 'customer',
        targetEmail: targetOrder.email,
      });
    }
  };

  // Reject / Tolak Pesanan
  const handleTolakPesanan = (orderId, alasan = 'Permintaan dibatalkan karena penyesuaian kuota unit atau anggaran.') => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId || ord.nomor === orderId) {
        return {
          ...ord,
          actionGroup: 'tidak_aktif',
          status: 'ditolak',
          statusLabel: 'Ditolak',
          catatan: alasan,
        };
      }
      return ord;
    }));

    const targetOrder = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (targetOrder) {
      toast.error(`Pesanan ${targetOrder.nomor} telah ditolak.`);
      addActivity('Penolakan Pesanan', `Pesanan ${targetOrder.nomor} ditolak (${alasan})`, 'danger');

      // Notify Customer
      addNotification({
        title: `Penawaran Ditolak (${targetOrder.nomor})`,
        desc: `Permintaan penawaran dibatalkan: ${alasan}`,
        time: 'Baru saja',
        orderNomor: targetOrder.nomor,
        type: 'urgent',
        targetRole: 'customer',
        targetEmail: targetOrder.email,
      });
    }
  };

  // Ingatkan Customer Follow-up
  const handleIngatkanCustomer = (orderId) => {
    const targetOrder = orders.find(o => o.id === orderId || o.nomor === orderId);
    if (targetOrder) {
      toast.success(`Pengingat status telah dikirim ke ${targetOrder.customerNama}! 📲`);
      addActivity('Pengingat Customer', `Follow-up notifikasi dikirim ke ${targetOrder.customerNama} untuk pesanan ${targetOrder.nomor}`, 'info');

      // Notify Customer
      addNotification({
        title: `Pengingat Tindak Lanjut (${targetOrder.nomor})`,
        desc: `Tim Commercial Damaco menunggu tindakan Anda terkait pesanan ${targetOrder.nomor}. Silakan cek tab "Perlu tindakan Anda".`,
        time: 'Baru saja',
        orderNomor: targetOrder.nomor,
        type: 'urgent',
        targetRole: 'customer',
        targetEmail: targetOrder.email,
      });
    }
  };

  // Create new order from Admin
  const handleCreateOrder = (newOrder) => {
    const newId = 'ord-' + Date.now();
    const count = orders.length + 1;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const orderNomor = `QT/${year}/${month}/${String(count).padStart(4, '0')}`;

    const matchedCust = customers.find(c => c.id === newOrder.customerId || c.nama === newOrder.customerNama);

    const items = (newOrder.items || []).map(i => ({
      nama: i.nama,
      qty: i.qty,
      harga: i.harga,
      hargaBeli: i.hargaBeli || Math.round(i.harga * 0.88),
      margin: i.margin || '12%',
      subtotal: i.subtotal || (i.qty * i.harga),
    }));

    const total = newOrder.total || items.reduce((s, it) => s + it.subtotal, 0);

    const orderObj = {
      id: newId,
      nomor: orderNomor,
      customerId: newOrder.customerId || matchedCust?.id || 'CUST-001',
      customerNama: newOrder.customerNama,
      contact: matchedCust?.contact || 'Raka Pradipta',
      telepon: matchedCust?.telepon || '0812-3456-7890',
      email: matchedCust?.email || 'customer@damaco.com',
      npwp: matchedCust?.npwp || '01.234.567.8-012.000',
      detail: items.map(i => `${i.qty}x ${i.nama}`).join(', '),
      items,
      total,
      estimasiMarginKotor: Math.round(total * 0.12),
      actionGroup: 'terbitkan_penawaran',
      tanggal: new Date().toISOString().split('T')[0],
      status: 'draft_penawaran',
      statusLabel: 'Menunggu Penawaran',
      catatan: newOrder.catatan || 'Pesanan baru dibuat langsung oleh Admin',
    };

    setOrders(prev => [orderObj, ...prev]);
    persistOrderToDb(orderObj);
    toast.success(`Pesanan baru ${orderNomor} berhasil dibuat! 🚀`);
    addActivity('Pesanan Baru', `Membuat draft penawaran ${orderNomor} untuk ${newOrder.customerNama}`, 'order');

    // Notify Customer
    addNotification({
      title: `Draft Penawaran Baru (${orderNomor})`,
      desc: `Admin telah membuat draf penawaran baru untuk perusahaan Anda.`,
      time: 'Baru saja',
      orderNomor,
      type: 'info',
      targetRole: 'customer',
      targetEmail: newOrder.email,
    });

    setIsCreateOrderModalOpen(false);
  };

  // Customer Side Action: Submit Purchase Order
  const handleCustomerSubmitPO = (orderKey, poData = {}) => {
    const poNum = poData.nomorPo || `PO-NG/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderKey || ord.nomor === orderKey) {
          return {
            ...ord,
            actionGroup: 'urus_dealer',
            status: 'po_diterima',
            statusLabel: 'PO Diterima',
            poNumber: poNum,
            nomorPo: poNum,
            tanggalPo: poData.tanggalPo || new Date().toISOString().split('T')[0],
            filePoName: poData.fileName || 'PO_Resmi.pdf',
            catatan: `PO resmi ${poNum} telah diunggah customer. Menunggu koordinasi dealer & finance.`,
          };
        }
        return ord;
      })
    );

    const target = orders.find((o) => o.id === orderKey || o.nomor === orderKey);
    if (target) {
      persistOrderToDb({
        ...target,
        actionGroup: 'urus_dealer',
        status: 'po_diterima',
        statusLabel: 'PO Diterima',
        poNumber: poNum,
        nomorPo: poNum,
        tanggalPo: poData.tanggalPo || new Date().toISOString().split('T')[0],
        filePoName: poData.fileName || 'PO_Resmi.pdf',
      });
    }
    const no = target ? target.nomor : orderKey;
    addActivity('PO Customer Diunggah', `Customer mengunggah dokumen PO ${poNum} untuk pesanan ${no}`, 'order');

    // Notify Admin
    addNotification({
      title: `PO Customer Diunggah (${no})`,
      desc: `${target?.customerNama || 'Customer'} telah mengunggah PO resmi ${poNum}. Segera lakukan koordinasi dealer.`,
      time: 'Baru saja',
      orderNomor: no,
      type: 'urgent',
      targetRole: 'admin',
    });
  };

  // Customer Side Action: Upload Payment Proof
  const handleCustomerUploadPayment = (orderKey, proofData = {}) => {
    let updatedTarget = null;
    setOrders((prev) => {
      const next = prev.map((ord) => {
        if (ord.id === orderKey || ord.nomor === orderKey) {
          updatedTarget = {
            ...ord,
            actionGroup: 'kirim_barang',
            status: 'siap_dikirim',
            statusLabel: 'Siap Dikirim',
            paymentProofUploaded: true,
            proofFileName: proofData.fileName || 'Bukti_Transfer.jpg',
            bankPengirim: proofData.bankPengirim || 'Bank Mandiri',
            namaPengirim: proofData.namaPengirim || ord.customerNama,
            paidAt: new Date().toISOString(),
            catatan: 'Bukti transfer telah diunggah customer dan diverifikasi lunas oleh finance.',
          };
          return updatedTarget;
        }
        return ord;
      });
      localStorage.setItem('damaco_orders_v6', JSON.stringify(next));
      return next;
    });

    const target = updatedTarget || orders.find((o) => o.id === orderKey || o.nomor === orderKey);
    if (target) {
      persistOrderToDb(target);
    }
    const no = target ? target.nomor : orderKey;
    addActivity('Bukti Transfer Diunggah', `Customer mengunggah bukti pembayaran untuk pesanan ${no}`, 'payment');

    // Notify Admin
    addNotification({
      title: `Bukti Transfer Masuk (${no})`,
      desc: `${target?.customerNama || 'Customer'} telah mengunggah bukti pembayaran senilai Rp ${(target?.total || 0).toLocaleString('id-ID')}. Siap dikirim.`,
      time: 'Baru saja',
      orderNomor: no,
      type: 'urgent',
      targetRole: 'admin',
    });

    // Notify Customer
    addNotification({
      title: `Bukti Pembayaran Diterima (${no})`,
      desc: `Bukti pembayaran pesanan ${no} berhasil diterima. Pesanan Anda saat ini berstatus Siap Dikirim.`,
      time: 'Baru saja',
      orderNomor: no,
      type: 'success',
      targetRole: 'customer',
      targetEmail: target?.email,
    });
  };

  // Customer Side Action: Confirm Receipt of Goods
  const handleCustomerConfirmReceipt = (orderKey) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderKey || ord.nomor === orderKey) {
          return {
            ...ord,
            actionGroup: 'selesai',
            status: 'selesai',
            statusLabel: 'Selesai',
            receivedAt: new Date().toISOString(),
            catatan: 'Penerimaan unit drone dan perlengkapan telah dikonfirmasi customer. BAST ditandatangani.',
          };
        }
        return ord;
      })
    );

    const target = orders.find((o) => o.id === orderKey || o.nomor === orderKey);
    if (target) {
      persistOrderToDb({
        ...target,
        actionGroup: 'selesai',
        status: 'selesai',
        statusLabel: 'Selesai',
        receivedAt: new Date().toISOString(),
      });
    }
    const no = target ? target.nomor : orderKey;
    addActivity('Penerimaan Dikonfirmasi', `Customer mengonfirmasi penerimaan barang untuk pesanan ${no}`, 'shipping');

    // Notify Admin
    addNotification({
      title: `Penerimaan Barang Selesai (${no})`,
      desc: `${target?.customerNama || 'Customer'} mengonfirmasi seluruh unit pesanan telah diterima dengan baik.`,
      time: 'Baru saja',
      orderNomor: no,
      type: 'info',
      targetRole: 'admin',
    });
  };

  // Customer Side Action: Cancel Quotation Request (before admin issues quotation)
  const handleCustomerCancelOrder = (orderKey, alasan = 'Dibatalkan oleh customer sebelum penawaran resmi diterbitkan.') => {
    let cancelledOrder = null;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderKey || ord.nomor === orderKey) {
          cancelledOrder = {
            ...ord,
            actionGroup: 'tidak_aktif',
            status: 'dibatalkan',
            statusLabel: 'Dibatalkan Customer',
            catatan: alasan,
          };
          return cancelledOrder;
        }
        return ord;
      })
    );

    const target = cancelledOrder || orders.find((o) => o.id === orderKey || o.nomor === orderKey);
    if (target) {
      persistOrderToDb({
        ...target,
        actionGroup: 'tidak_aktif',
        status: 'dibatalkan',
        statusLabel: 'Dibatalkan Customer',
        catatan: alasan,
      });
      const no = target.nomor;
      addActivity('Permintaan Dibatalkan', `Customer ${target.customerNama} membatalkan permintaan penawaran ${no}`, 'warning');

      // Notify Admin
      addNotification({
        title: `Permintaan Dibatalkan Customer (${no})`,
        desc: `${target.customerNama} membatalkan permintaan penawaran ${no}.`,
        time: 'Baru saja',
        orderNomor: no,
        type: 'urgent',
        targetRole: 'admin',
      });
    }

    toast.success('Permintaan penawaran berhasil dibatalkan.', {
      icon: '🗑️',
      duration: 800,
    });
  };

  // Customer Side Action: Update Quotation Request (before admin issues quotation)
  const handleCustomerUpdateOrder = (orderKey, { items, notes, alamat, contactName, phone }) => {
    let updatedOrder = null;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderKey || ord.nomor === orderKey) {
          const newItems = items && items.length > 0 ? items : (ord.items || []);
          const total = newItems.reduce((sum, it) => sum + (it.qty * it.harga), 0);
          const detail = newItems.map((i) => `${i.qty}x ${i.nama}`).join(', ');

          updatedOrder = {
            ...ord,
            items: newItems,
            total,
            detail,
            catatan: notes !== undefined ? notes : ord.catatan,
            alamat: alamat !== undefined ? alamat : ord.alamat,
            alamatPengiriman: alamat !== undefined ? alamat : ord.alamatPengiriman,
            contact: contactName || ord.contact,
            telepon: phone || ord.telepon,
          };
          return updatedOrder;
        }
        return ord;
      })
    );

    const target = updatedOrder || orders.find((o) => o.id === orderKey || o.nomor === orderKey);
    if (target) {
      persistOrderToDb(target);
      const no = target.nomor;
      addActivity('Permintaan Diperbarui', `Customer ${target.customerNama} memperbarui item permintaan penawaran ${no}`, 'info');

      // Notify Admin
      addNotification({
        title: `Permintaan Diperbarui Customer (${no})`,
        desc: `${target.customerNama} memperbarui daftar barang pada permintaan penawaran ${no}.`,
        time: 'Baru saja',
        orderNomor: no,
        type: 'normal',
        targetRole: 'admin',
      });
    }

    toast.success('Perubahan pesanan berhasil disimpan!', {
      icon: '✓',
      duration: 800,
    });
  };

  // Add / Edit Product
  const handleSaveProduct = async (prodData) => {
    const isEdit = Boolean(prodData.id && !String(prodData.id).startsWith('PRD-'));
    try {
      let saved;
      if (isEdit) {
        // Update ke DB
        const res = await axios.put(`/api/damaco/products/${prodData.id}`, prodData);
        saved = { ...prodData, ...res.data?.data };
        setProducts(prev => prev.map(p => String(p.id) === String(prodData.id) ? { ...p, ...saved } : p));
        toast.success(`Produk "${prodData.nama}" berhasil diperbarui!`);
        addActivity('Edit Produk', `Data produk "${prodData.nama}" diperbarui`, 'product');
      } else {
        // Tambah ke DB
        const res = await axios.post('/api/damaco/products', prodData);
        const dbId = res.data?.data?.id;
        saved = {
          ...prodData,
          id: dbId || ('PRD-' + Date.now()),
          kode: prodData.kode || res.data?.data?.sku || `PRD-${Date.now().toString().slice(-4)}`,
        };
        setProducts(prev => [saved, ...prev]);
        toast.success(`Produk baru "${prodData.nama}" berhasil ditambahkan!`);
        addActivity('Tambah Produk', `Produk baru "${prodData.nama}" ditambahkan ke katalog`, 'product');
      }
    } catch (err) {
      console.error('handleSaveProduct error:', err);
      // Fallback: simpan lokal saja jika backend gagal
      if (isEdit) {
        setProducts(prev => prev.map(p => String(p.id) === String(prodData.id) ? { ...p, ...prodData } : p));
      } else {
        const newProd = { ...prodData, id: 'PRD-' + Date.now(), kode: prodData.kode || `PRD-${Date.now().toString().slice(-4)}` };
        setProducts(prev => [newProd, ...prev]);
      }
      toast.success(`Produk "${prodData.nama}" disimpan (lokal).`);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (prod) => {
    if (!prod) return;
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus produk "${prod.nama}" (${prod.kode || prod.id})?`);
    if (!confirmDelete) return;

    setProducts(prev => prev.filter(p => p.id !== prod.id && p.kode !== prod.kode));

    // Soft-delete ke backend
    try {
      if (prod.id && !String(prod.id).startsWith('PRD-')) {
        await axios.delete(`/api/damaco/products/${prod.id}`);
      }
    } catch { /* gagal backend — state lokal sudah dihapus */ }

    toast.success(`Produk "${prod.nama}" berhasil dihapus.`);
    addActivity('Hapus Produk', `Produk "${prod.nama}" dihapus dari katalog`, 'warning');
  };

  // Add / Edit Customer
  const handleSaveCustomer = (custData) => {
    if (custData.id) {
      setCustomers(prev => prev.map(c => c.id === custData.id ? custData : c));
      toast.success(`Data customer "${custData.nama}" berhasil diperbarui!`);
    } else {
      const newCust = {
        ...custData,
        id: 'CUST-' + String(customers.length + 1).padStart(3, '0'),
        totalPesanan: 0,
        totalNilai: 0,
      };
      setCustomers(prev => [...prev, newCust]);
      toast.success(`Customer baru "${custData.nama}" berhasil ditambahkan!`);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (cust) => {
    if (!cust) return;
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus customer "${cust.nama}"? Data akun dan profil yang bersangkutan akan dihapus.`);
    if (!confirmDelete) return;

    // Remove from frontend state
    setCustomers(prev => prev.filter(c => c.id !== cust.id && c.email?.toLowerCase() !== cust.email?.toLowerCase()));

    // Freeze all related orders: status dibekukan & cannot perform any transactions
    const frozenIds = [];
    setOrders(prev => prev.map(ord => {
      const matchEmail = cust.email && ord.email && ord.email.toLowerCase() === cust.email.toLowerCase();
      const matchName = cust.nama && ord.customerNama && ord.customerNama.toLowerCase() === cust.nama.toLowerCase();
      const matchId = cust.id && ord.customerId && ord.customerId === cust.id;

      if (matchEmail || matchName || matchId) {
        if (ord.id) frozenIds.push(ord.id);
        if (ord.nomor) frozenIds.push(ord.nomor);
        const frozenOrder = {
          ...ord,
          actionGroup: 'dibekukan',
          status: 'dibekukan',
          statusLabel: 'Dibekukan',
          isFrozen: true,
          catatan: `Akun customer (${cust.nama}) telah dihapus. Seluruh transaksi dan proses dokumen resmi dibekukan secara permanen.`,
        };
        persistOrderToDb(frozenOrder);
        return frozenOrder;
      }
      return ord;
    }));

    if (frozenIds.length > 0) {
      try {
        const existing = JSON.parse(localStorage.getItem('damaco_frozen_orders_v1') || '[]');
        const merged = Array.from(new Set([...existing, ...frozenIds]));
        localStorage.setItem('damaco_frozen_orders_v1', JSON.stringify(merged));
      } catch (e) {
        console.warn('Frozen orders storage error:', e);
      }
    }

    // Remove from local registered users
    try {
      const registered = JSON.parse(localStorage.getItem('damaco_registered_users_v1') || '[]');
      const updated = registered.filter(u => u.email?.toLowerCase() !== cust.email?.toLowerCase());
      localStorage.setItem('damaco_registered_users_v1', JSON.stringify(updated));
      localStorage.removeItem(`damaco_profile_user_${cust.email?.toLowerCase().trim()}`);
    } catch (e) {
      console.warn('Local storage clean error:', e);
    }

    // Call backend API to delete from database
    try {
      await damacoService.deleteCustomer(cust.id, cust.email);
    } catch (err) {
      console.warn('Backend delete customer warning:', err?.message);
    }

    toast.success(`Customer "${cust.nama}" berhasil dihapus.`);
    addActivity('Hapus Customer', `Customer "${cust.nama}" dihapus dari sistem`, 'warning');
  };

  // Register customer from Customer Sign-Up
  const handleRegisterCustomer = (custData) => {
    const customerId = 'CUST-' + String(customers.length + 1).padStart(3, '0');
    const newCust = {
      id: customerId,
      nama: custData.namaPerusahaan,
      contact: custData.namaPic,
      email: custData.email,
      telepon: custData.telepon || '0812-3456-7890',
      alamat: custData.alamat || 'Kantor Operasional B2B',
      npwp: custData.npwp || '01.234.567.8-012.000',
      totalPesanan: 0,
      totalNilai: 0,
    };

    setCustomers(prev => [newCust, ...prev.filter(c => c.email.toLowerCase() !== newCust.email.toLowerCase())]);
    
    // Log activity
    addActivity('Pendaftaran Customer Baru', `Perusahaan ${newCust.nama} (PIC: ${newCust.contact}) mendaftar akun B2B baru`, 'user');

    // Notify Admin
    addNotification({
      title: 'Pendaftaran Akun B2B Baru',
      desc: `${newCust.nama} (PIC: ${newCust.contact}) telah mendaftarkan akun baru via portal.`,
      time: 'Baru saja',
      type: 'info',
      targetRole: 'admin',
    });

    broadcastSync('SYNC_ALL', {});
    return newCust;
  };

  // Reset to initial screenshot state
  const handleResetData = () => {
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setActivityLogs(INITIAL_ACTIVITY_LOG);
    setPermintaanCart([]);
    localStorage.removeItem('damaco_orders_v3');
    localStorage.removeItem('damaco_customers_v3');
    localStorage.removeItem('damaco_products_v3');
    localStorage.removeItem('damaco_activity_v3');
    localStorage.removeItem('damaco_cart_v3');
    toast.success('Data dikembalikan ke setelan awal screenshot! 🔄');
  };

  // Open customer view modal
  const openCustomerView = (order) => {
    setSelectedOrderForCustomerView(order || orders[0]);
    setIsCustomerModalOpen(true);
  };

  // Dynamic Metrics calculations
  const metrics = useMemo(() => {
    // Helper: pesanan dianggap aktif jika belum selesai, tidak dibekukan, dan tidak dibatalkan / ditolak
    const isOrderActive = (o) => {
      if (!o || o.isFrozen) return false;
      const grp = (o.actionGroup || '').toLowerCase();
      const st = (o.status || '').toLowerCase();
      if (grp === 'selesai' || grp === 'dibekukan' || grp === 'tidak_aktif') return false;
      if (st === 'selesai' || st === 'dibekukan' || st === 'dibatalkan' || st === 'ditolak' || st === 'kedaluwarsa') return false;
      return true;
    };

    const terbitkanPenawaranList = orders.filter(o => o.actionGroup === 'terbitkan_penawaran' && isOrderActive(o));
    const inputPoList = orders.filter(o => o.actionGroup === 'input_po' && isOrderActive(o));
    const urusDealerList = orders.filter(o => o.actionGroup === 'urus_dealer' && isOrderActive(o));
    const buatInvoiceList = orders.filter(o => o.actionGroup === 'buat_invoice' && isOrderActive(o));
    const tandaiLunasList = orders.filter(o => o.actionGroup === 'tandai_lunas' && isOrderActive(o));
    const kirimBarangList = orders.filter(o => o.actionGroup === 'kirim_barang' && isOrderActive(o));
    const tutupTransaksiList = orders.filter(o => o.actionGroup === 'tutup_transaksi' && isOrderActive(o));

    // Sinkron 100%: Jumlah Butuh Tindakan adalah total seluruh baris di daftar tindakan
    const butuhTindakanCount =
      terbitkanPenawaranList.length +
      inputPoList.length +
      urusDealerList.length +
      buatInvoiceList.length +
      tandaiLunasList.length +
      kirimBarangList.length +
      tutupTransaksiList.length;

    const menungguBayarOrders = orders.filter(o =>
      (o.actionGroup === 'tandai_lunas' || o.status === 'menunggu_pembayaran') &&
      isOrderActive(o)
    );
    const menungguBayarCount = menungguBayarOrders.length;
    const menungguBayarTotal = menungguBayarOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const pengirimanOrders = orders.filter(o =>
      (o.actionGroup === 'kirim_barang' || o.actionGroup === 'dalam_pengiriman_berjalan' || o.status === 'siap_dikirim' || o.status === 'dalam_pengiriman') &&
      isOrderActive(o)
    );
    const pengirimanCount = pengirimanOrders.length;

    // Nilai pipeline hanya menjumlahkan pesanan yang benar-benar aktif
    const pipelineOrders = orders.filter(o => isOrderActive(o));
    const pipelineTotal = pipelineOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return {
      butuhTindakanCount,
      menungguBayarCount,
      menungguBayarTotal,
      pengirimanCount,
      pipelineTotal,
      groups: {
        terbitkanPenawaranList,
        inputPoList,
        urusDealerList,
        buatInvoiceList,
        tandaiLunasList,
        kirimBarangList,
        tutupTransaksiList,
      },
    };
  }, [orders]);

  // Global search
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedOrders = orders.filter(o =>
      o.nomor.toLowerCase().includes(q) ||
      o.customerNama.toLowerCase().includes(q) ||
      o.detail.toLowerCase().includes(q)
    );

    const matchedCustomers = customers.filter(c =>
      c.nama.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );

    const matchedProducts = products.filter(p =>
      p.nama.toLowerCase().includes(q) ||
      p.kode.toLowerCase().includes(q) ||
      p.kategori.toLowerCase().includes(q)
    );

    return {
      orders: matchedOrders,
      customers: matchedCustomers,
      products: matchedProducts,
      totalCount: matchedOrders.length + matchedCustomers.length + matchedProducts.length,
    };
  }, [searchQuery, orders, customers, products]);

  return (
    <DamacoContext.Provider
      value={{
        orders,
        customers,
        products,
        activityLogs,
        metrics,
        searchQuery,
        setSearchQuery,
        searchResults,
        permintaanCart,
        addToPermintaanCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        compareList,
        toggleCompare,
        clearCompare,
        isCompareOpen,
        setIsCompareOpen,
        selectedProductDetail,
        isProductDetailOpen,
        setIsProductDetailOpen,
        openProductDetail,
        isPesananSayaOpen,
        setIsPesananSayaOpen,
        isProfilPerusahaanOpen,
        setIsProfilPerusahaanOpen,
        handleCustomerSubmitQuotation,
        selectedOrderForCustomerView,
        setSelectedOrderForCustomerView,
        isCustomerModalOpen,
        setIsCustomerModalOpen,
        isCreateOrderModalOpen,
        setIsCreateOrderModalOpen,
        isStyleGuideOpen,
        setIsStyleGuideOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        modalActionOrder,
        setModalActionOrder,
        activeActionModalType,
        setActiveActionModalType,
        handleTerbitkanPenawaran,
        handleInputPO,
        handleUrusDealer,
        handleBuatInvoice,
        handleTandaiLunas,
        handleKirimBarang,
        handleTutupTransaksi,
        handleCreateOrder,
        handleSaveProduct,
        handleDeleteProduct,
        handleSaveCustomer,
        handleDeleteCustomer,
        handleRegisterCustomer,
        updateCustomerAddress,
        handleResetData,
        openCustomerView,
        handleCustomerSubmitPO,
        handleCustomerUploadPayment,
        handleCustomerConfirmReceipt,
        handleCustomerCancelOrder,
        handleCustomerUpdateOrder,
        handleTolakPesanan,
        handleIngatkanCustomer,
        mapOrderToCustomerView,
        syncWithDatabase,
        customerUnreadOrderIds,
        markCustomerOrdersAsRead,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </DamacoContext.Provider>
  );
};

export const useDamaco = () => {
  const context = useContext(DamacoContext);
  if (!context) throw new Error('useDamaco must be used within DamacoProvider');
  return context;
};
