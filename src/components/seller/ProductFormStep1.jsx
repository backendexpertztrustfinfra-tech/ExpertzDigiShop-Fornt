// "use client"

// const Step1ProductInfo = ({ formData, onChange }) => {
//   const categories = ["Fashion", "Electronics", "Home & Kitchen", "Books", "Sports", "Toys"]

//   const handleChange = (field, value) => {
//     onChange(field, undefined, value)
//   }

//   const handleTagChange = (e) => {
//     const value = e.target.value
//     // Split by comma and trim whitespace
//     const tagsArray = value
//       .split(",")
//       .map((tag) => tag.trim())
//       .filter((tag) => tag)
//     onChange("tags", undefined, tagsArray)
//   }

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold">Basic Information</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-2">
//             Product Name <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             value={formData.name || ""}
//             onChange={(e) => handleChange("name", e.target.value)}
//             placeholder="Enter product name"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">
//             Category <span className="text-red-500">*</span>
//           </label>
//           <select
//             value={formData.category || ""}
//             onChange={(e) => handleChange("category", e.target.value)}
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           >
//             <option value="">Select category</option>
//             {categories.map((cat) => (
//               <option key={cat} value={cat}>
//                 {cat}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-2">Brand</label>
//           <input
//             type="text"
//             value={formData.specifications?.brand || ""}
//             onChange={(e) => onChange("specifications", "brand", e.target.value)}
//             placeholder="Enter brand name"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Material</label>
//           <input
//             type="text"
//             value={formData.specifications?.material || ""}
//             onChange={(e) => onChange("specifications", "material", e.target.value)}
//             placeholder="e.g., Cotton, Polyester"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-2">Description</label>
//         <textarea
//           value={formData.description || ""}
//           onChange={(e) => handleChange("description", e.target.value)}
//           placeholder="Enter detailed product description"
//           rows="4"
//           className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
//         <input
//           type="text"
//           value={(Array.isArray(formData.tags) ? formData.tags : []).join(", ")}
//           onChange={handleTagChange}
//           placeholder="Enter tags separated by commas, e.g., new, sale, trending"
//           className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//         />
//       </div>
//     </div>
//   )
// }

// export default Step1ProductInfo
