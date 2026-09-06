export type Language = 'hi' | 'en'

export interface TranslationDictionary {
  // Brand & Common
  appName: string
  tagline: string
  continueBtn: string
  backBtn: string
  freeServiceNotice: string
  loading: string
  demoMode: string
  onlineStatus: string
  call104Title: string
  call104Subtitle: string
  
  // Language Select Screen
  welcomeTitle: string
  welcomeSubtitle: string
  chooseLanguage: string
  selectLangDesc: string
  listenOptions: string
  listenOptionsDesc: string
  langConfirmedAudio: string
  
  // Home Screen
  patientGreeting: string
  location: string
  abhaLabel: string
  talkHeroTitle: string
  talkHeroSubtitle: string
  talkHeroButton: string
  chatHeroTitle: string
  chatHeroSubtitle: string
  chatHeroButton: string
  voiceBadge: string
  chatWithAssistant: string
  suggestionsTitle: string
  suggestAppointment: string
  suggestCheckAppointment: string
  suggestWhereToken: string
  suggestTalkAssistant: string
  listenScreenText: string
  
  // Voice Consultation Screen
  voiceCallHeader: string
  listeningPrompt: string
  processingSpeech: string
  speakingPrompt: string
  speakNow: string
  aiGreetingVoice: string
  aiGreetingVoiceSub: string
  muteMic: string
  unmuteMic: string
  speakerOn: string
  speakerOff: string
  repeatVoice: string
  endCall: string
  patientSpoke: string
  aiReplied: string
  
  // Chat Screen
  chatHeader: string
  chatSubtitle: string
  chatInitMessage: string
  chatPlaceholder: string
  chatListeningPlaceholder: string
  voiceCallSwitch: string
  recordedSymptoms: string
  bookAppointmentFromChat: string
  chatServerError: string
  
  // Symptom Confirmation Screen
  confirmTitle: string
  confirmSubtitle: string
  listenSummary: string
  verifiedSymptoms: string
  primaryDepartment: string
  urgencyLevel: string
  patientDetailsTitle: string
  confirmAndBookBtn: string
  editSymptomsBtn: string
  
  // Appointment Confirmed Screen
  appointmentSuccessTitle: string
  appointmentSuccessSubtitle: string
  appointmentWarmEndMessage: string
  tokenNumberLabel: string
  facilityLabel: string
  doctorLabel: string
  dateTimeLabel: string
  estimatedWaitLabel: string
  appointmentIdLabel: string
  instructionsTitle: string
  instruction1: string
  instruction2: string
  instruction3: string
  listenTokenAudio: string
  viewAppointmentsBtn: string
  backToHomeBtn: string
  
  // Appointments List Screen
  appointmentsHeader: string
  activeQueueBadge: string
  pastAppointments: string
  noAppointments: string
  queuePosition: string
  waitingSince: string
  statusWaiting: string
  statusConfirmed: string
  statusInConsultation: string
  statusDone: string
  statusCancelled: string
  tokenHeaderLabel: string
  dateHeaderLabel: string
  timeHeaderLabel: string
  facilityHeaderLabel: string
  doctorHeaderLabel: string
  currentStatusLabel: string
  
  // Medicines Screen
  medicinesHeader: string
  noMedicinesYet: string
  prescribedBy: string
  prescribedOn: string
  dosageLabel: string
  frequencyLabel: string
  durationLabel: string
  instructionsLabel: string
  listenMedicinesAudio: string
  readAllMedicines: string
  dosageMorning: string
  dosageAfternoon: string
  dosageNight: string
  
  // Notifications Screen
  notificationsHeader: string
  recentActivity: string
  markAllRead: string
  noNotifications: string
  medicationReminderTitle: string
  takeMedicineBtn: string
  takenStatus: string
  
  // Bottom Navigation
  navHome: string
  navAppointments: string
  navMedicines: string
  navNotifications: string
}

export const translations: Record<Language, TranslationDictionary> = {
  hi: {
    // Brand & Common
    appName: 'स्वास्थय-क्यू',
    tagline: 'आवाज़ से ग्रामीण स्वास्थ्य सेवा',
    continueBtn: 'आगे बढ़ें',
    backBtn: 'वापस जाएं',
    freeServiceNotice: 'निःशुल्क सरकारी स्वास्थ्य कतार व टोकन सेवा।',
    loading: 'लोड हो रहा है...',
    demoMode: 'डेमो मोड',
    onlineStatus: 'ऑनलाइन • स्वास्थ्य सहायक',
    call104Title: '104 हेल्पलाइन',
    call104Subtitle: '24x7 आपातकालीन सहायता',

    // Language Select Screen
    welcomeTitle: 'स्वास्थय-क्यू में आपका स्वागत है',
    welcomeSubtitle: 'आवाज़ और भाषा से आसान स्वास्थ्य सेवा',
    chooseLanguage: 'अपनी भाषा चुनें',
    selectLangDesc: 'कृपया अपनी पसंदीदा भाषा का चयन करें',
    listenOptions: 'बोलकर सुनें',
    listenOptionsDesc: 'स्क्रीन पर लिखे विकल्पों को आवाज़ में सुनें',
    langConfirmedAudio: 'हिन्दी भाषा चुनी गई। होम स्क्रीन पर जा रहे हैं...',

    // Home Screen
    patientGreeting: 'नमस्ते, सुनीता देवी',
    location: 'प्राथमिक स्वास्थ्य केंद्र (PHC North)',
    abhaLabel: 'आभा: 94-8231-5612',
    talkHeroTitle: 'स्वास्थय-क्यू से बात करें',
    talkHeroSubtitle: 'माइक दबाएं और बोलकर परेशानी बताएं',
    talkHeroButton: 'बात करें',
    chatHeroTitle: 'स्वास्थय-क्यू से चैट करें',
    chatHeroSubtitle: 'मैसेज लिखकर या बोलकर सहायता पाएं',
    chatHeroButton: 'चैट करें',
    voiceBadge: 'आवाज़ से स्वास्थ्य सहायता • लिखना जरूरी नहीं',
    chatWithAssistant: 'चैट सहायक',
    suggestionsTitle: 'त्वरित विकल्प',
    suggestAppointment: 'मुझे अपॉइंटमेंट चाहिए',
    suggestCheckAppointment: 'मेरा अपॉइंटमेंट देखें',
    suggestWhereToken: 'मेरा टोकन कहाँ है?',
    suggestTalkAssistant: 'स्वास्थ्य सहायक से बात करें',
    listenScreenText: 'स्क्रीन का विवरण सुनें',

    // Voice Consultation Screen
    voiceCallHeader: 'वॉइस परामर्श',
    listeningPrompt: 'हम सुन रहे हैं... कृपया बोलें...',
    processingSpeech: 'आपकी बात समझी जा रही है...',
    speakingPrompt: 'स्वास्थय-क्यू बोल रहा है...',
    speakNow: 'बोलने के लिए माइक दबाएं',
    aiGreetingVoice: 'नमस्ते! मैं स्वास्थय-क्यू का स्वास्थ्य सहायक हूँ। आपको क्या परेशानी हो रही है? कृपया खुलकर बताएं।',
    aiGreetingVoiceSub: 'स्वास्थय-क्यू सहायक आपकी बात सुन रहा है',
    muteMic: 'माइक बंद',
    unmuteMic: 'माइक चालू',
    speakerOn: 'आवाज़ चालू',
    speakerOff: 'आवाज़ बंद',
    repeatVoice: 'दोबारा सुनें',
    endCall: 'बातचीत समाप्त करें',
    patientSpoke: 'आपकी आवाज़',
    aiReplied: 'सहायक का उत्तर',

    // Chat Screen
    chatHeader: 'स्वास्थय-क्यू चैट',
    chatSubtitle: 'ऑनलाइन क्लिनिकल सहायक',
    chatInitMessage: 'नमस्ते! मैं स्वास्थय-क्यू का स्वास्थ्य सहायक हूँ। आपको क्या समस्या या लक्षण महसूस हो रहे हैं? आप लिखकर या माइक दबाकर बता सकते हैं।',
    chatPlaceholder: 'संदेश लिखें या माइक दबाएं...',
    chatListeningPlaceholder: 'सुन रहे हैं... बोलिए...',
    voiceCallSwitch: 'वॉइस मोड',
    recordedSymptoms: 'दर्ज लक्षण',
    bookAppointmentFromChat: 'अपॉइंटमेंट बुक करें',
    chatServerError: 'सर्वर से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।',

    // Symptom Confirmation Screen
    confirmTitle: 'लक्षणों की पुष्टि',
    confirmSubtitle: 'कृपया डॉक्टर परामर्श से पहले अपने विवरण की जांच करें',
    listenSummary: 'विवरण सुनें',
    verifiedSymptoms: 'पहचाने गए लक्षण',
    primaryDepartment: 'संबंधित विभाग',
    urgencyLevel: 'प्राथमिकता स्तर',
    patientDetailsTitle: 'मरीज का विवरण',
    confirmAndBookBtn: 'पुष्टि करें और टोकन प्राप्त करें',
    editSymptomsBtn: 'लक्षण बदलें / दोबारा बोलें',

    // Appointment Confirmed Screen
    appointmentSuccessTitle: 'आपका अपॉइंटमेंट हो गया है',
    appointmentSuccessSubtitle: 'टोकन नंबर सफलतापूर्वक जारी कर दिया गया है।',
    appointmentWarmEndMessage: 'आपका अपॉइंटमेंट हो गया है। धन्यवाद। समय पर स्वास्थ्य केंद्र पहुँचें।',
    tokenNumberLabel: 'टोकन नंबर',
    facilityLabel: 'स्वास्थ्य केंद्र',
    doctorLabel: 'डॉक्टर',
    dateTimeLabel: 'दिनांक व समय',
    estimatedWaitLabel: 'अनुमानित प्रतीक्षा',
    appointmentIdLabel: 'अपॉइंटमेंट आईडी',
    instructionsTitle: 'जरूरी निर्देश',
    instruction1: 'कृपया समय पर स्वास्थ्य केंद्र के कमरा नंबर 3 में उपस्थित रहें।',
    instruction2: 'टोकन नंबर स्क्रीन पर आने पर डॉक्टर के पास जाएं।',
    instruction3: 'अपनी पुरानी पर्ची व आधार कार्ड साथ लाएं।',
    listenTokenAudio: 'टोकन जानकारी सुनें',
    viewAppointmentsBtn: 'अपॉइंटमेंट देखें',
    backToHomeBtn: 'होम पर जाएं',

    // Appointments List Screen
    appointmentsHeader: 'मेरे अपॉइंटमेंट व टोकन',
    activeQueueBadge: 'सक्रिय कतार',
    pastAppointments: 'पुराने अपॉइंटमेंट',
    noAppointments: 'कोई सक्रिय अपॉइंटमेंट नहीं मिला।',
    queuePosition: 'कतार में स्थान',
    waitingSince: 'दर्ज समय',
    statusWaiting: 'प्रतीक्षारत (Waiting)',
    statusConfirmed: 'कन्फर्म (Confirmed)',
    statusInConsultation: 'परामर्श जारी (In Consultation)',
    statusDone: 'पूर्ण (Completed)',
    statusCancelled: 'रद्द (Cancelled)',
    tokenHeaderLabel: 'टोकन',
    dateHeaderLabel: 'तारीख',
    timeHeaderLabel: 'समय',
    facilityHeaderLabel: 'केंद्र',
    doctorHeaderLabel: 'डॉक्टर',
    currentStatusLabel: 'स्थिति',

    // Medicines Screen
    medicinesHeader: 'मेरी दवाइयां',
    noMedicinesYet: 'No medicines prescribed yet.',
    prescribedBy: 'डॉक्टर द्वारा लिखी गई',
    prescribedOn: 'तारीख',
    dosageLabel: 'खुराक (Dosage)',
    frequencyLabel: 'कितनी बार (Frequency)',
    durationLabel: 'अवधि (Duration)',
    instructionsLabel: 'निर्देश (Instructions)',
    listenMedicinesAudio: 'दवाइयों की जानकारी सुनें',
    readAllMedicines: 'सभी दवाइयों को बोलकर सुनें',
    dosageMorning: 'सुबह',
    dosageAfternoon: 'दोपहर',
    dosageNight: 'रात',

    // Notifications Screen
    notificationsHeader: 'सूचनाएं व अलर्ट',
    recentActivity: 'स्वास्थ्य केंद्र से सूचनाएं',
    markAllRead: 'सभी पढ़ें',
    noNotifications: 'कोई नई सूचना नहीं है।',
    medicationReminderTitle: 'दवा लेने का समय',
    takeMedicineBtn: 'दवा ले ली',
    takenStatus: 'ले ली गई',

    // Bottom Navigation
    navHome: 'होम',
    navAppointments: 'अपॉइंटमेंट',
    navMedicines: 'दवाइयां',
    navNotifications: 'सूचनाएं',
  },

  en: {
    // Brand & Common
    appName: 'SwasthyaQ',
    tagline: 'Rural Healthcare by Voice',
    continueBtn: 'Continue',
    backBtn: 'Go Back',
    freeServiceNotice: 'Free public health queue & token service. No fees required.',
    loading: 'Loading...',
    demoMode: 'Demo Mode',
    onlineStatus: 'Online • Health Assistant',
    call104Title: '104 Helpline',
    call104Subtitle: '24x7 Emergency Health Support',

    // Language Select Screen
    welcomeTitle: 'Welcome to SwasthyaQ',
    welcomeSubtitle: 'Simple healthcare by voice and local language',
    chooseLanguage: 'Choose your language',
    selectLangDesc: 'Please select your preferred language to proceed',
    listenOptions: 'Listen to options',
    listenOptionsDesc: 'Tap to hear the screen instructions spoken aloud',
    langConfirmedAudio: 'English language selected. Going to home screen...',

    // Home Screen
    patientGreeting: 'Hello, Sunita Devi',
    location: 'Primary Health Centre (PHC North)',
    abhaLabel: 'ABHA: 94-8231-5612',
    talkHeroTitle: 'Talk to SwasthyaQ',
    talkHeroSubtitle: 'Press mic and speak your health concern',
    talkHeroButton: 'Talk',
    chatHeroTitle: 'Chat with SwasthyaQ',
    chatHeroSubtitle: 'Type or speak messages to get assistance',
    chatHeroButton: 'Chat',
    voiceBadge: 'Voice Assisted • No typing required',
    chatWithAssistant: 'Chat Assistant',
    suggestionsTitle: 'Quick Suggestions',
    suggestAppointment: 'I want an appointment',
    suggestCheckAppointment: 'Check my appointment',
    suggestWhereToken: 'Where is my token?',
    suggestTalkAssistant: 'Talk to a healthcare assistant',
    listenScreenText: 'Listen to screen details',

    // Voice Consultation Screen
    voiceCallHeader: 'Voice Consultation',
    listeningPrompt: 'Listening... Please describe your symptoms...',
    processingSpeech: 'Understanding your health concerns...',
    speakingPrompt: 'SwasthyaQ is speaking...',
    speakNow: 'Tap microphone to speak',
    aiGreetingVoice: 'Hello! I am your SwasthyaQ Health Assistant. What symptoms or health concerns are you experiencing today?',
    aiGreetingVoiceSub: 'SwasthyaQ assistant is listening to you',
    muteMic: 'Mute',
    unmuteMic: 'Unmute',
    speakerOn: 'Speaker On',
    speakerOff: 'Speaker Off',
    repeatVoice: 'Repeat',
    endCall: 'End Conversation',
    patientSpoke: 'Your Message',
    aiReplied: 'AI Response',

    // Chat Screen
    chatHeader: 'SwasthyaQ Chat',
    chatSubtitle: 'Online Clinical AI',
    chatInitMessage: 'Hello! I am your SwasthyaQ Health Assistant. What symptoms are you experiencing? You can type or tap the microphone to speak.',
    chatPlaceholder: 'Type message or tap mic to speak...',
    chatListeningPlaceholder: 'Listening... please speak...',
    voiceCallSwitch: 'Voice Mode',
    recordedSymptoms: 'Recorded Symptoms',
    bookAppointmentFromChat: 'Book Appointment',
    chatServerError: 'Could not connect to the server. Please try again.',

    // Symptom Confirmation Screen
    confirmTitle: 'Confirm Symptoms',
    confirmSubtitle: 'Please review your details before scheduling your visit',
    listenSummary: 'Listen to Summary',
    verifiedSymptoms: 'Identified Symptoms',
    primaryDepartment: 'Assigned Department',
    urgencyLevel: 'Priority Urgency',
    patientDetailsTitle: 'Patient Details',
    confirmAndBookBtn: 'Confirm & Get Token',
    editSymptomsBtn: 'Edit Symptoms / Speak Again',

    // Appointment Confirmed Screen
    appointmentSuccessTitle: 'Your appointment is booked',
    appointmentSuccessSubtitle: 'Your token number has been generated successfully.',
    appointmentWarmEndMessage: 'Your appointment is booked. Thank you. Please arrive at the health centre on time.',
    tokenNumberLabel: 'Token Number',
    facilityLabel: 'Healthcare Facility',
    doctorLabel: 'Doctor',
    dateTimeLabel: 'Date & Time',
    estimatedWaitLabel: 'Estimated Wait',
    appointmentIdLabel: 'Appointment ID',
    instructionsTitle: 'Important Instructions',
    instruction1: 'Please arrive at the health centre on time (Room #03).',
    instruction2: 'Wait for your token number to appear on the queue display.',
    instruction3: 'Carry your previous medical prescriptions and ID card.',
    listenTokenAudio: 'Listen to Token Details',
    viewAppointmentsBtn: 'View Appointment',
    backToHomeBtn: 'Go to Home',

    // Appointments List Screen
    appointmentsHeader: 'My Appointments & Token',
    activeQueueBadge: 'Live Queue',
    pastAppointments: 'Past Visits',
    noAppointments: 'No active appointments found.',
    queuePosition: 'Queue Position',
    waitingSince: 'Booked At',
    statusWaiting: 'Waiting',
    statusConfirmed: 'Confirmed',
    statusInConsultation: 'In Consultation',
    statusDone: 'Completed',
    statusCancelled: 'Cancelled',
    tokenHeaderLabel: 'TOKEN',
    dateHeaderLabel: 'Date',
    timeHeaderLabel: 'Time',
    facilityHeaderLabel: 'Facility',
    doctorHeaderLabel: 'Doctor',
    currentStatusLabel: 'Status',

    // Medicines Screen
    medicinesHeader: 'Prescribed Medicines',
    noMedicinesYet: 'No medicines prescribed yet.',
    prescribedBy: 'Prescribed by Doctor',
    prescribedOn: 'Prescription Date',
    dosageLabel: 'Dosage',
    frequencyLabel: 'Frequency',
    durationLabel: 'Duration',
    instructionsLabel: 'Instructions',
    listenMedicinesAudio: 'Listen to Medicine Details',
    readAllMedicines: 'Listen to all prescribed medicines',
    dosageMorning: 'Morning',
    dosageAfternoon: 'Afternoon',
    dosageNight: 'Night',

    // Notifications Screen
    notificationsHeader: 'Notifications & Alerts',
    recentActivity: 'Facility and health updates',
    markAllRead: 'Mark all as read',
    noNotifications: 'No new notifications.',
    medicationReminderTitle: 'Medicine Reminder',
    takeMedicineBtn: 'Mark as Taken',
    takenStatus: 'Taken',

    // Bottom Navigation
    navHome: 'Home',
    navAppointments: 'Appointments',
    navMedicines: 'Medicines',
    navNotifications: 'Notifications',
  },
}
