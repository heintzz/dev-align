import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Check, X } from "lucide-react";
import { useSkillStore } from "@/store/useSkillStore";
import api from "@/api/axios";

export function SkillSelector({
  selectedSkills,
  onChange,
  isEditing = true,
  className = "h-max-20",
  allowCustomAdd = false,
  canEdit = true,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { listSkills, fetchSkills } = useSkillStore();

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const filteredSkills = useMemo(() => {
    if (!searchTerm) return listSkills;
    return listSkills.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, listSkills]);

  const handleAddSkill = (skill) => {
    const alreadySelected = selectedSkills.some((s) => s._id === skill._id);
    if (alreadySelected) {
      onChange(selectedSkills.filter((s) => s._id !== skill._id));
    } else {
      onChange([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skill) => {
    onChange((prev) => prev.filter((s) => s._id !== skill._id));
  };

  const handleCustomAdd = async () => {
    if (!allowCustomAdd || !searchTerm.trim()) return;
    try {
      const { data } = await api.post("/skill", { name: searchTerm.trim() });
      const newSkill = data.data; // backend returns skill under data.data

      // Add the new skill to global list
      useSkillStore.setState((state) => ({
        listSkills: [...state.listSkills, newSkill],
      }));

      // Add to selected if not already
      const exists = selectedSkills.some(
        (s) => s.name.toLowerCase() === newSkill.name.toLowerCase()
      );
      if (!exists) {
        onChange([...selectedSkills, newSkill]); // ✅ use the same object with _id
      }

      setSearchTerm("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between cursor-pointer"
            disabled={!isEditing || !canEdit} // ✅ combined logic
          >
            Add skill
            <PlusCircle className="ml-2 h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[90vw] max-w-sm max-h-[60vh] overflow-y-auto p-3 space-y-2"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Prevent typing or adding when can't edit */}
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => canEdit && setSearchTerm(e.target.value)}
            autoFocus
            disabled={!canEdit}
          />

          {allowCustomAdd && searchTerm.trim() && canEdit && (
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
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill) => {
                const isSelected = selectedSkills.some(
                  (s) => s._id === skill._id
                );
                return (
                  <div
                    key={skill._id}
                    onClick={() => canEdit && handleAddSkill(skill)} // ✅ guard
                    className={`flex justify-between items-center p-2 rounded-md ${
                      canEdit
                        ? "cursor-pointer hover:bg-muted"
                        : "cursor-not-allowed opacity-60"
                    } ${isSelected ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <span>{skill.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No skills found
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedSkills.length > 0 ? (
        <div
          className={`flex flex-wrap gap-2 max-h-20 overflow-y-auto ${className}`}
        >
          {selectedSkills.map((skill) => (
            <Badge
              key={skill._id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {skill.name}
              {isEditing && canEdit && (
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-destructive focus:outline-none cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No skills added yet.</p>
      )}
    </div>
  );
}
