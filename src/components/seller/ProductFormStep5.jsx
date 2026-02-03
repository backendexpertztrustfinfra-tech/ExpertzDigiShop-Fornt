// "use client"

// const Step5ManufacturerDetails = ({ formData, onChange }) => {
//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold">Manufacturer & Policies</h2>

//       {/* Manufacturer Section */}
//       <div className="border-l-4 border-blue-500 pl-4 py-2">
//         <h3 className="font-semibold mb-4">Manufacturer Details</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <input
//             type="text"
//             placeholder="Manufacturer Name"
//             value={formData.manufacturer?.name || ""}
//             onChange={(e) => onChange("manufacturer", "name", e.target.value)}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//           <input
//             type="text"
//             placeholder="City"
//             value={formData.manufacturer?.city || ""}
//             onChange={(e) => onChange("manufacturer", "city", e.target.value)}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//           <input
//             type="text"
//             placeholder="Address"
//             value={formData.manufacturer?.address || ""}
//             onChange={(e) => onChange("manufacturer", "address", e.target.value)}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none col-span-1 md:col-span-2"
//           />
//           <input
//             type="text"
//             placeholder="State"
//             value={formData.manufacturer?.state || ""}
//             onChange={(e) => onChange("manufacturer", "state", e.target.value)}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//           <input
//             type="text"
//             placeholder="Pincode"
//             value={formData.manufacturer?.pincode || ""}
//             onChange={(e) => onChange("manufacturer", "pincode", e.target.value)}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>
//       </div>

//       {/* Packer Section */}
//       <div className="border-l-4 border-green-500 pl-4 py-2">
//         <h3 className="font-semibold mb-4">Packer Details</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <input
//             type="text"
//             placeholder="Packer Name"
//             value={formData.packer?.name || ""}
//             onChange={(e) => onChange("packer", "name", e.target.value)}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//           <input
//             type="text"
//             placeholder="Phone"
//             value={formData.packer?.phone || ""}
//             onChange={(e) => onChange("packer", "phone", e.target.value)}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//           <input
//             type="text"
//             placeholder="Address"
//             value={formData.packer?.address || ""}
//             onChange={(e) => onChange("packer", "address", e.target.value)}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none col-span-1 md:col-span-2"
//           />
//           <input
//             type="text"
//             placeholder="City"
//             value={formData.packer?.city || ""}
//             onChange={(e) => onChange("packer", "city", e.target.value)}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//           <input
//             type="text"
//             placeholder="Pincode"
//             value={formData.packer?.pincode || ""}
//             onChange={(e) => onChange("packer", "pincode", e.target.value)}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//           />
//         </div>
//       </div>

//       {/* Policies Section */}
//       <div className="border-l-4 border-orange-500 pl-4 py-2">
//         <h3 className="font-semibold mb-4">Policies</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">Return Days</label>
//             <input
//               type="number"
//               value={formData.policies?.returnDays || 30}
//               onChange={(e) => onChange("policies", "returnDays", Number.parseInt(e.target.value))}
//               className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-2">Warranty</label>
//             <input
//               type="text"
//               value={formData.policies?.warranty || ""}
//               onChange={(e) => onChange("policies", "warranty", e.target.value)}
//               placeholder="e.g., 1 Year"
//               className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//             />
//           </div>
//         </div>
//         <textarea
//           value={formData.policies?.returnPolicy || ""}
//           onChange={(e) => onChange("policies", "returnPolicy", e.target.value)}
//           placeholder="Return policy details..."
//           rows="3"
//           className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mt-4"
//         />
//         <div className="mt-4 flex gap-4">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={formData.policies?.moneyBackGuarantee || false}
//               onChange={(e) => onChange("policies", "moneyBackGuarantee", e.target.checked)}
//             />
//             <span>Money Back Guarantee</span>
//           </label>
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={formData.policies?.codAvailable || false}
//               onChange={(e) => onChange("policies", "codAvailable", e.target.checked)}
//             />
//             <span>COD Available</span>
//           </label>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Step5ManufacturerDetails
