/* ═══════════════════════════════════════════════════════════════════
   Medical Body Map — Full Application Logic & Drill-down System
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Anatomical Region Hierarchy (WebMD Symptom Checker Style) ────
  const SUB_REGIONS = {
    // Front View Major Regions
    'Head': [
      'Forehead', 'Scalp', 'Left Temple', 'Right Temple',
      'Left Eye / Eyelid', 'Right Eye / Eyelid', 'Nose / Bridge',
      'Left Ear', 'Right Ear', 'Mouth / Lips', 'Teeth / Gums',
      'Jaw / Chin', 'Left Cheek', 'Right Cheek'
    ],
    'Neck': [
      'Left Side of Neck', 'Front of Neck', 'Right Side of Neck',
      'Thyroid Area', 'Throat / Voicebox', 'Collarbone Area'
    ],
    // Acromion (the bony cap at the very top of the shoulder, near the
    // collarbone) sits above the deltoid muscle, and shoulder joint/rotator
    // cuff are the deepest, most sunk-in landmarks — so top-to-bottom this
    // is Acromion, then the two visible deltoid heads side by side, then
    // joint/rotator cuff. See ROW_LAYOUT_OVERRIDE below for the 1/2/2 split
    // that keeps Acromion alone in its own top band instead of sharing a
    // row with something else.
    'Left Shoulder': [
      'Acromion', 'Front Deltoid', 'Side Deltoid',
      'Shoulder Joint', 'Rotator Cuff Area'
    ],
    'Right Shoulder': [
      'Acromion', 'Front Deltoid', 'Side Deltoid',
      'Shoulder Joint', 'Rotator Cuff Area'
    ],
    'Chest': [
      'Left Collarbone', 'Upper Chest', 'Right Collarbone',
      'Left Breast / Pectoral', 'Sternum / Mid-Chest', 'Right Breast / Pectoral',
      'Left Rib Cage', 'Lower Chest', 'Right Rib Cage'
    ],
    'Abdomen': [
      'Upper Left Abdomen (Spleen/Stomach)', 'Upper Abdomen (Epigastric)', 'Upper Right Abdomen (Gallbladder/Liver)',
      'Left Flank', 'Navel / Periumbilical Area', 'Right Flank',
      'Lower Left Abdomen (Colon)', 'Lower Abdomen (Hypogastric)', 'Lower Right Abdomen (Appendix)'
    ],
    // Left/Right pairs below are mirror images of each other in the artwork,
    // so unlike the boxy torso regions above, these limb sub-lists are NOT
    // shared verbatim between the Left/Right entries — each one is ordered
    // to match that specific side's own left-to-right visual layout (medial
    // side nearest the torso, lateral side away from it). Sharing one order
    // across a mirrored pair is exactly what caused Inner/Outer-style names
    // to land on the wrong side before this fix.
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
    // Toes fan out side-by-side at the end of the foot rather than stacking
    // front-to-back, so the last three names are ordered left-to-right by
    // which side of that foot is medial (nearest the other foot) — see
    // buildHotspots()'s ROW_LAYOUT_OVERRIDE handling below.
    'Left Foot': ['Ankle Joint', 'Top of Foot', 'Arch of Foot', 'Fourth/Fifth Toe', 'Second/Third Toe', 'Big Toe'],
    'Right Foot': ['Ankle Joint', 'Top of Foot', 'Arch of Foot', 'Big Toe', 'Second/Third Toe', 'Fourth/Fifth Toe'],

    // Back View Major Regions
    'Head (Back)': [
      'Occiput / Back of Head', 'Crown of Head', 'Base of Skull',
      'Behind Left Ear', 'Behind Right Ear'
    ],
    'Neck (Back)': [
      'Left Cervical Muscle', 'Upper Spine (Cervical)', 'Base of Neck', 'Right Cervical Muscle'
    ],
    // Upper Trapezius runs along the top of the shoulder nearest the neck,
    // with the rear deltoid (lateral) and shoulder blade (medial, lower)
    // below it — so it needs to be alone in a top band rather than sharing
    // a row with something else. See ROW_LAYOUT_OVERRIDE below for the 1/2
    // split.
    'Left Shoulder (Back)': [
      'Upper Trapezius', 'Rear Deltoid', 'Left Shoulder Blade (Scapula)'
    ],
    'Right Shoulder (Back)': [
      'Upper Trapezius', 'Rear Deltoid', 'Right Shoulder Blade (Scapula)'
    ],
    'Upper Back': [
      'Left Shoulder Blade Area', 'Spine (Thoracic)', 'Right Shoulder Blade Area',
      'Left Upper Paraspinal', 'Mid-Back Spine', 'Right Upper Paraspinal'
    ],
    'Lower Back': [
      'Left Lower Back', 'Lumbar Spine (L1-L5)', 'Right Lower Back',
      'Sacroiliac Joint (Left)', 'Sacrum', 'Sacroiliac Joint (Right)',
      'Tailbone (Coccyx)'
    ],
    'Left Tricep': ['Tricep Lateral Head', 'Tricep Long Head', 'Back of Elbow'],
    'Right Tricep': ['Tricep Long Head', 'Tricep Lateral Head', 'Back of Elbow'],
    'Left Forearm (Back)': ['Elbow Tip', 'Back of Forearm', 'Back of Wrist'],
    'Right Forearm (Back)': ['Elbow Tip', 'Back of Forearm', 'Back of Wrist'],
    'Left Hand (Back)': ['Back of Hand', 'Back of Thumb', 'Back of Fingers'],
    'Right Hand (Back)': ['Back of Hand', 'Back of Thumb', 'Back of Fingers'],
    'Buttocks': ['Left Gluteus Major', 'Gluteus Medius (Hip)', 'Piriformis Area', 'Right Gluteus Major'],
    // Upper/Lower describe position along the leg's length, Inner/Outer
    // describe medial-lateral side — two different axes that a plain 2x2
    // grid conflates. Splitting the middle band into Inner/Outer (see
    // ROW_LAYOUT_OVERRIDE below) keeps Upper strictly at the top and Lower
    // strictly at the bottom while still giving Inner/Outer a correctly
    // side-ordered band in between.
    'Left Hamstring': ['Upper Hamstring', 'Outer Hamstring', 'Inner Hamstring', 'Lower Hamstring'],
    'Right Hamstring': ['Upper Hamstring', 'Inner Hamstring', 'Outer Hamstring', 'Lower Hamstring'],
    'Left Knee (Back)': ['Outer Back Knee', 'Popliteal Fossa (Behind Knee)', 'Inner Back Knee'],
    'Right Knee (Back)': ['Inner Back Knee', 'Popliteal Fossa (Behind Knee)', 'Outer Back Knee'],
    'Left Calf': ['Gastrocnemius (Upper Calf)', 'Soleus (Lower Calf)', 'Achilles Tendon'],
    'Right Calf': ['Gastrocnemius (Upper Calf)', 'Soleus (Lower Calf)', 'Achilles Tendon'],
    'Left Foot (Back)': ['Back of Ankle', 'Heel (Calcaneus)', 'Plantar Fascia / Sole'],
    'Right Foot (Back)': ['Back of Ankle', 'Heel (Calcaneus)', 'Plantar Fascia / Sole']
  };

  // Severity labels & colors
  const SEVERITY_LABELS = {
    1: 'Mild — Minor discomfort',
    2: 'Low — Noticeable but manageable',
    3: 'Moderate — Affects daily activity',
    4: 'High — Significant pain / issue',
    5: 'Severe — Urgent medical attention'
  };

  const SEVERITY_COLORS = {
    1: '#4ade80',
    2: '#a3e635',
    3: '#facc15',
    4: '#fb923c',
    5: '#f87171'
  };

  // ── Comprehensive Symptom Mappings (1000+ Clinical Symptoms) ───
  const REGION_SYMPTOMS = {
    // FRONT HEAD REGION - Neurological & Dermatological symptoms
    'Forehead': [
      'Sharp stabbing pain', 'Throbbing pain', 'Pressure or heaviness', 'Tension headache', 'Dull ache',
      'Numbness or loss of feeling', 'Tingling or prickling', 'Redness', 'Swelling', 'Wrinkles', 'Muscle tightness', 'Tenderness',
      'Pounding sensation', 'Sudden sharp jabs', 'Burning sensation', 'Feeling cold', 'Feeling hot', 'Twitching', 'Muscle spasms',
      'Creases or lines', 'Itching', 'Dry skin', 'Oily skin', 'Pimples or breakouts', 'Blackheads', 'Whiteheads', 'Cysts',
      'Moles or dark spots', 'Rash', 'Hives or welts', 'Eczema or flaky patches', 'Psoriasis', 'Skin irritation', 'Scaly patches',
      'Excessive sweating', 'No sweating', 'Flushing or redness', 'Pale or whiteness', 'Clammy skin', 'Cold forehead',
      'Sensitive to heat', 'Sensitive to cold', 'Sensitive to light', 'Tightness', 'Tension in creases',
      'Bulging', 'Puffiness', 'Dimples', 'Separation', 'Shrinking', 'Enlargement',
      'Muscle knots', 'Sore spots', 'Muscle pain', 'Pinched nerve feeling', 'Strange sensations', 'Abnormal feeling',
      'Increased sensitivity', 'Decreased sensitivity', 'Pain from light touch',
      'Pain from neck', 'Pain from teeth', 'Pain radiating from sinuses', 'Pain from eye strain',
      'Dehydration headache', 'Caffeine withdrawal headache', 'Jaw pain radiating up', 'Stress-related tightness', 'Sudden sharp pain episodes'
    ],
    'Scalp': [
      'Itching', 'Tenderness', 'Numbness', 'Burning sensation', 'Flaking or dandruff', 'Sensitive skin', 'Tightness',
      'Follicle infection', 'Itchy and scaly patches', 'Scaly patches', 'Fungal infection', 'Lice', 'Lice eggs',
      'Hair loss', 'Male pattern baldness', 'Patchy hair loss', 'Excessive hair shedding', 'Brittle hair',
      'Dandruff', 'Cradle cap', 'Clogged hair follicles', 'Ingrown hair', 'Scalp pimples', 'Pimples', 'Infected bumps',
      'Pus-filled bumps', 'Cysts', 'Fatty lumps', 'Moles or dark spots', 'Warts', 'Small skin growths', 'Unusual skin growths', 'Spots or discoloration',
      'Darkening of skin', 'Lightening of skin', 'Loss of skin color in patches', 'Flat scaly skin', 'Skin hardening', 'Patchy hair loss condition',
      'Hair loss from lupus', 'Compulsive hair pulling', 'Hair loss from tension', 'Nerve pain at base of skull', 'Pain from light touch',
      'Heightened sensitivity', 'Abnormal sensations', 'Phantom itching', 'Phantom pain', 'Radiating pain from neck', 'Nerve pain',
      'Neuropathic burning', 'Tingling or prickling', 'Shooting pains', 'Electrical shocks', 'Facial nerve twitching',
      'Muscle spasms', 'Muscle twitching', 'Involuntary muscle movements', 'Jerking movements', 'Pulsating feelings', 'Throbbing',
      'Pounding', 'Heaviness', 'Lightness', 'Floating sensation', 'Pressure', 'Band-like tightness', 'Constriction',
      'Temperature changes', 'Feeling cold', 'Feeling hot', 'Alternating hot and cold', 'Chills', 'Excessive warmth'
    ],
    'Left Temple': [
      'Throbbing pain', 'Sharp stabbing pain', 'Pressure', 'Tension', 'Numbness', 'Burning',
      'Pounding sensation', 'Sudden sharp jabs', 'Dull ache', 'Aching pain', 'Cramping', 'Twitching',
      'Muscle spasms', 'Muscle knots', 'Tender spots', 'Jaw-related pain', 'Artery pain',
      'Sudden sharp pain episodes', 'Visual disturbances', 'Sensitivity to light', 'Sensitivity to sound', 'Sensitivity to smells', 'Nausea', 'Vomiting', 'Sensitivity to touch', 'Pain from light touch', 'Heightened sensitivity',
      'Tingling or prickling', 'Pins and needles', 'Electrical shock sensation', 'Numb feeling', 'Feeling cold', 'Feeling hot', 'Flushing or redness', 'Redness', 'Bluish discoloration', 'Redness', 'Swelling', 'Puffiness', 'Puffiness',
      'Hollow appearance', 'Flat appearance', 'Bulging', 'Retraction', 'Uneven side-to-side', 'Visible pulsing veins', 'Pulsing artery',
      'Jaw clenching pain', 'Pain radiating to ear', 'Pain radiating to eye', 'Pain radiating to teeth', 'Pain radiating down neck',
      'Nerve pinching', 'Nerve pain', 'Nerve pain above ear', 'Facial nerve pain', 'Nerve pain after infection',
      'Glossopharyngeal nerve pain', 'Nerve pain at base of skull', 'Weather-related pain',
      'Pressure sensitivity', 'Weather change sensitivity', 'Stress-related pain', 'Menstrual-related pain', 'Hormonal sensitivity'
    ],
    'Right Temple': [
      'Throbbing pain', 'Sharp stabbing pain', 'Pressure', 'Tension', 'Numbness', 'Burning',
      'Pounding sensation', 'Sudden sharp jabs', 'Dull ache', 'Aching pain', 'Cramping', 'Twitching',
      'Muscle spasms', 'Muscle knots', 'Tender spots', 'Jaw-related pain', 'Artery pain',
      'Sudden sharp pain episodes', 'Visual disturbances', 'Sensitivity to light', 'Sensitivity to sound', 'Sensitivity to smells', 'Nausea', 'Vomiting', 'Sensitivity to touch', 'Pain from light touch', 'Heightened sensitivity',
      'Tingling or prickling', 'Pins and needles', 'Electrical shock sensation', 'Numb feeling', 'Feeling cold', 'Feeling hot', 'Flushing or redness', 'Redness', 'Bluish discoloration', 'Redness', 'Swelling', 'Puffiness', 'Puffiness',
      'Hollow appearance', 'Flat appearance', 'Bulging', 'Retraction', 'Uneven side-to-side', 'Visible pulsing veins', 'Pulsing artery',
      'Jaw clenching pain', 'Pain radiating to ear', 'Pain radiating to eye', 'Pain radiating to teeth', 'Pain radiating down neck',
      'Nerve pinching', 'Nerve pain', 'Nerve pain above ear', 'Facial nerve pain', 'Nerve pain after infection',
      'Glossopharyngeal nerve pain', 'Nerve pain at base of skull', 'Weather-related pain',
      'Pressure sensitivity', 'Weather change sensitivity', 'Stress-related pain', 'Menstrual-related pain', 'Hormonal sensitivity'
    ],
    'Left Eye / Eyelid': [
      'Dry eyes', 'Red or bloodshot', 'Itching', 'Swelling', 'Eye pain', 'Excessive tearing', 'Heavy feeling',
      'Puffiness', 'Drooping eyelid', 'Eye twitching', 'Eyelid spasm', 'Eyelid that won\'t close fully',
      'Eyelid inflammation', 'Cyst on eyelid', 'Stye or bump', 'Eyelid bump', 'Eye gland dysfunction',
      'Pink eye', 'Allergic pink eye', 'Viral pink eye', 'Bacterial pink eye',
      'Blood under conjunctiva', 'Swollen conjunctiva', 'Pale conjunctiva', 'Crackling in eye', 'Eye bulging out', 'Eye sunken in',
      'Scratched cornea', 'Cornea sore', 'Cornea inflammation', 'Uvea inflammation', 'Iris inflammation', 'White of eye inflammation', 'Surface of eye inflammation',
      'Acute angle closure glaucoma', 'Open angle glaucoma', 'High eye pressure', 'Dry eye syndrome', 'Inadequate tears',
      'Mucus layer problem', 'Lipid layer problem', 'Meibum problem', 'Not blinking enough', 'Something stuck in eye',
      'Age-related vision changes', 'Nearsightedness', 'Farsightedness', 'Astigmatism', 'Blurred vision', 'Double vision',
      'Floaters or specks', 'Light flashes', 'Loss of vision area', 'Blind spot', 'Wavy vision', 'Objects look smaller',
      'Objects look larger', 'Both eyes coordination problem', 'One eye vision loss', 'Partial blindness', 'Half vision loss', 'Tunnel vision',
      'Can\'t see well at night', 'Can\'t see colors properly', 'Red color issue', 'Migraine in eye', 'Sensitive to light',
      'Light flashing', 'Glare bothers me', 'Halos around lights', 'Starbursts around lights', 'Lens reflection effect', 'Rainbow around lights',
      'Eye strain and tiredness', 'Eye strain', 'Eye fatigue', 'Screen eye strain', 'Screen tiredness', 'Eyes not coordinating',
      'Trouble focusing near', 'Trouble focusing far', 'Eyes drying out', 'Severe eye condition', 'Eyelid scarring',
      'Immune eye graft problem', 'Sarcoidosis eye involvement', 'Inflammatory blood vessel disease', 'Artery inflammation disease',
      'Behcet disease eye involvement', 'Eye herpes infection', 'Shingles in eye', 'Molluscum bump in eye', 'Fungal eye infection',
      'Histoplasmosis eye involvement', 'Toxoplasmosis eye involvement', 'Parasitic eye infection', 'Lyme disease eye symptoms', 'Syphilis eye symptoms', 'AIDS eye symptoms'
    ],
    'Right Eye / Eyelid': [
      'Dry eyes', 'Red or bloodshot', 'Itching', 'Swelling', 'Eye pain', 'Excessive tearing', 'Heavy feeling',
      'Puffiness', 'Drooping eyelid', 'Eye twitching', 'Eyelid spasm', 'Eyelid that won\'t close fully',
      'Eyelid inflammation', 'Cyst on eyelid', 'Stye or bump', 'Eyelid bump', 'Eye gland dysfunction',
      'Pink eye', 'Allergic pink eye', 'Viral pink eye', 'Bacterial pink eye',
      'Blood under conjunctiva', 'Swollen conjunctiva', 'Pale conjunctiva', 'Crackling in eye', 'Eye bulging out', 'Eye sunken in',
      'Scratched cornea', 'Cornea sore', 'Cornea inflammation', 'Uvea inflammation', 'Iris inflammation', 'White of eye inflammation', 'Surface of eye inflammation',
      'Acute angle closure glaucoma', 'Open angle glaucoma', 'High eye pressure', 'Dry eye syndrome', 'Inadequate tears',
      'Mucus layer problem', 'Lipid layer problem', 'Meibum problem', 'Not blinking enough', 'Something stuck in eye',
      'Age-related vision changes', 'Nearsightedness', 'Farsightedness', 'Astigmatism', 'Blurred vision', 'Double vision',
      'Floaters or specks', 'Light flashes', 'Loss of vision area', 'Blind spot', 'Wavy vision', 'Objects look smaller',
      'Objects look larger', 'Both eyes coordination problem', 'One eye vision loss', 'Partial blindness', 'Half vision loss', 'Tunnel vision',
      'Can\'t see well at night', 'Can\'t see colors properly', 'Red color issue', 'Migraine in eye', 'Sensitive to light',
      'Light flashing', 'Glare bothers me', 'Halos around lights', 'Starbursts around lights', 'Lens reflection effect', 'Rainbow around lights',
      'Eye strain and tiredness', 'Eye strain', 'Eye fatigue', 'Screen eye strain', 'Screen tiredness', 'Eyes not coordinating',
      'Trouble focusing near', 'Trouble focusing far', 'Eyes drying out', 'Severe eye condition', 'Eyelid scarring',
      'Immune eye graft problem', 'Sarcoidosis eye involvement', 'Inflammatory blood vessel disease', 'Artery inflammation disease',
      'Behcet disease eye involvement', 'Eye herpes infection', 'Shingles in eye', 'Molluscum bump in eye', 'Fungal eye infection',
      'Histoplasmosis eye involvement', 'Toxoplasmosis eye involvement', 'Parasitic eye infection', 'Lyme disease eye symptoms', 'Syphilis eye symptoms', 'AIDS eye symptoms'
    ],
    'Nose / Bridge': [
      'Congestion (Nasal Obstruction)', 'Runny Nose (Rhinorrhea)', 'Dryness', 'Pain', 'Sensitivity', 'Itching',
      'Swelling', 'Erythema', 'Blanching', 'Pallor', 'Ecchymosis (Bruising)', 'Hematoma', 'Fracture', 'Deviated Septum',
      'Epistaxis (Nosebleed)', 'Anterior Nosebleed', 'Posterior Nosebleed', 'Severe Hemorrhage', 'Recurrent Nosebleeds',
      'Telangiectasia (Dilated Vessels)', 'Osler-Weber-Rendu Syndrome', 'Nasopharyngeal Angiofibroma', 'Hemangioma', 'Hemangioendothelioma',
      'Anosmia (Loss of Smell)', 'Hyposmia (Decreased Smell)', 'Parosmia (Distorted Smell)', 'Cacosmia (Foul Smell Perception)',
      'Post-COVID Anosmia', 'Post-Viral Anosmia', 'Post-Traumatic Anosmia', 'Neurological Anosmia', 'Obstructive Anosmia',
      'Rhinitis (Acute)', 'Rhinitis (Chronic)', 'Allergic Rhinitis', 'Vasomotor Rhinitis', 'Occupational Rhinitis',
      'Drug-Induced Rhinitis', 'Atrophic Rhinitis', 'Granulomatosis', 'Sarcoidosis', 'Rhinocerebral Mucormycosis',
      'Leprosy (Hansen Disease)', 'Tertiary Syphilis', 'Granulomatosis with Polyangiitis (GPA)', 'Granulomatosis with Polyangiitis',
      'Eosinophilic Granulomatosis with Polyangiitis (EGPA)', 'Polyarteritis Nodosa', 'Behçet Syndrome', 'Relapsing Polychondritis',
      'Amyloidosis', 'Sarcoidosis', 'Tuberculosis', 'Leprosy', 'Syphilis (Tertiary)', 'Blastomycosis', 'Coccidioidomycosis',
      'Histoplasmosis', 'Paracoccidioidomycosis', 'Cryptococcosis', 'Aspergillosis', 'Mucormycosis', 'Candidiasis',
      'Polyps (Nasal)', 'Antrochoanal Polyp', 'Inverted Papilloma', 'Squamous Cell Carcinoma', 'Adenocarcinoma', 'Melanoma',
      'Olfactory Neuroblastoma', 'Lymphoma', 'Rhabdomyosarcoma', 'Hemangioblastoma', 'Encephalocele', 'CSF Rhinorrhea',
      'Saddle Nose Deformity', 'Polly Beak Deformity', 'Crooked Nose', 'Nasal Collapse', 'Nasal Stenosis', 'Choanal Atresia',
      'Piriform Aperture Stenosis', 'Septal Perforation', 'Premaxillary Zone Insufficiency', 'Nasal Valve Collapse',
      'Valve Stenosis', 'Turbinate Hypertrophy', 'Turbinate Atrophy', 'Turbinate Edema', 'Turbinate Ossification',
      'Rhinoscleroma', 'Chronic Granulomatous Disease', 'Ataxia-Telangiectasia', 'Immunoglobulin Deficiency',
      'Hyper-IgE Syndrome', 'GATA2 Deficiency', 'STAT1 Gain-of-Function', 'Autoimmune Polyendocrinopathy'
    ],
    'Left Ear': [
      'Pain (Otalgia)', 'Itching', 'Drainage', 'Hearing Loss (Unilateral)', 'Ringing (Tinnitus)', 'Fullness',
      'Tenderness', 'Swelling', 'Erythema', 'Scaling', 'Crusting', 'Maceration', 'Vesicles', 'Pustules',
      'Bullae', 'Ulceration', 'Bleeding', 'Perforation', 'Discharge', 'Purulent Drainage', 'Serous Drainage',
      'Hemorrhagic Drainage', 'Cerumen (Earwax) Impaction', 'Cerumen Overproduction', 'Cerumen Impaction with Pain',
      'Otitis Externa (Swimmer\'s Ear)', 'Otitis Externa (Acute)', 'Otitis Externa (Chronic)', 'Malignant Otitis Externa',
      'Necrotizing Otitis Externa', 'Diffuse Otitis Externa', 'Localized Otitis Externa (Furunculosis)', 'Fungal Otitis Externa',
      'Candida Otitis', 'Aspergillus Otitis', 'Otomycosis', 'Bacterial Otitis (Pseudomonas)', 'Bacterial Otitis (Staphylococcus)',
      'Otitis Media (Acute)', 'Otitis Media (Chronic)', 'Otitis Media with Effusion (Serous Otitis)', 'Suppurative Otitis Media',
      'Mastoiditis', 'Petrositis', 'Sigmoid Sinus Thrombosis', 'Brain Abscess from Otitis', 'Meningitis from Otitis',
      'Eustachian Tube Dysfunction', 'Eustachian Tube Patency', 'Patent Eustachian Tube', 'Eustachian Tube Obstruction',
      'Barotrauma', 'Barotitis Media', 'Serous Otitis from Barotrauma', 'Round Window Rupture', 'Perilymphatic Fistula',
      'Sudden Sensorineural Hearing Loss (SSHL)', 'Conductive Hearing Loss', 'Mixed Hearing Loss', 'Audiometric Threshold Elevation',
      'Speech Discrimination Loss', 'Acoustic Reflex Absence', 'Tympanogram Type A', 'Tympanogram Type B', 'Tympanogram Type C',
      'Tinnitus Pulsatile', 'Tinnitus Non-pulsatile', 'Objective Tinnitus', 'Subjective Tinnitus', 'Tinnitus Masked by Ambient Noise',
      'Hyperacusis', 'Recruitment', 'Temporal Lobe Involvement', 'Ototoxic Medication Effect', 'Noise-Induced Hearing Loss',
      'Age-Related Hearing Loss (Presbycusis)', 'Sudden Sensorineural Loss', 'Viral Labyrinthitis', 'Bacterial Labyrinthitis',
      'Vestibular Neuritis', 'Benign Paroxysmal Positional Vertigo (BPPV)', 'Ménière Syndrome', 'Superior Semicircular Canal Dehiscence',
      'Cholesteatoma', 'Acquired Cholesteatoma', 'Congenital Cholesteatoma', 'Retracted Tympanic Membrane', 'Atelectasis',
      'Ossicular Chain Discontinuity', 'Ossicular Fixation', 'Otosclerosis', 'Stapes Fixation', 'Malleus Fixation',
      'Incus Necrosis', 'Ossicular Erosion', 'Ossicular Granulation', 'Cholesterin Granuloma', 'Blue Drum Appearance',
      'Hemotympanum', 'Air-Fluid Level', 'Level Meniscus', 'Audiogram Evidence of Conductive Loss', 'Air-Bone Gap Widening',
      'Herpes Zoster Oticus (Ramsay Hunt Syndrome)', 'Facial Nerve Paralysis', 'Vesicular Rash (Herpetic)', 'Severe Otalgia with Palsy',
      'Epiglottitis Referred Pain', 'Glossopharyngeal Neuralgia Referred', 'Trigeminal Neuralgia Referred', 'Occipital Neuralgia Referred',
      'Cervical Radiculopathy Referred', 'TMJ Disorder Referred Pain', 'Dental Pain Referred', 'Parotitis Referred', 'Lymph Node Swelling',
      'Lateral Pharyngitis Referred', 'Laryngitis Referred', 'Thyroiditis Referred', 'Carotidynia', 'Stylohyoid Syndrome',
      'Temporomandibular Joint Syndrome', 'Jaw Clenching Referenced Pain', 'Myofascial Pain Syndrome', 'Sternocleidomastoid Trigger Points',
      'Trapezius Spasm', 'Cervical Tension', 'Postauricular Dermatitis', 'Postauricular Cyst', 'Postauricular Lymphadenopathy',
      'Hilum Nodes', 'Regional Lymphadenopathy', 'Folliculitis of External Auditory Canal', 'Preauricular Pit Infection',
      'Branchial Cleft Cyst Infection', 'Periauricular Cellulitis', 'Periauricular Abscesses', 'Recurrent External Otitis',
      'Acute Mastoiditis', 'Chronic Mastoiditis', 'Mastoid Cavity', 'Chronic Suppurative Otitis', 'Osseous Labyrinthitis',
      'Cochlear Ossification', 'Labyrinthine Ossification', 'Labyrinthitis Ossificans', 'Surgical Complications', 'Tympanoplasty Failure',
      'Ossiculoplasty Complications', 'Mastoidectomy Cavity', 'Canal Wall Down Mastoidectomy', 'Conductive Hearing After Surgery',
      'Perilymphatic Fistula Leak', 'Oval Window Rupture', 'Round Window Rupture', 'Superior Semicircular Canal Dehiscence Symptoms',
      'Autophony (Bone Conduction to Air)', 'Echo in Ear', 'Self-Resonance', 'Hyperacusis to Own Voice', 'Conductive Hyperacusis'
    ],
    'Right Ear': [
      'Pain (Otalgia)', 'Itching', 'Drainage', 'Hearing Loss (Unilateral)', 'Ringing (Tinnitus)', 'Fullness',
      'Tenderness', 'Swelling', 'Erythema', 'Scaling', 'Crusting', 'Maceration', 'Vesicles', 'Pustules',
      'Bullae', 'Ulceration', 'Bleeding', 'Perforation', 'Discharge', 'Purulent Drainage', 'Serous Drainage',
      'Hemorrhagic Drainage', 'Cerumen (Earwax) Impaction', 'Cerumen Overproduction', 'Cerumen Impaction with Pain',
      'Otitis Externa (Swimmer\'s Ear)', 'Otitis Externa (Acute)', 'Otitis Externa (Chronic)', 'Malignant Otitis Externa',
      'Necrotizing Otitis Externa', 'Diffuse Otitis Externa', 'Localized Otitis Externa (Furunculosis)', 'Fungal Otitis Externa',
      'Candida Otitis', 'Aspergillus Otitis', 'Otomycosis', 'Bacterial Otitis (Pseudomonas)', 'Bacterial Otitis (Staphylococcus)',
      'Otitis Media (Acute)', 'Otitis Media (Chronic)', 'Otitis Media with Effusion (Serous Otitis)', 'Suppurative Otitis Media',
      'Mastoiditis', 'Petrositis', 'Sigmoid Sinus Thrombosis', 'Brain Abscess from Otitis', 'Meningitis from Otitis',
      'Eustachian Tube Dysfunction', 'Eustachian Tube Patency', 'Patent Eustachian Tube', 'Eustachian Tube Obstruction',
      'Barotrauma', 'Barotitis Media', 'Serous Otitis from Barotrauma', 'Round Window Rupture', 'Perilymphatic Fistula',
      'Sudden Sensorineural Hearing Loss (SSHL)', 'Conductive Hearing Loss', 'Mixed Hearing Loss', 'Audiometric Threshold Elevation',
      'Speech Discrimination Loss', 'Acoustic Reflex Absence', 'Tympanogram Type A', 'Tympanogram Type B', 'Tympanogram Type C',
      'Tinnitus Pulsatile', 'Tinnitus Non-pulsatile', 'Objective Tinnitus', 'Subjective Tinnitus', 'Tinnitus Masked by Ambient Noise',
      'Hyperacusis', 'Recruitment', 'Temporal Lobe Involvement', 'Ototoxic Medication Effect', 'Noise-Induced Hearing Loss',
      'Age-Related Hearing Loss (Presbycusis)', 'Sudden Sensorineural Loss', 'Viral Labyrinthitis', 'Bacterial Labyrinthitis',
      'Vestibular Neuritis', 'Benign Paroxysmal Positional Vertigo (BPPV)', 'Ménière Syndrome', 'Superior Semicircular Canal Dehiscence',
      'Cholesteatoma', 'Acquired Cholesteatoma', 'Congenital Cholesteatoma', 'Retracted Tympanic Membrane', 'Atelectasis',
      'Ossicular Chain Discontinuity', 'Ossicular Fixation', 'Otosclerosis', 'Stapes Fixation', 'Malleus Fixation',
      'Incus Necrosis', 'Ossicular Erosion', 'Ossicular Granulation', 'Cholesterin Granuloma', 'Blue Drum Appearance',
      'Hemotympanum', 'Air-Fluid Level', 'Level Meniscus', 'Audiogram Evidence of Conductive Loss', 'Air-Bone Gap Widening',
      'Herpes Zoster Oticus (Ramsay Hunt Syndrome)', 'Facial Nerve Paralysis', 'Vesicular Rash (Herpetic)', 'Severe Otalgia with Palsy',
      'Epiglottitis Referred Pain', 'Glossopharyngeal Neuralgia Referred', 'Trigeminal Neuralgia Referred', 'Occipital Neuralgia Referred',
      'Cervical Radiculopathy Referred', 'TMJ Disorder Referred Pain', 'Dental Pain Referred', 'Parotitis Referred', 'Lymph Node Swelling',
      'Lateral Pharyngitis Referred', 'Laryngitis Referred', 'Thyroiditis Referred', 'Carotidynia', 'Stylohyoid Syndrome',
      'Temporomandibular Joint Syndrome', 'Jaw Clenching Referenced Pain', 'Myofascial Pain Syndrome', 'Sternocleidomastoid Trigger Points',
      'Trapezius Spasm', 'Cervical Tension', 'Postauricular Dermatitis', 'Postauricular Cyst', 'Postauricular Lymphadenopathy',
      'Hilum Nodes', 'Regional Lymphadenopathy', 'Folliculitis of External Auditory Canal', 'Preauricular Pit Infection',
      'Branchial Cleft Cyst Infection', 'Periauricular Cellulitis', 'Periauricular Abscesses', 'Recurrent External Otitis',
      'Acute Mastoiditis', 'Chronic Mastoiditis', 'Mastoid Cavity', 'Chronic Suppurative Otitis', 'Osseous Labyrinthitis',
      'Cochlear Ossification', 'Labyrinthine Ossification', 'Labyrinthitis Ossificans', 'Surgical Complications', 'Tympanoplasty Failure',
      'Ossiculoplasty Complications', 'Mastoidectomy Cavity', 'Canal Wall Down Mastoidectomy', 'Conductive Hearing After Surgery',
      'Perilymphatic Fistula Leak', 'Oval Window Rupture', 'Round Window Rupture', 'Superior Semicircular Canal Dehiscence Symptoms',
      'Autophony (Bone Conduction to Air)', 'Echo in Ear', 'Self-Resonance', 'Hyperacusis to Own Voice', 'Conductive Hyperacusis'
    ],
    'Mouth / Lips': [
      'Pain', 'Dryness', 'Swelling', 'Cracking', 'Burning', 'Numbness', 'Sores', 'Blistering', 'Herpes Simplex',
      'Canker Sores (Aphthous Ulcers)', 'Angular Cheilitis', 'Cheilitis', 'Lip Biting', 'Lip Licking Dermatitis',
      'Contact Dermatitis', 'Perleche', 'Exfoliative Cheilitis', 'Actinic Cheilitis', 'Squamous Cell Carcinoma',
      'Basal Cell Carcinoma', 'Melanoma', 'Pemphigus', 'Pemphigoid', 'Bullous Pemphigoid', 'Lichen Planus',
      'Oral Lichen Planus', 'Erythema Multiforme', 'Pemphigus Vulgaris', 'Angioedema', 'Allergic Reaction Swelling',
      'Anaphylaxis Lip Swelling', 'Stevens-Johnson Syndrome', 'Toxic Epidermal Necrolysis', 'Coxsackievirus Vesicles',
      'Oral Thrush (Candidiasis)', 'Geographic Tongue', 'Fissured Tongue', 'Macroglossia', 'Tongue Swelling',
      'Lip Numbness', 'Paresthesia', 'Allodynia', 'Hyperesthesia', 'Hypoesthesia', 'Paralysis', 'Weakness'
    ],
    'Teeth / Gums': [
      'Pain', 'Sensitivity', 'Swelling', 'Bleeding', 'Looseness', 'Aching', 'Sharp Stabbing Pain', 'Dull Ache',
      'Throbbing Pain', 'Radiating Pain', 'Referred Ear Pain', 'Referred Temporal Pain', 'Referred Sinus Pain',
      'Caries (Cavities)', 'Dental Caries', 'Root Caries', 'Early Childhood Caries', 'Smooth Surface Caries',
      'Pit and Fissure Caries', 'Secondary Caries', 'Exposed Dentin', 'Dentinal Hypersensitivity', 'Desensitizing Needs',
      'Gingivitis', 'Acute Gingivitis', 'Chronic Gingivitis', 'Aggressive Periodontitis', 'Chronic Periodontitis',
      'Periodontitis', 'Periapical Abscess', 'Gingival Abscess', 'Periodontal Abscess', 'Necrotizing Ulcerative Gingivitis',
      'Necrotizing Ulcerative Periodontitis', 'Gum Recession', 'Gingival Hypertrophy', 'Gingival Overgrowth', 'Drug-Induced Overgrowth',
      'Gingivitis Hyperplasia', 'Gingival Fibromatosis', 'Pemphigus Gingival', 'Pemphigoid Gingival', 'Lichen Planus',
      'Oral Lichen Planus', 'Erosive Lichen Planus', 'Erythematous Lichen Planus', 'Reticular Lichen Planus',
      'Erythema Multiforme', 'Candidiasis', 'Oral Thrush', 'Angular Cheilitis', 'Perleche', 'Traumatic Ulcer',
      'Ill-Fitting Dentures', 'Orthodontic Wire Ulcer', 'Cheek Biting Ulcer', 'Chemical Burn', 'Thermal Burn',
      'Tobacco Leukoplakia', 'Oral Submucous Fibrosis', 'Potentially Malignant Disorders', 'Squamous Cell Carcinoma',
      'Basal Cell Carcinoma', 'Ameloblastoma', 'Amelanotic Melanoma', 'Salivary Gland Tumors', 'Mucoepidermoid Carcinoma',
      'Adenocarcinoma', 'Oral Leukoplakia', 'Erythroplakia', 'Leukoplakia with Erythroplakia', 'Speckled Leukoplakia',
      'Verrucous Leukoplakia', 'Nodular Leukoplakia', 'Homogeneous Leukoplakia', 'Non-Homogeneous Leukoplakia'
    ],
    'Jaw / Chin': [
      'Pain', 'Clicking', 'Stiffness', 'Swelling', 'Difficulty Chewing', 'Tenderness', 'Popping', 'Locking',
      'Limited Mouth Opening (Trismus)', 'Restricted Jaw Movement', 'Deviation on Opening', 'Lateral Deviation',
      'Anterior Deviation', 'Posterior Deviation', 'TMJ Disorder', 'Temporomandibular Joint Dysfunction',
      'Myofascial Pain Syndrome', 'Muscle Tension', 'Spasm', 'Muscle Trigger Points', 'Masticatory Muscle Hypertrophy',
      'Jaw Clenching', 'Bruxism (Teeth Grinding)', 'Sleep Bruxism', 'Awake Bruxism', 'Clenching Habit',
      'Malocclusion', 'Class II Malocclusion', 'Class III Malocclusion', 'Open Bite', 'Crossbite',
      'Anterior Crossbite', 'Posterior Crossbite', 'Unilateral Crossbite', 'Bilateral Crossbite', 'Overjet',
      'Excessive Overjet', 'Negative Overjet', 'Overbite', 'Excessive Overbite', 'Anterior Open Bite',
      'TMJ Osteoarthritis', 'TMJ Arthritis', 'Inflammatory Arthritis', 'Rheumatoid Arthritis Involvement',
      'Gout Arthritis', 'Psoriatic Arthritis Involvement', 'Ankylosing Spondylitis Involvement', 'Lupus Involvement',
      'Scleroderma Involvement', 'Sjögren Syndrome', 'Fibromyalgia Referral', 'Referred Cervical Pain',
      'Referred Ear Pain', 'Referred Temple Pain', 'Referred Sinus Pain', 'Referred Trigeminal Pain',
      'Trigeminal Neuralgia', 'Postherpe Neuralgia', 'Glossopharyngeal Neuralgia', 'Occipital Neuralgia',
      'Bell Palsy Involvement', 'Facial Nerve Paralysis', 'Partial Facial Paralysis', 'Hemifacial Spasm',
      'Jaw Fracture', 'Condylar Fracture', 'Subcondylar Fracture', 'Ramus Fracture', 'Symphysis Fracture',
      'Parasymphysis Fracture', 'Angle Fracture', 'Body Fracture', 'Alveolar Fracture', 'Impacted Third Molar',
      'Surgical Removal Pain', 'Dry Socket (Alveolar Osteitis)', 'Osteoradionecrosis', 'Medication Side Effect'
    ],
    'Left Cheek': [
      'Swelling', 'Pain', 'Numbness', 'Redness', 'Tingling', 'Rash', 'Puffiness', 'Edema', 'Facial Fullness',
      'Acne', 'Acne Papules', 'Acne Pustules', 'Acne Cysts', 'Acne Nodules', 'Rosacea', 'Rosacea Erythema',
      'Rosacea Telangiectasia', 'Rosacea Papules', 'Rosacea Pustules', 'Ocular Rosacea', 'Seborrheic Dermatitis',
      'Atopic Dermatitis', 'Eczema', 'Allergic Contact Dermatitis', 'Irritant Contact Dermatitis', 'Perioral Dermatitis',
      'Sebaceous Cyst', 'Epidermoid Cyst', 'Pilar Cyst', 'Lipoma', 'Dermoid Cyst', 'Hemangioma', 'Port Wine Stain',
      'Strawberry Hemangioma', 'Cavernous Hemangioma', 'Lymphangioma', 'Mole (Nevus)', 'Dysplastic Nevus',
      'Atypical Nevus', 'Congenital Nevus', 'Giant Congenital Nevus', 'Blue Nevus', 'Junctional Nevus',
      'Compound Nevus', 'Intradermal Nevus', 'Melanoma', 'Lentigo Maligna Melanoma', 'Superficial Spreading Melanoma',
      'Nodular Melanoma', 'Squamous Cell Carcinoma', 'Basal Cell Carcinoma', 'Merkel Cell Carcinoma', 'Microcystic Adnexal Carcinoma',
      'Sebaceous Carcinoma', 'Bell Palsy', 'Facial Nerve Palsy', 'Unilateral Facial Droop', 'Hemiparesis',
      'Trigeminal Nerve Distribution', 'Trigeminal Neuralgia', 'Postherpetic Neuralgia', 'Nerve Compression',
      'Ramsay Hunt Syndrome', 'Herpes Zoster Oticus', 'Chickenpox Scar', 'Shingles (Herpes Zoster)', 'Viral Exanthem',
      'Measles Rash', 'Scarlet Fever Rash', 'Lyme Disease Rash (Erythema Migrans)', 'Rocky Mountain Spotted Fever Rash',
      'Secondary Syphilis Rash', 'Varicella-Zoster Rash', 'Molluscum Contagiosum', 'Verruca Vulgaris (Wart)',
      'Seborrheic Keratosis', 'Skin Tag', 'Syringoma', 'Milia', 'Blackhead', 'Whitehead', 'Whiteheads',
      'Comedones', 'Open Comedones', 'Closed Comedones', 'Pimple', 'Boil', 'Carbuncle', 'Folliculitis'
    ],
    'Right Cheek': [
      'Swelling', 'Pain', 'Numbness', 'Redness', 'Tingling', 'Rash', 'Puffiness', 'Edema', 'Facial Fullness',
      'Acne', 'Acne Papules', 'Acne Pustules', 'Acne Cysts', 'Acne Nodules', 'Rosacea', 'Rosacea Erythema',
      'Rosacea Telangiectasia', 'Rosacea Papules', 'Rosacea Pustules', 'Ocular Rosacea', 'Seborrheic Dermatitis',
      'Atopic Dermatitis', 'Eczema', 'Allergic Contact Dermatitis', 'Irritant Contact Dermatitis', 'Perioral Dermatitis',
      'Sebaceous Cyst', 'Epidermoid Cyst', 'Pilar Cyst', 'Lipoma', 'Dermoid Cyst', 'Hemangioma', 'Port Wine Stain',
      'Strawberry Hemangioma', 'Cavernous Hemangioma', 'Lymphangioma', 'Mole (Nevus)', 'Dysplastic Nevus',
      'Atypical Nevus', 'Congenital Nevus', 'Giant Congenital Nevus', 'Blue Nevus', 'Junctional Nevus',
      'Compound Nevus', 'Intradermal Nevus', 'Melanoma', 'Lentigo Maligna Melanoma', 'Superficial Spreading Melanoma',
      'Nodular Melanoma', 'Squamous Cell Carcinoma', 'Basal Cell Carcinoma', 'Merkel Cell Carcinoma', 'Microcystic Adnexal Carcinoma',
      'Sebaceous Carcinoma', 'Bell Palsy', 'Facial Nerve Palsy', 'Unilateral Facial Droop', 'Hemiparesis',
      'Trigeminal Nerve Distribution', 'Trigeminal Neuralgia', 'Postherpetic Neuralgia', 'Nerve Compression',
      'Ramsay Hunt Syndrome', 'Herpes Zoster Oticus', 'Chickenpox Scar', 'Shingles (Herpes Zoster)', 'Viral Exanthem',
      'Measles Rash', 'Scarlet Fever Rash', 'Lyme Disease Rash (Erythema Migrans)', 'Rocky Mountain Spotted Fever Rash',
      'Secondary Syphilis Rash', 'Varicella-Zoster Rash', 'Molluscum Contagiosum', 'Verruca Vulgaris (Wart)',
      'Seborrheic Keratosis', 'Skin Tag', 'Syringoma', 'Milia', 'Blackhead', 'Whitehead', 'Whiteheads',
      'Comedones', 'Open Comedones', 'Closed Comedones', 'Pimple', 'Boil', 'Carbuncle', 'Folliculitis'
    ],

    // NECK AREA - Extensive Swallowing, Thyroid, Nerve, and Vascular Symptoms
    'Left Side of Neck': [
      'Stiffness', 'Pain', 'Swelling', 'Tenderness', 'Mobility Issues', 'Numbness', 'Tingling', 'Burning',
      'Neck Strain', 'Muscle Tension', 'Muscle Spasm', 'Torticollis (Wry Neck)', 'Acute Torticollis',
      'Chronic Torticollis', 'Dystonia', 'Cervical Dystonia', 'Spasticity', 'Rigidity', 'Hypertonicity',
      'Cervicogenic Headache', 'Cervical Radiculopathy', 'Nerve Compression', 'Nerve Impingement', 'Pinched Nerve',
      'C1 Radiculopathy', 'C2 Radiculopathy', 'C3 Radiculopathy', 'C4 Radiculopathy', 'C5 Radiculopathy',
      'C6 Radiculopathy', 'C7 Radiculopathy', 'C8 Radiculopathy', 'Brachial Plexopathy', 'Thoracic Outlet Syndrome',
      'Cervical Spondylosis', 'Cervical Osteoarthritis', 'Cervical Disc Herniation', 'Disc Bulge', 'Disc Protrusion',
      'Disc Extrusion', 'Sequestered Disc', 'Myelopathy', 'Cervical Myelopathy', 'Lhermitte Symptom',
      'Spinal Cord Compression', 'Stenosis', 'Central Canal Stenosis', 'Lateral Stenosis', 'Foraminal Stenosis',
      'Spondylolisthesis', 'Whiplash Injury', 'Whiplash Associated Disorder', 'Traumatic Neck Injury', 'Acceleration-Deceleration Injury',
      'Muscle Strain', 'Muscle Tear', 'Muscle Rupture', 'Partial Tear', 'Complete Tear', 'Sternocleidomastoid Strain',
      'Trapezius Strain', 'Scalene Muscle Strain', 'Levator Scapulae Strain', 'Erector Spinae Strain',
      'Cervicitis', 'Inflamed Cervical Nodes', 'Reactive Lymphadenopathy', 'Cervical Lymph Node Swelling',
      'Lymphadenitis', 'Suppurative Lymphadenitis', 'Tuberculous Lymphadenitis', 'Cat Scratch Disease',
      'Toxoplasmosis Lymphadenopathy', 'Infectious Mononucleosis', 'Cytomegalovirus', 'Acute Leukemia Lymphadenopathy',
      'Hodgkin Lymphoma', 'Non-Hodgkin Lymphoma', 'Metastatic Lymphadenopathy', 'Thyroid Cancer', 'Referred Pain from Thyroid'
    ],
    'Front of Neck': [
      'Swelling', 'Pain', 'Difficulty Swallowing (Dysphagia)', 'Hoarseness', 'Lump Feeling', 'Foreign Body Sensation',
      'Throat Tightness', 'Choking Sensation', 'Globus Sensation', 'Globus Pharyngeus', 'Functional Dysphagia',
      'Dysphagia Lusitanica', 'Odynophagia (Painful Swallowing)', 'Acute Odynophagia', 'Chronic Odynophagia',
      'Difficulty Swallowing Solids', 'Difficulty Swallowing Liquids', 'Dysphagia to Both Solids and Liquids',
      'Progressive Dysphagia', 'Intermittent Dysphagia', 'Esophageal Spasm', 'Achalasia', 'Esophageal Stricture',
      'Esophageal Web', 'Esophageal Diverticulum', 'Zenker Diverticulum', 'Thyroid Enlargement',
      'Goiter', 'Diffuse Goiter', 'Nodular Goiter', 'Toxic Goiter', 'Non-Toxic Goiter', 'Graves Disease',
      'Hashimoto Thyroiditis', 'Thyroiditis', 'Acute Thyroiditis', 'Subacute Thyroiditis', 'Postpartum Thyroiditis',
      'Silent Thyroiditis', 'Acute Suppurative Thyroiditis', 'Chronic Thyroiditis', 'Fibrous Thyroiditis',
      'Riedel Thyroiditis', 'Thyroid Nodule', 'Toxic Nodule', 'Cold Nodule', 'Warm Nodule', 'Thyroid Cyst',
      'Cystic Lesion', 'Complex Cyst', 'Simple Cyst', 'Thyroid Cancer', 'Papillary Thyroid Cancer',
      'Follicular Thyroid Cancer', 'Medullary Thyroid Cancer', 'Anaplastic Thyroid Cancer', 'Primary Thyroid Lymphoma',
      'Parathyroid Adenoma', 'Parathyroid Hyperplasia', 'Laryngitis', 'Acute Laryngitis', 'Chronic Laryngitis',
      'Viral Laryngitis', 'Bacterial Laryngitis', 'Fungal Laryngitis', 'Tuberculous Laryngitis', 'Laryngeal Papillomatosis',
      'Laryngeal Paralysis', 'Recurrent Laryngeal Nerve Injury', 'Superior Laryngeal Nerve Injury', 'Vocal Cord Dysfunction',
      'Spasmodic Dysphonia', 'Vocal Cord Paresis', 'Vocal Cord Paralysis', 'Vocal Cord Bowing', 'Vocal Cord Atrophy'
    ],
    'Right Side of Neck': [
      'Stiffness', 'Pain', 'Swelling', 'Tenderness', 'Mobility Issues', 'Numbness', 'Tingling', 'Burning',
      'Neck Strain', 'Muscle Tension', 'Muscle Spasm', 'Torticollis (Wry Neck)', 'Acute Torticollis',
      'Chronic Torticollis', 'Dystonia', 'Cervical Dystonia', 'Spasticity', 'Rigidity', 'Hypertonicity',
      'Cervicogenic Headache', 'Cervical Radiculopathy', 'Nerve Compression', 'Nerve Impingement', 'Pinched Nerve',
      'C1 Radiculopathy', 'C2 Radiculopathy', 'C3 Radiculopathy', 'C4 Radiculopathy', 'C5 Radiculopathy',
      'C6 Radiculopathy', 'C7 Radiculopathy', 'C8 Radiculopathy', 'Brachial Plexopathy', 'Thoracic Outlet Syndrome',
      'Cervical Spondylosis', 'Cervical Osteoarthritis', 'Cervical Disc Herniation', 'Disc Bulge', 'Disc Protrusion',
      'Disc Extrusion', 'Sequestered Disc', 'Myelopathy', 'Cervical Myelopathy', 'Lhermitte Symptom',
      'Spinal Cord Compression', 'Stenosis', 'Central Canal Stenosis', 'Lateral Stenosis', 'Foraminal Stenosis',
      'Spondylolisthesis', 'Whiplash Injury', 'Whiplash Associated Disorder', 'Traumatic Neck Injury', 'Acceleration-Deceleration Injury',
      'Muscle Strain', 'Muscle Tear', 'Muscle Rupture', 'Partial Tear', 'Complete Tear', 'Sternocleidomastoid Strain',
      'Trapezius Strain', 'Scalene Muscle Strain', 'Levator Scapulae Strain', 'Erector Spinae Strain',
      'Cervicitis', 'Inflamed Cervical Nodes', 'Reactive Lymphadenopathy', 'Cervical Lymph Node Swelling',
      'Lymphadenitis', 'Suppurative Lymphadenitis', 'Tuberculous Lymphadenitis', 'Cat Scratch Disease',
      'Toxoplasmosis Lymphadenopathy', 'Infectious Mononucleosis', 'Cytomegalovirus', 'Acute Leukemia Lymphadenopathy',
      'Hodgkin Lymphoma', 'Non-Hodgkin Lymphoma', 'Metastatic Lymphadenopathy', 'Thyroid Cancer', 'Referred Pain from Thyroid'
    ],
    'Thyroid Area': [
      'Swelling', 'Pain', 'Difficulty Swallowing', 'Lump', 'Hoarseness', 'Goiter', 'Diffuse Goiter',
      'Nodular Goiter', 'Toxic Goiter', 'Non-Toxic Goiter', 'Graves Disease', 'Hashimoto Thyroiditis',
      'Thyroiditis', 'Acute Thyroiditis', 'Subacute Thyroiditis', 'Postpartum Thyroiditis', 'Silent Thyroiditis',
      'Acute Suppurative Thyroiditis', 'Chronic Thyroiditis', 'Fibrous Thyroiditis', 'Riedel Thyroiditis',
      'Thyroid Nodule', 'Toxic Nodule', 'Cold Nodule', 'Warm Nodule', 'Thyroid Cyst', 'Cystic Lesion',
      'Complex Cyst', 'Simple Cyst', 'Thyroid Cancer', 'Papillary Thyroid Cancer', 'Follicular Thyroid Cancer',
      'Medullary Thyroid Cancer', 'Anaplastic Thyroid Cancer', 'Primary Thyroid Lymphoma', 'Parathyroid Adenoma',
      'Parathyroid Hyperplasia', 'Primary Hyperparathyroidism', 'Secondary Hyperparathyroidism', 'Tertiary Hyperparathyroidism',
      'Hypoparathyroidism', 'Pseudohypoparathyroidism', 'Thyroid Tenderness', 'Thyroid Palpable', 'Thyroid Nodularity',
      'Thyroid Firmness', 'Thyroid Fixation', 'Thyroid Mobility', 'Thyroid Brui', 'Thyroid Thrill'
    ],
    'Throat / Voicebox': [
      'Sore Throat', 'Hoarseness', 'Difficulty Swallowing', 'Pain', 'Coughing', 'Throat Clearing',
      'Chronic Cough', 'Laryngitis', 'Acute Laryngitis', 'Chronic Laryngitis', 'Viral Laryngitis',
      'Bacterial Laryngitis', 'Fungal Laryngitis', 'Tuberculous Laryngitis', 'Laryngeal Papillomatosis',
      'Laryngeal Paralysis', 'Recurrent Laryngeal Nerve Injury', 'Superior Laryngeal Nerve Injury',
      'Vocal Cord Dysfunction', 'Spasmodic Dysphonia', 'Vocal Cord Paresis', 'Vocal Cord Paralysis',
      'Vocal Cord Bowing', 'Vocal Cord Atrophy', 'Pharyngitis', 'Acute Pharyngitis', 'Chronic Pharyngitis',
      'Viral Pharyngitis', 'Bacterial Pharyngitis', 'Streptococcal Pharyngitis', 'Fungal Pharyngitis',
      'Herpetic Pharyngitis', 'Infectious Mononucleosis', 'Epiglottitis', 'Retropharyngeal Abscess',
      'Peritonsillar Abscess', 'Lemierre Syndrome', 'Thrombophlebitis', 'Laryngeal Edema', 'Angioedema',
      'Anaphylaxis', 'Laryngospasm', 'Laryngeal Spasm', 'Stridor', 'Inspiratory Stridor', 'Expiratory Stridor',
      'Biphasic Stridor', 'Vocal Cord Nodules', 'Vocal Cord Polyps', 'Vocal Cord Papillomas', 'Vocal Cord Granulomas',
      'Vocal Cord Cysts', 'Vocal Cord Sulcus', 'Laryngeal Web', 'Laryngeal Stenosis', 'Laryngeal Trauma',
      'Laryngeal Fracture', 'Laryngeal Dislocation', 'Vocal Cord Scarring', 'Dysphonia', 'Voice Fatigue'
    ],
    'Collarbone Area': [
      'Pain', 'Swelling', 'Tenderness', 'Limited Mobility', 'Numbness', 'Tingling', 'Crackling',
      'Crepitus', 'Clicking', 'Grinding', 'Distal Clavicle Pain', 'Medial Clavicle Pain', 'AC Joint Pain',
      'Sternoclavicular Joint Pain', 'Clavicle Fracture', 'Proximal Clavicle Fracture', 'Mid-shaft Fracture',
      'Distal Clavicle Fracture', 'Pathological Fracture', 'Nonunion', 'Malunion', 'Hypertrophic Callus',
      'Osteomyelitis', 'Avascular Necrosis', 'Claviculectomy', 'Distal Clavicle Osteolysis', 'Clavicle Osteoarthritis',
      'AC Joint Arthritis', 'AC Joint Hypertrophic Changes', 'Acromioclavicular Separation', 'AC Joint Dislocation',
      'AC Joint Ligament Tear', 'Sternoclavicular Dislocation', 'Sternoclavicular Arthritis', 'Manubrium Fracture',
      'Costochondritis', 'Tietze Syndrome', 'Slipping Rib Syndrome', 'Subclavian Artery Compression',
      'Subclavian Vein Compression', 'Thoracic Outlet Syndrome', 'Subclavian Steal', 'Vascular Thoracic Outlet Syndrome',
      'Neurogenic Thoracic Outlet Syndrome', 'Brachial Plexus Compression', 'Long Thoracic Nerve Compression',
      'Suprascapular Nerve Compression', 'Accessory Nerve Compression', 'Cervical Rib', 'Rib Anomaly'
    ],

    // SHOULDER & CHEST - Comprehensive Upper Extremity & Cardiopulmonary Symptoms
    'Acromion': ['Pain', 'Tenderness', 'Swelling', 'Limited Motion', 'Spurs', 'Crepitus', 'Clicking', 'Impingement Pain', 'Subacromial Impingement', 'Supraspinatus Impingement', 'Bursa Inflammation', 'Subacromial Bursitis', 'Osteophyte Formation', 'Acromial Exostosis', 'Acromial Fracture', 'Bone Tenderness'],
    'Front Deltoid': ['Weakness', 'Pain', 'Stiffness', 'Swelling', 'Limited Mobility', 'Atrophy', 'Hypertrophy', 'Strain', 'Tear', 'Muscle Rupture', 'Axillary Nerve Injury', 'Nerve Impingement', 'Deltoid Contusion', 'Deltoid Soreness', 'Deltoid Cramp'],
    'Side Deltoid': ['Weakness', 'Pain', 'Stiffness', 'Swelling', 'Limited Mobility', 'Atrophy', 'Hypertrophy', 'Strain', 'Tear', 'Muscle Rupture', 'Subacromial Impingement', 'Rotator Cuff Impingement', 'Deltoid Tendinopathy', 'Lateral Shoulder Pain', 'Abduction Weakness'],
    'Shoulder Joint': ['Pain', 'Clicking', 'Popping', 'Instability', 'Limited Range', 'Dislocation', 'Subluxation', 'Anterior Dislocation', 'Posterior Dislocation', 'Inferior Dislocation', 'Multidirectional Instability', 'Glenohumeral Osteoarthritis', 'Post-Traumatic Arthritis', 'Rotator Cuff Arthropathy', 'Cuff Tear Arthropathy', 'Adhesive Capsulitis'],
    'Rotator Cuff Area': ['Sharp Pain', 'Weakness', 'Limited Motion', 'Stiffness', 'Clicking', 'Night Pain', 'Sleep Disruption', 'Supraspinatus Tear', 'Infraspinatus Tear', 'Teres Minor Tear', 'Subscapularis Tear', 'Rotator Cuff Tendinopathy', 'Impingement Syndrome', 'Subacromial Impingement', 'Internal Impingement', 'Calcific Tendinitis', 'Tendon Calcification'],
    'Rear Deltoid': ['Weakness', 'Pain', 'Stiffness', 'Swelling', 'Strain', 'Tear', 'Muscle Rupture', 'Axillary Nerve Injury', 'Referred Pain from Rotator Cuff', 'Posterior Shoulder Pain', 'Deltoid Myositis', 'Deltoid Contusion'],
    'Upper Trapezius': ['Tension', 'Stiffness', 'Pain', 'Tightness', 'Limited Motion', 'Muscle Knots', 'Trigger Points', 'Myofascial Pain', 'Muscle Spasm', 'Trapezius Strain', 'Cervical Referral', 'Tension Headache Referral', 'Trapezius Myositis', 'Upper Trap Tenderness'],

    // CHEST AREAS - Cardiac & Respiratory Symptoms
    'Left Collarbone': ['Pain', 'Swelling', 'Tenderness', 'Numbness', 'Fracture', 'AC Joint Separation', 'Costoclavicular Syndrome', 'Subclavian Nerve Compression', 'Thoracic Outlet Syndrome', 'Clavicle Tenderness', 'Distal Clavicle Pain'],
    'Upper Chest': ['Sharp Pain', 'Pressure', 'Tightness', 'Soreness', 'Swelling', 'Chest Wall Pain', 'Costochondritis', 'Precordial Catch', 'Pleuritic Pain', 'Pericarditis', 'Myocardial Infarction Pain', 'Angina Pectoris', 'Stable Angina', 'Unstable Angina', 'Vasospastic Angina', 'Dyspnea', 'Shortness of Breath', 'Palpitations'],
    'Right Collarbone': ['Pain', 'Swelling', 'Tenderness', 'Numbness', 'Fracture', 'AC Joint Separation', 'Costoclavicular Syndrome', 'Subclavian Nerve Compression', 'Thoracic Outlet Syndrome', 'Clavicle Tenderness', 'Distal Clavicle Pain'],
    'Left Breast / Pectoral': ['Pain', 'Swelling', 'Tenderness', 'Lumps', 'Redness', 'Nipple Discharge', 'Fibrocystic Changes', 'Fibroadenoma', 'Phyllodes Tumor', 'Intraductal Papilloma', 'Fat Necrosis', 'Mastitis', 'Breast Abscess', 'Gynecomastia', 'Pectoralis Major Strain', 'Pectoralis Minor Strain', 'Pectoralis Rupture'],
    'Sternum / Mid-Chest': ['Sharp Pain', 'Pressure', 'Discomfort', 'Tightness', 'Burning', 'Acute Coronary Syndrome', 'NSTEMI', 'STEMI', 'Myocardial Infarction', 'Pericarditis', 'Pericardial Effusion', 'Cardiac Tamponade', 'Esophageal Spasm', 'GERD', 'Peptic Ulcer', 'Pulmonary Embolism', 'Pneumonia', 'Pleurisy', 'Pneumothorax', 'Aortic Dissection'],
    'Right Breast / Pectoral': ['Pain', 'Swelling', 'Tenderness', 'Lumps', 'Redness', 'Nipple Discharge', 'Fibrocystic Changes', 'Fibroadenoma', 'Phyllodes Tumor', 'Intraductal Papilloma', 'Fat Necrosis', 'Mastitis', 'Breast Abscess', 'Gynecomastia', 'Pectoralis Major Strain', 'Pectoralis Minor Strain', 'Pectoralis Rupture'],
    'Left Rib Cage': ['Sharp Pain', 'Soreness', 'Difficulty Breathing', 'Bruising', 'Tenderness', 'Rib Fracture', 'Stress Fracture', 'Intercostal Neuralgia', 'Intercostal Myositis', 'Costochondritis', 'Tietze Syndrome', 'Slipping Rib Syndrome', 'Pleurisy', 'Pneumonia', 'Pleural Effusion', 'Hemothorax', 'Flail Chest', 'Rib Contusion', 'Intercostal Muscle Strain'],
    'Lower Chest': ['Soreness', 'Stiffness', 'Pain', 'Difficulty Breathing', 'GERD Pain', 'Gastric Pain', 'Hepatic Tenderness', 'Splenic Infarct', 'Subphrenic Abscess', 'Pneumonia Base', 'Pleural Effusion', 'Diaphragmatic Hernia', 'Diaphragm Strain'],
    'Right Rib Cage': ['Sharp Pain', 'Soreness', 'Difficulty Breathing', 'Bruising', 'Tenderness', 'Rib Fracture', 'Stress Fracture', 'Intercostal Neuralgia', 'Intercostal Myositis', 'Costochondritis', 'Tietze Syndrome', 'Slipping Rib Syndrome', 'Pleurisy', 'Pneumonia', 'Pleural Effusion', 'Hemothorax', 'Flail Chest', 'Rib Contusion', 'Intercostal Muscle Strain'],

    // ABDOMINAL REGIONS - GI, Urological, Male-Specific symptoms
    'Upper Left Abdomen (Spleen/Stomach)': ['Sharp Pain', 'Cramping', 'Bloating', 'Nausea', 'Swelling', 'Distension', 'Splenic Infarct', 'Splenic Rupture', 'Splenic Sequestration Crisis', 'Gastric Ulcer', 'Gastritis', 'Acute Gastritis', 'Erosive Gastritis', 'Stress Gastritis', 'Gastric Cancer', 'Gastric MALT Lymphoma', 'Splenomegaly', 'Splenic Pain'],
    'Upper Abdomen (Epigastric)': ['Acid Reflux', 'Pain', 'Burning', 'Nausea', 'Discomfort', 'GERD', 'Peptic Ulcer', 'Gastric Ulcer', 'Duodenal Ulcer', 'Gastritis', 'Hepatitis', 'Cirrhosis', 'Fatty Liver', 'Pancreatitis', 'Acute Pancreatitis', 'Chronic Pancreatitis', 'Pancreatic Cancer', 'Pyloric Stenosis', 'Gastric Outlet Obstruction', 'Superior Mesenteric Artery Syndrome'],
    'Upper Right Abdomen (Gallbladder/Liver)': ['Sharp Pain', 'Tenderness', 'Cramping', 'Swelling', 'Biliary Colic', 'Cholecystitis', 'Acute Cholecystitis', 'Chronic Cholecystitis', 'Cholelithiasis', 'Gallstone Ileus', 'Bile Duct Obstruction', 'Cholangitis', 'Biliary Dyskinesia', 'Sphincter of Oddi Dysfunction', 'Hepatic Abscess', 'Hepatic Infarct', 'Budd-Chiari Syndrome', 'Peritonitis', 'Right Upper Quadrant Pain'],
    'Left Flank': ['Sharp Pain', 'Soreness', 'Tenderness', 'Stiffness', 'Renal Pain', 'Nephrolithiasis', 'Kidney Stone', 'Acute Pyelonephritis', 'Chronic Pyelonephritis', 'Renal Infarction', 'Renal Abscess', 'Perirenal Abscess', 'Perinephric Hematoma', 'Polycystic Kidney Disease', 'Renal Artery Dissection', 'Flank Pain'],
    'Navel / Periumbilical Area': ['Pain', 'Cramping', 'Tenderness', 'Discomfort', 'Appendicitis', 'Umbilical Hernia', 'Meckel Diverticulum', 'Volvulus', 'Intussusception', 'Periumbilical Infection', 'Cellulitis', 'Umbilical Granuloma', 'Umbilical Sepsis'],
    'Right Flank': ['Sharp Pain', 'Soreness', 'Tenderness', 'Stiffness', 'Renal Pain', 'Nephrolithiasis', 'Kidney Stone', 'Acute Pyelonephritis', 'Chronic Pyelonephritis', 'Renal Infarction', 'Renal Abscess', 'Perirenal Abscess', 'Perinephric Hematoma', 'Polycystic Kidney Disease', 'Renal Artery Dissection', 'Flank Pain'],
    'Lower Left Abdomen (Colon)': ['Cramping', 'Bloating', 'Pain', 'Discomfort', 'Constipation', 'Diarrhea', 'Diverticulitis', 'Diverticulosis', 'Colitis', 'Ulcerative Colitis', 'Crohn Disease', 'Ischemic Colitis', 'Infective Colitis', 'IBS', 'Colon Cancer', 'Colorectal Cancer', 'Stricture', 'Obstruction', 'Fecal Impaction', 'Left Lower Quadrant Pain'],
    'Lower Abdomen (Hypogastric)': ['Cramping', 'Tenderness', 'Discomfort', 'Pain', 'Bladder Pain', 'Cystitis', 'Interstitial Cystitis', 'Bladder Cancer', 'Urinary Retention', 'Urinary Incontinence', 'Prostate Pain', 'Prostatitis', 'Acute Prostatitis', 'Chronic Prostatitis', 'CPPS', 'Benign Prostatic Hyperplasia', 'BPH', 'Prostate Cancer', 'Testicular Pain', 'Orchitis', 'Epididymitis', 'Testicular Torsion'],
    'Lower Right Abdomen (Appendix)': ['Sharp Pain', 'Tenderness', 'Swelling', 'Cramping', 'Appendicitis', 'Acute Appendicitis', 'Chronic Appendicitis', 'Appendix Perforation', 'Periappendiceal Abscess', 'Cecal Pathology', 'Ileocecal Valve Disease', 'Right Lower Quadrant Pain', 'McBurney Point Tenderness'],

    // PELVIS/GROIN - Urological & Male Genitourinary
    'Left Hip Joint': ['Pain', 'Stiffness', 'Limited Motion', 'Clicking', 'Swelling', 'Osteoarthritis', 'Hip Dysplasia', 'Femoroacetabular Impingement', 'Labral Tear', 'Hip Flexor Strain', 'Iliotibial Band Syndrome', 'Bursitis', 'Trochanteric Bursitis', 'Avascular Necrosis', 'Slipped Capital Femoral Epiphysis'],
    'Iliac Crest': ['Pain', 'Tenderness', 'Swelling', 'Limited Motion', 'Iliac Crest Contusion', 'Avulsion Fracture', 'Apophysitis', 'Iliacus Strain', 'Psoas Major Strain', 'Hip Pointer', 'Pelvic Stress Fracture', 'Iliac Wing Fracture'],
    'Right Hip Joint': ['Pain', 'Stiffness', 'Limited Motion', 'Clicking', 'Swelling', 'Osteoarthritis', 'Hip Dysplasia', 'Femoroacetabular Impingement', 'Labral Tear', 'Hip Flexor Strain', 'Iliotibial Band Syndrome', 'Bursitis', 'Trochanteric Bursitis', 'Avascular Necrosis', 'Slipped Capital Femoral Epiphysis'],
    'Groin (Left)': ['Pain', 'Swelling', 'Tenderness', 'Strain', 'Limited Motion', 'Hernia', 'Inguinal Hernia', 'Femoral Hernia', 'Sports Hernia', 'Adductor Strain', 'Hip Flexor Strain', 'Iliopsoas Strain', 'Pectineus Strain', 'Gracilis Strain', 'Lymphadenitis', 'Lymph Node Swelling', 'STI Pain', 'Testicular Referral Pain', 'Ureterolithiasis', 'Epididymitis Referral'],
    'Pubic Region': ['Pain', 'Tenderness', 'Swelling', 'Discomfort', 'Pubic Symphysis Dysfunction', 'Osteitis Pubis', 'Pubic Ramus Fracture', 'Bladder Tenderness', 'Cystitis', 'Bladder Trauma', 'Urinary Retention', 'Prostate Enlargement', 'BPH', 'Periostitis', 'Inguinal Lymphadenopathy', 'Pubic Tenderness'],
    'Groin (Right)': ['Pain', 'Swelling', 'Tenderness', 'Strain', 'Limited Motion', 'Hernia', 'Inguinal Hernia', 'Femoral Hernia', 'Sports Hernia', 'Adductor Strain', 'Hip Flexor Strain', 'Iliopsoas Strain', 'Pectineus Strain', 'Gracilis Strain', 'Lymphadenitis', 'Lymph Node Swelling', 'STI Pain', 'Testicular Referral Pain', 'Ureterolithiasis', 'Epididymitis Referral'],

    // ARMS - Nerve, Muscle, Tendon symptoms
    'Outer Upper Arm': ['Pain', 'Weakness', 'Soreness', 'Bruising', 'Tenderness', 'Deltoid Strain', 'Deltoid Tear', 'Radial Nerve Compression', 'Axillary Nerve Compression', 'Upper Arm Contusion', 'Triceps Strain', 'Radial Collateral Ligament Injury', 'Upper Arm Fracture', 'Posterior Circumflex Humeral Nerve Compression'],
    'Bicep': ['Pain', 'Cramp', 'Weakness', 'Soreness', 'Stiffness', 'Biceps Tendinopathy', 'Biceps Tendinitis', 'Distal Biceps Tear', 'Proximal Biceps Tear', 'Long Head Biceps Tear', 'Short Head Biceps Tear', 'Muscle Rupture', 'Biceps Strain', 'SLAP Lesion', 'Superior Labral Tear', 'Biceps Spasm'],
    'Inner Upper Arm': ['Pain', 'Weakness', 'Numbness', 'Tingling', 'Ulnar Nerve Compression', 'Radial Nerve Compression', 'Medial Antebrachial Cutaneous Nerve Compression', 'Upper Subscapular Nerve Compression', 'Inner Arm Paresthesia'],
    'Elbow Crease': ['Pain', 'Swelling', 'Tenderness', 'Stiffness', 'Redness', 'Cubital Tunnel Syndrome', 'Ulnar Tunnel Syndrome', 'Pronator Teres Syndrome', 'Median Nerve Compression', 'Biceps Tendonitis', 'Brachial Artery Compression', 'Elbow Flexion Pain'],
    'Outer Forearm': ['Pain', 'Weakness', 'Tendinitis', 'Tenderness', 'Swelling', 'Lateral Epicondylitis', 'Tennis Elbow', 'Extensor Carpi Radialis Longus Tendinopathy', 'Extensor Carpi Radialis Brevis Tendinopathy', 'Radial Head Fracture', 'Radial Nerve Compression', 'Posterior Interosseous Nerve Syndrome', 'Thumb Extensor Compartment Syndrome', 'Posterior Antebrachial Cutaneous Nerve Compression'],
    'Inner Forearm': ['Pain', 'Numbness', 'Tingling', 'Weakness', 'Cramping', 'Medial Epicondylitis', 'Golfer\'s Elbow', 'Flexor Carpi Radialis Tendinopathy', 'Flexor Carpi Ulnaris Tendinopathy', 'Pronator Teres Syndrome', 'Anterior Interosseous Nerve Syndrome', 'Median Nerve Compression', 'Ulnar Nerve Compression', 'Cubital Tunnel Syndrome', 'Forearm Compartment Syndrome'],
    'Wrist (Palmar side)': ['Pain', 'Swelling', 'Stiffness', 'Numbness', 'Tenderness', 'Carpal Tunnel Syndrome', 'Median Nerve Compression', 'Wrist Sprain', 'Scaphoid Fracture', 'Scaphoid Nonunion', 'Wrist Osteoarthritis', 'Radiocarpal Arthritis', 'Flexor Tendinitis', 'Tenosynovitis', 'Anterior Interosseous Nerve Syndrome', 'Wrist Instability'],
    'Back of Wrist': ['Pain', 'Swelling', 'Stiffness', 'Limited Motion', 'Extensor Tendinitis', 'Dorsal Wrist Ganglion', 'Wrist Sprain', 'Lunotriquetral Ligament Tear', 'Scapholunate Ligament Tear', 'Extensor Carpi Radialis Longus Tear', 'Extensor Carpi Radialis Brevis Tear', 'Extensor Carpi Ulnaris Tear', 'Dorsal Wrist Impingement', 'Wrist Dorsum Pain'],
    'Tricep Lateral Head': ['Pain', 'Weakness', 'Soreness', 'Cramping', 'Triceps Tendinopathy', 'Triceps Tendinitis', 'Triceps Strain', 'Triceps Tear', 'Radial Nerve Compression', 'Posterior Interosseous Nerve Compression', 'Lateral Triceps Strain'],
    'Tricep Long Head': ['Pain', 'Weakness', 'Soreness', 'Tenderness', 'Triceps Tendinopathy', 'Triceps Tendinitis', 'SLAP Lesion', 'Superior Labral Tear', 'Triceps Tear', 'Posterior Shoulder Instability', 'Long Head Biceps Pain Referral'],
    'Back of Elbow': ['Pain', 'Swelling', 'Stiffness', 'Tenderness', 'Olecranon Bursitis', 'Olecranon Fracture', 'Triceps Tendinitis', 'Posterior Impingement', 'Osteochondritis Dissecans', 'Elbow Osteoarthritis', 'Posterior Elbow Pain', 'Elbow Pad Friction'],
    'Back of Forearm': ['Pain', 'Numbness', 'Tingling', 'Tenderness', 'Posterior Interosseous Nerve Syndrome', 'Extensor Tendinitis', 'Extensor Compartment Syndrome', 'Dorsal Wrist Ganglion', 'Forearm Fracture', 'Compartment Syndrome', 'Extensor Carpi Radialis Tear'],
    'Elbow Tip': ['Pain', 'Bursa', 'Swelling', 'Tenderness', 'Olecranon Bursitis', 'Septic Bursitis', 'Gout Tophi', 'Rheumatoid Nodule', 'Olecranon Fracture', 'Callus Formation', 'Elbow Pad Friction', 'Chronic Olecranon Bursitis'],

    // HANDS - Digit-specific pain, nerve compression, joint symptoms (20+ per region)
    'Palm': ['Pain', 'Numbness', 'Tingling', 'Cramping', 'Calluses', 'Carpal Tunnel Syndrome', 'Thenar Muscle Atrophy', 'Hypothenar Muscle Compression', 'Guyon Canal Syndrome', 'Ulnar Nerve Compression', 'Median Nerve Compression', 'Radial Nerve Compression', 'Digital Nerve Compression', 'Trigger Finger', 'Dupuytren Contracture', 'Palm Swelling', 'Palm Tenderness', 'Thenar Eminence Pain', 'Hypothenar Eminence Pain', 'Palmar Fasciitis'],
    'Thumb': ['Pain', 'Swelling', 'Numbness', 'Limited Motion', 'Weakness', 'Thumb CMC Arthritis', 'Thumb Basal Joint Arthritis', 'De Quervain Tenosynovitis', 'Thumb Collateral Ligament Tear', 'Gamekeeper Thumb', 'Thumb Fracture', 'Thumb Dislocation', 'Thumb Nail Bed Injury', 'Thumb Trigger Finger', 'Thenar Eminence Atrophy', 'Thumb Opposition Weakness', 'Thumb Metacarpal Fracture'],
    'Index Finger': ['Pain', 'Swelling', 'Numbness', 'Stiffness', 'Trigger Finger', 'Mallet Finger', 'Swan Neck Deformity', 'Boutonnière Deformity', 'Finger Fracture', 'Finger Dislocation', 'Collateral Ligament Tear', 'Flexor Tendon Tear', 'Extensor Tendon Tear', 'Nail Bed Injury', 'Raynaud Phenomenon', 'Arthritis', 'Index Finger Paresthesia', 'Finger Cramping'],
    'Middle Finger': ['Pain', 'Swelling', 'Numbness', 'Stiffness', 'Trigger Finger', 'Mallet Finger', 'Swan Neck Deformity', 'Boutonnière Deformity', 'Finger Fracture', 'Finger Dislocation', 'Collateral Ligament Tear', 'Flexor Tendon Tear', 'Extensor Tendon Tear', 'Nail Bed Injury', 'Raynaud Phenomenon', 'Arthritis', 'Middle Finger Paresthesia', 'Finger Cramping'],
    'Ring Finger': ['Pain', 'Swelling', 'Numbness', 'Stiffness', 'Trigger Finger', 'Mallet Finger', 'Swan Neck Deformity', 'Boutonnière Deformity', 'Finger Fracture', 'Finger Dislocation', 'Collateral Ligament Tear', 'Flexor Tendon Tear', 'Extensor Tendon Tear', 'Nail Bed Injury', 'Raynaud Phenomenon', 'Arthritis', 'Ring Finger Paresthesia', 'Finger Cramping'],
    'Little Finger': ['Pain', 'Swelling', 'Numbness', 'Stiffness', 'Trigger Finger', 'Mallet Finger', 'Swan Neck Deformity', 'Boutonnière Deformity', 'Finger Fracture', 'Finger Dislocation', 'Collateral Ligament Tear', 'Flexor Tendon Tear', 'Extensor Tendon Tear', 'Nail Bed Injury', 'Raynaud Phenomenon', 'Arthritis', 'Little Finger Paresthesia', 'Finger Cramping'],
    'Knuckles': ['Swelling', 'Pain', 'Stiffness', 'Redness', 'Limited Motion', 'Osteoarthritis', 'Rheumatoid Arthritis', 'Gout Tophus', 'Psoriatic Arthritis', 'Traumatic Arthritis', 'Metacarpal Head Fracture', 'Boxer Knuckle', 'Carpometacarpal Joint Arthritis', 'Synovitis', 'Ganglion Cyst', 'Knuckle Swelling', 'Knuckle Tenderness'],
    'Back of Hand': ['Pain', 'Swelling', 'Numbness', 'Tingling', 'Extensor Tendinitis', 'Dorsal Ganglion Cyst', 'Compartment Syndrome', 'Dorsal Interosseous Atrophy', 'Radial Nerve Compression', 'Posterior Interosseous Nerve Compression', 'Hand Fracture', 'Metacarpal Fracture', 'Dorsal Hand Edema', 'Dorsal Hand Vein Prominence', 'Extensor Carpi Radialis Tear'],
    'Back of Thumb': ['Pain', 'Swelling', 'Limited Motion', 'De Quervain Tenosynovitis', 'Extensor Pollicis Longus Tear', 'Extensor Pollicis Brevis Tendinitis', 'Thumb MCP Arthritis', 'Thumb IP Arthritis', 'Thumb Dorsum Swelling', 'Thumb Extensor Compartment Syndrome'],
    'Back of Fingers': ['Pain', 'Swelling', 'Stiffness', 'Extensor Tendinitis', 'Extensor Tendon Tear', 'Mallet Finger', 'Swan Neck Deformity', 'Boutonnière Deformity', 'Dorsal Hand Compartment Syndrome', 'Finger Extensor Strain', 'Dorsal Finger Edema'],

    // THIGHS - Muscle, Nerve, Vascular Symptoms
    'Outer Thigh': ['Pain', 'Numbness', 'Tingling', 'Tenderness', 'Tightness', 'Iliotibial Band Syndrome', 'ITB Friction Syndrome', 'Lateral Femoral Cutaneous Nerve Compression', 'Meralgia Paresthetica', 'Vastus Lateralis Strain', 'Tensor Fasciae Latae Strain', 'Thigh Contusion', 'Femur Fracture', 'Femoral Stress Fracture', 'Lateral Thigh Paresthesia', 'Lateral Thigh Dysesthesia'],
    'Quadriceps (Front Thigh)': ['Pain', 'Weakness', 'Cramping', 'Swelling', 'Strain', 'Quadriceps Tendinopathy', 'Patellar Tendinopathy', 'Quadriceps Tear', 'Rectus Femoris Tear', 'Vastus Medialis Strain', 'Vastus Intermedius Strain', 'Femoral Nerve Compression', 'Sartorius Strain', 'Thigh Contusion', 'Femur Fracture', 'Quadriceps Weakness', 'Vastus Medialis Obliquus Dysfunction'],
    'Inner Thigh (Adductors)': ['Pain', 'Strain', 'Tenderness', 'Swelling', 'Weakness', 'Adductor Longus Strain', 'Adductor Brevis Strain', 'Adductor Magnus Strain', 'Gracilis Strain', 'Pectineus Strain', 'Obturator Nerve Compression', 'Adductor Muscle Tear', 'Groin Pull', 'Chronic Adductor Strain', 'Inguinal Hernia', 'Adductor Sprain', 'Inner Thigh Tenderness'],
    'Upper Hamstring': ['Pain', 'Strain', 'Tenderness', 'Weakness', 'Tightness', 'Biceps Femoris Strain', 'Semitendinosus Strain', 'Semimembranosus Strain', 'Hamstring Tendinopathy', 'High Hamstring Tear', 'Ischial Tuberosity Avulsion', 'Sciatic Nerve Compression', 'Piriformis Syndrome', 'Hamstring Tendon Avulsion', 'Proximal Hamstring Tear'],
    'Outer Hamstring': ['Pain', 'Strain', 'Tenderness', 'Tightness', 'Biceps Femoris Strain', 'Lateral Compartment Tension', 'Peroneal Nerve Compression', 'Lateral Thigh Pain', 'Hamstring Compartment Syndrome', 'Biceps Femoris Tendinopathy'],
    'Inner Hamstring': ['Pain', 'Strain', 'Tenderness', 'Weakness', 'Semitendinosus Strain', 'Semimembranosus Strain', 'Medial Compartment Tension', 'Adductor Tendon Pain', 'Inguinal Lymphadenopathy Referred Pain', 'Inner Hamstring Tendinopathy'],
    'Lower Hamstring': ['Pain', 'Strain', 'Tenderness', 'Cramping', 'Distal Hamstring Tear', 'Popliteal Fossa Pain', 'Tibial Nerve Compression', 'Baker Cyst Pressure', 'Distal Hamstring Tendinopathy', 'Popliteal Fossa Swelling'],

    // KNEES - Cartilage, Ligament, Meniscal symptoms
    'Kneecap (Patella)': ['Sharp Pain', 'Swelling', 'Instability', 'Limited Motion', 'Clicking', 'Patellofemoral Pain Syndrome', 'Chondromalacia Patellae', 'Patellar Subluxation', 'Patellar Dislocation', 'Patellar Tracking Disorder', 'Patellar Fracture', 'Bipartite Patella', 'Osteochondritis Dissecans', 'Quadriceps Tendon Tear', 'Patellar Tendon Tear', 'Patellofemoral Osteoarthritis'],
    'Outer Knee': ['Pain', 'Swelling', 'Tenderness', 'Stiffness', 'Lateral Meniscus Tear', 'Iliotibial Band Syndrome', 'Lateral Collateral Ligament Tear', 'Lateral Femoral Condyle Lesion', 'Biceps Femoris Tendinopathy', 'Posterolateral Instability', 'Anterolateral Instability', 'Fibular Collateral Ligament Sprain', 'Lateral Knee Swelling'],
    'Inner Knee': ['Pain', 'Swelling', 'Tenderness', 'Instability', 'Medial Meniscus Tear', 'Medial Collateral Ligament Tear', 'Medial Meniscal Degeneration', 'Medial Femoral Condyle Lesion', 'Pes Anserinus Bursitis', 'Pes Anserinus Tendinopathy', 'Medial Compartment Osteoarthritis', 'Medial Tibial Stress Syndrome', 'Medial Knee Swelling'],
    'Below Kneecap': ['Pain', 'Tenderness', 'Swelling', 'Stiffness', 'Patellar Tendinopathy', 'Patellar Tendinitis', 'Jumper\'s Knee', 'Patellar Ligament Tear', 'Tibial Tuberosity Apophysitis', 'Osgood-Schlatter Disease', 'Infrapatellar Bursitis', 'Fat Pad Impingement', 'Hoffa Fat Pad Syndrome', 'Infrapatellar Swelling'],
    'Outer Back Knee': ['Pain', 'Swelling', 'Tightness', 'Posterolateral Knee Pain', 'Posterolateral Instability', 'Popliteus Tendinopathy', 'Biceps Femoris Tendinopathy', 'Popliteal Artery Aneurysm', 'Nerve Compression', 'Iliotibial Band Tightness', 'Posterolateral Capsule Tightness'],
    'Popliteal Fossa (Behind Knee)': ['Pain', 'Swelling', 'Stiffness', 'Cyst', 'Baker Cyst', 'Popliteal Artery Occlusion', 'Deep Vein Thrombosis', 'Popliteal Vein Thrombosis', 'Posterior Knee Ganglion', 'Posterior Capsule Tightness', 'Hamstring Tendinopathy Referral', 'Tibial Nerve Compression'],
    'Inner Back Knee': ['Pain', 'Swelling', 'Tightness', 'Medial Hamstring Tendinopathy', 'Semimembranosus Tendinopathy', 'Medial Collateral Ligament Strain', 'Posteromedial Instability', 'Posterior Medial Corner Injury', 'Pes Anserinus Bursitis', 'Posteromedial Capsule Tightness'],

    // LOWER LEG & ANKLE
    'Outer Lower Leg': ['Shin Splints', 'Pain', 'Swelling', 'Tenderness', 'Numbness', 'Tibial Stress Syndrome', 'Medial Tibial Stress Syndrome', 'Anterior Compartment Syndrome', 'Lateral Compartment Syndrome', 'Superficial Peroneal Nerve Compression', 'Peroneal Nerve Compression', 'Tibial Fracture', 'Fibular Fracture', 'Tibial Stress Fracture', 'Anterior Leg Swelling'],
    'Shin Bone (Tibia)': ['Shin Splints', 'Pain', 'Tenderness', 'Swelling', 'Aching', 'Tibial Stress Syndrome', 'Tibial Stress Fracture', 'Tibial Fracture', 'Periostitis', 'Anterior Tibial Syndrome', 'Anterior Compartment Syndrome', 'Tibial Tunnel Syndrome', 'Anterior Tibialis Tenderness'],
    'Ankle (Front)': ['Pain', 'Swelling', 'Stiffness', 'Limited Motion', 'Instability', 'Ankle Sprain', 'Anterior Talofibular Ligament Tear', 'Ankle Fracture', 'Syndesmotic Injury', 'High Ankle Sprain', 'Anterior Ankle Impingement', 'Osteochondritis Dissecans', 'Tibiotalar Arthritis', 'Ankle Osteoarthritis', 'Anterior Interosseous Nerve Compression'],
    'Inner Ankle': ['Pain', 'Swelling', 'Tenderness', 'Instability', 'Deltoid Ligament Tear', 'Posterior Tibial Tendinopathy', 'Medial Ankle Sprain', 'Ankle Inversion Injury Medial Component', 'Medial Malleolus Fracture', 'Tibialis Posterior Tendinitis', 'Medial Ankle Arthritis'],
    'Gastrocnemius (Upper Calf)': ['Cramping', 'Pain', 'Tightness', 'Strain', 'Tenderness', 'Gastrocnemius Strain', 'Gastrocnemius Tear', 'Muscle Cramp', 'Muscle Spasm', 'Muscle Soreness', 'Medial Gastrocnemius Tear', 'Lateral Gastrocnemius Tear', 'Calf Contusion', 'Deep Vein Thrombosis', 'Compartment Syndrome', 'Tibial Nerve Compression', 'Baker Cyst Referral'],
    'Soleus (Lower Calf)': ['Cramping', 'Pain', 'Tightness', 'Tenderness', 'Weakness', 'Soleus Strain', 'Soleus Tear', 'Muscle Cramp', 'Deep Calf Pain', 'Plantaris Muscle Tear', 'Compartment Syndrome', 'Posterior Compartment Syndrome', 'Soleus Tendinopathy'],
    'Achilles Tendon': ['Pain', 'Stiffness', 'Swelling', 'Tendinitis', 'Weakness', 'Achilles Tendinopathy', 'Insertional Achillitis', 'Non-Insertional Achillitis', 'Achilles Tendon Tear', 'Partial Tear', 'Complete Tear', 'Achilles Rupture', 'Retrocalcaneal Bursitis', 'Subcutaneous Bursa Inflammation', 'Calcaneal Spurs', 'Haglund Deformity', 'Achilles Tendon Shortening'],

    // FEET
    'Ankle Joint': ['Pain', 'Swelling', 'Sprain', 'Limited Motion', 'Instability', 'Ankle Arthritis', 'Tibiotalar Arthritis', 'Syndesmotic Injury', 'Subtalar Joint Arthritis', 'Ankle Fusion', 'Post-Traumatic Arthritis', 'Ankle Osteoarthritis', 'Ankle Valgus', 'Ankle Varus'],
    'Top of Foot': ['Pain', 'Swelling', 'Tenderness', 'Numbness', 'Stress Fracture', 'Metatarsal Fracture', 'Lisfranc Injury', 'Midfoot Sprain', 'Extensor Tendinitis', 'Sinus Tarsi Syndrome', 'Tarsal Tunnel Syndrome', 'Deep Peroneal Nerve Compression', 'Dorsal Foot Edema', 'Metatarsal Stress Injury'],
    'Arch of Foot': ['Pain', 'Plantar Fasciitis', 'Flatness', 'Tenderness', 'Stiffness', 'Plantar Fascia Rupture', 'Spring Ligament Tear', 'Posterior Tibial Tendinopathy', 'Flat Foot', 'Flexible Flat Foot', 'Rigid Flat Foot', 'Adult Acquired Flat Foot', 'Arch Collapse', 'Pes Planus'],
    'Heel (Calcaneus)': ['Pain', 'Plantar Fasciitis', 'Tenderness', 'Swelling', 'Bruising', 'Heel Spur', 'Calcaneal Fracture', 'Calcaneal Stress Fracture', 'Retrocalcaneal Bursitis', 'Haglund Deformity', 'Baxter Nerve Compression', 'Fat Pad Syndrome', 'Calcaneal Apophysitis', 'Sever Disease', 'Plantar Wart', 'Heel Spur Syndrome'],
    'Plantar Fascia / Sole': ['Sharp Pain', 'Tenderness', 'Stiffness', 'Burning', 'Heel Pain', 'Plantar Fasciitis', 'Plantar Fascia Tear', 'Intrinsic Foot Muscle Strain', 'Plantar Wart', 'Corn', 'Callus', 'Metatarsalgia', 'Morton Neuroma', 'Plantar Surface Pain', 'Sole Tenderness'],
    'Big Toe': ['Pain', 'Swelling', 'Limited Motion', 'Numbness', 'Gout', 'Hallux Limitus', 'Hallux Rigidus', 'Turf Toe', 'Gout Flare', 'Great Toe Fracture', 'Hallux Valgus (Bunion)', 'Big Toe Arthritis', 'Sesamoiditis', 'Hallucal Limitus', 'Functional Hallux Limitus'],
    'Second/Third Toe': ['Pain', 'Swelling', 'Numbness', 'Tingling', 'Morton Neuroma', 'Metatarsalgia', 'Toe Fracture', 'Toe Dislocation', 'Hammer Toe', 'Claw Toe', 'Mallet Toe', 'Interdigital Neuritis', 'Toe Joint Arthritis'],
    'Fourth/Fifth Toe': ['Pain', 'Swelling', 'Numbness', 'Cramping', 'Toe Fracture', 'Toe Dislocation', 'Hammer Toe', 'Claw Toe', 'Mallet Toe', 'Tailor\'s Bunion (Bunionette)', 'Lateral Metatarsalgia', 'Interdigital Neuritis', 'Toe Joint Arthritis', 'Fifth Metatarsal Base Fracture'],
    'Back of Ankle': ['Pain', 'Swelling', 'Tenderness', 'Tightness', 'Achilles Tendinitis', 'Retrocalcaneal Bursitis', 'Calcaneal Spur', 'Haglund Deformity', 'Posterior Ankle Impingement', 'Talar Compression', 'Posterior Talofibular Ligament Tear', 'Subtalar Inversion', 'Posterior Ankle Arthritis'],

    // BACK REGIONS - Comprehensive Spinal, Muscular, Neurological symptoms
    'Occiput / Back of Head': ['Tenderness', 'Pain', 'Numbness', 'Greater Occipital Neuralgia', 'Occipital Nerve Compression', 'Suboccipital Muscle Tension', 'Cervicogenic Headache', 'Referred Neck Pain', 'Occipital Bone Tenderness'],
    'Crown of Head': ['Tenderness', 'Pain', 'Pressure', 'Tension Headache', 'Scalp Tension', 'Vertex Pain', 'Crown Tension', 'Headache with Scalp Involvement'],
    'Base of Skull': ['Tenderness', 'Pain', 'Stiffness', 'Numbness', 'Nuchal Rigidity', 'Foramen Magnum Compression', 'Arnold Chiari Malformation', 'Basilar Invagination', 'Occipital Condyle Fracture', 'Skull Base Tenderness'],
    'Behind Left Ear': ['Pain', 'Tenderness', 'Swelling', 'Mastoiditis', 'Posterior Auricular Lymph Node Swelling', 'Occipital Lymph Node Enlargement', 'Referred Ear Pain', 'Postauricular Sensitivity'],
    'Behind Right Ear': ['Pain', 'Tenderness', 'Swelling', 'Mastoiditis', 'Posterior Auricular Lymph Node Swelling', 'Occipital Lymph Node Enlargement', 'Referred Ear Pain', 'Postauricular Sensitivity'],
    'Left Cervical Muscle': ['Stiffness', 'Pain', 'Tension', 'Limited Motion', 'Muscle Strain', 'Cervical Radiculopathy', 'Nerve Root Compression', 'Cervical Spondylosis', 'Myofascial Trigger Points', 'Cervical Muscle Spasm'],
    'Upper Spine (Cervical)': ['Pain', 'Stiffness', 'Limited Motion', 'Radiating Pain', 'Cervical Radiculopathy', 'Myelopathy', 'Disc Herniation', 'Cervical Spondylosis', 'Stenosis', 'Cervical Arthritis', 'Cervical Spine Tenderness'],
    'Base of Neck': ['Stiffness', 'Tenderness', 'Pain', 'C7 Vertebra Prominence', 'Cervical Strain', 'Referred Upper Back Pain', 'Cervicothoracic Junction Pain', 'Neck-Shoulder Junction Tension'],
    'Right Cervical Muscle': ['Stiffness', 'Pain', 'Tension', 'Limited Motion', 'Muscle Strain', 'Cervical Radiculopathy', 'Nerve Root Compression', 'Cervical Spondylosis', 'Myofascial Trigger Points', 'Cervical Muscle Spasm'],
    'Left Shoulder Blade (Scapula)': ['Pain', 'Swelling', 'Tenderness', 'Limited Motion', 'Scapular Dyskinesis', 'Serratus Anterior Weakness', 'Rhomboid Strain', 'Levator Scapulae Strain', 'Scapular Winging', 'Scapular Trigger Points', 'Scapular Pain'],
    'Right Shoulder Blade (Scapula)': ['Pain', 'Swelling', 'Tenderness', 'Limited Motion', 'Scapular Dyskinesis', 'Serratus Anterior Weakness', 'Rhomboid Strain', 'Levator Scapulae Strain', 'Scapular Winging', 'Scapular Trigger Points', 'Scapular Pain'],
    'Left Shoulder Blade Area': ['Pain', 'Tenderness', 'Swelling', 'Stiffness', 'Infrascapular Muscle Tension', 'Latissimus Dorsi Strain', 'Scapular Myofascial Pain', 'Scapulocostal Syndrome', 'Subscapularis Tension'],
    'Spine (Thoracic)': ['Pain', 'Stiffness', 'Limited Motion', 'Soreness', 'Thoracic Radiculopathy', 'Thoracic Outlet Syndrome', 'Disc Herniation', 'Thoracic Spondylosis', 'Kyphosis Related Pain', 'Thoracic Spine Arthritis', 'Intercostal Neuralgia', 'Thoracic Vertebral Tenderness'],
    'Right Shoulder Blade Area': ['Pain', 'Tenderness', 'Swelling', 'Stiffness', 'Infrascapular Muscle Tension', 'Latissimus Dorsi Strain', 'Scapular Myofascial Pain', 'Scapulocostal Syndrome', 'Subscapularis Tension'],
    'Left Upper Paraspinal': ['Pain', 'Tension', 'Tenderness', 'Spasm', 'Paraspinal Muscle Strain', 'Facet Joint Arthritis', 'Ligamentum Flavum Hypertrophy', 'Zygapophyseal Joint Pain', 'Radiculopathy', 'Erector Spinae Tension'],
    'Mid-Back Spine': ['Pain', 'Stiffness', 'Soreness', 'Limited Motion', 'Thoracic Vertebral Pain', 'Disc Bulge', 'Facet Syndrome', 'Intercostal Neuralgia', 'Thoracic Strain', 'Mid-Back Tenderness', 'Thoracic Kyphosis Pain'],
    'Right Upper Paraspinal': ['Pain', 'Tension', 'Tenderness', 'Spasm', 'Paraspinal Muscle Strain', 'Facet Joint Arthritis', 'Ligamentum Flavum Hypertrophy', 'Zygapophyseal Joint Pain', 'Radiculopathy', 'Erector Spinae Tension'],
    'Left Lower Back': ['Sharp Pain', 'Stiffness', 'Limited Motion', 'Tenderness', 'Lumbar Radiculopathy', 'Lumbar Strain', 'Lumbar Disc Herniation', 'Facet Joint Syndrome', 'Sacroiliac Ligament Strain', 'Iliopsoas Tightness', 'Left Lower Back Spasm', 'Left Lumbar Tenderness'],
    'Lumbar Spine (L1-L5)': ['Sharp Pain', 'Stiffness', 'Radiating Pain', 'Limited Motion', 'Lumbar Radiculopathy', 'Cauda Equina Syndrome', 'Spinal Stenosis', 'Disc Herniation', 'Spondylolisthesis', 'Lumbar Strain', 'Lumbar Facet Arthritis', 'Central Cord Compression', 'Lumbar Vertebral Tenderness'],
    'Right Lower Back': ['Sharp Pain', 'Stiffness', 'Limited Motion', 'Tenderness', 'Lumbar Radiculopathy', 'Lumbar Strain', 'Lumbar Disc Herniation', 'Facet Joint Syndrome', 'Sacroiliac Ligament Strain', 'Iliopsoas Tightness', 'Right Lower Back Spasm', 'Right Lumbar Tenderness'],
    'Sacroiliac Joint (Left)': ['Sharp Pain', 'Stiffness', 'Instability', 'Limited Motion', 'SI Joint Dysfunction', 'SI Joint Arthritis', 'SI Joint Ligament Strain', 'Sacroiliitis', 'SI Joint Hypermobility', 'SI Joint Hypomobility', 'SI Joint Pain Pattern', 'Unilateral SI Pain'],
    'Sacrum': ['Sharp Pain', 'Tenderness', 'Stiffness', 'Sacral Fracture', 'Sacral Stress Fracture', 'Sacral Pelvic Pain', 'Sacroiliitis', 'Ankylosing Spondylitis', 'Cauda Equina Compression', 'Sacral Bone Tenderness', 'Central Sacral Pain'],
    'Sacroiliac Joint (Right)': ['Sharp Pain', 'Stiffness', 'Instability', 'Limited Motion', 'SI Joint Dysfunction', 'SI Joint Arthritis', 'SI Joint Ligament Strain', 'Sacroiliitis', 'SI Joint Hypermobility', 'SI Joint Hypomobility', 'SI Joint Pain Pattern', 'Unilateral SI Pain'],
    'Tailbone (Coccyx)': ['Sharp Pain', 'Tenderness', 'Swelling', 'Discomfort', 'Coccygodynia', 'Coccyx Fracture', 'Coccyx Trauma', 'Pilonidal Sinus', 'Pilonidal Cyst', 'Referred Pain from Coccyx', 'Coccyx Bone Tenderness', 'Sitting Pain from Coccyx'],
    'Left Gluteus Major': ['Pain', 'Tenderness', 'Weakness', 'Tightness', 'Gluteal Strain', 'Gluteal Tears', 'Gluteal Insufficiency', 'Piriformis Syndrome', 'Myofascial Trigger Points', 'Gluteal Atrophy', 'Gluteal Soreness'],
    'Gluteus Medius (Hip)': ['Pain', 'Tenderness', 'Weakness', 'Limited Motion', 'Trendelenburg Gait', 'Hip Abduction Weakness', 'Gluteal Tendinopathy', 'Glut Med Tear', 'Gluteal Bursitis', 'Superior Gluteal Nerve Compression', 'Hip Abductor Weakness'],
    'Piriformis Area': ['Sharp Pain', 'Radiating Pain', 'Tenderness', 'Tightness', 'Piriformis Syndrome', 'Sciatic Nerve Compression', 'Piriformis Spasm', 'Referred Leg Pain', 'Referred Foot Pain', 'Sciatic Nerve Irritation', 'Deep Buttock Pain'],
    'Right Gluteus Major': ['Pain', 'Tenderness', 'Weakness', 'Tightness', 'Gluteal Strain', 'Gluteal Tears', 'Gluteal Insufficiency', 'Piriformis Syndrome', 'Myofascial Trigger Points', 'Gluteal Atrophy', 'Gluteal Soreness'],

    // Back-view specific back regions
    'Left Tricep': ['Pain', 'Weakness', 'Soreness', 'Cramping', 'Triceps Tendinopathy', 'Triceps Strain', 'Triceps Tear', 'Radial Nerve Compression', 'Posterior Interosseous Nerve Compression', 'Lateral Triceps Strain', 'Tricep Tenderness'],
    'Right Tricep': ['Pain', 'Weakness', 'Soreness', 'Cramping', 'Triceps Tendinopathy', 'Triceps Strain', 'Triceps Tear', 'Radial Nerve Compression', 'Posterior Interosseous Nerve Compression', 'Lateral Triceps Strain', 'Tricep Tenderness'],
    'Left Forearm (Back)': ['Pain', 'Numbness', 'Tingling', 'Tenderness', 'Extensor Tendinitis', 'Compartment Syndrome', 'Extensor Carpi Radialis Tear', 'Posterior Interosseous Nerve Syndrome', 'Dorsal Forearm Tenderness'],
    'Right Forearm (Back)': ['Pain', 'Numbness', 'Tingling', 'Tenderness', 'Extensor Tendinitis', 'Compartment Syndrome', 'Extensor Carpi Radialis Tear', 'Posterior Interosseous Nerve Syndrome', 'Dorsal Forearm Tenderness'],
    'Left Hand (Back)': ['Pain', 'Swelling', 'Numbness', 'Tingling', 'Extensor Tendinitis', 'Ganglion Cyst', 'Dorsal Hand Edema', 'Radial Nerve Compression', 'Dorsal Hand Vein Prominence'],
    'Right Hand (Back)': ['Pain', 'Swelling', 'Numbness', 'Tingling', 'Extensor Tendinitis', 'Ganglion Cyst', 'Dorsal Hand Edema', 'Radial Nerve Compression', 'Dorsal Hand Vein Prominence'],
    'Buttocks': ['Pain', 'Tenderness', 'Weakness', 'Tightness', 'Gluteal Strain', 'Coccyx Pain', 'Piriformis Syndrome', 'Buttock Soreness', 'Sitting Discomfort', 'Buttock Swelling'],
    'Left Hamstring': ['Pain', 'Strain', 'Tenderness', 'Weakness', 'Tightness', 'Hamstring Tear', 'Ischial Tuberosity Avulsion', 'Hamstring Tendinopathy', 'Left Hamstring Soreness', 'Hamstring Spasm'],
    'Right Hamstring': ['Pain', 'Strain', 'Tenderness', 'Weakness', 'Tightness', 'Hamstring Tear', 'Ischial Tuberosity Avulsion', 'Hamstring Tendinopathy', 'Right Hamstring Soreness', 'Hamstring Spasm'],
    'Left Knee (Back)': ['Pain', 'Swelling', 'Tenderness', 'Instability', 'Posterior Knee Pain', 'Baker Cyst', 'Popliteus Tendinopathy', 'Posterior Capsule Tightness', 'Popliteal Swelling'],
    'Right Knee (Back)': ['Pain', 'Swelling', 'Tenderness', 'Instability', 'Posterior Knee Pain', 'Baker Cyst', 'Popliteus Tendinopathy', 'Posterior Capsule Tightness', 'Popliteal Swelling'],
    'Left Calf': ['Cramping', 'Pain', 'Tightness', 'Strain', 'Tenderness', 'Calf Tear', 'Deep Vein Thrombosis', 'Calf Soreness', 'Calf Swelling', 'Posterior Lower Leg Pain'],
    'Right Calf': ['Cramping', 'Pain', 'Tightness', 'Strain', 'Tenderness', 'Calf Tear', 'Deep Vein Thrombosis', 'Calf Soreness', 'Calf Swelling', 'Posterior Lower Leg Pain'],
    'Left Foot (Back)': ['Pain', 'Swelling', 'Tenderness', 'Tightness', 'Achilles Tendinitis', 'Heel Pain', 'Plantar Fasciitis', 'Posterior Ankle Pain', 'Achilles Tightness'],
    'Right Foot (Back)': ['Pain', 'Swelling', 'Tenderness', 'Tightness', 'Achilles Tendinitis', 'Heel Pain', 'Plantar Fasciitis', 'Posterior Ankle Pain', 'Achilles Tightness'],
  };

  // ── State ──────────────────────────────────────────────────────
  const state = {
    currentView: 'front',
    // key: "f-head::Forehead" or "f-head"
    selections: new Map(), // key -> { regionId, parentRegion, subRegion, side, severity, note }
    activeSelectionKey: null,
    zoomedRegionId: null,   // region id currently zoomed into (null = full body)
    zoomAnimFrame: null,    // active requestAnimationFrame id for viewBox tween
    drawerOpen: false,
    drawerContext: null,    // { regionId, parentRegionName, subRegionName, side, hotspotEl }
    selectedSymptoms: new Set(),
    drawerSeverity: null,
  };

  // ── DOM References ─────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    btnFront: $('#btn-front'),
    btnBack: $('#btn-back'),
    toggleIndicator: $('.toggle-indicator'),
    bodyFront: $('#body-front'),
    bodyBack: $('#body-back'),
    tooltip: $('#tooltip'),
    tooltipText: $('#tooltip-text'),
    zoomHeader: $('#zoom-header'),
    zoomTitle: $('#zoom-title'),
    zoomBack: $('#zoom-back'),
    zoomEntire: $('#zoom-entire'),
    selectedList: $('#selected-list'),
    selectionCount: $('#selection-count'),
    severitySection: $('#severity-section'),
    severityLabel: $('#severity-label'),
    notesSection: $('#notes-section'),
    notesInput: $('#notes-input'),
    btnSaveNote: $('#btn-save-note'),
    btnClear: $('#btn-clear'),
    btnExport: $('#btn-export'),
    exportModal: $('#export-modal'),
    exportJson: $('#export-json'),
    modalClose: $('#modal-close'),
    btnCopy: $('#btn-copy'),
    drawerOverlay: $('#drawer-overlay'),
    symptomDrawer: $('#symptom-drawer'),
    drawerClose: $('#drawer-close'),
    drawerTitle: $('#drawer-title'),
    drawerSubtitle: $('#drawer-subtitle'),
    symptomSearch: $('#symptom-search'),
    symptomsList: $('#symptoms-list'),
    drawerSeverities: $$('.drawer-severity'),
    drawerSeverityLabel: $('#drawer-severity-label'),
    drawerSave: $('#drawer-save')
  };

  // Remember each svg's full (un-zoomed) viewBox so we can animate back to it.
  const fullViewBox = {};
  [dom.bodyFront, dom.bodyBack].forEach((svg) => {
    fullViewBox[svg.id] = svg.getAttribute('viewBox').split(' ').map(Number);
  });

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    bindViewToggle();
    bindSVGRegionEvents();
    bindZoomHeader();
    bindSeverity();
    bindNotes();
    bindActions();
    bindDrawer();
  }

  // ── View Toggle ────────────────────────────────────────────────
  function bindViewToggle() {
    dom.btnFront.addEventListener('click', () => switchView('front'));
    dom.btnBack.addEventListener('click', () => switchView('back'));
  }

  function switchView(view) {
    unzoomBody();

    state.currentView = view;
    dom.btnFront.classList.toggle('active', view === 'front');
    dom.btnBack.classList.toggle('active', view === 'back');
    dom.toggleIndicator.classList.toggle('right', view === 'back');

    dom.bodyFront.classList.toggle('active', view === 'front');
    dom.bodyBack.classList.toggle('active', view === 'back');
  }

  // ── SVG Region Events ──────────────────────────────────────────
  function bindSVGRegionEvents() {
    $$('.region').forEach((regionEl) => {
      regionEl.addEventListener('mouseenter', (e) => {
        if (state.zoomedRegionId) return;
        const name = regionEl.dataset.region;
        dom.tooltipText.textContent = name + ' (Click to zoom in)';
        dom.tooltip.classList.add('visible');
        moveTooltip(e);
      });

      regionEl.addEventListener('mousemove', (e) => {
        if (state.zoomedRegionId) return;
        moveTooltip(e);
      });

      regionEl.addEventListener('mouseleave', () => {
        dom.tooltip.classList.remove('visible');
      });

      regionEl.addEventListener('click', () => {
        if (state.zoomedRegionId) return; // ignore while zoomed (region is non-interactive then)
        zoomIntoRegion(regionEl);
      });
    });
  }

  function moveTooltip(e) {
    dom.tooltip.style.left = (e.clientX + 14) + 'px';
    dom.tooltip.style.top = (e.clientY - 10) + 'px';
  }

  // ── Zoom-to-Region + On-Body Sub-region Hotspots ───────────────
  function zoomIntoRegion(regionEl) {
    const svg = regionEl.ownerSVGElement;
    const regionId = regionEl.id;
    const parentRegionName = regionEl.dataset.region;
    const side = regionEl.dataset.side;

    state.zoomedRegionId = regionId;

    // Dim every other region in this svg; highlight the target region.
    svg.querySelectorAll('.region').forEach((el) => {
      if (el === regionEl) {
        el.classList.remove('dimmed');
        el.classList.add('zoomed-active');
      } else {
        el.classList.add('dimmed');
      }
    });

    // Animate the viewBox in to a padded crop around the region.
    const bbox = regionEl.getBBox();
    const full = fullViewBox[svg.id];
    const target = paddedBBox(bbox, full, 0.45);
    animateViewBox(svg, target, 420);

    // Build clickable sub-region hotspots directly on the zoomed body part.
    buildHotspots(svg, regionEl, regionId, parentRegionName, side, bbox);

    // Header UI
    dom.zoomTitle.textContent = parentRegionName;
    dom.zoomHeader.classList.remove('hidden');
    updateEntireButtonState(regionId, parentRegionName, side);

    dom.tooltip.classList.remove('visible');
  }

  function unzoomBody() {
    if (!state.zoomedRegionId) return;
    const prevId = state.zoomedRegionId;
    state.zoomedRegionId = null;

    const regionEl = document.getElementById(prevId);
    const svg = regionEl ? regionEl.ownerSVGElement : (state.currentView === 'front' ? dom.bodyFront : dom.bodyBack);

    svg.querySelectorAll('.region').forEach((el) => {
      el.classList.remove('dimmed', 'zoomed-active');
    });

    removeHotspots(svg);
    animateViewBox(svg, fullViewBox[svg.id], 380);
    dom.zoomHeader.classList.add('hidden');
  }

  function bindZoomHeader() {
    dom.zoomBack.addEventListener('click', unzoomBody);
    dom.zoomEntire.addEventListener('click', () => {
      const regionEl = document.getElementById(state.zoomedRegionId);
      if (!regionEl) return;
      const parentRegionName = regionEl.dataset.region;
      const side = regionEl.dataset.side;
      toggleSubSelection(state.zoomedRegionId, parentRegionName, 'Entire Region', side, dom.zoomEntire);
      updateEntireButtonState(state.zoomedRegionId, parentRegionName, side);
    });
  }

  function updateEntireButtonState(regionId, parentRegionName, side) {
    const isSelected = isSelectionExists(regionId, 'Entire Region');
    dom.zoomEntire.classList.toggle('btn-accent', !isSelected);
    dom.zoomEntire.textContent = isSelected ? '✓ Entire Area Selected' : 'Select Entire Area';
  }

  // ── viewBox tween ───────────────────────────────────────────────
  function paddedBBox(bbox, full, padFactor) {
    const padX = bbox.width * padFactor;
    const padY = bbox.height * padFactor;
    let x = bbox.x - padX;
    let y = bbox.y - padY;
    let w = bbox.width + padX * 2;
    let h = bbox.height + padY * 2;

    const [fx, fy, fw, fh] = full;
    if (x < fx) { w += (x - fx); x = fx; }
    if (y < fy) { h += (y - fy); y = fy; }
    if (x + w > fx + fw) w = (fx + fw) - x;
    if (y + h > fy + fh) h = (fy + fh) - y;
    return [x, y, w, h];
  }

  function animateViewBox(svg, target, duration) {
    if (state.zoomAnimFrame) cancelAnimationFrame(state.zoomAnimFrame);
    const start = svg.getAttribute('viewBox').split(' ').map(Number);
    const t0 = performance.now();

    function step(now) {
      const t = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const cur = start.map((v, i) => v + (target[i] - v) * ease);
      svg.setAttribute('viewBox', cur.join(' '));
      if (t < 1) {
        state.zoomAnimFrame = requestAnimationFrame(step);
      } else {
        state.zoomAnimFrame = null;
      }
    }
    state.zoomAnimFrame = requestAnimationFrame(step);
  }

  // ── Sub-region hotspots ─────────────────────────────────────────
  // Hotspots are rendered as a grid over the zoomed region's bounding box,
  // but CLIPPED to the region's own silhouette path. This guarantees a
  // hotspot can never be selectable (or even visible) outside the actual
  // body-part shape in the artwork — no more oversized/leaking hit areas.
  // Sub-region names are shown via the floating cursor tooltip (same one
  // used for major regions) rather than baked-in on-body text, so hovering
  // the body is what reveals what you're about to select.
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';

  function removeHotspots(svg) {
    const layer = svg.querySelector('#hotspot-layer');
    if (layer) layer.remove();
    const clip = svg.querySelector('#hotspot-clip');
    if (clip) clip.remove();
  }

  // Clip everything in the hotspot layer to the exact silhouette of the
  // region that was clicked to zoom in (re-uses that path via <use>, so it
  // always matches the artwork pixel-for-pixel), and return the empty <g>
  // ready for hotspot rects to be appended to it. Shared by both the
  // generic grid layout and the hand digit layout below.
  function createHotspotLayer(svg, regionId) {
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }
    const clipPath = document.createElementNS(SVG_NS, 'clipPath');
    clipPath.setAttribute('id', 'hotspot-clip');
    clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
    const clipUse = document.createElementNS(SVG_NS, 'use');
    clipUse.setAttributeNS(XLINK_NS, 'xlink:href', '#' + regionId);
    clipUse.setAttribute('href', '#' + regionId);
    clipPath.appendChild(clipUse);
    defs.appendChild(clipPath);

    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('id', 'hotspot-layer');
    g.setAttribute('clip-path', 'url(#hotspot-clip)');
    return g;
  }

  // For regions where the sub-region list above was hand-ordered into a
  // deliberate Left / Middle / Right anatomical layout, pin the column
  // count so that layout actually lines up — the aspect-ratio-based
  // auto column count below is a good default elsewhere, but it doesn't
  // know about that intent and can pick a different column count.
  //
  // This also covers the "lengthwise limb" case: Upper Arm, Thigh, and
  // Knee (Back) all have 3 sub-parts that are meant to run the *entire*
  // length of the limb as parallel medial/center/lateral strips (e.g.
  // Outer Upper Arm | Bicep | Inner Upper Arm), not stack front-to-back
  // along it. The auto aspect-ratio heuristic below picks column counts
  // to roughly match the bounding box's own proportions, but a limb's
  // bounding box is tall-and-narrow along the *length* axis even though
  // the sub-regions are meant to divide the *width* axis — so left to
  // its own devices it very often collapses these to a single column
  // (top/middle/bottom bands) instead of 3 side-by-side strips. Pinning
  // cols = the sub-part count forces the width-wise split these regions
  // actually need. Left Shin needs the same fix in the other direction
  // (it was pinned to 1 column with no override before, which merged
  // Inner Ankle/Ankle (Front) into the wrong band — 2 columns matches
  // its 2-per-row layout instead).
  const GRID_COLS_OVERRIDE = {
    'Neck': 3, 'Chest': 3, 'Abdomen': 3,
    'Pelvis': 3, 'Upper Back': 3, 'Lower Back': 3,
    'Left Upper Arm': 3, 'Right Upper Arm': 3,
    'Left Thigh': 3, 'Right Thigh': 3,
    'Left Knee (Back)': 3, 'Right Knee (Back)': 3,
    'Left Shin': 2, 'Right Shin': 2
  };

  // For regions where neither a uniform column count nor the aspect-ratio
  // heuristic can express the right shape — the row-major grid fill below
  // normally uses the SAME column count for every row (except a shorter
  // last row), but some regions genuinely need a *different* item count
  // per row: e.g. the forearm has one name at the elbow end (full width),
  // two side-by-side names in the middle (inner/outer), and one name at
  // the wrist end (full width) — a 1 / 2 / 1 split, not a uniform grid.
  // Each array here is the item count for each row top-to-bottom, and must
  // sum to that region's SUB_REGIONS length. buildHotspots() reads this
  // (falling back to the uniform aspect/GRID_COLS_OVERRIDE logic when a
  // region has no entry here) and still runs every row through the same
  // real-silhouette mass-split as the uniform case, so rows/cells still
  // hug the actual artwork instead of a blind equal-size split.
  const ROW_LAYOUT_OVERRIDE = {
    'Left Forearm': [1, 2, 1], 'Right Forearm': [1, 2, 1],
    'Left Knee': [1, 2, 1], 'Right Knee': [1, 2, 1],
    'Left Hamstring': [1, 2, 1], 'Right Hamstring': [1, 2, 1],
    // Shoulder: Acromion sits alone at the very top (nearest the collarbone)
    // above the two deltoid heads, which are themselves above the deeper
    // joint/rotator-cuff landmarks — a 1 / 2 / 2 split top-to-bottom.
    'Left Shoulder': [1, 2, 2], 'Right Shoulder': [1, 2, 2],
    // Shoulder (Back): Upper Trapezius alone at the top (nearest the neck),
    // rear deltoid + shoulder blade side by side below it — a 1 / 2 split.
    'Left Shoulder (Back)': [1, 2], 'Right Shoulder (Back)': [1, 2],
    // Forearm (Back): the bbox of a diagonally-drawn limb segment ends up
    // almost square (or even wider than tall), so the aspect-ratio-based
    // column guess would put Elbow Tip and Back of Forearm side by side
    // instead of stacked — these three genuinely need one full-width band
    // each, top (elbow) to bottom (wrist), same as the front forearm does.
    'Left Forearm (Back)': [1, 1, 1], 'Right Forearm (Back)': [1, 1, 1],
    // Feet: Ankle Joint / Top of Foot / Arch of Foot each get a full-width
    // band running down the foot, then the toes fan out side-by-side in a
    // final 3-way split (medial-to-lateral ordered in SUB_REGIONS above)
    // instead of stacking as 3 more front-to-back bands.
    'Left Foot': [1, 1, 1, 3], 'Right Foot': [1, 1, 1, 3]
  };

  // ── Proportional (non-grid) layout ─────────────────────────────
  // The head is the one shape where even a silhouette-aware grid can't
  // work: it's one solid filled blob (no branching/gaps to trace like the
  // hands) but packs many small, irregularly-positioned features (eyes,
  // nose, ears, mouth) that don't tile into rows and columns at all — an
  // eye and an ear sit at the same height but are utterly different
  // widths, so any row-major grid cell boundary that lines up with one
  // misses the other. Instead these regions are laid out as fixed
  // fractional rectangles (relative to the region's own bounding box),
  // hand-placed to match the actual proportions of the artwork and
  // verified against front-m.webp / back-m.webp directly. Rects listed
  // later are drawn on top, so a small feature (e.g. Teeth / Gums) can sit
  // inside a larger one (Jaw / Chin) and still take hover/click priority.
  const PROPORTIONAL_LAYOUT = {
    'Head': [
      { name: 'Scalp', x0: 0.00, y0: 0.00, x1: 1.00, y1: 0.16 },
      { name: 'Left Temple', x0: 0.00, y0: 0.16, x1: 0.22, y1: 0.57 },
      { name: 'Forehead', x0: 0.22, y0: 0.16, x1: 0.78, y1: 0.44 },
      { name: 'Right Temple', x0: 0.78, y0: 0.16, x1: 1.00, y1: 0.57 },
      { name: 'Left Ear', x0: 0.00, y0: 0.57, x1: 0.17, y1: 0.87 },
      { name: 'Right Ear', x0: 0.83, y0: 0.57, x1: 1.00, y1: 0.87 },
      { name: 'Left Cheek', x0: 0.17, y0: 0.58, x1: 0.35, y1: 0.90 },
      { name: 'Right Cheek', x0: 0.65, y0: 0.58, x1: 0.83, y1: 0.90 },
      // Jaw drawn before Mouth/Eyes/Nose so those smaller, more specific
      // features correctly take hover/click priority in the small strip
      // where their boxes overlap it, instead of the jaw's broad band
      // silently winning that overlap.
      { name: 'Jaw / Chin', x0: 0.06, y0: 0.88, x1: 0.94, y1: 1.00 },
      { name: 'Left Eye / Eyelid', x0: 0.16, y0: 0.44, x1: 0.35, y1: 0.58 },
      { name: 'Right Eye / Eyelid', x0: 0.65, y0: 0.44, x1: 0.84, y1: 0.58 },
      { name: 'Nose / Bridge', x0: 0.35, y0: 0.42, x1: 0.65, y1: 0.77 },
      { name: 'Mouth / Lips', x0: 0.28, y0: 0.85, x1: 0.70, y1: 0.93 },
      { name: 'Teeth / Gums', x0: 0.42, y0: 0.865, x1: 0.58, y1: 0.905 }
    ],
    'Head (Back)': [
      { name: 'Crown of Head', x0: 0.00, y0: 0.00, x1: 1.00, y1: 0.15 },
      { name: 'Occiput / Back of Head', x0: 0.13, y0: 0.15, x1: 0.87, y1: 0.68 },
      { name: 'Base of Skull', x0: 0.00, y0: 0.68, x1: 1.00, y1: 1.00 },
      { name: 'Behind Left Ear', x0: 0.00, y0: 0.48, x1: 0.15, y1: 0.80 },
      { name: 'Behind Right Ear', x0: 0.85, y0: 0.48, x1: 1.00, y1: 0.80 }
    ]
  };

  // ── Hand digit layout ──────────────────────────────────────────
  // Hands are the one shape where a plain rows-then-columns grid over the
  // bounding box fundamentally cannot line up with the artwork: the palm is
  // one solid mass and five digits radiate out from it at different angles
  // and lengths, so a rectangular grid cell almost never matches a real
  // finger. Instead, for these regions we trace how the silhouette
  // physically splits apart (palm -> thumb peels off -> the remaining mass
  // splits into finger pairs -> each pair splits into two fingertips) and
  // assign names based on that real branching structure. See
  // buildHandHotspots() below.
  const HAND_LAYOUT = {
    'Left Hand': { palm: 'Palm', thumb: 'Thumb', knuckles: 'Knuckles', fingers: ['Index Finger', 'Middle Finger', 'Ring Finger', 'Little Finger'] },
    'Right Hand': { palm: 'Palm', thumb: 'Thumb', knuckles: 'Knuckles', fingers: ['Index Finger', 'Middle Finger', 'Ring Finger', 'Little Finger'] },
    'Left Hand (Back)': { palm: 'Back of Hand', thumb: 'Back of Thumb', knuckles: null, fingers: ['Back of Fingers', 'Back of Fingers', 'Back of Fingers', 'Back of Fingers'] },
    'Right Hand (Back)': { palm: 'Back of Hand', thumb: 'Back of Thumb', knuckles: null, fingers: ['Back of Fingers', 'Back of Fingers', 'Back of Fingers', 'Back of Fingers'] }
  };

  function buildHotspots(svg, regionEl, regionId, parentRegionName, side, bbox) {
    removeHotspots(svg);

    const subList = SUB_REGIONS[parentRegionName] || [parentRegionName];
    const n = subList.length;

    const g = createHotspotLayer(svg, regionId);

    // Head/Head (Back): fixed proportional zones, not a grid at all — see
    // PROPORTIONAL_LAYOUT above for why a grid fundamentally can't work here.
    if (PROPORTIONAL_LAYOUT[parentRegionName]) {
      buildProportionalHotspots(g, regionId, parentRegionName, side, bbox);
      svg.appendChild(g);
      return;
    }

    // Rasterize the region's true silhouette so hotspots can be placed by
    // actual covered area rather than raw bbox geometry. Without this, a
    // uniform grid over a tapered/curved shape (a chest, a torso) leaves
    // whole cells sitting mostly or entirely outside the silhouette —
    // clipped away and effectively dead to hover/click. Splitting rows
    // and columns so each band holds an equal share of real body-part
    // pixels keeps every cell meaningfully clickable.
    const mask = rasterizeRegionMask(regionEl, bbox);

    // Hands: try the anatomically-aware digit-tracing layout first. Falls
    // through to the generic grid below only if the artwork doesn't yield
    // a clean 5-way split (shouldn't happen with the current art, but this
    // keeps things safe if the silhouette ever changes).
    if (HAND_LAYOUT[parentRegionName] && mask && buildHandHotspots(g, regionId, parentRegionName, side, bbox, mask)) {
      svg.appendChild(g);
      return;
    }

    // Row layout: either a deliberate per-row item-count array (see
    // ROW_LAYOUT_OVERRIDE above, for regions where rows genuinely need
    // different item counts), or the uniform-columns default expressed in
    // that same shape (every row gets GRID_COLS_OVERRIDE/aspect-derived
    // `cols` items, except a shorter last row) so both cases share one
    // code path below.
    let rowLayout = ROW_LAYOUT_OVERRIDE[parentRegionName];
    if (!rowLayout) {
      const aspect = bbox.width / bbox.height || 1;
      let cols = GRID_COLS_OVERRIDE[parentRegionName] || Math.max(1, Math.round(Math.sqrt(n * aspect)));
      cols = Math.min(cols, n);
      const rows = Math.ceil(n / cols);
      rowLayout = [];
      for (let r = 0; r < rows; r++) {
        rowLayout.push(r === rows - 1 ? (n - cols * (rows - 1)) : cols);
      }
    }
    const rows = rowLayout.length;

    let idx = 0;
    if (mask) {
      const rowBoundsPx = massSplit1D(mask.rowMass, rows);
      for (let r = 0; r < rows; r++) {
        const itemsInRow = rowLayout[r];
        const yTopPx = rowBoundsPx[r];
        const yBotPx = rowBoundsPx[r + 1];
        const colMass = mask.colMassInBand(yTopPx, yBotPx);
        const colBoundsPx = massSplit1D(colMass, itemsInRow);

        for (let c = 0; c < itemsInRow; c++) {
          const subName = subList[idx++];
          const xLPx = colBoundsPx[c];
          const xRPx = colBoundsPx[c + 1];

          const x = bbox.x + xLPx / mask.scaleX;
          const y = bbox.y + yTopPx / mask.scaleY;
          const w = Math.max(1, (xRPx - xLPx) / mask.scaleX);
          const h = Math.max(1, (yBotPx - yTopPx) / mask.scaleY);

          appendHotspotRect(g, regionId, parentRegionName, subName, side, x, y, w, h);
        }
      }
    } else {
      // Fallback: plain uniform-height-row grid (only reachable if
      // rasterization isn't available in this environment) — still
      // clipped to the silhouette so nothing can ever render/click
      // outside the body part.
      const cellH = bbox.height / rows;
      for (let r = 0; r < rows; r++) {
        const itemsInRow = rowLayout[r];
        const cellW = bbox.width / itemsInRow;
        for (let c = 0; c < itemsInRow; c++) {
          const subName = subList[idx++];
          const x = bbox.x + c * cellW;
          const y = bbox.y + r * cellH;
          appendHotspotRect(g, regionId, parentRegionName, subName, side, x, y, cellW, cellH);
        }
      }
    }

    svg.appendChild(g);
  }

  // Builds fixed fractional-rectangle hotspots for regions listed in
  // PROPORTIONAL_LAYOUT (currently the head, front and back). Rects are
  // specified as fractions [0,1] of the region's own bounding box and
  // drawn in listed order, so later entries (small features like Teeth /
  // Gums) render on top of and take hover/click priority over earlier,
  // larger ones (Jaw / Chin) they sit inside of.
  function buildProportionalHotspots(g, regionId, parentRegionName, side, bbox) {
    const zones = PROPORTIONAL_LAYOUT[parentRegionName];
    zones.forEach((zone) => {
      const x = bbox.x + zone.x0 * bbox.width;
      const y = bbox.y + zone.y0 * bbox.height;
      const w = Math.max(1, (zone.x1 - zone.x0) * bbox.width);
      const h = Math.max(1, (zone.y1 - zone.y0) * bbox.height);
      appendHotspotRect(g, regionId, parentRegionName, zone.name, side, x, y, w, h);
    });
  }

  function appendHotspotRect(g, regionId, parentRegionName, subName, side, x, y, w, h) {
    const key = `${regionId}::${subName}`;
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', x.toFixed(1));
    rect.setAttribute('y', y.toFixed(1));
    rect.setAttribute('width', w.toFixed(1));
    rect.setAttribute('height', h.toFixed(1));
    rect.classList.add('hotspot');
    if (state.selections.has(key)) rect.classList.add('selected');
    rect.dataset.sub = subName;

    // Hovering reveals the zone (fill/glow) and names it via the
    // cursor-following tooltip — nothing is written on the body itself.
    rect.addEventListener('mouseenter', (e) => {
      dom.tooltipText.textContent = subName;
      dom.tooltip.classList.add('visible');
      moveTooltip(e);
    });
    rect.addEventListener('mousemove', moveTooltip);
    rect.addEventListener('mouseleave', () => dom.tooltip.classList.remove('visible'));
    rect.addEventListener('click', (e) => {
      e.stopPropagation();
      openSymptomDrawer(regionId, parentRegionName, subName, side, rect);
    });

    g.appendChild(rect);
  }

  // ── Hand digit layout ──────────────────────────────────────────
  // Traces how the silhouette's per-row cross-section splits apart from
  // top to bottom: it starts as one solid run (the palm), the thumb peels
  // off as a small side-branch, the remaining mass later forks into two
  // finger-pairs, and each pair forks again into two individual fingertips.
  // Returns the root branch of that tree, or null if the mask is unusable.
  function traceMaskBranches(mask) {
    const { cw, ch, grid } = mask;

    function rowRuns(y) {
      const runs = [];
      const rowOff = y * cw;
      let start = -1;
      for (let x = 0; x < cw; x++) {
        const covered = grid[rowOff + x];
        if (covered && start === -1) start = x;
        if (!covered && start !== -1) { runs.push([start, x - 1]); start = -1; }
      }
      if (start !== -1) runs.push([start, cw - 1]);
      return runs;
    }

    // Precompute every row's runs, then smooth out single-row rasterization
    // glitches: where two nearly-touching silhouette edges (e.g. the web
    // between two fingers) come within a sub-pixel gap of each other, that
    // one row can rasterize as briefly merged even though every row above
    // and below it is clearly split. Left alone this reads as a spurious
    // "un-split then re-split" and fabricates extra branches. Detect a row
    // whose run count dips below both neighbors and re-split it using
    // whichever neighbor is more split, clipped to the merged run.
    const allRuns = [];
    for (let y = 0; y < ch; y++) allRuns.push(rowRuns(y));
    for (let y = 1; y < ch - 1; y++) {
      const above = allRuns[y - 1], cur = allRuns[y], below = allRuns[y + 1];
      if (cur.length < above.length && cur.length < below.length) {
        const ref = above.length >= below.length ? above : below;
        const fixed = [];
        cur.forEach(([lo, hi]) => {
          const pieces = ref
            .map(([a0, a1]) => [Math.max(a0, lo), Math.min(a1, hi)])
            .filter(([a0, a1]) => a0 <= a1);
          if (pieces.length > 1) fixed.push(...pieces);
          else fixed.push([lo, hi]);
        });
        if (fixed.length > cur.length) allRuns[y] = fixed;
      }
    }

    function overlaps(a, b) { return a[0] <= b[1] && b[0] <= a[1]; }

    function newBranch(parent, birthRow) {
      return { parent, children: [], rows: [], birthRow, zone: null };
    }

    const root = newBranch(null, 0);
    let active = [{ branch: root, run: null }];

    for (let y = 0; y < ch; y++) {
      const runs = allRuns[y];
      if (runs.length === 0) continue;

      const claimed = new Array(runs.length).fill(false);
      const nextActive = [];

      active.forEach((a) => {
        const matchIdxs = [];
        runs.forEach((r, i) => {
          if (!claimed[i] && (a.run === null || overlaps(r, a.run))) matchIdxs.push(i);
        });

        if (matchIdxs.length === 0) {
          // branch ends here (nothing to do — it just stops growing)
        } else if (matchIdxs.length === 1) {
          const r = runs[matchIdxs[0]];
          claimed[matchIdxs[0]] = true;
          a.branch.rows.push({ y, x0: r[0], x1: r[1] });
          nextActive.push({ branch: a.branch, run: r });
        } else {
          // split: this branch forks into N children this row
          matchIdxs.forEach((i) => {
            const r = runs[i];
            claimed[i] = true;
            const child = newBranch(a.branch, y);
            child.rows.push({ y, x0: r[0], x1: r[1] });
            a.branch.children.push(child);
            nextActive.push({ branch: child, run: r });
          });
        }
      });

      // Any unclaimed run this row (shouldn't normally happen for a simple
      // silhouette) starts as its own fresh branch off the root.
      runs.forEach((r, i) => {
        if (!claimed[i]) {
          const child = newBranch(root, y);
          child.rows.push({ y, x0: r[0], x1: r[1] });
          root.children.push(child);
          nextActive.push({ branch: child, run: r });
        }
      });

      active = nextActive;
    }

    return root;
  }

  function collectLeaves(branch, out) {
    if (branch.children.length === 0) {
      if (branch.rows.length) out.push(branch);
    } else {
      branch.children.forEach((c) => collectLeaves(c, out));
    }
    return out;
  }

  function branchCentroidX(branch) {
    let sum = 0, count = 0;
    branch.rows.forEach((r) => { sum += (r.x0 + r.x1) / 2; count++; });
    return count ? sum / count : 0;
  }

  // Bounding rect (in raster px) of one or more branches' rows combined.
  function branchesPixelRect(branches) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    branches.forEach((b) => {
      b.rows.forEach((r) => {
        if (r.x0 < minX) minX = r.x0;
        if (r.x1 > maxX) maxX = r.x1;
        if (r.y < minY) minY = r.y;
        if (r.y > maxY) maxY = r.y;
      });
    });
    return { minX, maxX, minY, maxY };
  }

  function pixelRectToSvg(rect, bbox, mask) {
    const x = bbox.x + rect.minX / mask.scaleX;
    const y = bbox.y + rect.minY / mask.scaleY;
    const w = Math.max(1, (rect.maxX - rect.minX + 1) / mask.scaleX);
    const h = Math.max(1, (rect.maxY - rect.minY + 1) / mask.scaleY);
    return { x, y, w, h };
  }

  // Builds Palm / Thumb / [Knuckles] / Index / Middle / Ring / Little
  // hotspots (or the simpler Back-of-Hand equivalents) from the branch
  // tree instead of a blind grid. Returns true on success, false if the
  // silhouette didn't yield the expected 5-way digit split (in which case
  // buildHotspots() falls back to the generic grid).
  function buildHandHotspots(g, regionId, parentRegionName, side, bbox, mask) {
    const layout = HAND_LAYOUT[parentRegionName];
    if (!layout) return false;

    const root = traceMaskBranches(mask);
    // Drop 1-2 row noise branches (sub-pixel anti-aliasing slivers that can
    // appear for a row or two right where a real branch ends) before
    // counting leaves — they carry negligible area and would otherwise be
    // miscounted as extra digits.
    const leaves = collectLeaves(root, []).filter((l) => l.rows.length >= 4);
    if (leaves.length !== 5) return false; // not the shape we expect — bail to grid

    // The thumb is whichever leaf split off earliest (closest to the
    // wrist) — it always separates from the palm well before the other
    // four fingers fork apart from each other.
    let thumbLeaf = leaves[0];
    leaves.forEach((l) => { if (l.birthRow < thumbLeaf.birthRow) thumbLeaf = l; });
    const fingerLeaves = leaves.filter((l) => l !== thumbLeaf);
    if (fingerLeaves.length !== 4) return false;

    // Order the remaining four fingers left-to-right, then orient that
    // order (Index→Little vs Little→Index) by which side the thumb sits
    // on, so it always reads Thumb, Index, Middle, Ring, Little regardless
    // of whether this is the mirrored left or right hand.
    fingerLeaves.sort((a, b) => branchCentroidX(a) - branchCentroidX(b));
    const thumbX = branchCentroidX(thumbLeaf);
    const meanFingerX = fingerLeaves.reduce((s, l) => s + branchCentroidX(l), 0) / 4;
    const orderedFingers = thumbX <= meanFingerX ? fingerLeaves : fingerLeaves.slice().reverse();

    // Classify every non-leaf branch as either still-Palm (the trunk,
    // before/around the thumb split-off) or Knuckles (a true fork where
    // the remaining mass divides into finger-pairs, i.e. it's no longer
    // one solid mass but isn't an individual fingertip yet either).
    const palmBranches = [];
    const knuckleBranches = [];
    (function classify(branch) {
      if (branch.children.length === 0) return; // leaf, handled separately
      // This branch's own accumulated rows (up to wherever it next forks)
      // are always still "base of hand" — palm — regardless of what it
      // forks into next.
      palmBranches.push(branch);

      const hasThumbChild = branch.children.includes(thumbLeaf);
      if (hasThumbChild) {
        branch.children.forEach((c) => { if (c !== thumbLeaf) classify(c); });
        return;
      }

      const isForkIntoDigits = branch.children.length >= 2 &&
        branch.children.every((c) => c.children.length > 0 || fingerLeaves.includes(c));
      if (isForkIntoDigits) {
        // A genuine fork into multiple still-forking (or final finger)
        // branches — those children are the knuckle ridge, not the palm.
        branch.children.forEach((c) => {
          if (fingerLeaves.includes(c)) return; // final fingertip, handled elsewhere
          knuckleBranches.push(c);
          classify(c);
        });
      } else {
        branch.children.forEach(classify);
      }
    })(root);

    const palmRect = pixelRectToSvg(branchesPixelRect(palmBranches.length ? palmBranches : [root]), bbox, mask);
    appendHotspotRect(g, regionId, parentRegionName, layout.palm, side, palmRect.x, palmRect.y, palmRect.w, palmRect.h);

    if (layout.knuckles && knuckleBranches.length) {
      const kRect = pixelRectToSvg(branchesPixelRect(knuckleBranches), bbox, mask);
      appendHotspotRect(g, regionId, parentRegionName, layout.knuckles, side, kRect.x, kRect.y, kRect.w, kRect.h);
    } else if (knuckleBranches.length) {
      // No dedicated "Knuckles" name for this region (e.g. back-of-hand) —
      // fold that transitional area into the palm name instead.
      const kRect = pixelRectToSvg(branchesPixelRect(knuckleBranches), bbox, mask);
      appendHotspotRect(g, regionId, parentRegionName, layout.palm, side, kRect.x, kRect.y, kRect.w, kRect.h);
    }

    // Fingers drawn last so they take hover/click priority over the palm
    // and knuckle rects in any small overlap near their base.
    orderedFingers.forEach((leaf, i) => {
      const r = pixelRectToSvg(branchesPixelRect([leaf]), bbox, mask);
      appendHotspotRect(g, regionId, parentRegionName, layout.fingers[i], side, r.x, r.y, r.w, r.h);
    });
    const tRect = pixelRectToSvg(branchesPixelRect([thumbLeaf]), bbox, mask);
    appendHotspotRect(g, regionId, parentRegionName, layout.thumb, side, tRect.x, tRect.y, tRect.w, tRect.h);

    return true;
  }

  // ── Silhouette rasterization + equal-coverage grid splitting ──────
  function rasterizeRegionMask(regionEl, bbox) {
    let d;
    try {
      d = regionEl.getAttribute('d');
      if (!d || typeof Path2D === 'undefined') return null;

      const RES = 160; // max raster dimension — only used to *place* grid
                        // lines; the clip-path still trims to the exact
                        // vector silhouette regardless of this resolution.
      const aspect = bbox.width / bbox.height || 1;
      let cw, ch;
      if (aspect >= 1) { cw = RES; ch = Math.max(8, Math.round(RES / aspect)); }
      else { ch = RES; cw = Math.max(8, Math.round(RES * aspect)); }

      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      const scaleX = cw / bbox.width;
      const scaleY = ch / bbox.height;
      ctx.setTransform(scaleX, 0, 0, scaleY, -bbox.x * scaleX, -bbox.y * scaleY);
      const path2d = new Path2D(d);
      ctx.fillStyle = '#000';
      ctx.fill(path2d);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const data = ctx.getImageData(0, 0, cw, ch).data;
      const grid = new Uint8Array(cw * ch);
      const rowMass = new Int32Array(ch);
      let total = 0;
      for (let y = 0; y < ch; y++) {
        let rc = 0;
        const rowOff = y * cw;
        for (let x = 0; x < cw; x++) {
          const covered = data[(rowOff + x) * 4 + 3] > 128 ? 1 : 0;
          grid[rowOff + x] = covered;
          rc += covered;
        }
        rowMass[y] = rc;
        total += rc;
      }
      if (total < 8) return null; // degenerate — fall back to uniform grid

      return {
        cw, ch, scaleX, scaleY, grid, rowMass,
        colMassInBand(yTop, yBot) {
          const arr = new Array(cw).fill(0);
          for (let y = yTop; y < yBot; y++) {
            const rowOff = y * cw;
            for (let x = 0; x < cw; x++) arr[x] += grid[rowOff + x];
          }
          return arr;
        }
      };
    } catch (err) {
      return null; // any raster failure just falls back to a uniform grid
    }
  }

  // Given per-index "mass" (e.g. covered-pixel counts along one axis),
  // return k+1 monotonically increasing boundaries [0..L] such that the
  // mass between consecutive boundaries is as equal as possible. This is
  // what lets a row/column of grid cells hug the real silhouette instead
  // of a blind equal-size split.
  function massSplit1D(massArr, k) {
    const L = massArr.length;
    if (k <= 1) return [0, L];
    const total = massArr.reduce((a, b) => a + b, 0);
    const boundaries = [0];
    if (total <= 0) {
      for (let i = 1; i < k; i++) boundaries.push(Math.round((L * i) / k));
      boundaries.push(L);
      return boundaries;
    }
    const cum = new Array(L);
    let acc = 0;
    for (let i = 0; i < L; i++) { acc += massArr[i]; cum[i] = acc; }
    for (let i = 1; i < k; i++) {
      const target = (total * i) / k;
      let lo = 0, hi = L - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < target) lo = mid + 1; else hi = mid;
      }
      const prev = boundaries[boundaries.length - 1];
      boundaries.push(Math.min(L, Math.max(prev + 1, lo)));
    }
    boundaries.push(L);
    return boundaries;
  }

  function toggleSubSelection(regionId, parentRegionName, subName, side, el) {
    const key = `${regionId}::${subName}`;

    if (state.selections.has(key)) {
      state.selections.delete(key);
      if (el) el.classList.remove('selected');
      if (state.activeSelectionKey === key) {
        state.activeSelectionKey = null;
        hidePanelSections();
      }
    } else {
      state.selections.set(key, {
        regionId,
        parentRegion: parentRegionName,
        subRegion: subName,
        side,
        severity: null,
        note: ''
      });
      if (el) el.classList.add('selected');
      state.activeSelectionKey = key;
      setActiveSelection(key);
    }

    updateSVGRegionState(regionId);
    renderSelectedList();
  }

  function isSelectionExists(regionId, subName) {
    const key = `${regionId}::${subName}`;
    return state.selections.has(key);
  }

  function updateSVGRegionState(regionId) {
    const regionEl = document.getElementById(regionId);
    if (!regionEl) return;

    // Check if any selection belongs to this regionId
    let count = 0;
    let maxSeverity = 0;

    state.selections.forEach((sel) => {
      if (sel.regionId === regionId) {
        count++;
        if (sel.severity && sel.severity > maxSeverity) {
          maxSeverity = sel.severity;
        }
      }
    });

    // Reset classes
    regionEl.classList.remove('selected', 'has-sub-selections');
    for (let i = 1; i <= 5; i++) regionEl.classList.remove('severity-' + i);

    if (count > 0) {
      regionEl.classList.add('selected');
      if (maxSeverity > 0) {
        regionEl.classList.add('severity-' + maxSeverity);
      }
    }
  }

  // ── Active Selection & Detail Panel ────────────────────────────
  function setActiveSelection(key) {
    state.activeSelectionKey = key;
    const data = state.selections.get(key);
    if (!data) return;

    dom.severitySection.classList.remove('hidden');
    dom.notesSection.classList.remove('hidden');

    $$('.severity-dot').forEach((dot) => {
      dot.classList.toggle('active', Number(dot.dataset.level) === data.severity);
    });
    dom.severityLabel.textContent = data.severity ? SEVERITY_LABELS[data.severity] : 'Select severity';
    dom.notesInput.value = data.note || '';

    $$('.selection-card').forEach((card) => {
      card.classList.toggle('active-card', card.dataset.key === key);
    });
  }

  function hidePanelSections() {
    dom.severitySection.classList.add('hidden');
    dom.notesSection.classList.add('hidden');
  }

  // ── Severity Selector ──────────────────────────────────────────
  function bindSeverity() {
    $$('.severity-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        if (!state.activeSelectionKey) return;
        const level = Number(dot.dataset.level);
        const data = state.selections.get(state.activeSelectionKey);
        if (!data) return;

        data.severity = data.severity === level ? null : level;
        state.selections.set(state.activeSelectionKey, data);

        $$('.severity-dot').forEach((d) => {
          d.classList.toggle('active', Number(d.dataset.level) === data.severity);
        });
        dom.severityLabel.textContent = data.severity ? SEVERITY_LABELS[data.severity] : 'Select severity';

        updateSVGRegionState(data.regionId);
        renderSelectedList();
      });
    });
  }

  // ── Notes Section ──────────────────────────────────────────────
  function bindNotes() {
    dom.btnSaveNote.addEventListener('click', () => {
      if (!state.activeSelectionKey) return;
      const data = state.selections.get(state.activeSelectionKey);
      if (!data) return;

      data.note = dom.notesInput.value.trim();
      state.selections.set(state.activeSelectionKey, data);
      showToast('Note saved');
      renderSelectedList();
    });
  }

  // ── Render Selected List ───────────────────────────────────────
  function renderSelectedList() {
    const count = state.selections.size;
    dom.selectionCount.textContent = count;

    if (count === 0) {
      dom.selectedList.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
          <p>Click on any body region</p>
          <span>Select a region to see minor sub-regions</span>
        </div>`;
      hidePanelSections();
      return;
    }

    let html = '';
    state.selections.forEach((data, key) => {
      const isActive = key === state.activeSelectionKey;
      const sevBadge = data.severity
        ? `<span class="card-severity-tag" style="background:${SEVERITY_COLORS[data.severity]}22; color:${SEVERITY_COLORS[data.severity]}">Lv ${data.severity}</span>`
        : '';
      const noteBadge = data.note ? `<span style="color:var(--accent)">📝</span>` : '';

      html += `
        <div class="selection-card ${isActive ? 'active-card' : ''}" data-key="${key}">
          <div class="card-indicator" style="${data.severity ? 'background:' + SEVERITY_COLORS[data.severity] + '; box-shadow:0 0 6px ' + SEVERITY_COLORS[data.severity] + '44' : ''}"></div>
          <div class="card-info">
            <div class="card-region-name">${data.parentRegion} → ${data.subRegion}</div>
            <div class="card-meta">
              <span class="card-side-tag">${data.side}</span>
              ${sevBadge}
              ${noteBadge}
            </div>
          </div>
          <button class="card-remove" data-remove-key="${key}" title="Remove">&times;</button>
        </div>`;
    });

    dom.selectedList.innerHTML = html;

    $$('.selection-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-remove')) return;
        setActiveSelection(card.dataset.key);
        renderSelectedList();
      });
    });

    $$('.card-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const removeKey = btn.dataset.removeKey;
        const data = state.selections.get(removeKey);
        state.selections.delete(removeKey);

        if (data) {
          updateSVGRegionState(data.regionId);
        }

        if (state.activeSelectionKey === removeKey) {
          state.activeSelectionKey = null;
          hidePanelSections();
        }

        renderSelectedList();
      });
    });
  }

  // ── Actions: Clear & Export ─────────────────────────────────────
  function bindActions() {
    dom.btnClear.addEventListener('click', () => {
      state.selections.forEach((data) => {
        const regionEl = document.getElementById(data.regionId);
        if (regionEl) {
          regionEl.classList.remove('selected', 'has-sub-selections');
          for (let i = 1; i <= 5; i++) regionEl.classList.remove('severity-' + i);
        }
      });
      state.selections.clear();
      state.activeSelectionKey = null;
      unzoomBody();
      renderSelectedList();
      localStorage.removeItem('nirmya_selected_symptoms');
      showToast('All selections cleared');
    });

    dom.btnExport.addEventListener('click', () => {
      const exportData = {
        timestamp: new Date().toISOString(),
        totalSelections: state.selections.size,
        selections: []
      };

      state.selections.forEach((data) => {
        exportData.selections.push({
          parentRegion: data.parentRegion,
          subRegion: data.subRegion,
          view: data.side,
          severity: data.severity,
          severityLabel: data.severity ? SEVERITY_LABELS[data.severity].split(' — ')[0] : null,
          note: data.note || null
        });
      });

      const payload = {
        selectedRegions: exportData.selections,
        symptoms: exportData.selections,
        freeText: '',
        age: '',
        totalSelections: exportData.totalSelections,
        timestamp: exportData.timestamp
      };

      localStorage.setItem('nirmya_selected_symptoms', JSON.stringify(payload));
      dom.exportJson.textContent = JSON.stringify(payload, null, 2);
      dom.exportModal.classList.remove('hidden');
    });

    dom.modalClose.addEventListener('click', () => dom.exportModal.classList.add('hidden'));
    dom.exportModal.addEventListener('click', (e) => {
      if (e.target === dom.exportModal) dom.exportModal.classList.add('hidden');
    });

    dom.btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(dom.exportJson.textContent).then(() => {
        showToast('Copied to clipboard');
      });
    });

    const continueToApp = () => {
      const payload = {
        selectedRegions: Array.from(state.selections.values()).map((data) => ({
          parentRegion: data.parentRegion,
          subRegion: data.subRegion,
          side: data.side,
          severity: data.severity,
          note: data.note || ''
        })),
        freeText: '',
        age: '',
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('nirmya_selected_symptoms', JSON.stringify(payload));
      window.location.href = '/patient/symptom-checker';
    };

    const continueButton = document.createElement('button');
    continueButton.type = 'button';
    continueButton.textContent = 'Continue to symptom review';
    continueButton.className = 'btn btn-primary';
    continueButton.style.marginTop = '12px';
    continueButton.addEventListener('click', continueToApp);

    const target = document.querySelector('.modal-actions');
    if (target && !target.querySelector('[data-nirmya-continue]')) {
      continueButton.setAttribute('data-nirmya-continue', 'true');
      target.appendChild(continueButton);
    }
  }

  // ── Toast ──────────────────────────────────────────────────────
  function showToast(msg) {
    const existing = $('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  // ── Symptom Drawer Functionality ──────────────────────────────
  function bindDrawer() {
    dom.drawerClose.addEventListener('click', closeSymptomDrawer);
    dom.drawerOverlay.addEventListener('click', closeSymptomDrawer);
    dom.symptomSearch.addEventListener('input', renderSymptomsList);
    dom.drawerSeverities.forEach((dot) => {
      dot.addEventListener('click', () => {
        const level = Number(dot.dataset.level);
        state.drawerSeverity = state.drawerSeverity === level ? null : level;
        dom.drawerSeverities.forEach((d) => {
          d.classList.toggle('active', Number(d.dataset.level) === state.drawerSeverity);
        });
        updateDrawerSeverityLabel();
      });
    });
    dom.drawerSave.addEventListener('click', saveDrawerSelection);
  }

  function openSymptomDrawer(regionId, parentRegionName, subRegionName, side, hotspotEl) {
    state.drawerContext = { regionId, parentRegionName, subRegionName, side, hotspotEl };
    state.selectedSymptoms.clear();
    state.drawerSeverity = null;

    dom.drawerTitle.textContent = `Symptoms for: ${subRegionName}`;
    dom.drawerSubtitle.textContent = parentRegionName;
    dom.symptomSearch.value = '';
    dom.drawerSeverities.forEach((d) => d.classList.remove('active'));
    updateDrawerSeverityLabel();

    renderSymptomsList();

    dom.drawerOverlay.classList.remove('hidden');
    dom.symptomDrawer.classList.remove('hidden');
    dom.symptomSearch.focus();
  }

  function closeSymptomDrawer() {
    state.selectedSymptoms.clear();
    state.drawerSeverity = null;
    state.drawerContext = null;
    dom.drawerOverlay.classList.add('hidden');
    dom.symptomDrawer.classList.add('hidden');
  }

  function renderSymptomsList() {
    const { subRegionName } = state.drawerContext || {};
    if (!subRegionName) return;

    const allSymptoms = REGION_SYMPTOMS[subRegionName] || [];
    const searchQuery = dom.symptomSearch.value.toLowerCase().trim();
    const filtered = allSymptoms.filter((s) => s.toLowerCase().includes(searchQuery));

    let html = '';
    filtered.forEach((symptom) => {
      const isChecked = state.selectedSymptoms.has(symptom);
      html += `
        <label class="symptom-item ${isChecked ? 'checked' : ''}">
          <input type="checkbox" value="${symptom}" ${isChecked ? 'checked' : ''} />
          <label>${symptom}</label>
        </label>`;
    });

    dom.symptomsList.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:20px">No symptoms match</p>';

    dom.symptomsList.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        const symptom = e.target.value;
        if (e.target.checked) {
          state.selectedSymptoms.add(symptom);
        } else {
          state.selectedSymptoms.delete(symptom);
        }
        renderSymptomsList();
      });
    });
  }

  function updateDrawerSeverityLabel() {
    if (state.drawerSeverity) {
      dom.drawerSeverityLabel.textContent = SEVERITY_LABELS[state.drawerSeverity];
    } else {
      dom.drawerSeverityLabel.textContent = 'Select severity level';
    }
  }

  function saveDrawerSelection() {
    const { regionId, parentRegionName, subRegionName, side, hotspotEl } = state.drawerContext || {};
    if (!regionId) return;

    const key = `${regionId}::${subRegionName}`;

    // Store symptoms and severity in the selection
    const symptoms = Array.from(state.selectedSymptoms);
    state.selections.set(key, {
      regionId,
      parentRegion: parentRegionName,
      subRegion: subRegionName,
      side,
      severity: state.drawerSeverity || null,
      note: symptoms.join(', '),
      symptoms
    });

    if (hotspotEl) hotspotEl.classList.add('selected');
    updateSVGRegionState(regionId);
    renderSelectedList();
    closeSymptomDrawer();
    showToast(`✓ Symptoms added for ${subRegionName}`);
  }

  document.addEventListener('DOMContentLoaded', init);
})();

