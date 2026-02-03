// "use client"

// const Step4Pricing = ({ formData, onChange }) => {
//   const gstRates = [0, 5, 12, 18, 28]

//   const costPrice = formData.pricing?.costPrice || 0
//   const mrp = formData.pricing?.mrp || 0
//   const discount = mrp > 0 ? Math.round(((mrp - (formData.pricing?.sellingPrice || 0)) / mrp) * 100) : 0

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold">Pricing & Compliance</h2>

//       <div className="bg-blue-50 p-4 rounded-lg">
//         <p className="text-sm text-blue-900">
//           💡 Tip: MRP should be higher than selling price to show discount percentage
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-2">Cost Price (₹)</label>
//           <input
//             type="number"
//             value={costPrice}
//             onChange={(e) => onChange("pricing", "costPrice", Number.parseFloat(e.target.value))}
//             placeholder="0"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">MRP (₹)</label>
//           <input
//             type="number"
//             value={mrp}
//             onChange={(e) => onChange("pricing", "mrp", Number.parseFloat(e.target.value))}
//             placeholder="0"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">
//             Selling Price (₹) <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="number"
//             value={formData.pricing?.sellingPrice || 0}
//             onChange={(e) => onChange("pricing", "sellingPrice", Number.parseFloat(e.target.value))}
//             placeholder="0"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Discount (%)</label>
//           <input
//             type="number"
//             value={discount}
//             disabled
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100"
//           />
//           <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-2">HSN Code</label>
//           <input
//             type="text"
//             value={formData.compliance?.hsnCode || ""}
//             onChange={(e) => onChange("compliance", "hsnCode", e.target.value)}
//             placeholder="e.g., 6204"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">GST Rate (%)</label>
//           <select
//             value={formData.compliance?.gst || 18}
//             onChange={(e) => onChange("compliance", "gst", Number.parseInt(e.target.value))}
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           >
//             {gstRates.map((rate) => (
//               <option key={rate} value={rate}>
//                 {rate}%
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">SKU</label>
//           <input
//             type="text"
//             value={formData.compliance?.sku || ""}
//             onChange={(e) => onChange("compliance", "sku", e.target.value)}
//             placeholder="Stock Keeping Unit"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Barcode</label>
//           <input
//             type="text"
//             value={formData.compliance?.barcode || ""}
//             onChange={(e) => onChange("compliance", "barcode", e.target.value)}
//             placeholder="EAN/UPC barcode"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Country of Origin</label>
//           <input
//             type="text"
//             value={formData.compliance?.countryOfOrigin || "India"}
//             onChange={(e) => onChange("compliance", "countryOfOrigin", e.target.value)}
//             placeholder="India"
//             className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Step4Pricing
