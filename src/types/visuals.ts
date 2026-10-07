export type VisualType =
  | 'dna_genetics'
  | 'water_rainwater_system'
  | 'photosynthesis_bio'
  | 'neural_network'
  | 'orbital_gravity'
  | 'calculus_riemann'
  | 'vector_transform'
  | 'fourier_waves'
  | 'atom_chemistry'
  | 'circuit_electronics'
  | 'algorithm_sorting'
  | 'dynamic_custom';

export interface VisualScene {
  title: string;
  type: VisualType;
  formula?: string;
  caption: string;
  steps: string[];
  currentStepIndex: number;
  data: {
    // DNA / Genetics data
    sequence?: string[];
    unwindProgress?: number;
    basePairCount?: number;

    // Water / Rainwater harvesting
    rainfallRate?: number;
    roofArea?: number;
    efficiency?: number;

    // Neural network data
    layers?: number[];
    layerLabels?: string[];
    selectedDigit?: number;

    // Photosynthesis / Biochemistry data
    lightIntensity?: number;
    co2Concentration?: number;

    // Gravity / Orbits data
    centralMass?: number;
    orbitEccentricity?: number;

    // Calculus & Riemann sums
    functionType?: 'polynomial' | 'sine' | 'gaussian' | 'cubic';
    numRectangles?: number;

    // Vector transform
    matrix?: [[number, number], [number, number]];
    vector?: [number, number];

    // Fourier & Waves
    frequencies?: number[];

    // Atoms & Chemistry
    atomicNumber?: number;
    shells?: number[];

    // Circuits
    voltage?: number;
    resistance?: number;

    // Dynamic custom
    elements?: Array<{
      id: string;
      label: string;
      detail: string;
      x: number;
      y: number;
      color?: string;
    }>;
    metrics?: Array<{ label: string; value: string; unit?: string }>;
  };
}
