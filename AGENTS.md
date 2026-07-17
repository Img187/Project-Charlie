# Lokale AI-delegatie

Gebruik `tools/local-ai.ps1` standaard voor afgebakende, alleen-lezen deeltaken die naar verwachting merkbaar veel hosted modeltokens kosten. De helper gebruikt het reeds geladen LM Studio-model en geeft alleen zijn korte eindantwoord terug.

Geschikte taken:

- bestanden, pagina's, selectors of configuraties inventariseren;
- duplicaten, ontbrekende verwijzingen en eenvoudige inconsistenties zoeken;
- lokale tekst of code op hoofdlijnen samenvatten;
- een eerste checklist, testmatrix of lijst met mogelijke controles opstellen;
- twee lokale implementaties of outputs feitelijk vergelijken.

Niet delegeren:

- bestandswijzigingen, commits, pushes, deployments of andere mutaties;
- beveiligings-, privacy-, juridische of financiële eindbeslissingen;
- geheime gegevens, tokens, authenticatiebestanden of persoonsgegevens;
- actuele internetfeiten, externe communicatie of acties buiten de repository;
- definitieve architectuur-, UX- of kwaliteitsbeslissingen.

Aanroepen vanuit de repository-root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/local-ai.ps1 -Task "Beschrijf de afgebakende taak en relevante bestanden."
```

Houd elke lokale opdracht klein en vraag om een beknopt antwoord met bestandspaden of regelnummers. Behandel het resultaat als een concept: controleer relevante claims altijd zelf tegen de bron voordat je code wijzigt of een antwoord aan de gebruiker geeft. Als de huidige provider al `lmstudio` is of de prompt aangeeft dat je de lokale helper bent, delegeer dan niet opnieuw.
