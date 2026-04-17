import { useState, useRef, useCallback, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { MonitorUp, Upload, X, Sparkles, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reviewDashboard } from '@/utils/claude';
import { toast } from 'sonner';
import type { AnalysisResult, DashboardImage, DashboardReviewResult, ImageMediaType } from '@/types';

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const REVIEW_COOLDOWN_SECONDS = 10;
const ACCEPTED_TYPES: Record<string, ImageMediaType> = {
  'image/png': 'image/png',
  'image/jpeg': 'image/jpeg',
  'image/webp': 'image/webp',
};

interface DashboardReviewSectionProps {
  result: AnalysisResult;
  onReviewComplete: (review: DashboardReviewResult) => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (data:image/...;base64,)
      const base64 = result.split(',')[1];
      if (base64) resolve(base64);
      else reject(new Error('Failed to encode image'));
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function DashboardReviewSection({ result, onReviewComplete, sectionRef }: DashboardReviewSectionProps) {
  const [images, setImages] = useState<DashboardImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewCooldown, setReviewCooldown] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: uploadRef, isVisible: uploadVisible } = useScrollAnimation<HTMLDivElement>();

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.previewUrl));
      abortRef.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reviewCooldown === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setReviewCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [reviewCooldown]);

  const addImages = useCallback(async (files: File[]) => {
    const validFiles = files.filter(f => {
      if (!ACCEPTED_TYPES[f.type]) {
        toast.error(`${f.name}: unsupported format. Use PNG, JPG, or WebP.`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: too large. Max 5 MB per image.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImages(prev => {
      const remaining = MAX_IMAGES - prev.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
        return prev;
      }
      const toAdd = validFiles.slice(0, remaining);
      if (validFiles.length > remaining) {
        toast.error(`Only ${remaining} more image${remaining > 1 ? 's' : ''} allowed. Extra files skipped.`);
      }

      // Process files asynchronously then update state
      Promise.all(
        toAdd.map(async (file): Promise<DashboardImage> => {
          const base64 = await fileToBase64(file);
          return {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            base64,
            mediaType: ACCEPTED_TYPES[file.type],
            previewUrl: URL.createObjectURL(file),
          };
        })
      ).then(newImages => {
        setImages(current => [...current, ...newImages].slice(0, MAX_IMAGES));
      }).catch(() => {
        toast.error('Failed to process one or more images.');
      });

      return prev; // Return prev immediately; async update follows
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter(i => i.id !== id);
    });
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
    if (files.length > 0) addImages(files);
  }, [addImages]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) addImages(files);
    // Reset input so the same file can be re-selected
    if (e.target) e.target.value = '';
  }, [addImages]);

  const handleReview = async () => {
    if (images.length === 0 || isReviewing || reviewCooldown > 0) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsReviewing(true);
    try {
      const imagePayloads = images.map(img => ({
        base64: img.base64,
        mediaType: img.mediaType,
      }));
      const reviewResult = await reviewDashboard(imagePayloads, result.model, controller.signal);
      if (!controller.signal.aborted) {
        onReviewComplete(reviewResult);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error(error instanceof Error ? error.message : 'Failed to review dashboard. Please try again.');
    } finally {
      if (!controller.signal.aborted) {
        setIsReviewing(false);
        setReviewCooldown(REVIEW_COOLDOWN_SECONDS);
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-12 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="abstract-bg">
        <div className="abstract-shape shape-3" style={{ opacity: 0.2 }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`scroll-hidden ${headerVisible ? 'scroll-visible' : ''} text-center mb-12`}
        >
          <div className="badge mb-4">
            <MonitorUp className="w-4 h-4" />
            <span>Visual Review</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-black mb-4">
            Review Your Dashboard Design
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Upload screenshots of your Power BI dashboard to get AI-powered feedback on layout, colors, accessibility, and more.
          </p>
        </div>

        {/* Upload Area */}
        <div
          ref={uploadRef}
          className={`scroll-hidden-scale stagger-1 ${uploadVisible ? 'scroll-visible-scale' : ''}`}
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
              ${images.length >= MAX_IMAGES ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center text-center">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                transition-all duration-300
                ${isDragging ? 'bg-black scale-110' : 'bg-secondary'}
              `}>
                {isDragging ? (
                  <Upload className="w-7 h-7 text-white" />
                ) : (
                  <ImagePlus className="w-7 h-7 text-muted-foreground" />
                )}
              </div>
              <p className="text-black font-medium mb-1">
                {isDragging ? 'Drop your screenshots here' : 'Upload dashboard screenshots'}
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, or WebP — up to {MAX_IMAGES} images, 5 MB each
              </p>
            </div>
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="relative group rounded-xl overflow-hidden border border-border bg-white"
              >
                <img
                  src={img.previewUrl}
                  alt={`Dashboard screenshot ${index + 1}`}
                  className="w-full h-40 object-cover object-top"
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs">
                  Screenshot {index + 1}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(img.id);
                  }}
                  aria-label={`Remove screenshot ${index + 1}`}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="p-2 text-xs text-muted-foreground truncate">
                  {img.file.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleReview}
            disabled={images.length === 0 || isReviewing || reviewCooldown > 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isReviewing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Reviewing...
              </>
            ) : reviewCooldown > 0 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Wait {reviewCooldown}s
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Review Dashboard
              </>
            )}
          </Button>
        </div>
        {reviewCooldown > 0 && (
          <p className="mt-3 text-right text-sm text-muted-foreground">
            Review cooldown active to protect API credits. You can run another review in {reviewCooldown}s.
          </p>
        )}
      </div>
    </section>
  );
}
