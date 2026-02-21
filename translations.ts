
const EN_TRANSLATIONS = {
  app_name: "MediGuide AI",
  disclaimer_title: "Important Medical Disclaimer",
  disclaimer_text_1: "MediGuide AI is not a doctor.",
  disclaimer_text_2: "This application uses artificial intelligence to provide informational guidance only. It cannot diagnose medical conditions, prescribe treatment, or replace professional medical advice.",
  disclaimer_list_1: "Never disregard professional medical advice.",
  disclaimer_list_2: "If you have a medical emergency, call emergency services immediately.",
  agree_button: "I Understand & Agree",
  welcome: "How can I help you",
  choose_category: "Choose a category below to start your AI-assisted pre-consultation.",
  quick_tips: "Quick Tips for",
  assistant_name: "MediGuide Assistant",
  ai_reasoning: "AI Reasoning",
  footer_disclaimer: "Remember: This is an AI assessment, not a doctor's diagnosis.",
  placeholder: "Type your message...",
  urgency_levels: {
    LOW: "Low Urgency • Monitor at Home",
    MEDIUM: "Moderate • Consult Doctor",
    HIGH: "High Urgency • Seek Emergency Care",
    UNKNOWN: "Unknown Urgency"
  },
  modes: {
    symptom: { 
      title: "Symptom Checker", 
      desc: "Describe how you feel. I'll help triage your symptoms.",
      tips: [
        "Be specific about where it hurts and how bad (1-10).",
        "Mention when the symptoms started.",
        "List any medications you are currently taking."
      ]
    },
    skin: { 
      title: "Skin & Visible Issues", 
      desc: "Upload a photo of a rash, bite, or acne for analysis.",
      tips: [
        "Use bright, natural lighting for the photo.",
        "Ensure the affected area is in sharp focus.",
        "Include a coin or object for size reference if possible."
      ]
    },
    medicine: { 
      title: "Meds & Lab Reports", 
      desc: "Scan medicine labels or upload lab reports for analysis.",
      tips: [
        "For Medicines: Ensure name and dosage are visible.",
        "For Lab Reports: Capture the result numbers and reference ranges.",
        "Do not cover any warning labels or flags."
      ]
    },
    mental: { 
      title: "Mental Health Check-in", 
      desc: "Mood assessment, stress relief, and coping strategies.",
      tips: [
        "Find a quiet, private space to chat.",
        "Take a few deep breaths before starting.",
        "Be honest about your feelings; there is no judgment."
      ]
    }
  },
  actions: {
    back: "Go back",
    report: "Doctor Report",
    live: "Live",
    upload: "Upload Image",
    speak: "Speak",
    send: "Send",
    close: "Close",
    copy: "Copy to Clipboard",
    logout: "Log Out",
    share: "Share",
    tracker: "Tracker",
    reminders: "Refills",
    new_chat: "New Chat",
    history: "History",
    no_history: "No previous chats."
  },
  tracker: {
    title: "Symptom Tracker",
    add_log: "Add New Log",
    symptom_label: "Symptom",
    severity_label: "Severity (1-10)",
    duration_label: "Duration",
    frequency_label: "Frequency",
    notes_label: "Notes (Optional)",
    save: "Save Log",
    history: "History",
    trend: "Severity Trend",
    overview: "Symptom Severity Overview",
    no_logs: "No logs yet. Add one to track your health.",
    delete: "Delete",
    time_range_7: "Last 7 Days",
    time_range_30: "Last 30 Days",
    time_range_all: "All Time"
  },
  reminders: {
    title: "Medication Refills",
    add_new: "Add Medication",
    med_name: "Medication Name",
    total_qty: "Pack Size / Total Qty",
    daily_dose: "Daily Dosage",
    days_remaining: "Days Remaining",
    refill_by: "Refill by:",
    save: "Set Reminder",
    no_reminders: "No active refill reminders.",
    delete: "Delete"
  },
  login: {
    title: "Welcome Back",
    subtitle: "Login to access your personalized health profile",
    email_label: "Email or Phone Number",
    send_code: "Send Verification Code",
    enter_code: "Enter 2-Step Verification Code",
    code_placeholder: "Enter 123456",
    verify: "Verify & Login",
    or_social: "Or continue with",
    google: "Google",
    facebook: "Facebook",
    create_profile: "Complete Your Profile",
    save_continue: "Save & Continue"
  },
  profile: {
    full_name: "Full Name",
    age: "Age",
    gender: "Gender",
    language: "Preferred Language",
    medical_history: "Medical History (Optional)",
    conditions: "Medical Conditions"
  },
  help: {
    title: "Help & FAQ",
    how_to_use_title: "How to use MediGuide",
    how_to_use_steps: [
      "Select a specific health category (e.g., Symptom Checker, Medicine Insight).",
      "Describe your issue in text, upload a clear photo, or use the microphone.",
      "Review the AI's analysis, including urgency level and self-care tips.",
      "Check the cited sources for verification.",
      "Use 'Live' mode for real-time voice interaction."
    ],
    limitations_title: "Important Limitations",
    limitations_items: [
      "MediGuide is an AI Assistant, NOT a real doctor.",
      "It cannot provide official medical diagnoses or prescriptions.",
      "In emergencies (severe pain, difficulty breathing), call emergency services immediately.",
      "AI can make mistakes (hallucinations). Always verify info."
    ],
    privacy_title: "Data Privacy",
    privacy_text: "Your session data is processed by Google's secure AI cloud but is not used to train models. Chat history is stored locally on your device browser."
  }
};

export const TRANSLATIONS: Record<string, any> = {
  en: EN_TRANSLATIONS,
  bn: {
    ...EN_TRANSLATIONS,
    app_name: "MediGuide AI",
    quick_tips: "এর জন্য টিপস",
    welcome: "আমি আপনাকে কিভাবে সাহায্য করতে পারি",
    choose_category: "আপনার এআই-সহায়তা প্রাক-পরামর্শ শুরু করতে নিচের একটি বিভাগ নির্বাচন করুন।",
    modes: {
        symptom: { 
          title: "লক্ষণ পরীক্ষক", 
          desc: "আপনার অনুভূতি বর্ণনা করুন।", 
          tips: [
             "কোথায় ব্যথা এবং কত তীব্র (১-১০) তা নির্দিষ্ট করুন।", 
             "লক্ষণগুলি কখন শুরু হয়েছিল তা উল্লেখ করুন।", 
             "বর্তমানে কোনো ওষুধ সেবন করছেন কি না তা জানান।"
          ]
        },
        skin: { 
          title: "ত্বক ও দৃশ্যমান সমস্যা", 
          desc: "বিশ্লেষণের জন্য র‍্যাশ বা ব্রণের ছবি আপলোড করুন।", 
          tips: [
             "ছবির জন্য উজ্জ্বল, প্রাকৃতিক আলো ব্যবহার করুন।", 
             "আক্রান্ত স্থানটি পরিষ্কার ফোকাসে আছে তা নিশ্চিত করুন।", 
             "সম্ভব হলে আকারের রেফারেন্সের জন্য একটি মুদ্রা বা বস্তু অন্তর্ভুক্ত করুন।"
          ]
        },
        medicine: {
            title: "ঔষধ ও ল্যাব রিপোর্ট",
            desc: "ঔষধের লেবেল স্ক্যান করুন বা ল্যাব রিপোর্ট আপলোড করুন।",
            tips: [
               "ঔষধের জন্য: নাম এবং ডোজ দৃশ্যমান আছে তা নিশ্চিত করুন।", 
               "ল্যাব রিপোর্টের জন্য: ফলাফল এবং রেঞ্জ ক্যাপচার করুন।", 
               "কোনো সতর্কতা লেবেল বা পতাকা কভার করবেন না।"
            ]
        },
        mental: { 
           title: "মানসিক স্বাস্থ্য", 
           desc: "মেজাজ মূল্যায়ন, স্ট্রেস উপশম এবং মোকাবিলার কৌশল।", 
           tips: [
              "চ্যাট করার জন্য একটি শান্ত, ব্যক্তিগত স্থান খুঁজুন।", 
              "শুরু করার আগে কয়েকবার গভীর শ্বাস নিন।", 
              "আপনার অনুভূতি সম্পর্কে সৎ হোন; কোনো বিচার নেই।"
           ]
        }
    },
    actions: { ...EN_TRANSLATIONS.actions, back: "ফিরে যান", tracker: "ট্র্যাকার", reminders: "রিফিল", live: "লাইভ", new_chat: "নতুন চ্যাট", history: "ইতিহাস", no_history: "কোনো পূর্ববর্তী চ্যাট নেই" },
  },
  hi: {
    ...EN_TRANSLATIONS,
    app_name: "MediGuide AI",
    quick_tips: "के लिए सुझाव",
    welcome: "मैं आपकी कैसे मदद कर सकता हूँ",
    choose_category: "अपनी एआई-सहायता प्राप्त पूर्व-परामर्श शुरू करने के लिए नीचे एक श्रेणी चुनें।",
    modes: {
      symptom: { 
        title: "लक्षण जाँच", 
        desc: "बताएं कि आप कैसा महसूस कर रहे हैं।", 
        tips: [
           "दर्द कहाँ है और कितना तेज है (1-10), यह स्पष्ट करें।",
           "बताएं कि लक्षण कब शुरू हुए।",
           "यदि कोई दवा ले रहे हैं, तो उसकी सूची दें।"
        ]
      },
      skin: { 
        title: "त्वचा की समस्या", 
        desc: "रैश या मुंहासे की फोटो अपलोड करें।", 
        tips: [
           "फोटो के लिए अच्छी प्राकृतिक रोशनी का उपयोग करें।",
           "सुनिश्चित करें कि प्रभावित क्षेत्र साफ दिखाई दे रहा है।",
           "आकार के संदर्भ के लिए कोई सिक्का या वस्तु साथ रखें।"
        ]
      },
      medicine: { 
        title: "दवा और लैब रिपोर्ट", 
        desc: "दवा के लेबल या लैब रिपोर्ट स्कैन करें।", 
        tips: [
           "दवाओं के लिए: सुनिश्चित करें कि नाम और खुराक दिखाई दे।",
           "लैब रिपोर्ट के लिए: परिणाम संख्या और संदर्भ सीमा कैप्चर करें।",
           "चेतावनी लेबल को न ढकें।"
        ]
      },
      mental: { 
        title: "मानसिक स्वास्थ्य", 
        desc: "मूड और तनाव प्रबंधन।", 
        tips: [
           "बातचीत के लिए एक शांत जगह खोजें।",
           "शुरू करने से पहले गहरी सांस लें।",
           "अपनी भावनाओं के बारे में ईमानदार रहें; कोई निर्णय नहीं लिया जाएगा।"
        ]
      }
    },
    actions: { ...EN_TRANSLATIONS.actions, back: "पीछे जाएं", tracker: "ट्रैकर", reminders: "रिफिल", live: "लाइव", new_chat: "नई चैट", history: "इतिहास", no_history: "कोई पिछली चैट नहीं" }
  },
  es: {
    ...EN_TRANSLATIONS,
    app_name: "MediGuide AI",
    quick_tips: "Consejos para",
    welcome: "¿Cómo puedo ayudarte?",
    choose_category: "Elige una categoría para comenzar tu pre-consulta asistida por IA.",
    modes: {
      symptom: { 
         title: "Verificador de Síntomas", 
         desc: "Describe cómo te sientes.", 
         tips: [
            "Sé específico sobre dónde te duele y cuánto (1-10).",
            "Menciona cuándo comenzaron los síntomas.",
            "Enumera los medicamentos que estás tomando actualmente."
         ]
      },
      skin: { 
         title: "Piel y Problemas Visibles", 
         desc: "Sube una foto de la erupción o acné.", 
         tips: [
            "Usa iluminación natural brillante para la foto.",
            "Asegúrate de que el área afectada esté enfocada.",
            "Incluye una moneda u objeto como referencia de tamaño si es posible."
         ]
      },
      medicine: { 
         title: "Medicinas y Reportes", 
         desc: "Escanea etiquetas de medicinas o reportes de laboratorio.", 
         tips: [
            "Para medicinas: Asegúrate de que el nombre y la dosis sean visibles.",
            "Para reportes: Captura los números de resultados y rangos de referencia.",
            "No cubras ninguna etiqueta de advertencia."
         ]
      },
      mental: { 
         title: "Salud Mental", 
         desc: "Evaluación del estado de ánimo y alivio del estrés.", 
         tips: [
            "Encuentra un espacio tranquilo y privado para charlar.",
            "Respira profundamente antes de comenzar.",
            "Sé honesto sobre tus sentimientos; no hay juicio."
         ]
      }
    },
    actions: { ...EN_TRANSLATIONS.actions, back: "Atrás", tracker: "Rastreador", reminders: "Resurtidos", live: "En Vivo", new_chat: "Nueva Charla", history: "Historial", no_history: "No hay chats anteriores" }
  },
  fr: {
    ...EN_TRANSLATIONS,
    app_name: "MediGuide AI",
    quick_tips: "Astuces pour",
    welcome: "Comment puis-je vous aider ?",
    choose_category: "Choisissez une catégorie pour commencer.",
    modes: {
      symptom: { 
         title: "Vérificateur de Symptômes", 
         desc: "Décrivez ce que vous ressentez.", 
         tips: [
            "Soyez précis sur l'endroit où vous avez mal et l'intensité (1-10).",
            "Mentionnez quand les symptômes ont commencé.",
            "Listez les médicaments que vous prenez actuellement."
         ]
      },
      skin: { 
         title: "Problèmes de Peau", 
         desc: "Téléchargez une photo de l'éruption cutanée.", 
         tips: [
            "Utilisez un éclairage naturel et lumineux.",
            "Assurez-vous que la zone affectée est nette.",
            "Incluez une pièce de monnaie pour référence de taille si possible."
         ]
      },
      medicine: { 
         title: "Médicaments et Labo", 
         desc: "Scannez les étiquettes ou les rapports de laboratoire.", 
         tips: [
            "Pour les médicaments : Assurez-vous que le nom et le dosage sont visibles.",
            "Pour les rapports : Capturez les résultats et les plages de référence.",
            "Ne couvrez pas les étiquettes d'avertissement."
         ]
      },
      mental: { 
         title: "Santé Mentale", 
         desc: "Gestion de l'humeur et du stress.", 
         tips: [
            "Trouvez un endroit calme et privé.",
            "Prenez quelques grandes respirations avant de commencer.",
            "Soyez honnête sur vos sentiments ; il n'y a pas de jugement."
         ]
      }
    },
    actions: { ...EN_TRANSLATIONS.actions, back: "Retour", tracker: "Suivi", reminders: "Recharges", live: "En Direct", new_chat: "Nouvelle discussion", history: "Historique", no_history: "Aucun chat précédent" }
  },
  de: {
    ...EN_TRANSLATIONS,
    app_name: "MediGuide AI",
    quick_tips: "Tipps für",
    welcome: "Wie kann ich Ihnen helfen?",
    choose_category: "Wählen Sie eine Kategorie, um zu beginnen.",
    modes: {
      symptom: { 
         title: "Symptom-Checker", 
         desc: "Beschreiben Sie, wie Sie sich fühlen.", 
         tips: [
            "Seien Sie genau, wo es wehtut und wie stark (1-10).",
            "Erwähnen Sie, wann die Symptome begannen.",
            "Listen Sie alle Medikamente auf, die Sie einnehmen."
         ]
      },
      skin: { 
         title: "Hautprobleme", 
         desc: "Laden Sie ein Foto des Ausschlags hoch.", 
         tips: [
            "Verwenden Sie helles, natürliches Licht für das Foto.",
            "Stellen Sie sicher, dass der betroffene Bereich scharf ist.",
            "Legen Sie wenn möglich eine Münze als Größenvergleich dazu."
         ]
      },
      medicine: { 
         title: "Medikamente & Labor", 
         desc: "Scannen Sie Etiketten oder Berichte.", 
         tips: [
            "Für Medikamente: Stellen Sie sicher, dass Name und Dosierung sichtbar sind.",
            "Für Laborberichte: Erfassen Sie die Ergebniswerte und Referenzbereiche.",
            "Verdecken Sie keine Warnhinweise."
         ]
      },
      mental: { 
         title: "Psychische Gesundheit", 
         desc: "Stimmungsbewertung und Stressabbau.", 
         tips: [
            "Suchen Sie sich einen ruhigen, privaten Ort.",
            "Atmen Sie vor Beginn tief durch.",
            "Seien Sie ehrlich mit Ihren Gefühlen; es gibt kein Urteil."
         ]
      }
    },
    actions: { ...EN_TRANSLATIONS.actions, back: "Zurück", tracker: "Tracker", reminders: "Nachfüllen", live: "Live", new_chat: "Neuer Chat", history: "Verlauf", no_history: "Keine früheren Chats" }
  },
  zh: {
    ...EN_TRANSLATIONS,
    app_name: "MediGuide AI",
    quick_tips: "提示",
    welcome: "我能为您做什么？",
    choose_category: "请选择一个类别以开始 AI 辅助预诊。",
    modes: {
      symptom: { 
         title: "症状检查", 
         desc: "描述您的感觉。我将帮助分诊您的症状。", 
         tips: [
            "具体说明哪里痛以及疼痛程度 (1-10)。",
            "提及症状何时开始。",
            "列出您目前正在服用的任何药物。"
         ]
      },
      skin: { 
         title: "皮肤与外观问题", 
         desc: "上传皮疹或痤疮的照片进行分析。", 
         tips: [
            "使用明亮的自然光拍摄照片。",
            "确保受影响区域对焦清晰。",
            "如果可能，包含一枚硬币或物体作为大小参考。"
         ]
      },
      medicine: { 
         title: "药物与化验报告", 
         desc: "扫描药物标签或上传化验报告。", 
         tips: [
            "对于药物：确保名称和剂量清晰可见。",
            "对于化验报告：拍摄结果数值和参考范围。",
            "不要遮挡任何警告标签。"
         ]
      },
      mental: { 
         title: "心理健康", 
         desc: "情绪评估、减压和应对策略。", 
         tips: [
            "找一个安静、私密的地方聊天。",
            "开始前深呼吸几次。",
            "诚实表达您的感受；这里没有评判。"
         ]
      }
    },
    actions: { ...EN_TRANSLATIONS.actions, back: "返回", tracker: "追踪器", reminders: "补药提醒", live: "实时", new_chat: "新聊天", history: "历史记录", no_history: "没有以前的聊天" }
  },
  ta: {
    ...EN_TRANSLATIONS,
    app_name: "MediGuide AI",
    quick_tips: "இதற்கான உதவிக்குறிப்புகள்",
    welcome: "நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    choose_category: "தொடங்குவதற்கு கீழே உள்ள ஒரு வகையைத் தேர்ந்தெடுக்கவும்.",
    modes: {
      symptom: { 
        title: "அறிகுறி சோதனையாளர்", 
        desc: "உங்கள் உடல்நலக் குறைபாடுகளை விவரிக்கவும்.", 
        tips: [
           "எங்கு வலிக்கிறது மற்றும் எவ்வளவு மோசமாக உள்ளது (1-10) என்பதைக் குறிப்பிடவும்.",
           "அறிகுறிகள் எப்போது தொடங்கின என்பதைக் குறிப்பிடவும்.",
           "தற்போது நீங்கள் எடுத்துக்கொள்ளும் மருந்துகளைப் பட்டியலிடவும்."
        ]
      },
      skin: { 
        title: "தோல் பராமரிப்பு", 
        desc: "சரும பாதிப்பு அல்லது தடிப்புகளின் புகைப்படத்தை பதிவேற்றவும்.", 
        tips: [
           "புகைப்படத்திற்கு பிரகாசமான, இயற்கையான ஒளியைப் பயன்படுத்தவும்.",
           "பாதிக்கப்பட்ட பகுதி தெளிவாக உள்ளதா என்பதை உறுதிப்படுத்தவும்.",
           "முடிந்தால் அளவைக் குறிக்க ஒரு நாணயம் அல்லது பொருளைச் சேர்க்கவும்."
        ]
      },
      medicine: { 
        title: "மருந்து & ஆய்வக அறிக்கை", 
        desc: "மருந்து சீட்டு அல்லது ஆய்வக அறிக்கைகளை ஸ்கேன் செய்யவும்.", 
        tips: [
           "மருந்துகளுக்கு: பெயர் மற்றும் அளவு தெரிவதை உறுதிப்படுத்தவும்.",
           "ஆய்வக அறிக்கைகளுக்கு: முடிவுகள் மற்றும் குறிப்பு வரம்புகளைப் படம் எடுக்கவும்.",
           "எந்த எச்சரிக்கை லேபிள்களையும் மறைக்க வேண்டாம்."
        ]
      },
      mental: { 
        title: "மனநலம்", 
        desc: "மன அழுத்தம் மற்றும் மனநிலை மேம்பாடு.", 
        tips: [
           "பேசுவதற்கு அமைதியான, தனிப்பட்ட இடத்தைக் கண்டறியவும்.",
           "தொடங்குவதற்கு முன் சில முறை ஆழ்ந்த மூச்சு விடவும்.",
           "உங்கள் உணர்வுகளைப் பற்றி நேர்மையாக இருங்கள்."
        ]
      }
    },
    actions: {
      back: "பின்செல்",
      report: "அறிக்கை",
      live: "லைவ்",
      upload: "பதிவேற்று",
      speak: "பேசவும்",
      send: "அனுப்பு",
      close: "மூடு",
      copy: "நகலெடு",
      logout: "வெளியேறு",
      share: "பகிர்",
      tracker: "கண்காணிப்பு",
      reminders: "நினைவூட்டல்",
      new_chat: "புதிய அரட்டை",
      history: "வரலாறு",
      no_history: "முந்தைய அரட்டைகள் இல்லை"
    },
    tracker: {
      title: "அறிகுறி கண்காணிப்பு",
      add_log: "புதிய பதிவு",
      symptom_label: "அறிகுறி",
      severity_label: "தீவிரம் (1-10)",
      duration_label: "கால அளவு",
      frequency_label: "அதிர்வெண்",
      notes_label: "குறிப்புகள்",
      save: "சேமி",
      history: "வரலாறு",
      trend: "தீவிரத்தின் போக்கு",
      overview: "கண்ணோட்டம்",
      no_logs: "பதிவுகள் இல்லை.",
      delete: "அழி",
      time_range_7: "கடைசி 7 நாட்கள்",
      time_range_30: "கடைசி 30 நாட்கள்",
      time_range_all: "எல்லா நேரமும்"
    },
    reminders: {
      title: "மருந்து நினைவூட்டல்கள்",
      add_new: "மருந்தைச் சேர்",
      med_name: "மருந்து பெயர்",
      total_qty: "மொத்த அளவு",
      daily_dose: "தினசரி அளவு",
      days_remaining: "மீதமுள்ள நாட்கள்",
      refill_by: "ரீஃபில் தேதி:",
      save: "நினைவூட்டலைச் சேர்",
      no_reminders: "நினைவூட்டல்கள் இல்லை.",
      delete: "அழி"
    },
  },
  te: {
    ...EN_TRANSLATIONS,
    app_name: "MediGuide AI",
    quick_tips: "కోసం చిట్కాలు",
    welcome: "నేను మీకు ఎలా సహాయం చేయగలను?",
    choose_category: "ప్రారంభించడానికి దిగువ వర్గాన్ని ఎంచుకోండి.",
    modes: {
      symptom: {
        title: "లక్షణాల తనిఖీ",
        desc: "మీకు ఎలా అనిపిస్తుందో వివరించండి.",
        tips: [
           "ఎక్కడ నొప్పిగా ఉందో మరియు ఎంత తీవ్రంగా (1-10) ఉందో స్పష్టంగా చెప్పండి.",
           "లక్షణాలు ఎప్పుడు మొదలయ్యాయో చెప్పండి.",
           "మీరు ప్రస్తుతం వాడుతున్న మందులను తెలియజేయండి."
        ]
      },
      skin: {
        title: "చర్మ సమస్యలు",
        desc: "విశ్లేషణ కోసం ఫోటోను అప్‌లోడ్ చేయండి.",
        tips: [
           "ఫోటో కోసం మంచి సహజ కాంతిని ఉపయోగించండి.",
           "ప్రభావిత ప్రాంతం స్పష్టంగా కనిపించేలా చూసుకోండి.",
           "పరిమాణం అర్థం చేసుకోవడానికి ఒక నాణెం లేదా వస్తువును పక్కన పెట్టండి."
        ]
      },
      medicine: {
        title: "మందులు & నివేదికలు",
        desc: "మందుల లేబుల్ లేదా నివేదికను స్కాన్ చేయండి.",
        tips: [
           "మందుల కోసం: పేరు మరియు మోతాదు కనిపించేలా చూసుకోండి.",
           "ల్యాబ్ రిపోర్ట్‌ల కోసం: ఫలితాలు మరియు రేంజ్‌లను క్యాప్చర్ చేయండి.",
           "హెచ్చరిక లేబుల్‌లను కవర్ చేయవద్దు."
        ]
      },
      mental: {
        title: "మానసిక ఆరోగ్యం",
        desc: "ఒత్తిడి మరియు మానసిక స్థితి.",
        tips: [
           "మాట్లాడటానికి ప్రశాంతమైన, వ్యక్తిగత స్థలాన్ని ఎంచుకోండి.",
           "ప్రారంభించడానికి ముందు లోతైన శ్వాస తీసుకోండి.",
           "మీ భావాల గురించి నిజాయితీగా ఉండండి."
        ]
      }
    },
    actions: {
      back: "వెనుకకు",
      report: "నివేదిక",
      live: "లైవ్",
      upload: "అప్‌లోడ్",
      speak: "మాట్లాడండి",
      send: "పంపండి",
      close: "మూసివేయి",
      copy: "కాపీ చేయండి",
      logout: "లాగ్ అవుట్",
      share: "భాగస్వామ్యం",
      tracker: "ట్రాకర్",
      reminders: "రీఫిల్స్",
      new_chat: "కొత్త చాట్",
      history: "చరిత్ర",
      no_history: "మునుపటి చాట్‌లు లేవు"
    },
    tracker: {
      title: "లక్షణ ట్రాకర్",
      add_log: "కొత్త లాగ్",
      symptom_label: "లక్షణం",
      severity_label: "తీవ్రత (1-10)",
      duration_label: "వ్యవధి",
      frequency_label: "ఫ్రీక్వెన్సీ",
      notes_label: "గమనికలు",
      save: "సేవ్ చేయండి",
      history: "చరిత్ర",
      trend: "తీవ్రత ధోరణి",
      overview: "అవలోకనం",
      no_logs: "లాగ్‌లు లేవు.",
      delete: "తొలగించు",
      time_range_7: "గత 7 రోజులు",
      time_range_30: "గత 30 రోజులు",
      time_range_all: "అన్ని సమయాలు"
    },
    reminders: {
      title: "మందుల రిమైండర్",
      add_new: "మందును జోడించు",
      med_name: "మందు పేరు",
      total_qty: "మొత్తం పరిమాణం",
      daily_dose: "రోజువారీ మోతాదు",
      days_remaining: "మిగిలిన రోజులు",
      refill_by: "రీఫిల్ తేదీ:",
      save: "రిమైండర్ సెట్ చేయి",
      no_reminders: "రిమైండర్లు లేవు.",
      delete: "తొలగించు"
    },
  },
  gu: {
    ...EN_TRANSLATIONS,
    app_name: "MediGuide AI",
    quick_tips: "માટે ટિપ્સ",
    welcome: "હું તમને કેવી રીતે મદદ કરી શકું?",
    choose_category: "શરૂ કરવા માટે નીચે એક શ્રેણી પસંદ કરો.",
    modes: {
      symptom: {
        title: "લક્ષણ તપાસનાર",
        desc: "તમને કેવું લાગે છે તે વર્ણવો.",
        tips: [
           "ક્યાં દુખાવો છે અને કેટલો (1-10) તે સ્પષ્ટ કરો.",
           "લક્ષણો ક્યારે શરૂ થયા તે જણાવો.",
           "હાલમાં લેવાતી દવાઓ જણાવો."
        ]
      },
      skin: {
        title: "ત્વચા સંભાળ",
        desc: "વિશ્લેષણ માટે ફોટો અપલોડ કરો.",
        tips: [
           "ફોટો માટે સારા કુદરતી પ્રકાશનો ઉપયોગ કરો.",
           "ખાતરી કરો કે અસરગ્રસ્ત વિસ્તાર સ્પષ્ટ છે.",
           "માપ જાણવા માટે સિક્કો અથવા વસ્તુ સાથે રાખો."
        ]
      },
      medicine: {
        title: "દવાઓ અને રિપોર્ટ",
        desc: "દવાનું લેબલ અથવા રિપોર્ટ સ્કેન કરો.",
        tips: [
           "દવાઓ માટે: નામ અને ડોઝ દેખાય છે તેની ખાતરી કરો.",
           "લેબ રિપોર્ટ માટે: પરિણામ અને રેન્જનો ફોટો લો.",
           "ચેતવણી લેબલને ઢાંકશો નહીં."
        ]
      },
      mental: {
        title: "માનસિક સ્વાસ્થ્ય",
        desc: "મૂડ અને તણાવ.",
        tips: [
           "વાત કરવા માટે શાંત જગ્યા શોધો.",
           "શરૂ કરતા પહેલા ઊંડા શ્વાસ લો.",
           "તમારી લાગણીઓ વિશે પ્રામાણિક રહો."
        ]
      }
    },
    actions: {
      back: "પાછા જાઓ",
      report: "રિપોર્ટ",
      live: "લાઇવ",
      upload: "અપલોડ",
      speak: "બોલો",
      send: "મોકલો",
      close: "બંધ કરો",
      copy: "કોપી કરો",
      logout: "લોગ આઉટ",
      share: "શેર",
      tracker: "ટ્રેકર",
      reminders: "રિફિલ્સ",
      new_chat: "નવી વાતચીત",
      history: "ઇતિહાસ",
      no_history: "કોઈ અગાઉની વાતચીત નથી"
    },
    tracker: {
      title: "લક્ષણ ટ્રેકર",
      add_log: "નવો લોગ",
      symptom_label: "લક્ષણ",
      severity_label: "તીવ્રતા (1-10)",
      duration_label: "અવધિ",
      frequency_label: "આવર્તન",
      notes_label: "નોંધ",
      save: "સેવ કરો",
      history: "ઇતિહાસ",
      trend: "તીવ્રતા વલણ",
      overview: "ઝાંખી",
      no_logs: "કોઈ લોગ નથી.",
      delete: "ડિલીટ",
      time_range_7: "છેલ્લા 7 દિવસ",
      time_range_30: "છેલ્લા 30 દિવસ",
      time_range_all: "બધો સમય"
    },
    reminders: {
      title: "દવા રિમાઇન્ડર",
      add_new: "દવા ઉમેરો",
      med_name: "દવાનું નામ",
      total_qty: "કુલ જથ્થો",
      daily_dose: "દૈનિક ડોઝ",
      days_remaining: "બાકી દિવસો",
      refill_by: "રિફિલ તારીખ:",
      save: "રિમાઇન્ડર સેટ કરો",
      no_reminders: "કોઈ રિમાઇન્ડર નથી.",
      delete: "ડિલીટ"
    },
  }
};
