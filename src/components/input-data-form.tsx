
'use client';

import * as React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { FormValues, ItemValues, SectionValues } from "./carbon-consult-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Factory, Leaf, PlusCircle, Trash2, Truck, Zap } from "lucide-react";
import { Construction } from "./icons";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { 
    emissionFactors,
    // Full lists (for Optimized scenario)
    materialOptions, steelOptions, paintOptions, concreteOptions, rebarOptions, 
    processOptions, energyOptions, implementationOptions, transportOptions, 
    helicopterPayloadOptions,
    // Classic lists
    classicMaterialOptions, classicSteelOptions, classicConcreteOptions, classicProcessOptions,
    classicEnergyOptions, classicImplementationOptions, classicTransportOptions,
    classicHelicopterPayloads
} from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";


type Scenario = 'classic' | 'optimized';

const SectionForm = ({ scenario }: { scenario: Scenario }) => {
  const { control } = useFormContext<FormValues>();

  return (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="materials"><Leaf className="mr-2 h-4 w-4" /> Matériaux</TabsTrigger>
          <TabsTrigger value="manufacturing"><Factory className="mr-2 h-4 w-4" /> Fabrication</TabsTrigger>
          <TabsTrigger value="energy"><Zap className="mr-2 h-4 w-4" /> Energie</TabsTrigger>
          <TabsTrigger value="implementation"><Construction className="mr-2 h-4 w-4" /> Mise en œuvre</TabsTrigger>
          <TabsTrigger value="transport"><Truck className="mr-2 h-4 w-4" /> Transport</TabsTrigger>
        </TabsList>
        <TabsContent value="materials">
            <MaterialSection scenario={scenario} />
        </TabsContent>
        <TabsContent value="manufacturing">
            <ProcessSection
                scenario={scenario}
                sectionName="manufacturing"
                title="Fabrication"
                description="Processus de fabrication."
                icon={Factory}
                options={scenario === 'classic' ? classicProcessOptions : processOptions}
            />
        </TabsContent>
         <TabsContent value="energy">
            <EnergySection scenario={scenario} />
        </TabsContent>
        <TabsContent value="implementation">
             <ProcessSection
                scenario={scenario}
                sectionName="implementation"
                title="Mise en œuvre"
                description="Étapes de mise en œuvre sur le chantier."
                icon={Construction}
                options={scenario === 'classic' ? classicImplementationOptions : implementationOptions}
            />
        </TabsContent>
        <TabsContent value="transport">
            <TransportSection scenario={scenario} />
        </TabsContent>
      </Tabs>
    </div>
  );
};


const MaterialSection = ({ scenario }: { scenario: Scenario }) => {
    const { control } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${scenario}.rawMaterials`,
    });
    const watchedMaterials = useWatch({ control, name: `${scenario}.rawMaterials` });

    const currentMaterialOptions = scenario === 'classic' ? classicMaterialOptions : materialOptions;
    const currentSteelOptions = scenario === 'classic' ? classicSteelOptions : steelOptions;
    const currentConcreteOptions = scenario === 'classic' ? classicConcreteOptions : concreteOptions;

    return (
        <SectionCard
            title="Matériaux"
            description="Spécifiez les matériaux utilisés et leurs quantités."
            icon={Leaf}
            actions={
                <Button
                    type="button" variant="outline" size="sm"
                    onClick={() => append({ 
                        material: "", quantity: 0, comment: "", concreteType: "",
                        cementMass: 0, isReinforced: false, rebarMass: 0,
                        rebarFactor: 1.2, paintFactor: 1.6, steelType: "",
                    })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                </Button>
            }
        >
            {fields.map((field, index) => {
                const selectedMaterial = watchedMaterials[index]?.material;
                const isSteel = selectedMaterial === 'Acier';
                const isConcrete = selectedMaterial === 'Béton';
                const isPaint = selectedMaterial === 'Peinture';
                const isEnrobe = selectedMaterial === 'Enrobé à chaud' || selectedMaterial === 'Enrobé à froid';
                const isReinforced = isConcrete && watchedMaterials[index]?.isReinforced;

                let quantityUnit = 'kg';
                if (isConcrete) quantityUnit = 'm³';
                if (isPaint || isEnrobe) quantityUnit = 'm²';

                return (
                    <div key={field.id} className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-md border p-4">
                        <div className="flex flex-col gap-4">
                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField
                                    control={control}
                                    name={`${scenario}.rawMaterials.${index}.material`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Matériau</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl>
                                                <SelectContent>{currentMaterialOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${scenario}.rawMaterials.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantité ({quantityUnit})</FormLabel>
                                            <FormControl><Input type="number" placeholder="ex: 100" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {isSteel && (
                                <div className="grid grid-cols-1 gap-4 rounded-md border bg-card/50 p-4">
                                <FormField
                                    control={control}
                                    name={`${scenario}.rawMaterials.${index}.steelType`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nuance d'acier</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez une nuance" /></SelectTrigger></FormControl>
                                        <SelectContent>{currentSteelOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                </div>
                            )}

                            {isPaint && (
                                <div className="grid grid-cols-1 gap-4 rounded-md border bg-card/50 p-4">
                                <FormField
                                    control={control}
                                    name={`${scenario}.rawMaterials.${index}.paintFactor`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Facteur d'émission peinture</FormLabel>
                                        <Select onValueChange={(v) => field.onChange(parseFloat(v))} defaultValue={field.value?.toString()}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez un facteur" /></SelectTrigger></FormControl>
                                        <SelectContent>{paintOptions.map(p => <SelectItem key={p.name} value={p.factor.toString()}>{p.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                </div>
                            )}

                            {isConcrete && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-md border bg-card/50 p-4">
                                <FormField
                                    control={control}
                                    name={`${scenario}.rawMaterials.${index}.concreteType`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type béton bas carbone</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez un type" /></SelectTrigger></FormControl>
                                        <SelectContent>{currentConcreteOptions.map(c => <SelectItem key={c} value={c}>{`${c} (${emissionFactors.concrete.find(f => f.name === c)?.factor} kgCO₂/kg)`}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${scenario}.rawMaterials.${index}.cementMass`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Masse ciment (kg/m³)</FormLabel>
                                        <FormControl><Input type="number" placeholder="ex: 300" {...field} value={field.value || ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${scenario}.rawMaterials.${index}.isReinforced`}
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-4 col-span-full">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel>Béton armé</FormLabel>
                                    </FormItem>
                                    )}
                                />
                                </div>
                            )}

                            {isReinforced && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-md border bg-card/50 p-4">
                                    <FormField
                                        control={control}
                                        name={`${scenario}.rawMaterials.${index}.rebarMass`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Masse ferraillage (kg/m³)</FormLabel>
                                            <FormControl><Input type="number" placeholder="ex: 100" {...field} value={field.value || ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`${scenario}.rawMaterials.${index}.rebarFactor`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Facteur d'émission armature</FormLabel>
                                            <Select onValueChange={(v) => field.onChange(parseFloat(v))} defaultValue={field.value?.toString()}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez un facteur" /></SelectTrigger></FormControl>
                                            <SelectContent>{rebarOptions.map(r => <SelectItem key={r.name} value={r.factor.toString()}>{r.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <FormField
                                control={control}
                                name={`${scenario}.rawMaterials.${index}.comment`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Commentaires</FormLabel>
                                        <FormControl><Input placeholder="Hypothèses, détails..." {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="pt-8">
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </SectionCard>
    );
};


const ProcessSection = ({ scenario, sectionName, title, description, icon, options }: {
    scenario: Scenario;
    sectionName: keyof Pick<SectionValues, 'manufacturing' | 'implementation'>;
    title: string;
    description: string;
    icon: React.ElementType;
    options: string[];
}) => {
    const { control } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: `${scenario}.${sectionName}`});
    const watchedItems = useWatch({ control, name: `${scenario}.${sectionName}` });
    
    const factors = sectionName === 'manufacturing' ? emissionFactors.manufacturing : emissionFactors.implementation;

    return (
        <SectionCard
            title={title}
            description={description}
            icon={icon}
            actions={
                <Button type="button" variant="outline" size="sm" onClick={() => append({ process: "", value: 0, comment: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                </Button>
            }
        >
            {fields.map((field, index) => {
                 const selectedProcess = watchedItems?.[index]?.process;
                 const processData = factors.find(p => p.name === selectedProcess);
                 const isTimeBased = processData?.unit.endsWith('/hr');
                 const label = isTimeBased ? 'Durée (heures)' : 'Quantité (kg)';
                 const placeholder = isTimeBased ? 'ex: 50' : 'ex: 10';

                return (
                <div key={field.id} className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-md border p-4">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={control}
                                name={`${scenario}.${sectionName}.${index}.process`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Processus</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl>
                                            <SelectContent>{options.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`${scenario}.${sectionName}.${index}.value`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{label}</FormLabel>
                                        <FormControl><Input type="number" placeholder={placeholder} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={control}
                            name={`${scenario}.${sectionName}.${index}.comment`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Commentaires</FormLabel>
                                <FormControl><Input placeholder="Hypothèses, détails..." {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="pt-8">
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            )})}
        </SectionCard>
    );
};


const EnergySection = ({ scenario }: { scenario: Scenario }) => {
    const { control } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: `${scenario}.energy`});

    const currentEnergyOptions = scenario === 'classic' ? classicEnergyOptions : energyOptions;

    return (
        <SectionCard
            title="Énergie"
            description="Consommation d'énergie du projet."
            icon={Zap}
            actions={
                <Button type="button" variant="outline" size="sm" onClick={() => append({ source: "", consumption: 0, comment: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                </Button>
            }
        >
            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-md border p-4">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                             <FormField
                                control={control}
                                name={`${scenario}.energy.${index}.source`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source d'énergie</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl>
                                            <SelectContent>{currentEnergyOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`${scenario}.energy.${index}.consumption`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consommation (heures)</FormLabel>
                                        <FormControl><Input type="number" placeholder="ex: 100" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={control}
                            name={`${scenario}.energy.${index}.comment`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Commentaires</FormLabel>
                                <FormControl><Input placeholder="Hypothèses, détails..." {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="pt-8">
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            ))}
        </SectionCard>
    );
};


const TransportSection = ({ scenario }: { scenario: Scenario }) => {
    const { control } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: `${scenario}.transport` });
    const watchedTransport = useWatch({ control, name: `${scenario}.transport`});

    const currentTransportOptions = scenario === 'classic' ? classicTransportOptions : transportOptions;
    const currentHelicopterOptions = scenario === 'classic' ? classicHelicopterPayloads : helicopterPayloadOptions;

    return (
        <SectionCard
            title="Transport"
            description="Détaillez les étapes de transport."
            icon={Truck}
            actions={
                <Button type="button" variant="outline" size="sm" onClick={() => append({ mode: "", distance: 0, weight: 0, comment: "", helicopterPayload: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                </Button>
            }
        >
            {fields.map((field, index) => {
                const isHelicopter = watchedTransport?.[index]?.mode === 'Hélicoptère';
                return (
                    <div key={field.id} className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-md border p-4">
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <FormField
                                    control={control}
                                    name={`${scenario}.transport.${index}.mode`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mode</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl>
                                                <SelectContent>{currentTransportOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${scenario}.transport.${index}.distance`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Distance (km)</FormLabel>
                                            <FormControl><Input type="number" placeholder="ex: 500" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${scenario}.transport.${index}.weight`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Poids (tonnes)</FormLabel>
                                            <FormControl><Input type="number" placeholder="ex: 10" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {isHelicopter && (
                                <div className="grid grid-cols-1 gap-4 rounded-md border bg-card/50 p-4">
                                <FormField
                                    control={control}
                                    name={`${scenario}.transport.${index}.helicopterPayload`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Charge utile</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl>
                                            <SelectContent>{currentHelicopterOptions.map(h => <SelectItem key={h.name} value={h.name}>{h.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                </div>
                            )}

                            <FormField
                                control={control}
                                name={`${scenario}.transport.${index}.comment`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Commentaires</FormLabel>
                                    <FormControl><Input placeholder="Hypothèses, détails..." {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="pt-8">
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                )
            })}
        </SectionCard>
    );
};

const SectionCard = ({ title, description, icon: Icon, children, actions }: {
    title: string;
    description: string;
    icon: React.ElementType;
    children: React.ReactNode;
    actions: React.ReactNode;
}) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-5 w-5 text-primary" /> {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div>{actions}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {React.Children.count(children) === 0 ? (
          <p className="text-sm text-center text-muted-foreground pt-4">Aucun élément ajouté.</p>
        ) : children}
      </CardContent>
    </Card>
);

export function InputDataForm() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Offre Classique</CardTitle>
            <CardDescription>
              Données pour le scénario de référence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SectionForm scenario="classic" />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Offre optimisée bas carbone</CardTitle>
            <CardDescription>
              Données pour le scénario optimisé.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SectionForm scenario="optimized" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
