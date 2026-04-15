// Tree data extracted from the HTML source

export interface DocItem {
  name: string;
  optional?: boolean;
}

export interface DocSection {
  section: string;
  items: DocItem[];
}

export interface TreeNode {
  label: string;
  tag?: string;
  tagColor?: string;
  note?: string;
  children?: TreeNode[];
  leaf?: boolean;
  docs?: DocSection[];
}

function selarlDocs(prof: string, marie: boolean, scm: boolean, derog: string | null): DocSection[] {
  const docs: DocSection[] = [];
  const inscr = prof === "Dentiste"
    ? "Demarche d'inscription a l'ordre (dentiste)"
    : prof === "Medecin"
      ? "Questionnaire d'inscription a l'ordre (medecin)"
      : "Questionnaire d'inscription a l'ordre (kine)";

  docs.push({
    section: "Documents de base",
    items: [
      { name: "Statuts SELARL" },
      { name: "PV nomination de gerant" },
      { name: inscr },
      { name: "Declaration sur l'honneur de non condamnation" },
      { name: "Autorisation de domiciliation" },
    ],
  });

  docs.push({
    section: "Cession (systematique)",
    items: [
      { name: "Avenant au bail" },
      { name: "Compromis de cession" },
      { name: "Commodat patientele", optional: true },
      { name: "Appel de fonds SEL" },
      { name: "Acte de cession" },
      { name: "Formulaire 2672" },
    ],
  });

  if (marie) {
    docs.push({
      section: "Regime communaute",
      items: [
        { name: "Lettre de renonciation" },
        { name: "Lettre d'avertissement" },
      ],
    });
  }

  if (scm) {
    docs.push({
      section: "SCM",
      items: [
        { name: "Acte de cession des parts de la SCM a la SELARL" },
        { name: "Courriel SDE" },
        { name: "Procuration (SCM)" },
        { name: "PV AGE cession de part SCM" },
      ],
    });
  }

  if (derog) {
    docs.push({ section: "Derogation", items: [{ name: derog }] });
  }

  return docs;
}

function selasDocs(prof: string, marie: boolean, cession: boolean, scm: boolean, derog: string | null): DocSection[] {
  const docs: DocSection[] = [];
  const statut = `Statuts SELAS (${prof.toLowerCase()})`;

  docs.push({
    section: "Documents de base",
    items: [
      { name: statut },
      { name: "Procuration" },
      { name: "PV associe unique nomination DG" },
      { name: "Demande d'inscription a l'ordre" },
      { name: "Declaration sur l'honneur de non condamnation" },
      { name: "Autorisation de domiciliation" },
    ],
  });

  if (cession) {
    docs.push({
      section: "Cession",
      items: [
        { name: "Avenant au bail" },
        { name: "Compromis de cession" },
        { name: "Commodat patientele", optional: true },
        { name: "Appel de fonds SEL" },
        { name: "Acte de cession" },
        { name: "Formulaire 2672" },
      ],
    });
  }

  if (marie) {
    docs.push({
      section: "Regime communaute",
      items: [
        { name: "Lettre de renonciation" },
        { name: "Lettre d'avertissement" },
      ],
    });
  }

  if (scm) {
    docs.push({
      section: "SCM",
      items: [
        { name: "Acte de cession des parts de la SCM a la SELARL" },
        { name: "Courriel SDE" },
        { name: "Procuration (SCM)" },
        { name: "PV AGE cession de part SCM" },
      ],
    });
  }

  if (derog) {
    docs.push({ section: "Derogation", items: [{ name: derog }] });
  }

  return docs;
}

function spfplDocs(prof: string, marie: boolean, operation: string): DocSection[] {
  const docs: DocSection[] = [];
  const p = prof.toLowerCase();

  docs.push({
    section: "Documents de base",
    items: [
      { name: "Procuration" },
      { name: "Note d'information" },
      { name: "Demande d'inscription a l'ordre" },
      { name: "Declaration sur l'honneur de non condamnation" },
      { name: "Autorisation de domiciliation" },
    ],
  });

  if (marie) {
    docs.push({
      section: "Regime communaute",
      items: [
        { name: "Lettre de renonciation" },
        { name: "Lettre d'avertissement" },
      ],
    });
  }

  if (operation === "Cession") {
    docs.push({
      section: "Cession",
      items: [
        { name: `Statuts SPFPL version cession (${p})` },
        { name: "Attestation sur le capital version cession" },
        { name: "Acte de cession des actions" },
        { name: "Compromis de cession" },
        { name: "PV SPFPL autorisation emprunt" },
      ],
    });
    docs.push({
      section: "Commun",
      items: [{ name: "Courriel SDE" }, { name: "Procuration de la SEL" }],
    });
  } else if (operation === "Apport") {
    docs.push({
      section: "Apport",
      items: [
        { name: `Statuts SPFPL version apport (${p})` },
        { name: "Attestation sur le capital version apport" },
        { name: "Contrat d'apport" },
        { name: "Nomination commissaire apport" },
        { name: "PV SEL agrement SPFPL" },
        { name: "Nouveaux statuts SEL" },
      ],
    });
    docs.push({
      section: "Commun",
      items: [{ name: "Courriel SDE" }, { name: "Procuration de la SEL" }],
    });
  } else {
    docs.push({
      section: "Cession",
      items: [
        { name: "Acte de cession des actions" },
        { name: "Compromis de cession" },
        { name: "PV SPFPL autorisation emprunt" },
      ],
    });
    docs.push({
      section: "Apport",
      items: [
        { name: `Statuts SPFPL version apport (${p})` },
        { name: "Attestation sur le capital version apport" },
        { name: "Contrat d'apport" },
        { name: "Nomination commissaire apport" },
        { name: "PV SEL agrement SPFPL" },
        { name: "Nouveaux statuts SEL" },
      ],
    });
    docs.push({
      section: "Commun",
      items: [{ name: "Courriel SDE" }, { name: "Procuration de la SEL" }],
    });
  }

  return docs;
}

function scDocs(forme: string, regime: string, nb: string): DocSection[] {
  const docs: DocSection[] = [];
  const statut = `Statuts ${forme}${nb === "1" ? " (associe unique)" : " (2+ associes)"}`;

  docs.push({
    section: "Documents de base",
    items: [
      { name: statut },
      { name: "PV nomination du gerant" },
      { name: "Procuration" },
      { name: "Declaration de non condamnation" },
      { name: "Autorisation de domiciliation" },
    ],
  });

  if (regime === "IS") {
    docs.push({ section: "Option IS", items: [{ name: "Lettre aux impots" }] });
  }

  if (forme === "SAS" || forme === "SCS") {
    docs.push({ section: `Option ${forme}`, items: [{ name: "Liste des souscripteurs" }] });
  }

  return docs;
}

const derogOpts: { label: string; val: string | null }[] = [
  { label: "Aucune derogation", val: null },
  { label: "Derogation cumul SELARL/BNC", val: "Demande de derogation cumul SELARL/BNC" },
  { label: "Derogation SEL BNC complet", val: "Derogation SEL BNC complet" },
  { label: "Declaration prealable site distinct CD94", val: "Formulaire de declaration prealable de site distinct CD94 avec la SEL" },
  { label: "Derogation exercer plusieurs sites", val: "Formulaire de derogation pour exercer sur plusieurs sites avec la SEL" },
];

function mkLeaf(label: string, docs: DocSection[]): TreeNode {
  return { label, leaf: true, docs };
}

function buildSELARLTree(prof: string): TreeNode[] {
  function mar(m: boolean): TreeNode[] {
    function scm(s: boolean): TreeNode[] {
      return derogOpts.map((d) => mkLeaf(d.label, selarlDocs(prof, m, s, d.val)));
    }
    return [
      { label: "Avec SCM", tag: "", tagColor: "amber", children: scm(true) },
      { label: "Sans SCM", tag: "", tagColor: "gray", children: scm(false) },
    ];
  }
  return [
    { label: "Marie(e) communaute", tag: "oui", tagColor: "pink", children: mar(true) },
    { label: "Non marie(e) communaute", tag: "non", tagColor: "gray", children: mar(false) },
  ];
}

function buildSELASTree(prof: string): TreeNode[] {
  function mar(m: boolean): TreeNode[] {
    function ces(c: boolean): TreeNode[] {
      function scm(s: boolean): TreeNode[] {
        return derogOpts.map((d) => mkLeaf(d.label, selasDocs(prof, m, c, s, d.val)));
      }
      return [
        { label: "Avec SCM", tag: "", tagColor: "amber", children: scm(true) },
        { label: "Sans SCM", tag: "", tagColor: "gray", children: scm(false) },
      ];
    }
    return [
      { label: "Avec cession", tag: "", tagColor: "orange", children: ces(true) },
      { label: "Sans cession", tag: "", tagColor: "gray", children: ces(false) },
    ];
  }
  return [
    { label: "Marie(e) communaute", tag: "oui", tagColor: "pink", children: mar(true) },
    { label: "Non marie(e) communaute", tag: "non", tagColor: "gray", children: mar(false) },
  ];
}

function buildSPFPLTree(prof: string): TreeNode[] {
  function mar(m: boolean): TreeNode[] {
    return [
      mkLeaf("Cession", spfplDocs(prof, m, "Cession")),
      mkLeaf("Apport", spfplDocs(prof, m, "Apport")),
      mkLeaf("Cession + Apport", spfplDocs(prof, m, "Cession + Apport")),
    ];
  }
  return [
    { label: "Marie(e) communaute", tag: "oui", tagColor: "pink", children: mar(true) },
    { label: "Non marie(e) communaute", tag: "non", tagColor: "gray", children: mar(false) },
  ];
}

const profs = ["Dentiste", "Medecin", "Kine"];

export const treeData: TreeNode = {
  label: "Depart",
  tag: "207 cas",
  tagColor: "blue",
  children: [
    {
      label: "SELARL",
      tag: "60 cas",
      tagColor: "blue",
      note: "Cession systematique",
      children: profs.map((p) => ({ label: p, tag: "", tagColor: "green", children: buildSELARLTree(p) })),
    },
    {
      label: "SELAS",
      tag: "120 cas",
      tagColor: "purple",
      children: profs.map((p) => ({ label: p, tag: "", tagColor: "green", children: buildSELASTree(p) })),
    },
    {
      label: "SPFPL",
      tag: "18 cas",
      tagColor: "orange",
      children: profs.map((p) => ({ label: p, tag: "", tagColor: "green", children: buildSPFPLTree(p) })),
    },
    {
      label: "Societes civiles (SC)",
      tag: "9 cas",
      tagColor: "gray",
      children: [
        {
          label: "SCI",
          tag: "2 cas",
          tagColor: "teal",
          children: [
            mkLeaf("IR - 2 associes ou plus", scDocs("SCI", "IR", "2+")),
            mkLeaf("IS - 2 associes ou plus", scDocs("SCI", "IS", "2+")),
          ],
        },
        {
          label: "SAS",
          tag: "2 cas",
          tagColor: "teal",
          children: [
            mkLeaf("Associe unique", scDocs("SAS", "--", "1")),
            mkLeaf("2 associes ou plus", scDocs("SAS", "--", "2+")),
          ],
        },
        {
          label: "SCI IRIS",
          tag: "2 cas",
          tagColor: "teal",
          children: [
            mkLeaf("IR - 2 associes ou plus", scDocs("SCI IRIS", "IR", "2+")),
            mkLeaf("IS - 2 associes ou plus", scDocs("SCI IRIS", "IS", "2+")),
          ],
        },
        mkLeaf("Micro Holding - 2 associes ou plus", scDocs("Micro Holding", "--", "2+")),
        mkLeaf("SCS - 2 associes ou plus", scDocs("SCS", "--", "2+")),
        mkLeaf("SCM - 2 associes ou plus", scDocs("SCM", "--", "2+")),
      ],
    },
  ],
};
