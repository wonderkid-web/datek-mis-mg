
export const COMPANIES = [
  {
    type: "BIP",
    description: "PT Berlian Inti Mekar - Palembang",
    lintang: "3.596616358026983",
    bujur: "98.67881535407668",
  },
  {
    type: "BIR",
    description: "PT Berlian Inti Mekar - Rengat",
    lintang: "-0.7227579955860218",
    bujur: "102.62722882710557",
  },
  {
    type: "BIS",
    description: "PT Berlian Inti Mekar - Siak",
    lintang: "0.8306309661104908",
    bujur: "102.06057938495482",
  },
  {
    type: "DPA",
    description: "PT Dumai Paricipta Abadi",
    lintang: "1.6852182822272768",
    bujur: "101.43847955407911",
  },
  {
    type: "ISA",
    description: "PT Intan Sejati Andalan",
    lintang: "1.432855904484427",
    bujur: "101.28518311965121",
  },

  {
    type: "ISR",
    description: "PT Intan Sejati Andalan - Refinery",
    lintang: "1.432855904484427",
    bujur: "101.28518311965121",
  },
  {
    type: "ISAKCP",
    description: "PT Intan Sejati Andalan - KCP",
    lintang: "1.432855904484427",
    bujur: "101.28518311965121",
  },
  {
    type: "ISABGS",
    description: "PT Intan Sejati Andalan - BIOGAS",
    lintang: "1.432855904484427",
    bujur: "101.28518311965121",
  },
  {
    type: "ISAFOF",
    description: "PT Intan Sejati Andalan - FOF",
    lintang: "1.432855904484427",
    bujur: "101.28518311965121",
  },
  {
    type: "ISASOLVENT",
    description: "PT Intan Sejati Andalan - SOLVENT",
    lintang: "1.432855904484427",
    bujur: "101.28518311965121",
  },
  {
    type: "ISATC",
    description: "PT Intan Sejati Andalan - TRAINING CENTER",
    lintang: "1.432855904484427",
    bujur: "101.28518311965121",
  },
  {
    type: "ISASSL",
    description: "PT Intan Sejati Andalan - SSL",
    lintang: "1.432855904484427",
    bujur: "101.28518311965121",
  },
  {
    type: "KMA",
    description: "PT Karya Mitra Andalan",
    lintang: "2.7839220045197",
    bujur: "99.61802570752778",
  },
  {
    type: "KPN",
    description: "PT Karya Pratama NiagaJaya",
    lintang: "3.317950261702866",
    bujur: "99.31387072337746",
  },
  {
    type: "MG",
    description: "PT Mahkota Group, Tbk",
    lintang: "3.5967341427711728",
    bujur: "98.67877243873158",
  },
  {
    type: "MUL",
    description: "PT Mutiara Unggul Lestari",
    lintang: "0.8530849157690351",
    bujur: "101.30063331965077",
  },
];
export const DEPARTMENTS = [
  "IK Biogas",
  "Halal",
  "IK Fraksinasi",
  "IK Refinery",
  "IK KCP",
  "Refinery",
  "IK-K3",
  "IK-Lingkungan",
  "IK-Mutu",
  "Admin SBU",
  "Document Control",
  "Storage Tank",
  "ISO/SMK3/ISPO",
  "Estate",
  "IK Proses PKS",
  "AUD - Internal Audit",
  "MS - Management System",
  "MKT - Marketing",
  "CS - Corporate Secretariat",
  "ISO 37001:2016 (SMAP)",
  "SSL - Social, Secure & License",
  "FNC - Finance",
  "HCM - Human Capital Management",
  "ACC & TAX - Accounting & TAX",
  "MIS - Manajemen Information System",
  "MH - Material Handling",
];

export const STATUSES = [
  { type: "01", description: "GOOD" },
  { type: "02", description: "NEED REPARATION" },
  { type: "03", description: "BROKEN" },
  { type: "04", description: "MISSING" },
  { type: "05", description: "SELL" },
  { type: "06", description: "LEASED TO SBU" },
];

export const ASSET_INFO = [
  {
    table: "AAM.Department",
    type: "42",
    description: "SSLAAM.Category",
  },
  {
    table: "AAM.Category",
    type: "2",
    description: "RO",
  },
  {
    table: "AAM.Category",
    type: "3",
    description: "MILL",
  },
  {
    table: "AAM.Category",
    type: "4",
    description: "ESTATE",
  },
  {
    table: "AAM.Category",
    type: "5",
    description: "RAMP",
  },
  {
    table: "AAM.Category",
    type: "6",
    description: "REFINERY",
  },
  {
    table: "AAM.Company",
    type: "BIP",
    description: "BIM PALEMBANG",
  },
  {
    table: "AAM.Company",
    type: "BIR",
    description: "BIM R",
  },
  {
    table: "AAM.Company",
    type: "BIS",
    description: "BIM S",
  },
  {
    table: "AAM.Company",
    type: "DPA",
    description: "DPA",
  },
  {
    table: "AAM.Company",
    type: "ISA",
    description: "ISA",
  },
  {
    table: "AAM.Company",
    type: "ISR",
    description: "REFINERY",
  },
  {
    table: "AAM.Company",
    type: "KCR",
    description: "KCRI",
  },
  {
    table: "AAM.Company",
    type: "KMA",
    description: "KMA",
  },
  {
    table: "AAM.Company",
    type: "KPN",
    description: "KPNJ",
  },
  {
    table: "AAM.Company",
    type: "MAS",
    description: "MAS",
  },
  {
    table: "AAM.Company",
    type: "MGP",
    description: "MG",
  },
  {
    table: "AAM.Company",
    type: "MUL",
    description: "MUL",
  },
  {
    table: "AAM.Company",
    type: "YMI",
    description: "YMI",
  },
  {
    table: "AAM.Department",
    type: "01",
    description: "PROPERTI UMUM",
  },
  {
    table: "AAM.Department",
    type: "02",
    description: "MANAGER",
  },
  {
    table: "AAM.Department",
    type: "03",
    description: "WORKSHOP",
  },
  {
    table: "AAM.Department",
    type: "04",
    description: "ADM & GENERAL",
  },
  {
    table: "AAM.Department",
    type: "05",
    description: "MAINTENANCE",
  },
  {
    table: "AAM.Department",
    type: "06",
    description: "COMPOSTING",
  },
  {
    table: "AAM.Department",
    type: "07",
    description: "TRANSPORT PENGANGKUTAN",
  },
  {
    table: "AAM.Department",
    type: "08",
    description: "TRANSPORT OPERASIONAL",
  },
  {
    table: "AAM.Department",
    type: "09",
    description: "HEAVY EQUIPMENT",
  },
  {
    table: "AAM.Department",
    type: "10",
    description: "PLANTATION",
  },
  {
    table: "AAM.Department",
    type: "11",
    description: "ENGINEERING",
  },
  {
    table: "AAM.Department",
    type: "12",
    description: "LAB",
  },
  {
    table: "AAM.Department",
    type: "13",
    description: "LOADING SHED / DESPATCH",
  },
  {
    table: "AAM.Department",
    type: "14",
    description: "WEIGHBRIDGE",
  },
  {
    table: "AAM.Department",
    type: "15",
    description: "SORTING",
  },
  {
    table: "AAM.Department",
    type: "16",
    description: "PROSES",
  },
  {
    table: "AAM.Department",
    type: "17",
    description: "LOADING RAMP",
  },
  {
    table: "AAM.Department",
    type: "18",
    description: "STERILIZER",
  },
  {
    table: "AAM.Department",
    type: "19",
    description: "THRESHER",
  },
  {
    table: "AAM.Department",
    type: "20",
    description: "PRESSING",
  },
  {
    table: "AAM.Department",
    type: "21",
    description: "CLARIFICATION",
  },
  {
    table: "AAM.Department",
    type: "22",
    description: "KERNEL",
  },
  {
    table: "AAM.Department",
    type: "23",
    description: "EFFLUENT",
  },
  {
    table: "AAM.Department",
    type: "24",
    description: "BOILER",
  },
  {
    table: "AAM.Department",
    type: "25",
    description: "WATER TREATMENT",
  },
  {
    table: "AAM.Department",
    type: "26",
    description: "ENGINE ROOM",
  },
  {
    table: "AAM.Department",
    type: "27",
    description: "SLUDGE SPARATOR",
  },
  {
    table: "AAM.Department",
    type: "28",
    description: "TUNGKU BAKAR",
  },
  {
    table: "AAM.Department",
    type: "29",
    description: "BUNCH PRESS",
  },
  {
    table: "AAM.Department",
    type: "30",
    description: "MASTER BATCH",
  },
  {
    table: "AAM.Department",
    type: "31",
    description: "PQ COMPOUND",
  },
  {
    table: "AAM.Department",
    type: "32",
    description: "PRECURED LINEAR",
  },
  {
    table: "AAM.Department",
    type: "33",
    description: "KCP",
  },
  {
    table: "AAM.Department",
    type: "34",
    description: "DEPUTY MANAGING DIRECTOR",
  },
  {
    table: "AAM.Department",
    type: "35",
    description: "FINANCE",
  },
  {
    table: "AAM.Department",
    type: "36",
    description: "PROCUREMENT",
  },
  {
    table: "AAM.Department",
    type: "37",
    description: "HCM",
  },
  {
    table: "AAM.Department",
    type: "38",
    description: "MARKETING",
  },
  {
    table: "AAM.Department",
    type: "39",
    description: "ACCOUNTING",
  },
  {
    table: "AAM.Department",
    type: "40",
    description: "MIS",
  },
  {
    table: "AAM.Department",
    type: "41",
    description: "MS",
  },
  {
    table: "AAM.Department",
    type: "42",
    description: "SSL",
  },
  {
    table: "AAM.Department",
    type: "43",
    description: "SECURITY",
  },
  {
    table: "AAM.Department",
    type: "44",
    description: "TAX",
  },
  {
    table: "AAM.Department",
    type: "45",
    description: "COORPORATE SECREATARY",
  },
  {
    table: "AAM.Department",
    type: "46",
    description: "WAREHOUSE",
  },
  {
    table: "AAM.Department",
    type: "47",
    description: "BOD",
  },
  {
    table: "AAM.Department",
    type: "48",
    description: "MILL",
  },
  {
    table: "AAM.Department",
    type: "49",
    description: "PRODUKSI",
  },
  {
    table: "AAM.Department",
    type: "50",
    description: "AUDIT",
  },
  {
    table: "AAM.Department",
    type: "51",
    description: "BULKING",
  },
  {
    table: "AAM.Department",
    type: "52",
    description: "PACKAGING",
  },
  {
    table: "AAM.Department",
    type: "53",
    description: "TANK FARM",
  },
  {
    table: "AAM.Department",
    type: "54",
    description: "PABRIK PUPUK",
  },
  {
    table: "AAM.Department",
    type: "55",
    description: "QUALITY CONTROL",
  },
  {
    table: "AAM.Department",
    type: "56",
    description: "UTILITY",
  },
  {
    table: "AAM.Department",
    type: "57",
    description: "FRAKSINASI",
  },
  {
    table: "AAM.Department",
    type: "58",
    description: "SMI",
  },
  {
    table: "AAM.Location",
    type: "1",
    description: "OFFICE",
  },
  {
    table: "AAM.Location",
    type: "2",
    description: "MESS",
  },
  {
    table: "AAM.Location",
    type: "3",
    description: "PABRIK",
  },
  {
    table: "AAM.Location",
    type: "4",
    description: "KEBUN",
  },
  {
    table: "AAM.Location",
    type: "5",
    description: "AFDELING OFFICE",
  },
  {
    table: "AAM.Location",
    type: "6",
    description: "RAMP",
  },
  {
    table: "AAM.Location",
    type: "7",
    description: "REFINERY",
  },
  {
    table: "AAM.Status",
    type: "01",
    description: "GOOD",
  },
  {
    table: "AAM.Status",
    type: "02",
    description: "NEED REPARATION",
  },
  {
    table: "AAM.Status",
    type: "03",
    description: "BROKEN",
  },
  {
    table: "AAM.Status",
    type: "04",
    description: "MISSING",
  },
  {
    table: "AAM.Status",
    type: "05",
    description: "SELL",
  },
  {
    table: "AAM.Status",
    type: "06",
    description: "LEASED TO SBU",
  },
  {
    table: "AAM.Unit",
    type: "BL-G01",
    description: "AULA",
  },
  {
    table: "AAM.Unit",
    type: "BL-G02",
    description: "BANGUNAN GUDANG",
  },
  {
    table: "AAM.Unit",
    type: "BL-G03",
    description: "BANGUNAN KANTIN",
  },
  {
    table: "AAM.Unit",
    type: "BL-G04",
    description: "BANGUN KANTOR",
  },
  {
    table: "AAM.Unit",
    type: "BL-G05",
    description: "BANGUNAN MESS",
  },
  {
    table: "AAM.Unit",
    type: "BL-G06",
    description: "BANGUNAN PABRIK",
  },
  {
    table: "AAM.Unit",
    type: "BL-G07",
    description: "BANGUNAN PERON",
  },
  {
    table: "AAM.Unit",
    type: "BL-G08",
    description: "BANGUNAN POS",
  },
  {
    table: "AAM.Unit",
    type: "BL-G09",
    description: "BANGUN SEKOLAH",
  },
  {
    table: "AAM.Unit",
    type: "BL-G10",
    description: "BANGUNAN STRUKTURAL",
  },
  {
    table: "AAM.Unit",
    type: "BL-G11",
    description: "BANGUNAN TOILET",
  },
  {
    table: "AAM.Unit",
    type: "BL-G12",
    description: "BARRAK",
  },
  {
    table: "AAM.Unit",
    type: "BL-G13",
    description: "INFRASTRUKTUR LAINNYA",
  },
  {
    table: "AAM.Unit",
    type: "BL-G14",
    description: "JEMBATAN",
  },
  {
    table: "AAM.Unit",
    type: "BL-G15",
    description: "KOLAM LIMBAH",
  },
  {
    table: "AAM.Unit",
    type: "BL-G16",
    description: "MUSHOLLAH",
  },
  {
    table: "AAM.Unit",
    type: "BL-G17",
    description: "RUMAH DATUK",
  },
  {
    table: "AAM.Unit",
    type: "BL-G18",
    description: "RUMAH MESIN",
  },
  {
    table: "AAM.Unit",
    type: "BL-G19",
    description: "RUMAH POMPA",
  },
  {
    table: "AAM.Unit",
    type: "BL-G20",
    description: "RUMAH TIMBANGAN",
  },
  {
    table: "AAM.Unit",
    type: "BL-G21",
    description: "TANGKI TIMBUN",
  },
  {
    table: "AAM.Unit",
    type: "BL-G22",
    description: "TUNGKU BAKAR",
  },
  {
    table: "AAM.Unit",
    type: "FS-G01",
    description: "AC",
  },
  {
    table: "AAM.Unit",
    type: "FS-G02",
    description: "AIR FRESHER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G03",
    description: "ALAT DAPUR",
  },
  {
    table: "AAM.Unit",
    type: "FS-G04",
    description: "AMPLIFIER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G05",
    description: "BAK MANDI",
  },
  {
    table: "AAM.Unit",
    type: "FS-G06",
    description: "BANTAL / GULING",
  },
  {
    table: "AAM.Unit",
    type: "FS-G07",
    description: "BLENDER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G08",
    description: "BOX KUNCI",
  },
  {
    table: "AAM.Unit",
    type: "FS-G09",
    description: "BRANKAS",
  },
  {
    table: "AAM.Unit",
    type: "FS-G10",
    description: "CERMIN",
  },
  {
    table: "AAM.Unit",
    type: "FS-G11",
    description: "CLEANER TOOLS",
  },
  {
    table: "AAM.Unit",
    type: "FS-G12",
    description: "CONTAINER BOX",
  },
  {
    table: "AAM.Unit",
    type: "FS-G13",
    description: "CPU HOLDER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G14",
    description: "EMBER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G15",
    description: "EYEWASHER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G16",
    description: "FREEZER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G17",
    description: "HAIR DRYER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G18",
    description: "HANDUK / SERBET",
  },
  {
    table: "AAM.Unit",
    type: "FS-G19",
    description: "HANGER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G20",
    description: "HEATER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G21",
    description: "IRON",
  },
  {
    table: "AAM.Unit",
    type: "FS-G22",
    description: "JAM",
  },
  {
    table: "AAM.Unit",
    type: "FS-G23",
    description: "JEMURAN HANDUK",
  },
  {
    table: "AAM.Unit",
    type: "FS-G24",
    description: "KACA",
  },
  {
    table: "AAM.Unit",
    type: "FS-G25",
    description: "KARPET",
  },
  {
    table: "AAM.Unit",
    type: "FS-G26",
    description: "KASUR BUSA",
  },
  {
    table: "AAM.Unit",
    type: "FS-G27",
    description: "KERANJANG",
  },
  {
    table: "AAM.Unit",
    type: "FS-G28",
    description: "KIPAS ANGIN",
  },
  {
    table: "AAM.Unit",
    type: "FS-G29",
    description: "KIPAS VENTILASI",
  },
  {
    table: "AAM.Unit",
    type: "FS-G30",
    description: "KLOSET",
  },
  {
    table: "AAM.Unit",
    type: "FS-G31",
    description: "KOMPOR",
  },
  {
    table: "AAM.Unit",
    type: "FS-G32",
    description: "KOTAK ABSENSI",
  },
  {
    table: "AAM.Unit",
    type: "FS-G33",
    description: "KOTAK OBAT / P3K",
  },
  {
    table: "AAM.Unit",
    type: "FS-G34",
    description: "KULKAS",
  },
  {
    table: "AAM.Unit",
    type: "FS-G35",
    description: "KURSI",
  },
  {
    table: "AAM.Unit",
    type: "FS-G36",
    description: "LEMARI",
  },
  {
    table: "AAM.Unit",
    type: "FS-G37",
    description: "LOCKER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G38",
    description: "LOKER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G39",
    description: "LOUDSPEAKER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G40",
    description: "MEDIA PLAYER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G41",
    description: "MEJA",
  },
  {
    table: "AAM.Unit",
    type: "FS-G42",
    description: "MEJA SETRIKA",
  },
  {
    table: "AAM.Unit",
    type: "FS-G43",
    description: "MICROWAVE",
  },
  {
    table: "AAM.Unit",
    type: "FS-G44",
    description: "MICROPHONE",
  },
  {
    table: "AAM.Unit",
    type: "FS-G45",
    description: "MUSIC TOOLS",
  },
  {
    table: "AAM.Unit",
    type: "FS-G46",
    description: "OVEN",
  },
  {
    table: "AAM.Unit",
    type: "FS-G47",
    description: "PAJANGAN / HIASAN",
  },
  {
    table: "AAM.Unit",
    type: "FS-G48",
    description: "PAKAIAN",
  },
  {
    table: "AAM.Unit",
    type: "FS-G49",
    description: "RAK",
  },
  {
    table: "AAM.Unit",
    type: "FS-G50",
    description: "RICE COOKER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G51",
    description: "ROLLER BLIND",
  },
  {
    table: "AAM.Unit",
    type: "FS-G52",
    description: "SELIMUT",
  },
  {
    table: "AAM.Unit",
    type: "FS-G53",
    description: "SENTER / LAMPU EMERGENCY",
  },
  {
    table: "AAM.Unit",
    type: "FS-G54",
    description: "SPORT TOOLS",
  },
  {
    table: "AAM.Unit",
    type: "FS-G55",
    description: "SPRING BED",
  },
  {
    table: "AAM.Unit",
    type: "FS-G56",
    description: "TEMPAT SABUN",
  },
  {
    table: "AAM.Unit",
    type: "FS-G57",
    description: "TEMPAT TISSUE",
  },
  {
    table: "AAM.Unit",
    type: "FS-G58",
    description: "THERMOS",
  },
  {
    table: "AAM.Unit",
    type: "FS-G59",
    description: "TIRAI / GORDEN",
  },
  {
    table: "AAM.Unit",
    type: "FS-G60",
    description: "TROLLEY",
  },
  {
    table: "AAM.Unit",
    type: "FS-G61",
    description: "TUDUNG SAJI",
  },
  {
    table: "AAM.Unit",
    type: "FS-G62",
    description: "TV",
  },
  {
    table: "AAM.Unit",
    type: "FS-G63",
    description: "URINOIR",
  },
  {
    table: "AAM.Unit",
    type: "FS-G64",
    description: "VACUUM CLEANER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G65",
    description: "WASHER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G66",
    description: "WATER DISPENSER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G67",
    description: "WATER HEATER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G68",
    description: "WATER SHOWER",
  },
  {
    table: "AAM.Unit",
    type: "FS-G69",
    description: "WATER SINK",
  },
  {
    table: "AAM.Unit",
    type: "FS-G70",
    description: "WESTAFEL",
  },
  {
    table: "AAM.Unit",
    type: "FS-G71",
    description: "AIR PURIFIER",
  },
  {
    table: "AAM.Unit",
    type: "HE-G01",
    description: "BACHUS",
  },
  {
    table: "AAM.Unit",
    type: "HE-G02",
    description: "BACKHOELOADER",
  },
  {
    table: "AAM.Unit",
    type: "HE-G03",
    description: "BULLDOZER",
  },
  {
    table: "AAM.Unit",
    type: "HE-G04",
    description: "COMPACTOR",
  },
  {
    table: "AAM.Unit",
    type: "HE-G05",
    description: "DUMPER",
  },
  {
    table: "AAM.Unit",
    type: "HE-G06",
    description: "EXCAVATOR",
  },
  {
    table: "AAM.Unit",
    type: "HE-G07",
    description: "FORKLIFT",
  },
  {
    table: "AAM.Unit",
    type: "HE-G08",
    description: "ROAD GRADER",
  },
  {
    table: "AAM.Unit",
    type: "HE-G09",
    description: "TRACTOR",
  },
  {
    table: "AAM.Unit",
    type: "HE-G10",
    description: "WHELL LOADER",
  },
  {
    table: "AAM.Unit",
    type: "LN-G01",
    description: "LAHAN AREAL PABRIK",
  },
  {
    table: "AAM.Unit",
    type: "LN-G02",
    description: "LAHAN BANGUNAN",
  },
  {
    table: "AAM.Unit",
    type: "LN-G03",
    description: "LAHAN KOSONG",
  },
  {
    table: "AAM.Unit",
    type: "LN-G04",
    description: "LAHAN RAMP",
  },
  {
    table: "AAM.Unit",
    type: "LN-G05",
    description: "PERKEBUNAN KARET",
  },
  {
    table: "AAM.Unit",
    type: "LN-G06",
    description: "PERKEBUNAN SAWIT TBM",
  },
  {
    table: "AAM.Unit",
    type: "LN-G07",
    description: "PERKEBUNAN SAWIT TM",
  },
  {
    table: "AAM.Unit",
    type: "MU-G01",
    description: "COMPRESSOR",
  },
  {
    table: "AAM.Unit",
    type: "MU-G02",
    description: "GENERATOR",
  },
  {
    table: "AAM.Unit",
    type: "MU-G03",
    description: "MESIN FOGGING",
  },
  {
    table: "AAM.Unit",
    type: "MU-G04",
    description: "MESIN FOTOCOPY",
  },
  {
    table: "AAM.Unit",
    type: "MU-G05",
    description: "MESIN LAMINATING",
  },
  {
    table: "AAM.Unit",
    type: "MU-G06",
    description: "MESIN PEMOTONG RUMPUT",
  },
  {
    table: "AAM.Unit",
    type: "MU-G07",
    description: "MESIN POMPA",
  },
  {
    table: "AAM.Unit",
    type: "MU-G08",
    description: "MESIN ROLL",
  },
  {
    table: "AAM.Unit",
    type: "MU-G09",
    description: "PAPER SHREDDER",
  },
  {
    table: "AAM.Unit",
    type: "MU-G10",
    description: "REVERSE OSMOSIS",
  },
  {
    table: "AAM.Unit",
    type: "MU-G11",
    description: "TURBIN",
  },
  {
    table: "AAM.Unit",
    type: "MU-G12",
    description: "LINER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M01",
    description: "AERATOR",
  },
  {
    table: "AAM.Unit",
    type: "MU-M02",
    description: "AIRLOCK",
  },
  {
    table: "AAM.Unit",
    type: "MU-M03",
    description: "AUTO FEEDER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M04",
    description: "BOILER SET",
  },
  {
    table: "AAM.Unit",
    type: "MU-M05",
    description: "BPV SET",
  },
  {
    table: "AAM.Unit",
    type: "MU-M06",
    description: "BRUSH STRAINER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M07",
    description: "BUNCH CRUSHER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M08",
    description: "BUNCH PRESS",
  },
  {
    table: "AAM.Unit",
    type: "MU-M09",
    description: "BUNCH SHREDDER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M10",
    description: "CAPSTAN SET",
  },
  {
    table: "AAM.Unit",
    type: "MU-M11",
    description: "CLAYBATH SET",
  },
  {
    table: "AAM.Unit",
    type: "MU-M12",
    description: "CONVEYOR",
  },
  {
    table: "AAM.Unit",
    type: "MU-M13",
    description: "COOLING TOWER SET",
  },
  {
    table: "AAM.Unit",
    type: "MU-M14",
    description: "DECANTER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M15",
    description: "DEGASFIER SET",
  },
  {
    table: "AAM.Unit",
    type: "MU-M16",
    description: "DEPERICARPER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M17",
    description: "DIGESTER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M18",
    description: "DOUBLE STAGE CYCLONE",
  },
  {
    table: "AAM.Unit",
    type: "MU-M19",
    description: "DUST COLLECTOR",
  },
  {
    table: "AAM.Unit",
    type: "MU-M20",
    description: "ELEVATOR",
  },
  {
    table: "AAM.Unit",
    type: "MU-M21",
    description: "FAN",
  },
  {
    table: "AAM.Unit",
    type: "MU-M22",
    description: "JEMBATAN TIMBANG",
  },
  {
    table: "AAM.Unit",
    type: "MU-M23",
    description: "MESIN PACKING",
  },
  {
    table: "AAM.Unit",
    type: "MU-M24",
    description: "MESIN PARUT",
  },
  {
    table: "AAM.Unit",
    type: "MU-M25",
    description: "MESIN PEMIPIL",
  },
  {
    table: "AAM.Unit",
    type: "MU-M26",
    description: "MESIN PEMOTONG KARET",
  },
  {
    table: "AAM.Unit",
    type: "MU-M27",
    description: "NUT GRADING DRUM",
  },
  {
    table: "AAM.Unit",
    type: "MU-M28",
    description: "NUT POLISH DRUM",
  },
  {
    table: "AAM.Unit",
    type: "MU-M29",
    description: "OIL PURIFIER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M30",
    description: "RHEOMETER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M31",
    description: "RIPPLE MILL",
  },
  {
    table: "AAM.Unit",
    type: "MU-M32",
    description: "RUBBER CRACKER MILL",
  },
  {
    table: "AAM.Unit",
    type: "MU-M33",
    description: "RUBBER CRUSHING MACHINE",
  },
  {
    table: "AAM.Unit",
    type: "MU-M34",
    description: "RUBBER EXTRUDER MIXING MACHINE",
  },
  {
    table: "AAM.Unit",
    type: "MU-M35",
    description: "RUBBER MIXING MILL",
  },
  {
    table: "AAM.Unit",
    type: "MU-M36",
    description: "RUBBER PRECURED MACHINE",
  },
  {
    table: "AAM.Unit",
    type: "MU-M37",
    description: "RUBBER PRESSING MACHINE",
  },
  {
    table: "AAM.Unit",
    type: "MU-M38",
    description: "SCREW PRESS",
  },
  {
    table: "AAM.Unit",
    type: "MU-M39",
    description: "SILO SET",
  },
  {
    table: "AAM.Unit",
    type: "MU-M40",
    description: "SINGEL STAGE CYCLONE",
  },
  {
    table: "AAM.Unit",
    type: "MU-M41",
    description: "SLUDGE SEPARATOR",
  },
  {
    table: "AAM.Unit",
    type: "MU-M42",
    description: "STERILIZER SET",
  },
  {
    table: "AAM.Unit",
    type: "MU-M43",
    description: "THRESHER DRUM",
  },
  {
    table: "AAM.Unit",
    type: "MU-M44",
    description: "TIPPLER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M45",
    description: "TRANSFER CARRIAGE",
  },
  {
    table: "AAM.Unit",
    type: "MU-M46",
    description: "VIBRATING SCREEN",
  },
  {
    table: "AAM.Unit",
    type: "MU-M47",
    description: "VIBRATOR",
  },
  {
    table: "AAM.Unit",
    type: "MU-M48",
    description: "MESIN PENGHANCUR KERTAS",
  },
  {
    table: "AAM.Unit",
    type: "MU-M49",
    description: "BATTERY DAN CHARGER",
  },
  {
    table: "AAM.Unit",
    type: "MU-M50",
    description: "TRAFO LAS",
  },
  {
    table: "AAM.Unit",
    type: "MU-M51",
    description: "ROTOTHERM",
  },
  {
    table: "AAM.Unit",
    type: "MU-M52",
    description: "GEARBOX",
  },
  {
    table: "AAM.Unit",
    type: "MU-M53",
    description: "BLOW DOWN",
  },
  {
    table: "AAM.Unit",
    type: "MU-M54",
    description: "PACKAGING STATION",
  },
  {
    table: "AAM.Unit",
    type: "MU-M55",
    description: "SEALING MACHINE",
  },
  {
    table: "AAM.Unit",
    type: "MU-T01",
    description: "HACKSAW MACHINE",
  },
  {
    table: "AAM.Unit",
    type: "MU-T02",
    description: "HAMMER DEMOLISION",
  },
  {
    table: "AAM.Unit",
    type: "MU-T03",
    description: "MESIN BOR",
  },
  {
    table: "AAM.Unit",
    type: "MU-T04",
    description: "MESIN BUBUT",
  },
  {
    table: "AAM.Unit",
    type: "MU-T05",
    description: "MESIN KETAM",
  },
  {
    table: "AAM.Unit",
    type: "MU-T06",
    description: "MESIN MOLEN",
  },
  {
    table: "AAM.Unit",
    type: "MU-T07",
    description: "MESIN SCRAP",
  },
  {
    table: "AAM.Unit",
    type: "MU-T08",
    description: "MESIN STEAM",
  },
  {
    table: "AAM.Unit",
    type: "SS-G01",
    description: "BOX PENCIL",
  },
  {
    table: "AAM.Unit",
    type: "SS-G02",
    description: "BUKU",
  },
  {
    table: "AAM.Unit",
    type: "SS-G03",
    description: "CABLE BOX",
  },
  {
    table: "AAM.Unit",
    type: "SS-G04",
    description: "COK CABANG",
  },
  {
    table: "AAM.Unit",
    type: "SS-G05",
    description: "CUTTER",
  },
  {
    table: "AAM.Unit",
    type: "SS-G06",
    description: "DISPENSER ISOLASI",
  },
  {
    table: "AAM.Unit",
    type: "SS-G07",
    description: "GUNTING",
  },
  {
    table: "AAM.Unit",
    type: "SS-G08",
    description: "HEKTER",
  },
  {
    table: "AAM.Unit",
    type: "SS-G09",
    description: "ISOLASI",
  },
  {
    table: "AAM.Unit",
    type: "SS-G10",
    description: "KALKULATOR",
  },
  {
    table: "AAM.Unit",
    type: "SS-G11",
    description: "KERANJANG FILE",
  },
  {
    table: "AAM.Unit",
    type: "SS-G12",
    description: "MISTAR",
  },
  {
    table: "AAM.Unit",
    type: "SS-G13",
    description: "PAPER PACK",
  },
  {
    table: "AAM.Unit",
    type: "SS-G14",
    description: "PAPPER CUTTER",
  },
  {
    table: "AAM.Unit",
    type: "SS-G15",
    description: "PETTY CASH BOX",
  },
  {
    table: "AAM.Unit",
    type: "SS-G16",
    description: "PUNCHER",
  },
  {
    table: "AAM.Unit",
    type: "SS-G17",
    description: "RAUTAN",
  },
  {
    table: "AAM.Unit",
    type: "SS-G18",
    description: "REMOVER",
  },
  {
    table: "AAM.Unit",
    type: "SS-G19",
    description: "STAMP",
  },
  {
    table: "AAM.Unit",
    type: "SS-G20",
    description: "STAMP PAD",
  },
  {
    table: "AAM.Unit",
    type: "SS-G21",
    description: "TAS",
  },
  {
    table: "AAM.Unit",
    type: "TE-G01",
    description: "ALARM / SIRINE",
  },
  {
    table: "AAM.Unit",
    type: "TE-G02",
    description: "APAR",
  },
  {
    table: "AAM.Unit",
    type: "TE-G03",
    description: "BATON",
  },
  {
    table: "AAM.Unit",
    type: "TE-G04",
    description: "BENDA TAJAM",
  },
  {
    table: "AAM.Unit",
    type: "TE-G05",
    description: "BOX",
  },
  {
    table: "AAM.Unit",
    type: "TE-G06",
    description: "CANGKUL",
  },
  {
    table: "AAM.Unit",
    type: "TE-G07",
    description: "CLAMP HOLDER",
  },
  {
    table: "AAM.Unit",
    type: "TE-G08",
    description: "CLEANING TOOLS",
  },
  {
    table: "AAM.Unit",
    type: "TE-G09",
    description: "CUFF",
  },
  {
    table: "AAM.Unit",
    type: "TE-G10",
    description: "DONGKRAK",
  },
  {
    table: "AAM.Unit",
    type: "TE-G11",
    description: "DUROMETER",
  },
  {
    table: "AAM.Unit",
    type: "TE-G12",
    description: "GALON AIR",
  },
  {
    table: "AAM.Unit",
    type: "TE-G13",
    description: "HANDLEBAR",
  },
  {
    table: "AAM.Unit",
    type: "TE-G14",
    description: "IRON BAR",
  },
  {
    table: "AAM.Unit",
    type: "TE-G15",
    description: "JANGKA",
  },
  {
    table: "AAM.Unit",
    type: "TE-G16",
    description: "KIKIR",
  },
  {
    table: "AAM.Unit",
    type: "TE-G17",
    description: "KUNCI",
  },
  {
    table: "AAM.Unit",
    type: "TE-G18",
    description: "LABELER",
  },
  {
    table: "AAM.Unit",
    type: "TE-G19",
    description: "LINGGIS",
  },
  {
    table: "AAM.Unit",
    type: "TE-G20",
    description: "LITERAN",
  },
  {
    table: "AAM.Unit",
    type: "TE-G21",
    description: "MALL CETAKAN",
  },
  {
    table: "AAM.Unit",
    type: "TE-G22",
    description: "METERAN",
  },
  {
    table: "AAM.Unit",
    type: "TE-G23",
    description: "METERAN SOUNDING",
  },
  {
    table: "AAM.Unit",
    type: "TE-G24",
    description: "OBENG",
  },
  {
    table: "AAM.Unit",
    type: "TE-G25",
    description: "PAHAT",
  },
  {
    table: "AAM.Unit",
    type: "TE-G26",
    description: "PALU",
  },
  {
    table: "AAM.Unit",
    type: "TE-G27",
    description: "PAPAN",
  },
  {
    table: "AAM.Unit",
    type: "TE-G28",
    description: "PLANG / SPANDUK",
  },
  {
    table: "AAM.Unit",
    type: "TE-G29",
    description: "RESERVOIR",
  },
  {
    table: "AAM.Unit",
    type: "TE-G30",
    description: "ROSKAM",
  },
  {
    table: "AAM.Unit",
    type: "TE-G31",
    description: "SEKOP",
  },
  {
    table: "AAM.Unit",
    type: "TE-G32",
    description: "SELANG / PIPA",
  },
  {
    table: "AAM.Unit",
    type: "TE-G33",
    description: "SORONGAN",
  },
  {
    table: "AAM.Unit",
    type: "TE-G34",
    description: "SPRAYER",
  },
  {
    table: "AAM.Unit",
    type: "TE-G35",
    description: "TABUNG GAS",
  },
  {
    table: "AAM.Unit",
    type: "TE-G36",
    description: "TABUNG OKSIGEN",
  },
  {
    table: "AAM.Unit",
    type: "TE-G37",
    description: "TANG",
  },
  {
    table: "AAM.Unit",
    type: "TE-G38",
    description: "TANGGA",
  },
  {
    table: "AAM.Unit",
    type: "TE-G39",
    description: "TEST PEN",
  },
  {
    table: "AAM.Unit",
    type: "TE-G40",
    description: "THERMOMETER",
  },
  {
    table: "AAM.Unit",
    type: "TE-G41",
    description: "TIMBANGAN",
  },
  {
    table: "AAM.Unit",
    type: "TE-G42",
    description: "TOJOK",
  },
  {
    table: "AAM.Unit",
    type: "TE-G43",
    description: "TONG / DRUM",
  },
  {
    table: "AAM.Unit",
    type: "TE-G44",
    description: "TONG SAMPAH",
  },
  {
    table: "AAM.Unit",
    type: "TE-G45",
    description: "VERNIER CALIPER",
  },
  {
    table: "AAM.Unit",
    type: "TE-G46",
    description: "WATERPASS",
  },
  {
    table: "AAM.Unit",
    type: "TE-G47",
    description: "WHITE BOARD",
  },
  {
    table: "AAM.Unit",
    type: "TE-G48",
    description: "PIG",
  },
  {
    table: "AAM.Unit",
    type: "TE-G49",
    description: "SHAFT ALIGNMENT TOOLS",
  },
  {
    table: "AAM.Unit",
    type: "TE-G50",
    description: "BACON SAMPLER",
  },
  {
    table: "AAM.Unit",
    type: "TE-G51",
    description: "OMBROMETER",
  },
  {
    table: "AAM.Unit",
    type: "TE-L01",
    description: "BESI STATIF",
  },
  {
    table: "AAM.Unit",
    type: "TE-L02",
    description: "BURRET",
  },
  {
    table: "AAM.Unit",
    type: "TE-L03",
    description: "COMPARATOR",
  },
  {
    table: "AAM.Unit",
    type: "TE-L04",
    description: "DESICCATOR",
  },
  {
    table: "AAM.Unit",
    type: "TE-L05",
    description: "DESTILATOR",
  },
  {
    table: "AAM.Unit",
    type: "TE-L06",
    description: "DS METER",
  },
  {
    table: "AAM.Unit",
    type: "TE-L07",
    description: "HOT PLATE",
  },
  {
    table: "AAM.Unit",
    type: "TE-L08",
    description: "JARTEST",
  },
  {
    table: "AAM.Unit",
    type: "TE-L09",
    description: "LAB FURNITURE SET",
  },
  {
    table: "AAM.Unit",
    type: "TE-L10",
    description: "MOISTURE ANALYZER",
  },
  {
    table: "AAM.Unit",
    type: "TE-L11",
    description: "PENETES",
  },
  {
    table: "AAM.Unit",
    type: "TE-L12",
    description: "SENTRIFUGE",
  },
  {
    table: "AAM.Unit",
    type: "TE-L13",
    description: "ANALYSIS EQUIPMENT",
  },
  {
    table: "AAM.Unit",
    type: "TE-L14",
    description: "GRAIN SAMPLING PROBE",
  },
  {
    table: "AAM.Unit",
    type: "TE-L15",
    description: "PH METER",
  },
  {
    table: "AAM.Unit",
    type: "TE-M01",
    description: "BODY LORRY",
  },
  {
    table: "AAM.Unit",
    type: "TE-M02",
    description: "BOLLARD",
  },
  {
    table: "AAM.Unit",
    type: "TE-M03",
    description: "CHASSIS LORRY",
  },
  {
    table: "AAM.Unit",
    type: "TE-M04",
    description: "CYCLONE",
  },
  {
    table: "AAM.Unit",
    type: "TE-M05",
    description: "DISPLAY TIMBANGAN",
  },
];

export const MANUFACTURE_COLORS = [
  { value: "red", label: "Red" },
  { value: "white", label: "White" },
  { value: "brown", label: "Brown" },
  { value: "black", label: "Black" },
  { value: "silver", label: "Silver" },
];
