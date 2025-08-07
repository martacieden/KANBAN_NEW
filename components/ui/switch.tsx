"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, disabled, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Track styles
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 bg-gray-100 border-gray-200 disabled:bg-gray-200 data-[state=checked]:bg-gray-200",
      className
    )}
    disabled={disabled}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Thumb base
        "pointer-events-none block h-5 w-5 rounded-full shadow ring-0 transition-transform transition-colors flex items-center justify-center border-2",
        // Checked: blue thumb, Unchecked: white thumb, Disabled: gray thumb
        "data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-white data-[state=checked]:border-blue-600 data-[state=unchecked]:border-gray-300 disabled:bg-gray-200 disabled:border-gray-200",
        // Move thumb
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    >
      {/* Checkmark icon for checked or disabled */}
      <span
        className={cn(
          "transition-opacity duration-150 flex items-center justify-center",
          // Show check for checked or disabled
          "data-[state=checked]:opacity-100 data-[state=unchecked]:opacity-0",
          disabled ? "opacity-100" : ""
        )}
      >
        <Check
          className={cn(
            "w-3.5 h-3.5 leading-none mt-px",
            disabled ? "text-gray-400" : "text-white"
          )}
          strokeWidth={3}
        />
      </span>
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
