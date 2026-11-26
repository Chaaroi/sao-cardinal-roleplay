import type {
  CharacterState,
  CompanionPerkDefinition,
  RomanceCharacterProfile,
  ShopState,
  WikiLoreEntry,
} from '../types/game'

export const PERK_UNLOCK_AFFECTION = 500

export const ROMANCE_ROSTER: RomanceCharacterProfile[] = [
  {
    id: 'lisbeth',
    name: 'Lisbeth',
    wikiTitle: 'Shinozaki Rika',
    roleTitle: 'Blacksmith & Schoolmate (Rika Shinozaki)',
    realWorldSetting: 'Tokyo — คาเฟ่สไตล์โมเดิร์นย่านการค้าใกล้โรงเรียนหลังเลิกเรียน',
    personality:
      'ร่าเริง สดใส ปากตรงกับใจ ชอบหยอกล้อกลบเกลื่อนความเขิน แต่จริงจังกับงานช่างตีดาบและหวงแหนความรู้สึกของคนสำคัญมาก',
    loves: [
      'การหลอมตีอาวุธระดับ Masterwork และแร่หายาก (Crystallite Ingot)',
      'คนกล้าหาญที่ไว้ใจในฝีมือและยอมเสี่ยงไปด้วยกัน',
      'ของขวัญแนวเครื่องประดับน่ารักและแฟชั่น',
    ],
    likes: [
      'การหยอกล้อเล่นอย่างเป็นกันเอง',
      'เค้กสตรอว์เบอร์รี ชานม และของหวานหลังเลิกเรียน',
      'อาวุธที่ได้รับการดูแลขัดเงาอย่างดี',
    ],
    dislikes: [
      'คนที่ไม่ดูแลอาวุธหรือดูถูกงานช่างตีเหล็ก',
      'การโกหกปิดบังความรู้สึกหรือทำตัวเย็นชาเกินไป',
      'ความอึดอัดจากการต้องเก็บความรู้สึกไว้คนเดียวเพื่อเพื่อน',
    ],
    perk: {
      id: 'lisbeth_smithy',
      title: 'ร้านตีดาบส่วนตัวของ Lisbeth (Partner Forge -20%)',
      shortLabel: 'เปิดร้านตีดาบ Lisbeth (-20%)',
      description:
        'เมื่อคบกับ Lisbeth สามารถเปิดใช้ร้านตีดาบส่วนตัวและสั่งตีอาวุธ/ซื้อแร่อัปเกรดในราคาลดพิเศษ 20% ได้ทุกเมื่อ แม้ในเซฟหรือชั้นอื่นๆ',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'shop',
      shopTemplate: {
        shop_name: "Lisbeth's Secret Partner Smithy (-20% Col)",
        shopkeeper: 'Lisbeth',
        currency: 'Col',
        items: [
          {
            name: 'Elucidator Custom Replica',
            description: 'ดาบมือเดียวตีพิเศษจากร้าน Lisbeth คมกริบและน้ำหนักสมดุล (+3 Combat/Equip Bonus)',
            price: 680,
            stock: 1,
            category: 'equipment',
          },
          {
            name: 'Dark Repulser Alloy Blade',
            description: 'ดาบคริสตัลไลต์สีฟ้าเทอร์ควอยซ์ที่ Lisbeth ตีขึ้นด้วยแร่ชั้นยอด เสริมพลังทะลวงเกราะ',
            price: 560,
            stock: 1,
            category: 'equipment',
          },
          {
            name: 'Masterwork Whetstone (+3)',
            description: 'หินลับดาบเกรดพิเศษจาก Lisbeth เพิ่มความคมและพลังโจมตีให้อาวุธคู่กายอย่างถาวร',
            price: 200,
            stock: 4,
            category: 'consumable',
          },
          {
            name: 'Crystallite Ingot (Partner Stock)',
            description: 'แร่คริสตัลไลต์หายากที่ Lisbeth เก็บไว้ให้คนรักโดยเฉพาะ สำหรับตีอาวุธระดับสูงสุด',
            price: 180,
            stock: 5,
            category: 'material',
          },
        ],
      },
    },
  },
  {
    id: 'asuna',
    name: 'Asuna',
    wikiTitle: 'Yuuki Asuna',
    roleTitle: 'The Flash / Master Chef (Yuuki Asuna)',
    realWorldSetting: 'Tokyo — คาเฟ่เงียบๆ ใกล้โรงเรียน (Yuuki Residence Garden)',
    personality:
      'อ่อนโยนแต่เด็ดเดี่ยว มีความรับผิดชอบสูง เชี่ยวชาญการทำอาหารระดับสูงสุด และจะมอบความภักดีให้คนที่ทำให้เธอรู้สึกเป็นตัวของตัวเอง',
    loves: [
      'การทำอาหารร่วมกันและวัตถุดิบหายาก (Ragout Rabbit, ครีมสด)',
      'ความจริงใจที่ไม่ตัดสินเธอจากชื่อเสียงตระกูล Yuuki',
      'ช่วงเวลาเงียบสงบเคียงข้างคนที่เชื่อใจ',
    ],
    likes: [
      'ชาดำอุ่นๆ แซนด์วิช และขนมหวานทำเอง',
      'ผู้เล่นที่ปกป้องพวกพ้องและไม่ยอมแพ้',
      'การวางแผนลุยบอสอย่างมีระบบ',
    ],
    dislikes: [
      'แรงกดดันเรื่องเรียนหรือการคลุมถุงชนจากครอบครัว',
      'คนที่เห็นชีวิตผู้อื่นเป็นเรื่องล้อเล่นหรือดูถูกความพยายาม',
      'มอนสเตอร์ประเภทผี/สไลม์ และกาแฟรสขมจัด',
    ],
    perk: {
      id: 'asuna_kitchen',
      title: 'เบนโตะทำมือ & ซัพพอร์ต "ประกายแสง" (Asuna Bento)',
      shortLabel: 'รับเบนโตะสูตรพิเศษของ Asuna',
      description:
        'เมื่อคบกับ Asuna เธอจะเตรียมอาหารระดับ S-Class ให้ตลอดการเดินทาง ฟื้นฟู HP และเสริมบัฟขวัญกำลังใจ +15% ในเนื้อเรื่อง',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'quick_action',
      quickPrompt:
        'เปิดกล่องเบนโตะทำมือสูตรพิเศษที่ Asuna (ในฐานะคนรัก) เตรียมไว้ให้ ทานร่วมกันเพื่อฟื้นฟู HP และรับบัฟ Marriage/Lover Cooking Blessing',
    },
  },
  {
    id: 'sinon',
    name: 'Sinon',
    wikiTitle: 'Asada Shino',
    roleTitle: 'Hecate II Sniper (Asada Shino)',
    realWorldSetting: 'Tokyo — ร้านกาแฟแถบ Asakusa & ห้องสมุดเงียบสงบ',
    personality:
      'สุขุม เยือกเย็น พูดจาตรงไปตรงมา มีกำแพงในใจจากบาดแผลอดีต แต่ถ้าเปิดใจให้ใครแล้วจะปกป้องและซื่อสัตย์อย่างลึกซึ้ง',
    loves: [
      'ความสงบที่ไม่ต้องเสแสร้ง และการยอมรับตัวตนทั้งในเกมและโลกจริง',
      'คนที่ก้าวเข้ามาช่วยแบกรับความกลัวอย่างเข้าใจโดยไม่ฝืน',
      'การยิงสนับสนุนที่แม่นยำและความไว้วางใจ 100%',
    ],
    likes: [
      'โกโก้ร้อนหรือชาร้อนในร้านกาแฟเงียบๆ',
      'แมว (Cait Sith) และผ้าพันคอสีฟ้าคู่ใจ',
      'บทสนทนาที่จริงใจ ไม่อ้อมค้อม',
    ],
    dislikes: [
      'คำพูดดูถูก คุกคาม หรือการย้ำแผลใจเรื่องปืนในโลกจริง',
      'คนพูดมาก เหลาะแหละ หรือเอาแต่โชว์พาว',
      'สถานที่อึกทึกวุ่นวายไร้เหตุผล',
    ],
    perk: {
      id: 'sinon_supply',
      title: 'คลังยุทธโธปกรณ์สไนเปอร์ & Tactical Eye (Sinon)',
      shortLabel: 'เปิดคลังสไนเปอร์ Sinon (-20%)',
      description:
        'ปลดล็อกสิทธิ์เบิกกล้องเล็ง กระสุนพิเศษ และอุปกรณ์สอดแนมระยะไกลจาก Sinon พร้อมการยิงคุ้มกันในเนื้อเรื่อง',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'shop',
      shopTemplate: {
        shop_name: "Sinon's Tactical Sniper Supply (-20% Col)",
        shopkeeper: 'Sinon',
        currency: 'Col',
        items: [
          {
            name: 'Hecate Ballistic Rangefinder',
            description: 'กล้องเล็งวัดระยะความแม่นยำสูงจาก Sinon เพิ่มโบนัสสายวิเคราะห์ (Think/Combat)',
            price: 360,
            stock: 1,
            category: 'equipment',
          },
          {
            name: 'Armor-Piercing Magazine',
            description: 'ชุดกระสุนและอุปกรณ์เจาะเกราะสำหรับยิงสนับสนุนจากระยะไกล',
            price: 160,
            stock: 4,
            category: 'consumable',
          },
          {
            name: 'Blue Scarf Keepsake (Sinon)',
            description: 'ผ้าพันคอสีฟ้าของ Sinon ช่วยเสริมสมาธิและความเยือกเย็นในสถานการณ์วิกฤต',
            price: 220,
            stock: 1,
            category: 'special',
          },
        ],
      },
    },
  },
  {
    id: 'silica',
    name: 'Silica',
    wikiTitle: 'Ayano Keiko',
    roleTitle: 'Dragon Tamer (Ayano Keiko)',
    realWorldSetting: 'Tokyo — สวนสาธารณะและร้านขนมเค้กใกล้โรงเรียน',
    personality:
      'น่ารัก สดใส รักสัตว์ มีความพยายามอยากเก่งขึ้นเพื่อไม่เป็นภาระให้ใคร รัก Pina (มังกรน้อย) ดั่งครอบครัว',
    loves: [
      'Pina มังกรคู่หูขนนุ่ม และสัตว์เลี้ยงตัวเล็กๆ',
      'การได้รับคำชมอย่างอ่อนโยนและการร่วมผจญภัยอย่างเท่าเทียม',
      'พาร์เฟต์ เค้กสตรอว์เบอร์รี และไอศกรีม',
    ],
    likes: [
      'ดอกไม้สวยๆ และเครื่องประดับริบบิ้น',
      'การเดินตลาดเลือกซื้อของน่ารักด้วยกัน',
      'ชานมอุ่นๆ',
    ],
    dislikes: [
      'การถูกปฏิบัติราวกับเป็นเด็กเล็กจนเกินไป',
      'ป่ามืดและคนหลอกใช้ความไว้ใจ (เช่น Rosalia)',
      'อาหารรสเผ็ดจัดและผักขม',
    ],
    perk: {
      id: 'silica_pina',
      title: 'Pina Field Support (ฟื้นฟู & สอดแนม)',
      shortLabel: 'ให้ Pina ช่วยฟื้นฟู & สอดแนม',
      description:
        'เมื่อคบกับ Silica น้องมังกร Pina จะคอยช่วยฮีลระหว่างเดินทางและบินสำรวจเส้นทางปลอดภัยให้ปาร์ตี้',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'quick_action',
      quickPrompt:
        'ให้ Silica เรียก Pina ออกมาช่วยสอดแนมพื้นที่รอบข้างและใช้ Breath of Healing ฟื้นฟูพลังชีวิตให้คุณ',
    },
  },
  {
    id: 'leafa',
    name: 'Leafa',
    wikiTitle: 'Kirigaya Suguha',
    roleTitle: 'Sylph Speed Blade (Kirigaya Suguha)',
    realWorldSetting: 'Kawagoe — โรงฝึกเคนโด้ & สวนสาธารณะริมแม่น้ำ',
    personality:
      'กระตือรือร้น จริงจังกับการฝึกดาบเคนโด้ อ่อนโยนและห่วงใยคนใกล้ชิดมาก แต่บางครั้งก็เก็บความน้อยใจไว้เงียบๆ',
    loves: [
      'การฝึกซ้อมดาบเคนโด้และการบินเคียงข้างกันบนท้องฟ้า',
      'ความซื่อสัตย์เปิดใจ ไม่มีเรื่องปิดบังต่อกัน',
      'ช่วงเวลาพักผ่อนอบอุ่นหลังซ้อมเหนื่อยๆ',
    ],
    likes: [
      'ขนมญี่ปุ่น ไอศกรีมซอฟต์ครีม และชาเขียว',
      'การเดินเล่นยามเย็น',
      'ความพยายามที่ไม่ยอมถอย',
    ],
    dislikes: [
      'การถูกปิดบังความจริงหรือถูกกันให้อยู่นอกวง',
      'วันที่ฝนตกหนักจนซ้อมกลางแจ้งไม่ได้',
      'ความรู้สึกโดดเดี่ยว',
    ],
    perk: {
      id: 'leafa_kendo',
      title: 'Sylph Vanguard & Kendo Reflex',
      shortLabel: 'ฝึกจังหวะดาบ & บินคุ้มกันกับ Leafa',
      description:
        'ปลดล็อกการซ้อมดาบความเร็วสูงและบทบาทคุ้มกันกลางอากาศร่วมกับ Leafa เสริมความคล่องตัว AGI ในเนื้อเรื่อง',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'quick_action',
      quickPrompt:
        'ขอให้ Leafa ช่วยฝึกทักษะความเร็ว Kendo Reflex และประสานท่าโจมตีเคียงข้างกันเพื่อเพิ่มความคล่องตัวในฉากนี้',
    },
  },
  {
    id: 'yuuki',
    name: 'Yuuki',
    wikiTitle: 'Konno Yuuki',
    roleTitle: 'Absolute Sword (Konno Yuuki)',
    realWorldSetting: 'Yokohama — ดาดฟ้าโรงพยาบาลยามเย็น & สวนสาธารณะริมอ่าว',
    personality:
      'สดใส มองโลกในแง่ดี เปี่ยมไปด้วยพลังชีวิต แม้จะเผชิญโรคร้ายแต่สู้ไม่ถอยและอยากสร้างความทรงจำที่มีความหมายร่วมกับคนที่รัก',
    loves: [
      'การประลองดาบสุดกำลังด้วยรอยยิ้ม',
      'ความทรงจำแสนพิเศษ เช่น ดูพระอาทิตย์ตกหรือไปโรงเรียนด้วยกัน',
      'คนที่มองเธออย่างเท่าเทียม ไม่ใช่ด้วยความสงสาร',
    ],
    likes: [
      'อาหารรสอร่อย เครป และของหวานริมทาง',
      'การเดินทางผจญภัยกับเพื่อนพ้อง (Sleeping Knights)',
      'เสียงหัวเราะและความอบอุ่น',
    ],
    dislikes: [
      'การยอมแพ้ทั้งที่ยังไม่ทันได้ลองสู้',
      'สายตาเวทนาที่มองว่าเธอเปราะบาง',
      'ความเหงาในห้องผู้ป่วยสีขาว',
    ],
    perk: {
      id: 'yuuki_oss',
      title: 'Absolute Sword Sparring (11-Hit OSS)',
      shortLabel: 'ฝึกคอมโบ Mother’s Rosario กับ Yuuki',
      description:
        'เมื่อคบกับ Yuuki เธอจะถ่ายทอดเคล็ดวิชาความเร็วและคอมโบ Original Sword Skill ร่วมต่อสู้เคียงบ่าเคียงไหล่',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'quick_action',
      quickPrompt:
        'ชวน Yuuki ประลองฝีมือเบาๆ และฝึกจังหวะดาบความเร็วสูงระดับ Absolute Sword ร่วมกันเพื่อสร้างความทรงจำและเสริมทักษะการต่อสู้',
    },
  },
  {
    id: 'alice',
    name: 'Alice',
    wikiTitle: 'Alice Zuberg',
    roleTitle: 'Knight Companion (Alice)',
    realWorldSetting: 'Tokyo — สวนพฤกษศาสตร์และคาเฟ่บรรยากาศเงียบสงบยามบ่าย',
    personality:
      'สง่างาม ยึดมั่นในเกียรติยศและความยุติธรรม ปากแข็งเล็กน้อยเวลาหึงหรือห่วงใย มีความอบอุ่นแบบเด็กสาวหมู่บ้านรูลิดซ่อนอยู่',
    loves: [
      'พายน้ำผึ้ง (Honey Pie) และอาหารทำมือกลิ่นอายบ้านเกิด',
      'เกียรติยศของอัศวินและการปกป้องผู้บริสุทธิ์',
      'ดอกไม้สีเหลืองทอง (Osmanthus / Zephyria) และมังกร Amayori',
    ],
    likes: [
      'การฝึกดาบอย่างมีระเบียบวินัย',
      'ชาดอกไม้และความสงบยามบ่าย',
      'คนที่ให้เกียรติเธอในฐานะมนุษย์คนหนึ่งอย่างแท้จริง',
    ],
    dislikes: [
      'ความอยุติธรรมและการดูถูกคุณค่าชีวิต',
      'คนไร้มารยาทหรือไม่รักษาคำพูด',
      'การถูกขังอยู่ในกรอบกฎเกณฑ์ไร้หัวใจ',
    ],
    perk: {
      id: 'alice_sacred',
      title: 'Integrity Knight Sacred Arts Guard',
      shortLabel: 'ขอรับการคุ้มครอง Sacred Arts (Alice)',
      description:
        'เมื่อคบกับ Alice เธอจะใช้เวทศักดิ์สิทธิ์ Fragrant Olive & Sacred Arts ฟื้นฟูและตั้งโล่คุ้มกันในการผจญภัย',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'quick_action',
      quickPrompt:
        'ขอให้ Alice ร่าย Sacred Arts คุ้มกันและตั้งกระบวนท่าดาบอัศวินบูรณภาพเคียงข้างคุณในพื้นที่นี้',
    },
  },
  {
    id: 'argo',
    name: 'Argo',
    wikiTitle: 'Carina',
    roleTitle: 'The Rat — Information Broker',
    realWorldSetting: 'Tokyo — ย่านอากิฮาบาระ ร้านหนังสือ & คาเฟ่ข้อมูลลับ',
    personality:
      'ฉลาดหลักแหลม เจ้าเล่ห์แบบน่ารัก ซื่อสัตย์ต่อคำสัญญาและแหล่งข่าว ชอบแกล้งหยอกคนสนิทและเก่งเรื่องอ่านใจคน',
    loves: [
      'ข้อมูลลับที่ไม่มีใครรู้ และแผนที่ดันเจี้ยนลับ',
      'ชีสเค้กและกาแฟดำใส่น้ำตาล',
      'คู่หูที่ฉลาดทันเกมและรักษาสัจจะ',
    ],
    likes: [
      'เงิน Col และข้อตกลงที่ยุติธรรม',
      'การแอบฟังข่าวลือตามตลาด',
      'คนที่ช่วยดูแลความปลอดภัยให้เธอเงียบๆ',
    ],
    dislikes: [
      'การหักหลังหรือปล่อยข่าวปลอม',
      'พวกบ้าพลังที่แก้ปัญหาด้วยกำปั้นอย่างเดียว',
      'การถามถึงรอยหนวดแมวบนแก้มโดยไม่ได้รับอนุญาต',
    ],
    perk: {
      id: 'argo_intel',
      title: 'ตลาดมืดข่าวสารลับของ Argo (-20%)',
      shortLabel: 'เปิดร้านข่าวสารลับ Argo (-20%)',
      description:
        'ปลดล็อกร้านค้าข้อมูลลับ แผนที่จุดซ่อนบอส และอุปกรณ์หลบหลีกกับดักจาก Argo ได้ทันทีทุกเซฟ',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'shop',
      shopTemplate: {
        shop_name: "Argo's Secret Intel Market (-20% Col)",
        shopkeeper: 'Argo',
        currency: 'Col',
        items: [
          {
            name: 'Floor Boss Strategy Guide',
            description: 'เอกสารข่าวกรองลับของ Argo เผยแพทเทิร์นและจุดอ่อนบอสประจำชั้น',
            price: 200,
            stock: 2,
            category: 'special',
          },
          {
            name: 'Shadow Mist Cloak',
            description: 'ผ้าคลุมพรางตัวสำหรับสายสอดแนม ลดความเสี่ยงโดนตรวจจับและช่วยหลบหนี',
            price: 320,
            stock: 1,
            category: 'equipment',
          },
          {
            name: 'Trap Disarm Toolkit',
            description: 'ชุดเครื่องมือปลดกับดักและเปิดหีบสมบัติลับในเขาวงกต',
            price: 140,
            stock: 3,
            category: 'consumable',
          },
        ],
      },
    },
  },
  {
    id: 'sachi',
    name: 'Sachi',
    wikiTitle: 'Sachi',
    roleTitle: 'Moonlit Black Cats Lancer',
    realWorldSetting: 'Tokyo — ชมรมคอมพิวเตอร์ & คาเฟ่เงียบสงบยามเย็น',
    personality:
      'อ่อนโยน ขี้อาย แต่ห่วงใยคนรอบข้างเสมอ มักกังวลกับอันตรายแต่ถ้ามีคนจับมือปลอบประโลม เธอจะกล้าหาญขึ้นอย่างน่าประหลาดใจ',
    loves: [
      'บทสนทนาที่อ่อนโยนและคำสัญญาว่าจะไม่ทิ้งกัน',
      'เสียงเพลงบรรเลงเบาๆ และแสงเทียนอุ่น',
      'ดอกไม้สีขาวและวันที่ปลอดภัย',
    ],
    likes: [
      'ชาร้อนและขนมปังนุ่มๆ',
      'การใช้เวลาร่วมกันในเมืองปลอดภัย',
      'การฝึกประสานท่าหอกแบบระมัดระวัง',
    ],
    dislikes: [
      'ดันเจี้ยนมืดทึบและการถูกทิ้งให้อยู่คนเดียว',
      'ความตายและการสูญเสียเพื่อนพ้อง',
      'ความกดดันที่ต้องแสร้งว่าไม่กลัว',
    ],
    perk: {
      id: 'sachi_ward',
      title: 'Moonlit Guardian Ward',
      shortLabel: 'ใช้สายใยเตือนภัย & คุ้มกันกับ Sachi',
      description:
        'เมื่อปกป้องและคบหากับ Sachi ได้สำเร็จ เธอจะคอยระวังหลัง เตือนภัยกับดัก และช่วยให้ผ่านเหตุการณ์อันตรายอย่างปลอดภัย',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'quick_action',
      quickPrompt:
        'ให้ Sachi ช่วยตรวจระวังกับดักรอบข้างและเดินประสานเคียงข้างกันอย่างระมัดระวังเพื่อความปลอดภัยสูงสุด',
    },
  },
  {
    id: 'philia',
    name: 'Philia',
    wikiTitle: 'Takemiya Kotone',
    roleTitle: 'Treasure Hunter (Takemiya Kotone)',
    realWorldSetting: 'Tokyo — ย่านช้อปปิ้งและพิพิธภัณฑ์อัญมณี',
    personality:
      'ร่าเริง กล้าเสี่ยง ชอบล่าสมบัติและอัญมณี มีอารมณ์ขัน แต่เคยหวาดกลัวการถูกทิ้งไว้ลำพังในเขตต้องห้าม',
    loves: [
      'การล่าสมบัติในพื้นที่ลับกับคู่หูที่ไว้ใจได้',
      'อัญมณีหายากและอุปกรณ์ประเมินไอเทม',
      'ช่วงเวลาที่รู้ว่ามีคนอยู่เคียงข้างเสมอ',
    ],
    likes: [
      'มีดสั้นคล่องตัวและแผนที่เก่า',
      'น้ำผลไม้เย็นๆ และร้านเครื่องประดับ',
      'การไขปริศนาโบราณสถาน',
    ],
    dislikes: [
      'กิลด์ PK (Laughing Coffin) และการทรยศ',
      'การถูกขังไว้ในเขตอันตรายเพียงลำพัง',
      'กับดักพิษในหีบสมบัติ',
    ],
    perk: {
      id: 'philia_vault',
      title: 'คลังสมบัติลับนักล่าขุมทรัพย์ (Philia -20%)',
      shortLabel: 'เปิดคลังสมบัติ Philia (-20%)',
      description:
        'ปลดล็อกคลังไอเทมหายาก เครื่องราง LUK และมีดสั้นล่าสมบัติที่ Philia ค้นพบมาแบ่งให้คนรัก',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'shop',
      shopTemplate: {
        shop_name: "Philia's Treasure Vault (-20% Col)",
        shopkeeper: 'Philia',
        currency: 'Col',
        items: [
          {
            name: 'Lucky Gem Pendant',
            description: 'จี้อัญมณีนำโชคที่ Philia ค้นพบ เสริมโชค LUK และการหลบหลีก',
            price: 280,
            stock: 1,
            category: 'equipment',
          },
          {
            name: 'Ancient Relic Appraisal Scroll',
            description: 'ม้วนคัมภีร์ประเมินสมบัติ ช่วยเปิดเผยค่าพลังลับของไอเทมที่พบ',
            price: 150,
            stock: 3,
            category: 'special',
          },
        ],
      },
    },
  },
  {
    id: 'kirito',
    name: 'Kirito',
    wikiTitle: 'Kirigaya Kazuto',
    roleTitle: 'The Black Swordsman (Kirigaya Kazuto)',
    realWorldSetting: 'Tokyo — ร้าน Dicey Cafe ของ Agil & ร้านอุปกรณ์คอมพิวเตอร์อากิฮาบาระ',
    personality:
      'ภายนอกดูเก็บตัวและแบกรับทุกอย่างไว้คนเดียว แต่จริงใจ อบอุ่น รักพวกพ้องเหนือสิ่งอื่นใด และเป็นอัจฉริยะด้านดาบและเทคโนโลยี VR',
    loves: [
      'ช่วงเวลาสงบที่ไม่ต้องแบกชีวิตทุกคนไว้บนบ่าคนเดียว',
      'เทคโนโลยี FullDive, การประกอบคอมพิวเตอร์ และดาบคู่ใจ',
      'คนที่ยืนเคียงข้างและไม่ปล่อยให้เขาโดดเดี่ยว',
    ],
    likes: [
      'แซนด์วิชรสเผ็ด ชา และอาหารรสมือคนที่ห่วงใย',
      'การลอง Sword Skill ใหม่ๆ',
      'กาแฟที่ร้าน Dicey Cafe',
    ],
    dislikes: [
      'คนที่เห็นชีวิตผู้เล่นเป็นเพียงตัวเลข',
      'การสูญเสียเพื่อนร่วมทีม',
      'อาหารรสหวานเลี่ยนจนเกินไป',
    ],
    perk: {
      id: 'kirito_switch',
      title: 'Black Swordsman Switch Mastery',
      shortLabel: 'ประสานท่า Switch คู่กับ Kirito',
      description:
        'เมื่อคบหากับ Kirito เขาจะคอยประกบหน้าและประสานท่า Switch ความเร็วสูงสุดให้คุณในทุกจังหวะสำคัญ',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'quick_action',
      quickPrompt:
        'ส่งสัญญาณ "Switch!" ประสานท่า Sword Skill ต่อเนื่องร่วมกับ Kirito เพื่อทะลายจุดอ่อนศัตรูตรงหน้า',
    },
  },
  {
    id: 'eugeo',
    name: 'Eugeo',
    wikiTitle: 'Eugeo',
    roleTitle: 'Blue Rose Swordsman',
    realWorldSetting: 'Tokyo — สวนพฤกษศาสตร์และคาเฟ่บรรยากาศอบอุ่น',
    personality:
      'อ่อนโยน ซื่อสัตย์ สุภาพ มีหัวใจที่มั่นคงดั่งต้นไม้ใหญ่และพร้อมก้าวข้ามขีดจำกัดเพื่อปกป้องคนที่รัก',
    loves: [
      'ดอกกุหลาบสีน้ำเงินและธรรมชาติที่เงียบสงบ',
      'อาหารและขนมทำเองง่ายๆ (พายผลไม้/แซนด์วิช)',
      'คำสัญญาที่รักษาไว้ร่วมกับคนสำคัญ',
    ],
    likes: [
      'การดูแลดาบ Blue Rose Sword และการฝึกดาบสไตล์ Aincrad',
      'บทสนทนาจริงใจท่ามกลางแสงแดดยามบ่าย',
      'ชามินต์และน้ำผลไม้สด',
    ],
    dislikes: [
      'การใช้อำนาจกดขี่ข่มเหงผู้อื่น',
      'ความรู้สึกไร้พลังเมื่อปกป้องคนสำคัญไม่ได้',
      'การสูญเสียความทรงจำและตัวตน',
    ],
    perk: {
      id: 'eugeo_bluerose',
      title: 'Blue Rose Ice Guard',
      shortLabel: 'ขอกำแพงน้ำแข็ง Blue Rose (Eugeo)',
      description:
        'เมื่อคบกับ Eugeo เขาจะใช้พลังของดาบกุหลาบน้ำเงินสร้างเกราะน้ำแข็งตรึงศัตรูและคุ้มกันคุณ',
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'quick_action',
      quickPrompt:
        'ขอให้ Eugeo ปลดปล่อยความเย็นจากดาบ Blue Rose เพื่อชะลอศัตรูและกางม่านน้ำแข็งคุ้มกันให้คุณ',
    },
  },
]

const NAME_ALIAS_MAP: Record<string, string> = {
  rika: 'lisbeth',
  'shinozaki rika': 'lisbeth',
  'rika shinozaki': 'lisbeth',
  ริสเบธ: 'lisbeth',
  'yuuki asuna': 'asuna',
  'asuna yuuki': 'asuna',
  อาสึนะ: 'asuna',
  'asada shino': 'sinon',
  'shino asada': 'sinon',
  shino: 'sinon',
  ชินอน: 'sinon',
  'ayano keiko': 'silica',
  'keiko ayano': 'silica',
  keiko: 'silica',
  ซิลิก้า: 'silica',
  'kirigaya suguha': 'leafa',
  'suguha kirigaya': 'leafa',
  suguha: 'leafa',
  ลีฟา: 'leafa',
  'konno yuuki': 'yuuki',
  'yuuki konno': 'yuuki',
  ยูกิ: 'yuuki',
  'alice zuberg': 'alice',
  'alice synthesis thirty': 'alice',
  อลิซ: 'alice',
  carina: 'argo',
  อาร์โก: 'argo',
  ซาจิ: 'sachi',
  'takemiya kotone': 'philia',
  'kotone takemiya': 'philia',
  kotone: 'philia',
  ฟีเลีย: 'philia',
  'kirigaya kazuto': 'kirito',
  'kazuto kirigaya': 'kirito',
  kazuto: 'kirito',
  คิริโตะ: 'kirito',
  ยูจิโอ: 'eugeo',
}

export function findRomancePreset(nameOrTitle: string): RomanceCharacterProfile | undefined {
  const clean = nameOrTitle.trim().toLowerCase().replace(/\s*\(.*?\)\s*/g, '')
  if (!clean) return undefined
  const direct = ROMANCE_ROSTER.find(
    (c) =>
      c.id === clean ||
      c.name.toLowerCase() === clean ||
      c.wikiTitle.toLowerCase() === clean
  )
  if (direct) return direct

  const aliasId = NAME_ALIAS_MAP[clean]
  if (aliasId) return ROMANCE_ROSTER.find((c) => c.id === aliasId)

  for (const [alias, id] of Object.entries(NAME_ALIAS_MAP)) {
    if (clean.includes(alias)) {
      return ROMANCE_ROSTER.find((c) => c.id === id)
    }
  }
  return undefined
}

export function createCustomWikiCharacterPreset(
  entry: WikiLoreEntry,
  fallbackName?: string
): RomanceCharacterProfile {
  const displayName = entry.title.replace(/\s*\(.*?\)\s*/g, '').trim() || fallbackName?.trim() || 'SAO Companion'
  return {
    id: `wiki-${entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: displayName,
    wikiTitle: entry.title,
    roleTitle: 'SAO Fandom Wiki Companion',
    realWorldSetting: 'Tokyo — ย่านคาเฟ่และสวนสาธารณะใกล้บ้าน (Pre-Game Encounter)',
    personality:
      entry.summary || `ตัวละครจากฐานข้อมูล Sword Art Online Fandom Wiki (${entry.title})`,
    loves: [
      `ความจริงใจและการใช้เวลาทำความรู้จักตัวตนของ ${displayName}`,
      'การร่วมผจญภัยและแบ่งปันเรื่องราวที่ชอบตรงตามเนื้อเรื่อง Wiki',
    ],
    likes: [
      'ของขวัญที่สื่อถึงความใส่ใจและขนม/เครื่องดื่มอุ่นๆ',
      'บทสนทนาที่เป็นมิตรและไม่ฝืนบังคับ',
    ],
    dislikes: [
      'การดูถูกคนสำคัญหรือการโกหกหลอกลวง',
      'ท่าทีหยาบคายและไม่เคารพขอบเขต',
    ],
    wikiExcerpt: entry.summary,
    thumbnailUrl: entry.thumbnailUrl,
    perk: {
      id: `wiki_bond_${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      title: `สายใยคู่หูพิเศษของ ${displayName} (Partner Assist)`,
      shortLabel: `ขอความช่วยเหลือพิเศษจาก ${displayName}`,
      description: `เมื่อคบหากับ ${displayName} แล้ว สามารถเรียกใช้ความสามารถเฉพาะตัวตามประวัติใน SAO Wiki เพื่อช่วยสนับสนุนการผจญภัยได้ในทุกเซฟ`,
      unlockAffection: PERK_UNLOCK_AFFECTION,
      actionType: 'quick_action',
      quickPrompt: `ขอให้ ${displayName} (ในฐานะคนรัก/คู่หูจากความสัมพันธ์พิเศษ) ใช้ความสามารถเฉพาะตัวตามข้อมูลในเรื่องช่วยเหลือคุณในสถานการณ์ปัจจุบัน`,
    },
  }
}

export interface ResolvedCompanionPerk {
  unlocked: boolean
  requiredAffection: number
  perk: CompanionPerkDefinition
}

export function isPerkUnlockedForCharacter(char: CharacterState): boolean {
  const lowerTier = (char.relationship_tier || '').toLowerCase()
  return (
    char.is_married ||
    char.affection >= PERK_UNLOCK_AFFECTION ||
    lowerTier.includes('romantic') ||
    lowerTier.includes('dating') ||
    lowerTier.includes('lover') ||
    lowerTier.includes('married')
  )
}

export function resolveCompanionPerk(
  char: CharacterState,
  overrideTarget?: RomanceCharacterProfile | null
): ResolvedCompanionPerk | null {
  const matchedOverride =
    overrideTarget &&
    overrideTarget.name.toLowerCase() === char.name.trim().toLowerCase()
      ? overrideTarget
      : undefined
  const preset = matchedOverride ?? findRomancePreset(char.name)
  if (!preset) return null

  return {
    unlocked: isPerkUnlockedForCharacter(char),
    requiredAffection: preset.perk.unlockAffection,
    perk: preset.perk,
  }
}

export function clonePerkShopWithDiscount(shop: ShopState, discountRatio = 0.2): ShopState {
  return {
    ...shop,
    items: shop.items.map((item) => ({
      ...item,
      price: Math.max(10, Math.round(item.price * (1 - discountRatio))),
    })),
  }
}
