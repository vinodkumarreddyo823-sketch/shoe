/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { getDocFromServer, doc, setDoc, serverTimestamp, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth, googleProvider, facebookProvider } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ArrowRight, 
  Instagram, 
  Twitter, 
  Facebook,
  ChevronRight,
  Star,
  Sparkles,
  Loader2,
  Camera,
  Phone,
  MessageCircle,
  MapPin,
  Navigation,
  Clock,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  Check,
  User,
  LogOut,
  LogIn
} from 'lucide-react';

// Components
const Logo = ({ className = "", variant = "default" }: { className?: string, variant?: "default" | "dark" }) => {
  const isDark = variant === "dark";
  return (
    <div className={`flex items-center ${isDark ? 'bg-slate-900' : 'bg-[#38A844]'} p-2 md:p-3 rounded-lg shadow-sm ${className}`}>
      <div className="flex flex-col items-center mr-3 md:mr-4">
        {/* The "Flag" part */}
        <div className="bg-white px-2 md:px-3 py-0.5 md:py-1 rounded-sm transform -rotate-2 shadow-md relative">
          <div className="font-display text-[10px] md:text-[12px] font-black italic leading-none text-[#38A844] tracking-tight">FOOT</div>
          <div className="font-display text-[14px] md:text-[18px] font-black italic leading-none text-[#38A844] tracking-tighter">RUSH</div>
        </div>
        {/* Shoecare text */}
        <div className="text-[7px] md:text-[9px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-white mt-1 uppercase">Shoecare</div>
      </div>
      
      {/* The Ribbon/Shoe part */}
      <div className="relative w-10 h-10 md:w-14 md:h-14">
        <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          {/* The Loop */}
          <path d="M40,60 Q40,10 70,10 Q95,10 95,40 Q95,70 70,70" />
          {/* The Shoe Silhouette */}
          <path d="M70,70 L30,70 Q15,70 10,60 L5,50 Q2,45 10,40 L30,35 Q50,30 70,30" fill="currentColor" stroke="none" />
          {/* Shoe details */}
          <path d="M15,60 L25,60" stroke="white" strokeWidth="2" />
          <path d="M12,50 L22,50" stroke="white" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

// Types
interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  discount?: number;
  gender: 'Men' | 'Women' | 'Unisex' | 'Kids';
  sizes: string[];
  colors: string[];
  isPrime?: boolean;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: any;
}

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

const POPULAR_BRANDS = [
  { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
  { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
  { name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/en/4/45/Puma_Logo.svg' },
  { name: 'Reebok', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Reebok_2019_logo.svg' },
  { name: 'New Balance', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg' },
  { name: 'Vans', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Vans-logo.svg' },
  { name: 'Converse', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg' },
  { name: 'Asics', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Asics_Logo.svg' },
];

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "AeroMax Velocity",
    brand: "Nike",
    price: 13299,
    category: "Running",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    discount: 50,
    gender: 'Men',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Red', 'Black', 'White'],
    isPrime: true
  },
  {
    id: 2,
    name: "Urban Glide Pro",
    brand: "Puma",
    price: 10799,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    gender: 'Unisex',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['White', 'Grey', 'Blue']
  },
  {
    id: 3,
    name: "Trail Blazer X",
    brand: "New Balance",
    price: 15799,
    category: "Outdoor",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    discount: 70,
    gender: 'Men',
    sizes: ['8', '9', '10', '11'],
    colors: ['Grey', 'Black', 'Green'],
    isPrime: true
  },
  {
    id: 4,
    name: "Court King Elite",
    brand: "Adidas",
    price: 12499,
    category: "Basketball",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    gender: 'Men',
    sizes: ['9', '10', '11', '12'],
    colors: ['Blue', 'White', 'Black']
  },
  {
    id: 5,
    name: "Zenith Runner",
    brand: "Puma",
    price: 11200,
    category: "Running",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    discount: 80,
    gender: 'Women',
    sizes: ['5', '6', '7', '8'],
    colors: ['Pink', 'White', 'Black'],
    isPrime: true
  },
  {
    id: 6,
    name: "Nova Streetwear",
    brand: "Reebok",
    price: 9100,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600",
    rating: 4.4,
    discount: 50,
    gender: 'Women',
    sizes: ['6', '7', '8'],
    colors: ['White', 'Black', 'Grey']
  },
  {
    id: 7,
    name: "Summit Hiker",
    brand: "Timberland",
    price: 17400,
    category: "Outdoor",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=600",
    rating: 5.0,
    gender: 'Men',
    sizes: ['8', '9', '10', '11', '12'],
    colors: ['Brown', 'Black']
  },
  {
    id: 8,
    name: "Dunk Master",
    brand: "Puma",
    price: 14500,
    category: "Basketball",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    discount: 70,
    gender: 'Men',
    sizes: ['9', '10', '11'],
    colors: ['Black', 'Red', 'White']
  },
  {
    id: 9,
    name: "Classic Chuck 70",
    brand: "Converse",
    price: 6499,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    discount: 80,
    gender: 'Unisex',
    sizes: ['4', '5', '6', '7', '8', '9', '10', '11'],
    colors: ['White', 'Black', 'Red', 'Blue']
  },
  {
    id: 10,
    name: "Old Skool Core",
    brand: "Vans",
    price: 5999,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    gender: 'Unisex',
    sizes: ['4', '5', '6', '7', '8', '9', '10', '11'],
    colors: ['Black', 'White', 'Blue']
  },
  {
    id: 11,
    name: "Gel-Kayano 29",
    brand: "Asics",
    price: 14999,
    category: "Running",
    image: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    discount: 50,
    gender: 'Men',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Blue', 'Black', 'Grey']
  },
  {
    id: 12,
    name: "Club C 85",
    brand: "Reebok",
    price: 7999,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1512374382149-4332c6c02151?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    gender: 'Unisex',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['White', 'Black']
  },
  {
    id: 13,
    name: "Classic Polo Sneaker",
    brand: "U.S. Polo Assn.",
    price: 4599,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    rating: 4.4,
    gender: 'Men',
    sizes: ['7', '8', '9', '10'],
    colors: ['White', 'Blue', 'Black']
  },
  {
    id: 14,
    name: "Zixer Stealth X",
    brand: "Zixer",
    price: 3299,
    category: "Running",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600",
    rating: 4.2,
    discount: 50,
    gender: 'Men',
    sizes: ['8', '9', '10'],
    colors: ['Black', 'Grey']
  },
  {
    id: 15,
    name: "Atom Fusion 1.0",
    brand: "Atom",
    price: 5499,
    category: "Running",
    image: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    gender: 'Men',
    sizes: ['7', '8', '9', '10'],
    colors: ['White', 'Blue']
  },
  {
    id: 16,
    name: "Spring Edge Pro",
    brand: "Spring Edge",
    price: 6799,
    category: "Outdoor",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=600",
    rating: 4.3,
    discount: 70,
    gender: 'Men',
    sizes: ['8', '9', '10', '11'],
    colors: ['Green', 'Black']
  },
  {
    id: 17,
    name: "Disruptor II",
    brand: "Fila",
    price: 8999,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    gender: 'Women',
    sizes: ['5', '6', '7', '8'],
    colors: ['White', 'Pink']
  },
  {
    id: 18,
    name: "One Star Pro",
    brand: "Converse",
    price: 7499,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    gender: 'Unisex',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['Black', 'White']
  },
  {
    id: 28,
    name: "Ultra Boost 22",
    brand: "Adidas",
    price: 18999,
    category: "Running",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    gender: 'Men',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Black', 'White', 'Blue']
  },
  {
    id: 29,
    name: "Air Max 270",
    brand: "Nike",
    price: 13999,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    gender: 'Women',
    sizes: ['5', '6', '7', '8'],
    colors: ['White', 'Pink', 'Black']
  },
  {
    id: 30,
    name: "Classic Leather",
    brand: "Reebok",
    price: 6999,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1512374382149-4332c6c02151?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    gender: 'Unisex',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['White', 'Black']
  },
  {
    id: 31,
    name: "Sk8-Hi",
    brand: "Vans",
    price: 7499,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    gender: 'Unisex',
    sizes: ['4', '5', '6', '7', '8', '9', '10', '11'],
    colors: ['Black', 'White', 'Blue']
  },
  {
    id: 32,
    name: "Fresh Foam 1080",
    brand: "New Balance",
    price: 15999,
    category: "Running",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    gender: 'Men',
    sizes: ['8', '9', '10', '11', '12'],
    colors: ['Grey', 'Blue', 'Black']
  },
  {
    id: 33,
    name: "Cali Star",
    brand: "Puma",
    price: 8499,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    gender: 'Women',
    sizes: ['5', '6', '7', '8'],
    colors: ['White', 'Black']
  },
  {
    id: 38,
    name: "Junior Speedster",
    brand: "Nike",
    price: 4599,
    category: "Running",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    gender: 'Kids',
    sizes: ['1', '2', '3', '4', '5'],
    colors: ['Blue', 'Red', 'Black']
  },
  {
    id: 39,
    name: "Little Explorer Boots",
    brand: "Timberland",
    price: 6499,
    category: "Outdoor",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    gender: 'Kids',
    sizes: ['1', '2', '3', '4'],
    colors: ['Brown', 'Yellow']
  },
  {
    id: 40,
    name: "Kids' Classic Clog",
    brand: "Puma",
    price: 2499,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    gender: 'Kids',
    sizes: ['1', '2', '3'],
    colors: ['Blue', 'Pink', 'Yellow']
  },
  {
    id: 41,
    name: "Dino-Stomp Sneakers",
    brand: "Skechers",
    price: 3299,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    gender: 'Kids',
    sizes: ['1', '2', '3', '4'],
    colors: ['Green', 'Black']
  },
  {
    id: 43,
    name: "Red Tape Classic Casual",
    brand: "Red Tape",
    price: 3499,
    category: "Casual",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    gender: 'Men',
    sizes: ['7', '8', '9', '10'],
    colors: ['Brown', 'Black', 'Blue']
  },
  {
    id: 44,
    name: "Red Tape Urban Sneakers",
    brand: "Red Tape",
    price: 4299,
    category: "Sneakers",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    gender: 'Unisex',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['White', 'Black', 'Grey']
  },
  {
    id: 45,
    name: "Red Tape Pro Runner",
    brand: "Red Tape",
    price: 4899,
    category: "Running",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    gender: 'Men',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Blue', 'Black', 'Red']
  },
  {
    id: 46,
    name: "Red Tape Formal Derby",
    brand: "Red Tape",
    price: 5999,
    category: "Formal",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    gender: 'Men',
    sizes: ['7', '8', '9', '10'],
    colors: ['Black', 'Brown']
  },
  {
    id: 47,
    name: "Red Tape Suede Loafers",
    brand: "Red Tape",
    price: 4599,
    category: "Loafers",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    gender: 'Men',
    sizes: ['7', '8', '9', '10'],
    colors: ['Blue', 'Tan', 'Grey']
  },
  {
    id: 48,
    name: "Red Tape Party Wear Special",
    brand: "Red Tape",
    price: 6499,
    category: "Party Wear",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    gender: 'Men',
    sizes: ['7', '8', '9', '10'],
    colors: ['Black', 'Navy']
  },
  {
    id: 49,
    name: "Red Tape Pure White Sneakers",
    brand: "Red Tape",
    price: 3999,
    category: "Sneakers",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    gender: 'Unisex',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['White']
  },
  {
    id: 50,
    name: "Red Tape Premium Party Loafers",
    brand: "Red Tape",
    price: 7299,
    category: "Party Wear",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    gender: 'Men',
    sizes: ['7', '8', '9', '10'],
    colors: ['Black', 'Burgundy']
  },
  {
    id: 51,
    name: "Red Tape White Sport Pro",
    brand: "Red Tape",
    price: 4199,
    category: "Running",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    gender: 'Men',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White', 'Grey']
  },
  {
    id: 52,
    name: "Red Tape Casual White Slip-on",
    brand: "Red Tape",
    price: 2899,
    category: "Casual",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600",
    rating: 4.4,
    gender: 'Unisex',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['White']
  },
  {
    id: 53,
    name: "Comfort Flip Flops",
    brand: "Puma",
    price: 1299,
    category: "Casual",
    image: "https://images.unsplash.com/photo-1591117207239-78873ee5f747?auto=format&fit=crop&q=80&w=600",
    rating: 4.2,
    gender: 'Unisex',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['Blue', 'Black', 'Grey']
  },
  {
    id: 54,
    name: "Basic Canvas Sneakers",
    brand: "Vans",
    price: 999,
    category: "Sneakers",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600",
    rating: 4.1,
    gender: 'Unisex',
    sizes: ['5', '6', '7', '8', '9', '10'],
    colors: ['Black', 'White', 'Blue']
  },
  {
    id: 60,
    name: "Kids' Playtime Sandals",
    brand: "Skechers",
    price: 899,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=600",
    rating: 4.4,
    gender: 'Kids',
    sizes: ['1', '2', '3'],
    colors: ['Blue', 'Red']
  },
  {
    id: 62,
    name: "Red Tape Basic Flip Flops",
    brand: "Red Tape",
    price: 599,
    category: "Casual",
    image: "https://images.unsplash.com/photo-1591117207239-78873ee5f747?auto=format&fit=crop&q=80&w=600",
    rating: 4.2,
    gender: 'Men',
    sizes: ['7', '8', '9', '10'],
    colors: ['Black', 'Blue']
  },
  {
    id: 63,
    name: "Red Tape Premium Leather Formal",
    brand: "Red Tape",
    price: 8499,
    category: "Formal",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    gender: 'Men',
    sizes: ['7', '8', '9', '10'],
    colors: ['Black', 'Brown']
  },
  {
    id: 64,
    name: "Nike Air Max Pulse",
    brand: "Nike",
    price: 13999,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    gender: 'Unisex',
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: ['Black', 'White', 'Blue']
  },
  {
    id: 65,
    name: "Adidas Ultraboost Light",
    brand: "Adidas",
    price: 18999,
    category: "Running",
    image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    gender: 'Men',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White', 'Black']
  },
  {
    id: 66,
    name: "Puma Nitro Elite",
    brand: "Puma",
    price: 15999,
    category: "Running",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    gender: 'Women',
    sizes: ['5', '6', '7', '8'],
    colors: ['Pink', 'White']
  },
  {
    id: 67,
    name: "Red Tape Party Wear Brogues",
    brand: "Red Tape",
    price: 6999,
    category: "Party Wear",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    gender: 'Men',
    sizes: ['7', '8', '9', '10'],
    colors: ['Black', 'Tan']
  }
];

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleSocialLogin = async (provider: any) => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'user', // Default role
        createdAt: serverTimestamp()
      }, { merge: true });
      
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Error signing in:", error);
      // We don't throw here to avoid breaking the UI for simple login cancellations
      // But we could show a toast notification here
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAccountOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const ordersRef = collection(db, 'users', user.uid, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (isAccountOpen && user) {
      fetchOrders();
    }
  }, [isAccountOpen, user]);

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (cartItems.length === 0) return;

    setIsCheckingOut(true);
    try {
      const orderRef = doc(collection(db, 'users', user.uid, 'orders'));
      const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const finalAmount = totalAmount + (totalAmount > 12000 ? 0 : 499);
      
      await setDoc(orderRef, {
        items: cartItems,
        totalAmount: finalAmount,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setCartItems([]);
      setIsCartOpen(false);
      setIsAccountOpen(true);
      alert('Order placed successfully!');
    } catch (error) {
      console.error("Error placing order:", error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  const addToCart = (product: Product, size?: string, color?: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size && item.selectedColor === color)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number, size?: string, color?: string) => {
    setCartItems(prev => prev.filter(item => 
      !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: number, delta: number, size?: string, color?: string) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId && item.selectedSize === size && item.selectedColor === color) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => {
    const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
    return acc + price * item.quantity;
  }, 0);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [modalSize, setModalSize] = useState<string | null>(null);
  const [modalColor, setModalColor] = useState<string | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchReviews = async (productId: number) => {
    try {
      const reviewsRef = collection(db, 'products', productId.toString(), 'reviews');
      const q = query(reviewsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setProductReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const submitReview = async () => {
    if (!user || !selectedProduct || !newReviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const reviewsRef = collection(db, 'products', selectedProduct.id.toString(), 'reviews');
      await setDoc(doc(reviewsRef), {
        userId: user.uid,
        userName: user.email?.split('@')[0] || 'Anonymous',
        rating: newReviewRating,
        text: newReviewText.trim(),
        createdAt: serverTimestamp()
      });

      setNewReviewText('');
      setNewReviewRating(5);
      fetchReviews(selectedProduct.id);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalSize(product.sizes[0] || null);
    setModalColor(product.colors[0] || null);
    fetchReviews(product.id);
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 4);
    });
  };
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeGender, setActiveGender] = useState('All');
  const [activeBrand, setActiveBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [activeStore, setActiveStore] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [priceFilter, setPriceFilter] = useState<'All' | 'Under1000' | 'Above1000'>('All');
  const [activeSize, setActiveSize] = useState('All');
  const [activeColor, setActiveColor] = useState('All');
  const [showPrimeOnly, setShowPrimeOnly] = useState(false);

  const stores = [
    {
      id: 0,
      name: "Bangalore Flagship",
      address: "123, Brigade Road, Ashok Nagar, Bengaluru, Karnataka 560001",
      hours: "Mon - Sat: 10:00 AM - 9:00 PM",
      phone: "+91 90322 30204",
      lat: 12.9716,
      lng: 77.5946,
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1000"
    },
    {
      id: 1,
      name: "Mumbai Experience Center",
      address: "Linking Road, Bandra West, Mumbai, Maharashtra 400050",
      hours: "Mon - Sun: 11:00 AM - 10:00 PM",
      phone: "+91 90322 30204",
      lat: 19.0760,
      lng: 72.8777,
      image: "https://images.unsplash.com/photo-1560243563-062bff001d68?auto=format&fit=crop&q=80&w=1000"
    },
    {
      id: 2,
      name: "Delhi Street Hub",
      address: "Connaught Place, New Delhi, Delhi 110001",
      hours: "Mon - Sat: 10:30 AM - 9:30 PM",
      phone: "+91 90322 30204",
      lat: 28.6139,
      lng: 77.2090,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const sortedStores = [...stores].sort((a, b) => {
    if (!userLocation) return 0;
    const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
    const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
    return distA - distB;
  });

  const findNearestStore = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  };
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  const handleGenerateShoe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A professional studio product photograph of a futuristic sneaker, ${prompt}, high resolution, clean white background, cinematic lighting`,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeFilter === 'All' || p.category === activeFilter;
    const matchesGender = activeGender === 'All' || p.gender === activeGender || p.gender === 'Unisex';
    const matchesBrand = activeBrand === 'All' || p.brand === activeBrand;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = p.rating >= minRating;
    const matchesSale = !showSaleOnly || (p.discount !== undefined && p.discount > 0);
    const finalPrice = p.discount ? p.price * (1 - p.discount / 100) : p.price;
    const matchesPrice = priceFilter === 'All' || 
                        (priceFilter === 'Under1000' ? finalPrice <= 1000 : finalPrice > 1000);
    const matchesSize = activeSize === 'All' || p.sizes.includes(activeSize);
    const matchesColor = activeColor === 'All' || p.colors.includes(activeColor);
    const matchesPrime = !showPrimeOnly || p.isPrime;
    return matchesCategory && matchesGender && matchesBrand && matchesSearch && matchesRating && matchesSale && matchesPrice && matchesSize && matchesColor && matchesPrime;
  });

  const brandStats = Array.from(new Set(PRODUCTS.map(p => p.brand))).map(brand => {
    const brandProducts = PRODUCTS.filter(p => p.brand === brand);
    const avgRating = (brandProducts.reduce((acc, p) => acc + p.rating, 0) / brandProducts.length).toFixed(1);
    const minPrice = Math.min(...brandProducts.map(p => p.discount ? p.price * (1 - p.discount / 100) : p.price));
    return { brand, avgRating, minPrice };
  });

  return (
    <>
      <div className="min-h-screen bg-white font-sans text-slate-900">
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Top Bar */}
        <div className="bg-slate-900 text-white py-2 px-4 sm:px-6 lg:px-8 text-xs font-medium flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="tel:+919032230204" className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
              <Phone size={12} />
              <span>+91 90322 30204</span>
            </a>
            <a href="https://wa.me/919032230204" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
          <div className="hidden sm:block">
            Free shipping on orders over ₹12,000
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-sm font-medium hover:text-orange-600 transition-colors">Home</a>
              <a href="#shop" className="text-sm font-medium hover:text-orange-600 transition-colors">Shop</a>
              <a href="#location" className="text-sm font-medium hover:text-orange-600 transition-colors">Store Locator</a>
              <a href="#shoecare" className="text-sm font-medium hover:text-orange-600 transition-colors">Shoe Care</a>
              <a href="#" className="text-sm font-medium hover:text-orange-600 transition-colors">About</a>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden sm:flex items-center relative group">
                <Search size={18} className="absolute left-3 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shoes..."
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-orange-600/20 focus:bg-white transition-all w-40 md:w-64"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 p-1 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
              
              <button className="sm:hidden p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Search size={20} />
              </button>

              {user ? (
                <button 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors relative group"
                  onClick={() => setIsAccountOpen(true)}
                  title="My Account"
                >
                  <User size={20} />
                </button>
              ) : (
                <button 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors relative"
                  onClick={() => setIsAuthModalOpen(true)}
                  title="Sign In"
                >
                  <User size={20} />
                </button>
              )}

              <button 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors relative" 
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              <button 
                className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                <div className="px-3 py-3">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search shoes..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <a href="#" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md">Home</a>
                <a href="#shop" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md">Shop</a>
                <a href="#location" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md" onClick={() => setIsMenuOpen(false)}>Store Locator</a>
                <a href="#shoecare" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md">Shoe Care</a>
                <a href="#" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md">About</a>
                <a href="#" className="block px-3 py-2 text-base font-medium hover:bg-slate-50 rounded-md">Contact</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>

    <main className="pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
          {/* VKR Background Letters */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-[0.03]">
            <span className="font-display text-[40vw] font-black text-orange-900 tracking-tighter leading-none select-none">
              VKR
            </span>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl"
              >
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full mb-6 uppercase tracking-widest">
                  New Season Arrival
                </span>
                <h1 className="font-display text-5xl lg:text-8xl font-bold leading-tight mb-6 tracking-tight">
                  STEP INTO THE <span className="text-orange-600">FUTURE</span> OF COMFORT
                </h1>
                <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                  Experience the ultimate fusion of style and performance. Our new collection is engineered for those who never stop moving.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => addToCart(PRODUCTS[0], '9', 'Black')}
                    className="px-10 py-5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all flex items-center gap-2 group shadow-xl shadow-orange-200"
                  >
                    Buy Now
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => {
                      const shopSection = document.getElementById('shop');
                      if (shopSection) shopSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-10 py-5 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    Shop Collection
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Shoe Spotlight */}
        <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
          <div className="flex items-center whitespace-nowrap animate-marquee">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 mx-8">
                <span className="text-4xl font-display font-black text-slate-100 uppercase tracking-tighter">Trending Now</span>
                <span className="text-4xl font-display font-black text-orange-600 uppercase tracking-tighter italic">AeroMax Velocity</span>
                <span className="text-4xl font-display font-black text-slate-100 uppercase tracking-tighter">Trending Now</span>
                <span className="text-4xl font-display font-black text-slate-900 uppercase tracking-tighter italic">Urban Glide Pro</span>
              </div>
            ))}
          </div>
        </section>
        <section id="shop" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Popular Brands */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold italic">POPULAR BRANDS</h2>
              <button 
                onClick={() => setActiveBrand('All')}
                className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {POPULAR_BRANDS.map(brand => (
                <button
                  key={brand.name}
                  onClick={() => setActiveBrand(brand.name === activeBrand ? 'All' : brand.name)}
                  className={`p-6 rounded-2xl border transition-all flex items-center justify-center aspect-square group ${
                    activeBrand === brand.name 
                      ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/20' 
                      : 'bg-white border-slate-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-900/5'
                  }`}
                >
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className={`max-w-full max-h-full object-contain transition-all ${
                      activeBrand === brand.name 
                        ? 'brightness-0 invert opacity-100 scale-110' 
                        : 'opacity-50 group-hover:opacity-100 group-hover:scale-110'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Brand Overview / Rates */}
          <div className="mb-16">
            <h2 className="font-display text-2xl font-bold mb-8 italic">BRAND SPOTLIGHT</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {brandStats.map(stat => (
                <div 
                  key={stat.brand}
                  className={`p-4 rounded-2xl border transition-all group cursor-pointer ${
                    activeBrand === stat.brand 
                      ? 'bg-orange-600 border-orange-600 text-white' 
                      : 'bg-slate-50 border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 text-slate-900'
                  }`}
                  onClick={() => setActiveBrand(stat.brand === activeBrand ? 'All' : stat.brand)}
                >
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${activeBrand === stat.brand ? 'text-orange-100' : 'text-slate-400'}`}>Brand</p>
                  <h3 className={`font-bold text-sm mb-2 transition-colors ${activeBrand === stat.brand ? 'text-white' : 'group-hover:text-orange-600'}`}>{stat.brand}</h3>
                  <div className={`flex items-center justify-between mt-auto pt-2 border-t ${activeBrand === stat.brand ? 'border-orange-500' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-1">
                      <Star size={10} className={`fill-orange-400 text-orange-400 ${activeBrand === stat.brand ? 'fill-white text-white' : ''}`} />
                      <span className="text-[10px] font-black">{stat.avgRating}</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-[8px] uppercase font-bold ${activeBrand === stat.brand ? 'text-orange-100' : 'text-slate-400'}`}>Starts at</p>
                      <p className={`text-[10px] font-black ${activeBrand === stat.brand ? 'text-white' : 'text-orange-600'}`}>₹{stat.minPrice.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flash Sale Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 bg-orange-600 rounded-3xl p-8 text-white relative overflow-hidden group"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">Limited Time</span>
                  <div className="flex items-center gap-1 text-orange-200">
                    <Sparkles size={14} className="animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Flash Sale</span>
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">UP TO 80% OFF<br />ON SELECT STYLES</h2>
                <p className="text-orange-100 max-w-md mb-8">Grab your favorite kicks at unbeatable prices. From performance runners to street classics, the sale is live now.</p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setShowSaleOnly(true)}
                    className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all flex items-center gap-2 shadow-lg shadow-orange-900/20"
                  >
                    Shop the Sale <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => addToCart(PRODUCTS[0], '9', 'Black')}
                    className="px-8 py-4 bg-orange-900/30 backdrop-blur-md text-white border border-white/20 font-bold rounded-xl hover:bg-orange-900/50 transition-all"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-square flex items-center justify-center">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <img 
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" 
                  alt="Flash Sale" 
                  className="relative z-10 w-full h-full object-contain -rotate-12 group-hover:rotate-0 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          </motion.div>

          {/* Red Tape Spotlight */}
          <div className="mb-16 bg-slate-900 rounded-3xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-orange-600 text-white text-[10px] font-black rounded-full mb-4 uppercase tracking-widest">
                  Brand Spotlight
                </span>
                <h2 className="text-4xl font-black mb-4">RED TAPE</h2>
                <p className="text-slate-400 max-w-md mb-8">Discover the latest collection from Red Tape. From casual sneakers to formal classics, we've got you covered.</p>
                <div className="flex flex-wrap gap-3">
                  {['Casual', 'Sneakers', 'Running', 'Formal', 'Loafers', 'Party Wear'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => {
                        setActiveBrand('Red Tape');
                        setActiveFilter(cat);
                        const shopSection = document.getElementById('shop');
                        if (shopSection) shopSection.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-orange-600 border border-white/10 rounded-xl text-xs font-bold transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                  <button 
                    onClick={() => {
                      setActiveBrand('Red Tape');
                      setSearchQuery('white');
                      const shopSection = document.getElementById('shop');
                      if (shopSection) shopSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-white text-slate-900 hover:bg-orange-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    White Collection
                  </button>
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <img 
                  src="https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800"
                  alt="Red Tape Spotlight"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">Featured Drops</h2>
              <p className="text-slate-500">Handpicked styles for your daily rotation</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Category:</span>
                {['All', 'Running', 'Lifestyle', 'Outdoor', 'Basketball', 'Apparel', 'Casual', 'Sneakers', 'Formal', 'Loafers', 'Party Wear'].map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeFilter === category 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Gender:</span>
                {['All', 'Men', 'Women', 'Kids'].map(gender => (
                  <button
                    key={gender}
                    onClick={() => setActiveGender(gender)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeGender === gender 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Brand:</span>
                {['All', ...Array.from(new Set(PRODUCTS.map(p => p.brand)))].map(brand => (
                  <button
                    key={brand}
                    onClick={() => setActiveBrand(brand)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeBrand === brand 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Price:</span>
                <button
                  onClick={() => setPriceFilter('All')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    priceFilter === 'All' 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPriceFilter('Under1000')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    priceFilter === 'Under1000' 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  Under ₹1000
                </button>
                <button
                  onClick={() => setPriceFilter('Above1000')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    priceFilter === 'Above1000' 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  Above ₹1000
                </button>
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Size:</span>
                {['All', '6', '7', '8', '9', '10', '11', 'S', 'M', 'L', 'XL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setActiveSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      activeSize === size 
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Color:</span>
                {['All', 'White', 'Black', 'Blue', 'Red', 'Grey', 'Green', 'Orange'].map(color => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                      activeColor === color 
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {color !== 'All' && (
                      <span 
                        className="w-2 h-2 rounded-full border border-white/20" 
                        style={{ backgroundColor: color.toLowerCase() }} 
                      />
                    )}
                    {color}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Min Rating:</span>
                {[0, 3, 4].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      minRating === rating 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {rating === 0 ? 'Any' : (
                      <>
                        {rating}+ <Star size={10} className={minRating === rating ? 'fill-white text-white' : 'fill-slate-400 text-slate-400'} />
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Offers:</span>
                <button
                  onClick={() => setShowSaleOnly(!showSaleOnly)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    showSaleOnly 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles size={10} className={showSaleOnly ? 'text-white' : 'text-orange-600'} />
                  Sale Only
                </button>
                <button
                  onClick={() => setShowPrimeOnly(!showPrimeOnly)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    showPrimeOnly 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <Check size={10} className={showPrimeOnly ? 'text-white' : 'text-blue-600'} />
                  Prime
                </button>
              </div>

              {(activeFilter !== 'All' || activeGender !== 'All' || activeBrand !== 'All' || searchQuery !== '' || minRating !== 0 || showSaleOnly || showPrimeOnly || activeSize !== 'All' || activeColor !== 'All') && (
                <button 
                  onClick={() => {
                    setActiveFilter('All');
                    setActiveGender('All');
                    setActiveBrand('All');
                    setSearchQuery('');
                    setMinRating(0);
                    setShowSaleOnly(false);
                    setShowPrimeOnly(false);
                    setActiveSize('All');
                    setActiveColor('All');
                  }}
                  className="text-[10px] font-bold text-orange-600 uppercase tracking-widest hover:underline text-right"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      handleViewProduct(product);
                    }}
                  >
                  <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-4">
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                      {product.discount && (
                        <div className="bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg w-fit">
                          {product.discount}% OFF
                        </div>
                      )}
                      {product.isPrime && (
                        <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 w-fit">
                          <Check size={10} /> PRIME
                        </div>
                      )}
                    </div>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, product.sizes[0], product.colors[0]);
                        }}
                        className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors shadow-lg shadow-orange-900/20"
                      >
                        Buy Now
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProduct(product);
                        }}
                        className="px-4 bg-white/90 backdrop-blur-sm py-3 rounded-xl font-bold text-sm hover:bg-white transition-colors text-slate-900"
                      >
                        <Search size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">{product.brand}</p>
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 rounded text-[8px] font-bold">
                          <Star size={8} className="fill-orange-400 text-orange-400" />
                          <span>{product.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{product.category}</p>
                        <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-bold uppercase">{product.gender}</span>
                      </div>
                      <h3 className="font-bold group-hover:text-orange-600 transition-colors">{product.name}</h3>
                    </div>
                    <div className="text-right">
                      {product.discount ? (
                        <>
                          <p className="font-bold text-orange-600">₹{(product.price * (1 - product.discount / 100)).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-slate-400 line-through">₹{product.price.toLocaleString('en-IN')}</p>
                        </>
                      ) : (
                        <p className="font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-24 text-center"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('All');
                    setActiveGender('All');
                    setActiveBrand('All');
                    setMinRating(0);
                    setShowSaleOnly(false);
                    setShowPrimeOnly(false);
                    setActiveSize('All');
                    setActiveColor('All');
                  }}
                  className="mt-6 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>

          {/* Recently Viewed Products */}
          {recentlyViewed.length > 0 && (
            <div className="mt-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-2xl font-bold italic">RECENTLY VIEWED</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                {recentlyViewed.map((product) => (
                  <motion.div
                    key={`recent-${product.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                    onClick={() => handleViewProduct(product)}
                  >
                    <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-4">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">{product.brand}</p>
                      </div>
                      <h3 className="font-bold text-sm group-hover:text-orange-600 transition-colors truncate">{product.name}</h3>
                      <p className="text-sm font-black mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Limited Edition Spotlight */}
        <section className="py-24 bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[20vw] font-black text-white whitespace-nowrap">
              LIMITED EDITION • LIMITED EDITION • LIMITED EDITION
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-white"
              >
                <span className="inline-block px-3 py-1 bg-orange-600 text-white text-[10px] font-bold rounded-full mb-6 uppercase tracking-widest">
                  Exclusive Drop
                </span>
                <h2 className="font-display text-5xl lg:text-7xl font-bold mb-8 leading-tight tracking-tighter">
                  THE <span className="text-orange-600 italic">VORTEX</span> <br />
                  PHANTOM G1
                </h2>
                <p className="text-slate-400 text-lg mb-10 max-w-md leading-relaxed">
                  Our most advanced silhouette yet. Featuring a reactive carbon-fiber sole and a seamless 3D-knit upper that adapts to your every move. Only 500 pairs worldwide.
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-3xl font-bold text-white">₹24,900</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Retail Price</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => addToCart({
                        id: 999,
                        name: "Vortex Phantom G1",
                        brand: "Vortex",
                        price: 24900,
                        category: "Limited Edition",
                        image: "https://images.unsplash.com/photo-1512374382149-4332c6c02151?auto=format&fit=crop&q=80&w=1000",
                        rating: 5.0,
                        gender: 'Men',
                        sizes: ['8', '9', '10', '11'],
                        colors: ['Black', 'Silver']
                      }, '10', 'Black')}
                      className="px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-900/40"
                    >
                      Buy Now
                    </button>
                    <button 
                      onClick={() => alert('You have been added to the waitlist!')}
                      className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 group"
                    >
                      Join the Waitlist
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-orange-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <img 
                  src="https://images.unsplash.com/photo-1512374382149-4332c6c02151?auto=format&fit=crop&q=80&w=1000" 
                  alt="Vortex Phantom G1" 
                  className="relative z-10 w-full h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] -rotate-12 hover:rotate-0 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Editorial Lookbook */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold mb-4 italic tracking-tighter">THE LOOKBOOK</h2>
              <p className="text-slate-500">Visual inspiration for your next step</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[800px]">
              <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-3xl">
                <img 
                  src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Lookbook 1"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <p className="text-white font-display text-2xl font-bold">Urban Exploration</p>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-3xl">
                <img 
                  src="https://images.unsplash.com/photo-1512374382149-4332c6c02151?auto=format&fit=crop&q=80&w=600" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Lookbook 2"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative group overflow-hidden rounded-3xl">
                <img 
                  src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=600" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Lookbook 3"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="col-span-2 relative group overflow-hidden rounded-3xl">
                <img 
                  src="https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Lookbook 4"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </section>

        {/* High-Res Shoe Gallery */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="font-display text-4xl font-bold mb-2">SHOE GALLERY</h2>
                <p className="text-slate-500">A closer look at the details that matter.</p>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                <span>01 / 04</span>
                <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-orange-600"></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                whileHover={{ y: -10 }}
                className="aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  alt="Gallery 1"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <motion.div 
                whileHover={{ y: -10 }}
                className="aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  alt="Gallery 2"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <motion.div 
                whileHover={{ y: -10 }}
                className="aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  alt="Gallery 3"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Shoe Care Section (Based on Image) */}
        <section id="shoecare" className="bg-[#38A844] py-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[30vw] font-black text-white whitespace-nowrap">
              SHOECARE
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1 flex justify-center">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative z-10 bg-white/10 backdrop-blur-md p-12 rounded-[4rem] border border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-700">
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-8 rounded-3xl shadow-xl mb-8 transform -rotate-3">
                      <div className="font-display text-4xl font-black italic leading-none text-[#38A844]">FOOT</div>
                      <div className="font-display text-6xl font-black italic leading-none text-[#38A844]">RUSH</div>
                      <div className="text-xl font-bold tracking-[0.4em] text-[#38A844] mt-4 uppercase border-t-4 border-[#38A844] pt-2 text-center">Shoecare</div>
                    </div>
                    <svg viewBox="0 0 100 100" className="w-48 h-48 text-white" fill="currentColor">
                      <path d="M10,70 L60,70 Q75,70 85,60 L95,50 Q98,45 95,40 L85,35 Q75,30 60,30 L20,30 Q10,30 10,40 Z" />
                      <path d="M40,30 Q40,5 65,5 Q90,5 90,35 Q90,65 65,65" fill="none" stroke="currentColor" strokeWidth="8" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-white order-1 lg:order-2">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-12 h-1 bg-white rounded-full"></div>
                  <span className="font-bold tracking-widest uppercase text-sm">Premium Protection</span>
                </div>
                <h2 className="font-display text-5xl lg:text-7xl font-bold mb-8 leading-tight">
                  THE ART OF <br />
                  <span className="italic text-orange-400">SHOE PRESERVATION</span>
                </h2>
                <p className="text-white/80 text-lg mb-10 max-w-md leading-relaxed">
                  Our specialized Shoecare division uses advanced formulas to ensure your investment stays pristine. From deep cleaning to nano-tech waterproofing.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-10 py-5 bg-white text-[#38A844] font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-2 group">
                    Explore Kits
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-10 py-5 bg-transparent border border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                    Watch Tutorial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Shoe Designer */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-orange-500 mb-6">
                    <Sparkles size={24} />
                    <span className="font-bold tracking-widest uppercase text-sm">AI Innovation</span>
                  </div>
                  <h2 className="font-display text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                    DESIGN YOUR <br />
                    <span className="text-orange-600">DREAM SNEAKER</span>
                  </h2>
                  <p className="text-slate-400 text-lg mb-10 max-w-md">
                    Describe your perfect pair of shoes, and our AI will bring your vision to life in seconds.
                  </p>
                  
                  <form onSubmit={handleGenerateShoe} className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Neon green running shoe with carbon fiber details"
                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-600 transition-all"
                      />
                      <Camera className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                    </div>
                    <button 
                      disabled={isGenerating}
                      className="w-full py-5 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Generating Vision...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Generate My Shoe
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="relative aspect-square">
                  <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-[2rem]"></div>
                  <div className="absolute inset-4 bg-slate-800 rounded-[1.5rem] overflow-hidden flex items-center justify-center">
                    {generatedImage ? (
                      <motion.img 
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={generatedImage} 
                        alt="Generated Shoe" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Sparkles className="text-slate-600" size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">Your creation will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Store Location Section */}
        <section id="location" className="py-24 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="font-display text-4xl font-bold mb-4">OUR LOCATIONS</h2>
                <p className="text-slate-500 text-lg">Find the nearest Foot Rush store and experience the heat.</p>
              </div>
              <button 
                onClick={findNearestStore}
                className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all flex items-center gap-2"
              >
                <Navigation size={18} />
                Find Nearest Store
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {sortedStores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveStore(store.id)}
                  className={`cursor-pointer group p-6 rounded-3xl transition-all border-2 ${
                    activeStore === store.id 
                      ? 'bg-white border-orange-600 shadow-xl' 
                      : 'bg-white/50 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeStore === store.id ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <MapPin size={24} />
                    </div>
                    {userLocation && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                        {calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng).toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{store.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">{store.address}</p>
                  
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <Clock size={14} className="text-orange-600" />
                      <span>{store.hours}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <Phone size={14} className="text-orange-600" />
                      <span>{store.phone}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white p-8 md:p-12 rounded-[3rem] shadow-sm">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                    Active Store
                  </div>
                  <h2 className="font-display text-4xl font-bold mb-4 uppercase">{stores[activeStore].name}</h2>
                  <p className="text-slate-500 text-lg">Our flagship experience in {stores[activeStore].name.split(' ')[0]}. Expert staff, exclusive drops, and professional shoecare services.</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stores[activeStore].address)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    Get Directions <ArrowRight size={18} />
                  </a>
                  <button className="px-8 py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all">
                    Check Store Inventory
                  </button>
                </div>
              </div>
              
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeStore}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    src={stores[activeStore].image} 
                    alt={stores[activeStore].name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <p className="text-sm font-bold uppercase tracking-widest text-orange-400 mb-2">Experience Center</p>
                    <h3 className="text-2xl font-bold">The Heart of the Rush</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-slate-900 py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-6">JOIN THE RUSH</h2>
            <p className="text-slate-400 mb-10 text-lg">Subscribe to get early access to drops, exclusive discounts, and the latest news in footwear.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-600 transition-colors"
              />
              <button className="px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Logo variant="dark" />
              <p className="text-slate-500 leading-relaxed">
                Redefining the way you move. Premium footwear for the modern athlete and style enthusiast.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="p-2 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 rounded-full transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="p-2 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 rounded-full transition-all">
                  <Twitter size={20} />
                </a>
                <a href="#" className="p-2 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 rounded-full transition-all">
                  <Facebook size={20} />
                </a>
                <a href="https://wa.me/15550000000" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-green-50 hover:text-green-600 rounded-full transition-all">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
              <div className="pt-4 space-y-2">
                <a href="tel:+919032230204" className="flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors text-sm">
                  <Phone size={16} />
                  <span>+91 90322 30204</span>
                </a>
                <div className="flex items-start gap-2 text-slate-500 text-sm">
                  <MapPin size={16} className="mt-1 flex-shrink-0" />
                  <span>123, Brigade Road, Ashok Nagar, Bengaluru, Karnataka 560001</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-400">Shop</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">New Arrivals</a></li>
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">Best Sellers</a></li>
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">Running Shoes</a></li>
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">Lifestyle</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-400">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">Help Center</a></li>
                <li><a href="#location" className="text-slate-600 hover:text-orange-600 transition-colors">Store Locator</a></li>
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">Shipping Info</a></li>
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">Returns</a></li>
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">Order Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-400">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">Sustainability</a></li>
                <li><a href="#" className="text-slate-600 hover:text-orange-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© 2026 Foot Rush Inc. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
            </div>
          </div>
        </div>
      </footer>

      {/* Product Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="grid md:grid-cols-2">
                <div className="aspect-square bg-slate-100">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8 sm:p-12 flex flex-col">
                  <div className="mb-auto">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {selectedProduct.brand}
                      </span>
                      <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold">
                        <Star size={10} className="fill-orange-400 text-orange-400" />
                        <span>Brand Rating: {brandStats.find(s => s.brand === selectedProduct.brand)?.avgRating}</span>
                      </div>
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {selectedProduct.category}
                      </span>
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {selectedProduct.gender}
                      </span>
                      {selectedProduct.isPrime && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                          <Check size={10} /> PRIME
                        </span>
                      )}
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={i < Math.floor(selectedProduct.rating) ? "fill-orange-400 text-orange-400" : "text-slate-200"} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-slate-400">({selectedProduct.rating} Rating)</span>
                    </div>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                      Engineered for maximum performance and unparalleled style. This model features our latest cushioning technology and a breathable mesh upper for all-day comfort.
                    </p>
                    
                    <div className="mb-8">
                      <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Select Size</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map(size => (
                          <button 
                            key={size} 
                            onClick={() => setModalSize(size)}
                            className={`w-14 h-12 border rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                              modalSize === size ? 'border-orange-600 text-orange-600 bg-orange-50' : 'border-slate-200 hover:border-orange-600 hover:text-orange-600'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Select Color</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map(color => (
                          <button 
                            key={color} 
                            onClick={() => setModalColor(color)}
                            className={`px-4 py-2 border rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
                              modalColor === color ? 'border-orange-600 text-orange-600 bg-orange-50' : 'border-slate-200 hover:border-orange-600 hover:text-orange-600'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: color.toLowerCase() }} />
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                    <div className="flex flex-col">
                      {selectedProduct.discount ? (
                        <>
                          <span className="text-3xl font-bold text-orange-600">₹{(selectedProduct.price * (1 - selectedProduct.discount / 100)).toLocaleString('en-IN')}</span>
                          <span className="text-sm text-slate-400 line-through">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-orange-600">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => {
                          addToCart(selectedProduct, modalSize || undefined, modalColor || undefined);
                          setSelectedProduct(null);
                        }}
                        className="w-full px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                      >
                        Buy Now
                      </button>
                      <button 
                        onClick={() => {
                          addToCart(selectedProduct, modalSize || undefined, modalColor || undefined);
                          setSelectedProduct(null);
                        }}
                        className="w-full px-8 py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        Add to Cart
                      </button>
                      <button 
                        onClick={() => {
                          alert(`Reserved for pickup at ${stores[activeStore].name}!`);
                          setSelectedProduct(null);
                        }}
                        className="w-full px-8 py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                        <MapPin size={18} className="text-orange-600" />
                        Pick up in Store
                      </button>
                    </div>
                  </div>
                  
                  {/* Reviews Section */}
                  <div className="mt-12 pt-12 border-t border-slate-100">
                    <h3 className="text-2xl font-bold mb-8">Customer Reviews</h3>
                    
                    {user ? (
                      <div className="bg-slate-50 p-6 rounded-2xl mb-8">
                        <h4 className="font-bold mb-4">Write a Review</h4>
                        <div className="flex gap-2 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setNewReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <Star 
                                size={24} 
                                className={star <= newReviewRating ? "fill-orange-400 text-orange-400" : "text-slate-300 hover:text-orange-300"} 
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          placeholder="What did you think about this product?"
                          className="w-full p-4 rounded-xl border border-slate-200 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-none h-24"
                        />
                        <button
                          onClick={submitReview}
                          disabled={isSubmittingReview || !newReviewText.trim()}
                          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSubmittingReview ? <Loader2 size={18} className="animate-spin" /> : null}
                          Submit Review
                        </button>
                      </div>
                    ) : (
                      <div className="bg-orange-50 p-6 rounded-2xl mb-8 flex items-center justify-between">
                        <p className="text-orange-800 font-medium">Sign in to leave a review</p>
                        <button 
                          onClick={() => setIsAuthModalOpen(true)}
                          className="px-6 py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-100 transition-colors"
                        >
                          Sign In
                        </button>
                      </div>
                    )}

                    <div className="space-y-6">
                      {productReviews.length > 0 ? (
                        productReviews.map((review) => (
                          <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-900">{review.userName}</span>
                              <span className="text-sm text-slate-500">
                                {review.createdAt?.toDate ? new Date(review.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                              </span>
                            </div>
                            <div className="flex gap-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  className={i < review.rating ? "fill-orange-400 text-orange-400" : "text-slate-200"} 
                                />
                              ))}
                            </div>
                            <p className="text-slate-600 leading-relaxed">{review.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No reviews yet. Be the first to review this product!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    {/* Cart Drawer */}
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-orange-600" />
                <h2 className="text-xl font-bold">Your Cart</h2>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-500">{cartCount} items</span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length > 0 ? (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                      <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-sm truncate pr-2">{item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{item.brand} • {item.category}</p>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mb-2">
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                            {item.selectedSize && item.selectedColor && ' • '}
                            {item.selectedColor && `Color: ${item.selectedColor}`}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, -1, item.selectedSize, item.selectedColor)}
                              className="p-1.5 hover:bg-slate-50 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 text-xs font-bold w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1, item.selectedSize, item.selectedColor)}
                              className="p-1.5 hover:bg-slate-50 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="font-bold text-orange-600">
                            ₹{((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={32} className="text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
                  <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">{cartTotal > 12000 ? 'FREE' : '₹499'}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-black text-orange-600">₹{(cartTotal + (cartTotal > 12000 ? 0 : 499)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Checkout Now
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Account Sidebar */}
    <AnimatePresence>
      {isAccountOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAccountOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <User className="text-orange-600" />
                <h2 className="text-xl font-bold">My Account</h2>
              </div>
              <button 
                onClick={() => setIsAccountOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {user && (
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Logged in as</p>
                  <p className="font-bold text-slate-900 truncate">{user.email}</p>
                  <button 
                    onClick={handleLogout}
                    className="mt-4 flex items-center gap-2 text-sm text-red-600 font-medium hover:text-red-700 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}

              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShoppingBag size={18} className="text-slate-400" />
                Order History
              </h3>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm font-medium">
                            {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded bg-slate-100" />
                            <div className="flex-1">
                              <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Total</span>
                        <span className="font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500">No orders found.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Auth Modal */}
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            onClick={() => setIsAuthModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <Logo variant="dark" />
                <button 
                  onClick={() => setIsAuthModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome to Foot Rush</h2>
                <p className="text-slate-500">Sign in to save your cart and track orders.</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleSocialLogin(googleProvider)}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Continue with Google
                </button>

                <button
                  onClick={() => handleSocialLogin(facebookProvider)}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#1877F2] text-white rounded-xl font-semibold hover:bg-[#166FE5] transition-all disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  Continue with Facebook
                </button>
              </div>

              <div className="mt-8 text-center text-sm text-slate-500">
                By continuing, you agree to our <a href="#" className="text-orange-600 hover:underline">Terms of Service</a> and <a href="#" className="text-orange-600 hover:underline">Privacy Policy</a>.
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
