import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { SERVICE_CATEGORIES } from "@/constants/serviceCategories";

interface ServiceSelectorProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  maxServices?: number;
}

export function ServiceSelector({ 
  selectedServices, 
  onServicesChange,
  maxServices = 6 
}: ServiceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (service: string) => {
    if (selectedServices.includes(service)) {
      onServicesChange(selectedServices.filter((s) => s !== service));
    } else if (selectedServices.length < maxServices) {
      onServicesChange([...selectedServices, service]);
    }
    setSearchValue("");
  };

  const handleRemove = (service: string) => {
    onServicesChange(selectedServices.filter((s) => s !== service));
  };

  const availableServices = SERVICE_CATEGORIES.filter(
    (service) => !selectedServices.includes(service)
  );

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={selectedServices.length >= maxServices}
          >
            {selectedServices.length >= maxServices
              ? `Maximum ${maxServices} services selected`
              : "Select services..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 z-50" align="start">
          <Command>
            <CommandInput 
              placeholder="Search services..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No service found.</CommandEmpty>
              <CommandGroup>
                {availableServices.map((service) => (
                  <CommandItem
                    key={service}
                    value={service}
                    onSelect={() => handleSelect(service)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedServices.includes(service) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {service}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedServices.map((service) => (
            <Badge 
              key={service} 
              variant="secondary"
              className="px-3 py-1.5 text-sm flex items-center gap-2"
            >
              {service}
              <button
                onClick={() => handleRemove(service)}
                className="hover:text-destructive transition-colors"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {selectedServices.length} of {maxServices} services selected
      </p>
    </div>
  );
}
