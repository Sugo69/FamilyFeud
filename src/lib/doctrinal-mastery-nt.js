// NT Doctrinal Mastery passages — 25 official passages for Seminary 2026-27.
// Source: NT Seminary Teacher Manual appendix + churchofjesuschrist.org/study/
//         manual/new-testament-seminary-teacher-manual/doctrinal-mastery
//
// Each entry has:
//   ref        — canonical scripture reference
//   text       — full KJV text as it appears in the standard works
//   keyPhrase  — the short phrase teachers ask students to memorise first
//   theme      — doctrinal category (matches Church DM programme categories)
//   lesson     — seminary lesson slug where this passage is the DM focus
//   dmId       — sequential ID (dm-nt-01 … dm-nt-25) — stable key for Firestore

export const NT_DM_PASSAGES = [
  {
    dmId: 'dm-nt-01',
    ref: 'Matthew 5:14–16',
    text: 'Ye are the light of the world. A city that is set on an hill cannot be hid. Neither do men light a candle, and put it under a bushel, but on a candlestick; and it giveth light unto all that are in the house. Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.',
    keyPhrase: 'Let your light so shine before men',
    theme: 'Living the Gospel',
    lesson: '009',
  },
  {
    dmId: 'dm-nt-02',
    ref: 'Matthew 6:24',
    text: 'No man can serve two masters: for either he will hate the one, and love the other; or else he will hold to the one, and despise the other. Ye cannot serve God and mammon.',
    keyPhrase: 'No man can serve two masters',
    theme: 'Obedience and Sacrifice',
    lesson: '011',
  },
  {
    dmId: 'dm-nt-03',
    ref: 'Matthew 6:33',
    text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.',
    keyPhrase: 'Seek ye first the kingdom of God',
    theme: 'Obedience and Sacrifice',
    lesson: '011',
  },
  {
    dmId: 'dm-nt-04',
    ref: 'Matthew 16:15–19',
    text: 'He saith unto them, But whom say ye that I am? And Simon Peter answered and said, Thou art the Christ, the Son of the living God. And Jesus answered and said unto him, Blessed art thou, Simon Bar-jona: for flesh and blood hath not revealed it unto thee, but my Father which is in heaven. And I say also unto thee, That thou art Peter, and upon this rock I will build my church; and the gates of hell shall not prevail against it. And I will give unto thee the keys of the kingdom of heaven: and whatsoever thou shalt bind on earth shall be bound in heaven: and whatsoever thou shalt loose on earth shall be loosed in heaven.',
    keyPhrase: 'Thou art the Christ, the Son of the living God',
    theme: 'Prophets and Revelation',
    lesson: '019',
  },
  {
    dmId: 'dm-nt-05',
    ref: 'Matthew 28:19–20',
    text: 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.',
    keyPhrase: 'Go ye therefore, and teach all nations',
    theme: 'Missionary Work',
    lesson: '033',
  },
  {
    dmId: 'dm-nt-06',
    ref: 'John 1:1–3, 14',
    text: 'In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made. … And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.',
    keyPhrase: 'The Word was made flesh, and dwelt among us',
    theme: 'Godhead',
    lesson: '060',
  },
  {
    dmId: 'dm-nt-07',
    ref: 'John 3:5',
    text: 'Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.',
    keyPhrase: 'Born of water and of the Spirit',
    theme: 'Ordinances and Covenants',
    lesson: '062',
  },
  {
    dmId: 'dm-nt-08',
    ref: 'John 5:28–29',
    text: 'Marvel not at this: for the hour is coming, in the which all that are in the graves shall hear his voice, And shall come forth; they that have done good, unto the resurrection of life; and they that have done evil, unto the resurrection of damnation.',
    keyPhrase: 'All that are in the graves shall hear his voice',
    theme: 'Plan of Salvation',
    lesson: '064',
  },
  {
    dmId: 'dm-nt-09',
    ref: 'John 7:17',
    text: 'If any man will do his will, he shall know of the doctrine, whether it be of God, or whether I speak of myself.',
    keyPhrase: 'If any man will do his will, he shall know',
    theme: 'Prophets and Revelation',
    lesson: '066',
  },
  {
    dmId: 'dm-nt-10',
    ref: 'John 14:15',
    text: 'If ye love me, keep my commandments.',
    keyPhrase: 'If ye love me, keep my commandments',
    theme: 'Obedience and Sacrifice',
    lesson: '074',
  },
  {
    dmId: 'dm-nt-11',
    ref: 'John 17:3',
    text: 'And this is life eternal, that they might know thee the only true God, and Jesus Christ, whom thou hast sent.',
    keyPhrase: 'This is life eternal, that they might know thee',
    theme: 'Godhead',
    lesson: '077',
  },
  {
    dmId: 'dm-nt-12',
    ref: 'Acts 7:55–56',
    text: 'But he, being full of the Holy Ghost, looked up stedfastly into heaven, and saw the glory of God, and Jesus standing on the right hand of God, And said, Behold, I see the heavens opened, and the Son of man standing on the right hand of God.',
    keyPhrase: 'The Son of man standing on the right hand of God',
    theme: 'Godhead',
    lesson: '086',
  },
  {
    dmId: 'dm-nt-13',
    ref: 'Romans 1:16',
    text: 'For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth; to the Jew first, and also to the Greek.',
    keyPhrase: 'I am not ashamed of the gospel of Christ',
    theme: 'Missionary Work',
    lesson: '099',
  },
  {
    dmId: 'dm-nt-14',
    ref: '1 Corinthians 6:19–20',
    text: 'What? know ye not that your body is the temple of the Holy Ghost which is in you, which ye have of God, and ye are not your own? For ye are bought with a price: therefore glorify God in your body, and in your spirit, which are God\'s.',
    keyPhrase: 'Your body is the temple of the Holy Ghost',
    theme: 'Living the Gospel',
    lesson: '105',
  },
  {
    dmId: 'dm-nt-15',
    ref: '1 Corinthians 10:13',
    text: 'There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it.',
    keyPhrase: 'God … will with the temptation also make a way to escape',
    theme: 'Living the Gospel',
    lesson: '107',
  },
  {
    dmId: 'dm-nt-16',
    ref: '1 Corinthians 15:20–22',
    text: 'But now is Christ risen from the dead, and become the firstfruits of them that slept. For since by man came death, by man came also the resurrection of the dead. For as in Adam all die, even so in Christ shall all be made alive.',
    keyPhrase: 'As in Adam all die, even so in Christ shall all be made alive',
    theme: 'Plan of Salvation',
    lesson: '111',
  },
  {
    dmId: 'dm-nt-17',
    ref: '1 Corinthians 15:29',
    text: 'Else what shall they do which are baptized for the dead, if the dead rise not at all? why are they then baptized for the dead?',
    keyPhrase: 'Baptized for the dead',
    theme: 'Ordinances and Covenants',
    lesson: '111',
  },
  {
    dmId: 'dm-nt-18',
    ref: 'Galatians 5:22–23',
    text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.',
    keyPhrase: 'The fruit of the Spirit is love, joy, peace',
    theme: 'Living the Gospel',
    lesson: '119',
  },
  {
    dmId: 'dm-nt-19',
    ref: 'Ephesians 4:11–14',
    text: 'And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers; For the perfecting of the saints, for the work of the ministry, for the edifying of the body of Christ: Till we all come in the unity of the faith, and of the knowledge of the Son of God, unto a perfect man, unto the measure of the stature of the fulness of Christ: That we henceforth be no more children, tossed to and fro, and carried about with every wind of doctrine, by the sleight of men, and cunning craftiness, whereby they lie in wait to deceive.',
    keyPhrase: 'He gave some, apostles; and some, prophets',
    theme: 'Apostasy and Restoration',
    lesson: '122',
  },
  {
    dmId: 'dm-nt-20',
    ref: 'Philippians 4:7',
    text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
    keyPhrase: 'The peace of God, which passeth all understanding',
    theme: 'Living the Gospel',
    lesson: '125',
  },
  {
    dmId: 'dm-nt-21',
    ref: '2 Thessalonians 2:1–3',
    text: 'Now we beseech you, brethren, by the coming of our Lord Jesus Christ, and by our gathering together unto him, That ye be not soon shaken in mind, or be troubled, neither by spirit, nor by word, nor by letter as from us, as that the day of Christ is at hand. Let no man deceive you by any means: for that day shall not come, except there come a falling away first, and that man of sin be revealed, the son of perdition.',
    keyPhrase: 'That day shall not come, except there come a falling away first',
    theme: 'Apostasy and Restoration',
    lesson: '129',
  },
  {
    dmId: 'dm-nt-22',
    ref: '1 Timothy 4:12',
    text: 'Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity.',
    keyPhrase: 'Let no man despise thy youth; but be thou an example',
    theme: 'Living the Gospel',
    lesson: '130',
  },
  {
    dmId: 'dm-nt-23',
    ref: '2 Timothy 3:15–17',
    text: 'And that from a child thou hast known the holy scriptures, which are able to make thee wise unto salvation through faith which is in Christ Jesus. All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness: That the man of God may be perfect, throughly furnished unto all good works.',
    keyPhrase: 'All scripture is given by inspiration of God',
    theme: 'Prophets and Revelation',
    lesson: '132',
  },
  {
    dmId: 'dm-nt-24',
    ref: 'Hebrews 5:4',
    text: 'And no man taketh this honour unto himself, but he that is called of God, as was Aaron.',
    keyPhrase: 'No man taketh this honour unto himself, but he that is called of God',
    theme: 'Priesthood and Priesthood Keys',
    lesson: '136',
  },
  {
    dmId: 'dm-nt-25',
    ref: 'Revelation 20:12–13',
    text: 'And I saw the dead, small and great, stand before God; and the books were opened: and another book was opened, which is the book of life: and the dead were judged out of those things which were written in the books, according to their works. And the sea gave up the dead which were in it; and death and hell delivered up the dead which were in them: and they were judged every man according to their works.',
    keyPhrase: 'The dead were judged … according to their works',
    theme: 'Plan of Salvation',
    lesson: '159',
  },
];

// Look up a passage by its dmId ('dm-nt-01' … 'dm-nt-25')
export function getDmPassageById(dmId) {
  return NT_DM_PASSAGES.find(p => p.dmId === dmId) || null;
}

// All passages for a given doctrinal theme
export function getDmPassagesByTheme(theme) {
  return NT_DM_PASSAGES.filter(p => p.theme === theme);
}

// The passage studied in a given seminary lesson slug ('009', '011', …)
// Returns array because two passages share lesson 011 and lesson 111.
export function getDmPassagesForLesson(lessonSlug) {
  return NT_DM_PASSAGES.filter(p => p.lesson === lessonSlug);
}

// All unique doctrinal themes (for a picker UI)
export const DM_THEMES = [...new Set(NT_DM_PASSAGES.map(p => p.theme))];
