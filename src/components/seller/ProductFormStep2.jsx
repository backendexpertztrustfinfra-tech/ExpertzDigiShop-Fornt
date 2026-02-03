// "use client"

// const Step2Images = ({ formData, onChange }) => {
//   const imageTypes = [
//     { key: "primary", label: "Primary Image", description: "Main product image" },
//     { key: "frontView", label: "Front View", description: "Front angle photo" },
//     { key: "backView", label: "Back View", description: "Back angle photo" },
//     { key: "sideView", label: "Side View", description: "Side angle photo" },
//     { key: "zoomedView", label: "Zoomed In", description: "Close-up detail view" },
//     { key: "detailView", label: "Detail View", description: "Product detail shot" },
//   ]

//   const handleImageChange = (key, e) => {
//     if (key === "primary") {
//       onChange("images", key, e.target.files[0] || null)
//     } else {
//       const newFiles = [...(formData.images[key] || [])]
//       Array.from(e.target.files).forEach((file) => {
//         newFiles.push(file)
//       })
//       onChange("images", key, newFiles)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold">Product Images</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {imageTypes.map((type) => (
//           <div key={type.key} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
//             <label className="block cursor-pointer">
//               <div className="text-center">
//                 <div className="text-3xl mb-2">📷</div>
//                 <p className="font-medium">{type.label}</p>
//                 <p className="text-sm text-gray-500">{type.description}</p>
//               </div>
//               <input
//                 type="file"
//                 accept="image/*"
//                 multiple={type.key !== "primary"}
//                 onChange={(e) => handleImageChange(type.key, e)}
//                 className="hidden"
//               />
//             </label>

//             {type.key === "primary" && formData.images.primary && (
//               <div className="mt-2 text-sm text-green-600">✓ {formData.images.primary.name}</div>
//             )}
//             {type.key !== "primary" && formData.images[type.key]?.length > 0 && (
//               <div className="mt-2 text-sm text-green-600">✓ {formData.images[type.key].length} files</div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default Step2Images
