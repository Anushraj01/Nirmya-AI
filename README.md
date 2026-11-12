File Structure
Nirmya AI/
├── client/                         # React + Vite frontend
│   ├── public/
│   │   ├── app.js
│   │   ├── app (2).js
│   │   ├── index.html
│   │   ├── findex.html
│   │   ├── style.css
│   │   ├── fstyle.css
│   │   └── bodymap/
│   │       ├── app.js
│   │       ├── index.html
│   │       └── style.css
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── BodyMapScreen.tsx
│   │   │   ├── InteractiveBodyMap.tsx
│   │   │   ├── MedicalHistoryForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RecommendationScreen.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── utils/
│   │   │   └── bodyMapStorage.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── SymptomChat.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── eslint.config.js
│
├── server/                         # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── auth.test.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── medicalHistoryAccess.ts
│   │   │   └── upload.ts
│   │   ├── models/
│   │   │   ├── Appointment.ts
│   │   │   ├── Doctor.ts
│   │   │   ├── MedicalHistory.ts
│   │   │   ├── Payment.ts
│   │   │   ├── Review.ts
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   ├── ai.ts
│   │   │   ├── auth.ts
│   │   │   ├── care.ts
│   │   │   ├── patient.ts
│   │   │   ├── payment.ts
│   │   │   ├── payment.test.ts
│   │   │   └── symptomChat.routes.ts
│   │   ├── services/
│   │   │   ├── symptomSuggestionGroq.ts
│   │   │   ├── symptomSuggestionStub.ts
│   │   │   ├── symptomTriage.ts
│   │   │   ├── symptomTriage.test.ts
│   │   │   ├── triage.ts
│   │   │   └── triage.test.ts
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── symptomChat.controller.ts
│   │   └── symptomChat.controller.test.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── Nirmya_AI_Design_Doc.docx
│   ├── Nirmya_AI_PRD.docx
│   └── Nirmya_AI_Tech_Stack.docx
│
├── scripts/
│   └── create_pitch_deck.cjs
│
├── CLAUDE.md
├── package.json
├── package-lock.json
├── .gitignore
└── Nirmya_AI_Ideathon_Pitch.pptx
