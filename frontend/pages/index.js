import { useState, useEffect } from 'react'
import Navbar from "../components/Navbar"
import ProductCard from "./ProductCard"
import Image from "next/image"
import api from '../utils/api'

export const metadata = {
  title: "Isaks Store - Premium Products",
  description: "Shop the latest electronics and accessories at Isaks Store",
}

export default function Page() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all products for home page
        const response = await api.get('/api/products', {
          params: { all: true }
        });
        // Products are in response.data.data.products
        const productsData = response.data.data.products;
        if (!Array.isArray(productsData)) {
          throw new Error('Invalid response format');
        }
        
        const normalizedProducts = productsData.map(p => ({
          ...p,
          _id: p.id || p._id,
          name: p.title || p.name,
          image: p.image || p.primaryImage || (p.images && p.images[0] && p.images[0].url) || "/images/placeholder.jpg"
        }));
        
        // Define priority products that should appear first
        const priorityProducts = [
          'Smart Fitness Watch',
          'Leather Messenger Bag',
          'Portable Bluetooth Speaker',
          'Premium Wireless Headphones',
          'Minimalist Wallet',
          'Wireless Charging Pad', 
          'Stainless Steel Water Bottle',
          'USB-C Hub Adapter'
        ];
        
        // Sort products with priority products first, then by newest
        const sortedProducts = normalizedProducts.sort((a, b) => {
          const aTitle = a.title || a.name || '';
          const bTitle = b.title || b.name || '';
          
          const aPriority = priorityProducts.indexOf(aTitle);
          const bPriority = priorityProducts.indexOf(bTitle);
          
          // If both are priority products, sort by priority order
          if (aPriority !== -1 && bPriority !== -1) {
            return aPriority - bPriority;
          }
          
          // If only one is priority, priority comes first
          if (aPriority !== -1) return -1;
          if (bPriority !== -1) return 1;
          
          // For non-priority products, sort by createdAt desc
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          
          // Fallback to id sorting if no createdAt
          return (b.id || b._id).toString().localeCompare((a.id || a._id).toString());
        });
        
        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to Isaks Store
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              Discover premium electronics and accessories curated for quality and style
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} {...product} />
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <span className="text-sm text-muted-foreground">Developed by Yoseph.Dev</span>
            <div className="relative h-8 w-32">
              <Image src="/isakstore.jpg" alt="Isaks Store Logo" fill className="object-contain" sizes="128px" />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Isaks Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
