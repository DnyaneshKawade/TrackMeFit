-- Four more muscles (T-082a): front delts, forearms, inner thighs (adductors)
-- and neck. Feedback and a person's own exercises can name them now.

alter table public.muscle_feedback drop constraint muscle_feedback_muscle_check,
  add constraint muscle_feedback_muscle_check check (muscle in
    ('chest', 'back', 'quads', 'hamstrings', 'glutes', 'sideDelts', 'rearDelts', 'biceps', 'triceps', 'calves', 'abs', 'traps',
     'frontDelts', 'forearms', 'adductors', 'neck'));

alter table public.custom_exercises drop constraint custom_exercises_muscle,
  add constraint custom_exercises_muscle check (primary_muscle in
    ('chest', 'back', 'quads', 'hamstrings', 'glutes', 'sideDelts', 'rearDelts', 'biceps', 'triceps', 'calves', 'abs', 'traps',
     'frontDelts', 'forearms', 'adductors', 'neck'));
