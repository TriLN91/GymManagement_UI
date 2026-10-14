# 07. WORKOUT BUILDER

## VISUAL RULE (3-PANEL LAYOUT)
The Workout Builder uses a 3-panel layout focusing heavily on the workspace.
- **Left (23%) - Exercise Library**: Search, Filter, list, image, name, add button. Must not take too much width.
- **Center (50%) - Canvas**: The most important area. Contains Workout name, Week, Day, Exercise list, Target Prescription (Sets, Reps, Load, Rest, Tempo), Save, Add Exercise.
- **Right (27%) - Live Muscle Map & Summary**: Anterior, Posterior, Male/Female, Muscle activation, summary, exercise count, sets, duration, volume. Must not be wider than the Canvas.

## EDIT EXERCISE RULE
- DO NOT use a permanent right drawer for editing exercises.
- Use a **Modal**.
- Modal contents: Target Prescription (Sets, Reps, Load, Rest), Actual Execution Overrides (Set 1, 2, 3...), Live Telemetry, Biomechanical Cue, Remove, Cancel, Update & Synchronize.
- Modal must close on Update, Cancel, or X.
