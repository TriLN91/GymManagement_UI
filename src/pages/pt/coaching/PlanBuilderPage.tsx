import { Filter, Plus, Save, Settings2, Trash2, Dumbbell } from 'lucide-react';
import type { ReactElement } from 'react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export function PlanBuilderPage(): ReactElement {
  return (
    <div className="flex h-[calc(100vh-8rem)] w-full bg-background border rounded-lg overflow-hidden">
      {/* Left Panel - 23% - Exercise Library */}
      <div className="w-[23%] flex flex-col border-r border-border bg-card p-4 gap-4 overflow-y-auto">
        <h2 className="font-semibold font-sans">Exercise Library</h2>
        <div className="flex gap-2">
          <Input placeholder="Search exercises..." className="flex-1 rounded-full" />
          <Button variant="outline" size="icon" className="rounded-full shrink-0"><Filter className="h-4 w-4" /></Button>
        </div>
        <div className="text-sm font-medium text-muted-foreground">Target Muscle: All Categories</div>
        
        <div className="flex flex-col gap-3">
          {/* Mock Exercise Card */}
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex gap-3 p-2 rounded-md border bg-background items-center hover:border-[#97CD97] transition-colors">
              <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">Bench Press</div>
                <div className="text-xs text-muted-foreground truncate">Barbell • Intermediate</div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 rounded-full text-[#345C32] hover:bg-[#A7F0DD]">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel - 50% - Workout Builder Canvas */}
      <div className="w-[50%] flex flex-col p-6 gap-6 overflow-y-auto bg-background">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            <Input 
              defaultValue="Hypertrophy Push Day" 
              className="text-2xl font-bold font-sans border-none shadow-none px-0 h-auto focus-visible:ring-0 mb-1" 
            />
            <Input 
              placeholder="Add workout description..." 
              className="text-muted-foreground text-sm border-none shadow-none px-0 h-auto focus-visible:ring-0"
            />
          </div>
          <Button className="bg-[#345C32] hover:bg-[#345C32]/90 text-white rounded-full font-bold px-6 shrink-0">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="font-medium text-sm text-muted-foreground">Exercise sequence</div>
          
          {/* Mock Exercise in Sequence */}
          <div className="border rounded-md p-4 bg-card flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div>
                  <div className="font-medium">Barbell Bench Press</div>
                  <div className="text-sm text-muted-foreground">Chest • Barbell</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground rounded-full hover:bg-muted">
                  <Settings2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md grid grid-cols-4 gap-4 font-['Barlow',sans-serif]">
              <div><div className="text-xs text-muted-foreground font-sans">Target Sets</div><div className="font-medium">3</div></div>
              <div><div className="text-xs text-muted-foreground font-sans">Target Reps</div><div className="font-medium">8-12</div></div>
              <div><div className="text-xs text-muted-foreground font-sans">Target Load</div><div className="font-medium">75% 1RM</div></div>
              <div><div className="text-xs text-muted-foreground font-sans">Rest Interval</div><div className="font-medium">90s</div></div>
            </div>
          </div>
        </div>
        
        <Button variant="outline" className="w-full border-dashed rounded-md h-14 text-muted-foreground font-medium hover:text-[#345C32] hover:border-[#345C32] hover:bg-transparent transition-colors">
          <Plus className="h-5 w-5 mr-2" /> Add Exercise
        </Button>
      </div>

      {/* Right Panel - 27% - Live Muscle Map & Summary */}
      <div className="w-[27%] flex flex-col border-l border-border bg-card p-4 gap-6 overflow-y-auto">
        <div>
          <h2 className="font-semibold font-sans mb-4">Live Muscle Map</h2>
          <div className="flex justify-center gap-1 mb-3 bg-muted/30 p-1 rounded-full">
            <Button variant="secondary" size="sm" className="rounded-full flex-1 bg-background shadow-sm text-foreground">Male</Button>
            <Button variant="ghost" size="sm" className="rounded-full flex-1 text-muted-foreground hover:text-foreground">Female</Button>
          </div>
          <div className="flex justify-center gap-1 mb-4 bg-muted/30 p-1 rounded-full">
            <Button variant="secondary" size="sm" className="rounded-full flex-1 bg-background shadow-sm text-foreground">Anterior</Button>
            <Button variant="ghost" size="sm" className="rounded-full flex-1 text-muted-foreground hover:text-foreground">Posterior</Button>
          </div>
          
          <div className="aspect-[4/5] bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground border border-muted/50">
            <div className="text-center">
              <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <div className="text-xs">Muscle Map</div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <h2 className="font-semibold font-sans mb-4">Workout Summary</h2>
          <div className="space-y-3 font-['Barlow',sans-serif]">
            <div className="flex justify-between items-center">
              <span className="font-sans text-muted-foreground text-sm">Exercises</span>
              <span className="font-bold">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-muted-foreground text-sm">Total Sets</span>
              <span className="font-bold">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-muted-foreground text-sm">Estimated Time</span>
              <span className="font-bold">15 min</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border/50">
          <h3 className="text-sm font-semibold font-sans mb-3">Volume by Muscle</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs items-center mb-1">
              <span className="font-medium">Chest</span>
              <span className="font-['Barlow',sans-serif] font-medium text-muted-foreground">100%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[#345C32] w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
