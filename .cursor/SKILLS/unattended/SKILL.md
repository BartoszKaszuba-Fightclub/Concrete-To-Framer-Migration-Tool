---
name: unattended
description: >-
  Decides and finishes work when nobody can answer during the run. Use for an
  unattended run: a Cloud Agent, a background agent, a subagent, or
  cursor-agent -p, and when the prompt says onbeheerd or unattended.
---

# Onbeheerde runs

Deze skill komt bovenop de rule `werkafspraken`. Het geldt als niemand tijdens de run kan antwoorden: een Cloud Agent, een achtergrond-agent, een subagent of `cursor-agent -p` waarbij ik weg ben. Een vraag zet het werk dan stil tot ik terug ben; een merge die op mijn akkoord wachtte, kostte eens zes uur. Je beslist dus zelf, binnen de grenzen hieronder.

Start je zelf subagents, zet dan in elke prompt `Onbeheerde run: volg .cursor/skills/unattended/SKILL.md.` plus de grenzen van die taak: repo, branch, autonomieniveau en wat buiten scope valt. Subagents zien jouw gesprek niet.

## 1. De opdracht

- De prompt, de spec en de tickets zijn de opdracht. Een ticket dat een bug beschrijft, vraagt om een fix. Een losse vraag ("waarom gebeurt X?") vraagt om een diagnose; dan is het rapport het resultaat.
- Klaar betekent: alles wat de opdracht vraagt is gebouwd, de echte check uit de werkafspraken is gedraaid en groen, en de definitie van klaar uit het ticket klopt. Staat er geen definitie, zet dan zelf een `Klaar = …` bovenaan je checklist.
- Bouw precies wat er staat, in de bedoelde breedte. Tests schrijf je alleen als het ticket ze vraagt of als de repo voor dit soort wijziging al tests heeft.

## 2. Zelf beslissen

- Is de tekst dubbelzinnig? Kies de lezing die de woorden en de bestaande code het meest steunen, bouw alleen die, en noem de aanname in het rapport.
- Een vraag die je kunt beantwoorden door te zoeken, te lezen of iets te draaien, beantwoord je zelf.
- Zit één deel vast? Maak de andere delen helemaal af en zet onder Geblokkeerd op mij precies wat ontbreekt en waarom.
- Faalt dezelfde aanpak twee keer op dezelfde fout zonder voortgang? Stop met dat deel, zet de foutregel, wat je probeerde en je voorgestelde fix onder Geblokkeerd op mij en ga door met de rest.

## 3. Grenzen bovenop de werkafspraken

- Git en releases volgen het autonomieniveau van het project uit de werkafspraken, tenzij de prompt strenger is. Wat erboven ligt, zet je met het exacte commando onder Geblokkeerd op mij. Productie live zetten (L4) gebeurt alleen als de prompt dat letterlijk vraagt.
- Merge naar de basisbranch pas als alle checks op de laatste commit groen zijn, de reviewronde voorbij is, geen review om wijzigingen vraagt en de branch bij is met de basis. Doe vlak voor de merge `git fetch` en lees de PR opnieuw; is de basis verder, merge die erin en wacht opnieuw op groen. Hoog-risicowijzigingen (auth, betalingen, migraties, realtime, persoonsgegevens) merge je niet, ook niet op L3: zet ze klaar voor menselijke review. In je eigen integratiebranch mergen mag altijd. Werk landt via een ticket- of integratiebranch; de hooks blokkeren de verboden git-acties.
- Productie en gedeelde databases zijn alleen-lezen. Een migratie aanmaken en lokaal draaien mag; tegen een gedeelde of remote database draaien niet.
- Jira, Orbit, Slack, Notion, Asana, mail en GitHub-reacties op werk van anderen krijgen geen writes, tenzij de prompt die write letterlijk noemt. Zet anders de concepttekst in het rapport.
- Dependencies die de repo al declareert, installeer je met de eigen package manager van de repo. Nieuwe dependencies, betaalde diensten en infrastructuur regel je niet; zet het voorstel met de maandkosten onder Gevonden.
- Draai geen lokale modellen en niet meerdere dev-servers tegelijk. Op de laptop draait meer dan jouw run.

## 4. Werkstaat

- Tickets zijn de checklist. Zonder tickets houd je `.scratch/TASKS.md` bij (nooit committen): vink af wat klaar is, voeg toe wat opduikt, en noteer elk proces dat je start met PID en poort. Wordt oudere context samengevat, ga dan verder vanuit dat bestand en `git log`.
- Hergebruik een server, browser of test-runner die al draait. Stop aan het eind op PID wat je zelf startte; een brede kill zoals `pkill node` raakt het werk van anderen.
- Ruim op wat je maakte zodra niemand het meer leest: scratch-scripts, screenshots, logs, caches en worktrees.
- Schrijf geen auto-memory. Wat het onthouden waard is, zet je onder Gevonden.

## 5. Doorwerken en stoppen

Een bericht zonder tool-call beëindigt de run, en er komt niemand die "ga door" zegt. Zolang er werk openstaat, eindig je dus niet met een plan, een belofte, een vraag of een tussenrapport, en ook niet omdat de context volloopt: oudere context wordt samengevat en de checklist bewaart je plek. Draait er nog een achtergrondcommando of subagent die je startte, dan ben je nog niet klaar.

Stop alleen als:

- alles wat de opdracht vraagt gebouwd en gecontroleerd is;
- geen enkel deel verder kan zonder mij;
- de volgende stap boven het autonomieniveau ligt of destructief is.

## 6. Review en rapport

De review draait in een frisse context, nooit in de sessie die bouwde. Hij meldt elke echte bevinding met bestand en regel, plus een concrete trigger; wat niet te verifiëren is, staat apart als niet geverifieerd. De bouwer fixt de bevestigde bevindingen in één ronde, daarna volgt geen tweede review. Draaide de review niet of kwam hij leeg terug, merge dan niet en zet dat onder Geblokkeerd op mij. Zijn bouwer en reviewer het oneens, zet het punt dan onder Geblokkeerd op mij.

Sluit af met een rapport in het Nederlands dat op zichzelf staat: de lezer ziet alleen dat laatste bericht. Gebruik de koppen uit de werkafspraken, met Gecontroleerd erbij:

- **Geblokkeerd op mij**: open beslissingen, stappen boven het autonomieniveau (met het commando), concepten voor externe systemen, en wat je wegliet en waarom. Staat er niets, schrijf dan "Niets".
- **Gewijzigd**: branches, commits en PR's (met URL), plus processen die bewust blijven draaien (PID, poort en hoe je ze stopt).
- **Gecontroleerd**: per check het commando en het resultaat, en per reviewbevinding of hij gefixt, geweigerd met reden of niet geverifieerd is.
- **Gevonden**: bugs, risico's en ideeën buiten de opdracht.
