// // components/layout/MainLayout.jsx
// import React from "react";
// import { Outlet, NavLink } from "react-router-dom";

// export default function MainLayout() {
//   return (
//     <div className="min-h-screen flex bg-slate-50">
//       {/* Sidebar */}
//       <aside className="w-64 bg-white shadow-md p-6">
//         <h2 className="text-xl font-bold mb-6">MyApp</h2>
//         <nav className="flex flex-col space-y-2">
//           <NavLink
//             to="/"
//             end
//             className={({ isActive }) =>
//               `px-3 py-2 rounded-md text-sm font-medium ${
//                 isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100"
//               }`
//             }
//           >
//             Home
//           </NavLink>
//           <NavLink
//             to="/dashboard"
//             className={({ isActive }) =>
//               `px-3 py-2 rounded-md text-sm font-medium ${
//                 isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100"
//               }`
//             }
//           >
//             Dashboard
//           </NavLink>
//           <NavLink
//             to="/seeData"
//             className={({ isActive }) =>
//               `px-3 py-2 rounded-md text-sm font-medium ${
//                 isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100"
//               }`
//             }
//           >
//             See Data
//           </NavLink>
//           <NavLink
//             to="/history"
//             className={({ isActive }) =>
//               `px-3 py-2 rounded-md text-sm font-medium ${
//                 isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100"
//               }`
//             }
//           >
//             History
//           </NavLink>
//           <NavLink
//             to="/templates"
//             className={({ isActive }) =>
//               `px-3 py-2 rounded-md text-sm font-medium ${
//                 isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100"
//               }`
//             }
//           >
//             Templates
//           </NavLink>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-8">
//         <Outlet />
//       </main>
//     </div>
//   );
// }
