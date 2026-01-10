"use client"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

// Imports ko as it is rakha gaya hai
import makeupImage from "../../assets/Image/makeup-category-cosmetics-beauty.jpg"
import westernWearImage from "../../assets/Image/western-wear-category-dresses-tops.jpg"
import indianWearImage from "../../assets/Image/indian-wear-category-sarees-kurtas.jpg"
import accessoriesImage from "../../assets/Image/accessories-category-jewelry-bags.jpg"
import sportswearImage from "../../assets/Image/sportswear-category-activewear-fitness.jpg"
import personalCareImage from "../../assets/Image/personal-care-category-skincare-beauty.jpg"

const categories = [
  { name: "Fashion", image: indianWearImage, href: "/products/Fashion", label: "The Ethnic Edit" },
  { name: "Beauty", image: makeupImage, href: "/products/Beauty", label: "Pure Radiance" },
  { name: "Kids", image: westernWearImage, href: "/products/Kids", label: "Junior Style" },
  { name: "Toys", image: sportswearImage, href: "/products/Toys", label: "Creative Play" },
  { name: "Electronics", image: personalCareImage, href: "/products/Electronics", label: "Modern Tech" },
  { name: "Accessories", image: accessoriesImage, href: "/products/Accessories", label: "Final Accents" },
]

export default function CategoryGrid() {
  return (
    // Background light Rose Pink tint rakha hai aur selection color Sunset Orange
    <section className="py-16 sm:py-24 bg-[#FFF5F7] selection:bg-[#FF4E50] selection:text-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* --- LUXURY HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-[#FAD0C4] pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               {/* Sunset Orange line */}
               <span className="h-[1px] w-12 bg-[#FF4E50]" />
               <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#E75480]">
                 Spring / Summer 2025
               </p>
            </div>
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter uppercase leading-[0.85] text-[#333]">
               Shop by <br />
               {/* Golden Yellow hover effect */}
               <span className="font-serif italic text-[#E75480] hover:text-[#FFD700] transition-colors duration-700">Category.</span>
            </h2>
          </div>
          
          {/* View Collection with Sunset Orange border and Golden Yellow hover */}
          <Link to="/products" className="group flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] border-b border-[#FF4E50] pb-2 hover:text-[#FFD700] hover:border-[#FFD700] hover:pr-6 transition-all duration-500 text-[#333]">
            View Collection <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {/* --- HIGH-END GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-12">
          {categories.map((cat, index) => (
            <Link 
              key={cat.name} 
              to={cat.href} 
              className="group flex flex-col items-center"
            >
              {/* Image Container - Ring color changed to Rose Pink */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-white ring-1 ring-[#FAD0C4] group-hover:ring-[#FF4E50] transition-all duration-700 shadow-sm">
                <img
                  src={cat.image || "/placeholder.svg"}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-all duration-[1.2s] ease-in-out group-hover:scale-110"
                />
                
                {/* Floating Index - Golden Yellow background */}
                <span className="absolute top-4 left-4 text-[9px] font-bold text-white bg-[#FFD700]/80 backdrop-blur-md px-2 py-0.5 rounded-sm">
                  0{index + 1}
                </span>

                {/* Sunset Orange overlay on hover */}
                <div className="absolute inset-0 bg-[#FF4E50]/0 group-hover:bg-[#FF4E50]/10 transition-colors duration-500" />
              </div>

              {/* Typography Content */}
              <div className="mt-8 text-center space-y-2 w-full">
                {/* Name in Rose Pink */}
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#E75480] group-hover:tracking-[0.4em] transition-all duration-500">
                  {cat.name}
                </h3>
                
                <div className="overflow-hidden h-4 relative">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-[#FF4E50]/60 transition-transform duration-500 translate-y-0 group-hover:-translate-y-full">
                    Explore
                  </p>
                  <p className="absolute top-0 left-0 w-full text-[10px] font-bold uppercase tracking-widest text-[#FF4E50] transition-transform duration-500 translate-y-full group-hover:translate-y-0">
                    {cat.label}
                  </p>
                </div>

                {/* Animated Underline - Golden Yellow to Sunset Orange */}
                <div className="mx-auto h-[1.5px] w-6 bg-[#FFD700] group-hover:w-full group-hover:bg-[#FF4E50] transition-all duration-700 mt-2" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}