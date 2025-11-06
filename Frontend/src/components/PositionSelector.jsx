"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, PlusCircle } from "lucide-react";
import { usePositionStore } from "@/store/usePositionStore";
import api from "@/api/axios";

export function PositionSelector({
  selectedPosition,
  onChange,
  isEditing = true,
  allowCustomAdd = false,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { listPositions, fetchPositions } = usePositionStore();

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const filteredPositions = useMemo(() => {
    if (!searchTerm) return listPositions;
    return listPositions.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, listPositions]);

  const handleSelectPosition = (position) => {
    if (!isEditing) return;
    // Select or unselect same position
    if (selectedPosition?._id === position._id) {
      onChange(null);
    } else {
      onChange(position);
    }
    setOpen(false);
  };

  const handleCustomAdd = async () => {
    if (!allowCustomAdd || !searchTerm.trim()) return;
    try {
      const { data } = await api.post("/position", { name: searchTerm.trim() });
      const newPosition = data.data;

      // Add the new position to global list
      usePositionStore.setState((state) => ({
        listPositions: [...state.listPositions, newPosition],
      }));

      onChange(newPosition);
      setSearchTerm("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding position:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between cursor-pointer"
            disabled={!isEditing}
          >
            {selectedPosition ? selectedPosition.name : "Select a position"}
            <PlusCircle className="ml-2 h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[90vw] max-w-sm max-h-[60vh] overflow-y-auto p-3 space-y-2"
          onWheel={(e) => e.stopPropagation()}
        >
          <Input
            placeholder="Search positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />

          {allowCustomAdd && searchTerm.trim() && (
            <Button
              variant="ghost"
              className="w-full justify-start text-primary"
              onClick={handleCustomAdd}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add “{searchTerm.trim()}”
            </Button>
          )}

          <div className="max-h-[40vh] overflow-y-auto">
            {filteredPositions.length > 0 ? (
              filteredPositions.map((pos) => {
                const isSelected = selectedPosition?._id === pos._id;
                return (
                  <div
                    key={pos._id}
                    onClick={() => handleSelectPosition(pos)}
                    className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-muted ${
                      isSelected ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    <span>{pos.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No positions found
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedPosition ? (
        <p className="text-sm text-gray-600">
          Selected: <strong>{selectedPosition.name}</strong>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          No position selected yet.
        </p>
      )}
    </div>
  );
}
