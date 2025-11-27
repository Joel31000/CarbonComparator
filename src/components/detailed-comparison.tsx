
'use client';
import { useFormContext, useWatch } from "react-hook-form";
import { FormValues, SectionValues } from "./carbon-consult-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { useMemo } from "react";

const sectionTitles: Record<keyof SectionValues, string> = {
    rawMaterials: "Matériaux",
    manufacturing: "Fabrication",
    energy: "Énergie",
    implementation: "Mise en œuvre",
    transport: "Transport",
};

const getRowName = (item: any, section: keyof SectionValues) => {
    switch (section) {
        case 'rawMaterials':
            if (item.material === 'Acier') return item.steelType || 'Acier';
            if (item.material === 'Béton') return `${item.concreteType}${item.isReinforced ? ' armé' : ''}`;
            if (item.material === 'Peinture') return 'Peinture';
            return item.material;
        case 'manufacturing':
        case 'implementation':
            return item.process;
        case 'energy':
            return item.source;
        case 'transport':
            if (item.mode === 'Hélicoptère') return item.helicopterPayload || 'Hélicoptère';
            return item.mode;
        default:
            return 'Inconnu';
    }
}


export function DetailedComparison({ calculateEmissions }: { calculateEmissions: (values: SectionValues) => any }) {
    const { control } = useFormContext<FormValues>();
    const watchedValues = useWatch({ control });

    const { classicResults, optimizedResults } = useMemo(() => ({
        classicResults: calculateEmissions(watchedValues.classic),
        optimizedResults: calculateEmissions(watchedValues.optimized)
    }), [watchedValues, calculateEmissions]);
    
    const sections = Object.keys(sectionTitles) as Array<keyof SectionValues>;

    const comparisonData = useMemo(() => {
        return sections.map(section => {
            const classicItems = classicResults.details[section] || [];
            const optimizedItems = optimizedResults.details[section] || [];
            
            const allItemNames = Array.from(new Set([
                ...classicItems.map((item:any) => getRowName(watchedValues.classic[section].find((_,i) => i === classicItems.indexOf(item)), section)),
                ...optimizedItems.map((item:any) => getRowName(watchedValues.optimized[section].find((_,i) => i === optimizedItems.indexOf(item)), section))
            ]));


            const rows = allItemNames.map(name => {
                const classicItem = classicItems.find((item:any, index: number) => getRowName(watchedValues.classic[section][index], section) === name);
                const optimizedItem = optimizedItems.find((item: any, index: number) => getRowName(watchedValues.optimized[section][index], section) === name);
                
                const classicCO2e = classicItem?.co2e || 0;
                const optimizedCO2e = optimizedItem?.co2e || 0;
                const diff = optimizedCO2e - classicCO2e;

                return {
                    name,
                    classicCO2e,
                    optimizedCO2e,
                    diff,
                }
            });

            return {
                section,
                title: sectionTitles[section],
                rows,
                totalClassic: classicResults.totals[section],
                totalOptimized: optimizedResults.totals[section],
                totalDiff: optimizedResults.totals[section] - classicResults.totals[section],
            }
        });

    }, [classicResults, optimizedResults, sections, watchedValues]);


    const renderDiff = (diff: number) => {
        if (Math.abs(diff) < 0.01) {
            return <span className="flex items-center text-muted-foreground"><Minus className="h-4 w-4 mr-1"/> 0.00</span>;
        }
        const isGain = diff < 0;
        return (
            <span className={`flex items-center font-semibold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                {isGain ? <ArrowDown className="h-4 w-4 mr-1" /> : <ArrowUp className="h-4 w-4 mr-1" />}
                {diff.toFixed(2)}
            </span>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Comparaison Détaillée par Poste</CardTitle>
                <CardDescription>
                    Analyse des émissions de CO₂e pour chaque poste des offres classique et optimisée.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {comparisonData.filter(data => data.rows.length > 0).map(data => (
                    <div key={data.section}>
                        <h3 className="text-lg font-semibold mb-2">{data.title}</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Élément</TableHead>
                                    <TableHead className="text-right">Offre Classique (kg CO₂e)</TableHead>
                                    <TableHead className="text-right">Offre Optimisée (kg CO₂e)</TableHead>
                                    <TableHead className="text-right">Écart (kg CO₂e)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.rows.map(row => (
                                    <TableRow key={row.name}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell className="text-right">{row.classicCO2e.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{row.optimizedCO2e.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{renderDiff(row.diff)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-muted/50 font-bold">
                                    <TableCell>Total {data.title}</TableCell>
                                    <TableCell className="text-right">{data.totalClassic.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{data.totalOptimized.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{renderDiff(data.totalDiff)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                ))}
                 {comparisonData.every(data => data.rows.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                        Aucune donnée saisie. Commencez par ajouter des éléments dans l'onglet "Données d'Entrée".
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

