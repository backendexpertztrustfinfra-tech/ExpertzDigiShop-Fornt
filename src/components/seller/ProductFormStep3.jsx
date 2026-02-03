// "use client"

// const Step3Specifications = ({ formData, onChange }) => {
//   const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"]
//   const colors = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Brown"]

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold">Specifications & Inventory</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-2">Weight (grams)</label>
//           <input
//             type="number"
//             value={formData.specifications?.weight || 0}
//             onChange={(e) => onChange("specifications", "weight", Number.parseFloat(e.target.value))}
//             placeholder="0"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Color (comma separated)</label>
//           <input
//             type="text"
//             value={formData.specifications?.color?.join(", ") || ""}
//             onChange={(e) =>
//               onChange(
//                 "specifications",
//                 "color",
//                 e.target.value.split(",").map((c) => c.trim()),
//               )
//             }
//             placeholder="e.g., Red, Blue, Black"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-2">Length (cm)</label>
//           <input
//             type="number"
//             value={formData.specifications?.dimensions?.length || 0}
//             onChange={(e) =>
//               onChange("specifications", {
//                 ...formData.specifications?.dimensions,
//                 length: Number.parseFloat(e.target.value),
//               })
//             }
//             placeholder="0"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Width (cm)</label>
//           <input
//             type="number"
//             value={formData.specifications?.dimensions?.width || 0}
//             onChange={(e) => {
//               const dims = { ...formData.specifications?.dimensions, width: Number.parseFloat(e.target.value) }
//               onChange("specifications", "dimensions", dims)
//             }}
//             placeholder="0"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Height (cm)</label>
//           <input
//             type="number"
//             value={formData.specifications?.dimensions?.height || 0}
//             onChange={(e) => {
//               const dims = { ...formData.specifications?.dimensions, height: Number.parseFloat(e.target.value) }
//               onChange("specifications", "dimensions", dims)
//             }}
//             placeholder="0"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-2">
//           Total Stock <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="number"
//           value={formData.inventory?.totalStock || 0}
//           onChange={(e) => onChange("inventory", "totalStock", Number.parseInt(e.target.value))}
//           placeholder="Enter total stock quantity"
//           className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-2">Care Instructions</label>
//         <textarea
//           value={formData.specifications?.careInstructions || ""}
//           onChange={(e) => onChange("specifications", "careInstructions", e.target.value)}
//           placeholder="e.g., Machine wash in cold water, Do not bleach"
//           rows="3"
//           className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//         />
//       </div>
//     </div>
//   )
// }

// export default Step3Specifications
