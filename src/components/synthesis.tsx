
'use client';
import { useFormContext, useWatch } from "react-hook-form";
import { FormValues, SectionValues } from "./carbon-consult-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "./ui/chart";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { ArrowDown } from "lucide-react";

const sectionTitles: Record<keyof SectionValues, string> = {
    rawMaterials: "Matériaux",
    manufacturing: "Fabrication",
    energy: "Énergie",
    implementation: "Mise en œuvre",
    transport: "Transport",
};

export function Synthesis({ calculateEmissions, consultationLabel }: {
    calculateEmissions: (values: SectionValues) => any,
    consultationLabel: string 
}) {
    const { control } = useFormContext<FormValues>();
    const watchedValues = useWatch({ control });

    const { classicTotals, optimizedTotals } = useMemo(() => ({
        classicTotals: calculateEmissions(watchedValues.classic).totals,
        optimizedTotals: calculateEmissions(watchedValues.optimized).totals
    }), [watchedValues, calculateEmissions]);
    
    const grandTotalClassic = classicTotals.grandTotal;
    const grandTotalOptimized = optimizedTotals.grandTotal;
    const totalGain = grandTotalClassic - grandTotalOptimized;
    const percentageGain = grandTotalClassic > 0 ? (totalGain / grandTotalClassic) * 100 : 0;
    
    const chartData = useMemo(() => {
        return Object.keys(sectionTitles).map(key => ({
            name: sectionTitles[key as keyof SectionValues],
            classique: classicTotals[key as keyof SectionValues],
            optimisée: optimizedTotals[key as keyof SectionValues],
        }));
    }, [classicTotals, optimizedTotals]);

    const chartConfig = {
        classique: {
            label: "Classique",
            color: "hsl(var(--chart-2))",
        },
        optimisée: {
            label: "Optimisée",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    const hasData = grandTotalClassic > 0 || grandTotalOptimized > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Synthèse et Visualisation</CardTitle>
                <CardDescription>
                    {consultationLabel ? `${consultationLabel} - ` : ''}
                    Comparaison globale des émissions et visualisation des gains.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Offre Classique</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{grandTotalClassic.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">kg CO₂e</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Offre Optimisée</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{grandTotalOptimized.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">kg CO₂e</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-green-950/50 border-green-500">
                        <CardHeader>
                            <CardTitle className="text-green-400">Gain Total</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2">
                                <ArrowDown className="h-8 w-8 text-green-500"/>
                                <p className="text-3xl font-bold text-green-400">
                                    {totalGain.toFixed(2)}
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground">kg CO₂e économisés</p>
                             <p className="text-xl font-semibold text-green-400 mt-2">
                                ({percentageGain.toFixed(1)}%)
                            </p>
                        </CardContent>
                    </Card>
                </div>
                
                 <div>
                    <h3 className="text-lg font-semibold mb-4 text-center">Répartition des émissions par poste</h3>
                    {hasData ? (
                        <div className="h-80 w-full">
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    fontSize={12}
                                />
                                <YAxis 
                                  tickLine={false}
                                  axisLine={false}
                                  fontSize={12}
                                  unit="kg"
                                />
                                <RechartsTooltip 
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    content={<ChartTooltipContent />} 
                                />
                                <Legend wrapperStyle={{fontSize: "0.8rem"}} />
                                <Bar dataKey="classique" fill="var(--color-classique)" radius={4} />
                                <Bar dataKey="optimisée" fill="var(--color-optimisée)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                        </div>
                    ) : (
                         <p className="text-center text-muted-foreground py-8">
                            Aucune donnée à visualiser. Commencez par ajouter des éléments dans l'onglet "Données d'Entrée".
                        </p>
                    )}
                 </div>
            </CardContent>
        </Card>
    );
}

