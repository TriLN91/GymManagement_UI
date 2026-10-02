export const MUSCLE_IDS = [
  'chest',
  'upper_chest',
  'mid_chest',
  'lower_chest',
  'anterior_deltoid',
  'lateral_deltoid',
  'posterior_deltoid',
  'biceps',
  'triceps',
  'forearms',
  'rectus_abdominis',
  'upper_abs',
  'middle_abs',
  'lower_abs',
  'obliques',
  'serratus_anterior',
  'hip_flexors',
  'adductors',
  'quadriceps',
  'rectus_femoris',
  'vastus_lateralis',
  'vastus_medialis',
  'tibialis_anterior',
  'trapezius',
  'latissimus_dorsi',
  'lower_back',
  'gluteus_maximus',
  'hamstrings',
  'gastrocnemius',
  'soleus',
] as const;

export type MuscleId = (typeof MUSCLE_IDS)[number];
export type MuscleView = 'front' | 'back';
export type MuscleTargetRole = 'primary' | 'secondary';

export interface MuscleTarget {
  id: MuscleId;
  role: MuscleTargetRole;
  activation: number;
}

export interface MuscleDefinition {
  id: MuscleId;
  parent?: MuscleId;
  view: MuscleView;
  name: { en: string; vi: string };
  description: { en: string; vi: string };
}

export const MUSCLES: Readonly<Record<MuscleId, MuscleDefinition>> = {
  chest: {
    id: 'chest',
    view: 'front',
    name: { en: 'Chest', vi: 'Ngực' },
    description: {
      en: 'Pectoral group for horizontal and pressing movements.',
      vi: 'Nhóm cơ ngực cho các động tác đẩy ngang và ép ngực.',
    },
  },
  upper_chest: {
    id: 'upper_chest',
    parent: 'chest',
    view: 'front',
    name: { en: 'Upper chest', vi: 'Ngực trên' },
    description: {
      en: 'Clavicular fibres of the pectoral group.',
      vi: 'Vùng sợi cơ ngực gần xương đòn.',
    },
  },
  mid_chest: {
    id: 'mid_chest',
    parent: 'chest',
    view: 'front',
    name: { en: 'Mid chest', vi: 'Ngực giữa' },
    description: {
      en: 'Central pectoral fibres for pressing strength.',
      vi: 'Vùng cơ ngực trung tâm cho sức mạnh đẩy.',
    },
  },
  lower_chest: {
    id: 'lower_chest',
    parent: 'chest',
    view: 'front',
    name: { en: 'Lower chest', vi: 'Ngực dưới' },
    description: {
      en: 'Lower pectoral fibres for decline and dip patterns.',
      vi: 'Vùng cơ ngực dưới cho các động tác dốc xuống và dips.',
    },
  },
  anterior_deltoid: {
    id: 'anterior_deltoid',
    view: 'front',
    name: { en: 'Front deltoid', vi: 'Vai trước' },
    description: {
      en: 'Front shoulder fibres used in pressing.',
      vi: 'Bó cơ vai trước tham gia các động tác đẩy.',
    },
  },
  lateral_deltoid: {
    id: 'lateral_deltoid',
    view: 'front',
    name: { en: 'Lateral deltoid', vi: 'Vai giữa' },
    description: {
      en: 'Side shoulder fibres for arm abduction.',
      vi: 'Bó vai giữa cho động tác nâng tay sang ngang.',
    },
  },
  posterior_deltoid: {
    id: 'posterior_deltoid',
    view: 'back',
    name: { en: 'Rear deltoid', vi: 'Vai sau' },
    description: {
      en: 'Rear shoulder fibres for pulling and shoulder balance.',
      vi: 'Bó vai sau cho động tác kéo và cân bằng vai.',
    },
  },
  biceps: {
    id: 'biceps',
    view: 'front',
    name: { en: 'Biceps', vi: 'Tay trước' },
    description: { en: 'Upper-arm elbow flexors.', vi: 'Nhóm cơ gấp khuỷu ở cánh tay trên.' },
  },
  triceps: {
    id: 'triceps',
    view: 'back',
    name: { en: 'Triceps', vi: 'Tay sau' },
    description: { en: 'Upper-arm elbow extensors.', vi: 'Nhóm cơ duỗi khuỷu ở cánh tay trên.' },
  },
  forearms: {
    id: 'forearms',
    view: 'front',
    name: { en: 'Forearms', vi: 'Cẳng tay' },
    description: {
      en: 'Grip and wrist-control muscles.',
      vi: 'Nhóm cơ kiểm soát lực nắm và cổ tay.',
    },
  },
  rectus_abdominis: {
    id: 'rectus_abdominis',
    view: 'front',
    name: { en: 'Rectus abdominis', vi: 'Cơ bụng thẳng' },
    description: {
      en: 'Central abdominal wall for trunk flexion.',
      vi: 'Thành bụng trung tâm cho động tác gập thân.',
    },
  },
  upper_abs: {
    id: 'upper_abs',
    parent: 'rectus_abdominis',
    view: 'front',
    name: { en: 'Upper abs', vi: 'Bụng trên' },
    description: {
      en: 'Upper segment of the rectus abdominis.',
      vi: 'Phần trên của cơ bụng thẳng.',
    },
  },
  middle_abs: {
    id: 'middle_abs',
    parent: 'rectus_abdominis',
    view: 'front',
    name: { en: 'Middle abs', vi: 'Bụng giữa' },
    description: {
      en: 'Middle segment of the rectus abdominis.',
      vi: 'Phần giữa của cơ bụng thẳng.',
    },
  },
  lower_abs: {
    id: 'lower_abs',
    parent: 'rectus_abdominis',
    view: 'front',
    name: { en: 'Lower abs', vi: 'Bụng dưới' },
    description: {
      en: 'Lower segment of the rectus abdominis.',
      vi: 'Phần dưới của cơ bụng thẳng.',
    },
  },
  obliques: {
    id: 'obliques',
    view: 'front',
    name: { en: 'Obliques', vi: 'Cơ chéo bụng' },
    description: {
      en: 'Rotational and lateral trunk stabilisers.',
      vi: 'Nhóm cơ xoay và ổn định thân sang bên.',
    },
  },
  serratus_anterior: {
    id: 'serratus_anterior',
    view: 'front',
    name: { en: 'Serratus anterior', vi: 'Cơ răng trước' },
    description: {
      en: 'Scapular stabilisers along the ribcage.',
      vi: 'Nhóm cơ ổn định bả vai dọc theo lồng ngực.',
    },
  },
  hip_flexors: {
    id: 'hip_flexors',
    view: 'front',
    name: { en: 'Hip flexors', vi: 'Cơ gấp hông' },
    description: {
      en: 'Hip-flexion group at the front of the pelvis.',
      vi: 'Nhóm cơ gấp hông phía trước xương chậu.',
    },
  },
  adductors: {
    id: 'adductors',
    view: 'front',
    name: { en: 'Adductors', vi: 'Cơ khép đùi' },
    description: {
      en: 'Inner-thigh muscles for hip stability.',
      vi: 'Nhóm cơ mặt trong đùi ổn định hông.',
    },
  },
  quadriceps: {
    id: 'quadriceps',
    view: 'front',
    name: { en: 'Quadriceps', vi: 'Đùi trước' },
    description: { en: 'Primary knee-extensor muscle group.', vi: 'Nhóm cơ duỗi gối chính.' },
  },
  rectus_femoris: {
    id: 'rectus_femoris',
    parent: 'quadriceps',
    view: 'front',
    name: { en: 'Rectus femoris', vi: 'Cơ thẳng đùi' },
    description: {
      en: 'Central quadriceps muscle crossing the hip.',
      vi: 'Cơ đùi trước trung tâm đi qua khớp hông.',
    },
  },
  vastus_lateralis: {
    id: 'vastus_lateralis',
    parent: 'quadriceps',
    view: 'front',
    name: { en: 'Vastus lateralis', vi: 'Cơ rộng ngoài' },
    description: { en: 'Outer quadriceps fibres.', vi: 'Bó cơ đùi trước phía ngoài.' },
  },
  vastus_medialis: {
    id: 'vastus_medialis',
    parent: 'quadriceps',
    view: 'front',
    name: { en: 'Vastus medialis', vi: 'Cơ rộng trong' },
    description: {
      en: 'Inner quadriceps fibres near the knee.',
      vi: 'Bó cơ đùi trước phía trong gần gối.',
    },
  },
  tibialis_anterior: {
    id: 'tibialis_anterior',
    view: 'front',
    name: { en: 'Tibialis anterior', vi: 'Cơ chày trước' },
    description: {
      en: 'Front lower-leg muscle for ankle control.',
      vi: 'Cơ cẳng chân trước kiểm soát cổ chân.',
    },
  },
  trapezius: {
    id: 'trapezius',
    view: 'back',
    name: { en: 'Trapezius', vi: 'Cơ thang' },
    description: {
      en: 'Upper-back and neck stabilising group.',
      vi: 'Nhóm cơ ổn định lưng trên và cổ.',
    },
  },
  latissimus_dorsi: {
    id: 'latissimus_dorsi',
    view: 'back',
    name: { en: 'Latissimus dorsi', vi: 'Cơ xô' },
    description: {
      en: 'Large back muscles for vertical and horizontal pulling.',
      vi: 'Nhóm cơ lưng lớn cho các động tác kéo.',
    },
  },
  lower_back: {
    id: 'lower_back',
    view: 'back',
    name: { en: 'Lower back', vi: 'Lưng dưới' },
    description: {
      en: 'Spinal stabilisers for hinge patterns.',
      vi: 'Nhóm cơ ổn định cột sống cho động tác hip hinge.',
    },
  },
  gluteus_maximus: {
    id: 'gluteus_maximus',
    view: 'back',
    name: { en: 'Gluteus maximus', vi: 'Cơ mông lớn' },
    description: { en: 'Primary hip-extensor muscle.', vi: 'Nhóm cơ duỗi hông chính.' },
  },
  hamstrings: {
    id: 'hamstrings',
    view: 'back',
    name: { en: 'Hamstrings', vi: 'Đùi sau' },
    description: {
      en: 'Back-thigh muscles for hip extension and knee flexion.',
      vi: 'Nhóm cơ đùi sau cho duỗi hông và gập gối.',
    },
  },
  gastrocnemius: {
    id: 'gastrocnemius',
    view: 'back',
    name: { en: 'Gastrocnemius', vi: 'Bắp chân sinh đôi' },
    description: {
      en: 'Outer calf muscle active during calf raises.',
      vi: 'Cơ bắp chân ngoài hoạt động khi nhón gót.',
    },
  },
  soleus: {
    id: 'soleus',
    view: 'back',
    name: { en: 'Soleus', vi: 'Cơ dép' },
    description: {
      en: 'Deeper calf muscle supporting plantar flexion.',
      vi: 'Cơ bắp chân sâu hỗ trợ gập cổ chân.',
    },
  },
};

export function isMuscleRelated(selected: MuscleId, target: MuscleId): boolean {
  return (
    selected === target ||
    MUSCLES[target].parent === selected ||
    MUSCLES[selected].parent === target
  );
}
