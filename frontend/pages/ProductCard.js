"use client"


import Image from "next/image"
import { useDispatch } from "react-redux"
import { addToCart } from "../store/cartSlice"


export default function ProductCard({ id, _id, title, price, description, category, image, primaryImage, images, rating }) {
  const dispatch = useDispatch();
  
  // Use the first available image source
  const imageUrl = image || primaryImage || (images && images[0] && images[0].url) || "/images/placeholder.jpg";
  
  // Use _id if available, otherwise use id
  const productId = _id || id;

  const handleAddToCart = () => {
    dispatch(addToCart({ 
      _id: productId,
      id: productId,
      name: title,
      title: title,
      price, 
      image: imageUrl, 
      quantity: 1 
    }));
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="absolute right-2 top-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded capitalize">
          {category}
        </span>
      </div>
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="line-clamp-2 text-lg font-semibold">{title}</h3>
        <p className="mt-2 line-clamp-2 text-gray-600">{description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">${Number(price).toFixed(2)}</span>
          {rating && (
            <div className="flex items-center gap-1 text-sm text-yellow-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"/></svg>
              <span className="font-medium">{rating.rate}</span>
              <span className="text-xs">({rating.count})</span>
            </div>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          data-slot="button"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-black text-white shadow-xs hover:bg-zinc-900 h-9 px-4 py-2 has-[>svg]:px-3 w-full gap-2 mt-4"
          aria-label={`Add ${title} to cart`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart h-4 w-4" aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
