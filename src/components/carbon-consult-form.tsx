
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import React, { useMemo, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { Button } from "./ui/button";
import { FileUp } from "lucide-react";
import { FileSpreadsheet } from "./icons";
import { InputDataForm } from "./input-data-form";
import { DetailedComparison } from "./detailed-comparison";
import { Synthesis } from "./synthesis";
import { emissionFactors, helicopterPayloadOptions } from "@/lib/data";

const itemSchema = z.object({
  material: z.string().min(1, "Veuillez sélectionner un matériau.").optional(),
  quantity: z.coerce.number().min(0, "La quantité doit être positive.").optional(),
  comment: z.string().optional(),
  concreteType: z.string().optional(),
  cementMass: z.coerce.number().optional(),
  isReinforced: z.boolean().optional(),
  rebarMass: z.coerce.number().optional(),
  rebarFactor: z.coerce.number().optional(),
  paintFactor: z.coerce.number().optional(),
  steelType: z.string().optional(),
  process: z.string().min(1, "Veuillez sélectionner un processus.").optional(),
  value: z.coerce.number().min(0, "La valeur doit être positive.").optional(),
  source: z.string().min(1, "Veuillez sélectionner une source.").optional(),
  consumption: z.coerce.number().min(0, "La consommation doit être positive.").optional(),
  mode: z.string().min(1, "Veuillez sélectionner un mode.").optional(),
  distance: z.coerce.number().min(0, "La distance doit être positive.").optional(),
  weight: z.coerce.number().min(0, "Le poids doit être positif.").optional(),
  helicopterPayload: z.string().optional(),
});

const formSectionSchema = z.object({
  rawMaterials: z.array(itemSchema),
  manufacturing: z.array(itemSchema),
  energy: z.array(itemSchema),
  implementation: z.array(itemSchema),
  transport: z.array(itemSchema),
});

const mainFormSchema = z.object({
  classic: formSectionSchema,
  optimized: formSectionSchema,
});

export type FormValues = z.infer<typeof mainFormSchema>;
export type SectionValues = z.infer<typeof formSectionSchema>;
export type ItemValues = z.infer<typeof itemSchema>;


export function CarbonConsultForm({ consultationLabel }: { consultationLabel: string }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<FormValues>({
    resolver: zodResolver(mainFormSchema),
    defaultValues: {
      classic: {
        rawMaterials: [],
        manufacturing: [],
        energy: [],
        implementation: [],
        transport: [],
      },
      optimized: {
        rawMaterials: [],
        manufacturing: [],
        energy: [],
        implementation: [],
        transport: [],
      },
    },
  });

  const handleExportToExcel = () => {
    try {
        const data = methods.getValues();
        const wb = XLSX.utils.book_new();

        const createSheet = (scenario: 'classic' | 'optimized') => {
            const { totals: calculatedTotals, details: calculatedDetails } = calculateEmissions(data[scenario]);
            
            const header = [
                "Rubriques", "Méthodes", "Unité", "Quantité",
                "Facteur d'émission (kg CO²e)", "Masse ciment (kg/m³)",
                "Facteur d'émission armature (kg CO²e)", "Masse de ferraillage (kg/m³)",
                "Poids (tonnes)", "Kg CO²e", "Commentaires explicatifs"
            ];
            const ws_data: (string | number)[][] = [header];

            const addRow = (rubrique: string, item: any, co2e: number) => {
                let row: (string | number)[] = Array(header.length).fill('');
                row[0] = rubrique;
                row[10] = item.comment || '';
                
                let methodName = item.material || item.process || item.mode || item.source || '';
                let quantity = item.quantity ?? item.value ?? item.consumption ?? item.distance ?? 0;
                
                const getEmissionFactor = (rubrique: string, item: any) => {
                    switch (rubrique) {
                        case 'Matériaux':
                            if (item.material === 'Acier') return emissionFactors.steelTypes.find(s => s.name === item.steelType)?.factor || 0;
                            if (item.material === 'Béton') return emissionFactors.concrete.find(c => c.name === item.concreteType)?.factor || 0;
                            if (item.material === 'Peinture') return item.paintFactor || 0;
                            return emissionFactors.materials.find(m => m.name === item.material)?.factor || 0;
                        case 'Fabrication': return emissionFactors.manufacturing.find(p => p.name === item.process)?.factor || 0;
                        case 'Energie': return emissionFactors.energy.find(e => e.name === item.source)?.factor || 0;
                        case 'Mise en œuvre': return emissionFactors.implementation.find(i => i.name === item.process)?.factor || 0;
                        case 'Transport':
                            if (item.mode === 'Hélicoptère') return emissionFactors.helicopterPayloads.find(h => h.name === item.helicopterPayload)?.factor || 0;
                            return emissionFactors.transport.find(t => t.name === item.mode)?.factor || 0;
                        default: return 0;
                    }
                };
                
                row[4] = getEmissionFactor(rubrique, item);
                row[3] = quantity;
                row[9] = co2e.toFixed(2);
                
                if (rubrique === 'Matériaux') {
                    if (item.material === 'Acier') { methodName = item.steelType; row[2] = 'kg'; }
                    else if (item.material === 'Béton') {
                        methodName = item.concreteType || 'Béton'; row[2] = 'm³'; row[5] = item.cementMass || '';
                        if (item.isReinforced) { methodName += " armé"; row[6] = item.rebarFactor || ''; row[7] = item.rebarMass || ''; }
                    } else if (item.material === "Peinture") { methodName = "Peinture"; row[2] = 'm²'; }
                    else {
                        const materialData = emissionFactors.materials.find(m => m.name === item.material);
                        row[2] = materialData?.unit.split('/')[1] || 'kg';
                    }
                } else if (rubrique === 'Fabrication' || rubrique === 'Mise en œuvre') {
                     const processData = emissionFactors.manufacturing.find(m => m.name === item.process) || emissionFactors.implementation.find(m => m.name === item.process);
                     row[2] = processData?.unit.endsWith('/hr') ? 'H' : 'kg';
                } else if (rubrique === 'Energie') { row[2] = 'H';
                } else if (rubrique === 'Transport') {
                    row[2] = 'km'; row[8] = item.weight || '';
                    if (item.mode === 'Hélicoptère') methodName = item.helicopterPayload || 'Hélicoptère';
                }

                row[1] = methodName;
                ws_data.push(row);
            };

            const sections = ['rawMaterials', 'manufacturing', 'energy', 'implementation', 'transport'];
            const sectionNames = ['Matériaux', 'Fabrication', 'Energie', 'Mise en œuvre', 'Transport'];

            sections.forEach((section, secIndex) => {
              const items = data[scenario][section as keyof SectionValues] || [];
              items.forEach((item, index) => {
                  const co2eItem = calculatedDetails[section as keyof typeof calculatedDetails]?.find((d:any, i:any) => i === index);
                  if (Object.values(item).some(v => v)) {
                    addRow(sectionNames[secIndex], item, co2eItem?.co2e || 0);
                  }
              });
            });

            let totalRow: (string | number)[] = Array(header.length).fill('');
            totalRow[0] = "Total";
            totalRow[9] = calculatedTotals.grandTotal.toFixed(2);
            ws_data.push(totalRow);

            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            ws['!cols'] = [];
            header.forEach((h, i) => {
                const colWidth = Math.max(h.length, ...ws_data.map(row => (row[i] || '').toString().length)) + 2;
                if(ws['!cols']) {
                  ws['!cols'][i] = { wch: colWidth };
                }
            });
            return ws;
        };

        const wsClassic = createSheet('classic');
        XLSX.utils.book_append_sheet(wb, wsClassic, 'Bilan Classique');

        const wsOptimized = createSheet('optimized');
        XLSX.utils.book_append_sheet(wb, wsOptimized, 'Bilan Optimisé');

        XLSX.writeFile(wb, `bilan_carbone_${consultationLabel.replace(/ /g, '_') || 'comparaison'}.xlsx`);

        toast({
            title: "Exportation réussie",
            description: "Le fichier Excel contenant les deux bilans a été téléchargé.",
        });
    } catch(e) {
        console.error("Erreur lors de l'export Excel:", e);
        toast({
            variant: "destructive",
            title: "Échec de l'exportation",
            description: "Une erreur est survenue lors de la génération du fichier Excel.",
        });
    }
  };

  const handleImportFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const newValues: FormValues = {
              classic: { rawMaterials: [], manufacturing: [], energy: [], implementation: [], transport: [] },
              optimized: { rawMaterials: [], manufacturing: [], energy: [], implementation: [], transport: [] },
            };

            const processSheet = (sheetName: string, scenario: 'classic' | 'optimized') => {
                const worksheet = workbook.Sheets[sheetName];
                if (!worksheet) return;

                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
                const headers = json[0] as string[];
                const dataRows = json.slice(1, -1); // Exclude header and total row

                const headerMap: { [key: string]: number } = {};
                headers.forEach((h, i) => { headerMap[h.trim()] = i; });

                dataRows.forEach(row => {
                    const section = row[headerMap['Rubriques']]?.trim();
                    const methodName = row[headerMap['Méthodes']]?.trim();
                    if (!section || !methodName) return;

                    const quantity = Number(row[headerMap['Quantité']]) || undefined;
                    const comment = row[headerMap['Commentaires explicatifs']] || undefined;
                    
                    const item: ItemValues = { comment };

                    switch (section) {
                        case 'Matériaux': {
                            let material = methodName;
                            const isSteel = emissionFactors.steelTypes.some(s => s.name === methodName);
                            const isConcrete = emissionFactors.concrete.some(c => c.name === methodName.replace(' armé', ''));
                            const isPaint = methodName === 'Peinture';
                            
                            if (isSteel) {
                                item.material = 'Acier';
                                item.steelType = methodName;
                            } else if (isConcrete) {
                                item.material = 'Béton';
                                item.concreteType = methodName.replace(' armé', '');
                                item.isReinforced = methodName.includes(' armé');
                            } else if (isPaint) {
                                item.material = 'Peinture';
                                item.paintFactor = Number(row[headerMap["Facteur d'émission (kg CO²e)"]]) || undefined;
                            } else {
                                item.material = methodName;
                            }
                            
                            item.quantity = quantity;
                            item.cementMass = Number(row[headerMap['Masse ciment (kg/m³)']]) || undefined;
                            item.rebarMass = Number(row[headerMap['Masse de ferraillage (kg/m³)']]) || undefined;
                            item.rebarFactor = Number(row[headerMap["Facteur d'émission armature (kg CO²e)"]]) || undefined;
                            
                            newValues[scenario].rawMaterials.push(item);
                            break;
                        }
                        case 'Fabrication':
                            item.process = methodName; item.value = quantity;
                            newValues[scenario].manufacturing.push(item);
                            break;
                        case 'Energie':
                            item.source = methodName; item.consumption = quantity;
                            newValues[scenario].energy.push(item);
                            break;
                        case 'Mise en œuvre':
                            item.process = methodName; item.value = quantity;
                            newValues[scenario].implementation.push(item);
                            break;
                        case 'Transport':
                            const isHelo = helicopterPayloadOptions.some(h => h.name === methodName);
                            item.mode = isHelo ? 'Hélicoptère' : methodName;
                            item.helicopterPayload = isHelo ? methodName : undefined;
                            item.distance = quantity;
                            item.weight = Number(row[headerMap['Poids (tonnes)']]) || undefined;
                            newValues[scenario].transport.push(item);
                            break;
                    }
                });
            }
            
            processSheet('Bilan Classique', 'classic');
            processSheet('Bilan Optimisé', 'optimized');

            methods.reset(newValues);
            toast({
                title: "Importation réussie",
                description: "Les données des bilans classique et optimisé ont été chargées.",
            });
        } catch (error) {
            console.error("Erreur lors de l'importation du fichier:", error);
            toast({
                variant: 'destructive',
                title: "Échec de l'importation",
                description: "Le fichier est peut-être corrompu ou son format est incorrect.",
            });
        } finally {
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const calculateEmissions = (values: SectionValues) => {
    const rmDetails = values.rawMaterials?.map(item => {
      let co2e = 0;
      let name = item.material || "Inconnu";
      
      if (item.material === "Acier") {
        name = item.steelType || "Acier";
        const factor = emissionFactors.steelTypes.find(s => s.name === item.steelType)?.factor || 0;
        co2e = (item.quantity || 0) * factor;
      } else if (item.material === "Béton") {
        name = item.concreteType || "Béton";
        const quantity = item.quantity || 0;
        const cementMass = item.cementMass || 0;
        const concreteFactor = emissionFactors.concrete.find(c => c.name === item.concreteType)?.factor || 0;
        
        const cementCO2e = (quantity * cementMass) * concreteFactor;
        co2e += cementCO2e;
        
        if (item.isReinforced) {
          const rebarMass = item.rebarMass || 0;
          const rebarFactorValue = item.rebarFactor || 0;
          const rebarCO2e = (quantity * rebarMass) * rebarFactorValue;
          co2e += rebarCO2e;
          name = `${name} armé`;
        }
      } else if (item.material === "Peinture") {
        name = "Peinture";
        co2e = (item.quantity || 0) * (item.paintFactor || 0);
      }
      else {
        const factor = emissionFactors.materials.find(m => m.name === item.material)?.factor || 0;
        co2e = (item.quantity || 0) * factor;
      }
      
      return { name, co2e, quantity: item.quantity || 0, unit: emissionFactors.materials.find(m => m.name === item.material)?.unit || 'kg' };
    }).filter(item => item.co2e > 0) || [];
    
    const mfgDetails = values.manufacturing?.map(item => {
      const factor = emissionFactors.manufacturing.find(p => p.name === item.process)?.factor || 0;
      return { name: item.process || "Inconnu", co2e: (item.value || 0) * factor, quantity: item.value || 0, unit: emissionFactors.manufacturing.find(p => p.name === item.process)?.unit || '' };
    }).filter(item => item.co2e > 0) || [];

    const energyDetails = values.energy?.map(item => {
      const factor = emissionFactors.energy.find(e => e.name === item.source)?.factor || 0;
      return { name: item.source || "Inconnu", co2e: (item.consumption || 0) * factor, quantity: item.consumption || 0, unit: 'heures' };
    }).filter(item => item.co2e > 0) || [];

    const implDetails = values.implementation?.map(item => {
      const factor = emissionFactors.implementation.find(i => i.name === item.process)?.factor || 0;
      return { name: item.process || "Inconnu", co2e: (item.value || 0) * factor, quantity: item.value || 0, unit: emissionFactors.implementation.find(i => i.name === item.process)?.unit || '' };
    }).filter(item => item.co2e > 0) || [];

    const tptDetails = values.transport?.map(item => {
      let factor = 0;
      let name = item.mode || "Inconnu";
      if (item.mode === "Hélicoptère") {
        const payload = emissionFactors.helicopterPayloads.find(h => h.name === item.helicopterPayload);
        factor = payload?.factor || 0;
        name = item.helicopterPayload || "Hélicoptère";
      } else {
        factor = emissionFactors.transport.find(t => t.name === item.mode)?.factor || 0;
      }
      return { name, co2e: (item.distance || 0) * (item.weight || 0) * factor, quantity: item.distance || 0, unit: 'km', weight: item.weight || 0 };
    }).filter(item => item.co2e > 0) || [];


    const rmTotal = rmDetails.reduce((sum, item) => sum + item.co2e, 0);
    const mfgTotal = mfgDetails.reduce((sum, item) => sum + item.co2e, 0);
    const energyTotal = energyDetails.reduce((sum, item) => sum + item.co2e, 0);
    const implTotal = implDetails.reduce((sum, item) => sum + item.co2e, 0);
    const tptTotal = tptDetails.reduce((sum, item) => sum + item.co2e, 0);

    return {
      totals: {
        rawMaterials: rmTotal,
        manufacturing: mfgTotal,
        energy: energyTotal,
        implementation: implTotal,
        transport: tptTotal,
        grandTotal: rmTotal + mfgTotal + energyTotal + implTotal + tptTotal,
      },
      details: {
        rawMaterials: rmDetails,
        manufacturing: mfgDetails,
        energy: energyDetails,
        implementation: implDetails,
        transport: tptDetails,
      }
    };
  };

  return (
    <FormProvider {...methods}>
      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-3 print:hidden">
          <TabsTrigger value="input">Données d'Entrée</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison Détaillée</TabsTrigger>
          <TabsTrigger value="synthesis">Synthèse & Visualisation</TabsTrigger>
        </TabsList>
        <TabsContent value="input">
          <InputDataForm />
        </TabsContent>
        <TabsContent value="comparison">
           <DetailedComparison calculateEmissions={calculateEmissions} />
        </TabsContent>
        <TabsContent value="synthesis" id="synthesis-content">
          <Synthesis calculateEmissions={calculateEmissions} consultationLabel={consultationLabel}/>
        </TabsContent>
      </Tabs>
      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-8 print:hidden">
          <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFromExcel}
              accept=".xlsx, .xls"
              className="hidden"
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="mr-2 h-4 w-4" />
              Importer les bilans
          </Button>
          <Button type="button" variant="outline" onClick={handleExportToExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Générer les bilans (XLS)
          </Button>
      </div>
    </FormProvider>
  );
}
