// "use client"
// import React, { useState } from 'react';
// import { ChevronDown, User, Settings, Lock, LogOut, ShoppingCart, Menu, X, Loader2 , Package} from 'lucide-react';
// import { useAuth } from '@/context/AuthProvider';
// import Link from 'next/link';

// // Avatar component
// const Avatar = ({ user, size = 'md' }) => {
//   const [imageError, setImageError] = useState(false);
  
//   const sizeClasses = {
//     sm: 'h-6 w-6 text-xs',
//     md: 'h-8 w-8 text-sm',
//     lg: 'h-10 w-10 text-base'
//   };

//   const getAvatarUrl = () => `/uploads/avatars/${user?.avatar || 'default.jpg'}`;
  
//   const getInitials = (name) => {
//     if (!name) return 'U';
//     return name
//       .split(' ')
//       .map(word => word.charAt(0))
//       .slice(0, 2)
//       .join('')
//       .toUpperCase();
//   };

//   const getAvatarColor = (name) => {
//     if (!name) return 'bg-gray-500';
    
//     const colors = [
//       'bg-red-500',
//       'bg-blue-500',
//       'bg-green-500',
//       'bg-yellow-500',
//       'bg-purple-500',
//       'bg-pink-500',
//       'bg-indigo-500',
//       'bg-teal-500'
//     ];
    
//     const index = name.charCodeAt(0) % colors.length;
//     return colors[index];
//   };

//   if (!imageError) {
//     return (
//       <img
//         src={getAvatarUrl()}
//         alt={user?.name || 'User'}
//         className={`${sizeClasses[size]} rounded-full object-cover`}
//         onError={() => setImageError(true)}
//       />
//     );
//   }

//   return (
//     <div className={`${sizeClasses[size]} rounded-full ${getAvatarColor(user?.name)} flex items-center justify-center text-white font-medium`}>
//       {getInitials(user?.name)}
//     </div>
//   );
// };

// const Header = () => {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const { user, loading, logout, userOrderCount } = useAuth();

//   const isAuthenticated = user && user.roles && user.roles.includes('ROLE_USER');

//   const handleLogout = () => {
//     logout();
//     setIsProfileOpen(false);
//   };

//   return (
//     <header className="bg-white shadow-md sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex-shrink-0 flex items-center">
//             <Link href="/" className="text-2xl flex font-bold text-blue-600 hover:text-blue-800 transition-colors">
//               <Package className="h-8 w-8 text-blue-400 mr-2" />
//               <span className="text-xl font-bold">Kounouz</span> 
//             </Link>
//           </div>

//           {/* Desktop Authentication */}
//           <div className="hidden md:flex items-center space-x-4">
//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-end space-x-8">
//             <a
//               href="/"
//               className="text-gray-700 hover:text-blue-600 transition-colors"
//             >
//               All Products
//             </a>
//           </nav>
//             {loading ? (
//               <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
//             ) : isAuthenticated ? (
//               <>
//                 {/* My Orders Link with Count */}
//                 <a
//                   href="/my-orders"
//                   className="flex items-center text-gray-700 hover:text-blue-600 transition-colors relative"
//                 >
//                   <ShoppingCart className="h-5 w-5 mr-1" />
//                   My orders
//                   {userOrderCount > 0 && (
//                     <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                       {userOrderCount}
//                     </span>
//                   )}
//                 </a>

//                 {/* Profile Dropdown */}
//                 <div className="relative">
//                   <button
//                     onClick={() => setIsProfileOpen(!isProfileOpen)}
//                     className="flex items-center text-gray-700 hover:text-blue-600 transition-colors space-x-2"
//                   >
//                     <Avatar user={user} size="md" />
//                     <span>{user.firstname +' '+user.lastname}</span>
//                     <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
//                   </button>
                  
//                   {isProfileOpen && (
//                     <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
//                       {/* Profile header in dropdown */}
//                       <div className="px-4 py-3 border-b border-gray-200">
//                         <div className="flex items-center space-x-3">
//                           <Avatar user={user} size="sm" />
//                           <div className="flex-1 min-w-0">
//                             <p className="text-sm font-medium text-gray-900 truncate">{user.firstname +' '+user.lastname}</p>
//                             <p className="text-xs text-gray-500 truncate">{user.email}</p>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <a
//                         href="/profile"
//                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
//                         onClick={() => setIsProfileOpen(false)}
//                       >
//                         <User className="h-4 w-4 mr-2" />
//                         Profile Details
//                       </a>
//                       <a
//                         href="/profile/edit"
//                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
//                         onClick={() => setIsProfileOpen(false)}
//                       >
//                         <Settings className="h-4 w-4 mr-2" />
//                         Edit Profile
//                       </a>
//                       <a
//                         href="/profile/change-password"
//                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
//                         onClick={() => setIsProfileOpen(false)}
//                       >
//                         <Lock className="h-4 w-4 mr-2" />
//                         Change Password
//                       </a>
//                       <hr className="my-2 border-gray-200" />
//                       <button
//                         onClick={handleLogout}
//                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                       >
//                         <LogOut className="h-4 w-4 mr-2" />
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <>
//                 {/* Login and Signup Links */}
//                 <a
//                   href="/login"
//                   className="text-gray-700 hover:text-blue-600 transition-colors"
//                 >
//                   Login
//                 </a>
//                 <a
//                   href="/signup"
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Sign Up
//                 </a>
//               </>
//             )}
//           </div>

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="text-gray-700 hover:text-blue-600 transition-colors"
//             >
//               {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile menu */}
//         {isMobileMenuOpen && (
//           <div className="md:hidden">
//             {/* Mobile Authentication */}
//             <div className="pt-4 pb-3 border-t border-gray-200">
//               {loading ? (
//                 <div className="flex justify-center py-4">
//                   <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
//                 </div>
//               ) : isAuthenticated ? (
//                 <>
//                   <div className="flex items-center px-4 py-2">
//                     <Avatar user={user} size="lg" />
//                     <div className="ml-3">
//                       <div className="text-base font-medium text-gray-800">{user.firstname +' '+user.lastname}</div>
//                       <div className="text-sm text-gray-500">{user.email}</div>
//                     </div>
//                   </div>
                  
//                   <div className="mt-3 space-y-1">
//                     <a
//                       href="/my-orders"
//                       className="flex items-center px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
//                       onClick={() => setIsMobileMenuOpen(false)}
//                     >
//                       <ShoppingCart className="h-5 w-5 mr-3" />
//                       My orders
//                       {userOrderCount > 0 && (
//                         <span className="ml-auto bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                           {userOrderCount}
//                         </span>
//                       )}
//                     </a>
//                     <a
//                       href="/profile"
//                       className="flex items-center px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
//                       onClick={() => setIsMobileMenuOpen(false)}
//                     >
//                       <User className="h-5 w-5 mr-3" />
//                       Account Information
//                     </a>
//                     <a
//                       href="/profile/edit"
//                       className="flex items-center px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
//                       onClick={() => setIsMobileMenuOpen(false)}
//                     >
//                       <Settings className="h-5 w-5 mr-3" />
//                       Edit Profile
//                     </a>
//                     <a
//                       href="/profile/change-password"
//                       className="flex items-center px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
//                       onClick={() => setIsMobileMenuOpen(false)}
//                     >
//                       <Lock className="h-5 w-5 mr-3" />
//                       Change Password
//                     </a>
//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center w-full px-4 py-2 text-base text-red-600 hover:bg-red-50 transition-colors"
//                     >
//                       <LogOut className="h-5 w-5 mr-3" />
//                       Logout
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <div className="space-y-2 px-4">
//                   <a
//                     href="/login"
//                     className="block text-base text-gray-700 hover:text-blue-600 transition-colors"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                   >
//                     Login
//                   </a>
//                   <a
//                     href="/signup"
//                     className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                   >
//                     Sign Up
//                   </a>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;


"use client";
import React, { useState } from 'react';
import { ChevronDown, User, Settings, Lock, LogOut, ShoppingCart, Menu, X, Loader2, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import Link from 'next/link';

// Avatar component
const Avatar = ({ user, size = 'md' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const getAvatarUrl = () => `/uploads/avatars/${user?.avatar || 'default.jpg'}`;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-500';

    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!imageError) {
    return (
      <img
        src={getAvatarUrl()}
        alt={user?.name || 'User'}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full ${getAvatarColor(user?.name)} flex items-center justify-center text-white font-medium`}>
      {getInitials(user?.name)}
    </div>
  );
};

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, logout, userOrderCount } = useAuth();

  const isAuthenticated = user && user.roles && user.roles.includes('ROLE_USER');

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl flex font-bold text-blue-600 hover:text-blue-800 transition-colors">
              <Package className="h-8 w-8 text-blue-400 mr-2" />
              <span className="text-xl font-bold">Kounouz</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="hidden md:flex items-end space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                All Products
              </Link>
            </nav>

            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            ) : isAuthenticated ? (
              <>
                {/* Orders */}
                <Link
                  href="/my-orders"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors relative"
                >
                  <ShoppingCart className="h-5 w-5 mr-1" />
                  My orders
                  {userOrderCount > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {userOrderCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors space-x-2"
                  >
                    <Avatar user={user} size="md" />
                    <span>{user.firstname + ' ' + user.lastname}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Avatar user={user} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.firstname + ' ' + user.lastname}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile Details
                      </Link>
                      <Link
                        href="/profile/edit"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                      <Link
                        href="/profile/change-password"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Link>

                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-4 pb-3 border-t border-gray-200">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              ) : isAuthenticated ? (
                <>
                  <div className="flex items-center px-4 py-2">
                    <Avatar user={user} size="lg" />
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.firstname + ' ' + user.lastname}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <Link
                      href="/my-orders"
                      className="flex items-center px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5 mr-3" />
                      My orders
                      {userOrderCount > 0 && (
                        <span className="ml-auto bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {userOrderCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Account Information
                    </Link>
                    <Link
                      href="/profile/edit"
                      className="flex items-center px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Edit Profile
                    </Link>
                    <Link
                      href="/profile/change-password"
                      className="flex items-center px-4 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Lock className="h-5 w-5 mr-3" />
                      Change Password
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-base text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 px-4">
                  <Link
                    href="/login"
                    className="block text-base text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
