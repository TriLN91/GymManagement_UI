import { Dumbbell, Filter, Plus, Save, Settings2, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export function PlanBuilderPage(): ReactElement {
  return (
    <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-lg border bg-background">
      {/* Left Panel - 23% - Exercise Library */}
      <div className="flex w-[23%] flex-col gap-4 overflow-y-auto border-r border-border bg-card p-4">
        <h2 className="font-sans font-semibold">Exercise Library</h2>
        <div className="flex gap-2">
          <Input placeholder="Search exercises..." className="flex-1 rounded-full" />
          <Button variant="outline" size="icon" className="shrink-0 rounded-full">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Target Muscle: All Categories
        </div>

        <div className="flex flex-col gap-3">
          {/* Mock Exercise Card */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md border bg-background p-2 transition-colors hover:border-[#97CD97]"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                <Dumbbell className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">Bench Press</div>
                <div className="truncate text-xs text-muted-foreground">Barbell • Intermediate</div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 rounded-full text-[#345C32] hover:bg-[#A7F0DD]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel - 50% - Workout Builder Canvas */}
      <div className="flex w-[50%] flex-col gap-6 overflow-y-auto bg-background p-6">
        <div className="flex items-start justify-between">
          <div className="mr-4 flex-1">
            <Input
              defaultValue="Hypertrophy Push Day"
              className="mb-1 h-auto border-none px-0 font-sans text-2xl font-bold shadow-none focus-visible:ring-0"
            />
            <Input
              placeholder="Add workout description..."
              className="h-auto border-none px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0"
            />
          </div>
          <Button className="shrink-0 rounded-full bg-[#345C32] px-6 font-bold text-white hover:bg-[#345C32]/90">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="text-sm font-medium text-muted-foreground">Exercise sequence</div>

          {/* Mock Exercise in Sequence */}
          <div className="flex flex-col gap-4 rounded-md border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                  <Dumbbell className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div>
                  <div className="font-medium">Barbell Bench Press</div>
                  <div className="text-sm text-muted-foreground">Chest • Barbell</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 rounded-md bg-muted/30 p-3 font-['Barlow',sans-serif]">
              <div>
                <div className="font-sans text-xs text-muted-foreground">Target Sets</div>
                <div className="font-medium">3</div>
              </div>
              <div>
                <div className="font-sans text-xs text-muted-foreground">Target Reps</div>
                <div className="font-medium">8-12</div>
              </div>
              <div>
                <div className="font-sans text-xs text-muted-foreground">Target Load</div>
                <div className="font-medium">75% 1RM</div>
              </div>
              <div>
                <div className="font-sans text-xs text-muted-foreground">Rest Interval</div>
                <div className="font-medium">90s</div>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="h-14 w-full rounded-md border-dashed font-medium text-muted-foreground transition-colors hover:border-[#345C32] hover:bg-transparent hover:text-[#345C32]"
        >
          <Plus className="mr-2 h-5 w-5" /> Add Exercise
        </Button>
      </div>

      {/* Right Panel - 27% - Live Muscle Map & Summary */}
      <div className="flex w-[27%] flex-col gap-6 overflow-y-auto border-l border-border bg-card p-4">
        <div>
          <h2 className="mb-4 font-sans font-semibold">Live Muscle Map</h2>
          <div className="mb-3 flex justify-center gap-1 rounded-full bg-muted/30 p-1">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 rounded-full bg-background text-foreground shadow-sm"
            >
              Male
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 rounded-full text-muted-foreground hover:text-foreground"
            >
              Female
            </Button>
          </div>
          <div className="mb-4 flex justify-center gap-1 rounded-full bg-muted/30 p-1">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 rounded-full bg-background text-foreground shadow-sm"
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 rounded-full text-muted-foreground hover:text-foreground"
            >
              Posterior
            </Button>
          </div>

          <div className="flex aspect-[4/5] items-center justify-center rounded-md border border-muted/50 bg-muted/20 text-muted-foreground">
            <div className="text-center">
              <Dumbbell className="mx-auto mb-2 h-8 w-8 opacity-20" />
              <div className="text-xs">Muscle Map</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-2">
          <h2 className="mb-4 font-sans font-semibold">Workout Summary</h2>
          <div className="space-y-3 font-['Barlow',sans-serif]">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm text-muted-foreground">Exercises</span>
              <span className="font-bold">1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm text-muted-foreground">Total Sets</span>
              <span className="font-bold">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm text-muted-foreground">Estimated Time</span>
              <span className="font-bold">15 min</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-2">
          <h3 className="mb-3 font-sans text-sm font-semibold">Volume by Muscle</h3>
          <div className="space-y-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium">Chest</span>
              <span className="font-['Barlow',sans-serif] font-medium text-muted-foreground">
                100%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-full rounded-full bg-[#345C32]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
