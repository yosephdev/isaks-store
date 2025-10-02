'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import CartIcon from './CartIcon'
import Image from 'next/image'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const dispatch = useDispatch()
  const auth = useSelector((state) => state?.auth) || { user: null, isAuthenticated: false }
  const { user, isAuthenticated } = auth

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    dispatch(logout())
  }, [dispatch])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  return (
    <nav className="bg-background border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/isakstore.png" 
                alt="Isaks Store Logo" 
                width={56} 
                height={56} 
                className="h-14 w-14" 
                priority 
              />
              <span className="text-3xl font-bold">Isaks Store</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-black">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-black">
              Products
            </Link>
            <CartIcon />
            
            {!isMounted ? (
              <div className="opacity-0 w-20" />
            ) : isAuthenticated ? (
              <>
                <Link href="/profile" className="text-gray-700 hover:text-black">
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin" className="text-gray-700 hover:text-black">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Logout
                </button>
                <span className="text-gray-600">
                  Welcome, {user?.firstName || user?.username}
                </span>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-black">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-gray-600"
            >
              <span className="sr-only">Open menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={closeMenu}
            >
              Products
            </Link>
            {isMounted && isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout()
                    closeMenu()
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
