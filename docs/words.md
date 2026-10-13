# Words in the app

Many people using Track Me Fit read English as a second or third language.
Every screen, button, error and engine reason follows these rules. The test
`src/words.test.ts` checks rules 1 and 2 on every change (spec
[T-064](../specs/T-064-simple-words.md)).

## Rules
1. **Everyday words.** Use the simple word from the list below. When a gym
   word helps people talk to a trainer, say the simple word and explain the
   gym word once: "your light week (in gyms it is called a deload)".
2. **Short sentences.** 20 words at most. One idea per sentence. Prefer a
   full stop to a semicolon.
3. **No idioms.** Say it plainly: "you don't need Catch up now", not "Catch
   up has done its job".
4. **Talk to the person.** "You ate about 2,100 kcal a day", not "Intake
   averaged 2,100 kcal".
5. **Numbers people know.** kcal, g and kg, as on food packets. Indian
   number style (2,600; 1,00,000). Indian food names as people say them.
6. **Same word everywhere.** Pick one word for a thing and keep it.

## Word list
| Avoid | Use |
|---|---|
| trend weight | average weight |
| deload | light week |
| reps in reserve, RIR | reps left |
| surplus | extra calories |
| deficit | eat less than you burn |
| maintenance, TDEE | calories you burn |
| sync, synced | go online, waiting for internet |
| sensible | fair |
| macros | protein, carbs and fat |
| roughly, approximately | about |
| regain | gain back |
| moderate | slow |
| intake | what you eat |
| estimate | how much, guess |
| ensure | make sure |
| prior to, subsequent | before, next |
| optimal | best |
| adequate, sufficient | enough |
| consume | eat |
| run down | tired |
| done its job, stick to, keep up, one-off | say it plainly |

Add a word to the list here and in `HARD_WORDS` in `src/words.test.ts`
together.
