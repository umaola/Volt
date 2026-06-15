import * as React from "react"
import { PrimaryButton } from "@/components/design-system/button"
import { IconChevronRight } from "@tabler/icons-react"

interface SplashPageProps {
  onGetStarted: () => void
  initialSlide?: number
  autoPlay?: boolean
}

export function SplashPage({
  onGetStarted,
  initialSlide = 0,
  autoPlay = true
}: SplashPageProps) {
  const [slide, setSlide] = React.useState(initialSlide)

  React.useEffect(() => {
    if (!autoPlay) return

    if (slide < 2) {
      const timer = setTimeout(() => {
        setSlide((prev) => prev + 1)
      }, 3000)
      return () => clearTimeout(timer)
    } else if (slide === 2) {
      const timer = setTimeout(() => {
        onGetStarted()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [slide, onGetStarted, autoPlay])

  const handleNext = () => {
    if (slide < 2) {
      setSlide((prev) => prev + 1)
    } else {
      onGetStarted()
    }
  }

  return (
    <div className="flex-grow flex flex-col justify-between bg-white select-none h-full w-full max-w-md mx-auto relative overflow-hidden">
      <div 
        onClick={handleNext}
        className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-700 transform cursor-pointer ${
          slide === 0 ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-full scale-95 pointer-events-none"
        }`}
      >
        <div className="w-[140px] h-[140px] relative flex items-center justify-center">
          <img
            src="/logo-text.png"
            alt="Volt Logo Text"
            className="absolute inset-0 w-full h-full object-contain"
          />
          <img
            src="/logo-mark.png"
            alt="Volt Logo Mark"
            className="absolute inset-0 w-full h-full object-contain animate-subtle-bounce"
          />
        </div>
      </div>

      <div className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-white via-[#f0fdf4] to-[#e6fcf0] transition-all duration-700 transform ${
        slide === 1 ? "opacity-100 translate-x-0 scale-100" : (slide < 1 ? "opacity-0 translate-x-full scale-95 pointer-events-none" : "opacity-0 -translate-x-full scale-95 pointer-events-none")
      }`}>
        <div className="flex-1 flex flex-col justify-start pt-8">
          <div className="w-full flex justify-center px-6">
            <img
              src="/onboarding-illustration.png"
              alt="Volt App Onboarding"
              className="w-full max-h-[300px] object-contain"
            />
          </div>
          
          <div className="flex justify-center gap-1.5 mt-6">
            <div className="h-2 w-6 rounded-full bg-[#FFD100] transition-all duration-300" />
            <div className="h-2 w-2 rounded-full bg-[#CBD5E1] transition-all duration-300" />
          </div>

          <div className="px-6 mt-6">
            <h2 className="text-3xl font-extrabold text-[#052e16] tracking-tight leading-tight">
              Your Mobile Unit Tracker
            </h2>
            <p className="text-[#334155] mt-4 text-sm font-medium leading-relaxed">
              Volt helps you stretch every kWh and avoid sudden blackouts or wasted spend. Your tariff, your habits, your control.
            </p>
          </div>
        </div>
        <div className="w-full flex justify-end px-6 mb-6">
          <div className="w-12 h-12 rounded-full border border-[#FFD100] p-[0.5px] flex items-center justify-center">
            <button 
              onClick={handleNext}
              className="w-full h-full rounded-full bg-[#FFD100] text-white flex items-center justify-center hover:bg-[#E6BD00] transition-colors"
            >
              <IconChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      <div className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-white via-[#f0fdf4] to-[#e6fcf0] transition-all duration-700 transform ${
        slide === 2 ? "opacity-100 translate-x-0 scale-100" : (slide < 2 ? "opacity-0 translate-x-full scale-95 pointer-events-none" : "opacity-0 -translate-x-full scale-95 pointer-events-none")
      }`}>
        <div className="flex-1 flex flex-col justify-start pt-8">
          <div className="w-full flex justify-center px-6">
            <img
              src="/onboarding-light-illustration.png"
              alt="Volt Power Understanding"
              className="w-full max-h-[300px] object-contain"
            />
          </div>
          
          <div className="flex justify-center gap-1.5 mt-6">
            <div className="h-2 w-2 rounded-full bg-[#CBD5E1] transition-all duration-300" />
            <div className="h-2 w-6 rounded-full bg-[#FFD100] transition-all duration-300" />
          </div>

          <div className="px-6 mt-6">
            <h2 className="text-3xl font-extrabold text-[#052e16] tracking-tight leading-tight">
              Understand Your Power
            </h2>
            <p className="text-[#334155] mt-4 text-sm font-medium leading-relaxed">
              Stop guessing where your units go. Volt tracks your usage and gives you an insight of what’s actually draining your electricity.
            </p>
          </div>
        </div>
        <div className="w-full flex justify-end px-6 mb-6">
          <div className="w-12 h-12 rounded-full border border-[#FFD100] p-[0.5px] flex items-center justify-center">
            <button 
              onClick={handleNext}
              className="w-full h-full rounded-full bg-[#FFD100] text-white flex items-center justify-center hover:bg-[#E6BD00] transition-colors"
            >
              <IconChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>


    </div>
  )
}
