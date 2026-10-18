// Shared by index.html (picture) and score.mjs (sound). Times are in beats at BPM.
// Each item states who accused whom of what, and when. Headlines are quoted as published.
export const BPM = 70;
export const BEAT = 60 / BPM;

export const SEGMENTS = [
  { type: 'intro', start: 0, end: 12, img: 'congresso' },

  { type: 'chapter', start: 12, end: 18, big: 'LULA', label: '1º E 2º MANDATOS', years: '2003–2010', span: [2003, 2011] },
  {
    type: 'case', start: 18, end: 34, img: 'mala', focus: 0.55,
    kicker: '2005 · GOVERNO LULA', title: 'Mensalão',
    paras: [
      { at: 2, text: 'Roberto Jefferson denuncia uma mesada paga a deputados da base aliada em troca de votos no Congresso.' },
      { at: 7, text: '2012: o STF condena José Dirceu, José Genoino, Delúbio Soares e João Paulo Cunha, do PT.' },
      { at: 12, text: 'Em delação de 2016, Delcídio do Amaral afirma que Marcos Valério tratava o mensalão diretamente com Lula.' },
    ],
    clips: [{ at: 7, outlet: 'Congresso em Foco', year: '', headline: 'Veja as penas dos réus do mensalão' }],
    stamps: [{ at: 8, label: 'CONDENADOS PELO STF', note: 'Ação Penal 470.' }],
  },
  {
    type: 'case', start: 34, end: 46, img: 'prisao', focus: 0.5,
    kicker: '2006 · GOVERNO LULA', title: 'Os “aloprados”',
    paras: [
      { at: 2, text: 'Set 2006: petistas são presos num hotel de São Paulo com R$ 1,7 milhão para comprar um dossiê contra José Serra (PSDB).' },
      { at: 7, text: 'Lula, candidato à reeleição, chama o grupo de “bando de aloprados”.' },
    ],
    clips: [],
    stamps: [{ at: 3, label: 'R$ 1,7 MILHÃO', note: 'Dinheiro apreendido pela PF.' }],
  },
  {
    type: 'case', start: 46, end: 60, img: 'refinaria', focus: 0.5,
    kicker: '2006 · PETROBRAS', title: 'Pasadena',
    paras: [
      { at: 2, text: 'O conselho da Petrobras, presidido por Dilma Rousseff, aprova a compra de uma refinaria em Pasadena, nos EUA.' },
      { at: 7, text: 'O TCU aponta prejuízo de US$ 792 milhões aos cofres da estatal.' },
    ],
    clips: [{ at: 7, outlet: 'Gazeta do Povo', year: '2016', headline: 'TCU acha mais responsáveis por prejuízo de US$ 792 milhões em Pasadena' }],
    stamps: [{ at: 8, label: 'US$ 792 MILHÕES', note: 'Prejuízo apontado pelo TCU.' }],
  },
  {
    type: 'case', start: 60, end: 74, img: 'porto', focus: 0.5,
    kicker: '2009–2014 · BNDES', title: 'Obras no exterior',
    paras: [
      { at: 2, text: 'Os governos Lula e Dilma financiam obras no exterior pelo BNDES, como o Porto de Mariel, em Cuba: US$ 682 milhões, com obras da Odebrecht.' },
      { at: 8, text: 'Venezuela, Cuba e Moçambique deixam de pagar. A conta cai no Tesouro.' },
    ],
    clips: [{ at: 8, outlet: 'Poder360', year: '', headline: 'Cuba e Venezuela têm R$ 4,6 bi de dívidas em atraso com o BNDES' }],
    stamps: [{ at: 9, label: 'CALOTE', note: 'Coberto pelo Fundo de Garantia à Exportação.' }],
  },
  {
    type: 'case', start: 74, end: 86, img: 'montadora', focus: 0.5,
    kicker: '2009 · OPERAÇÃO ZELOTES', title: 'MP 471',
    paras: [{ at: 2, text: 'O MPF acusa Lula de corrupção na edição de uma medida provisória que prorrogou incentivos fiscais a montadoras.' }],
    clips: [],
    stamps: [{ at: 6, label: 'DENUNCIADO PELO MPF', note: 'Corrupção passiva.' }],
  },

  { type: 'chapter', start: 86, end: 92, big: 'DILMA', label: 'GOVERNO DILMA', years: '2011–2016', span: [2011, 2016.7] },
  {
    type: 'case', start: 92, end: 106, img: 'plataforma', focus: 0.5,
    kicker: '2014 · OPERAÇÃO LAVA JATO', title: 'Petrolão',
    paras: [
      { at: 2, text: 'A Lava Jato revela um esquema de propinas na Petrobras entre empreiteiras e partidos, entre eles o PT.' },
      { at: 7, text: 'A Petrobras admite R$ 6,2 bilhões em perdas com corrupção. A PF estima R$ 19 bilhões.' },
    ],
    clips: [{ at: 7, outlet: 'Congresso em Foco', year: '2015', headline: 'Petrobras perde R$ 6,2 bilhões com corrupção' }],
    stamps: [{ at: 8, label: 'R$ 6,2 BILHÕES', note: 'Perdas reconhecidas no balanço de 2014.' }],
  },
  {
    type: 'case', start: 106, end: 122, img: 'prisao', focus: 0.35,
    kicker: '2015 · LAVA JATO', title: 'Petistas presos',
    paras: [
      { at: 2, text: 'Abr 2015: é preso o tesoureiro do PT, João Vaccari Neto.' },
      { at: 6, text: 'Ago 2015: é preso José Dirceu. Em 2016, Moro o condena a 23 anos e 3 meses.' },
      { at: 11, text: 'O deputado André Vargas é forçado a deixar o PT e tem o mandato cassado.' },
    ],
    clips: [
      { at: 2, outlet: 'O Antagonista', year: '2015', headline: 'Urgente: Lava Jato prende tesoureiro do PT' },
      { at: 6, outlet: 'Congresso em Foco', year: '2016', headline: 'Lava Jato: Moro condena Dirceu a 23 anos de prisão' },
    ],
    stamps: [{ at: 3, label: 'PRESOS', note: 'Prisões preventivas decretadas por Sergio Moro.' }],
  },
  {
    type: 'case', start: 122, end: 136, img: 'estudio', focus: 0.5,
    kicker: '2016 · OPERAÇÃO ACARAJÉ', title: 'O marqueteiro',
    paras: [
      { at: 2, text: 'Fev 2016: são presos João Santana e Mônica Moura, marqueteiros das campanhas de Lula e Dilma.' },
      { at: 7, text: 'Em delação, admitem caixa 2 na campanha de Dilma em 2010. Mônica diz que mentiu antes “para preservar” Dilma.' },
    ],
    clips: [{ at: 7, outlet: 'Folha Vitória', year: '', headline: 'PF aponta R$ 21,5 milhões da Odebrecht a marqueteiro após reeleição de Dilma' }],
    stamps: [{ at: 8, label: 'CAIXA 2', note: 'Admitido em delação homologada pelo STF.' }],
  },
  {
    type: 'case', start: 136, end: 150, img: 'planilha', focus: 0.5,
    kicker: 'MAR 2016 · DELAÇÃO', title: 'Delcídio entrega',
    paras: [
      { at: 2, text: 'O senador Delcídio do Amaral, líder do governo, acusa Dilma de tentar interferir na Lava Jato três vezes.' },
      { at: 7, text: 'Segundo ele, a nomeação de Marcelo Navarro ao STJ serviria para soltar empreiteiros presos.' },
    ],
    clips: [{ at: 4, outlet: 'Brazil Journal', year: '2016', headline: 'Delcídio compromete Dilma e Lula em delação, diz revista' }],
    stamps: [{ at: 8, label: 'DELAÇÃO', note: 'Homologada pelo STF em março de 2016.' }],
  },
  {
    type: 'case', start: 150, end: 164, img: 'telefone', focus: 0.55,
    kicker: '16 MAR 2016 · GRAMPO', title: '“Bessias”',
    paras: [
      { at: 2, text: 'Áudio mostra Dilma avisando Lula que enviaria o termo de posse na Casa Civil, para usar “em caso de necessidade”.' },
      { at: 7, text: 'Acusação: a nomeação daria foro privilegiado a Lula e tiraria seus processos de Curitiba.' },
      { at: 10, text: 'Gilmar Mendes suspende a posse por desvio de finalidade.' },
    ],
    clips: [],
    stamps: [{ at: 10, label: 'POSSE SUSPENSA', note: 'STF, 18 mar 2016.' }],
  },
  {
    type: 'case', start: 164, end: 178, img: 'stf', focus: 0.45,
    kicker: '2016 · SENADO FEDERAL', title: 'Impeachment',
    paras: [
      { at: 2, text: 'Dilma é acusada de crime de responsabilidade: “pedaladas fiscais” e decretos de crédito sem autorização do Congresso.' },
      { at: 7, text: '31 ago 2016: o Senado aprova o impeachment por 61 votos a 20.' },
    ],
    clips: [{ at: 4, outlet: 'Poder360', year: '', headline: 'Leis sobre responsabilidade fiscal mudaram depois de “pedalada” e impeachment' }],
    stamps: [{ at: 7, label: 'AFASTADA', note: '61 votos a 20.' }],
  },

  { type: 'chapter', start: 178, end: 184, big: 'LULA', label: 'RÉU NA LAVA JATO', years: '2016–2019', span: [2016, 2019.9] },
  {
    type: 'case', start: 184, end: 200, img: 'triplex', focus: 0.4,
    kicker: '2017 · LAVA JATO', title: 'Triplex do Guarujá',
    paras: [
      { at: 2, text: 'Acusação: Lula recebeu da OAS um apartamento reformado como propina por contratos com a Petrobras.' },
      { at: 7, text: 'Jul 2017: Moro condena Lula a 9 anos e 6 meses. Em 2018, o TRF-4 aumenta a pena para 12 anos e 1 mês.' },
      { at: 12, text: '7 abr 2018: Lula é preso em Curitiba.' },
    ],
    clips: [{ at: 12, outlet: 'Poder360', year: '2019', headline: 'Ex-presidente Lula completa 1 ano na prisão por tríplex no Guarujá' }],
    stamps: [{ at: 7, label: 'CONDENADO', note: '1ª e 2ª instâncias.' }, { at: 12, label: 'PRESO', note: 'Polícia Federal, Curitiba.' }],
  },
  {
    type: 'case', start: 200, end: 214, img: 'sitio', focus: 0.5,
    kicker: '2019 · LAVA JATO', title: 'Sítio de Atibaia',
    paras: [
      { at: 2, text: 'Acusação: empreiteiras pagaram reformas num sítio frequentado por Lula, como propina.' },
      { at: 7, text: 'Fev 2019: condenado a 12 anos e 11 meses. O TRF-4 aumenta a pena para 17 anos e 1 mês.' },
    ],
    clips: [{ at: 7, outlet: 'Exame', year: '2019', headline: 'Lula é condenado a 12 anos e 11 meses de prisão pelo sítio de Atibaia' }],
    stamps: [{ at: 7, label: 'CONDENADO', note: '17 anos e 1 mês no TRF-4.' }],
  },
  {
    type: 'case', start: 214, end: 230, img: 'obra', focus: 0.5,
    kicker: 'SET 2017 · DEPOIMENTO A MORO', title: '“Pacto de sangue”',
    paras: [
      { at: 2, text: 'Antonio Palocci, ex-ministro de Lula e Dilma, diz que o PT tinha um acerto de R$ 300 milhões com a Odebrecht.' },
      { at: 7, text: 'Segundo ele, Lula recebeu R$ 4 milhões em espécie. Ele cita Dilma numa reunião sobre os pagamentos.' },
    ],
    clips: [{ at: 4, outlet: 'Poder360', year: '2017', headline: 'Palocci: Lula recebeu R$ 4 mi da Odebrecht e PT tinha acordo de R$ 300 mi' }],
    stamps: [{ at: 8, label: 'R$ 300 MILHÕES', note: 'Segundo Palocci.' }],
  },
  {
    type: 'lista', start: 230, end: 246, img: 'terreno', focus: 0.5,
    kicker: '2016–2017', title: 'Mais denúncias',
    rows: [
      ['INSTITUTO LULA', 'Terreno da Odebrecht para a sede, como propina'],
      ['OPERAÇÃO JANUS', 'Tráfico de influência pela Odebrecht em Angola'],
      ['CAÇAS GRIPEN', 'Tráfico de influência, com o filho Luís Cláudio'],
      ['OBSTRUÇÃO', 'Tentar calar Nestor Cerveró'],
      ['“QUADRILHÃO”', 'Liderar organização criminosa na Petrobras'],
    ],
  },

  { type: 'chapter', start: 246, end: 252, big: 'LULA', label: '3º MANDATO', years: '2023–', span: [2023, 2026.8] },
  {
    type: 'case', start: 252, end: 268, img: 'inss', focus: 0.5,
    kicker: '2025 · OPERAÇÃO SEM DESCONTO', title: 'Fraude no INSS',
    paras: [
      { at: 2, text: 'Descontos não autorizados em aposentadorias somam R$ 6,3 bilhões entre 2019 e 2024.' },
      { at: 6, text: 'Abr 2025: a PF deflagra a operação. O ministro da Previdência de Lula, Carlos Lupi, deixa o cargo.' },
      { at: 11, text: 'Um sindicato que tem Frei Chico, irmão de Lula, como vice-presidente está entre os alvos da PF.' },
    ],
    clips: [
      { at: 6, outlet: 'BBC News Brasil', year: '2025', headline: 'O que se sabe sobre fraude no INSS que levou Lula a demitir presidente do órgão' },
      { at: 11, outlet: 'Gazeta do Povo', year: '2025', headline: 'Sindicato ligado a irmão de Lula é um dos alvos da PF em operação contra fraude no INSS' },
    ],
    stamps: [{ at: 3, label: 'R$ 6,3 BILHÕES', note: 'Descontados de aposentados e pensionistas.' }],
  },
  {
    type: 'case', start: 268, end: 282, img: 'congresso', focus: 0.5,
    kicker: '2026 · CPMI DO INSS', title: 'Lulinha',
    paras: [
      { at: 2, text: 'Fev 2026: a CPMI quebra o sigilo bancário de Fábio Luís, o Lulinha, filho de Lula.' },
      { at: 7, text: 'O relatório do relator pede o indiciamento e a prisão preventiva de Lulinha e o liga ao “Careca do INSS”.' },
    ],
    clips: [{ at: 7, outlet: 'Metrópoles', year: '2026', headline: 'Relatório final da CPMI do INSS pede indiciamento de Lulinha' }],
    stamps: [{ at: 8, label: 'PEDIDO DE INDICIAMENTO', note: 'Relatório de Alfredo Gaspar (PL-AL).' }],
  },

  { type: 'resumo', start: 282, end: 304 },
  { type: 'fontes', start: 304, end: 374 },
];

export const RESUMO = [
  ['Mensalão', 'CONDENADOS'],
  ['Aloprados', 'PRESOS'],
  ['Pasadena', 'US$ 792 MI'],
  ['BNDES no exterior', 'CALOTE'],
  ['MP 471', 'DENÚNCIA'],
  ['Petrolão', 'R$ 6,2 BI'],
  ['Vaccari e Dirceu', 'PRESOS'],
  ['Marqueteiros', 'CAIXA 2'],
  ['Delcídio', 'DELAÇÃO'],
  ['Bessias', 'POSSE SUSPENSA'],
  ['Dilma', 'IMPEACHMENT'],
  ['Triplex', 'CONDENADO'],
  ['Sítio de Atibaia', 'CONDENADO'],
  ['Palocci', 'DELAÇÃO'],
  ['INSS', 'R$ 6,3 BI'],
  ['Lulinha', 'INDICIAMENTO PEDIDO'],
];

// Every source used, in the order the film uses them. Shown as a credit roll at the end
// and written to LINKS.md for the video description.
export const LINKS = [
  ['Mensalão: as penas dos réus', 'Congresso em Foco', 'https://www.congressoemfoco.com.br/noticias/veja-as-penas-dos-reus-do-mensalao'],
  ['Delcídio: Valério tratava mensalão com Lula', 'Conjur', 'https://www.conjur.com.br/2016-mar-15/delcidio-valerio-tratava-mensalao-diretamente-lula'],
  ['Aloprados: R$ 1,7 milhão no hotel', 'Exame', 'https://exame.com/brasil/justica-rejeita-acusacao-contra-aloprados-do-pt'],
  ['Pasadena: prejuízo de US$ 792 milhões', 'Gazeta do Povo', 'https://www.gazetadopovo.com.br/vida-publica/tcu-acha-mais-responsaveis-por-prejuizo-de-us-792-milhoes-em-pasadena-b4nwmc992164k3bpmw63cy83m'],
  ['BNDES: Cuba e Venezuela em atraso', 'Poder360', 'https://www.poder360.com.br/economia/cuba-e-venezuela-tem-r-46-bi-de-dividas-em-atraso-com-o-bndes'],
  ['Obras em Cuba e na Venezuela', 'Gazeta do Povo', 'https://www.gazetadopovo.com.br/ideias/quanto-dinheiro-o-brasil-investiu-em-obras-em-cuba-e-na-venezuela/'],
  ['MP 471: a acusação contra Lula', 'Suno', 'https://www.suno.com.br/noticias/?p=160069'],
  ['Petrobras perde R$ 6,2 bi com corrupção', 'Congresso em Foco', 'https://www.congressoemfoco.com.br/noticias/petrobras-perde-r-62-bilhoes-com-corrupcao/'],
  ['PF prevê prejuízo de R$ 19 bi', 'Baguete', 'https://www.baguete.com.br/noticias/pf-preve-prejuizo-da-petrobras-em-r-19-bi'],
  ['Lava Jato prende tesoureiro do PT', 'O Antagonista', 'https://oantagonista.com.br/?p=1988'],
  ['Moro condena Dirceu a 23 anos', 'Congresso em Foco', 'https://www.congressoemfoco.com.br/noticias/lava-jato-moro-condena-dirceu-a-23-anos-de-prisao/'],
  ['Vaccari, Dirceu e André Vargas', 'Gazeta do Povo', 'https://www.gazetadopovo.com.br/vida-publica/presidente-do-pt-defende-vaccari-4d12sgfmgz91jaahixmqeyju4'],
  ['R$ 21,5 mi da Odebrecht a marqueteiro', 'Folha Vitória', 'https://www.folhavitoria.com.br/politica/pf-aponta-r-21-5-milhoes-da-odebrecht-a-marqueteiro-apos-reeleicao-de-dilma'],
  ['Mônica Moura: mentiu “para preservar” Dilma', 'Congresso em Foco', 'https://congressoemfoco.com.br/noticia/40497/monica-moura-diz-a-moro-que-mentiu-%e2%80%9cpara-preservar%e2%80%9d-a-ex-presidente-dilma'],
  ['Delcídio compromete Dilma e Lula', 'Brazil Journal', 'https://braziljournal.com/delcidio-compromete-dilma-e-lula-em-delacao-diz-revista'],
  ['O caso Bessias', 'Gazeta do Povo', 'https://www.gazetadopovo.com.br/ideias/relembre-caso-bessias/'],
  ['Gilmar suspende a posse de Lula', 'Conjur', 'https://www.conjur.com.br/2016-mar-18/gilmar-mendes-suspende-nomeacao-lula-casa-civil'],
  ['Pedaladas e impeachment', 'Poder360', 'https://poder360.com.br/economia/leis-sobre-responsabilidade-fiscal-mudaram-depois-de-pedalada-e-impeachment/'],
  ['Lula: 1 ano na prisão pelo triplex', 'Poder360', 'https://www.poder360.com.br/justica/ex-presidente-lula-completa-1-ano-na-prisao-por-triplex-no-guaruja/'],
  ['Condenação pelo sítio de Atibaia', 'Exame', 'https://exame.com/brasil/lula-e-condenado-a-12-anos-e-11-meses-de-prisao-pelo-sitio-de-atibaia'],
  ['TRF-4 aumenta pena do sítio', 'Exame', 'https://exame.com/brasil/por-3x0-trf-4-mantem-e-aumenta-condenacao-de-lula-no-caso-do-sitio/'],
  ['Palocci: R$ 4 mi e acordo de R$ 300 mi', 'Poder360', 'https://www.poder360.com.br/lava-jato/palocci-diz-a-moro-que-lula-recebeu-r-4-milhoes-da-odebrecht-afirma-defesa/'],
  ['Os outros processos em que Lula é réu', 'Jornal do Brasil', 'https://www.jb.com.br/pais/noticias/2018/01/24/amp/alem-do-triplex-os-outros-processos-em-que-lula-e-reu.html'],
  ['Operação Janus', 'IstoÉ', 'https://istoe.com.br/operacao-janus-investiga-pessoas-ligadas-a-lula-e-contratos-da-odebrecht'],
  ['Denúncia contra Lula e filho na Zelotes', 'Congresso em Foco', 'https://congressoemfoco.com.br/noticias/justica-aceita-denuncia-contra-lula-e-filho-na-zelotes'],
  ['Fraude no INSS', 'BBC News Brasil / O Povo', 'https://www.opovo.com.br/agencia/bbc/2025/05/03/o-que-se-sabe-sobre-fraude-no-inss-que-levou-lula-a-demitir-presidente-do-orgao.html'],
  ['Sindicato ligado a irmão de Lula é alvo', 'Gazeta do Povo', 'https://www.gazetadopovo.com.br/brasil/operacao-sem-desconto-pf-novas-provas-fraude-inss-estados/'],
  ['CPMI do INSS', 'Wikipédia', 'https://pt.wikipedia.org/wiki/CPMI_do_INSS'],
  ['Relatório pede indiciamento de Lulinha', 'Metrópoles', 'https://www.metropoles.com/colunas/andreza-matais/relatorio-final-da-cpmi-do-inss-vai-indiciar-lulinha'],
];

export const END = SEGMENTS[SEGMENTS.length - 1].end;
export const DURATION = Math.ceil(END * BEAT);
