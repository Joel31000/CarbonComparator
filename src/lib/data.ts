
export const emissionFactors = {
  materials: [
    { name: "Acier", factor: 0, unit: "kg CO2e/kg" },
    { name: "Aluminium (Recyclé)", factor: 1.5, unit: "kg CO2e/kg" },
    { name: "Aluminium (Vierge)", factor: 11.0, unit: "kg CO2e/kg" },
    { name: "Béton", factor: 0, unit: "kg CO2e/m³" }, 
    { name: "Bois (Source durable)", factor: 0.05, unit: "kg CO2e/kg" },
    { name: "Canalisation PVC", factor: 2.47, unit: "kg CO2e/kg" },
    { name: "Cuivre Classique", factor: 4.50, unit: "kg CO2e/kg" },
    { name: "Cuivre recyclé", factor: 1.50, unit: "kg CO2e/kg" },
    { name: "Enrobé à chaud", factor: 0.05, unit: "kg CO2e/m²" },
    { name: "Enrobé à froid", factor: 0.02, unit: "kg CO2e/m²" },
    { name: "Papier/Carton", factor: 0.6, unit: "kg CO2e/kg" },
    { name: "Peinture", factor: 0, unit: "kg CO2e/m²" },
    { name: "Plastique (PET)", factor: 2.3, unit: "kg CO2e/kg" },
    { name: "Verre", factor: 0.9, unit: "kg CO2e/kg" },
  ].sort((a, b) => a.name.localeCompare(b.name)),
  steelTypes: [
    { name: "Acier filière haut fourneau (BOF)", factor: 1.8, unit: "kg CO2e/kg" },
    { name: "Acier DRI-EAF (Réduction Directe Fer au gaz naturel, couplée EAF)", factor: 1.35, unit: "kg CO2e/kg" },
    { name: "Acier H2-DRI-EAF (Réduction Fer à l'hydrogène vert, couplée EAF)", factor: 0.7, unit: "kg CO2e/kg" },
    { name: "Acier inoxydable (four électrique)", factor: 0.65, unit: "kg CO2e/kg" },
    { name: "Acier recyclé", factor: 0.5, unit: "kg CO2e/kg" },
    { name: "Acier filière four à arc électrique (EAF, recyclé)", factor: 0.425, unit: "kg CO2e/kg" },
    { name: "Acier «XCarb» (EAF, énergie renouvelable)", factor: 0.3, unit: "kg CO2e/kg" },
  ].sort((a, b) => a.name.localeCompare(b.name)),
  paint: Array.from({ length: 16 }, (_, i) => 1.0 + i * 0.1).map(v => ({
    name: `${v.toFixed(1)} kgCO₂eq/m²`,
    factor: v,
  })),
  concrete: [
    { name: "CEM I (ATILH)", factor: 0.752, unit: "tCO₂eq/t" },
    { name: "CEM II/A-LL ou LL (ATILH)", factor: 0.640, unit: "tCO₂eq/t" },
    { name: "CEM II/A-S A-M et A-V (ATILH)", factor: 0.619, unit: "tCO₂eq/t" },
    { name: "CEM II/B-L ou LL (ATILH)", factor: 0.547, unit: "tCO₂eq/t" },
    { name: "CEM II/B-M CEM II/B-S (ATILH)", factor: 0.554, unit: "tCO₂eq/t" },
    { name: "CEM III/A (ATILH)", factor: 0.467, unit: "tCO₂eq/t" },
    { name: "CEM III/A PM et ES (ATILH)", factor: 0.334, unit: "tCO₂eq/t" },
    { name: "CEM III/B (ATILH)", factor: 0.316, unit: "tCO₂eq/t" },
    { name: "CEM III/C (ATILH)", factor: 0.199, unit: "tCO₂eq/t" },
    { name: "CEM V/A (S-V) (ATILH)", factor: 0.479, unit: "tCO₂eq/t" },
    { name: "CEM VI (ECOCEM)", factor: 0.417, unit: "tCO₂eq/t" },
  ],
  rebar: Array.from({ length: 14 }, (_, i) => 0.7 + i * 0.1).map(v => ({
    name: `${v.toFixed(1)} kgCO₂eq/kg`,
    factor: v,
  })),
  manufacturing: [
    { name: "Impression 3D (Plastique)", factor: 0.01, unit: "kg CO2e/hr" },
    { name: "Peinture en fabrication", factor: 3.65, unit: "kg CO2e/kg" },
    { name: "Soudage en fabrication", factor: 0.26, unit: "kg CO2e/hr" },
    { name: "Usinage", factor: 5.0, unit: "kg CO2e/hr" },
  ].sort((a, b) => a.name.localeCompare(b.name)),
  energy: [
    { name: "Groupe électrogène gazole", factor: 0.837, unit: "kg CO2e/H" },
    { name: "Groupe électrogène gazole non routier", factor: 0.853, unit: "kg CO2e/H" },
    { name: "Groupe électrogène biodiesel B100", factor: 0.327, unit: "kg CO2e/H" },
    { name: "Groupe électrogène biodiesel HVO100", factor: 0.146, unit: "kg CO2e/H" },
    { name: "Groupe électrogène bioétahnol essence SP95 E10, E85", factor: 0.229, unit: "kg CO2e/H" },
    { name: "Station électrique portable", factor: 0.078, unit: "kg CO2e/H" },
    { name: "Groupe électrogène à hydrogène", factor: 0.137, unit: "kg CO2e/H" },
    { name: "Utilisation réseau électrique Français", factor: 0.052, unit: "kg CO2e/H" },
  ].sort((a, b) => a.name.localeCompare(b.name)),
  implementation: [
    { name: "Bétonnière", factor: 8.5, unit: "kg CO2e/hr" },
    { name: "Foreuse (1500 W)", factor: 1.5, unit: "kg CO2e/hr" },
    { name: "Grue", factor: 13.5, unit: "kg CO2e/hr" },
    { name: "machines béton projeté compact (3,5-5,5 KW)", factor: 0.09, unit: "kg CO2e/hr" },
    { name: "machines béton projeté haute capacité (>13 KW)", factor: 0.88, unit: "kg CO2e/hr" },
    { name: "machines béton projeté moyenne (7,5 KW)", factor: 0.16, unit: "kg CO2e/hr" },
    { name: "Marteau piqueur électrique (P : 2100 W)", factor: 2.1, unit: "kg CO2e/hr" },
    { name: "Marteau piqueur pneumatique", factor: 3.5, unit: "kg CO2e/hr" },
    { name: "Pelle araignée", factor: 14.5, unit: "kg CO2e/hr" },
    { name: "Pelleuteuse", factor: 20.0, unit: "kg CO2e/hr" },
    { name: "Soudage", factor: 0.26, unit: "kg CO2e/hr" },
    { name: "Peinture industrielle", factor: 3.65, unit: "kg CO2e/kg" },
  ].sort((a, b) => a.name.localeCompare(b.name)),
  transport: [
    { name: "Avion (Cargo)", factor: 0.5, unit: "kg CO2e/t.km" },
    { name: "Bateau (Cargo)", factor: 0.02, unit: "kg CO2e/t.km" },
    { name: "Camion (>32t)", factor: 0.087, unit: "kg CO2e/t.km" },
    { name: "Camion porteur 12 tonnes électrique", factor: 0.036, unit: "kg CO2e/t.km" },
    { name: "Camion porteur 12 tonnes gasoil", factor: 0.241, unit: "kg CO2e/t.km" },
    { name: "Camion porteur 7,5 tonnes gasoil", factor: 0.378, unit: "kg CO2e/t.km" },
    { name: "Hélicoptère", factor: 0, unit: "kg CO2e/t.km" },
    { name: "Train (Fret)", factor: 0.01, unit: "kg CO2e/t.km" },
    { name: "Véhicule utilitaire électrique", factor: 0.15, unit: "kg CO2e/t.km" },
    { name: "Véhicule utilitaire essence", factor: 0.826, unit: "kg CO2e/t.km" },
    { name: "Véhicule utilitaire gasoil", factor: 0.17, unit: "kg CO2e/t.km" },
    { name: "Véhicule utilitaire léger", factor: 0.15, unit: "kg CO2e/t.km" },
    { name: "Voiture électrique", factor: 0.103, unit: "kg CO2e/t.km" },
    { name: "Voiture essence", factor: 0.214, unit: "kg CO2e/t.km" },
    { name: "Voiture GNV", factor: 0.12, unit: "kg CO2e/t.km" },
    { name: "Voiture GPL", factor: 0.161, unit: "kg CO2e/t.km" },
  ].sort((a, b) => a.name.localeCompare(b.name)),
  helicopterPayloads: [
    { name: "680 Kg (type Bell 206 JetRanger)", factor: 2.7 },
    { name: "1160 Kg (type Airbus H125 (AS350 Écureuil))", factor: 2.1 },
    { name: "1200 Kg (type Airbus H130 (EC130 T2))", factor: 1.95 },
    { name: "1495 Kg (type Airbus EC135)", factor: 1.75 },
    { name: "1500 Kg (type Airbus H145)", factor: 1.55 },
    { name: "1770 Kg (type Airbus H160)", factor: 1.4 },
    { name: "5335 Kg (type Airbus H225 (Super Puma))", factor: 1.05 },
  ],
};

// --- Full Options for "Optimized" Scenario ---
export const materialOptions = emissionFactors.materials.map((m) => m.name);
export const steelOptions = emissionFactors.steelTypes.map((s) => s.name);
export const paintOptions = emissionFactors.paint;
export const concreteOptions = emissionFactors.concrete.map((c) => c.name);
export const rebarOptions = emissionFactors.rebar;
export const processOptions = emissionFactors.manufacturing.map((p) => p.name);
export const energyOptions = emissionFactors.energy.map((e) => e.name);
export const implementationOptions = emissionFactors.implementation.map((i) => i.name);
export const transportOptions = emissionFactors.transport.map((t) => t.name);
export const helicopterPayloadOptions = emissionFactors.helicopterPayloads;


// --- Restricted Options for "Classic" Scenario ---
const classicMaterialsWhitelist = [
  "Acier", "Béton", "Canalisation PVC", "Cuivre Classique", 
  "Enrobé à chaud", "Papier/Carton", "Peinture", "Plastique (PET)", "Verre"
];
export const classicMaterialOptions = emissionFactors.materials
  .filter(m => classicMaterialsWhitelist.includes(m.name))
  .map(m => m.name);

export const classicSteelOptions = emissionFactors.steelTypes
  .filter(s => s.name === "Acier filière haut fourneau (BOF)")
  .map(s => s.name);

export const classicConcreteOptions = emissionFactors.concrete
  .filter(c => c.name === "CEM I (ATILH)")
  .map(c => c.name);
  
const classicManufacturingWhitelist = [
  "Impression 3D (Plastique)", "Peinture en fabrication", "Soudage en fabrication", "Usinage"
];
export const classicProcessOptions = emissionFactors.manufacturing
  .filter(p => classicManufacturingWhitelist.includes(p.name))
  .map(p => p.name);

export const classicEnergyOptions = emissionFactors.energy
  .filter(e => e.name === "Groupe électrogène gazole")
  .map(e => e.name);
  
const classicImplementationWhitelist = [
  "Bétonnière", "Foreuse (1500 W)", "Grue", "machines béton projeté compact (3,5-5,5 KW)",
  "machines béton projeté haute capacité (>13 KW)", "machines béton projeté moyenne (7,5 KW)",
  "Marteau piqueur pneumatique", "Pelle araignée", "Pelleuteuse", "Soudage", "Peinture industrielle"
];
export const classicImplementationOptions = emissionFactors.implementation
  .filter(i => classicImplementationWhitelist.includes(i.name))
  .map(i => i.name);

const classicTransportWhitelist = [
  "Avion (Cargo)", "Bateau (Cargo)", "Camion (>32t)", "Camion porteur 12 tonnes gasoil",
  "Camion porteur 7,5 tonnes gasoil", "Véhicule utilitaire essence", "Véhicule utilitaire gasoil",
  "Voiture essence", "Hélicoptère"
];
export const classicTransportOptions = emissionFactors.transport
  .filter(t => classicTransportWhitelist.includes(t.name))
  .map(t => t.name);

const classicHelicopterWhitelist = [
  "680 Kg (type Bell 206 JetRanger)",
  "1160 Kg (type Airbus H125 (AS350 Écureuil))",
  "1200 Kg (type Airbus H130 (EC130 T2))"
];
export const classicHelicopterPayloads = emissionFactors.helicopterPayloads
  .filter(h => classicHelicopterWhitelist.includes(h.name));

