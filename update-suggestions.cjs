const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

const newSuggestions = {
  'zh-CN': {
    deepThinking: [
      "解释一下什么是暗物质",
      "如何理解区块链的工作原理",
      "为什么天空是蓝色的",
      "什么是机器学习中的监督学习"
    ],
    programmingMode: [
      "用 TypeScript 实现一个事件总线",
      "使用 Vue3 实现响应式数据绑定",
      "解释一下 HTTP 和 HTTPS 的区别",
      "如何设计一个 RESTful API"
    ],
    default: [
      "你能做些什么？",
      "推荐一本适合初学者的编程书籍",
      "给我讲一个有趣的故事",
      "解释一下什么是人工智能"
    ]
  },
  'zh-TW': {
    deepThinking: [
      "解釋一下什麼是暗物質",
      "如何理解區塊鏈的工作原理",
      "為什麼天空是藍色的",
      "什麼是機器學習中的監督式學習"
    ],
    programmingMode: [
      "用 TypeScript 實作一個事件總線",
      "使用 Vue3 實作響應式數據綁定",
      "解釋一下 HTTP 和 HTTPS 的區別",
      "如何設計一個 RESTful API"
    ],
    default: [
      "你能做些什麼？",
      "推薦一本適合初學者的程式設計書籍",
      "給我講一個有趣的故事",
      "解釋一下什麼是人工智慧"
    ]
  },
  'en-US': {
    deepThinking: [
      "Explain what dark matter is",
      "How to understand how blockchain works",
      "Why is the sky blue",
      "What is supervised learning in machine learning"
    ],
    programmingMode: [
      "Implement an event bus with TypeScript",
      "Implement reactive data binding with Vue3",
      "Explain the difference between HTTP and HTTPS",
      "How to design a RESTful API"
    ],
    default: [
      "What can you do?",
      "Recommend a programming book for beginners",
      "Tell me an interesting story",
      "Explain what artificial intelligence is"
    ]
  },
  'ja-JP': {
    deepThinking: [
      "暗黒物質とは何かを説明して",
      "ブロックチェーンの仕組みを理解する方法",
      "空が青いのはなぜか",
      "機械学習における教師あり学習とは何か"
    ],
    programmingMode: [
      "TypeScriptでイベントバスを実装する",
      "Vue3でリアクティブデータバインディングを実装する",
      "HTTPとHTTPSの違いを説明する",
      "RESTful APIを設計する方法"
    ],
    default: [
      "あなたは何ができますか？",
      "初心者向けのプログラミング本を推薦して",
      "面白い話をしてください",
      "人工知能とは何かを説明してください"
    ]
  },
  'ko-KR': {
    deepThinking: [
      "암흑물질이란 무엇인지 설명하세요",
      "블록체인의 작동 원리를 이해하는 방법",
      "하늘이 왜 파란색인가",
      "머신러닝에서 지도 학습이란 무엇인가"
    ],
    programmingMode: [
      "TypeScript로 이벤트 버스 구현하기",
      "Vue3로 반응형 데이터 바인딩 구현하기",
      "HTTP와 HTTPS의 차이를 설명하세요",
      "RESTful API를 어떻게 설계하는가"
    ],
    default: [
      "무엇을 할 수 있나요?",
      "초보자를 위한 프로그래밍 책 추천해 주세요",
      "재미있는 이야기 해주세요",
      "인공지능이 무엇인지 설명해 주세요"
    ]
  },
  'fr-FR': {
    deepThinking: [
      "Expliquez ce qu'est la matière noire",
      "Comment comprendre le fonctionnement de la blockchain",
      "Pourquoi le ciel est-il bleu",
      "Qu'est-ce que l'apprentissage supervisé en machine learning"
    ],
    programmingMode: [
      "Implémentez un bus d'événements avec TypeScript",
      "Implémentez la liaison de données réactive avec Vue3",
      "Expliquez la différence entre HTTP et HTTPS",
      "Comment concevoir une API RESTful"
    ],
    default: [
      "Que pouvez-vous faire?",
      "Recommandez un livre de programmation pour les débutants",
      "Racontez-moi une histoire intéressante",
      "Expliquez ce qu'est l'intelligence artificielle"
    ]
  },
  'de-DE': {
    deepThinking: [
      "Erklären Sie, was Dunkelmaterie ist",
      "Wie man die Funktionsweise von Blockchain versteht",
      "Warum ist der Himmel blau",
      "Was ist überwachtes Lernen im maschinellen Lernen"
    ],
    programmingMode: [
      "Implementieren Sie einen Event-Bus mit TypeScript",
      "Implementieren Sie reaktive Datenbindung mit Vue3",
      "Erklären Sie den Unterschied zwischen HTTP und HTTPS",
      "Wie man eine RESTful API entwirft"
    ],
    default: [
      "Was können Sie tun?",
      "Empfehlen Sie ein Programmierbuch für Anfänger",
      "Erzählen Sie mir eine interessante Geschichte",
      "Erklären Sie, was künstliche Intelligenz ist"
    ]
  },
  'es-ES': {
    deepThinking: [
      "Explica qué es la materia oscura",
      "Cómo entender el funcionamiento de la blockchain",
      "¿Por qué el cielo es azul",
      "¿Qué es el aprendizaje supervisado en machine learning"
    ],
    programmingMode: [
      "Implementa un bus de eventos con TypeScript",
      "Implementa el enlace de datos reactivo con Vue3",
      "Explica la diferencia entre HTTP y HTTPS",
      "Cómo diseñar una API RESTful"
    ],
    default: [
      "¿Qué puedes hacer?",
      "Recomienda un libro de programación para principiantes",
      "Cuéntame una historia interesante",
      "Explica qué es la inteligencia artificial"
    ]
  },
  'it-IT': {
    deepThinking: [
      "Spiega cos'è la materia oscura",
      "Come capire il funzionamento della blockchain",
      "Perché il cielo è blu",
      "Cosa è l'apprendimento supervisionato nel machine learning"
    ],
    programmingMode: [
      "Implementa un bus di eventi con TypeScript",
      "Implementa il data binding reattivo con Vue3",
      "Spiega la differenza tra HTTP e HTTPS",
      "Come progettare un'API RESTful"
    ],
    default: [
      "Cosa puoi fare?",
      "Consiglia un libro di programmazione per principianti",
      "Raccontami una storia interessante",
      "Spiega cos'è l'intelligenza artificiale"
    ]
  },
  'pt-BR': {
    deepThinking: [
      "Explique o que é matéria escura",
      "Como entender o funcionamento da blockchain",
      "Por que o céu é azul",
      "O que é aprendizado supervisionado em machine learning"
    ],
    programmingMode: [
      "Implemente um barramento de eventos com TypeScript",
      "Implemente a vinculação de dados reativa com Vue3",
      "Explique a diferença entre HTTP e HTTPS",
      "Como projetar uma API RESTful"
    ],
    default: [
      "O que você pode fazer?",
      "Recomende um livro de programação para iniciantes",
      "Conte-me uma história interessante",
      "Explique o que é inteligência artificial"
    ]
  },
  'ru-RU': {
    deepThinking: [
      "Объясните, что такое темная материя",
      "Как понять принцип работы блокчейна",
      "Почему небо голубое",
      "Что такое обучение с учителем в машинном обучении"
    ],
    programmingMode: [
      "Реализуйте шину событий с помощью TypeScript",
      "Реализуйте реактивное связывание данных с Vue3",
      "Объясните разницу между HTTP и HTTPS",
      "Как спроектировать RESTful API"
    ],
    default: [
      "Что вы можете сделать?",
      "Рекомендуйте книгу по программированию для начинающих",
      "Расскажите мне интересную историю",
      "Объясните, что такое искусственный интеллект"
    ]
  },
  'ar-SA': {
    deepThinking: [
      "اشرح ما هي المادة المظلمة",
      "كيف نفهم كيفية عمل البلوكشين",
      "لماذا السماء زرقاء",
      "ما هو التعلم الخاضع للإشراف في التعلم الآلي"
    ],
    programmingMode: [
      "قم بتنفيذ حافل أحداث مع TypeScript",
      "قم بتنفيذ ربط البيانات التفاعلية مع Vue3",
      "اشرح الفرق بين HTTP و HTTPS",
      "كيف تصمم API RESTful"
    ],
    default: [
      "ماذا يمكنك أن تفعل؟",
      "أرجوا التوصية بكتاب برمجة للمبتدئين",
      "اسألني قصة ممتعة",
      "اشرح ما هو الذكاء الاصطناعي"
    ]
  },
  'hi-IN': {
    deepThinking: [
      "अंधकारी पदार्थ क्या है इसकी व्याख्या करें",
      "ब्लॉकचेन के कामकाज को कैसे समझें",
      "आकाश नीला क्यों होता है",
      "मशीन लर्निंग में पर्यवेक्षित शिक्षण क्या है"
    ],
    programmingMode: [
      "TypeScript के साथ इवेंट बस लागू करें",
      "Vue3 के साथ प्रतिक्रियाशील डेटा बाइंडिंग लागू करें",
      "HTTP और HTTPS के बीच का अंतर स्पष्ट करें",
      "RESTful API को कैसे डिजाइन करें"
    ],
    default: [
      "आप क्या कर सकते हैं?",
      "शुरुआती के लिए प्रोग्रामिंग किताब सुझाएं",
      "मुझे एक दिलचस्प कहानी सुनाएं",
      "कृत्रिम बुद्धिमत्ता क्या है इसकी व्याख्या करें"
    ]
  },
  'th-TH': {
    deepThinking: [
      "อธิบายว่าอะไรคือสารมืด",
      "จะเข้าใจการทำงานของบล็อกเชนได้อย่างไร",
      "ทำไมฟ้าเป็นสีฟ้า",
      "อะไรคือการเรียนรู้แบบมีผู้ดูแลในการเรียนรู้ของเครื่อง"
    ],
    programmingMode: [
      "ใช้ TypeScript รับรู้บัสเหตุการณ์",
      "ใช้ Vue3 รับรู้การผูกข้อมูลปฏิกิริยา",
      "อธิบายความแตกต่างระหว่าง HTTP และ HTTPS",
      "จะออกแบบ API RESTful ได้อย่างไร"
    ],
    default: [
      "คุณสามารถทำอะไรได้?",
      "แนะนำหนังสือการเขียนโปรแกรมสำหรับมือใหม่",
      "เล่าเรื่องที่น่าสนใจให้ฉันฟัง",
      "อธิบายว่าอะไรคือปัญญาประดิษฐ์"
    ]
  },
  'vi-VN': {
    deepThinking: [
      "Giải thích vật chất tối là gì",
      "Cách hiểu hoạt động của blockchain",
      "Tại sao bầu trời màu xanh",
      "Học máy có giám sát là gì trong học máy"
    ],
    programmingMode: [
      "Thực hiện bus sự kiện với TypeScript",
      "Thực hiện ràng buộc dữ liệu phản ứng với Vue3",
      "Giải thích sự khác biệt giữa HTTP và HTTPS",
      "Cách thiết kế API RESTful"
    ],
    default: [
      "Bạn có thể làm gì?",
      "Khuyên tôi một cuốn sách lập trình cho người mới",
      "Kể cho tôi nghe một câu chuyện thú vị",
      "Giải thích trí tuệ nhân tạo là gì"
    ]
  },
  'id-ID': {
    deepThinking: [
      "Jelaskan apa itu materi gelap",
      "Cara memahami cara kerja blockchain",
      "Mengapa langit biru",
      "Apa itu pembelajaran terawasi dalam pembelajaran mesin"
    ],
    programmingMode: [
      "Terapkan bus acara dengan TypeScript",
      "Terapkan pengikatan data reaktif dengan Vue3",
      "Jelaskan perbedaan antara HTTP dan HTTPS",
      "Cara merancang API RESTful"
    ],
    default: [
      "Apa yang bisa Anda lakukan?",
      "Rekomendasikan buku pemrograman untuk pemula",
      "Ceritakan cerita menarik untuk saya",
      "Jelaskan apa itu kecerdasan buatan"
    ]
  },
  'ms-MY': {
    deepThinking: [
      "Terangkan apa itu jirim gelap",
      "Bagaimana untuk memahami cara kerja blockchain",
      "Mengapa langit berwarna biru",
      "Apakah pembelajaran terselia dalam pembelajaran mesin"
    ],
    programmingMode: [
      "Laksanakan bas acara dengan TypeScript",
      "Laksanakan pengikatan data reaktif dengan Vue3",
      "Terangkan perbezaan antara HTTP dan HTTPS",
      "Bagaimana untuk mereka bentuk API RESTful"
    ],
    default: [
      "Apa yang boleh anda lakukan?",
      "Cadangkan buku pengaturcaraan untuk pemula",
      "Ceritakan cerita menarik untuk saya",
      "Terangkan apa itu kecerdasan buatan"
    ]
  },
  'tr-TR': {
    deepThinking: [
      "Karanlık madde nedir açıklayın",
      "Blockchain'in çalışma prensibini nasıl anlarız",
      "Gökyüzü neden mavi",
      "Makine öğrenmesinde denetimli öğrenme nedir"
    ],
    programmingMode: [
      "TypeScript ile bir olay busu uygulayın",
      "Vue3 ile reaktif veri bağlama uygulayın",
      "HTTP ve HTTPS arasındaki farkı açıklayın",
      "RESTful API nasıl tasarlanır"
    ],
    default: [
      "Ne yapabilirsin?",
      "Başlangıç seviyesi için bir programlama kitabı önerin",
      "Bana ilginç bir hikaye anlatın",
      "Yapay zekânın ne olduğunu açıklayın"
    ]
  },
  'pl-PL': {
    deepThinking: [
      "Wyjaśnij, co to jest ciemna materia",
      "Jak zrozumieć działanie blockchainu",
      "Dlaczego niebo jest niebieskie",
      "Co to jest uczenie nadzorowane w uczeniu maszynowym"
    ],
    programmingMode: [
      "Zaimplementuj bus zdarzeń za pomocą TypeScript",
      "Zaimplementuj reaktywne wiązanie danych z Vue3",
      "Wyjaśnij różnicę między HTTP a HTTPS",
      "Jak zaprojektować API RESTful"
    ],
    default: [
      "Co możesz zrobić?",
      "Poleć książkę o programowaniu dla początkujących",
      "Opowiedz mi ciekawą historię",
      "Wyjaśnij, czym jest sztuczna inteligencja"
    ]
  },
  'nl-NL': {
    deepThinking: [
      "Leg uit wat donkere materie is",
      "Hoe de werking van blockchain te begrijpen",
      "Waarom is de lucht blauw",
      "Wat is gecontroleerd leren in machine learning"
    ],
    programmingMode: [
      "Implementeer een eventbus met TypeScript",
      "Implementeer reactieve databinding met Vue3",
      "Leg het verschil tussen HTTP en HTTPS uit",
      "Hoe een RESTful API te ontwerpen"
    ],
    default: [
      "Wat kun je doen?",
      "Raad een programmeringsboek voor beginners aan",
      "Vertel me een interessante verhaal",
      "Leg uit wat kunstmatige intelligentie is"
    ]
  }
};

fs.readdir(messagesDir, (err, files) => {
  if (err) {
    console.error('Failed to read messages directory:', err);
    process.exit(1);
  }

  files.forEach(file => {
    const filePath = path.join(messagesDir, file);
    const lang = file.replace('.json', '');

    if (newSuggestions[lang]) {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Failed to read ${file}:`, err);
          return;
        }

        try {
          const json = JSON.parse(data);
          
          if (json.suggestions) {
            json.suggestions.deepThinking = newSuggestions[lang].deepThinking;
            json.suggestions.programmingMode = newSuggestions[lang].programmingMode;
            json.suggestions.default = newSuggestions[lang].default;
          }

          fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
            if (err) {
              console.error(`Failed to write ${file}:`, err);
              return;
            }
            console.log(`Updated ${file}`);
          });
        } catch (parseErr) {
          console.error(`Failed to parse ${file}:`, parseErr);
        }
      });
    }
  });
});
