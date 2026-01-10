"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

// Keep your imports as they are
import fashionBanner from "../../assets/Image/fashion-bridal-wear-banner.jpg"
import makeupBanner from "../../assets/Image/makeup-category-cosmetics-beauty.jpg"
import westernBanner from "../../assets/Image/western-wear-collection-banner.jpg"

const heroSlides = [
  {
    id: 1,
    title: "The Bridal Edit",
    subtitle: "Exquisite craftsmanship meets modern elegance.",
    cta: "Discover Collection",
    link: "/products/Fashion",
    image: fashionBanner,
    tag: "Exclusive",
    accent: "text-[#E75480]", // Rose Pink accent
  },
  {
    id: 2,
    title: "Glow Within",
    subtitle: "Premium skincare and cosmetics for every shade.",
    cta: "Shop Beauty",
    link: "/products/Beauty",
    image: makeupBanner,
    tag: "New Season",
    accent: "text-[#FFD700]", // Golden Yellow accent
  },
  {
    id: 3,
    title: "Urban West",
    subtitle: "Streetwear essentials for the bold and fearless.",
    cta: "Explore Styles",
    link: "/products/Kids",
    image: westernBanner,
    tag: "Trend Alert",
    accent: "text-[#FF4E50]", // Sunset Orange accent
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleNext = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent((prev) => (prev + 1) % heroSlides.length)
    setTimeout(() => setIsAnimating(false), 800)
  }, [isAnimating])

  const handlePrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    setTimeout(() => setIsAnimating(false), 800)
  }

  useEffect(() => {
    const timer = setInterval(handleNext, 6000)
    return () => clearInterval(timer)
  }, [handleNext])

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full bg-[#1a1a1a] overflow-hidden selection:bg-[#FF4E50] selection:text-white">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out ${
            index === current ? "opacity-100 scale-100 z-10" : "opacity-0 scale-110 z-0"
          }`}
        >
          {/* Main Background Image with Warm Overlay */}
          <div className="absolute inset-0">
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover opacity-60 transition-transform duration-[6000ms] ease-linear"
              style={{ transform: index === current ? 'scale(1.1)' : 'scale(1)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent" />
          </div>

          {/* Content Wrapper */}
          <div className="relative h-full container mx-auto px-6 lg:px-12 flex items-center">
            <div className="max-w-3xl space-y-8 mt-10">
              
              {/* Animated Tag */}
              <div className={`overflow-hidden`}>
                 <p className={`text-[#FFD700] text-sm font-bold tracking-[0.4em] uppercase transition-all duration-700 delay-300 transform ${index === current ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
                    // {slide.tag}
                 </p>
              </div>

              {/* Title */}
              <h1 className="text-white text-5xl md:text-8xl font-light tracking-tighter leading-none">
                <span className={`block transition-all duration-700 delay-500 transform ${index === current ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}>
                  {slide.title.split(' ')[0]}
                </span>
                <span className={`block font-serif italic font-thin ${slide.accent} transition-all duration-700 delay-700 transform ${index === current ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}>
                   {slide.title.split(' ').slice(1).join(' ')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className={`text-[#FAD0C4] text-lg md:text-xl max-w-md font-medium transition-all duration-700 delay-1000 ${index === current ? "opacity-100" : "opacity-0"}`}>
                {slide.subtitle}
              </p>

              {/* --- NEW PILL-SHAPED BUTTON UI --- */}
              <div className={`transition-all duration-700 delay-[1200ms] ${index === current ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                <Link to={slide.link}>
                  <Button className="group relative h-14 px-10 rounded-full bg-transparent overflow-hidden border-2 border-[#FF4E50] text-white hover:text-black transition-colors duration-500 font-bold uppercase tracking-widest text-xs">
                    {/* Hover Fill Effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FF4E50] to-[#E75480] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    
                    {/* Button Content */}
                    <span className="relative z-10 flex items-center">
                        {slide.cta}
                        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Modern Navigation */}
      <div className="absolute bottom-12 right-12 z-20 flex flex-col gap-4">
        <button 
          onClick={handlePrev}
          className="p-4 border border-[#E75480]/40 text-white hover:bg-[#E75480] hover:text-white transition-all rounded-full backdrop-blur-md"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={handleNext}
          className="p-4 border border-[#FF4E50]/40 text-white hover:bg-[#FF4E50] hover:text-white transition-all rounded-full backdrop-blur-md"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Vertical Progress Indicators */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-8">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className="group flex items-center gap-4"
          >
            <span className={`text-[10px] font-bold ${idx === current ? "text-[#FF4E50]" : "text-zinc-500"}`}>
              0{idx + 1}
            </span>
            <div className={`h-12 w-[1px] transition-all duration-500 ${idx === current ? "bg-[#FF4E50] scale-y-125" : "bg-zinc-800"}`} />
          </button>
        ))}
      </div>
    </section>
  )
}