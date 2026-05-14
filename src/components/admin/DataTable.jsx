"use client";

import {
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  PlusCircle,
  GripVertical,
} from "lucide-react";
import { useState, useEffect, useRef, useId } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableRow({ item, columns, onEdit, onDelete, onView, highlightedItem, onReorder }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id || item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    position: "relative",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group border-b border-white/[0.03] transition-all duration-300 ${
        isDragging ? "bg-accent/20 shadow-2xl scale-[1.01]" : ""
      } ${
        highlightedItem === (item._id || item.id)
          ? "bg-accent/10 shadow-[inset_0_0_20px_rgba(var(--accent-rgb),0.05)]"
          : "hover:bg-white/[0.02]"
      }`}
    >
      <td className="p-5 w-10">
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-slate-600 hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      {columns.map((col) => (
        <td key={col.key} className="p-5">
          <div className={`transition-all ${highlightedItem === (item._id || item.id) ? "font-black text-accent scale-[1.02] origin-left" : ""}`}>
            {col.render ? (
              col.render(item)
            ) : (
              <span className={`text-sm tracking-tight ${highlightedItem === (item._id || item.id) ? "font-black text-accent" : "font-semibold text-white"}`}>
                {item[col.key]}
              </span>
            )}
          </div>
        </td>
      ))}
      <td className="p-5">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView && onView(item)}
            className="p-2.5 rounded-xl hover:bg-white/10 text-slate-500 hover:text-blue-500 transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-2.5 rounded-xl hover:bg-white/10 text-slate-500 hover:text-emerald-500 transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-2.5 rounded-xl hover:bg-white/10 text-slate-500 hover:text-red-500 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function SortableCard({ item, columns, onEdit, onDelete, onView, highlightedItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id || item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-6 space-y-4 transition-all duration-300 relative group ${
        isDragging ? "bg-accent/20 shadow-2xl scale-[1.02]" : ""
      } ${
        highlightedItem === (item._id || item.id)
          ? "bg-accent/10 border-l-4 border-l-accent shadow-[inset_0_0_20px_rgba(var(--accent-rgb),0.05)]"
          : "hover:bg-white/[0.02]"
      }`}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
           {...attributes}
           {...listeners}
           className="p-2 cursor-grab active:cursor-grabbing text-slate-600 hover:text-accent"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="pl-6 space-y-4">
        {columns.map((col) => (
          <div key={col.key} className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-60">
              {col.label}
            </span>
            <div className={`text-sm tracking-tight transition-all ${highlightedItem === (item._id || item.id) ? "font-black text-accent" : "font-semibold text-white"}`}>
              {col.render ? col.render(item) : item[col.key]}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        <button
          onClick={() => onView && onView(item)}
          className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-blue-500 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <Eye className="w-4 h-4" /> View
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-emerald-500 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <Edit className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-3 rounded-xl bg-red-500/10 border border-red-500/10 text-red-500/60 hover:text-red-500 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );
}

export default function DataTable({
  title,
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onReorder,
  searchPlaceholder = "Search...",
  totalCount,
  onPageChange,
  onSearchChange,
  currentPage: externalPage,
  itemsPerPage: externalLimit = 6,
  isLoading = false,
  filters = [],
}) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [highlightedItem, setHighlightedItem] = useState(null);
  const rowRefs = useRef({});
  const [isMounted, setIsMounted] = useState(false);
  const dndId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState({});

  const isExternal = !!onPageChange;
  const searchTerm = isExternal ? "" : internalSearchTerm;
  const currentPage = isExternal ? externalPage : internalCurrentPage;
  const itemsPerPage = isExternal ? externalLimit : 6;

  const handlePageChange = (newPage) => {
    if (isExternal) {
      onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  useEffect(() => {
    if (highlightId && data.length > 0) {
      const itemIndex = data.findIndex(
        (item) => (item._id || item.id) === highlightId
      );
      
      if (itemIndex !== -1) {
        const targetPage = Math.floor(itemIndex / itemsPerPage) + 1;
        if (targetPage !== currentPage) {
          handlePageChange(targetPage);
        }
      }

      setHighlightedItem(highlightId);
      const timer = setTimeout(() => setHighlightedItem(null), 4000);

      setTimeout(() => {
        const element = rowRefs.current[highlightId];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [highlightId, data, itemsPerPage]);

  const filteredData = isExternal
    ? data
    : data.filter((item) => {
        const matchesSearch = Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const matchesFilters = Object.entries(activeFilter).every(([key, value]) => {
          if (!value) return true;
          return String(item[key]) === value;
        });
        return matchesSearch && matchesFilters;
      });

  const totalPages = isExternal
    ? Math.ceil((totalCount || 0) / itemsPerPage)
    : Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = isExternal
    ? data
    : filteredData.slice(startIndex, startIndex + itemsPerPage);

  // DnD Sensors
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
      // Find indices in the full filtered dataset
      const oldGlobalIndex = filteredData.findIndex(item => (item._id || item.id) === active.id);
      const newGlobalIndex = filteredData.findIndex(item => (item._id || item.id) === over.id);
      
      if (oldGlobalIndex !== -1 && newGlobalIndex !== -1) {
        const newGlobalData = arrayMove(filteredData, oldGlobalIndex, newGlobalIndex);
        const newAllIds = newGlobalData.map(item => item._id || item.id);
        
        if (onReorder) {
          onReorder(newAllIds);
        }
      }
    }
  };

  const isReorderEnabled = !!onReorder && !searchTerm && Object.values(activeFilter).every(v => !v);

  const renderMobileContent = () => {
    if (paginatedData.length === 0) {
      return (
        <div className="py-20 text-center text-slate-500 font-medium italic opacity-40 uppercase text-[10px] tracking-widest">
          No data available in this module.
        </div>
      );
    }

    const items = paginatedData.map((item, idx) => (
      <SortableCard
        key={item._id || item.id || idx}
        item={item}
        columns={columns}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        highlightedItem={highlightedItem}
      />
    ));

    if (!isMounted) return items;

    return (
      <DndContext
        id={`${dndId}-mobile`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={paginatedData.map(item => item._id || item.id)}
          strategy={verticalListSortingStrategy}
          disabled={!isReorderEnabled}
        >
          {items}
        </SortableContext>
      </DndContext>
    );
  };

  const renderDesktopContent = () => {
    if (paginatedData.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.length + 2}
            className="py-20 text-center text-slate-500 font-medium italic opacity-40 uppercase text-[10px] tracking-widest"
          >
            No data available in this module.
          </td>
        </tr>
      );
    }

    const rows = paginatedData.map((item, idx) => (
      <SortableRow
        key={item._id || item.id || idx}
        item={item}
        columns={columns}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        highlightedItem={highlightedItem}
      />
    ));

    return rows;
  };

  const renderDesktopTable = () => {
    const rows = renderDesktopContent();
    const isEmpty = paginatedData.length === 0;

    if (!isMounted || isEmpty) {
      return (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="p-5 w-10"></th>
              {columns.map((col) => (
                <th key={col.key} className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-70">
                  {col.label}
                </th>
              ))}
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-70 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      );
    }

    return (
      <DndContext
        id={`${dndId}-desktop`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="p-5 w-10"></th>
              {columns.map((col) => (
                <th key={col.key} className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-70">
                  {col.label}
                </th>
              ))}
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-70 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <SortableContext
            items={paginatedData.map(item => item._id || item.id)}
            strategy={verticalListSortingStrategy}
            disabled={!isReorderEnabled}
          >
            <tbody>{rows}</tbody>
          </SortableContext>
        </table>
      </DndContext>
    );
  };

  return (
    <div className="bg-[#0a0f1c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/[0.02]">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your {title.toLowerCase()} across the site.
            </p>
          </div>
          
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <select
                  key={filter.key}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:border-accent/40"
                  value={activeFilter[filter.key] || ""}
                  onChange={(e) => setActiveFilter(prev => ({ ...prev, [filter.key]: e.target.value }))}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ))}
              {Object.values(activeFilter).some(v => v) && (
                <button 
                  onClick={() => setActiveFilter({})}
                  className="text-[9px] font-black uppercase text-accent/60 hover:text-accent transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
              value={isExternal ? "" : internalSearchTerm}
              onChange={(e) => {
                if (isExternal) {
                  onSearchChange && onSearchChange(e.target.value);
                } else {
                  setInternalSearchTerm(e.target.value);
                }
              }}
            />
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-white/5">
        {renderMobileContent()}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        {renderDesktopTable()}
      </div>

      <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          Showing{" "}
          <span className="text-foreground">
            {startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="text-foreground">
            {Math.min(startIndex + itemsPerPage, filteredData.length)}
          </span>{" "}
          of{" "}
          <span className="text-foreground">
            {filteredData.length}
          </span>{" "}
          entries
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-muted-foreground transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                  currentPage === i + 1
                    ? "bg-accent/10 border border-accent/30 text-accent"
                    : "border border-white/10 hover:bg-white/5 text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-muted-foreground transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
