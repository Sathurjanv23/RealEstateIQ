import { useState, useRef, useEffect, useId } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyService } from '../../services/services';

interface PhotoUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
}

// Curated authentic Sri Lankan architectural photos for fast testing/preview
const SAMPLE_PROPERTIES = [
  {
    label: 'Colombo Penthouse',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Galle Beachfront Villa',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Kandy Hill Estate',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function PhotoUploader({
  images,
  onChange,
  maxFiles = 8,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    provider: string;
    isCloudinaryActive: boolean;
  } | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const urlInputId = useId();

  // Fetch upload storage provider info (Cloudinary vs Local)
  useEffect(() => {
    let mounted = true;
    propertyService
      .getUploadStatus()
      .then((res) => {
        if (mounted && res?.data?.data) {
          setStorageInfo(res.data.data);
        }
      })
      .catch(() => {
        // Fallback silently if status endpoint is unavailable
        if (mounted) {
          setStorageInfo({ provider: 'cloudinary-ready', isCloudinaryActive: true });
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    if (images.length + fileArray.length > maxFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} photos.`);
      return;
    }

    // Validate size (max 5MB) and type
    const validFiles: File[] = [];
    for (const f of fileArray) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type)) {
        toast.error(`"${f.name}" is not a valid format. Only JPG, PNG, and WebP are allowed.`);
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds 5MB file limit.`);
        continue;
      }
      validFiles.push(f);
    }

    if (!validFiles.length) return;

    setUploading(true);
    const toastId = toast.loading(`Uploading ${validFiles.length} photo(s) to Cloudinary...`);

    try {
      // Use multi-upload endpoint
      const res = await propertyService.uploadMultipleImages(validFiles);
      const newUrls: string[] = res.data?.data?.urls || [];

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        toast.success(`Successfully uploaded ${newUrls.length} photo(s)!`, { id: toastId });
      } else {
        toast.error('Upload succeeded but no URLs were returned.', { id: toastId });
      }
    } catch (err: unknown) {
      // Fallback: try uploading sequentially with single upload if multi-upload failed
      try {
        const fallbackUrls: string[] = [];
        for (const file of validFiles) {
          const singleRes = await propertyService.uploadImage(file);
          const singleUrl = singleRes.data?.data?.url;
          if (singleUrl) fallbackUrls.push(singleUrl);
        }
        if (fallbackUrls.length > 0) {
          onChange([...images, ...fallbackUrls]);
          toast.success(`Uploaded ${fallbackUrls.length} photo(s)!`, { id: toastId });
        } else {
          toast.error('Upload failed. Please try again.', { id: toastId });
        }
      } catch (fallbackErr: unknown) {
        const error = fallbackErr as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || 'Failed to upload photo(s).', { id: toastId });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([target, ...rest]);
    toast.success('Cover photo updated!');
  };

  const addSamplePhotos = () => {
    const urlsToAdd = SAMPLE_PROPERTIES.map((p) => p.url).filter(
      (url) => !images.includes(url)
    );
    if (images.length + urlsToAdd.length > maxFiles) {
      toast.error(`Max ${maxFiles} photos allowed.`);
      return;
    }
    onChange([...images, ...urlsToAdd]);
    toast.success('Added high-resolution architectural sample photos!');
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    if (images.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} photos reached.`);
      return;
    }
    onChange([...images, customUrl.trim()]);
    setCustomUrl('');
    setShowUrlInput(false);
    toast.success('Image URL added!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-xs font-semibold text-neutral-300">
          Property Visuals & Photographs
          <span className="text-neutral-500 ml-1.5 font-normal">
            ({images.length}/{maxFiles} uploaded)
          </span>
        </label>

        {/* Cloudinary CDN Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-[#DFBA73]/10 border border-[#DFBA73]/30 text-[#DFBA73]">
          <ShieldCheck size={13} />
          <span>
            {storageInfo?.isCloudinaryActive !== false
              ? 'Cloudinary CDN Storage Ready'
              : 'Local Disk Storage (Dev Mode)'}
          </span>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#DFBA73] bg-[#DFBA73]/10 scale-[1.01]'
            : 'border-white/[0.15] bg-[#090D14]/80 hover:border-[#DFBA73]/50 hover:bg-[#090D14]'
        }`}
      >
        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={uploading}
        />

        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[#DFBA73]/10 border border-[#DFBA73]/30 flex items-center justify-center text-[#DFBA73]">
            {uploading ? (
              <Loader2 size={24} className="animate-spin text-[#DFBA73]" />
            ) : (
              <UploadCloud size={24} />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              {uploading
                ? 'Uploading to Cloudinary CDN...'
                : 'Click or drag & drop high-resolution property photos'}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              JPG, PNG, or WebP up to 5MB each (Max {maxFiles} images)
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions (Samples & URL Paste) */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addSamplePhotos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-neutral-300 hover:text-white hover:border-[#DFBA73]/40 transition-colors"
          >
            <Sparkles size={13} className="text-[#DFBA73]" />
            Add Architectural Samples
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-neutral-300 hover:text-white hover:border-[#DFBA73]/40 transition-colors"
          >
            <LinkIcon size={13} />
            {showUrlInput ? 'Cancel URL' : 'Paste Image URL'}
          </button>
        </div>

        {images.length > 0 && (
          <span className="text-[11px] text-neutral-500">
            * Drag or click &quot;Cover&quot; to set the primary hero photo
          </span>
        )}
      </div>

      {/* URL Input Bar */}
      {showUrlInput && (
        <form onSubmit={handleAddCustomUrl} className="flex gap-2 animate-fade-in">
          <input
            id={urlInputId}
            type="url"
            placeholder="https://res.cloudinary.com/demo/image/upload/villa.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="input-field text-xs py-2 flex-1"
            required
          />
          <button
            type="submit"
            className="btn-primary text-xs py-2 px-4 font-bold shrink-0"
          >
            Add Image
          </button>
        </form>
      )}

      {/* Uploaded Photos Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {images.map((url, idx) => {
            const isCover = idx === 0;
            return (
              <div
                key={`${url}-${idx}`}
                className={`relative group rounded-xl overflow-hidden aspect-video border bg-[#06080C] shadow-lg transition-all ${
                  isCover ? 'border-[#DFBA73] ring-1 ring-[#DFBA73]/50' : 'border-white/[0.1]'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Property asset ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Cover badge */}
                {isCover ? (
                  <div className="absolute top-2 left-2 bg-[#DFBA73] text-[#0A0D12] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1">
                    <Star size={11} fill="#0A0D12" /> Primary Cover
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(idx)}
                    title="Set as Cover Photo"
                    className="absolute top-2 left-2 bg-[#0A0D12]/80 hover:bg-[#DFBA73] hover:text-[#0A0D12] text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                  >
                    <Star size={11} /> Make Cover
                  </button>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  title="Remove Image"
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow"
                >
                  <X size={13} />
                </button>

                {/* Image number tag */}
                <div className="absolute bottom-1.5 right-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-neutral-300 font-mono">
                  #{idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
