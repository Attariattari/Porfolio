"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Upload,
  X,
  Link as LinkIcon,
  Plus,
  Trash2,
  RefreshCw,
  GripVertical,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/**
 * ImageItem Component (Individual Image)
 */
function SortableImageItem({ id, url, onRemove, onReplace, compact = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden group border border-border bg-muted/20 transition-all duration-500 hover:border-accent/40 ${compact ? 'aspect-[4/3] rounded-xl shadow-lg' : 'aspect-square rounded-3xl shadow-2xl'} ${isDragging ? 'ring-2 ring-accent shadow-accent/20' : ''}`}
    >
      <img src={url} alt="Muhyo Tech uploaded media preview" className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${compact ? 'object-contain p-3' : 'object-cover'}`} />

      {/* Overlay */}
      <div className="absolute inset-0 bg-overlay/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
        {/* Drag handle */}
        <div
          {...listeners}
          {...attributes}
          className="absolute top-4 left-4 p-2 bg-muted rounded-xl cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
        >
          <GripVertical className="w-4 h-4 text-foreground" />
        </div>

        <div className="flex gap-2">
            <button
                type="button"
                onClick={() => onReplace(id)}
                className="p-3 bg-accent text-foreground rounded-2xl hover:bg-accent/80 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-accent/20"
                title="Replace Image"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => onRemove(id)}
                className="p-3 bg-red-500 text-foreground rounded-2xl hover:bg-red-600 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-red-500/20"
                title="Remove Image"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Badge for unsaved changes */}
      {id.startsWith('temp-') || url.startsWith('blob:') ? (
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-accent/20 border border-accent/40 rounded-full">
            <p className="text-[8px] font-black uppercase text-accent tracking-tighter">Selected</p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Main ImageUploader Component
 */
export default function ImageUploader({ images = [], onChange, compact = false, maxFiles }) {
  const [imageList, setImageList] = useState([]);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replacingId, setReplacingId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const dndId = React.useId();

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Sync state with props
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!Array.isArray(images)) return;
      // Create objects with IDs for dnd-kit if they are strings
      // or use existing objects if they have ids
      const items = images.map((item, index) => {
        if (typeof item === 'string') {
          return { id: item, url: item };
        }
        // If it's already an object (pending upload), use its url as id
        return { ...item, id: item.url };
      });
      setImageList(items);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = imageList.findIndex((item) => item.id === active.id);
      const newIndex = imageList.findIndex((item) => item.id === over.id);

      const newList = arrayMove(imageList, oldIndex, newIndex);
      setImageList(newList);

      // Pass the current state items to onChange
      // For existing URLs, just pass the string. For pending, pass the object.
      onChange(newList.map(item => item.file ? { file: item.file, url: item.url } : item.url));
    }
  };

  const handleLocalSelect = async (e) => {
    const availableSlots = maxFiles ? Math.max(0, maxFiles - imageList.length) : Infinity;
    const files = Array.from(e.target.files).slice(0, availableSlots);
    if (!files.length) return;

    // 1. Create temporary items with local previews
    const newItems = files.map(file => ({
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file), // Local preview
      file, // Keep file for later upload
      isPending: true
    }));

    // Add new items to display immediately
    const updatedList = [...imageList, ...newItems];
    setImageList(updatedList);

    // Call onChange with the updated state
    onChange(updatedList.map(item => item.file ? { file: item.file, url: item.url } : item.url));

    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success(`${files.length} image(s) selected`);
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;

    // Quick validation
    try {
        new URL(urlInput);
    } catch (e) {
        toast.error("Invalid URL format");
        return;
    }

    const newItem = { id: urlInput, url: urlInput };
    const updatedList = [...imageList, newItem];

    setImageList(updatedList);
    onChange(updatedList.map(item => item.file ? { file: item.file, url: item.url } : item.url));

    setUrlInput("");
    setIsUrlInputOpen(false);
    toast.success("URL image added");
  };

  const handleRemove = (id) => {
    const itemToRemove = imageList.find(item => item.id === id);
    if (itemToRemove && itemToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.url);
    }

    const updatedList = imageList.filter(item => item.id !== id);
    setImageList(updatedList);
    onChange(updatedList.map(item => item.file ? { file: item.file, url: item.url } : item.url));
  };

  const handleReplaceClick = (id) => {
    setReplacingId(id);
    if (replaceInputRef.current) replaceInputRef.current.click();
  };

  const handleReplaceAction = async (e) => {
    const file = e.target.files[0];
    if (!file || !replacingId) return;

    const newUrl = URL.createObjectURL(file);

    // Revoke old blob if it was one
    const oldItem = imageList.find(item => item.id === replacingId);
    if (oldItem && oldItem.url.startsWith('blob:')) {
        URL.revokeObjectURL(oldItem.url);
    }

    const updatedList = imageList.map(item =>
      item.id === replacingId ? { id: newUrl, url: newUrl, file, isPending: true } : item
    );

    setImageList(updatedList);
    onChange(updatedList.map(item => item.file ? { file: item.file, url: item.url } : item.url));

    setReplacingId(null);
    if (replaceInputRef.current) replaceInputRef.current.value = "";
    toast.success("Image replaced locally");
  };

  return (
    <div className={`w-full bg-card/40 border border-border/70 backdrop-blur-3xl ${compact ? 'space-y-4 rounded-xl p-4' : 'space-y-8 rounded-[2.5rem] p-8 shadow-3xl md:p-12'}`}>
      {/* Header */}
      <div className={`flex justify-between border-b border-border/70 ${compact ? 'items-center gap-3 pb-4' : 'flex-col md:flex-row items-start md:items-center gap-6 pb-8'}`}>
        <div>
           <div className={`flex items-center ${compact ? 'gap-2' : 'gap-4 mb-2'}`}>
            <ImageIcon className={`${compact ? 'size-4' : 'w-8 h-8 animate-pulse'} text-accent`} />
            <h3 className={`${compact ? 'text-sm font-semibold' : 'text-2xl font-black italic uppercase tracking-tighter'} text-foreground`}>{compact ? 'Hero image' : 'Media Assets'}</h3>
           </div>
           {!compact && <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">Manage high-fidelity project visuals</p>}
        </div>

        <div className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-3'}`}>
            <button
                type="button"
                onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                className={`${compact ? 'p-2.5 rounded-lg' : 'px-6 py-4 rounded-2xl gap-3'} bg-muted/40 border border-border/70 hover:border-border text-foreground font-bold uppercase text-[10px] transition-all flex items-center active:scale-95 group`}
            >
                <LinkIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                {!compact && 'Add URL'}
            </button>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`${compact ? 'px-3 py-2.5 rounded-lg gap-1.5' : 'px-8 py-4 rounded-2xl gap-3 tracking-[0.2em]'} bg-accent text-accent-foreground font-black uppercase text-[10px] transition-all flex items-center hover:bg-accent/90 active:scale-95`}
            >
                <Plus className="w-4 h-4" />
                {compact ? 'Choose' : 'Select Files'}
            </button>
        </div>
      </div>

      {/* URL Input Area */}
      <AnimatePresence>
        {isUrlInputOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 rounded-3xl bg-card/50 border border-border flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-black uppercase text-accent tracking-widest pl-2">Remote Image URL</label>
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full p-4 bg-muted/40 border border-border rounded-2xl text-xs text-foreground focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/40 transition-all font-medium placeholder:text-muted-foreground/80"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleUrlAdd}
                    className="px-8 py-4 bg-card text-accent-foreground rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-muted transition-all active:scale-95"
                >
                    Link Asset
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Display */}
      <div className="relative">
        {isMounted ? (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={imageList.map((item) => item.id)}
            strategy={rectSortingStrategy}
          >
            <div className={compact ? (maxFiles === 1 ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3") : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"}>
              <AnimatePresence mode="popLayout">
                {imageList.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <SortableImageItem
                      id={item.id}
                      url={item.url}
                      onRemove={handleRemove}
                      onReplace={handleReplaceClick}
                      compact={compact}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty state placeholder and dropzone */}
              {imageList.length === 0 && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="col-span-full py-24 rounded-[2.5rem] border-2 border-dashed border-border/70 hover:border-accent/40 bg-card/40 hover:bg-muted/40 transition-all cursor-pointer flex flex-col items-center justify-center gap-6 group"
                >
                    <div className="w-20 h-20 rounded-3xl bg-card border border-border/70 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                        <Upload className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black text-foreground italic uppercase tracking-tighter mb-1">Architect Your Visuals</p>
                        <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">Supports JPG, PNG, WEBP • MAX 5MB</p>
                    </div>
                </div>
              )}

              {/* Minimal add button always present */}
              {imageList.length > 0 && (!maxFiles || imageList.length < maxFiles) && (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-3xl border-2 border-dashed border-border/70 hover:border-accent/40 bg-card/40 hover:bg-muted/40 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-card border border-border/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-muted-foreground group-hover:text-accent tracking-widest">Add More</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {imageList.map((item) => (
              <div key={item.id} className="relative rounded-3xl overflow-hidden aspect-square border border-border bg-muted/20 shadow-2xl">
                <img src={item.url} alt="Muhyo Tech uploaded media preview" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLocalSelect}
        className="hidden"
        multiple
        accept="image/*"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceAction}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
}
