/**
 * Extra WAEC/JAMB subject seeds — English Language, Agriculture,
 * Further Mathematics, Yoruba, Igbo, Hausa.
 * Loaded by generate-curriculum.js (same shape as SEEDS entries).
 */
function q(prompt, answer, distractors, extraAccept = []) {
  return { prompt, answer, distractors, extraAccept };
}

const EXTRA_SEEDS = [
  // ——— ENGLISH LANGUAGE ———
  {
    subject: "English Language",
    title: "Parts of speech",
    explanation:
      "Parts of speech are the jobs words do in a sentence: nouns name, verbs show action or state, adjectives describe nouns, adverbs describe verbs, and so on. Knowing them helps you write clear WAEC essays and answer lexico-structural questions.",
    items: [
      q("A word that names a person, place, or thing is a?", "noun", ["verb", "adverb", "preposition"]),
      q("A word that shows action or state of being is a?", "verb", ["noun", "adjective", "conjunction"]),
      q("A word that describes a noun is an?", "adjective", ["adverb", "verb", "pronoun"]),
      q("A word that describes a verb is an?", "adverb", ["adjective", "noun", "article"]),
      q("He, she, it, they are examples of?", "pronouns", ["adjectives", "prepositions", "interjections"]),
      q("And, but, or are examples of?", "conjunctions", ["prepositions", "articles", "nouns"]),
      q("In, on, under, between are examples of?", "prepositions", ["conjunctions", "verbs", "adverbs"]),
      q("A, an, the are called?", "articles", ["pronouns", "verbs", "interjections"]),
      q("Wow! and Oh! are examples of?", "interjections", ["prepositions", "nouns", "clauses"]),
      q("Quickly is usually an?", "adverb", ["adjective", "noun", "article"]),
    ],
  },
  {
    subject: "English Language",
    title: "Tenses",
    explanation:
      "Tense shows when an action happens. Present simple states habits or facts; past simple shows completed actions; future forms talk about what will happen. WAEC tests correct tense in continuous writing and objective papers.",
    items: [
      q("I go to school every day uses which tense?", "present simple", ["past perfect", "future perfect", "past continuous"]),
      q("She wrote a letter yesterday uses?", "past simple", ["present simple", "present continuous", "future simple"]),
      q("They are reading now uses?", "present continuous", ["past simple", "present perfect", "future perfect"]),
      q("He will arrive tomorrow uses?", "future simple", ["past simple", "present perfect", "past continuous"]),
      q("I have finished my work uses?", "present perfect", ["past simple only", "future simple", "present continuous"]),
      q("By 8pm she had left uses?", "past perfect", ["present simple", "future simple", "present continuous"]),
      q("Which tense often marks a completed past action with a time word like yesterday?", "past simple", ["present perfect", "future continuous", "present simple"]),
      q("Habitual actions usually take?", "present simple", ["past perfect", "future perfect", "past continuous"]),
      q("Was/were + -ing forms the?", "past continuous", ["present simple", "future simple", "present perfect"]),
      q("Has/have + past participle forms the?", "present perfect", ["past simple", "future simple", "present continuous"]),
    ],
  },
  {
    subject: "English Language",
    title: "Figures of speech",
    explanation:
      "Figures of speech make language vivid. A simile compares using like or as; a metaphor says one thing is another; personification gives human traits to non-human things. These appear often in comprehension and literature-linked English questions.",
    items: [
      q("As brave as a lion is a?", "simile", ["metaphor", "irony", "hyperbole"]),
      q("He is a lion in battle is a?", "metaphor", ["simile", "alliteration", "pun"]),
      q("The wind whispered is?", "personification", ["simile", "metaphor only", "oxymoron"]),
      q("Exaggeration for effect is?", "hyperbole", ["litotes", "simile", "pun"]),
      q("Opposite ideas side by side can be?", "antithesis", ["simile", "alliteration", "onomatopoeia"]),
      q("Bang! and hiss are examples of?", "onomatopoeia", ["metaphor", "irony", "euphemism"]),
      q("Saying the opposite of what you mean for effect is?", "irony", ["simile", "alliteration", "metaphor"]),
      q("Peter Piper picked is an example of?", "alliteration", ["assonance only", "hyperbole", "pun"]),
      q("A mild expression for something harsh is a?", "euphemism", ["hyperbole", "simile", "oxymoron"]),
      q("Deafening silence is an?", "oxymoron", ["simile", "metaphor", "pun"]),
    ],
  },
  {
    subject: "English Language",
    title: "Essay writing",
    explanation:
      "WAEC essay types include narrative, descriptive, argumentative, and letter writing. Plan with an outline, write clear paragraphs with one main idea each, and always check grammar and punctuation before you finish.",
    items: [
      q("A story of events is usually a?", "narrative essay", ["formal letter only", "summary only", "comprehension only"]),
      q("An essay that paints a picture in words is?", "descriptive", ["algebraic", "tabular", "binary"]),
      q("An essay that argues for or against a view is?", "argumentative", ["only narrative", "only letter", "only poem"]),
      q("A letter to the editor is usually?", "formal", ["slang only", "emoji style", "unsigned always"]),
      q("The first paragraph of an essay often?", "introduces the topic", ["lists references only", "ends the story", "ignores the question"]),
      q("One paragraph should mainly develop?", "one main idea", ["ten unrelated ideas", "only one word", "only quotes"]),
      q("In a formal letter, the complimentary close may be?", "Yours faithfully", ["See ya", "XOXO", "Later"]),
      q("Before submitting an essay you should?", "proofread", ["delete the title always", "remove paragraphs", "add slang only"]),
      q("A topic sentence usually appears?", "at or near the start of a paragraph", ["only in footnotes", "only in the title", "never"]),
      q("Word limit in exams means you should?", "plan and stay relevant", ["write endlessly", "ignore the question", "copy the passage"]),
    ],
  },
  {
    subject: "English Language",
    title: "Summary and comprehension",
    explanation:
      "Comprehension tests understanding of a passage; summary tests selecting main points in fewer words without changing meaning. Read the question first, underline key ideas, and avoid copying long chunks word-for-word when summarising.",
    items: [
      q("A summary should be?", "shorter than the original", ["longer always", "identical wording only", "unrelated"]),
      q("In summary avoid?", "unnecessary examples and repetition", ["main ideas", "clarity", "logical order"]),
      q("Comprehension questions test?", "understanding of the passage", ["only spelling lists", "only maths", "only drawing"]),
      q("When a question says in your own words you should?", "paraphrase", ["copy whole sentences", "leave blank", "draw only"]),
      q("The main idea of a passage is the?", "central point", ["first adjective", "longest word", "page number"]),
      q("Supporting details?", "explain or prove the main idea", ["replace the title", "are always jokes", "must be ignored"]),
      q("Inference means?", "reading between the lines", ["copying only", "skipping the text", "counting words only"]),
      q("A good summary keeps the?", "writer’s meaning", ["your unrelated opinion only", "every adjective", "all examples"]),
      q("Skimming is reading for?", "general idea quickly", ["every letter slowly always", "only last line", "pictures only"]),
      q("Scanning is reading for?", "specific information", ["fun only", "rhymes only", "fonts only"]),
    ],
  },
  {
    subject: "English Language",
    title: "Punctuation and agreement",
    explanation:
      "Punctuation and concord (agreement) keep sentences clear. A full stop ends a statement; a question mark ends a question; subject and verb must agree in number. These are high-frequency objective and essay marks.",
    items: [
      q("A statement normally ends with a?", "full stop", ["question mark", "exclamation only always", "comma only"]),
      q("A direct question ends with a?", "question mark", ["full stop only", "semicolon", "colon only"]),
      q("She go is wrong because of?", "subject-verb agreement", ["capital letters only", "spacing only", "font"]),
      q("The boys is playing should be?", "The boys are playing", ["The boys am playing", "The boys be playing", "The boys was playing"]),
      q("Commas often separate?", "items in a list", ["every letter", "paragraphs only", "books from shelves"]),
      q("An apostrophe can show?", "possession or omission", ["plural of all nouns always", "only volume", "only tense"]),
      q("Its means?", "possessive of it", ["it is", "it has always", "plural of it"]),
      q("It’s means?", "it is / it has", ["possessive of it", "plural of it", "past of it"]),
      q("Quotation marks mainly enclose?", "direct speech or titles", ["all verbs", "all spaces", "page margins"]),
      q("A run-on sentence wrongly?", "joins sentences without proper punctuation", ["uses nouns", "uses verbs", "uses adjectives"]),
    ],
  },

  // ——— AGRICULTURE ———
  {
    subject: "Agriculture",
    title: "Soil and soil fertility",
    explanation:
      "Soil supports plant roots and holds water and nutrients. Fertility depends on organic matter, minerals, pH, and living organisms. Farmers improve soil with manure, fertiliser, crop rotation, and good tillage.",
    items: [
      q("The top layer of earth where plants grow is?", "soil", ["bedrock only", "atmosphere", "mantle"]),
      q("Humus is mainly?", "decomposed organic matter", ["pure sand", "pure rock", "pure metal"]),
      q("Loam soil is valued because it?", "balances sand, silt and clay", ["is pure clay only", "has no water", "has no air"]),
      q("Nitrogen in fertilisers mainly promotes?", "leafy growth", ["only flower colour", "only root wood", "only pests"]),
      q("Phosphorus mainly helps?", "roots and early growth", ["only leaf green always", "only taste", "only weeds"]),
      q("Potassium helps?", "fruit quality and disease resistance", ["only sand content", "only rainfall", "only wind"]),
      q("Crop rotation helps?", "maintain soil fertility", ["remove all oxygen", "stop photosynthesis", "end rainfall"]),
      q("Lime is often added to?", "reduce soil acidity", ["increase acidity always", "remove all water", "kill all roots"]),
      q("Erosion is the?", "wearing away of soil", ["adding of humus", "planting only", "harvesting only"]),
      q("Mulching helps to?", "conserve moisture and reduce weeds", ["increase erosion", "remove nutrients", "block all sunlight forever"]),
    ],
  },
  {
    subject: "Agriculture",
    title: "Crop production",
    explanation:
      "Crop production covers choosing crops, preparing land, planting, weeding, protecting against pests and diseases, and harvesting. Good timing and spacing raise yield for WAEC practical and theory questions.",
    items: [
      q("Planting seeds in the soil is?", "sowing", ["milking", "shearing", "grafting only always"]),
      q("Removing unwanted plants is?", "weeding", ["pruning fish", "incubation", "candling"]),
      q("A nursery is used to?", "raise young seedlings", ["store tractors only", "milk cows", "shear sheep"]),
      q("Transplanting moves seedlings from?", "nursery to field", ["field to moon", "market to bank", "river to sky"]),
      q("Monocot crops include?", "maize", ["mango only", "cocoa only", "orange only"]),
      q("A cash crop is grown mainly for?", "sale/income", ["home decoration only", "fun only", "noise"]),
      q("Food crops are grown mainly for?", "food", ["export jewellery", "fuel only always", "cement"]),
      q("Irrigation supplies?", "water to crops", ["only fertiliser salt", "only pests", "only shade"]),
      q("Harvesting is?", "gathering mature crops", ["planting seeds", "ploughing only", "fencing only"]),
      q("Spacing plants correctly helps?", "reduce competition", ["increase disease always", "stop photosynthesis", "remove soil"]),
    ],
  },
  {
    subject: "Agriculture",
    title: "Animal husbandry",
    explanation:
      "Animal husbandry is the care and breeding of farm animals for meat, milk, eggs, and other products. It includes housing, feeding, health care, and breeding systems tested in WAEC Agriculture.",
    items: [
      q("Husbandry means care of?", "farm animals", ["only machines", "only rivers", "only clouds"]),
      q("Cattle are mainly kept for?", "meat and milk", ["wool only", "eggs only", "honey only"]),
      q("Poultry includes?", "chickens and related birds", ["only goats", "only fish", "only bees"]),
      q("A male cattle is a?", "bull", ["cow", "hen", "ewe"]),
      q("A female cattle that has calved is a?", "cow", ["bull", "ram", "boar"]),
      q("Ruminants can?", "chew the cud", ["lay eggs", "photosynthesise", "fly long distances"]),
      q("Concentrates are feeds that are?", "high in nutrients", ["only water", "only sand", "only wood"]),
      q("Roughages are?", "fibrous feeds like hay/grass", ["only salt blocks", "only antibiotics", "only vaccines"]),
      q("Vaccination helps?", "prevent disease", ["increase erosion", "remove soil", "stop rain"]),
      q("Deep litter is a system for?", "housing poultry", ["growing cocoa", "irrigating rice only", "fishing"]),
    ],
  },
  {
    subject: "Agriculture",
    title: "Agricultural tools and machines",
    explanation:
      "Farm tools and machines make land preparation and harvesting easier. Hand tools suit small plots; tractors and implements suit larger farms. Safety and correct use are common exam points.",
    items: [
      q("A cutlass is mainly used for?", "cutting and clearing", ["milking", "weighing eggs", "measuring rainfall"]),
      q("A hoe is used for?", "tillage and weeding", ["spraying insecticides only", "incubating eggs", "shearing"]),
      q("A plough is used to?", "turn and break soil", ["harvest honey", "milk cows", "count chicks"]),
      q("A tractor provides?", "power for farm operations", ["only shade", "only rainfall", "only compost"]),
      q("A watering can supplies?", "water to plants", ["fuel to tractors", "feed to fish only", "electricity"]),
      q("A sickle is used for?", "harvesting cereals", ["ploughing deep soil", "spraying", "fencing wire only"]),
      q("A wheelbarrow helps?", "carry loads", ["hatch eggs", "measure pH", "graft trees"]),
      q("A sprayer applies?", "pesticides or liquid fertiliser", ["only seeds", "only manure blocks", "only fences"]),
      q("Maintenance of tools includes?", "cleaning and oiling", ["burying them wet", "never sharpening", "leaving in rain always"]),
      q("Unsafe tool use can cause?", "injury", ["higher yield always", "better soil always", "more rain"]),
    ],
  },
  {
    subject: "Agriculture",
    title: "Pests and diseases",
    explanation:
      "Pests and diseases reduce crop and animal yield. Control methods include cultural practices, biological control, and careful chemical use. Identify the problem before choosing a control method.",
    items: [
      q("An insect that damages crops is a?", "pest", ["fertiliser", "mulch", "legume"]),
      q("Aphids often damage plants by?", "sucking sap", ["adding humus", "pollinating only always", "watering roots"]),
      q("Weeds compete with crops for?", "light, water and nutrients", ["only music", "only fencing", "only tractors"]),
      q("Fungal diseases often spread in?", "humid conditions", ["only deserts always", "outer space", "pure vacuum"]),
      q("Quarantine helps?", "prevent spread of disease", ["increase pests", "remove all soil", "stop photosynthesis"]),
      q("Biological control uses?", "natural enemies of pests", ["only more pests", "only fire always", "only salt water always"]),
      q("Cultural control includes?", "crop rotation and sanitation", ["only random spraying daily", "abandoning farms", "removing all air"]),
      q("Chemical control uses?", "pesticides", ["only songs", "only chalk", "only plastic bags"]),
      q("Overuse of pesticides can?", "harm useful insects and environment", ["always improve soil forever", "create rainfall", "end erosion forever"]),
      q("Resistant varieties are plants that?", "withstand certain pests/diseases better", ["never need water", "are always weeds", "cannot grow"]),
    ],
  },
  {
    subject: "Agriculture",
    title: "Farm economics and marketing",
    explanation:
      "Farm economics looks at costs, returns, and decisions that make farming profitable. Marketing moves produce from farm to consumer. Records help farmers plan and satisfy WAEC practical farm account questions.",
    items: [
      q("Profit is roughly?", "revenue minus costs", ["costs minus rain", "only capital", "only labour hours"]),
      q("Fixed costs do not change much with?", "output level in the short run", ["day of week names", "farmer’s height", "cloud colour"]),
      q("Variable costs change with?", "level of production", ["the alphabet", "shoe size", "phone brand"]),
      q("A farm budget helps?", "plan expected costs and returns", ["predict earthquakes", "stop pests magically", "change climate"]),
      q("Marketing channels move goods from?", "producer to consumer", ["consumer to sun", "bank to river", "school to orbit"]),
      q("Middlemen in marketing often?", "link farmers to buyers", ["grow crops for free always", "replace soil", "make rain"]),
      q("Keeping farm records helps?", "decision-making and accountability", ["erase history", "hide losses always", "avoid planting"]),
      q("Subsistence farming mainly aims to?", "feed the farm family", ["export only jets", "mine gold only", "build roads only"]),
      q("Commercial farming mainly aims to?", "produce for sale", ["barter only silence", "avoid markets", "grow nothing"]),
      q("Cooperative societies help farmers by?", "pooling resources and bargaining power", ["banning all sales", "removing land", "ending education"]),
    ],
  },

  // ——— FURTHER MATHEMATICS ———
  {
    subject: "Further Mathematics",
    title: "Functions and mappings",
    explanation:
      "Further Mathematics treats functions as mappings from one set to another. You meet domain, range, inverse functions, and composite functions — core ideas for WAEC Further Maths objectives and algebra papers.",
    items: [
      q("A function assigns to each valid input?", "exactly one output", ["many unrelated outputs always", "no output", "only zero"]),
      q("The set of allowed inputs is the?", "domain", ["range only", "codomain only always", "gradient"]),
      q("The set of actual outputs is the?", "range", ["domain", "vertex only", "intercept only"]),
      q("f(x) = 2x + 1 is a?", "linear function", ["circle only", "constant zero only", "undefined always"]),
      q("(fog)(x) means?", "f(g(x))", ["g(f) only reversed always wrong", "f+g", "f−g"]),
      q("An inverse function undoes the?", "original function", ["domain name", "graph paper", "calculator brand"]),
      q("y = x² is not one-to-one on all real x because?", "two x values can share one y", ["it is linear", "it has no graph", "it is constant"]),
      q("A one-to-one function has an?", "inverse (on suitable domain)", ["infinite slope always", "no graph", "no domain"]),
      q("f(x) = c (constant) has range?", "{c}", ["all real numbers always", "empty set", "integers only always"]),
      q("Vertical line test checks if a graph is a?", "function of x", ["circle area", "triangle", "matrix"]),
    ],
  },
  {
    subject: "Further Mathematics",
    title: "Binomial expansion",
    explanation:
      "The binomial theorem expands (a + b)^n. For positive integer n you use combinations nCr. Further Maths also uses approximations for small x in (1 + x)^n.",
    items: [
      q("In (a+b)^n for positive integer n, coefficients follow?", "binomial coefficients nCr", ["random primes only", "only factorials of π", "only 1s"]),
      q("nC0 equals?", "1", ["0", "n", "n!"]),
      q("nCn equals?", "1", ["0", "n", "2n"]),
      q("nC1 equals?", "n", ["1", "0", "n!"]),
      q("The expansion of (a+b)^2 is?", "a² + 2ab + b²", ["a² + b²", "a² − b²", "2a + 2b"], ["a^2+2ab+b^2"]),
      q("Pascal’s triangle rows give?", "binomial coefficients", ["prime factors only", "only even numbers", "matrix determinants"]),
      q("For small x, (1+x)^n ≈?", "1 + nx (first order)", ["nx only", "1/x", "n/x"]),
      q("The constant term in (x + 2)^3 is?", "8", ["1", "3", "6"]),
      q("Symmetry of binomial coefficients: nCr = ?", "nC(n−r)", ["nCr+1 always", "r!", "n!"]),
      q("Number of terms in (a+b)^n for integer n≥0 is?", "n+1", ["n", "2n", "n−1"]),
    ],
  },
  {
    subject: "Further Mathematics",
    title: "Sequences and series",
    explanation:
      "Sequences list terms in order; series add them. Arithmetic sequences have a constant difference; geometric sequences have a constant ratio. Sum formulae are standard Further Maths tools.",
    items: [
      q("An arithmetic sequence has constant?", "common difference", ["common ratio", "common logarithm", "common angle"]),
      q("A geometric sequence has constant?", "common ratio", ["common difference", "common height", "common mass"]),
      q("nth term of AP: a + (n−1)d uses a as?", "first term", ["last term only", "common ratio", "sum"]),
      q("Sum of first n terms of AP uses formula involving?", "n/2 [2a+(n−1)d]", ["only a×d", "only r^n", "only n!"]),
      q("nth term of GP: ar^(n−1) uses r as?", "common ratio", ["common difference", "sum", "mean"]),
      q("If |r|<1, sum to infinity of GP is?", "a/(1−r)", ["a/r", "ar", "1−r"]),
      q("2, 5, 8, 11… is?", "arithmetic", ["geometric", "harmonic only", "random"]),
      q("3, 6, 12, 24… is?", "geometric", ["arithmetic", "constant", "quadratic only"]),
      q("Common difference of 7, 10, 13 is?", "3", ["7", "10", "1"]),
      q("Common ratio of 2, 6, 18 is?", "3", ["2", "6", "9"]),
    ],
  },
  {
    subject: "Further Mathematics",
    title: "Differentiation basics",
    explanation:
      "Differentiation finds the rate of change and the gradient of a curve. For y = x^n, dy/dx = n x^(n−1). Applications include turning points and small changes — classic Further Maths territory.",
    items: [
      q("Derivative of x^n is?", "n x^(n−1)", ["x^n", "n x^n", "x/n"], ["nx^{n-1}"]),
      q("Derivative of a constant is?", "0", ["1", "the constant", "infinity"]),
      q("Derivative of x is?", "1", ["0", "x", "2x"]),
      q("At a turning point, dy/dx is often?", "0", ["1", "undefined always", "infinite always"]),
      q("Second derivative helps test?", "max/min nature", ["only domain name", "only intercept letter", "only units"]),
      q("If dy/dx > 0 the function is locally?", "increasing", ["decreasing", "constant zero", "undefined"]),
      q("Gradient of tangent equals?", "dy/dx at that point", ["y intercept only", "x intercept only", "area"]),
      q("Derivative of 3x² is?", "6x", ["3x", "6x²", "3"], ["6x"]),
      q("Chain rule differentiates?", "composite functions", ["only constants", "only sums of zeros", "only integers"]),
      q("Stationary point means?", "gradient zero", ["function zero always", "x zero always", "no graph"]),
    ],
  },
  {
    subject: "Further Mathematics",
    title: "Integration basics",
    explanation:
      "Integration is the reverse of differentiation and also finds area under a curve. ∫ x^n dx = x^(n+1)/(n+1) + C (n ≠ −1). Definite integrals give a numeric area between limits.",
    items: [
      q("∫ x^n dx (n≠−1) equals?", "x^(n+1)/(n+1) + C", ["n x^(n−1)", "x^n", "n!"], ["x^{n+1}/(n+1)+C"]),
      q("The +C is the?", "constant of integration", ["common ratio", "gradient", "domain"]),
      q("Definite integral has?", "limits", ["no meaning", "only letters", "only matrices"]),
      q("∫ 0 dx equals?", "C (constant)", ["x", "1", "infinity"]),
      q("∫ 1 dx equals?", "x + C", ["1", "0", "x²"]),
      q("Integration can find?", "area under a curve", ["only slope name", "only domain colour", "only mode"]),
      q("Reverse of differentiation is?", "integration", ["factorisation only", "expansion only", "translation"]),
      q("∫ 2x dx equals?", "x² + C", ["2", "2x²", "x"], ["x^2+C"]),
      q("If F'(x)=f(x) then F is an?", "antiderivative of f", ["inverse matrix", "mode", "median"]),
      q("Area between curve and x-axis may need care when the curve is?", "below the axis", ["a constant 1 only", "never negative", "always linear"]),
    ],
  },
  {
    subject: "Further Mathematics",
    title: "Matrices and determinants (2×2)",
    explanation:
      "A 2×2 matrix stores numbers in rows and columns. You can add matrices, multiply by a scalar, multiply compatible matrices, and find determinants and inverses when the determinant is not zero.",
    items: [
      q("A 2×2 matrix has how many entries?", "4", ["2", "3", "8"]),
      q("Order 2×3 means?", "2 rows and 3 columns", ["3 rows and 2 columns", "5 entries", "square only"]),
      q("Determinant of [[a,b],[c,d]] is?", "ad−bc", ["ab−cd", "a+d", "ac+bd"], ["ad-bc"]),
      q("If det(A)=0 then A is?", "singular (no inverse)", ["always identity", "always orthogonal", "always diagonal 1"]),
      q("Identity 2×2 matrix has?", "1s on diagonal, 0s elsewhere", ["all 1s", "all 0s", "all 2s"]),
      q("Scalar multiplication multiplies?", "every entry by the scalar", ["only the determinant", "only one row", "only trace"]),
      q("Matrix addition needs?", "same order", ["same determinant only", "same inverse", "same name"]),
      q("Inverse of A exists when?", "det(A) ≠ 0", ["det(A)=0", "A has letters", "A is empty"]),
      q("Transpose swaps?", "rows and columns", ["signs only", "determinants only", "scalars only"]),
      q("AB is not always equal to?", "BA", ["A", "B", "I always"]),
    ],
  },

  // ——— YORUBA ———
  {
    subject: "Yoruba",
    title: "Yoruba greetings",
    explanation:
      "Yoruba greetings change with time of day and show respect. Ẹ kú àárọ̀ is a morning greeting; Ẹ kú ọ̀sán fits the afternoon. WAEC Yoruba expects correct, polite forms in conversation items.",
    items: [
      q("A common Yoruba morning greeting is?", "Ẹ kú àárọ̀", ["Ẹ kú alẹ́ only", "Bawo ni only always", "O da abo only"]),
      q("Good afternoon in Yoruba is often?", "Ẹ kú ọ̀sán", ["Ẹ kú àárọ̀", "Ẹ kú alẹ́", "Ojúmọ́"]),
      q("Good evening/night greeting often starts with?", "Ẹ kú alẹ́", ["Ẹ kú àárọ̀", "Káàbọ̀ only", "Ẹ sé only"]),
      q("How are you? can be asked as?", "Báwo ni?", ["Kílọ́ nṣe? only always", "Ṣé dàda?", "Dára"]),
      q("Thank you in Yoruba is?", "Ẹ ṣé", ["Máa binú", "Pẹ̀lẹ́ only", "Wá"]),
      q("Welcome can be?", "Ẹ kú àbọ̀ / Káàbọ̀", ["Ẹ kú iṣẹ́ only", "Padà", "Sùn"], ["Kaabo", "Káàbọ̀"]),
      q("Please / sorry softening word often heard is?", "Pẹ̀lẹ́", ["Jáde", "Sáré", "Kọ́"]),
      q("Yes in Yoruba is often?", "Bẹ́ẹ̀ni", ["Rárá", "Kòsí", "Máṣe"]),
      q("No in Yoruba is often?", "Rárá", ["Bẹ́ẹ̀ni", "Ẹ ṣé", "Káàbọ̀"]),
      q("Goodbye (till we meet) idea is often?", "O dàbọ̀", ["Wá nísinsinyí only", "Jẹun", "Sùn síhìn"]),
    ],
  },
  {
    subject: "Yoruba",
    title: "Yoruba alphabet and sounds",
    explanation:
      "Standard Yoruba writing uses Latin letters with tone marks and dotted vowels (ẹ, ọ). Tones change meaning, so listening and correct diacritics matter in literacy and exam orthography questions.",
    items: [
      q("Yoruba is written mainly with the?", "Latin alphabet (with tones/diacritics)", ["only Arabic script always", "only hieroglyphs", "only numbers"]),
      q("Dotted e in Yoruba is written?", "ẹ", ["é only", "è only", "e without dot always"]),
      q("Dotted o in Yoruba is written?", "ọ", ["ó only", "ò only", "o without dot always"]),
      q("Tone marks help show?", "pitch/meaning differences", ["only font size", "only paragraph length", "only margins"]),
      q("Yoruba is primarily a?", "tone language", ["sign language only", "click-only language", "whistle language only"]),
      q("The letter gb in Yoruba represents?", "a single labial-velar sound", ["two separate words", "a number", "a punctuation mark"]),
      q("Capitalisation still applies to?", "names and sentence starts", ["every syllable always", "only verbs", "only tones"]),
      q("A word’s meaning can change if you change its?", "tone", ["paper colour", "margin", "font brand"]),
      q("Oral literature in Yoruba includes?", "oríkì and òwe (praise & proverbs)", ["only spreadsheets", "only code", "only maps"]),
      q("Correct spelling with diacritics is important for?", "clear meaning", ["hiding meaning", "removing grammar", "ending speech"]),
    ],
  },
  {
    subject: "Yoruba",
    title: "Yoruba numbers and counting",
    explanation:
      "Yoruba counting is used in daily life and appears in WAEC language papers. Learn the basic numerals first (one to ten), then build larger numbers with the language’s additive patterns.",
    items: [
      q("One in Yoruba is?", "ookan / ẹnìkan (context)", ["èjì", "ẹ̀ta", "ẹ̀rin"], ["okan", "ẹnìkan"]),
      q("Two in Yoruba is?", "èjì", ["ọ̀kan", "ẹ̀ta", "àrú́n"]),
      q("Three in Yoruba is?", "ẹ̀ta", ["èjì", "ẹ̀rin", "ẹ̀fà"]),
      q("Four in Yoruba is?", "ẹ̀rin", ["ẹ̀ta", "àrú́n", "èje"]),
      q("Five in Yoruba is?", "àrú́n", ["ẹ̀rin", "ẹ̀fà", "ẹ̀jọ"]),
      q("Six in Yoruba is?", "ẹ̀fà", ["àrú́n", "èje", "ẹ̀sán"]),
      q("Seven in Yoruba is?", "èje", ["ẹ̀fà", "ẹ̀jọ", "ẹ̀wá"]),
      q("Eight in Yoruba is?", "ẹ̀jọ", ["èje", "ẹ̀sán", "ọ̀kan"]),
      q("Nine in Yoruba is?", "ẹ̀sán", ["ẹ̀jọ", "ẹ̀wá", "èjì"]),
      q("Ten in Yoruba is?", "ẹ̀wá", ["ẹ̀sán", "ọgbọ̀n", "ogún"]),
    ],
  },
  {
    subject: "Yoruba",
    title: "Yoruba culture and orature",
    explanation:
      "Yoruba culture includes respect for elders, festivals, and rich orature — proverbs (òwe), praise poetry (oríkì), and folktales. Exam questions often link language forms to cultural meaning.",
    items: [
      q("Òwe means?", "proverb", ["only novel", "only dictionary", "only map"]),
      q("Oríkì is?", "praise poetry / lineage praise", ["only maths table", "only weather report", "only receipt"]),
      q("Showing respect to elders is?", "culturally important", ["discouraged", "illegal", "optional silence only"]),
      q("Folktales often teach?", "moral lessons", ["only chemistry", "only coding", "only banking"]),
      q("Traditional rulers in Yoruba land include the?", "Ọba", ["only Speaker of apps", "only referee", "only captain of ships always"]),
      q("Drumming and dance often appear at?", "festivals and ceremonies", ["only exams silently", "only libraries quietly always", "only farms never"]),
      q("Extended family ties are often?", "strong in traditional settings", ["forbidden", "nonexistent", "illegal"]),
      q("Language and culture are?", "closely linked", ["never linked", "opposites", "unrelated always"]),
      q("Greetings show?", "politeness and social awareness", ["anger only", "wealth only", "height only"]),
      q("Studying Yoruba orature helps you?", "understand values and history", ["forget culture", "avoid reading", "skip meaning"]),
    ],
  },

  // ——— IGBO ———
  {
    subject: "Igbo",
    title: "Igbo greetings",
    explanation:
      "Igbo greetings mark time of day and respect. Ị bọọla chi / Ị saala chi-type morning forms and Kedu? for “how are you?” are common in conversation practice for WAEC Igbo.",
    items: [
      q("A common way to ask How are you? in Igbo is?", "Kedu?", ["Biko only", "Ndewo only always", "Ee"]),
      q("Thank you in Igbo is?", "Daalụ", ["Mba", "Biko", "Kedụ"]),
      q("Please in Igbo is often?", "Biko", ["Daalụ", "Mba", "Nnọọ"]),
      q("Yes in Igbo is often?", "Ee / Éé", ["Mba", "Daalụ", "Biko"], ["Ee"]),
      q("No in Igbo is often?", "Mba", ["Ee", "Ndewo", "Daalụ"]),
      q("Welcome can be expressed as?", "Nnọọ / Nnọọta", ["Mba", "Gawa", "Sụọ"], ["Nnoo", "Nnọọ"]),
      q("Good morning ideas include?", "Ị bọọla chi (regional forms)", ["Only Daalụ", "Only Mba", "Only Biko"]),
      q("Reply culture in Igbo greetings shows?", "respect and warmth", ["rudeness", "silence only", "anger"]),
      q("Ndewo is commonly a?", "greeting/hello form", ["punishment", "number", "punctuation mark"]),
      q("Leaving politely may use forms like?", "Ka ọ dị / similar farewells", ["only Mba forever", "only numbers", "only verbs of running"]),
    ],
  },
  {
    subject: "Igbo",
    title: "Igbo alphabet and sounds",
    explanation:
      "Igbo uses a Latin-based orthography with special characters and tone. Sounds like gb, kp, and ṅ matter for correct spelling. Tone distinguishes meanings in many words.",
    items: [
      q("Igbo writing today mainly uses?", "Latin-based orthography", ["only Morse code", "only emoji", "only Roman numerals"]),
      q("Tone in Igbo can change?", "word meaning", ["only paper size", "only ink colour", "only margins"]),
      q("Digraphs like gb and kp represent?", "single sounds", ["two sentences", "punctuation", "numbers"]),
      q("Proper orthography helps?", "reading and exam accuracy", ["hide meaning", "remove grammar", "end speech"]),
      q("Igbo is a?", "tone language", ["gesture-only language", "number-only language", "silent language"]),
      q("Vowels in Igbo include?", "a e i o u and dotted forms in standard sets", ["only consonants", "only clicks", "only tones without letters"]),
      q("Capital letters are used for?", "names and sentence starts", ["every sound always", "only verbs", "only objects"]),
      q("Listening practice helps you master?", "tones and pronunciation", ["only calligraphy", "only page numbers", "only fonts"]),
      q("A dictionary entry often shows?", "tone/spelling carefully", ["only pictures of cars", "only maths", "only maps"]),
      q("Clear speech in Igbo class needs?", "correct sounds and tones", ["only speed", "only whispering forever", "only English loanwords"]),
    ],
  },
  {
    subject: "Igbo",
    title: "Igbo numbers",
    explanation:
      "Basic Igbo numerals are needed for shopping dialogues, comprehension, and objective questions. Learn one to ten firmly, then build larger values using Igbo number patterns.",
    items: [
      q("One in Igbo is?", "otu", ["abụọ", "atọ", "anọ"]),
      q("Two in Igbo is?", "abụọ", ["otu", "atọ", "ise"]),
      q("Three in Igbo is?", "atọ", ["abụọ", "anọ", "isii"]),
      q("Four in Igbo is?", "anọ", ["atọ", "ise", "asaa"]),
      q("Five in Igbo is?", "ise", ["anọ", "isii", "asatọ"]),
      q("Six in Igbo is?", "isii", ["ise", "asaa", "itoolu"]),
      q("Seven in Igbo is?", "asaa", ["isii", "asatọ", "iri"]),
      q("Eight in Igbo is?", "asatọ", ["asaa", "itoolu", "otu"]),
      q("Nine in Igbo is?", "itoolu", ["asatọ", "iri", "abụọ"]),
      q("Ten in Igbo is?", "iri", ["itoolu", "otu", "ise"]),
    ],
  },
  {
    subject: "Igbo",
    title: "Igbo culture and orature",
    explanation:
      "Igbo culture values community, respect, and expressive orature — proverbs (ilu), folktales, and masquerade traditions in many communities. Language papers often connect grammar to cultural context.",
    items: [
      q("Ilu refers to?", "proverbs", ["only novels from abroad", "only receipts", "only equations"]),
      q("Folktales often teach?", "morals and wisdom", ["only chemistry", "only coding", "only banking rules"]),
      q("Respect for elders is?", "highly valued", ["discouraged", "banned", "irrelevant"]),
      q("Extended family networks are often?", "important", ["forbidden", "invisible", "illegal"]),
      q("Masquerade traditions are part of?", "cultural performance in many communities", ["only ICT lab", "only algebra class", "only aviation"]),
      q("Language learning includes?", "culture and daily use", ["only silent reading of English", "avoiding speech", "deleting tones"]),
      q("Greetings in Igbo show?", "politeness", ["hostility only", "indifference only", "maths skill only"]),
      q("Storytelling evenings traditionally helped?", "pass values to the young", ["erase history", "avoid community", "end language"]),
      q("Market dialogue practice builds?", "practical vocabulary", ["only abstract silence", "only Latin", "only Morse"]),
      q("Studying Igbo orature strengthens?", "identity and comprehension", ["forgetfulness", "avoidance of meaning", "only handwriting speed"]),
    ],
  },

  // ——— HAUSA ———
  {
    subject: "Hausa",
    title: "Hausa greetings",
    explanation:
      "Hausa greetings are central to polite conversation. Sannu and Ina kwana? / Ina wuni? patterns appear throughout daily speech and WAEC Hausa oral and written items.",
    items: [
      q("A common Hausa hello/greeting is?", "Sannu", ["A'a only", "Na gode only always", "Lahiyya only"]),
      q("How are you? morning-style can be?", "Ina kwana?", ["Yaya sunanka only", "Za mu tafi only", "Kai only"]),
      q("How is the day? can be?", "Ina wuni?", ["Ina gida? only always", "Me ye faru?", "A'a"]),
      q("Thank you in Hausa is?", "Na gode", ["Sannu", "A'a", "Kai"]),
      q("Yes in Hausa is often?", "I / Eh", ["A'a", "Na gode", "Sai anjima"], ["I"]),
      q("No in Hausa is often?", "A'a", ["I", "Sannu", "Na gode"]),
      q("Please / excuse me softener often heard is?", "Don Allah", ["Gude", "Tafi", "Zo"]),
      q("Welcome can be?", "Maraba / Barka da zuwa", ["A'a", "Gaji", "Tsaya"], ["Maraba"]),
      q("Good night ideas include?", "Sai anjima / related farewells", ["only Na gode", "only numbers", "only verbs of eating"]),
      q("Responding to greetings shows?", "respect and good manners", ["anger", "refusal to speak forever", "exam cheating"]),
    ],
  },
  {
    subject: "Hausa",
    title: "Hausa alphabet and sounds",
    explanation:
      "Modern Hausa in Nigerian schools is commonly written in Latin script (Boko), with additional sounds such as ɓ, ɗ, ƙ. Correct spelling and pronunciation are tested in language papers.",
    items: [
      q("School Hausa orthography in Nigeria commonly uses?", "Latin (Boko) script", ["only Morse", "only emoji", "only Roman numerals"]),
      q("Special hooked letters like ɓ and ɗ represent?", "implosive sounds", ["punctuation", "numbers", "silence"]),
      q("Clear spelling helps?", "meaning and exam marks", ["hide words", "remove verbs", "end reading"]),
      q("Hausa has?", "consonants and vowels like other languages", ["only tones without letters", "only numbers", "only gestures"]),
      q("Capital letters mark?", "names and sentence starts", ["every syllable always", "only adjectives", "only objects"]),
      q("Listening drills improve?", "pronunciation", ["only page margins", "only ink colour", "only desk size"]),
      q("A minimal pair differs by?", "one sound/feature that changes meaning", ["paper brand", "shoe size", "weather"]),
      q("Dictation tests?", "accurate hearing and spelling", ["only drawing", "only running", "only singing"]),
      q("Reading aloud builds?", "fluency", ["only silence", "only fear of words", "only speed without meaning"]),
      q("Orthography rules should be?", "followed consistently", ["ignored", "changed every line", "random"]),
    ],
  },
  {
    subject: "Hausa",
    title: "Hausa numbers",
    explanation:
      "Hausa numerals appear in market dialogues and objective questions. Master one to ten, then practise combining forms used for larger counts in classroom Hausa.",
    items: [
      q("One in Hausa is?", "ɗaya", ["biyu", "uku", "huɗu"], ["daya"]),
      q("Two in Hausa is?", "biyu", ["ɗaya", "uku", "biyar"]),
      q("Three in Hausa is?", "uku", ["biyu", "huɗu", "shida"]),
      q("Four in Hausa is?", "huɗu", ["uku", "biyar", "bakwai"], ["hudu"]),
      q("Five in Hausa is?", "biyar", ["huɗu", "shida", "takwas"]),
      q("Six in Hausa is?", "shida", ["biyar", "bakwai", "tara"]),
      q("Seven in Hausa is?", "bakwai", ["shida", "takwas", "goma"]),
      q("Eight in Hausa is?", "takwas", ["bakwai", "tara", "ɗaya"]),
      q("Nine in Hausa is?", "tara", ["takwas", "goma", "biyu"]),
      q("Ten in Hausa is?", "goma", ["tara", "ishirin", "ɗari"]),
    ],
  },
  {
    subject: "Hausa",
    title: "Hausa culture and orature",
    explanation:
      "Hausa culture includes strong greeting customs, community life, and orature such as proverbs (karin magana) and folktales. Language exams often place vocabulary inside cultural situations.",
    items: [
      q("Karin magana refers to?", "proverbs / wise sayings", ["only bank notes", "only equations", "only URLs"]),
      q("Folktales often teach?", "moral lessons", ["only physics formulae", "only HTML", "only football scores"]),
      q("Greeting customs emphasise?", "respect and social harmony", ["rudeness", "isolation", "silence forever"]),
      q("Market language practice builds?", "everyday vocabulary", ["only abstract silence", "only Latin", "only binary"]),
      q("Community celebrations may include?", "music and shared food", ["only solo exams", "only empty rooms", "only silence"]),
      q("Elders are generally shown?", "respect", ["disrespect", "avoidance always", "mockery"]),
      q("Language and culture are?", "interwoven", ["opposites", "unrelated", "enemies"]),
      q("Storytelling passes on?", "values and history", ["only passwords", "only spam", "only noise"]),
      q("Polite request forms often invoke?", "Don Allah", ["only shouting", "only ignoring", "only laughing"]),
      q("Studying Hausa orature improves?", "comprehension and cultural insight", ["forgetfulness", "avoiding meaning", "only typing speed"]),
    ],
  },
];

module.exports = { EXTRA_SEEDS };
