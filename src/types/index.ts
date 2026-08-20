export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface ReflectionOption {
  key: OptionKey;
  label: string;
  statement: string;
  defaultFeedback: string;
  defaultResetDeclaration: string;
}

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  contentMarkdown: string;
  options: ReflectionOption[];
}

export interface ChapterUserResponse {
  chapterId: number;
  selectedOptionKey: OptionKey;
  customText?: string;
  statementUsed: string;
  feedbackGiven: string;
  resetDeclaration: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'heron';
  text: string;
  timestamp: string;
}

export type AppTheme = 'sage' | 'amber' | 'deep_ocean';

export type AmbientSoundType = 'fireplace' | 'rain' | 'breeze';

export type EnergyLevel = 10 | 30 | 50;

export interface MicroTask {
  id: string;
  title: string;
  description: string;
  category: 'sensory' | 'somatic' | 'care';
  energyReq: EnergyLevel;
  iconName: string;
  isCustom?: boolean;
}

export interface ThoughtBreakdownResult {
  criticalParent: string;
  adultFact: string;
}

export interface EmergencyResetLog {
  id: string;
  timestamp: string;
  energyLevel: EnergyLevel;
  completedTaskTitle: string;
  originalNegativeThought?: string;
  criticalParentAnalysis?: string;
  adultObjectiveFact?: string;
}
