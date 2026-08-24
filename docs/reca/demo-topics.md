# Reca — Demo topics (Biology & Chemistry)

**Purpose:** Fixed topics for Claude testing + live demo. Do not improvise on stage.  
**Coverage:** 10 topics (6 Biology, 4 Chemistry) — WAEC/JAMB style, SS2/SS3 level.  
**Primary live demo topic:** #1 Photosynthesis  
**Backup live demo topic:** #2 Osmosis  

Give this file to backend for prompt testing. Related: [demo-script.md](./demo-script.md)

---

## How to use

1. Student sends: `explain <topic>` or the exact student line below  
2. Reca explains in plain language (3–5 sentences)  
3. Reca asks the 2 questions  
4. Use the **wrong** sample in demos when you need a resurface  
5. Use the **right** sample to clear a topic  

---

## Biology

### 1. Photosynthesis — PRIMARY DEMO

**Student says:** `Explain photosynthesis simply`

**Must-cover concepts:** sunlight, chlorophyll/chloroplast, CO₂ + water → glucose + oxygen

**Q1:** Which part of the plant cell captures sunlight for photosynthesis?  
**Correct:** chloroplast (accept: chlorophyll in chloroplast — lenient)  
**Wrong (demo):** mitochondria  

**Q2:** What are the two main products of photosynthesis?  
**Correct:** glucose and oxygen  
**Wrong:** water and carbon dioxide  

**Resurface line:** Quick recall — which part of the plant cell captures sunlight for photosynthesis?

---

### 2. Osmosis — BACKUP DEMO

**Student says:** `Explain osmosis simply`

**Must-cover concepts:** water movement, selectively permeable membrane, high → low water concentration / dilute → concentrated solution

**Q1:** In osmosis, what substance moves across the membrane?  
**Correct:** water  
**Wrong:** salt / sugar  

**Q2:** Does water move from a dilute solution to a concentrated solution, or the other way?  
**Correct:** from dilute to concentrated (or high water potential to low)  
**Wrong:** from concentrated to dilute  

**Resurface line:** Quick recall — in osmosis, what substance moves across the membrane?

---

### 3. Respiration (aerobic)

**Student says:** `Explain aerobic respiration`

**Must-cover concepts:** glucose + oxygen → energy (ATP) + CO₂ + water; mitochondria

**Q1:** Which organelle is the main site of aerobic respiration in cells?  
**Correct:** mitochondrion / mitochondria  
**Wrong:** chloroplast  

**Q2:** Name two waste products of aerobic respiration.  
**Correct:** carbon dioxide and water  
**Wrong:** oxygen and glucose  

---

### 4. Cell structure

**Student says:** `Explain the main parts of an animal cell`

**Must-cover concepts:** nucleus, cytoplasm, cell membrane, mitochondria (no cell wall/chloroplast)

**Q1:** Which part of the cell controls cell activities and contains DNA?  
**Correct:** nucleus  
**Wrong:** cytoplasm  

**Q2:** What is the function of the cell membrane?  
**Correct:** controls what enters and leaves the cell (selectively permeable)  
**Wrong:** makes food for the cell  

---

### 5. Digestion (human)

**Student says:** `Explain digestion simply`

**Must-cover concepts:** breaking food into smaller soluble molecules; enzymes; absorption

**Q1:** What do digestive enzymes do to food?  
**Correct:** break it down into smaller/soluble molecules  
**Wrong:** store it for energy only  

**Q2:** Where does most absorption of digested food occur?  
**Correct:** small intestine  
**Wrong:** stomach  

---

### 6. Ecology — food chain

**Student says:** `Explain a food chain`

**Must-cover concepts:** producer → consumer; energy flow; example (grass → grasshopper → bird)

**Q1:** What is a producer in a food chain?  
**Correct:** organism that makes its own food (usually plants / photosynthesis)  
**Wrong:** animal that eats other animals  

**Q2:** In grass → rabbit → fox, which is the secondary consumer?  
**Correct:** fox  
**Wrong:** grass / rabbit  

---

## Chemistry

### 7. Acids, bases, salts

**Student says:** `Explain acids and bases simply`

**Must-cover concepts:** acids (H⁺ / sour / turn litmus red); bases (OH⁻ / bitter / litmus blue); salt from acid + base

**Q1:** What colour does blue litmus paper turn in an acid?  
**Correct:** red  
**Wrong:** blue / green  

**Q2:** What type of substance is formed when an acid reacts with a base?  
**Correct:** salt (and water)  
**Wrong:** only oxygen  

---

### 8. States of matter

**Student says:** `Explain the three states of matter`

**Must-cover concepts:** solid / liquid / gas; particle arrangement; melting / boiling / condensation / freezing

**Q1:** In which state are particles closest together and vibrate in fixed positions?  
**Correct:** solid  
**Wrong:** gas  

**Q2:** What is the change of state from liquid to gas called?  
**Correct:** evaporation / boiling (accept either with context)  
**Wrong:** melting  

---

### 9. Atomic structure

**Student says:** `Explain atomic structure simply`

**Must-cover concepts:** protons, neutrons (nucleus), electrons (shells); proton number

**Q1:** Which particles are found in the nucleus of an atom?  
**Correct:** protons and neutrons  
**Wrong:** electrons only  

**Q2:** Which particle has a negative charge?  
**Correct:** electron  
**Wrong:** proton  

---

### 10. Separation techniques

**Student says:** `Explain filtration and evaporation`

**Must-cover concepts:** filtration (insoluble solid from liquid); evaporation (soluble solid from solution)

**Q1:** Which method separates sand from water?  
**Correct:** filtration  
**Wrong:** evaporation only  

**Q2:** Which method would you use to get salt from salt solution?  
**Correct:** evaporation / crystallisation  
**Wrong:** filtration  

---

## Backend test matrix (quick)

| Topic | Send | Wrong answer to force resurface |
|-------|------|----------------------------------|
| Photosynthesis | `Explain photosynthesis simply` | Q1: mitochondria |
| Osmosis | `Explain osmosis simply` | Q1: salt |
| Aerobic respiration | `Explain aerobic respiration` | Q1: chloroplast |
| Acids & bases | `Explain acids and bases simply` | Q1: blue |

Run all 10 through explain+quiz+grade at least once before demo day.
