// Shared by index.html (picture) and score.mjs (sound). All times are in beats at BPM.
// Every fact and headline below was checked against reporting; sources are listed in FONTES.
// Headlines are quoted as published; "ano" is left blank where the date wasn't confirmed.
export const BPM = 90;
export const BEAT = 60 / BPM;

export const SEGMENTS = [
  { type: 'intro', start: 0, end: 16, img: 'stf' },

  { type: 'chapter', start: 16, end: 24, big: '1º', label: 'MANDATO', years: '2003–2006' },
  {
    type: 'case', start: 24, end: 42, img: 'mala', focus: 0.55,
    kicker: '2005 · 1º MANDATO', title: 'Mensalão',
    paras: [
      { at: 2, text: 'Roberto Jefferson denuncia pagamentos mensais a deputados da base aliada em troca de apoio no Congresso.' },
      { at: 8, text: 'Em 2012, o STF condena 25 réus, entre eles o ex-ministro José Dirceu.' },
    ],
    clips: [{ at: 4, outlet: 'Congresso em Foco', year: '2013', headline: 'Dirceu critica investigação contra Lula no mensalão' }],
    stamps: [{ at: 12, label: 'NÃO DENUNCIADO', note: 'Lula não foi réu na Ação Penal 470.' }],
  },

  { type: 'chapter', start: 42, end: 50, big: '2º', label: 'MANDATO', years: '2007–2010' },
  {
    type: 'case', start: 50, end: 66, img: 'montadora', focus: 0.5,
    kicker: '2009 · OPERAÇÃO ZELOTES', title: 'MP 471',
    paras: [{ at: 2, text: 'Acusação: corrupção na edição de uma medida provisória que prorrogou incentivos fiscais a montadoras.' }],
    clips: [{ at: 4, outlet: 'Suno', year: '', headline: 'Justiça absolve Lula em ação sobre incentivos fiscais a montadoras' }],
    stamps: [{ at: 9, label: 'ABSOLVIDO', note: '10ª Vara Federal do DF. O próprio MPF pediu a absolvição.' }],
  },

  { type: 'chapter', start: 66, end: 76, big: '2011', label: 'FORA DO PODER', years: 'até 2022', img: 'plataforma',
    line: 'A partir de 2014, a Operação Lava Jato investiga desvios na Petrobras.' },
  {
    type: 'case', start: 76, end: 92, img: 'caca', focus: 0.45,
    kicker: '2013–2015 · ZELOTES', title: 'Caças Gripen',
    paras: [{ at: 2, text: 'Acusação: tráfico de influência na compra de caças suecos pelo governo Dilma, junto com o filho Luís Cláudio.' }],
    clips: [{ at: 4, outlet: 'Poder360', year: '2022', headline: 'Lewandowski suspende ação penal contra Lula por caças suecos' }],
    stamps: [{ at: 9, label: 'SUSPENSO', note: 'STF, 2022. Sem decisão definitiva.' }],
  },
  {
    type: 'case', start: 92, end: 108, img: 'obra', focus: 0.5,
    kicker: '2011–2015 · OPERAÇÃO JANUS', title: 'Odebrecht em Angola',
    paras: [{ at: 2, text: 'Acusação: tráfico de influência para a Odebrecht obter crédito do BNDES em Angola, com contratos para a empresa de um sobrinho.' }],
    clips: [{ at: 4, outlet: 'IstoÉ', year: '', headline: 'Operação Janus investiga pessoas ligadas a Lula e contratos da Odebrecht' }],
    stamps: [{ at: 9, label: 'TRANCADO', note: 'Ação trancada pela Justiça Federal do DF.' }],
  },
  {
    type: 'case', start: 108, end: 140, img: 'triplex', focus: 0.4,
    kicker: '2016–2021 · LAVA JATO', title: 'Triplex do Guarujá',
    paras: [
      { at: 2, text: 'Acusação: receber da OAS um apartamento reformado como propina por contratos com a Petrobras.' },
      { at: 7, text: 'Jul 2017: Sergio Moro condena Lula a 9 anos e 6 meses. Em 2018, o TRF-4 aumenta para 12 anos e 1 mês.' },
      { at: 13, text: '7 abr 2018: Lula é preso em Curitiba. Fica 580 dias na prisão.' },
      { at: 19, text: '2021: o STF anula a condenação e declara Moro parcial no caso.' },
      { at: 25, text: 'O processo recomeça no DF e é arquivado em definitivo.' },
    ],
    clips: [
      { at: 13, outlet: 'Poder360', year: '2019', headline: 'Ex-presidente Lula completa 1 ano na prisão por tríplex no Guarujá' },
      { at: 25, outlet: 'CartaCapital', year: '', headline: 'Lula: Justiça determina o arquivamento definitivo do caso triplex' },
    ],
    stamps: [
      { at: 7, label: 'CONDENADO', note: '1ª e 2ª instâncias.' },
      { at: 19, label: 'ANULADO', note: 'STF, 2021.' },
      { at: 26, label: 'ARQUIVADO', note: 'Justiça Federal do DF.' },
    ],
  },
  {
    type: 'case', start: 140, end: 166, img: 'sitio', focus: 0.5,
    kicker: '2017–2025 · LAVA JATO', title: 'Sítio de Atibaia',
    paras: [
      { at: 2, text: 'Acusação: empreiteiras pagaram reformas num sítio frequentado por Lula, como propina.' },
      { at: 7, text: 'Fev 2019: condenado a 12 anos e 11 meses. O TRF-4 aumenta para 17 anos e 1 mês.' },
      { at: 13, text: '2021: o STF anula a condenação.' },
      { at: 18, text: 'Nova denúncia é rejeitada: o crime prescreveu, porque Lula tem mais de 70 anos.' },
    ],
    clips: [
      { at: 7, outlet: 'Exame', year: '2019', headline: 'Lula é condenado a 12 anos e 11 meses de prisão pelo sítio de Atibaia' },
      { at: 18, outlet: 'Conjur', year: '2025', headline: 'TRF-1 mantém rejeição de denúncia contra Lula por sítio de Atibaia' },
    ],
    stamps: [
      { at: 7, label: 'CONDENADO', note: '1ª e 2ª instâncias.' },
      { at: 13, label: 'ANULADO', note: 'STF, 2021.' },
      { at: 19, label: 'PRESCRITO', note: 'Rejeição mantida pelo TRF-1 em 2025.' },
    ],
  },
  {
    type: 'case', start: 166, end: 180, img: 'terreno', focus: 0.55,
    kicker: '2016–2021 · LAVA JATO', title: 'Instituto Lula',
    paras: [
      { at: 2, text: 'Acusação: a Odebrecht teria comprado um terreno para a sede do instituto como propina.' },
      { at: 7, text: '2021: o STF tira o caso de Curitiba. Não houve condenação.' },
    ],
    clips: [],
    stamps: [{ at: 8, label: 'SEM CONDENAÇÃO', note: 'Caso retirado de Curitiba pelo STF.' }],
  },
  {
    type: 'case', start: 180, end: 194, img: 'telefone', focus: 0.6,
    kicker: '2016–2018', title: 'Obstrução de Justiça',
    paras: [{ at: 2, text: 'Acusação: tentar comprar o silêncio do ex-diretor da Petrobras Nestor Cerveró.' }],
    clips: [{ at: 4, outlet: 'O Antagonista', year: '2018', headline: 'Urgente: Juiz absolve Lula por obstrução no caso Delcídio' }],
    stamps: [{ at: 8, label: 'ABSOLVIDO', note: 'Jul 2018. O MPF também pediu a absolvição.' }],
  },
  {
    type: 'case', start: 194, end: 208, img: 'plataforma', focus: 0.5,
    kicker: 'LAVA JATO', title: '“Quadrilhão do PT”',
    paras: [{ at: 2, text: 'Acusação: integrar e liderar uma organização criminosa para desviar recursos da Petrobras.' }],
    clips: [],
    stamps: [{ at: 7, label: 'ABSOLVIDO', note: '12ª Vara Federal de Brasília.' }],
  },
  {
    type: 'case', start: 208, end: 234, img: 'mensagens', img2: { at: 9, img: 'stf' }, focus: 0.5,
    kicker: '2019–2022', title: 'A virada',
    paras: [
      { at: 2, text: 'Jun 2019: o The Intercept divulga mensagens entre Moro e procuradores da Lava Jato.' },
      { at: 9, text: 'Mar 2021: o STF decide que Curitiba não podia julgar os casos. As condenações caem.' },
      { at: 15, text: 'Lula recupera os direitos políticos e é eleito presidente em 2022.' },
    ],
    clips: [{ at: 15, outlet: 'Gazeta do Povo', year: '2022', headline: 'Lula foi inocentado? Entenda o desfecho dos processos na Justiça' }],
    stamps: [{ at: 19, label: 'ANULAÇÃO NÃO É ABSOLVIÇÃO', note: 'O mérito das acusações não foi julgado.' }],
  },

  { type: 'chapter', start: 234, end: 242, big: '3º', label: 'MANDATO', years: '2023–' },
  {
    type: 'case', start: 242, end: 270, img: 'inss', focus: 0.5,
    kicker: '2025 · 3º MANDATO', title: 'Fraude no INSS',
    paras: [
      { at: 2, text: 'Descontos não autorizados em aposentadorias: cerca de R$ 6,3 bilhões entre 2019 e 2024, nos governos Bolsonaro e Lula.' },
      { at: 8, text: 'Abr 2025: Operação Sem Desconto. Lula demite o presidente do INSS e o ministro Carlos Lupi deixa o cargo.' },
      { at: 14, text: 'Um sindicato que tem Frei Chico, irmão de Lula, como vice-presidente está entre os alvos. Frei Chico não é investigado.' },
      { at: 20, text: 'O governo diz ter devolvido mais de R$ 3,2 bilhões a aposentados.' },
    ],
    clips: [
      { at: 8, outlet: 'BBC News Brasil', year: '2025', headline: 'O que se sabe sobre fraude no INSS que levou Lula a demitir presidente do órgão' },
      { at: 14, outlet: 'Gazeta do Povo', year: '2025', headline: 'Sindicato ligado a irmão de Lula é um dos alvos da PF em operação contra fraude no INSS' },
      { at: 18, outlet: 'Aos Fatos', year: '2025', headline: 'Irmãos de Lula e de Flávio Dino não são investigados por fraude no INSS' },
    ],
    stamps: [{ at: 21, label: 'LULA NÃO É INVESTIGADO', note: 'Investigação da PF segue em andamento.' }],
  },
  {
    type: 'case', start: 270, end: 292, img: 'congresso', focus: 0.5,
    kicker: '2025–2026 · CONGRESSO', title: 'CPMI e Lulinha',
    paras: [
      { at: 2, text: 'Fev 2026: a CPMI do INSS quebra o sigilo bancário de Fábio Luís, o Lulinha, filho do presidente.' },
      { at: 7, text: 'O relatório do relator pede o indiciamento de Lulinha.' },
      { at: 12, text: '28 mar 2026: o relatório é rejeitado por 19 a 12. A CPMI termina sem relatório final.' },
      { at: 17, text: 'Lulinha nega irregularidades e não é alvo da Operação Sem Desconto.' },
    ],
    clips: [
      { at: 7, outlet: 'Metrópoles', year: '2026', headline: 'Relatório final da CPMI do INSS pede indiciamento de Lulinha' },
      { at: 12, outlet: 'Jovem Pan', year: '2026', headline: 'CPMI do INSS: relatório que indiciava “Lulinha” é rejeitado' },
    ],
    stamps: [{ at: 13, label: 'RELATÓRIO REJEITADO', note: 'Sem indiciamento.' }],
  },

  { type: 'placar', start: 292, end: 322 },
  { type: 'fontes', start: 322, end: 334 },
];

export const PLACAR = [
  ['Mensalão', 'NÃO DENUNCIADO'],
  ['MP 471', 'ABSOLVIDO'],
  ['Caças Gripen', 'SUSPENSO'],
  ['Odebrecht em Angola', 'TRANCADO'],
  ['Triplex do Guarujá', 'ANULADO · ARQUIVADO'],
  ['Sítio de Atibaia', 'ANULADO · PRESCRITO'],
  ['Instituto Lula', 'SEM CONDENAÇÃO'],
  ['Obstrução de Justiça', 'ABSOLVIDO'],
  ['Quadrilhão do PT', 'ABSOLVIDO'],
  ['Fraude no INSS', 'NÃO INVESTIGADO'],
  ['CPMI / Lulinha', 'REJEITADO'],
];

export const FONTES = [
  'Gazeta do Povo · Poder360',
  'CartaCapital · Conjur · Exame',
  'Congresso em Foco · IstoÉ',
  'O Antagonista · Suno · Aos Fatos',
  'BBC News Brasil · Metrópoles',
  'Jovem Pan · Agência Câmara',
  'Agência Senado',
];

export const END = SEGMENTS[SEGMENTS.length - 1].end;
export const DURATION = Math.ceil(END * BEAT);
