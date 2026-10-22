# Words in the app

Many people using Track Me Fit read English as a second or third language.
Write so a 10-year-old (school grade 5) can follow. Every screen, button,
error and engine reason follows these rules. The test `src/words.test.ts`
checks rules 1, 2 and 7 on every change (specs
[T-064](../specs/T-064-simple-words.md) and
[T-075](../specs/T-075-simpler-words.md)).

## Rules
1. **Everyday words.** Use the simple word from the list below. When a gym
   word helps people talk to a trainer, say the simple word and explain the
   gym word once: "your light week (in gyms it is called a deload)".
2. **Short sentences.** 12 words at most. One idea per sentence. Prefer a
   full stop to a semicolon or a comma. Split a long sentence in two.
3. **No idioms.** Say it plainly: "you don't need Catch up now", not "Catch
   up has done its job".
4. **Talk to the person.** "You ate about 2,100 calories a day", not "Intake
   averaged 2,100 kcal".
5. **Numbers people know.** Calories, g and kg. Write "calories", never "kcal" (DK, 22 Oct 2026). Indian
   number style (2,600; 1,00,000). Indian food names as people say them.
6. **Same word everywhere.** Pick one word for a thing and keep it.
7. **Grade 5 reading.** Short words and short sentences. The test works out
   the Flesch-Kincaid grade of each file's sentences; it must be 5 or lower.
8. **Easy to translate.** Hindi and Marathi come later. Plain sentences with
   no idioms translate well. Keep food names local: roti, katori, dal.

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
| estimate, estimated | how much, guess |
| metabolism | how fast you burn food |
| typical day | usual day |
| probably | may, likely |
| guidance | help |
| nutrition, nutrient | food |
| minimum, maximum | lowest, highest |
| consult | talk to |
| recommend | suggest |
| achieve | reach |
| utilise | use |
| portion | amount |
| ensure | make sure |
| prior to, subsequent | before, next |
| optimal | best |
| adequate, sufficient | enough |
| consume | eat |
| run down | tired |
| done its job, stick to, keep up, one-off | say it plainly |

Add a word to the list here and in `HARD_WORDS` in `src/words.test.ts`
together.
