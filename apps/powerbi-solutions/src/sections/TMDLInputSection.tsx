import { useState, useRef, useCallback, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  Check,
  Download,
  FileCode,
  FileText,
  FolderOpen,
  Monitor,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeTMDL } from '@/utils/tmdlParser';
import { toast } from 'sonner';
import type { AnalysisResult } from '@/types';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ANALYZE_COOLDOWN_SECONDS = 5;

interface TMDLInputSectionProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  inputRef: React.RefObject<HTMLDivElement | null>;
}

const sampleTMDL = `model SalesModel
  table Customers
    column CustomerID
      dataType: int64
      isHidden: false
    column CustomerName
      dataType: string
    column Email
      dataType: string
      isHidden: true
    column Region
      dataType: string

  table Orders
    column OrderID
      dataType: int64
    column CustomerID
      dataType: int64
    column OrderDate
      dataType: dateTime
    column Amount
      dataType: double
    column Quantity
      dataType: int64

  table Products
    column ProductID
      dataType: int64
    column ProductName
      dataType: string
    column Category
      dataType: string
    column Price
      dataType: double

  relationship Rel_Customers_Orders
    fromTable: Orders
    fromColumn: CustomerID
    toTable: Customers
    toColumn: CustomerID
    cardinality: manyToOne

  relationship Rel_Products_Orders
    fromTable: Orders
    fromColumn: ProductID
    toTable: Products
    toColumn: ProductID
    cardinality: manyToOne

  measure TotalSales
    table: Orders
    expression: "SUM(Orders[Amount])"
    formatString: "$#,##0.00"

  measure OrderCount
    table: Orders
    expression: "COUNTROWS(Orders)"

  measure AverageOrderValue
    table: Orders
    expression: "DIVIDE([TotalSales], [OrderCount], 0)"
    formatString: "$#,##0.00"`;

const guideSteps = [
  {
    icon: Monitor,
    title: 'Open Power BI Desktop',
    description:
      'Launch Power BI Desktop and open the report containing the model you want to analyze.',
  },
  {
    icon: Download,
    title: 'Export the template',
    description:
      'Use File > Export > Power BI template to create a .pbit package containing the model structure.',
  },
  {
    icon: FolderOpen,
    title: 'Extract the model folder',
    description:
      'Rename the .pbit file to .zip and extract it so you can access the model definition assets.',
  },
  {
    icon: FileText,
    title: 'Locate the TMDL',
    description:
      'Inside the extracted Model folder, use the .tmdl file as the input for this workspace.',
  },
];

export function TMDLInputSection({ onAnalysisComplete, inputRef }: TMDLInputSectionProps) {
  const [tmdlText, setTmdlText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeCooldown, setAnalyzeCooldown] = useState(0);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: shellsRef, isVisible: shellsVisible } = useScrollAnimation<HTMLDivElement>();

  useEffect(() => {
    if (analyzeCooldown === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setAnalyzeCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [analyzeCooldown]);

  const readFiles = useCallback(async (files: File[]) => {
    const tmdlFiles = files.filter((file) => file.name.endsWith('.tmdl') || file.name.endsWith('.txt'));

    if (tmdlFiles.length === 0) {
      toast.error('Please select .tmdl or .txt files.');
      return;
    }

    const oversized = tmdlFiles.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      toast.error(`File too large: ${oversized.map((file) => file.name).join(', ')}. Max 10 MB.`);
      return;
    }

    setFileNames(tmdlFiles.map((file) => file.name));

    const filePromises = tmdlFiles.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result;
        if (!(buffer instanceof ArrayBuffer)) {
          reject(new Error(`Failed to read ${file.name}: unexpected result type`));
          return;
        }

        const bytes = new Uint8Array(buffer);
        let encoding = 'utf-8';

        if (bytes.length >= 2) {
          if (bytes[0] === 0xff && bytes[1] === 0xfe) {
            encoding = 'utf-16le';
          } else if (bytes[0] === 0xfe && bytes[1] === 0xff) {
            encoding = 'utf-16be';
          } else {
            let nullCount = 0;
            for (let index = 0; index < Math.min(bytes.length, 100); index += 1) {
              if (bytes[index] === 0) {
                nullCount += 1;
              }
            }
            if (nullCount > 0) {
              encoding = 'utf-16le';
            }
          }
        }

        const decoder = new TextDecoder(encoding);
        resolve(decoder.decode(buffer));
      };
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsArrayBuffer(file);
    }));

    try {
      const contents = await Promise.all(filePromises);
      setTmdlText(contents.join('\n\n'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to read files.');
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      void readFiles(files);
    }
  }, [readFiles]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      void readFiles(files);
    }
  }, [readFiles]);

  const handleAnalyze = () => {
    if (!tmdlText.trim() || isAnalyzing || analyzeCooldown > 0) {
      return;
    }

    setIsAnalyzing(true);
    window.setTimeout(() => {
      try {
        const result = analyzeTMDL(tmdlText);
        onAnalysisComplete(result);
      } catch {
        toast.error('Failed to parse TMDL. Please check the format.');
      } finally {
        setIsAnalyzing(false);
        setAnalyzeCooldown(ANALYZE_COOLDOWN_SECONDS);
      }
    }, 400);
  };

  const handleLoadSample = () => {
    setTmdlText(sampleTMDL);
    setFileNames(['sample.tmdl']);
  };

  const handleClear = () => {
    setTmdlText('');
    setFileNames([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section
      id="analyzer"
      ref={inputRef}
      className="relative px-4 py-12 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div
          ref={sectionRef}
          className={`scroll-hidden ${sectionVisible ? 'scroll-visible' : ''} mb-10 max-w-3xl`}
        >
          <div className="powerbi-eyebrow mb-4">
            <FileCode className="h-4 w-4" />
            Model intake
          </div>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-black md:text-5xl">
            Upload or paste the TMDL behind your semantic model.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Keep the first pass explicit: bring structure in, parse it once, and
            move into recommendations and chat from the same workspace.
          </p>
        </div>

        <div
          ref={shellsRef}
          className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]"
        >
          <div className={`scroll-hidden-left ${shellsVisible ? 'scroll-visible-left' : ''} powerbi-shell p-6 md:p-8`}>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`powerbi-upload-area ${isDragging ? 'is-dragging' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".tmdl,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="mx-auto max-w-xl text-center">
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${isDragging ? 'bg-black text-white' : 'bg-black/5 text-black'}`}>
                  <Upload className="h-7 w-7" />
                </div>
                <p className="text-lg font-semibold text-black">
                  {isDragging ? 'Drop your TMDL file here' : 'Drag and drop a TMDL file'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Or click to browse for `.tmdl` or `.txt` files exported from your
                  Power BI model workflow.
                </p>
              </div>
            </div>

            <div className="relative mt-6">
              <Textarea
                value={tmdlText}
                onChange={(event) => setTmdlText(event.target.value)}
                placeholder="Paste your TMDL here if you prefer working directly from the exported model file..."
                className="powerbi-code-area min-h-[220px] resize-none text-sm md:min-h-[320px]"
              />

              {fileNames.length > 0 && (
                <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs text-white">
                  <Check className="h-3 w-3" />
                  <span>
                    {fileNames.length === 1 ? fileNames[0] : `${fileNames.length} files selected`}
                  </span>
                  <button
                    onClick={handleClear}
                    aria-label="Clear selected file"
                    className="transition-colors hover:text-gray-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleLoadSample}
                  className="rounded-full border-gray-300 bg-white hover:bg-gray-50"
                >
                  Load sample
                </Button>
                {tmdlText && (
                  <Button
                    variant="ghost"
                    onClick={handleClear}
                    className="text-gray-500 hover:text-black"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!tmdlText.trim() || isAnalyzing || analyzeCooldown > 0}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Analyzing...
                  </>
                ) : analyzeCooldown > 0 ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Wait {analyzeCooldown}s
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze model
                  </>
                )}
              </Button>
            </div>

            {analyzeCooldown > 0 && (
              <p className="mt-3 text-sm text-gray-500">
                Cooldown active to avoid repeated runs. You can analyze again in {analyzeCooldown}s.
              </p>
            )}
          </div>

          <div className={`scroll-hidden-right ${shellsVisible ? 'scroll-visible-right' : ''} powerbi-shell p-6 md:p-8`}>
            <div className="powerbi-eyebrow mb-4">
              <Download className="h-4 w-4" />
              Export workflow
            </div>
            <h3 className="font-heading text-3xl font-bold tracking-tight text-black">
              How to get a clean TMDL file from Power BI Desktop.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              The analyzer works best when the exported model definition is intact
              and easy to inspect before you ask for recommendations.
            </p>

            <div className="mt-6 space-y-4">
              {guideSteps.map((step, index) => (
                <div key={step.title} className="powerbi-step-card">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
                          {index + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-black">{step.title}</h4>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="powerbi-note mt-6">
              <p className="text-sm leading-relaxed text-amber-900">
                <strong>Tip:</strong> Tabular Editor 3 and SSMS can also script a
                model as TMDL. Use whichever export path gives you the cleanest
                semantic model definition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
