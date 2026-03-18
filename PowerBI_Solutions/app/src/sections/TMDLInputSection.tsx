import { useState, useRef, useCallback, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Upload, FileCode, X, Check, Sparkles, ChevronDown, ChevronUp, Download, Settings, Save, FolderOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeTMDL } from '@/utils/tmdlParser';
import { toast } from 'sonner';
import type { AnalysisResult } from '@/types';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
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
    icon: Settings,
    title: 'Enable TMDL in Settings',
    description: 'Go to File → Options and settings → Options. Under Global, select Preview features and check "Store semantic model using TMDL format". Restart Power BI Desktop.',
  },
  {
    icon: Save,
    title: 'Save as a Power BI Project (.pbip)',
    description: 'Go to File → Save as. In the file type dropdown, select Power BI Project (*.pbip). Choose a folder and save.',
  },
  {
    icon: FolderOpen,
    title: 'Find Your TMDL Files',
    description: 'Open the folder where you saved the project. Go into the folder ending in .SemanticModel, then open the definition folder.',
  },
  {
    icon: FileText,
    title: 'Success!',
    description: 'All your tables, measures, and relationships are now stored here as individual .tmdl files.',
  },
];

export function TMDLInputSection({ onAnalysisComplete, inputRef }: TMDLInputSectionProps) {
  const [tmdlText, setTmdlText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeCooldown, setAnalyzeCooldown] = useState(0);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: uploadRef, isVisible: uploadVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: textareaRef, isVisible: textareaVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: guideRef, isVisible: guideVisible } = useScrollAnimation<HTMLDivElement>();

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
    const tmdlFiles = files.filter(f => f.name.endsWith('.tmdl') || f.name.endsWith('.txt'));

    if (tmdlFiles.length === 0) {
      toast.error('Please select .tmdl or .txt files.');
      return;
    }

    // Check file sizes
    const oversized = tmdlFiles.filter(f => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      toast.error(`File too large: ${oversized.map(f => f.name).join(', ')}. Max 10 MB.`);
      return;
    }

    setFileNames(tmdlFiles.map(f => f.name));

    const filePromises = tmdlFiles.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const buffer = e.target?.result;
          if (!(buffer instanceof ArrayBuffer)) {
            reject(new Error(`Failed to read ${file.name}: unexpected result type`));
            return;
          }
          const uint8Array = new Uint8Array(buffer);

          // Detect UTF-16LE BOM (FF FE)
          let encoding = 'utf-8';
          if (uint8Array.length >= 2) {
            if (uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) {
              encoding = 'utf-16le';
            } else if (uint8Array[0] === 0xFE && uint8Array[1] === 0xFF) {
              encoding = 'utf-16be';
            } else {
              // Check for null bytes which indicate UTF-16 in ASCII range
              let nullCount = 0;
              for (let i = 0; i < Math.min(uint8Array.length, 100); i++) {
                if (uint8Array[i] === 0) nullCount++;
              }
              if (nullCount > 0) encoding = 'utf-16le'; // Assume LE for safety on Windows
            }
          }

          const decoder = new TextDecoder(encoding);
          const text = decoder.decode(buffer);
          resolve(text);
        };
        reader.onerror = () => {
          reject(new Error(`Failed to read file: ${file.name}`));
        };
        reader.readAsArrayBuffer(file);
      });
    });

    try {
      const contents = await Promise.all(filePromises);
      setTmdlText(contents.join('\n\n'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to read files.');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      readFiles(files);
    }
  }, [readFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      readFiles(files);
    }
  }, [readFiles]);

  const handleAnalyze = () => {
    if (!tmdlText.trim() || isAnalyzing || analyzeCooldown > 0) return;

    setIsAnalyzing(true);
    // Small delay for UX feedback (parsing is synchronous)
    setTimeout(() => {
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
      ref={inputRef}
      className="relative py-12 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Shape */}
      <div className="abstract-bg">
        <div className="abstract-shape shape-2" style={{ opacity: 0.3 }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <div
          ref={sectionRef}
          className={`scroll-hidden ${sectionVisible ? 'scroll-visible' : ''} text-center mb-12`}
        >
          <div className="badge mb-4">
            <FileCode className="w-4 h-4" />
            <span>Input Your TMDL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-black mb-4">
            Upload or Paste Your TMDL Code
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Drag and drop your .tmdl file, paste the code directly, or try our sample model to see how it works.
          </p>
        </div>

        {/* Upload Area */}
        <div
          ref={uploadRef}
          className={`scroll-hidden-left stagger-1 ${uploadVisible ? 'scroll-visible-left' : ''} mb-6`}
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative p-5 sm:p-10 rounded-2xl border-2 border-dashed cursor-pointer
              transition-all duration-300 bg-white
              ${isDragging
                ? 'border-black bg-secondary'
                : 'border-border hover:border-gray-400 hover:bg-secondary/50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".tmdl,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center text-center">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                transition-all duration-300
                ${isDragging ? 'bg-black scale-110' : 'bg-secondary'}
              `}>
                <Upload className={`w-7 h-7 ${isDragging ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
              <p className="text-black font-medium mb-1">
                {isDragging ? 'Drop your file here' : 'Drag & drop your TMDL file'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse (.tmdl, .txt)
              </p>
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div
          ref={textareaRef}
          className={`scroll-hidden-right stagger-2 ${textareaVisible ? 'scroll-visible-right' : ''}`}
        >
          <div className="relative">
            <Textarea
              value={tmdlText}
              onChange={(e) => setTmdlText(e.target.value)}
              placeholder="Or paste your TMDL code here..."
              className="min-h-[160px] sm:min-h-[280px] code-block text-sm resize-none input-focus bg-white"
            />

            {/* File Badge */}
            {fileNames.length > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-xs">
                <Check className="w-3 h-3" />
                <span>
                  {fileNames.length === 1
                    ? fileNames[0]
                    : `${fileNames.length} files selected`}
                </span>
                <button
                  onClick={handleClear}
                  aria-label="Clear selected file"
                  className="ml-1 hover:text-gray-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleLoadSample}
                className="rounded-full border-border hover:bg-secondary"
              >
                Load Sample
              </Button>
              {tmdlText && (
                <Button
                  variant="ghost"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-black"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!tmdlText.trim() || isAnalyzing || analyzeCooldown > 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : analyzeCooldown > 0 ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Wait {analyzeCooldown}s
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Model
                </>
              )}
            </Button>
          </div>
          {analyzeCooldown > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Cooldown active to prevent repeated runs. You can analyze again in {analyzeCooldown}s.
            </p>
          )}
        </div>

        {/* How to Get TMDL Guide */}
        <div
          ref={guideRef}
          className={`scroll-hidden stagger-3 ${guideVisible ? 'scroll-visible' : ''} mt-12`}
        >
          <div className="card-light overflow-hidden">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-black font-semibold">How to Get Your TMDL File</h3>
                  <p className="text-sm text-muted-foreground">Learn how to export TMDL from Power BI Desktop</p>
                </div>
              </div>
              {showGuide ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {showGuide && (
              <div className="px-5 pb-6 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  {guideSteps.map((step, index) => (
                    <div
                      key={step.title}
                      className="flex gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center">
                          <step.icon className="w-5 h-5 text-black" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <h4 className="text-black font-medium text-sm">{step.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> You can also use Tabular Editor 3 to export your model as TMDL.
                    In Tabular Editor, go to File → Save to Folder and select TMDL as the serialization format.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
