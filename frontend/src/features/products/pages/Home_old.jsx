import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { useNavigate, useSearchParams } from 'react-router';

const Home = () => {
    const products = useSelector(state => state.product.products);
    const user = useSelector(state => state.auth.user);
    const { handleGetAllProducts } = useProduct();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || "";
    
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [itemsToShow, setItemsToShow] = useState(8);
    const [animatingIndices, setAnimatingIndices] = useState(new Set());
    const [currentSlide, setCurrentSlide] = useState(0);
    const observerTarget = useRef(null);
    const itemsPerPage = 8;

    // Hero carousel slides
    const heroSlides = [
        {
            title: 'SHIRTS',
            subtitle: 'Premium Collection',
            cta: 'STARTING AT ₹899',
            image: '/ascend_editorial_warm.png',
            color: '#f5f3f0'
        },
        {
            title: 'THE NEVER RUN-OUT COLLECTION',
            subtitle: 'Timeless Essentials',
            cta: 'EXPLORE NOW',
            image: '/ascend_editorial_warm.png',
            color: '#e8e4df'
        },
        {
            title: 'SUMMER VIBES',
            subtitle: 'Cool & Casual',
            cta: 'SHOP COLLECTION',
            image: '/ascend_editorial_warm.png',
            color: '#f5f3f0'
        }
    ];

    // Initialize products on load
    useEffect(() => {
        handleGetAllProducts(query);
    }, [query]);

    // Auto-rotate carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Setup infinite scroll with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && displayedProducts.length > 0) {
                setItemsToShow(prev => prev + itemsPerPage);
            }
        }, { threshold: 0.1 });

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [displayedProducts.length]);

    // Update displayed products when products change
    useEffect(() => {
        if (products && products.length > 0) {
            setDisplayedProducts(products);
            setItemsToShow(8);
        }
    }, [products]);

    // Trigger animation for new items on scroll
    useEffect(() => {
        const newIndices = new Set();
        for (let i = 0; i < Math.min(itemsToShow, displayedProducts.length); i++) {
            newIndices.add(i);
        }
        setAnimatingIndices(newIndices);
    }, [itemsToShow, displayedProducts.length]);

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    const handlePrevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    const handleNextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    };

    const visibleProducts = displayedProducts.slice(0, itemsToShow);

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <style>{`
                @keyframes slideFromRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slide-left {
                    animation: slideFromRight 0.8s ease-out forwards;
                }

                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }

                .animate-slide-in-up {
                    animation: slideInUp 0.8s ease-out forwards;
                }

                .carousel-slide {
                    animation: fadeIn 0.8s ease-in-out;
                }

                .carousel-nav-btn {
                    transition: all 0.3s ease;
                }

                .carousel-nav-btn:hover {
                    background-color: #C9A96E !important;
                    color: white;
                }
            `}</style>

            <div
                className="min-h-screen selection:bg-[#C9A96E]/30"
                style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
            >
                {/* ── HERO CAROUSEL ── */}
                <div className="relative w-full h-screen overflow-hidden">
                    {heroSlides.map((slide, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                idx === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.3) 100%)' }} />
                            
                            {/* Text Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                                <h1 className="text-6xl lg:text-8xl font-light text-white mb-4 animate-slide-in-up"
                                    style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    {slide.title}
                                </h1>
                                <p className="text-xl text-white mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                    {slide.subtitle}
                                </p>
                                <button 
                                    className="px-8 py-4 text-sm uppercase tracking-[0.2em] font-medium transition-all duration-300 animate-fade-in"
                                    style={{ backgroundColor: '#fbf9f6', color: '#1b1c1a', animationDelay: '0.4s' }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = '#C9A96E';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = '#fbf9f6';
                                        e.currentTarget.style.color = '#1b1c1a';
                                    }}
                                >
                                    {slide.cta}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Carousel Navigation */}
                    <button
                        onClick={handlePrevSlide}
                        className="carousel-nav-btn absolute left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full transition-all"
                        style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                    >
                        ‹
                    </button>
                    <button
                        onClick={handleNextSlide}
                        className="carousel-nav-btn absolute right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full transition-all"
                        style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                    >
                        ›
                    </button>

                    {/* Carousel Indicators */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
                        {heroSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className="w-2 h-2 rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: idx === currentSlide ? '#fbf9f6' : 'rgba(255,255,255,0.5)',
                                    width: idx === currentSlide ? '24px' : '8px'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
                    {/* ── FEATURED CATEGORIES ── */}
                    {displayedProducts.length > 0 && (
                        <div className="py-24">
                            <h2 className="text-4xl font-light text-center mb-16" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                Featured Categories
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                                {displayedProducts.slice(0, 3).map((product, idx) => {
                                    const imageUrl = product.images && product.images.length > 0
                                        ? product.images[0].url
                                        : '/ascend_editorial_warm.png';
                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product._id)}
                                            className="group cursor-pointer animate-slide-in-up"
                                            style={{ animationDelay: `${idx * 0.2}s` }}
                                        >
                                            <div className="aspect-[3/4] overflow-hidden mb-6 rounded-lg" style={{ backgroundColor: '#f5f3f0' }}>
                                                <img
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>
                                            <h3 className="text-2xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                                {product.title}
                                            </h3>
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium mt-3 block" style={{ color: '#1b1c1a' }}>
                                                {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── BROWSE COLLECTION ── */}
                    <div className="mb-24">
                        <h2 className="text-4xl font-light text-center mb-16" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                            Browse Collection
                        </h2>
                        {visibleProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                                {visibleProducts.map((product, idx) => {
                                    const imageUrl = product.images && product.images.length > 0
                                        ? product.images[0].url
                                        : '/ascend_editorial_warm.png';
                                    const isAnimating = animatingIndices.has(idx);

                                    return (
                                        <div
                                            key={product._id}
                                            className={`group cursor-pointer flex flex-col ${isAnimating ? 'animate-slide-left' : 'opacity-0'}`}
                                            onClick={() => handleProductClick(product._id)}
                                            style={{ animationDelay: `${(idx % 8) * 0.1}s` }}
                                        >
                                            <div className="aspect-[4/5] overflow-hidden mb-6 rounded-lg" style={{ backgroundColor: '#f5f3f0' }}>
                                                <img
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <h3 className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                                    {product.title}
                                                </h3>
                                                <p className="text-[12px] line-clamp-2 leading-relaxed" style={{ color: '#7A6E63' }}>
                                                    {product.description}
                                                </p>
                                                <div className="mt-2">
                                                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#1b1c1a' }}>
                                                        {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-24 text-center flex flex-col items-center">
                                <h2 className="text-2xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                    No pieces available.
                                </h2>
                                <p className="max-w-md mx-auto text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                                    We are currently preparing our next collection. Please check back later.
                                </p>
                            </div>
                        )}

                        {/* Infinite Scroll Trigger */}
                        {visibleProducts.length < displayedProducts.length && (
                            <div ref={observerTarget} className="py-12 text-center">
                                <div className="inline-block">
                                    <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <footer className="border-t" style={{ borderColor: '#e4e2df', backgroundColor: '#fefdfb' }}>
                    <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 py-16">
                        <div className="mb-12">
                            <div>
                                <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-6" style={{ color: '#C9A96E' }}>
                                    Company
                                </h3>
                                <ul className="flex flex-wrap gap-6">
                                    {['About Us', 'Privacy', 'Terms', 'Returns', 'Contact', 'Sitemap'].map((link) => (
                                        <li key={link}>
                                            <a href="#" className="text-sm" style={{ color: '#7A6E63' }}>
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e4e2df', paddingTop: '24px' }}>
                            <div className="mb-8">
                                <h4 className="text-sm font-medium mb-3" style={{ color: '#1b1c1a', fontFamily: "'Cormorant Garamond', serif" }}>
                                    The ASCEND Experience
                                </h4>
                                <p className="text-xs leading-relaxed max-w-2xl" style={{ color: '#7A6E63' }}>
                                    We blend digital convenience with modern retail. Shop anytime online through our curated collection, or visit a store to feel premium fabrics and find the perfect fit. Seamless omnichannel shopping—order online and pickup in-store, or enjoy doorstep delivery. Whether casual or formal, ASCEND crafts pieces for every season and occasion.
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <span className="text-[10px] uppercase tracking-[0.35em]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}>
                                    ASCEND. © {new Date().getFullYear()}
                                </span>
                                <div className="flex gap-6">
                                    {['Facebook', 'Instagram', 'LinkedIn', 'Google'].map((social) => (
                                        <a key={social} href="#" className="text-xs" style={{ color: '#C9A96E' }}>
                                            {social}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Home;

const Home = () => {
    const products = useSelector(state => state.product.products);
    const user = useSelector(state => state.auth.user);
    const { handleGetAllProducts } = useProduct();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || "";
    
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [itemsToShow, setItemsToShow] = useState(8);
    const [animatingIndices, setAnimatingIndices] = useState(new Set());
    const observerTarget = useRef(null);
    const itemsPerPage = 8;

    // Initialize products on load
    useEffect(() => {
        handleGetAllProducts(query);
    }, [query]);

    // Setup infinite scroll with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && displayedProducts.length > 0) {
                setItemsToShow(prev => prev + itemsPerPage);
            }
        }, { threshold: 0.1 });

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [displayedProducts.length]);

    // Update displayed products when products change
    useEffect(() => {
        if (products && products.length > 0) {
            setDisplayedProducts(products);
            setItemsToShow(8);
        }
    }, [products]);

    // Trigger animation for new items on scroll
    useEffect(() => {
        const newIndices = new Set();
        for (let i = 0; i < Math.min(itemsToShow, displayedProducts.length); i++) {
            newIndices.add(i);
        }
        setAnimatingIndices(newIndices);
    }, [itemsToShow, displayedProducts.length]);

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    const visibleProducts = displayedProducts.slice(0, itemsToShow);
    const trendingProducts = displayedProducts.slice(0, 3);

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <style>{`
                @keyframes slideFromRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slide-left {
                    animation: slideFromRight 0.8s ease-out forwards;
                }

                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }

                .sidebar-item {
                    animation: slideFromRight 1s ease-out forwards;
                }

                .sidebar-item:nth-child(1) { animation-delay: 0.1s; }
                .sidebar-item:nth-child(2) { animation-delay: 0.3s; }
                .sidebar-item:nth-child(3) { animation-delay: 0.5s; }
            `}</style>

            <div
                className="min-h-screen selection:bg-[#C9A96E]/30"
                style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
            >
                {/* ── ANIMATED SIDEBAR (Right Side) ── */}
                <div className="fixed right-0 top-0 h-screen w-[300px] hidden lg:flex items-center justify-center overflow-hidden" 
                    style={{ backgroundColor: 'rgba(251, 249, 246, 0.95)', pointerEvents: 'none' }}>
                    <div className="flex flex-col gap-8 items-center">
                        {trendingProducts.map((product, idx) => {
                            const imageUrl = product.images && product.images.length > 0
                                ? product.images[0].url
                                : '/ascend_editorial_warm.png';
                            return (
                                <div key={product._id} className="sidebar-item flex flex-col items-center gap-3 opacity-0">
                                    <div className="w-24 h-32 rounded-lg overflow-hidden" style={{ backgroundColor: '#f5f3f0' }}>
                                        <img
                                            src={imageUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="text-xs text-center" style={{ color: '#7A6E63' }}>
                                        {product.title.substring(0, 15)}...
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 lg:pr-[350px]">
                    {/* ── Hero / Header ── */}
                    <div className="pt-20 pb-16 text-center flex flex-col items-center animate-fade-in">
                        <span className="text-[10px] uppercase tracking-[0.24em] font-medium mb-6" style={{ color: '#C9A96E' }}>
                            Welcome to ASCEND
                        </span>
                        <h1
                            className="text-5xl lg:text-7xl font-light leading-tight mb-6"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                        >
                            Curated Archive
                        </h1>
                        <p className="max-w-xl mx-auto text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                            Discover our latest curation of premium minimalist pieces, meticulously designed for effortless elegance and enduring quality.
                        </p>
                    </div>

                    {/* ── FEATURED SECTION ── */}
                    {trendingProducts.length > 0 && (
                        <div className="mb-24 animate-fade-in">
                            <h2 className="text-3xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                Featured Collection
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {trendingProducts.map((product, idx) => {
                                    const imageUrl = product.images && product.images.length > 0
                                        ? product.images[0].url
                                        : '/ascend_editorial_warm.png';
                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product._id)}
                                            className="group cursor-pointer"
                                            style={{ animationDelay: `${idx * 0.2}s` }}
                                        >
                                            <div className="aspect-[3/4] overflow-hidden mb-6 rounded-lg" style={{ backgroundColor: '#f5f3f0' }}>
                                                <img
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>
                                            <h3 className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                                {product.title}
                                            </h3>
                                            <p className="text-[12px] line-clamp-2 leading-relaxed mt-2" style={{ color: '#7A6E63' }}>
                                                {product.description}
                                            </p>
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium mt-3 block" style={{ color: '#1b1c1a' }}>
                                                {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── TRENDING SECTION ── */}
                    {displayedProducts.length > 3 && (
                        <div className="mb-24">
                            <h2 className="text-3xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                Trending Now
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {displayedProducts.slice(3, 6).map((product) => {
                                    const imageUrl = product.images && product.images.length > 0
                                        ? product.images[0].url
                                        : '/ascend_editorial_warm.png';
                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product._id)}
                                            className="group cursor-pointer"
                                        >
                                            <div className="aspect-[3/4] overflow-hidden mb-4 rounded-lg" style={{ backgroundColor: '#f5f3f0' }}>
                                                <img
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>
                                            <h3 className="text-lg leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                                {product.title}
                                            </h3>
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium mt-2 block" style={{ color: '#1b1c1a' }}>
                                                {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── LAZY LOADED PRODUCT GRID ── */}
                    <div className="mb-24">
                        <h2 className="text-3xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                            Browse Collection
                        </h2>
                        {visibleProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                                {visibleProducts.map((product, idx) => {
                                    const imageUrl = product.images && product.images.length > 0
                                        ? product.images[0].url
                                        : '/ascend_editorial_warm.png';
                                    const isAnimating = animatingIndices.has(idx);

                                    return (
                                        <div
                                            key={product._id}
                                            className={`group cursor-pointer flex flex-col ${isAnimating ? 'animate-slide-left' : 'opacity-0'}`}
                                            onClick={() => handleProductClick(product._id)}
                                            style={{ animationDelay: `${(idx % 8) * 0.1}s` }}
                                        >
                                            <div className="aspect-[4/5] overflow-hidden mb-6 rounded-lg" style={{ backgroundColor: '#f5f3f0' }}>
                                                <img
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <h3 className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                                    {product.title}
                                                </h3>
                                                <p className="text-[12px] line-clamp-2 leading-relaxed" style={{ color: '#7A6E63' }}>
                                                    {product.description}
                                                </p>
                                                <div className="mt-2">
                                                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#1b1c1a' }}>
                                                        {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-24 text-center flex flex-col items-center">
                                <h2 className="text-2xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                    No pieces available.
                                </h2>
                                <p className="max-w-md mx-auto text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                                    We are currently preparing our next collection. Please check back later.
                                </p>
                            </div>
                        )}

                        {/* Infinite Scroll Trigger */}
                        {visibleProducts.length < displayedProducts.length && (
                            <div ref={observerTarget} className="py-12 text-center">
                                <div className="inline-block">
                                    <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <footer className="border-t" style={{ borderColor: '#e4e2df', backgroundColor: '#fefdfb' }}>
                    <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 py-16">
                        <div className="mb-12">
                            <div>
                                <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-6" style={{ color: '#C9A96E' }}>
                                    Company
                                </h3>
                                <ul className="flex flex-wrap gap-6">
                                    {['About Us', 'Privacy', 'Terms', 'Returns', 'Contact', 'Sitemap'].map((link) => (
                                        <li key={link}>
                                            <a href="#" className="text-sm" style={{ color: '#7A6E63' }}>
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e4e2df', paddingTop: '24px' }}>
                            <div className="mb-8">
                                <h4 className="text-sm font-medium mb-3" style={{ color: '#1b1c1a', fontFamily: "'Cormorant Garamond', serif" }}>
                                    The ASCEND Experience
                                </h4>
                                <p className="text-xs leading-relaxed max-w-2xl" style={{ color: '#7A6E63' }}>
                                    We blend digital convenience with modern retail. Shop anytime online through our curated collection, or visit a store to feel premium fabrics and find the perfect fit. Seamless omnichannel shopping—order online and pickup in-store, or enjoy doorstep delivery. Whether casual or formal, ASCEND crafts pieces for every season and occasion.
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <span className="text-[10px] uppercase tracking-[0.35em]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}>
                                    ASCEND. © {new Date().getFullYear()}
                                </span>
                                <div className="flex gap-6">
                                    {['Facebook', 'Instagram', 'LinkedIn', 'Google'].map((social) => (
                                        <a key={social} href="#" className="text-xs" style={{ color: '#C9A96E' }}>
                                            {social}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Home;