import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { useNavigate, useSearchParams } from 'react-router';

const Home = () => {
    const products = useSelector(state => state.product.products);
    const { handleGetAllProducts } = useProduct();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || "";
    
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [itemsToShow, setItemsToShow] = useState(8);
    const [animatingIndices, setAnimatingIndices] = useState(new Set());
    const [currentSlide, setCurrentSlide] = useState(0);
    const observerTarget = useRef(null);
    const loadingRef = useRef(null);
    const browseRef = useRef(null);
    const carouselRef = useRef(null);
    const itemsPerPage = 12;

    // Hero carousel slides - will use first 3 products if available
    const getHeroSlides = () => {
        if (displayedProducts.length > 0) {
            return displayedProducts.slice(0, 3).map((product, idx) => ({
                title: product.title.substring(0, 30).toUpperCase(),
                subtitle: product.description?.substring(0, 40) || 'Premium Collection',
                cta: 'EXPLORE NOW',
                image: product.images?.[0]?.url || '/snitch_editorial_warm.png'
            }));
        }
        return [
            {
                title: 'SHIRTS',
                subtitle: 'Premium Collection',
                cta: 'STARTING AT ₹899',
                image: '/snitch_editorial_warm.png'
            },
            {
                title: 'THE NEVER RUN-OUT COLLECTION',
                subtitle: 'Timeless Essentials',
                cta: 'EXPLORE NOW',
                image: '/snitch_editorial_warm.png'
            },
            {
                title: 'SUMMER VIBES',
                subtitle: 'Cool & Casual',
                cta: 'SHOP COLLECTION',
                image: '/snitch_editorial_warm.png'
            }
        ];
    };

    const heroSlides = getHeroSlides();

    // Initialize products on load
    useEffect(() => {
        handleGetAllProducts(query);
    }, [query]);

    // Auto-scroll carousel every 6 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (carouselRef.current) {
                const scrollAmount = 400;
                carouselRef.current.scrollLeft += scrollAmount;
                if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth - carouselRef.current.clientWidth) {
                    carouselRef.current.scrollLeft = 0;
                }
            }
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Setup infinite scroll with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && displayedProducts.length > 0 && itemsToShow < displayedProducts.length) {
                    setItemsToShow(prev => Math.min(prev + itemsPerPage, displayedProducts.length));
                }
            },
            { threshold: 0.2, rootMargin: '100px' }
        );

        if (loadingRef.current) {
            observer.observe(loadingRef.current);
        }

        return () => {
            if (loadingRef.current) observer.unobserve(loadingRef.current);
            observer.disconnect();
        };
    }, [displayedProducts.length, itemsToShow]);

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
        if (carouselRef.current) {
            carouselRef.current.scrollLeft -= 400;
        }
    };

    const handleNextSlide = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollLeft += 400;
        }
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

                @keyframes carouselSlide {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .carousel-container {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .carousel-container::-webkit-scrollbar {
                    display: none;
                }

                .carousel-card {
                    animation: carouselSlide 0.6s ease-out forwards;
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

                .carousel-nav-btn {
                    transition: all 0.3s ease;
                }

                .carousel-nav-btn:hover {
                    background-color: #C9A96E !important;
                    color: white;
                }
            `}</style>

            <div
                className="selection:bg-[#C9A96E]/30"
                style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
            >
                {/* ── HERO CAROUSEL - HORIZONTAL SCROLL ── */}
                <div className="relative w-full px-4 py-8" style={{ backgroundColor: '#fbf9f6' }}>
                    <div 
                        ref={carouselRef}
                        className="carousel-container flex gap-4 overflow-x-auto scroll-smooth"
                        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
                    >
                        {heroSlides.map((slide, idx) => (
                            <div
                                key={idx}
                                className="shrink-0 relative group cursor-pointer carousel-card"
                                style={{ width: '360px', height: '420px', animationDelay: `${idx * 0.15}s` }}
                            >
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                                    onClick={() => handleProductClick(displayedProducts[idx]?._id)}
                                />
                                <div className="absolute inset-0 rounded-lg" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%)' }} />
                                
                                {/* Text Overlay at Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-5">
                                    <h3 className="text-2xl font-light mb-2 transition-colors group-hover:text-[#C9A96E]"
                                        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                        {slide.title}
                                    </h3>
                                    <p className="text-sm mb-4 opacity-90">
                                        {slide.subtitle}
                                    </p>
                                    <button
                                        onClick={() => handleProductClick(displayedProducts[idx]?._id)}
                                        className="text-xs uppercase tracking-[0.2em] font-medium px-4 py-2 rounded transition-all"
                                        style={{ backgroundColor: '#fbf9f6', color: '#1b1c1a' }}
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
                    </div>

                    {/* Carousel Navigation Arrows */}
                    <button
                        onClick={handlePrevSlide}
                        className="carousel-nav-btn absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full text-xl transition-all"
                        style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: 'white' }}
                    >
                        ‹
                    </button>
                    <button
                        onClick={handleNextSlide}
                        className="carousel-nav-btn absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full text-xl transition-all"
                        style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: 'white' }}
                    >
                        ›
                    </button>
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
                                        : '/snitch_editorial_warm.png';
                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product._id)}
                                            className="group cursor-pointer animate-slide-in-up"
                                            style={{ animationDelay: `${idx * 0.2}s` }}
                                        >
                                            <div className="aspect-3/4 overflow-hidden mb-6 rounded-lg" style={{ backgroundColor: '#f5f3f0' }}>
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

                    {/* ── TRENDING COLLECTION ── */}
                    {displayedProducts.length > 3 && (
                        <div className="mb-24 pb-12" style={{ borderBottom: '1px solid #e4e2df' }}>
                            <h2 className="text-3xl font-light mb-12" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                Trending Now
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {displayedProducts.slice(3, 7).map((product, idx) => {
                                    const imageUrl = product.images && product.images.length > 0
                                        ? product.images[0].url
                                        : '/snitch_editorial_warm.png';
                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product._id)}
                                            className="group cursor-pointer animate-slide-in-up"
                                            style={{ animationDelay: `${idx * 0.1}s` }}
                                        >
                                            <div className="aspect-3/4 overflow-hidden mb-4 rounded-lg" style={{ backgroundColor: '#f5f3f0' }}>
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
                                            <p className="text-[11px] line-clamp-1 leading-relaxed mt-1" style={{ color: '#7A6E63' }}>
                                                {product.description}
                                            </p>
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium mt-2 block" style={{ color: '#1b1c1a' }}>
                                                {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── BROWSE COLLECTION ── */}
                    <div className="mb-24" ref={browseRef}>
                        <h2 className="text-4xl font-light text-center mb-16" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                            Browse Collection
                        </h2>
                        {visibleProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                                {visibleProducts.map((product, idx) => {
                                    const imageUrl = product.images && product.images.length > 0
                                        ? product.images[0].url
                                        : '/snitch_editorial_warm.png';
                                    const isAnimating = animatingIndices.has(idx);

                                    return (
                                        <div
                                            key={product._id}
                                            className={`group cursor-pointer flex flex-col ${isAnimating ? 'animate-slide-left' : 'opacity-0'}`}
                                            onClick={() => handleProductClick(product._id)}
                                            style={{ animationDelay: `${(idx % 8) * 0.1}s` }}
                                        >
                                            <div className="aspect-4/5 overflow-hidden mb-6 rounded-lg" style={{ backgroundColor: '#f5f3f0' }}>
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

                        {/* Infinite Scroll Trigger with Loading State */}
                        {visibleProducts.length < displayedProducts.length && (
                            <div ref={loadingRef} className="py-16 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-3 border-[#e4e2df] border-t-[#C9A96E] rounded-full animate-spin"></div>
                                    <p className="text-sm" style={{ color: '#7A6E63' }}>
                                        Loading more products...
                                    </p>
                                    <p className="text-[11px]" style={{ color: '#B5ADA3' }}>
                                        {visibleProducts.length} of {displayedProducts.length} products shown
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* All Products Loaded Message */}
                        {visibleProducts.length >= displayedProducts.length && displayedProducts.length > 0 && (
                            <div className="py-12 text-center">
                                <p className="text-sm" style={{ color: '#7A6E63' }}>
                                    All {displayedProducts.length} products loaded
                                </p>
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
