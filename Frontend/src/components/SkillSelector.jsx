import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

import { PlusCircle, Check, X } from "lucide-react";
import { useSkillStore } from "@/store/useSkillStore";

export function SkillSelector({
  selectedSkills,
  onChange,
  isEditing = true,
  className = "h-max-20",
}) {
  //   console.log(selectedSkills);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { listSkills, fetchSkills } = useSkillStore();

  useEffect(() => {
    if (!listSkills.length) fetchSkills();
  }, [listSkills, fetchSkills]);

  const handleAddSkill = (skill) => {
    const alreadySelected = selectedSkills.some((s) => s._id === skill._id);
    if (alreadySelected) {
      onChange(selectedSkills.filter((s) => s._id !== skill._id));
    } else {
      onChange([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skill) => {
    onChange((prev) => prev.filter((s) => s.name !== skill.name));
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            disabled={!isEditing}
          >
            Add skill
            <PlusCircle className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput
              placeholder="Search skill..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>
              <div className="p-2 text-sm text-muted-foreground">
                No skill found.
              </div>
            </CommandEmpty>

            <CommandGroup>
              {listSkills
                .filter((skill) =>
                  skill.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((skill) => {
                  const isSelected = selectedSkills.some(
                    (s) => s._id === skill._id
                  );
                  return (
                    <CommandItem
                      key={skill._id}
                      onSelect={() => handleAddSkill(skill)}
                      className={`flex justify-between ${
                        isSelected ? "bg-primer/10 text-primer" : ""
                      }`}
                    >
                      <span>{skill.name}</span>
                      {isSelected && <Check className="h-4 w-4 text-primer" />}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSkills.length > 0 ? (
        <div
          className={`flex flex-wrap gap-2 mt-2 overflow-y-auto ${className}`}
        >
          {selectedSkills.map((skill) => (
            <Badge
              key={skill.name}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {skill.name}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="enabled:hover:text-destructive focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isEditing}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mt-2">
          No skills added yet.
        </p>
      )}
    </>
  );
}
