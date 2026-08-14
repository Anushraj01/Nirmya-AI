import { useState, useRef, useEffect } from 'react'

/**
 * InteractiveBodyMap - Advanced body map component with drill-down to sub-regions
 * Integrates SVG paths with Nirmya AI design tokens (teal/blue theme)
 * Features: Front/back view toggle, region selection, sub-region drill-down
 */

interface BodyRegion {
  regionId: string
  parentRegion: string
  subRegion: string | null
  side: 'front' | 'back'
  severity?: number
  notes?: string
}

export type { BodyRegion }

interface InteractiveBodyMapProps {
  onSelectRegion?: (regions: BodyRegion[]) => void
  selectedRegions?: BodyRegion[]
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const REGION_HIERARCHY: Record<string, string[]> = {
  'Head': ['Forehead', 'Scalp', 'Left Temple', 'Right Temple', 'Left Eye / Eyelid', 'Right Eye / Eyelid', 'Nose / Bridge', 'Left Ear', 'Right Ear', 'Mouth / Lips', 'Teeth / Gums', 'Jaw / Chin', 'Left Cheek', 'Right Cheek'],
  'Neck': ['Left Side of Neck', 'Front of Neck', 'Right Side of Neck', 'Thyroid Area', 'Throat / Voicebox', 'Collarbone Area'],
  'Left Shoulder': ['Acromion', 'Front Deltoid', 'Side Deltoid', 'Shoulder Joint', 'Rotator Cuff Area'],
  'Right Shoulder': ['Acromion', 'Front Deltoid', 'Side Deltoid', 'Shoulder Joint', 'Rotator Cuff Area'],
  'Chest': ['Left Collarbone', 'Upper Chest', 'Right Collarbone', 'Left Breast / Pectoral', 'Sternum / Mid-Chest', 'Right Breast / Pectoral', 'Left Rib Cage', 'Lower Chest', 'Right Rib Cage'],
  'Abdomen': ['Upper Left Abdomen (Spleen/Stomach)', 'Upper Abdomen (Epigastric)', 'Upper Right Abdomen (Gallbladder/Liver)', 'Left Flank', 'Navel / Periumbilical Area', 'Right Flank', 'Lower Left Abdomen (Colon)', 'Lower Abdomen (Hypogastric)', 'Lower Right Abdomen (Appendix)'],
  'Left Upper Arm': ['Outer Upper Arm', 'Bicep', 'Inner Upper Arm'],
  'Right Upper Arm': ['Inner Upper Arm', 'Bicep', 'Outer Upper Arm'],
  'Left Forearm': ['Elbow Crease', 'Outer Forearm', 'Inner Forearm', 'Wrist (Palmar side)'],
  'Right Forearm': ['Elbow Crease', 'Inner Forearm', 'Outer Forearm', 'Wrist (Palmar side)'],
  'Left Hand': ['Palm', 'Thumb', 'Index Finger', 'Middle Finger', 'Ring Finger', 'Little Finger', 'Knuckles'],
  'Right Hand': ['Palm', 'Thumb', 'Index Finger', 'Middle Finger', 'Ring Finger', 'Little Finger', 'Knuckles'],
  'Pelvis': ['Left Hip Joint', 'Iliac Crest', 'Right Hip Joint', 'Groin (Left)', 'Pubic Region', 'Groin (Right)'],
  'Left Thigh': ['Outer Thigh', 'Quadriceps (Front Thigh)', 'Inner Thigh (Adductors)'],
  'Right Thigh': ['Inner Thigh (Adductors)', 'Quadriceps (Front Thigh)', 'Outer Thigh'],
  'Left Knee': ['Kneecap (Patella)', 'Outer Knee', 'Inner Knee', 'Below Kneecap'],
  'Right Knee': ['Kneecap (Patella)', 'Inner Knee', 'Outer Knee', 'Below Kneecap'],
  'Left Shin': ['Outer Lower Leg', 'Shin Bone (Tibia)', 'Ankle (Front)', 'Inner Ankle'],
  'Right Shin': ['Shin Bone (Tibia)', 'Outer Lower Leg', 'Inner Ankle', 'Ankle (Front)'],
  'Left Foot': ['Ankle Joint', 'Top of Foot', 'Arch of Foot', 'Fourth/Fifth Toe', 'Second/Third Toe', 'Big Toe'],
  'Right Foot': ['Ankle Joint', 'Top of Foot', 'Arch of Foot', 'Big Toe', 'Second/Third Toe', 'Fourth/Fifth Toe'],

  'Head (Back)': ['Occiput / Back of Head', 'Crown of Head', 'Base of Skull', 'Behind Left Ear', 'Behind Right Ear'],
  'Neck (Back)': ['Left Cervical Muscle', 'Upper Spine (Cervical)', 'Base of Neck', 'Right Cervical Muscle'],
  'Left Shoulder (Back)': ['Upper Trapezius', 'Rear Deltoid', 'Left Shoulder Blade (Scapula)'],
  'Right Shoulder (Back)': ['Upper Trapezius', 'Rear Deltoid', 'Right Shoulder Blade (Scapula)'],
  'Upper Back': ['Left Shoulder Blade Area', 'Spine (Thoracic)', 'Right Shoulder Blade Area', 'Left Upper Paraspinal', 'Mid-Back Spine', 'Right Upper Paraspinal'],
  'Lower Back': ['Left Lower Back', 'Lumbar Spine (L1-L5)', 'Right Lower Back', 'Sacroiliac Joint (Left)', 'Sacrum', 'Sacroiliac Joint (Right)', 'Tailbone (Coccyx)'],
  'Left Tricep': ['Tricep Lateral Head', 'Tricep Long Head', 'Back of Elbow'],
  'Right Tricep': ['Tricep Long Head', 'Tricep Lateral Head', 'Back of Elbow'],
  'Left Forearm (Back)': ['Elbow Tip', 'Back of Forearm', 'Back of Wrist'],
  'Right Forearm (Back)': ['Elbow Tip', 'Back of Forearm', 'Back of Wrist'],
  'Left Hand (Back)': ['Back of Hand', 'Back of Thumb', 'Back of Fingers'],
  'Right Hand (Back)': ['Back of Hand', 'Back of Thumb', 'Back of Fingers'],
  'Buttocks': ['Left Gluteus Major', 'Gluteus Medius (Hip)', 'Piriformis Area', 'Right Gluteus Major'],
  'Left Hamstring': ['Upper Hamstring', 'Outer Hamstring', 'Inner Hamstring', 'Lower Hamstring'],
  'Right Hamstring': ['Upper Hamstring', 'Inner Hamstring', 'Outer Hamstring', 'Lower Hamstring'],
  'Left Knee (Back)': ['Outer Back Knee', 'Popliteal Fossa (Behind Knee)', 'Inner Back Knee'],
  'Right Knee (Back)': ['Inner Back Knee', 'Popliteal Fossa (Behind Knee)', 'Outer Back Knee'],
  'Left Calf': ['Gastrocnemius (Upper Calf)', 'Soleus (Lower Calf)', 'Achilles Tendon'],
  'Right Calf': ['Gastrocnemius (Upper Calf)', 'Soleus (Lower Calf)', 'Achilles Tendon'],
  'Left Foot (Back)': ['Back of Ankle', 'Heel (Calcaneus)', 'Plantar Fascia / Sole'],
  'Right Foot (Back)': ['Back of Ankle', 'Heel (Calcaneus)', 'Plantar Fascia / Sole']
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
    'b-left-hand': 'M 294,1560 L 115,1560 L 83,1575 L 44,1626 L 67,1632 L 93,1624 L 18,1738 L 0,1791 L 32,1778 L 97,1696 L 60,1807 L 60,1850 L 74,1853 L 89,1837 L 142,1710 L 104,1860 L 117,1863 L 134,1850 L 187,1721 L 184,1827 L 200,1830 L 212,1809 L 223,1722 L 284,1626 Z',
    'b-right-hand': 'M 1833,1560 L 1848,1636 L 1905,1722 L 1925,1830 L 1939,1835 L 1943,1724 L 1992,1848 L 2015,1866 L 2025,1859 L 1987,1713 L 2040,1840 L 2056,1854 L 2069,1849 L 2066,1800 L 2031,1698 L 2098,1781 L 2129,1791 L 2108,1735 L 2033,1623 L 2058,1632 L 2084,1626 L 2044,1574 L 2013,1560 Z',
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
  'f-head': 'Head',
  'f-neck': 'Neck',
  'f-left-shoulder': 'Left Shoulder',
  'f-right-shoulder': 'Right Shoulder',
  'f-chest': 'Chest',
  'f-abdomen': 'Abdomen',
  'f-left-upper-arm': 'Left Upper Arm',
  'f-right-upper-arm': 'Right Upper Arm',
  'f-left-forearm': 'Left Forearm',
  'f-right-forearm': 'Right Forearm',
  'f-left-hand': 'Left Hand',
  'f-right-hand': 'Right Hand',
  'f-pelvis': 'Pelvis',
  'f-left-thigh': 'Left Thigh',
  'f-right-thigh': 'Right Thigh',
  'f-left-knee': 'Left Knee',
  'f-right-knee': 'Right Knee',
  'f-left-shin': 'Left Shin',
  'f-right-shin': 'Right Shin',
  'f-left-foot': 'Left Foot',
  'f-right-foot': 'Right Foot',
  'b-head': 'Head (Back)',
  'b-neck': 'Neck (Back)',
  'b-left-shoulder': 'Left Shoulder (Back)',
  'b-right-shoulder': 'Right Shoulder (Back)',
  'b-upper-back': 'Upper Back',
  'b-lower-back': 'Lower Back',
  'b-left-tricep': 'Left Tricep',
  'b-right-tricep': 'Right Tricep',
  'b-left-forearm': 'Left Forearm (Back)',
  'b-right-forearm': 'Right Forearm (Back)',
  'b-left-hand': 'Left Hand (Back)',
  'b-right-hand': 'Right Hand (Back)',
  'b-buttocks': 'Buttocks',
  'b-left-hamstring': 'Left Hamstring',
  'b-right-hamstring': 'Right Hamstring',
  'b-left-knee': 'Left Knee (Back)',
  'b-right-knee': 'Right Knee (Back)',
  'b-left-calf': 'Left Calf',
  'b-right-calf': 'Right Calf',
  'b-left-foot': 'Left Foot (Back)',
  'b-right-foot': 'Right Foot (Back)'
}

export function InteractiveBodyMap({ onSelectRegion, selectedRegions: propSelectedRegions = [] }: InteractiveBodyMapProps) {
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front')
  const [selections, setSelections] = useState<Map<string, BodyRegion>>(new Map())
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const pathDict = currentView === 'front' ? SVG_PATHS.front : SVG_PATHS.back
  const viewBox = currentView === 'front' ? '0 0 2037 3681' : '0 0 2130 3681'
  const imgSrc = currentView === 'front' ? '/front-m.webp' : '/back-m.webp'

  const handleRegionClick = (regionId: string) => {
    const parentRegion = REGION_ID_TO_NAME[regionId]
    const side = currentView
    
    if (!parentRegion) return

    // Check if already selected
    const existingKey = Array.from(selections.entries()).find(
      ([_, sel]) => sel.parentRegion === parentRegion && sel.subRegion === null && sel.side === side
    )?.[0]

    if (existingKey) {
      // Deselect
      selections.delete(existingKey)
      setSelections(new Map(selections))
    } else {
      // Select entire region
      const key = `${regionId}::entire`
      selections.set(key, {
        regionId,
        parentRegion,
        subRegion: null,
        side
      })
      setSelections(new Map(selections))
    }
  }

  const handleRegionHover = (regionId: string, e: React.MouseEvent<SVGPathElement>) => {
    const parentRegion = REGION_ID_TO_NAME[regionId]
    setHoveredRegion(regionId)
    setTooltip({
      text: parentRegion + ' (Click to select)',
      x: e.clientX + 10,
      y: e.clientY - 10
    })
  }

  const isRegionSelected = (regionId: string) => {
    return Array.from(selections.values()).some(sel => sel.regionId === regionId)
  }

  useEffect(() => {
    onSelectRegion?.(Array.from(selections.values()))
  }, [selections, onSelectRegion])

  return (
    <div className="w-full space-y-4">
      {/* View Toggle */}
      <div className="flex gap-3 border-b border-soft-mint/30 pb-4">
        <button
          onClick={() => setCurrentView('front')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentView === 'front'
              ? 'bg-primary-teal text-white shadow-sm'
              : 'text-neutral-gray hover:bg-soft-mint/20'
          }`}
        >
          Front View
        </button>
        <button
          onClick={() => setCurrentView('back')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentView === 'back'
              ? 'bg-primary-teal text-white shadow-sm'
              : 'text-neutral-gray hover:bg-soft-mint/20'
          }`}
        >
          Back View
        </button>
      </div>

      {/* Body Map SVG */}
      <div className="relative bg-off-white/50 rounded-xl overflow-hidden border border-soft-mint/30">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-auto cursor-pointer"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Image */}
          <image
            href={imgSrc}
            x="0"
            y="0"
            width={currentView === 'front' ? '2037' : '2130'}
            height="3681"
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: 'none', opacity: 0.9 }}
          />

          {/* Regions */}
          <g>
            {Object.entries(pathDict).map(([regionId, path]) => (
              <path
                key={regionId}
                d={path}
                onClick={() => handleRegionClick(regionId)}
                onMouseEnter={(e) => handleRegionHover(regionId, e)}
                onMouseMove={(e) => {
                  const parentRegion = REGION_ID_TO_NAME[regionId]
                  setTooltip({
                    text: parentRegion + ' (Click to select)',
                    x: e.clientX + 10,
                    y: e.clientY - 10
                  })
                }}
                onMouseLeave={() => {
                  setHoveredRegion(null)
                  setTooltip(null)
                }}
                className={`transition-all cursor-pointer ${
                  isRegionSelected(regionId)
                    ? 'fill-primary-teal/50 stroke-primary-teal stroke-2 filter drop-shadow-lg'
                    : hoveredRegion === regionId
                    ? 'fill-soft-mint/40 stroke-primary-teal stroke-1.5'
                    : 'fill-soft-mint/15 stroke-deep-blue/20 stroke-1'
                }`}
              />
            ))}
          </g>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed bg-deep-blue text-white px-3 py-2 rounded-lg text-sm pointer-events-none shadow-lg z-50"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Selected Regions Display */}
      {selections.size > 0 && (
        <div className="p-4 bg-soft-mint/20 rounded-lg border border-primary-teal/30">
          <h4 className="font-semibold text-deep-blue mb-3">Selected Areas ({selections.size})</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(selections.values()).map((sel) => (
              <div
                key={`${sel.regionId}::${sel.subRegion || 'entire'}`}
                className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-primary-teal/50 text-sm text-neutral-gray"
              >
                <span>{sel.parentRegion}</span>
                <button
                  onClick={() => {
                    selections.delete(`${sel.regionId}::${sel.subRegion || 'entire'}`)
                    setSelections(new Map(selections))
                  }}
                  className="ml-1 text-primary-teal hover:text-deep-blue font-semibold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
