/**
 * Legal aid content: accessible interpretation of Zimbabwean law
 * in English, ChiShona, and IsiNdebele (official languages).
 * This is general guidance, not legal advice or an official statutory translation.
 */

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'sn', name: 'Shona', nativeName: 'ChiShona' },
  { code: 'nd', name: 'IsiNdebele', nativeName: 'IsiNdebele' },
];

const translations = {
  en: {
    pageTitle: 'Legal Aid – Zimbabwe',
    languageLabel: 'Choose language',
    languageHint: 'Legal guidance is available in English, ChiShona, and IsiNdebele so that more people can understand their options.',
    intro:
      'The following is general guidance based on Zimbabwean law. It is not legal advice. For your situation, consult a lawyer or legal aid organisation.',
    generalStepsTitle: 'General steps',
    relevanceLabel: 'Relevance',
    legalRouteTitle: 'Steps for legal route',
    relevantSectionsTitle: 'Relevant sections',
    generalSteps: [
      '1. Your safety first: If you are in immediate danger, contact police or campus security.',
      '2. Preserve evidence: Save messages, emails, notes, and any recordings if legally obtained. This system stores your report with a timestamp.',
      '3. Seek support: Use campus counselling or a trusted person. This system can trigger academic accommodation alerts for higher-severity reports.',
      '4. Decide on reporting: You can report to the institution, police, or both. This platform does not replace official reporting but can help you document and understand options.',
      '5. Legal aid: Organisations such as Zimbabwe Lawyers for Human Rights (ZLHR), Legal Resources Foundation (LRF), or university legal clinics may offer advice or representation.',
    ],
    acts: [
      {
        name: 'Criminal Law (Codification and Reform) Act [Chapter 9:23]',
        shortName: 'Criminal Code',
        relevance: 'Sexual offences that may amount to crimes (e.g. rape, indecent assault)',
        steps: [
          'Report to the police: You can make a report at any police station. Ask for a reference number.',
          'Medical examination: If there was physical contact or assault, a medical examination can support evidence. This can be done at a hospital or clinic.',
          'Statement: You may be asked to give a written statement. You have the right to have a trusted person or legal representative present if possible.',
          'Investigation: Police will investigate. You can ask for updates and for information on victim support.',
          'Prosecution: If there is sufficient evidence, the case may be referred to the National Prosecuting Authority. Offences under the Code (e.g. Sections 65–71) are tried in the criminal courts.',
          'Court: If the case goes to court, you may be called as a witness. Victim support services may be available.',
        ],
        sections: [
          'Section 65: Rape',
          'Section 66: Aggravated indecent assault',
          'Section 67: Indecent assault',
          'Section 68: Unavailable defences to sections 65, 66, 67',
          'Section 69: Consent',
          'Section 70: Adolescents',
          'Section 71: Sexual crimes against young or mentally incompetent persons',
        ],
      },
      {
        name: 'Labour Act [Chapter 28:01] – Section 8(h)',
        shortName: 'Labour Act',
        relevance: 'Sexual harassment as unfair labour practice (e.g. harassment by staff, or in workplace/placement)',
        steps: [
          'Report internally: Report to your institution’s designated officer, human resources, or anti-harassment committee as per your institution’s policy.',
          'Document: Keep records of what happened, when, where, and any witnesses or evidence (messages, emails). This system can serve as a timestamped record if you submitted a report.',
          'Cessation: The employer/institution should stop the unfair practice (e.g. remove the harasser from contact with you where possible).',
          'Compensation: Courts may award compensation. Factors include: nature and seriousness of the conduct, duration, power dynamics, age difference, pattern of behaviour, and impact on you (see e.g. Batha v Zizhou & Another HH 675-21).',
          'Criminal sanction: Sexual harassment can also lead to criminal proceedings where the conduct amounts to a criminal offence.',
        ],
        sections: [
          'Section 8(h): Sexual harassment defined as unfair labour practice',
        ],
      },
    ],
  },
  sn: {
    pageTitle: 'Rubatsiro rweMutemo – Zimbabwe',
    languageLabel: 'Sarudza mutauro',
    languageHint: 'Nhungamiro yemutemo iripo muChirungu, ChiShona, neIsiNdebele kuti vanhu vakawanda vanzwisise kodzero dzavo.',
    intro:
      'Zvinotevera ndezvinhungamiro zvichibva pamutemo weZimbabwe. Hazvisi zano remutemo. Panyaya yako, bvunza gweta kana sangano rinopa rubatsiro rwemutemo.',
    generalStepsTitle: 'Matanho akajairika',
    relevanceLabel: 'Kukosha',
    legalRouteTitle: 'Matanho enzira yemutemo',
    relevantSectionsTitle: 'Zvikamu zvine chekuita',
    generalSteps: [
      '1. Kuchengetedzwa kwako kutanga: Kana uri panjodzi inokurumidza, daidza mapurisa kana vachengetedzi vekampasi.',
      '2. Chengetedza humbowo: Chengeta mameseji, maemail, zvinyorwa, uye zvakarekodhwa kana zvakatorwa zviri pamutemo. Hurongwa uhwu hunochengeta chirevo chako nenguva yacho.',
      '3. Tsvaga rubatsiro: Shandisa counselling yekampasi kana munhu waunovimba naye. Hurongwa uhwu hunogona kutumira zviziviso zvekubatsirwa muzvidzidzo kana nyaya yakakomba.',
      '4. Sarudza nezvekuzivisa: Unogona kuzivisa kune sangano, mapurisa, kana vose. Hurongwa uhwu hahutsivi kuzivisa kwepamutemo asi hunokubatsira kunyora uye kunzwisisa sarudzo dzako.',
      '5. Rubatsiro rwemutemo: Masangano seZimbabwe Lawyers for Human Rights (ZLHR), Legal Resources Foundation (LRF), kana zvikoro zvemutemo pazvikoro zvinogona kupa zano kana kumiririra.',
    ],
    acts: [
      {
        name: 'Mutemo weMhosva (Kubatanidzwa nekugadzirisa) [Chitsauko 9:23]',
        shortName: 'Criminal Code',
        relevance: 'Mhosva dzepabonde dzinogona kuva mhosva (semuenzaniso chibharo, kubatwa zvisina tsika)',
        steps: [
          'Zivisa mapurisa: Unogona kutaura pachiteshi chemapurisa chipi nechipi. Kumbira nhamba yereferenzi.',
          'Kuongororwa kwekurapa: Kana pakaita kubatana kwemuviri kana kurohwa, kuongororwa kwekurapa kunogona kutsigira humbowo. Izvi zvinogona kuitwa kuchipatara kana kiriniki.',
          'Chirevo: Unogona kukumbirwa kunyora chirevo. Une kodzero yekuva nemunhu waunovimba naye kana gweta rako kana zvichikwanisika.',
          'Kuferefeta: Mapurisa anoongorora nyaya. Unogona kukumbira ruzivo rwemashandiro uye rubatsiro kune vakaurayiwa.',
          'Kutongwa: Kana paine humbowo hwakakwana, nyaya inogona kutumirwa kuNational Prosecuting Authority. Mhosva dziri paCode (semuenzaniso Zvikamu 65–71) dzinotongwa mumatare emhosva.',
          'Dare: Kana nyaya ikaenda kudare, unogona kudanwa sechapupu. Rubatsiro kune vakaurayiwa runogona kuwanikwa.',
        ],
        sections: [
          'Chikamu 65: Chibharo',
          'Chikamu 66: Kubatwa zvisina tsika zvakanyanya',
          'Chikamu 67: Kubatwa zvisina tsika',
          'Chikamu 68: Zvidziviriro zvisingashandiswe pazvikamu 65, 66, 67',
          'Chikamu 69: Mvumo',
          'Chikamu 70: Vechidiki',
          'Chikamu 71: Mhosva dzepabonde kune vechidiki kana vanhu vane dambudziko repfungwa',
        ],
      },
      {
        name: 'Mutemo weVashandi [Chitsauko 28:01] – Chikamu 8(h)',
        shortName: 'Labour Act',
        relevance: 'Kushungurudzwa pabonde sechiitiko chebasa chisina ururami (semuenzaniso kushungurudzwa nevashandi, kana pabasa/placement)',
        steps: [
          'Zivisa mukati: Zivisa kune mukuru akasarudzwa, human resources, kana komiti inorwisa kushungurudzwa maererano nemutemo wesangano rako.',
          'Nyora: Chengeta zvinyorwa zvezvakaitika, nguva, nzvimbo, uye zvapupu kana humbowo (mameseji, maemail). Hurongwa uhwu hunogona kushanda sechinyorwa chine nguva kana wakaendesa chirevo.',
          'Kumisa: Mushandirwi/sangano rinofanira kumisa chiitiko chisina ururami (semuenzaniso kubvisa mushungurudzi kuti asabatane newe kana zvichikwanisika).',
          'Muripo: Matare anogona kupa muripo. Zvinorangarirwa zvinosanganisira: hunhu nehukuru hwechiitiko, nguva, masimba, musiyano wezera, tsika inodzokororwa, uye kukanganisa kwazvakakukonzera (ona muenzaniso Batha v Zizhou & Another HH 675-21).',
          'Chirango chehutsotsi: Kushungurudzwa pabonde kunogona zvakare kutungamirira kumatare emhosva kana chiitiko chacho chiri mhosva.',
        ],
        sections: [
          'Chikamu 8(h): Kushungurudzwa pabonde kunotsanangurwa sechiitiko chebasa chisina ururami',
        ],
      },
    ],
  },
  nd: {
    pageTitle: 'Usizo Lomthetho – Zimbabwe',
    languageLabel: 'Khetha ulimi',
    languageHint: 'Isiqondiso somthetho siyatholakala ngesiNgisi, ngesiShona, nangeSiNdebele ukuze abantu abanengi baqonde amalungelo abo.',
    intro:
      'Okulandelayo kuyisiqondiso esijwayelekile esisekelwe emthethweni weZimbabwe. Akusona iseluleko somthetho. Ngendaba yakho, thintana nommeli noma inhlangano enikeza usizo lomthetho.',
    generalStepsTitle: 'Izinyathelo ezivamile',
    relevanceLabel: 'Ukubaluleka',
    legalRouteTitle: 'Izinyathelo zendlela yomthetho',
    relevantSectionsTitle: 'Izigaba ezifanele',
    generalSteps: [
      '1. Ukuphepha kwakho kuqala: Uma usesengozini eseduze, thintana namaphoyisa noma ukuvikeleka kwekhempasi.',
      '2. Londoloza ubufakazi: Gcina imilayezo, ama-imeyili, amanothi, kanye nokurekhodiwe uma kuthathwe ngokomthetho. Lolu hlelo lugcina umbiko wakho lenkathi yawo.',
      '3. Funela usizo: Sebenzisa ukwelulekwa kwekhempasi noma umuntu othembekileyo. Lolu hlelo lungathumela izaziso zokuncediswa ezifundweni uma umbiko unzima kakhulu.',
      '4. Nquma ngokubika: Ungabika esikhungweni, emaphoyiseni, noma kokubili. Lolu hlelo aluthathi indawo yokubika ngokomthetho kodwa luyakusiza ukubhala nokuqonda izinketho.',
      '5. Usizo lomthetho: Izinhlangano ezifana neZimbabwe Lawyers for Human Rights (ZLHR), Legal Resources Foundation (LRF), noma imitholampilo yomthetho emanyuvesi zingaluleka noma zimelile.',
    ],
    acts: [
      {
        name: 'Umthetho Wobugebengu (Ukuhlanganiswa nokuguqulwa) [Isahluko 9:23]',
        shortName: 'Criminal Code',
        relevance: 'Amacala ocansi angaba ngamacala (isibonelo ukudlwengula, ukuhlukumeza ngokocansi)',
        steps: [
          'Bika emaphoyiseni: Ungabika kunoma yisiphi isiteshi samaphoyisa. Cela inombolo yesalathisi.',
          'Ukuhlolwa kwezempilo: Uma kube khona ukuthintana komzimba noma ukuhlukunyezwa, ukuhlolwa kwezempilo kungasekele ubufakazi. Lokhu kungenziwa esibhedlela noma emtholampilo.',
          'Isitatimende: Ungacelwa ukuba unikeze isitatimende esibhaliwe. Unelungelo lokuba nomuntu othembekileyo noma ummeli uma kungenzeka.',
          'Uphenyo: Amaphoyisa azophenya. Ungacela izibuyekezo kanye nolwazi ngosizo lwabahlukunyeziweyo.',
          'Ukushushiswa: Uma kunobufakazi obanele, icala lingadluliselwa kuNational Prosecuting Authority. Amacala ngaphansi koCode (isibonelo Izigaba 65–71) alalelwa ezinkundleni zobugebengu.',
          'Inkundla: Uma icala liya enkundleni, ungabizwa njengofakazi. Izinsiza zokusekela abahlukunyeziweyo zingatholakala.',
        ],
        sections: [
          'Isigaba 65: Ukudlwengula',
          'Isigaba 66: Ukuhlukumeza ngokocansi okukhulu',
          'Isigaba 67: Ukuhlukumeza ngokocansi',
          'Isigaba 68: Ukuzivikela okungasebenzi ezigabeni 65, 66, 67',
          'Isigaba 69: Imvume',
          'Isigaba 70: Intsha',
          'Isigaba 71: Amacala ocansi kuye abancane noma abantu abanenkinga yengqondo',
        ],
      },
      {
        name: 'Umthetho Wabasebenzi [Isahluko 28:01] – Isigaba 8(h)',
        shortName: 'Labour Act',
        relevance: 'Ukuhlukunyezwa ngokocansi njengomkhuba womsebenzi ongalungile (isibonelo ukuhlukunyezwa ngabasebenzi, noma emsebenzini/placement)',
        steps: [
          'Bika ngaphakathi: Bika kumphathi oqokiwe, ezabasebenzi, noma ikomiti yokulwa nokuhlukunyezwa ngokomgomo wesikhungo sakho.',
          'Bhala: Gcina amarekhodi wokwenzekile, inkathi, indawo, kanye nofakazi noma ubufakazi (imilayezo, ama-imeyili). Lolu hlelo lungasebenza njengerekhodi elinenkathi uma uthumele umbiko.',
          'Kumisa: Umqashi/isikhungo kufanele simise umkhuba ongalungile (isibonelo ukususa umhlukumezi ukuze angathintani nawe lapho kungenzeka).',
          'Isinxephezelo: Izinkundla zinganikeza isinxephezelo. Izinto ezicatshangelwayo zihlanganisa: uhlobo nobukhulu bokuziphatha, isikhathi, amandla, umehluko weminyaka, indlela yokuziphatha ephindaphindwayo, kanye nomthelela kuwe (bona isibonelo Batha v Zizhou & Another HH 675-21).',
          'Isijeziso sobugebengu: Ukuhlukunyezwa ngokocansi kungaholela nasecaleni lobugebengu uma isenzo siba yicala.',
        ],
        sections: [
          'Isigaba 8(h): Ukuhlukunyezwa ngokocansi kuchazwa njengomkhuba womsebenzi ongalungile',
        ],
      },
    ],
  },
};

const sexualOffences = require('./sexualOffencesSections');
const sexualOffencesTranslations = require('./sexualOffencesSections.i18n');

module.exports = {
  languages,
  sexualOffences,
  sexualOffencesTranslations,
  translations,
  // Backward-compatible English defaults for any caller expecting the old shape
  intro: translations.en.intro,
  acts: translations.en.acts,
  generalSteps: translations.en.generalSteps,
};
