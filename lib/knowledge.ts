export const categories = ['汽车基础','品牌车型','二手车','二手车跨境','国际贸易','SEO','GEO','English'] as const;
export type Content = {zh:string; en:string; abbreviation:string; ipa:string; pronunciation:string; category:string; tags:string[]; explanation:string; related:string[]; scenario:string; example:string; image:string; question:string; answer:string; source:string};
export type Card = Content & {id:string;createdAt:number;updatedAt:number;correct:number;wrong:number;streak:number;lastReview:number|null;nextReview:number;lastResult:string|null;version:number};
export const blankContent:Content = {zh:'',en:'',abbreviation:'',ipa:'',pronunciation:'',category:'汽车基础',tags:[],explanation:'',related:[],scenario:'',example:'',image:'',question:'',answer:'',source:''};
export const seeds:Content[] = [
 {...blankContent,zh:'捷途',en:'JETOUR',category:'品牌车型',tags:['Automotive English','中国品牌'],pronunciation:'品牌名，连读成词；官方发音尚未核实，暂不标注 IPA。',explanation:'捷途是中国汽车品牌。JETOUR 是品牌名称，X70、T2 等是旗下车型名称。',related:['Honda','Honda CR-V'],scenario:'向客户介绍品牌后，再确认具体车型。',example:'JETOUR is a Chinese automotive brand. 捷途是一个中国汽车品牌。',question:'JETOUR 是品牌还是车型？中文叫什么？',answer:'JETOUR 是汽车品牌，中文名捷途；X70、T2 是车型。',source:'https://jetourglobal.com/about/'},
 {...blankContent,zh:'本田',en:'Honda',category:'品牌车型',tags:['Automotive English','日本品牌'],pronunciation:'英语中常读作 HON-duh，重音在前；日语读音与英语不同。',explanation:'Honda（本田）是日本汽车品牌。Honda 是品牌，CR-V 是本田旗下车型。',related:['Honda CR-V','JETOUR'],scenario:'询价时区分品牌（make）和车型（model）。',example:'What Honda model are you looking for? 你在找本田的哪款车？',question:'Honda 与 CR-V 分别属于哪个层级？',answer:'Honda 是品牌（make），CR-V 是车型（model）。',source:'https://automobiles.honda.com/vehicles'},
 {...blankContent,zh:'本田 CR-V',en:'Honda CR-V',abbreviation:'CR-V',ipa:'/ˌsiː ɑːr ˈviː/',pronunciation:'CR-V 逐字母读：C · R · V。',category:'品牌车型',tags:['Automotive English','SUV'],explanation:'CR-V 是本田旗下的 SUV 车型。动力和配置因年款、销售市场及版本而异，需要逐车核实。',related:['Honda','MPV'],scenario:'客户询问 CR-V 时，继续确认年款、动力、里程与预算。',example:'Which model year and powertrain do you prefer? 你倾向哪一年款和哪种动力？',question:'客户只说想买 CR-V，能直接确定它是混动吗？',answer:'不能。CR-V 是车型名称；还需确认年款、市场与具体动力版本。',source:'https://automobiles.honda.com/cr-v'},
 {...blankContent,zh:'多用途汽车',en:'Multi-Purpose Vehicle',abbreviation:'MPV',ipa:'MPV /ˌem piː ˈviː/ · purpose /ˈpɜːr.pəs/ · vehicle /ˈviː.ə.kəl/',pronunciation:'MPV 逐字母读；purpose 重音在前，vehicle 通常读三个音节。',category:'汽车基础',tags:['Automotive English','车身类型'],explanation:'MPV 指 Multi-Purpose Vehicle，通常强调载人空间与座椅灵活性。MPV 并不等于所有七座车。',related:['Pickup','Honda CR-V'],scenario:'客户有多人出行需求时，进一步确认座位数、行李空间和用途。',example:'Do you need more passenger space or cargo space? 你更需要乘坐空间还是载货空间？',question:'MPV 的英文全称是什么？七座车一定是 MPV 吗？',answer:'Multi-Purpose Vehicle。不是；七座是座位数量，MPV 是车型类别，SUV 也可能有七座。'},
 {...blankContent,zh:'皮卡',en:'Pickup Truck',abbreviation:'Pickup',ipa:'/ˈpɪk.ʌp trʌk/',pronunciation:'Pickup 是一个词，重音在 PICK；不要逐字母读。',category:'汽车基础',tags:['Automotive English','车身类型'],explanation:'Pickup（皮卡）通常由乘员驾驶室和后部开放式货厢组成，可兼顾载人与载货。',related:['MPV','Honda CR-V'],scenario:'客户需要运货时，确认货厢尺寸、载重、座位和驱动形式。',example:'Do you need a single-cab or double-cab pickup? 你需要单排还是双排皮卡？',question:'Pickup 与 MPV 的典型用途和车身特征有什么不同？',answer:'Pickup 通常有后部开放式货厢，强调载货；MPV 通常是封闭乘员舱，强调载人空间和座椅布局。',source:'https://dictionary.cambridge.org/dictionary/english/pickup'}
];
export function mastery(c:Card){return Math.min(100,c.streak*25)}
export function status(c:Card){return c.lastResult==='wrong'?'待巩固':!c.lastReview?'未学习':mastery(c)>=75?'已掌握':'学习中'}
export function isLearnable(c:Content){return Boolean(c.explanation.trim()||c.answer.trim())}

/** Only exact, title-only inputs use curated content; never invent an AI answer. */
export function quickEntrySeed(content: Content): Content | undefined {
  const hasDetails = [content.explanation, content.question, content.answer, content.scenario, content.example, content.pronunciation, content.ipa, content.source, content.image].some(value => value.trim());
  if (hasDetails || content.tags.length || content.related.length) return undefined;
  const normalized = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, '');
  const inputs = [content.zh, content.en, content.abbreviation].filter(value => value.trim()).map(normalized);
  if (!inputs.length) return undefined;
  const match = seeds.find(seed => inputs.every(input => [seed.zh, seed.en, seed.abbreviation].filter(Boolean).map(normalized).includes(input)));
  return match ? { ...match, tags: [...match.tags], related: [...match.related] } : undefined;
}
