import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'

/**
 * InteractiveBodyMap V3 - Complete Professional Medical Body Map
 * All features from standalone app.js: zoom, severity levels, notes, JSON export, animations
 */

interface BodyRegionData {
  regionId: string
  parentRegion: string
  subRegion: string | null
  side: 'front' | 'back'
  severity?: number | null
  note?: string
}

export type BodyRegion = BodyRegionData

interface SelectionEntry {
  regionId: string
  parentRegion: string
  subRegion: string | null
  side: 'front' | 'back'
  severity: number | null
  note: string
}

// Severity System
const SEVERITY_LABELS: Record<number, string> = {
  1: 'Mild — Minor discomfort',
  2: 'Low — Noticeable but manageable',
  3: 'Moderate — Affects daily activity',
  4: 'High — Significant pain / issue',
  5: 'Severe — Urgent medical attention'
}

const SEVERITY_COLORS: Record<number, string> = {
  1: '#4ade80', 2: '#a3e635', 3: '#facc15', 4: '#fb923c', 5: '#f87171'
}

// Proportional Layout for Head
const PROPORTIONAL_LAYOUT: Record<string, Array<{ name: string; x0: number; y0: number; x1: number; y1: number }>> = {
  'Head': [
    { name: 'Scalp', x0: 0, y0: 0, x1: 1, y1: 0.16 },
    { name: 'Left Temple', x0: 0, y0: 0.16, x1: 0.22, y1: 0.57 },
    { name: 'Forehead', x0: 0.22, y0: 0.16, x1: 0.78, y1: 0.44 },
    { name: 'Right Temple', x0: 0.78, y0: 0.16, x1: 1, y1: 0.57 },
    { name: 'Left Ear', x0: 0, y0: 0.57, x1: 0.17, y1: 0.87 },
    { name: 'Right Ear', x0: 0.83, y0: 0.57, x1: 1, y1: 0.87 },
    { name: 'Left Cheek', x0: 0.17, y0: 0.58, x1: 0.35, y1: 0.90 },
    { name: 'Right Cheek', x0: 0.65, y0: 0.58, x1: 0.83, y1: 0.90 },
    { name: 'Jaw / Chin', x0: 0.06, y0: 0.88, x1: 0.94, y1: 1 },
    { name: 'Left Eye / Eyelid', x0: 0.16, y0: 0.44, x1: 0.35, y1: 0.58 },
    { name: 'Right Eye / Eyelid', x0: 0.65, y0: 0.44, x1: 0.84, y1: 0.58 },
    { name: 'Nose / Bridge', x0: 0.35, y0: 0.42, x1: 0.65, y1: 0.77 },
    { name: 'Mouth / Lips', x0: 0.28, y0: 0.85, x1: 0.70, y1: 0.93 },
    { name: 'Teeth / Gums', x0: 0.42, y0: 0.865, x1: 0.58, y1: 0.905 }
  ],
  'Head (Back)': [
    { name: 'Crown of Head', x0: 0, y0: 0, x1: 1, y1: 0.15 },
    { name: 'Occiput / Back of Head', x0: 0.13, y0: 0.15, x1: 0.87, y1: 0.68 },
    { name: 'Base of Skull', x0: 0, y0: 0.68, x1: 1, y1: 1 },
    { name: 'Behind Left Ear', x0: 0, y0: 0.48, x1: 0.15, y1: 0.80 },
    { name: 'Behind Right Ear', x0: 0.85, y0: 0.48, x1: 1, y1: 0.80 }
  ]
}

const GRID_COLS_OVERRIDE: Record<string, number> = {
  'Neck': 3, 'Chest': 3, 'Abdomen': 3, 'Pelvis': 3, 'Upper Back': 3, 'Lower Back': 3,
  'Left Upper Arm': 3, 'Right Upper Arm': 3, 'Left Thigh': 3, 'Right Thigh': 3,
  'Left Knee (Back)': 3, 'Right Knee (Back)': 3, 'Left Shin': 2, 'Right Shin': 2
}

const REGION_HIERARCHY: Record<string, string[]> = {
  'Head': ['Forehead', 'Scalp', 'Left Temple', 'Right Temple', 'Left Eye / Eyelid', 'Right Eye / Eyelid', 'Nose / Bridge', 'Left Ear', 'Right Ear', 'Mouth / Lips', 'Teeth / Gums', 'Jaw / Chin', 'Left Cheek', 'Right Cheek'],
  'Neck': ['Left Side of Neck', 'Front of Neck', 'Right Side of Neck', 'Thyroid Area', 'Throat / Voicebox', 'Collarbone Area'],
  'Left Shoulder': ['Acromion', 'Front Deltoid', 'Side Deltoid', 'Shoulder Joint', 'Rotator Cuff Area'],
  'Right Shoulder': ['Acromion', 'Front Deltoid', 'Side Deltoid', 'Shoulder Joint', 'Rotator Cuff Area'],
  'Chest': ['Left Collarbone', 'Upper Chest', 'Right Collarbone', 'Left Breast / Pectoral', 'Sternum / Mid-Chest', 'Right Breast / Pectoral', 'Left Rib Cage', 'Lower Chest', 'Right Rib Cage'],
  'Abdomen': ['Upper Left Abdomen', 'Upper Abdomen', 'Upper Right Abdomen', 'Left Flank', 'Navel Area', 'Right Flank', 'Lower Left Abdomen', 'Lower Abdomen', 'Lower Right Abdomen'],
  'Left Upper Arm': ['Outer Upper Arm', 'Bicep', 'Inner Upper Arm'],
  'Right Upper Arm': ['Inner Upper Arm', 'Bicep', 'Outer Upper Arm'],
  'Left Forearm': ['Elbow Crease', 'Outer Forearm', 'Inner Forearm', 'Wrist'],
  'Right Forearm': ['Elbow Crease', 'Inner Forearm', 'Outer Forearm', 'Wrist'],
  'Left Hand': ['Palm', 'Thumb', 'Index', 'Middle', 'Ring', 'Little', 'Knuckles'],
  'Right Hand': ['Palm', 'Thumb', 'Index', 'Middle', 'Ring', 'Little', 'Knuckles'],
  'Pelvis': ['Left Hip', 'Iliac Crest', 'Right Hip', 'Left Groin', 'Pubic Region', 'Right Groin'],
  'Left Thigh': ['Outer Thigh', 'Front Thigh', 'Inner Thigh'],
  'Right Thigh': ['Inner Thigh', 'Front Thigh', 'Outer Thigh'],
  'Left Knee': ['Kneecap', 'Outer Knee', 'Inner Knee', 'Below Kneecap'],
  'Right Knee': ['Kneecap', 'Inner Knee', 'Outer Knee', 'Below Kneecap'],
  'Left Shin': ['Outer Lower Leg', 'Shin Bone', 'Front Ankle', 'Inner Ankle'],
  'Right Shin': ['Shin Bone', 'Outer Lower Leg', 'Inner Ankle', 'Front Ankle'],
  'Left Foot': ['Ankle Joint', 'Top', 'Arch', 'Outer Toes', 'Middle Toes', 'Big Toe'],
  'Right Foot': ['Ankle Joint', 'Top', 'Arch', 'Big Toe', 'Middle Toes', 'Outer Toes'],
  'Head (Back)': ['Occiput', 'Crown', 'Base of Skull', 'Behind Left Ear', 'Behind Right Ear'],
  'Neck (Back)': ['Left Cervical', 'Upper Spine', 'Base', 'Right Cervical'],
  'Left Shoulder (Back)': ['Upper Trapezius', 'Rear Deltoid', 'Scapula'],
  'Right Shoulder (Back)': ['Upper Trapezius', 'Rear Deltoid', 'Scapula'],
  'Upper Back': ['Left Shoulder Blade', 'Spine', 'Right Shoulder Blade', 'Left Upper', 'Mid Spine', 'Right Upper'],
  'Lower Back': ['Left Lower Back', 'Lumbar Spine', 'Right Lower Back', 'Left SI Joint', 'Sacrum', 'Right SI Joint', 'Tailbone'],
  'Left Tricep': ['Tricep Lateral', 'Tricep Long', 'Back of Elbow'],
  'Right Tricep': ['Tricep Long', 'Tricep Lateral', 'Back of Elbow'],
  'Left Forearm (Back)': ['Elbow Tip', 'Back Forearm', 'Back Wrist'],
  'Right Forearm (Back)': ['Elbow Tip', 'Back Forearm', 'Back Wrist'],
  'Buttocks': ['Left Gluteus', 'Gluteus Medius', 'Piriformis', 'Right Gluteus'],
  'Left Hamstring': ['Upper', 'Outer', 'Inner', 'Lower'],
  'Right Hamstring': ['Upper', 'Inner', 'Outer', 'Lower'],
  'Left Knee (Back)': ['Outer Back', 'Behind Knee', 'Inner Back'],
  'Right Knee (Back)': ['Inner Back', 'Behind Knee', 'Outer Back'],
  'Left Calf': ['Upper Calf', 'Lower Calf', 'Achilles'],
  'Right Calf': ['Upper Calf', 'Lower Calf', 'Achilles'],
}

const SVG_PATHS = {
  front: {
    'f-head': 'M 1002.0,3.0 L 926.0,31.3 L 898.0,59.7 L 881.0,88.0 L 871.0,116.3 L 865.0,144.7 L 861.0,173.0 L 860.0,201.3 L 860.0,229.7 L 850.0,258.0 L 847.0,286.3 L 851.0,314.7 L 856.0,343.0 L 888.0,371.3 L 893.0,399.7 L 903.0,428.0 L 1126.0,428.0 L 1135.0,399.7 L 1140.0,371.3 L 1172.0,343.0 L 1177.0,314.7 L 1180.0,286.3 L 1179.0,258.0 L 1166.0,229.7 L 1166.0,201.3 L 1165.0,173.0 L 1161.0,144.7 L 1155.0,116.3 L 1145.0,88.0 L 1128.0,59.7 L 1100.0,31.3 L 1022.0,3.0 Z',
    'f-neck': 'M 903.0,428.0 L 910.0,452.6 L 911.0,477.1 L 911.0,501.7 L 911.0,526.3 L 899.0,550.9 L 870.0,575.4 L 836.0,600.0 L 1200.0,600.0 L 1164.0,575.4 L 1134.0,550.9 L 1122.0,526.3 L 1120.0,501.7 L 1120.0,477.1 L 1121.0,452.6 L 1126.0,428.0 Z',
    'f-left-shoulder': 'M 836.0,600.0 L 793.0,628.2 L 669.0,656.4 L 635.0,684.6 L 611.0,712.8 L 593.0,741.0 L 580.0,769.2 L 574.0,797.4 L 570.0,825.6 L 570.0,853.8 L 561.0,882.0 L 555.0,910.2 L 553.0,938.4 L 543.0,966.6 L 531.0,994.8 L 519.0,1023.0 L 519.0,1023.0 L 544.6,994.8 L 570.2,966.6 L 595.8,938.4 L 621.4,910.2 L 647.0,882.0 L 672.6,853.8 L 698.2,825.6 L 723.8,797.4 L 749.4,769.2 L 775.0,741.0 L 800.6,712.8 L 826.2,684.6 L 851.8,656.4 L 877.4,628.2 L 903.0,600.0 Z',
    'f-right-shoulder': 'M 1200.0,600.0 L 1248.0,628.2 L 1374.0,656.4 L 1404.0,684.6 L 1428.0,712.8 L 1444.0,741.0 L 1456.0,769.2 L 1462.0,797.4 L 1463.0,825.6 L 1465.0,853.8 L 1474.0,882.0 L 1479.0,910.2 L 1482.0,938.4 L 1492.0,966.6 L 1505.0,994.8 L 1516.0,1023.0 L 1516.0,1023.0 L 1490.0,994.8 L 1464.0,966.6 L 1438.0,938.4 L 1412.0,910.2 L 1386.0,882.0 L 1360.0,853.8 L 1334.0,825.6 L 1308.0,797.4 L 1282.0,769.2 L 1256.0,741.0 L 1230.0,712.8 L 1204.0,684.6 L 1178.0,656.4 L 1152.0,628.2 L 1126.0,600.0 Z',
    'f-chest': 'M 903.0,600.0 L 860.3,647.0 L 817.7,694.0 L 775.0,741.0 L 732.3,788.0 L 689.7,835.0 L 647.0,882.0 L 604.3,929.0 L 561.7,976.0 L 519.0,1023.0 L 739.0,1023.0 L 748.0,1047.6 L 755.0,1072.1 L 760.0,1096.7 L 766.0,1121.3 L 771.0,1145.9 L 776.0,1170.4 L 776.0,1195.0 L 1264.0,1195.0 L 1264.0,1170.4 L 1267.0,1145.9 L 1272.0,1121.3 L 1278.0,1096.7 L 1283.0,1072.1 L 1288.0,1047.6 L 1296.0,1023.0 L 1516.0,1023.0 L 1472.7,976.0 L 1429.3,929.0 L 1386.0,882.0 L 1342.7,835.0 L 1299.3,788.0 L 1256.0,741.0 L 1212.7,694.0 L 1169.3,647.0 L 1126.0,600.0 Z',
    'f-abdomen': 'M 776.0,1195.0 L 774.0,1234.4 L 767.0,1273.9 L 759.0,1313.3 L 753.0,1352.8 L 755.0,1392.2 L 744.0,1431.7 L 733.0,1471.1 L 722.0,1510.6 L 714.0,1550.0 L 1328.0,1550.0 L 1321.0,1510.6 L 1309.0,1471.1 L 1298.0,1431.7 L 1285.0,1392.2 L 1286.0,1352.8 L 1280.0,1313.3 L 1273.0,1273.9 L 1266.0,1234.4 L 1264.0,1195.0 Z',
    'f-left-upper-arm': 'M 519.0,1023.0 L 505.0,1061.1 L 494.0,1099.3 L 471.0,1137.4 L 437.0,1175.6 L 409.0,1213.7 L 384.0,1251.9 L 364.0,1290.0 L 561.0,1290.0 L 576.0,1251.9 L 596.0,1213.7 L 625.0,1175.6 L 656.0,1137.4 L 684.0,1099.3 L 709.0,1061.1 L 732.0,1023.0 Z',
    'f-right-upper-arm': 'M 1304.0,1023.0 L 1327.0,1061.1 L 1352.0,1099.3 L 1380.0,1137.4 L 1414.0,1175.6 L 1442.0,1213.7 L 1461.0,1251.9 L 1476.0,1290.0 L 1674.0,1290.0 L 1654.0,1251.9 L 1630.0,1213.7 L 1603.0,1175.6 L 1569.0,1137.4 L 1542.0,1099.3 L 1530.0,1061.1 L 1516.0,1023.0 Z',
    'f-left-forearm': 'M 364.0,1290.0 L 343.0,1328.6 L 320.0,1367.1 L 294.0,1405.7 L 267.0,1444.3 L 234.0,1482.9 L 199.0,1521.4 L 168.0,1560.0 L 312.0,1560.0 L 345.0,1521.4 L 380.0,1482.9 L 419.0,1444.3 L 460.0,1405.7 L 500.0,1367.1 L 535.0,1328.6 L 561.0,1290.0 Z',
    'f-right-forearm': 'M 1476.0,1290.0 L 1504.0,1328.6 L 1539.0,1367.1 L 1580.0,1405.7 L 1620.0,1444.3 L 1659.0,1482.9 L 1694.0,1521.4 L 1727.0,1560.0 L 1870.0,1560.0 L 1840.0,1521.4 L 1806.0,1482.9 L 1772.0,1444.3 L 1744.0,1405.7 L 1718.0,1367.1 L 1695.0,1328.6 L 1674.0,1290.0 Z',
    'f-left-hand': 'M 312,1560 L 168,1560 L 46,1628 L 13,1681 L 48,1678 L 93,1645 L 100,1652 L 0,1832 L 25,1830 L 110,1729 L 54,1868 L 61,1896 L 83,1884 L 148,1748 L 110,1895 L 122,1899 L 139,1883 L 195,1754 L 194,1864 L 210,1856 L 231,1751 L 274,1673 L 291,1591 Z',
    'f-right-hand': 'M 1727,1560 L 1745,1589 L 1768,1687 L 1805,1749 L 1827,1856 L 1839,1863 L 1847,1853 L 1840,1752 L 1897,1884 L 1915,1899 L 1926,1894 L 1887,1746 L 1954,1886 L 1977,1894 L 1978,1857 L 1927,1726 L 2019,1833 L 2036,1828 L 1936,1650 L 1960,1652 L 1996,1681 L 2023,1680 L 1992,1631 L 1870,1560 Z',
    'f-pelvis': 'M 714.0,1550.0 L 711.0,1582.9 L 709.0,1615.7 L 707.0,1648.6 L 704.0,1681.4 L 699.0,1714.3 L 692.0,1747.1 L 683.0,1780.0 L 991.0,1780.0 L 1344.0,1747.1 L 1338.0,1714.3 L 1335.0,1681.4 L 1334.0,1648.6 L 1331.0,1615.7 L 1331.0,1582.9 L 1328.0,1550.0 Z',
    'f-left-thigh': 'M 683.0,1780.0 L 668.0,1843.3 L 656.0,1906.7 L 646.0,1970.0 L 640.0,2033.3 L 638.0,2096.7 L 639.0,2160.0 L 640.0,2223.3 L 638.0,2286.7 L 625.0,2350.0 L 839.0,2350.0 L 854.0,2286.7 L 872.0,2223.3 L 899.0,2160.0 L 919.0,2096.7 L 939.0,2033.3 L 962.0,1970.0 L 977.0,1906.7 L 981.0,1843.3 L 991.0,1780.0 Z',
    'f-right-thigh': 'M 1048.0,1780.0 L 1055.0,1843.3 L 1061.0,1906.7 L 1075.0,1970.0 L 1097.0,2033.3 L 1117.0,2096.7 L 1137.0,2160.0 L 1165.0,2223.3 L 1182.0,2286.7 L 1197.0,2350.0 L 1411.0,2350.0 L 1397.0,2286.7 L 1396.0,2223.3 L 1397.0,2160.0 L 1397.0,2096.7 L 1396.0,2033.3 L 1390.0,1970.0 L 1379.0,1906.7 L 1367.0,1843.3 L 1352.0,1780.0 Z',
    'f-left-knee': 'M 625.0,2350.0 L 619.0,2390.0 L 615.0,2430.0 L 612.0,2470.0 L 604.0,2510.0 L 584.0,2550.0 L 774.0,2550.0 L 786.0,2510.0 L 802.0,2470.0 L 819.0,2430.0 L 830.0,2390.0 L 839.0,2350.0 Z',
    'f-right-knee': 'M 1197.0,2350.0 L 1206.0,2390.0 L 1218.0,2430.0 L 1234.0,2470.0 L 1248.0,2510.0 L 1258.0,2550.0 L 1448.0,2550.0 L 1427.0,2510.0 L 1423.0,2470.0 L 1421.0,2430.0 L 1417.0,2390.0 L 1411.0,2350.0 Z',
    'f-left-shin': 'M 584.0,2550.0 L 570.0,2598.0 L 555.0,2646.0 L 547.0,2694.0 L 541.0,2742.0 L 540.0,2790.0 L 542.0,2838.0 L 542.0,2886.0 L 542.0,2934.0 L 542.0,2982.0 L 542.0,3030.0 L 543.0,3078.0 L 545.0,3126.0 L 549.0,3174.0 L 554.0,3222.0 L 547.0,3270.0 L 671.0,3270.0 L 662.0,3222.0 L 661.0,3174.0 L 668.0,3126.0 L 675.0,3078.0 L 684.0,3030.0 L 696.0,2982.0 L 708.0,2934.0 L 722.0,2886.0 L 742.0,2838.0 L 754.0,2790.0 L 759.0,2742.0 L 762.0,2694.0 L 760.0,2646.0 L 762.0,2598.0 L 774.0,2550.0 Z',
    'f-right-shin': 'M 1258.0,2550.0 L 1269.0,2598.0 L 1275.0,2646.0 L 1276.0,2694.0 L 1278.0,2742.0 L 1282.0,2790.0 L 1294.0,2838.0 L 1312.0,2886.0 L 1325.0,2934.0 L 1336.0,2982.0 L 1346.0,3030.0 L 1354.0,3078.0 L 1361.0,3126.0 L 1365.0,3174.0 L 1367.0,3222.0 L 1364.0,3270.0 L 1487.0,3270.0 L 1477.0,3222.0 L 1479.0,3174.0 L 1484.0,3126.0 L 1487.0,3078.0 L 1489.0,3030.0 L 1490.0,2982.0 L 1492.0,2934.0 L 1492.0,2886.0 L 1494.0,2838.0 L 1496.0,2790.0 L 1496.0,2742.0 L 1491.0,2694.0 L 1480.0,2646.0 L 1466.0,2598.0 L 1448.0,2550.0 Z',
    'f-left-foot': 'M 533.0,3270.0 L 531.0,3351.4 L 504.0,3432.8 L 468.0,3514.2 L 455.0,3595.6 L 481.0,3677.0 L 634.0,3677.0 L 665.0,3595.6 L 661.0,3514.2 L 668.0,3432.8 L 669.0,3351.4 L 672.0,3270.0 Z',
    'f-right-foot': 'M 1362.0,3270.0 L 1365.0,3351.4 L 1366.0,3432.8 L 1373.0,3514.2 L 1370.0,3595.6 L 1399.0,3677.0 L 1553.0,3677.0 L 1579.0,3595.6 L 1567.0,3514.2 L 1529.0,3432.8 L 1505.0,3351.4 L 1502.0,3270.0 Z'
  },
  back: {
    'b-head': 'M 1063.0,2.0 L 989.0,28.5 L 959.0,55.1 L 939.0,81.6 L 927.0,108.1 L 920.0,134.7 L 915.0,161.2 L 913.0,187.7 L 915.0,214.3 L 899.0,240.8 L 902.0,267.3 L 905.0,293.9 L 914.0,320.4 L 930.0,346.9 L 943.0,373.5 L 947.0,400.0 L 1188.0,400.0 L 1191.0,373.5 L 1206.0,346.9 L 1220.0,320.4 L 1230.0,293.9 L 1233.0,267.3 L 1236.0,240.8 L 1222.0,214.3 L 1223.0,187.7 L 1221.0,161.2 L 1217.0,134.7 L 1210.0,108.1 L 1198.0,81.6 L 1178.0,55.1 L 1152.0,28.5 L 1082.0,2.0 Z',
    'b-neck': 'M 947.0,400.0 L 948.0,412.0 L 951.0,424.0 L 935.0,436.0 L 919.0,448.0 L 900.0,460.0 L 1230.0,460.0 L 1212.0,448.0 L 1197.0,436.0 L 1183.0,424.0 L 1186.0,412.0 L 1188.0,400.0 Z',
    'b-left-shoulder': 'M 900.0,460.0 L 849.0,486.8 L 787.0,513.6 L 727.0,540.4 L 676.0,567.2 L 650.0,594.0 L 633.0,620.8 L 621.0,647.6 L 612.0,674.4 L 601.0,701.2 L 590.0,728.0 L 576.0,754.8 L 566.0,781.6 L 560.0,808.4 L 554.0,835.2 L 537.0,862.0 L 537.0,862.0 L 564.3,835.2 L 591.7,808.4 L 619.0,781.6 L 646.3,754.8 L 673.7,728.0 L 701.0,701.2 L 728.3,674.4 L 755.7,647.6 L 783.0,620.8 L 810.3,594.0 L 837.7,567.2 L 865.0,540.4 L 892.3,513.6 L 919.7,486.8 L 947.0,460.0 Z',
    'b-right-shoulder': 'M 1230.0,460.0 L 1276.0,486.8 L 1330.0,513.6 L 1394.0,540.4 L 1450.0,567.2 L 1479.0,594.0 L 1496.0,620.8 L 1509.0,647.6 L 1518.0,674.4 L 1530.0,701.2 L 1540.0,728.0 L 1554.0,754.8 L 1565.0,781.6 L 1571.0,808.4 L 1578.0,835.2 L 1594.0,862.0 L 1594.0,862.0 L 1566.9,835.2 L 1539.9,808.4 L 1512.8,781.6 L 1485.7,754.8 L 1458.7,728.0 L 1431.6,701.2 L 1404.5,674.4 L 1377.5,647.6 L 1350.4,620.8 L 1323.3,594.0 L 1296.3,567.2 L 1269.2,540.4 L 1242.1,513.6 L 1215.1,486.8 L 1188.0,460.0 Z',
    'b-upper-back': 'M 947.0,460.0 L 901.4,504.7 L 855.9,549.3 L 810.3,594.0 L 764.8,638.7 L 719.2,683.3 L 673.7,728.0 L 628.1,772.7 L 582.6,817.3 L 537.0,862.0 L 774.0,862.0 L 776.0,897.6 L 782.0,933.1 L 791.0,968.7 L 798.0,1004.2 L 804.0,1039.8 L 808.0,1075.3 L 811.0,1110.9 L 813.0,1146.4 L 814.0,1182.0 L 1309.0,1182.0 L 1311.0,1146.4 L 1311.0,1110.9 L 1313.0,1075.3 L 1317.0,1039.8 L 1321.0,1004.2 L 1328.0,968.7 L 1336.0,933.1 L 1344.0,897.6 L 1351.0,862.0 L 1594.0,862.0 L 1548.9,817.3 L 1503.8,772.7 L 1458.7,728.0 L 1413.6,683.3 L 1368.4,638.7 L 1323.3,594.0 L 1278.2,549.3 L 1233.1,504.7 L 1188.0,460.0 Z',
    'b-lower-back': 'M 814.0,1182.0 L 809.0,1235.3 L 808.0,1288.6 L 796.0,1341.9 L 780.0,1395.1 L 763.0,1448.4 L 751.0,1501.7 L 745.0,1555.0 L 1377.0,1555.0 L 1370.0,1501.7 L 1357.0,1448.4 L 1343.0,1395.1 L 1324.0,1341.9 L 1315.0,1288.6 L 1312.0,1235.3 L 1309.0,1182.0 Z',
    'b-left-tricep': 'M 537.0,862.0 L 505.0,923.1 L 473.0,984.3 L 417.0,1045.4 L 380.0,1106.6 L 351.0,1167.7 L 326.0,1228.9 L 302.0,1290.0 L 476.0,1290.0 L 519.0,1228.9 L 551.0,1167.7 L 579.0,1106.6 L 628.0,1045.4 L 681.0,984.3 L 729.0,923.1 L 763.0,862.0 Z',
    'b-right-tricep': 'M 1361.0,862.0 L 1400.0,923.1 L 1449.0,984.3 L 1503.0,1045.4 L 1547.0,1106.6 L 1578.0,1167.7 L 1609.0,1228.9 L 1651.0,1290.0 L 1826.0,1290.0 L 1803.0,1228.9 L 1779.0,1167.7 L 1749.0,1106.6 L 1711.0,1045.4 L 1656.0,984.3 L 1627.0,923.1 L 1594.0,862.0 Z',
    'b-left-forearm': 'M 302.0,1290.0 L 285.0,1328.6 L 266.0,1367.1 L 246.0,1405.7 L 221.0,1444.3 L 196.0,1482.9 L 171.0,1521.4 L 115.0,1560.0 L 294.0,1560.0 L 309.0,1521.4 L 331.0,1482.9 L 358.0,1444.3 L 385.0,1405.7 L 416.0,1367.1 L 447.0,1328.6 L 476.0,1290.0 Z',
    'b-right-forearm': 'M 1651.0,1290.0 L 1681.0,1328.6 L 1712.0,1367.1 L 1741.0,1405.7 L 1768.0,1444.3 L 1795.0,1482.9 L 1817.0,1521.4 L 1833.0,1560.0 L 2013.0,1560.0 L 1955.0,1521.4 L 1930.0,1482.9 L 1906.0,1444.3 L 1882.0,1405.7 L 1862.0,1367.1 L 1842.0,1328.6 L 1826.0,1290.0 Z',
    'b-buttocks': 'M 745.0,1555.0 L 742.0,1589.0 L 739.0,1623.0 L 737.0,1657.0 L 735.0,1691.0 L 1086.0,1725.0 L 1396.0,1725.0 L 1390.0,1691.0 L 1387.0,1657.0 L 1383.0,1623.0 L 1380.0,1589.0 L 1377.0,1555.0 Z',
    'b-left-hamstring': 'M 729.0,1725.0 L 718.0,1786.7 L 708.0,1848.3 L 697.0,1910.0 L 690.0,1971.7 L 686.0,2033.3 L 684.0,2095.0 L 684.0,2156.7 L 687.0,2218.3 L 672.0,2280.0 L 896.0,2280.0 L 909.0,2218.3 L 937.0,2156.7 L 957.0,2095.0 L 976.0,2033.3 L 997.0,1971.7 L 1015.0,1910.0 L 1023.0,1848.3 L 1026.0,1786.7 L 1037.0,1725.0 Z',
    'b-right-hamstring': 'M 1086.0,1725.0 L 1099.0,1786.7 L 1102.0,1848.3 L 1110.0,1910.0 L 1129.0,1971.7 L 1150.0,2033.3 L 1170.0,2095.0 L 1190.0,2156.7 L 1217.0,2218.3 L 1231.0,2280.0 L 1455.0,2280.0 L 1440.0,2218.3 L 1442.0,2156.7 L 1443.0,2095.0 L 1442.0,2033.3 L 1438.0,1971.7 L 1429.0,1910.0 L 1420.0,1848.3 L 1409.0,1786.7 L 1396.0,1725.0 Z',
    'b-left-knee': 'M 672.0,2280.0 L 663.0,2320.0 L 658.0,2360.0 L 653.0,2400.0 L 651.0,2440.0 L 648.0,2480.0 L 834.0,2480.0 L 852.0,2440.0 L 867.0,2400.0 L 875.0,2360.0 L 886.0,2320.0 L 896.0,2280.0 Z',
    'b-right-knee': 'M 1231.0,2280.0 L 1241.0,2320.0 L 1251.0,2360.0 L 1260.0,2400.0 L 1275.0,2440.0 L 1293.0,2480.0 L 1481.0,2480.0 L 1477.0,2440.0 L 1474.0,2400.0 L 1469.0,2360.0 L 1464.0,2320.0 L 1455.0,2280.0 Z',
    'b-left-calf': 'M 648.0,2480.0 L 628.0,2530.0 L 606.0,2580.0 L 590.0,2630.0 L 577.0,2680.0 L 567.0,2730.0 L 560.0,2780.0 L 560.0,2830.0 L 570.0,2880.0 L 579.0,2930.0 L 580.0,2980.0 L 582.0,3030.0 L 584.0,3080.0 L 587.0,3130.0 L 593.0,3180.0 L 593.0,3230.0 L 709.0,3230.0 L 713.0,3180.0 L 716.0,3130.0 L 722.0,3080.0 L 729.0,3030.0 L 739.0,2980.0 L 750.0,2930.0 L 768.0,2880.0 L 784.0,2830.0 L 791.0,2780.0 L 797.0,2730.0 L 799.0,2680.0 L 803.0,2630.0 L 810.0,2580.0 L 821.0,2530.0 L 834.0,2480.0 Z',
    'b-right-calf': 'M 1293.0,2480.0 L 1309.0,2530.0 L 1322.0,2580.0 L 1329.0,2630.0 L 1326.0,2680.0 L 1329.0,2730.0 L 1335.0,2780.0 L 1343.0,2830.0 L 1359.0,2880.0 L 1379.0,2930.0 L 1392.0,2980.0 L 1404.0,3030.0 L 1412.0,3080.0 L 1419.0,3130.0 L 1424.0,3180.0 L 1419.0,3230.0 L 1538.0,3230.0 L 1543.0,3180.0 L 1546.0,3130.0 L 1549.0,3080.0 L 1550.0,3030.0 L 1551.0,2980.0 L 1551.0,2930.0 L 1556.0,2880.0 L 1566.0,2830.0 L 1567.0,2780.0 L 1559.0,2730.0 L 1549.0,2680.0 L 1537.0,2630.0 L 1520.0,2580.0 L 1504.0,2530.0 L 1481.0,2480.0 Z',
    'b-left-foot': 'M 588.0,3230.0 L 558.0,3320.0 L 544.0,3410.0 L 531.0,3500.0 L 514.0,3590.0 L 523.0,3680.0 L 697.0,3680.0 L 713.0,3590.0 L 707.0,3500.0 L 704.0,3410.0 L 714.0,3320.0 L 712.0,3230.0 Z',
    'b-right-foot': 'M 1416.0,3230.0 L 1415.0,3320.0 L 1424.0,3410.0 L 1423.0,3500.0 L 1417.0,3590.0 L 1433.0,3680.0 L 1605.0,3680.0 L 1615.0,3590.0 L 1599.0,3500.0 L 1582.0,3410.0 L 1569.0,3320.0 L 1541.0,3230.0 Z'
  }
}

const REGION_ID_TO_NAME: Record<string, string> = {
  'f-head': 'Head', 'f-neck': 'Neck', 'f-left-shoulder': 'Left Shoulder',
  'f-right-shoulder': 'Right Shoulder', 'f-chest': 'Chest', 'f-abdomen': 'Abdomen',
  'f-left-upper-arm': 'Left Upper Arm', 'f-right-upper-arm': 'Right Upper Arm',
  'f-left-forearm': 'Left Forearm', 'f-right-forearm': 'Right Forearm',
  'f-left-hand': 'Left Hand', 'f-right-hand': 'Right Hand', 'f-pelvis': 'Pelvis',
  'f-left-thigh': 'Left Thigh', 'f-right-thigh': 'Right Thigh',
  'f-left-knee': 'Left Knee', 'f-right-knee': 'Right Knee',
  'f-left-shin': 'Left Shin', 'f-right-shin': 'Right Shin',
  'f-left-foot': 'Left Foot', 'f-right-foot': 'Right Foot',
  'b-head': 'Head (Back)', 'b-neck': 'Neck (Back)', 'b-left-shoulder': 'Left Shoulder (Back)',
  'b-right-shoulder': 'Right Shoulder (Back)', 'b-upper-back': 'Upper Back', 'b-lower-back': 'Lower Back',
  'b-left-tricep': 'Left Tricep', 'b-right-tricep': 'Right Tricep',
  'b-left-forearm': 'Left Forearm (Back)', 'b-right-forearm': 'Right Forearm (Back)',
  'b-left-hand': 'Left Hand (Back)', 'b-right-hand': 'Right Hand (Back)',
  'b-buttocks': 'Buttocks', 'b-left-hamstring': 'Left Hamstring', 'b-right-hamstring': 'Right Hamstring',
  'b-left-knee': 'Left Knee (Back)', 'b-right-knee': 'Right Knee (Back)',
  'b-left-calf': 'Left Calf', 'b-right-calf': 'Right Calf',
  'b-left-foot': 'Left Foot (Back)', 'b-right-foot': 'Right Foot (Back)'
}

export type BodyMapGender = 'male' | 'female'

interface InteractiveBodyMapProps {
  onSelectRegion?: (regions: BodyRegion[]) => void
  selectedRegions?: BodyRegion[]
  gender?: BodyMapGender
}

export function InteractiveBodyMap({ onSelectRegion, selectedRegions: _props = [], gender = 'male' }: InteractiveBodyMapProps) {
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front')
  const [selections, setSelections] = useState<Map<string, SelectionEntry>>(new Map())
  const [activeSelectionKey, setActiveSelectionKey] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [zoomedRegion, setZoomedRegion] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const [hotspots, setHotspots] = useState<Array<{ name: string; x: number; y: number; width: number; height: number }>>([])
  const [viewBox, setViewBox] = useState<string>('0 0 2037 3681')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportJson, setExportJson] = useState<string>('')
  const [toast, setToast] = useState<string | null>(null)

  const pathDict = currentView === 'front' ? SVG_PATHS.front : SVG_PATHS.back
  const imageSources = {
    male: { front: '/front-m.webp', back: '/back-m.webp' },
    female: { front: '/front-f.webp', back: '/back-f.webp' },
  } as const
  const imgSrc = imageSources[gender][currentView]

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  const buildHotspotsForRegion = (_regionId: string, parentRegion: string) => {
    const subList = REGION_HIERARCHY[parentRegion] || []
    
    if (PROPORTIONAL_LAYOUT[parentRegion]) {
      const layout = PROPORTIONAL_LAYOUT[parentRegion]
      setHotspots(layout.map(item => ({
        name: item.name,
        x: item.x0 * 100,
        y: item.y0 * 100,
        width: (item.x1 - item.x0) * 100,
        height: (item.y1 - item.y0) * 100
      })))
      return
    }

    const n = subList.length
    const cols = GRID_COLS_OVERRIDE[parentRegion] || Math.max(1, Math.ceil(Math.sqrt(n)))
    const rows = Math.ceil(n / cols)
    const cellWidth = 100 / cols
    const cellHeight = 100 / rows
    
    const spots = []
    for (let i = 0; i < n; i++) {
      spots.push({
        name: subList[i],
        x: (i % cols) * cellWidth,
        y: Math.floor(i / cols) * cellHeight,
        width: cellWidth,
        height: cellHeight
      })
    }
    setHotspots(spots)
  }

  const handleRegionClick = (regionId: string) => {
    const parentRegion = REGION_ID_TO_NAME[regionId]
    const side = currentView
    if (!parentRegion) return

    if (!zoomedRegion) {
      setZoomedRegion(regionId)
      buildHotspotsForRegion(regionId, parentRegion)
      return
    }

    if (zoomedRegion === regionId) {
      const key = `${regionId}::entire`
      if (selections.has(key)) {
        selections.delete(key)
      } else {
        selections.set(key, {
          regionId, parentRegion, subRegion: null, side,
          severity: null, note: ''
        })
      }
      setSelections(new Map(selections))
    }
  }

  const handleSubregionClick = (subName: string) => {
    if (!zoomedRegion) return
    const parentRegion = REGION_ID_TO_NAME[zoomedRegion]
    const key = `${zoomedRegion}::${subName}`
    const side = currentView

    if (selections.has(key)) {
      selections.delete(key)
      if (activeSelectionKey === key) setActiveSelectionKey(null)
    } else {
      selections.set(key, {
        regionId: zoomedRegion, parentRegion, subRegion: subName, side,
        severity: null, note: ''
      })
      setActiveSelectionKey(key)
    }
    setSelections(new Map(selections))
  }

  const handleSeverityChange = (level: number) => {
    if (!activeSelectionKey) return
    const data = selections.get(activeSelectionKey)
    if (!data) return
    data.severity = data.severity === level ? null : level
    selections.set(activeSelectionKey, data)
    setSelections(new Map(selections))
  }

  const handleNoteSave = (note: string) => {
    if (!activeSelectionKey) return
    const data = selections.get(activeSelectionKey)
    if (!data) return
    data.note = note.trim()
    selections.set(activeSelectionKey, data)
    setSelections(new Map(selections))
    showToast('Note saved')
  }

  const handleExport = () => {
    const exportData: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      totalSelections: selections.size,
      selections: Array.from(selections.values()).map(d => ({
        parentRegion: d.parentRegion,
        subRegion: d.subRegion,
        view: d.side,
        severity: d.severity,
        severityLabel: d.severity ? SEVERITY_LABELS[d.severity].split(' — ')[0] : null,
        note: d.note || null
      }))
    }
    setExportJson(JSON.stringify(exportData, null, 2))
    setShowExportModal(true)
  }

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(exportJson)
    showToast('Copied to clipboard')
  }

  const handleClearAll = () => {
    setSelections(new Map())
    setActiveSelectionKey(null)
    setZoomedRegion(null)
    setHotspots([])
    showToast('All selections cleared')
  }

  const handleRemoveSelection = (key: string) => {
    selections.delete(key)
    if (activeSelectionKey === key) setActiveSelectionKey(null)
    setSelections(new Map(selections))
  }

  const unzoomBody = () => {
    setZoomedRegion(null)
    setHotspots([])
    setViewBox(currentView === 'front' ? '0 0 2037 3681' : '0 0 2130 3681')
  }

  const handleViewToggle = (view: 'front' | 'back') => {
    setCurrentView(view)
    unzoomBody()
  }

  const getMaxSeverity = (regionId: string): number | null => {
    let max: number | null = null
    selections.forEach(sel => {
      if (sel.regionId === regionId && sel.severity && (!max || sel.severity > max)) {
        max = sel.severity
      }
    })
    return max
  }

  useEffect(() => {
    const regions = Array.from(selections.values()).map(sel => ({
      regionId: sel.regionId,
      parentRegion: sel.parentRegion,
      subRegion: sel.subRegion,
      side: sel.side,
      severity: sel.severity || undefined,
      note: sel.note || undefined
    }))
    onSelectRegion?.(regions)
  }, [selections, onSelectRegion])

  const activeSelection = activeSelectionKey ? selections.get(activeSelectionKey) : null

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-soft-mint/30">
        <div className="flex gap-2">
          <button
            onClick={() => handleViewToggle('front')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'front'
                ? 'bg-primary-teal text-white'
                : 'text-neutral-gray hover:bg-soft-mint/20'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => handleViewToggle('back')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'back'
                ? 'bg-primary-teal text-white'
                : 'text-neutral-gray hover:bg-soft-mint/20'
            }`}
          >
            Back
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} disabled={selections.size === 0}
            className="px-4 py-2 rounded-lg font-medium text-deep-blue border border-deep-blue hover:bg-deep-blue/10 disabled:opacity-50"
          >
            Export JSON
          </button>
          <button onClick={handleClearAll} disabled={selections.size === 0}
            className="px-4 py-2 rounded-lg font-medium text-red-600 border border-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Zoom Header */}
      {zoomedRegion && (
        <div className="flex items-center justify-between p-4 bg-deep-blue text-white rounded-lg">
          <div>
            <h3 className="font-semibold">{REGION_ID_TO_NAME[zoomedRegion]}</h3>
            <p className="text-sm text-blue-200">Click to select sub-regions</p>
          </div>
          <button onClick={unzoomBody} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg">
            ← Back
          </button>
        </div>
      )}

      {/* SVG */}
      <div className="relative bg-off-white/50 rounded-xl overflow-hidden border border-soft-mint/30">
        <svg viewBox={viewBox} className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <image href={imgSrc} x="0" y="0" width={currentView === 'front' ? '2037' : '2130'} height="3681" style={{ opacity: 0.9 }} />
          <g>
            {Object.entries(pathDict).map(([id, path]) => {
              const severity = getMaxSeverity(id)
              const fillColor = zoomedRegion === id ? 'rgba(15, 110, 86, 0.15)' : 
                severity ? `rgba(${parseInt(SEVERITY_COLORS[severity].slice(1, 3), 16)}, ${parseInt(SEVERITY_COLORS[severity].slice(3, 5), 16)}, ${parseInt(SEVERITY_COLORS[severity].slice(5, 7), 16)}, 0.4)` : 'rgba(225, 245, 238, 0.2)'
              const strokeColor = severity ? SEVERITY_COLORS[severity] : hoveredRegion === id ? '#0F6E56' : '#1E5B8C'
              
              return (
                <path
                  key={id}
                  d={path}
                  onClick={() => handleRegionClick(id)}
                  onMouseEnter={() => !zoomedRegion && setHoveredRegion(id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  style={{
                    fill: fillColor, stroke: strokeColor, strokeWidth: hoveredRegion === id ? 2 : 1,
                    cursor: zoomedRegion && zoomedRegion !== id ? 'default' : 'pointer',
                    pointerEvents: zoomedRegion && zoomedRegion !== id ? 'none' : 'auto',
                    opacity: zoomedRegion && zoomedRegion !== id ? 0.3 : 1,
                    transition: 'all 0.2s'
                  } as CSSProperties}
                />
              )
            })}
          </g>
        </svg>

        {/* Hotspots */}
        {zoomedRegion && hotspots.map((h, i) => (
          <div key={i}
            className={`absolute border-2 cursor-pointer transition ${
              Array.from(selections.keys()).some(k => k.includes(h.name))
                ? 'border-primary-teal bg-primary-teal/10'
                : 'border-soft-mint/40 hover:bg-soft-mint/20'
            }`}
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.width}%`, height: `${h.height}%` }}
            onClick={() => handleSubregionClick(h.name)}
            onMouseEnter={() => setTooltip({ text: h.name, x: 0, y: 0 })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {/* Tooltip */}
        {tooltip && (
          <div className="fixed bg-deep-blue text-white px-3 py-2 rounded-lg text-sm pointer-events-none shadow-lg z-50"
            style={{ left: '10px', top: '10px' }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selections */}
        <div className="lg:col-span-2 p-4 bg-soft-mint/20 rounded-lg border border-primary-teal/30">
          <h4 className="font-semibold text-deep-blue mb-3">Selected Areas ({selections.size})</h4>
          {selections.size === 0 ? (
            <p className="text-center text-neutral-gray py-8">Click any body region to start</p>
          ) : (
            <div className="space-y-2">
              {Array.from(selections.entries()).map(([key, data]) => (
                <div key={key} onClick={() => setActiveSelectionKey(key)}
                  className={`p-3 rounded-lg border-2 cursor-pointer ${
                    activeSelectionKey === key
                      ? 'border-primary-teal bg-white shadow-md'
                      : 'border-soft-mint/30 hover:border-primary-teal'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-deep-blue">
                        {data.parentRegion} {data.subRegion && `→ ${data.subRegion}`}
                      </p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-1 rounded-full bg-deep-blue/10 text-deep-blue">{data.side}</span>
                        {data.severity && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                            backgroundColor: SEVERITY_COLORS[data.severity] + '22',
                            color: SEVERITY_COLORS[data.severity]
                          }}>
                            Lv {data.severity}
                          </span>
                        )}
                        {data.note && <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">📝</span>}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveSelection(key) }} className="text-primary-teal hover:text-deep-blue font-bold">
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Severity & Notes */}
        <div className="space-y-4">
          {activeSelection ? (
            <>
              <div className="p-4 bg-off-white/50 rounded-lg border border-soft-mint/30">
                <p className="text-sm font-semibold text-deep-blue mb-3">Severity</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(l => (
                    <button key={l} onClick={() => handleSeverityChange(l)}
                      className="w-8 h-8 rounded-full transition hover:scale-110"
                      title={SEVERITY_LABELS[l]}
                      style={{
                        backgroundColor: SEVERITY_COLORS[l],
                        border: activeSelection.severity === l ? '2px solid #000' : '1px solid #ccc'
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-neutral-gray mt-2">
                  {activeSelection.severity ? SEVERITY_LABELS[activeSelection.severity] : 'Select severity'}
                </p>
              </div>
              <div className="p-4 bg-off-white/50 rounded-lg border border-soft-mint/30">
                <p className="text-sm font-semibold text-deep-blue mb-2">Notes</p>
                <textarea value={activeSelection.note} onChange={(e) => {
                  const data = selections.get(activeSelectionKey!)
                  if (data) { data.note = e.target.value; selections.set(activeSelectionKey!, data); setSelections(new Map(selections)) }
                }}
                  placeholder="Add notes..." className="w-full h-20 p-2 rounded-lg border border-soft-mint/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-teal"
                />
                <button onClick={() => handleNoteSave(activeSelection.note)}
                  className="mt-2 w-full px-3 py-1 text-sm rounded-lg bg-primary-teal text-white hover:bg-primary-teal/90"
                >
                  Save Note
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 bg-off-white/50 rounded-lg border border-soft-mint/30 text-center text-neutral-gray">
              <p className="text-sm">Select a region to add severity and notes</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-soft-mint/30">
              <h3 className="text-lg font-semibold text-deep-blue">Export Selections</h3>
            </div>
            <div className="p-6">
              <pre className="bg-off-white/50 p-4 rounded-lg text-xs overflow-auto max-h-64 text-neutral-gray border border-soft-mint/30">
                {exportJson}
              </pre>
            </div>
            <div className="p-6 border-t border-soft-mint/30 flex gap-3">
              <button onClick={handleCopyClipboard}
                className="flex-1 px-4 py-3 rounded-lg bg-primary-teal text-white font-medium hover:bg-primary-teal/90"
              >
                Copy to Clipboard
              </button>
              <button onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-3 rounded-lg border border-soft-mint/30 text-deep-blue font-medium hover:bg-soft-mint/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-deep-blue text-white px-4 py-3 rounded-lg shadow-lg animate-pulse">
          {toast}
        </div>
      )}
    </div>
  )
}
