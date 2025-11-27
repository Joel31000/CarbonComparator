
'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CarbonConsultForm } from '@/components/carbon-consult-form';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Download, HelpCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [isExporting, setIsExporting] = useState(false);
  const [consultationLabel, setConsultationLabel] = useState('');

  const handleExportToPDF = async () => {
    setIsExporting(true);
    // We target the synthesis tab content for the PDF export
    const input = document.getElementById('synthesis-content');
    if (input) {
      try {
        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: null, 
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        
        let newImgWidth = pdfWidth;
        let newImgHeight = newImgWidth / ratio;

        if (newImgHeight > pdfHeight) {
          newImgHeight = pdfHeight;
          newImgWidth = newImgHeight * ratio;
        }

        const x = (pdfWidth - newImgWidth) / 2;
        const y = 0;

        pdf.addImage(imgData, 'PNG', x, y, newImgWidth, newImgHeight);
        pdf.save('synthese_carbone.pdf');
      } catch (error) {
        console.error("Erreur lors de la génération du PDF:", error);
      } finally {
        setIsExporting(false);
      }
    } else {
      console.error("Element à exporter non trouvé. Assurez-vous que l'onglet 'Synthèse' est visible.");
      setIsExporting(false);
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 print:hidden">
        <div className="flex w-full items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-lg font-semibold text-primary">
            <Logo className="h-7 w-7" />
            <span className="font-headline text-2xl tracking-tight">CarbonComparator</span>
          </a>
          <div className="flex items-center gap-2">
            <Button type="button" onClick={handleExportToPDF} variant="default" size="default" disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Télécharger la Synthèse (PDF)
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>À propos de CarbonComparator</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm text-muted-foreground">
                  <p>
                    CarbonComparator est une application mise à la disposition des fournisseurs pour calculer le bilan carbone de leurs offres lors des consultations et comparer des variantes.
                  </p>
                  <p>
                    Le périmètre du calcul du bilan carbone prend en compte les postes : Matériaux, Fabrication, Energie, Transport et Mise en œuvre.
                  </p>
                  <p>
                    La fonctionnalité de comparaison permet de mesurer l'écart entre une offre optimisée et une offre classique, en visualisant les gains en Teq CO2 et en pourcentage.
                  </p>
                  <p>
                    Le fournisseur peut éditer le bilan de l’empreinte carbone au format PDF et générer un fichier excel du bilan détaillé carbone. Ces documents doivent être joints aux autres documents constitutifs de son offre.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-7xl gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="consultation-label">Libellé consultation</Label>
            <Input 
              id="consultation-label" 
              type="text" 
              placeholder="Ex: Appel d'offres Mairie de Paris" 
              value={consultationLabel}
              onChange={(e) => setConsultationLabel(e.target.value)}
            />
          </div>
        </div>
        <div className="mx-auto grid w-full max-w-7xl items-start">
          <CarbonConsultForm consultationLabel={consultationLabel} />
        </div>
      </main>
      <footer className="border-t border-border/40 bg-background/95 py-4 text-center text-sm text-muted-foreground print:hidden">
        © {new Date().getFullYear()} CarbonComparator. Tous droits réservés.
      </footer>
    </div>
  );
}
