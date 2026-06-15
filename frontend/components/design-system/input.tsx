import * as React from "react"
import { cn } from "@/lib/utils"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, type = "text", label, error, success, disabled, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm font-medium text-[#121212] select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-10 px-3 py-2 rounded-lg bg-white border font-normal text-sm text-[#121212] placeholder-[#9CA3AF] transition-colors focus:outline-none disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:border-[#E5E7EB] disabled:cursor-not-allowed",
              error
                ? "border-[#EF4444] focus:border-[#EF4444]"
                : success
                ? "border-[#16A34A] focus:border-[#16A34A]"
                : "border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-primary focus:border-2",
              className
            )}
            {...props}
          />
          {success && !error && (
            <span className="absolute right-3 text-[#16A34A]">
              <IconCheck className="w-5 h-5" />
            </span>
          )}
        </div>
        {error && (
          <span className="text-xs text-[#EF4444] font-normal leading-4 mt-0.5">
            {error}
          </span>
        )}
      </div>
    )
  }
)
TextField.displayName = "TextField"

interface DropdownFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const DropdownField = React.forwardRef<HTMLSelectElement, DropdownFieldProps>(
  ({ className, label, error, options, placeholder, disabled, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm font-medium text-[#121212] select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-10 pl-3 pr-10 py-2 rounded-lg bg-white border font-normal text-sm text-[#121212] placeholder-[#9CA3AF] appearance-none transition-colors focus:outline-none disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:border-[#E5E7EB] disabled:cursor-not-allowed",
              error
                ? "border-[#EF4444] focus:border-[#EF4444]"
                : "border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-primary focus:border-2",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled selected hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 text-[#9CA3AF] pointer-events-none">
            <IconChevronDown className="w-5 h-5" />
          </span>
        </div>
        {error && (
          <span className="text-xs text-[#EF4444] font-normal leading-4 mt-0.5">
            {error}
          </span>
        )}
      </div>
    )
  }
)
DropdownField.displayName = "DropdownField"
