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
    const [currentSlideImageIndex, setCurrentSlideImageIndex] = useState(0);
    const loadingRef = useRef(null);
    const browseRef = useRef(null);
    const heroSlideTimer = useRef(null);
    const heroImageTimer = useRef(null);
    const itemsPerPage = 12;

    const defaultHeroSlides = [
        { title: "THE SEASON'S FINEST", subtitle: 'Premium Collection — Starting at ₹899', cta: 'Shop Now', accent: '#C9A96E', images: [] },
        { title: 'NEVER RUN-OUT COLLECTION', subtitle: 'Timeless Essentials, Redefined', cta: 'Explore Now', accent: '#E8C97E', images: [] },
        { title: 'SUMMER VIBES', subtitle: 'Cool & Casual — New Arrivals', cta: 'Shop Collection', accent: '#C9A96E', images: [] },
    ];

    const getHeroSlides = () => {
        if (displayedProducts.length > 0) {
            // Seed based on current day for daily rotation
            const today = new Date();
            const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
            
            const slidesCount = Math.min(6, displayedProducts.length);
            const slides = [];
            
            for (let i = 0; i < slidesCount; i++) {
                const pseudoRandom = Math.abs(Math.sin(seed + i)) * 10000;
                const index = Math.floor((pseudoRandom - Math.floor(pseudoRandom)) * displayedProducts.length);
                const product = displayedProducts[index];
                
                if (product) {
                    slides.push({
                        title: product.title.toUpperCase(),
                        subtitle: product.description?.substring(0, 70) || 'Premium Collection',
                        cta: 'Explore Now',
                        images: product.images?.map(img => img.url) || [],
                        accent: defaultHeroSlides[i % defaultHeroSlides.length]?.accent || '#C9A96E',
                        productId: product._id,
                    });
                }
            }
            return slides.length > 0 ? slides : defaultHeroSlides;
        }
        return defaultHeroSlides;
    };

    const heroSlides = getHeroSlides();

    useEffect(() => { handleGetAllProducts(query); }, [query]);

    useEffect(() => {
        heroSlideTimer.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % Math.max(1, heroSlides.length));
        }, 6000);
        return () => clearInterval(heroSlideTimer.current);
    }, [heroSlides.length]);

    // Reset image animation when slide changes
    useEffect(() => {
        setCurrentSlideImageIndex(0);
    }, [currentSlide]);

    // Animate through multiple photos of the current product
    useEffect(() => {
        const activeSlide = heroSlides[currentSlide];
        if (activeSlide && activeSlide.images && activeSlide.images.length > 1) {
            heroImageTimer.current = setInterval(() => {
                setCurrentSlideImageIndex(prev => (prev + 1) % activeSlide.images.length);
            }, 2000); // Fade to next photo every 2 seconds
        }
        return () => clearInterval(heroImageTimer.current);
    }, [currentSlide, heroSlides]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && displayedProducts.length > 0 && itemsToShow < displayedProducts.length) {
                    setItemsToShow(prev => Math.min(prev + itemsPerPage, displayedProducts.length));
                }
            },
            { threshold: 0.1, rootMargin: '150px' }
        );
        if (loadingRef.current) observer.observe(loadingRef.current);
        return () => { if (loadingRef.current) observer.unobserve(loadingRef.current); observer.disconnect(); };
    }, [displayedProducts.length, itemsToShow]);

    useEffect(() => {
        if (products && products.length > 0) { setDisplayedProducts(products); setItemsToShow(8); }
    }, [products]);

    useEffect(() => {
        const newIndices = new Set();
        for (let i = 0; i < Math.min(itemsToShow, displayedProducts.length); i++) newIndices.add(i);
        setAnimatingIndices(newIndices);
    }, [itemsToShow, displayedProducts.length]);

    const handleProductClick = (id) => { if (id) navigate(`/product/${id}`); };

    const goToSlide = (idx) => {
        clearInterval(heroSlideTimer.current);
        setCurrentSlide(idx);
        heroSlideTimer.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroSlides.length);
        }, 5500);
    };

    const visibleProducts = displayedProducts.slice(0, itemsToShow);
    const trendingProducts = displayedProducts.slice(3, 7);
    const browseProducts = visibleProducts;

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

            <style>{`
                @keyframes heroFadeIn {
                    from { opacity: 0; transform: translateY(22px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideFromBottom {
                    from { opacity: 0; transform: translateY(40px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .hero-text-animate { animation: heroFadeIn 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
                .animate-slide-in-up { animation: slideInUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
                .animate-slide-bottom { animation: slideFromBottom 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }

                /* Product card hover */
                .product-card-img {
                    transition: transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                .product-card:hover .product-card-img { transform: scale(1.07); }
                .product-card:hover .product-title { color: #C9A96E; }

                /* Hero nav buttons */
                .hero-nav-btn {
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    transition: all 0.25s ease;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .hero-nav-btn:hover {
                    background-color: rgba(201,169,110,0.85) !important;
                    border-color: transparent;
                }

                /* Hero dots */
                .hero-dot { transition: all 0.35s cubic-bezier(0.22,1,0.36,1); cursor: pointer; }

                /* Section divider */
                .section-divider {
                    height: 1px;
                    background: linear-gradient(to right, transparent, #ddd8d1, transparent);
                    margin: 0 auto;
                    max-width: 80%;
                }

                /* Smooth page scroll */
                html { scroll-behavior: smooth; }

                /* Price tag */
                .price-tag {
                    display: inline-block;
                    transition: color 0.2s ease;
                }
                .product-card:hover .price-tag { color: #C9A96E; }
            `}</style>

            <div style={{ backgroundColor: '#f8f6f2', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>

                {/* ══════════════════════════════════════════
                    HERO BANNER — blurred backdrop technique
                ══════════════════════════════════════════ */}
                <div className="relative w-full overflow-hidden" style={{ height: 'clamp(500px, 82vh, 820px)' }}>
                    {heroSlides.map((slide, idx) => {
                        const activeImage = slide.images && slide.images.length > 0 
                            ? slide.images[idx === currentSlide ? currentSlideImageIndex : 0]
                            : null;
                            
                        return (
                        <div
                            key={idx}
                            className="absolute inset-0"
                            style={{
                                opacity: idx === currentSlide ? 1 : 0,
                                zIndex: idx === currentSlide ? 1 : 0,
                                transition: 'opacity 0.9s ease',
                            }}
                        >
                            {activeImage ? (
                                <>
                                    {/* ── Blurred backdrop — fills entire hero, no black bars ── */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundImage: `url(${activeImage})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center center',
                                            filter: 'blur(28px) brightness(0.38) saturate(1.2)',
                                            transform: 'scale(1.08)',
                                            transition: 'background-image 0.8s ease'
                                        }}
                                    />

                                    {/* ── Warm dark vignette over the blur ── */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'radial-gradient(ellipse at center, rgba(10,8,5,0.15) 0%, rgba(10,8,5,0.55) 100%)',
                                        }}
                                    />

                                    {/* ── Main image — full, unclipped with Ken Burns + crossfade ── */}
                                    <img
                                        src={activeImage}
                                        alt={slide.title}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            objectPosition: 'center center',
                                            zIndex: 1,
                                            transition: 'all 0.8s ease',
                                        }}
                                    />

                                    {/* ── Left-side text readability gradient ── */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(100deg, rgba(8,6,3,0.78) 0%, rgba(8,6,3,0.35) 38%, rgba(8,6,3,0) 62%)',
                                            zIndex: 2,
                                        }}
                                    />
                                </>
                            ) : (
                                /* No image — rich gradient fallback */
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(135deg, #1a1410 0%, #2e2418 50%, #1a1410 100%)',
                                    }}
                                />
                            )}

                            {/* ── Hero text content ── */}
                            {idx === currentSlide && (
                                <div
                                    className="absolute inset-0 flex flex-col justify-center pb-8 px-10 lg:px-20"
                                    style={{ zIndex: 3 }}
                                >
                                    <div className="max-w-lg hero-text-animate">
                                        <p
                                            className="text-[9px] uppercase tracking-[0.45em] mb-5 font-medium"
                                            style={{ color: slide.accent || '#C9A96E', letterSpacing: '0.4em' }}
                                        >
                                            ✦ &nbsp; New Collection
                                        </p>
                                        <h1
                                            className="font-light leading-[1.08] mb-5"
                                            style={{
                                                fontFamily: "'Cormorant Garamond', serif",
                                                color: '#ffffff',
                                                fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
                                                textShadow: '0 4px 32px rgba(0,0,0,0.4)',
                                                letterSpacing: '-0.01em',
                                            }}
                                        >
                                            {slide.title}
                                        </h1>
                                        <p
                                            className="text-sm mb-9 leading-relaxed"
                                            style={{ color: 'rgba(255,255,255,0.72)', maxWidth: '340px' }}
                                        >
                                            {slide.subtitle}
                                        </p>
                                        <button
                                            onClick={() => handleProductClick(slide.productId)}
                                            style={{
                                                backgroundColor: slide.accent || '#C9A96E',
                                                color: '#1b1c1a',
                                                padding: '13px 32px',
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                letterSpacing: '0.28em',
                                                textTransform: 'uppercase',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                display: 'inline-block',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.backgroundColor = '#ffffff';
                                                e.currentTarget.style.color = '#1b1c1a';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = slide.accent || '#C9A96E';
                                                e.currentTarget.style.color = '#1b1c1a';
                                            }}
                                        >
                                            {slide.cta}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        );
                    })}

                    {/* ── Nav Arrows ── */}
                    <button
                        onClick={() => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
                        className="hero-nav-btn absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full text-white text-2xl"
                        style={{ backgroundColor: 'rgba(255,255,255,0.12)', zIndex: 10 }}
                        aria-label="Previous"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => goToSlide((currentSlide + 1) % heroSlides.length)}
                        className="hero-nav-btn absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full text-white text-2xl"
                        style={{ backgroundColor: 'rgba(255,255,255,0.12)', zIndex: 10 }}
                        aria-label="Next"
                    >
                        ›
                    </button>

                    {/* ── Slide Dots ── */}
                    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ zIndex: 10 }}>
                        {heroSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                className="hero-dot rounded-full"
                                style={{
                                    width: idx === currentSlide ? '28px' : '7px',
                                    height: '7px',
                                    backgroundColor: idx === currentSlide ? '#C9A96E' : 'rgba(255,255,255,0.45)',
                                    border: 'none',
                                }}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* ── Bottom fade into page ── */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '80px',
                            background: 'linear-gradient(to bottom, transparent, #f8f6f2)',
                            zIndex: 10,
                            pointerEvents: 'none',
                        }}
                    />
                </div>

                {/* ══════════════════════════════════════════
                    MAIN CONTENT
                ══════════════════════════════════════════ */}
                <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-20">

                    {/* ── TRENDING NOW ── */}
                    {trendingProducts.length > 0 && (
                        <div className="pt-16 pb-20">
                            {/* Section header */}
                            <div className="flex items-end justify-between mb-10">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.38em] mb-2 font-medium" style={{ color: '#C9A96E' }}>
                                        Curated For You
                                    </p>
                                    <h2 className="text-[2.4rem] font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a', lineHeight: 1.1 }}>
                                        Trending Now
                                    </h2>
                                </div>
                                <button
                                    onClick={() => browseRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                    className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] font-medium"
                                    style={{ color: '#7A6E63', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#7A6E63'}
                                >
                                    View All <span style={{ fontSize: '16px' }}>→</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
                                {trendingProducts.map((product, idx) => {
                                    const imageUrl = product.images?.[0]?.url || '/snitch_editorial_warm.png';
                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product._id)}
                                            className="product-card group cursor-pointer animate-slide-in-up"
                                            style={{ animationDelay: `${idx * 0.1}s` }}
                                        >
                                            <div
                                                className="overflow-hidden mb-4"
                                                style={{
                                                    aspectRatio: '3/4',
                                                    backgroundColor: '#ede9e3',
                                                    borderRadius: '4px',
                                                    boxShadow: '0 2px 16px rgba(27,28,26,0.07)',
                                                }}
                                            >
                                                <img src={imageUrl} alt={product.title} className="product-card-img w-full h-full object-cover" />
                                            </div>
                                            <h3
                                                className="product-title text-base leading-snug mb-1 transition-colors duration-300"
                                                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                                            >
                                                {product.title}
                                            </h3>
                                            <p className="text-[11px] line-clamp-1 mb-2" style={{ color: '#8A7E73' }}>
                                                {product.description}
                                            </p>
                                            <span className="price-tag text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: '#1b1c1a' }}>
                                                {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Section divider */}
                    {trendingProducts.length > 0 && <div className="section-divider mb-20" />}

                    {/* ── EDITORIAL BAND ── */}
                    {displayedProducts.length > 0 && (
                        <div
                            className="mb-20 overflow-hidden flex flex-col md:flex-row items-stretch"
                            style={{
                                background: 'linear-gradient(120deg, #1a1410 0%, #2b2018 55%, #1a1410 100%)',
                                borderRadius: '8px',
                                boxShadow: '0 8px 48px rgba(27,20,10,0.18)',
                                minHeight: '200px',
                            }}
                        >
                            <div className="flex-1 flex flex-col justify-center px-10 py-12">
                                <p className="text-[9px] uppercase tracking-[0.4em] mb-4 font-medium" style={{ color: '#C9A96E' }}>
                                    ✦ &nbsp; The ASCEND Promise
                                </p>
                                <h2
                                    className="text-3xl font-light leading-tight mb-4"
                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#ffffff' }}
                                >
                                    Crafted for Every Season,<br />Every Occasion.
                                </h2>
                                <p className="text-sm leading-relaxed mb-7" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '360px' }}>
                                    Premium fabrics, timeless silhouettes, and exceptional comfort — delivered to your door.
                                </p>
                                <button
                                    onClick={() => browseRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                    style={{
                                        alignSelf: 'flex-start',
                                        backgroundColor: '#C9A96E',
                                        color: '#1b1c1a',
                                        padding: '12px 28px',
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        letterSpacing: '0.28em',
                                        textTransform: 'uppercase',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        borderRadius: '2px',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e0be87'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#C9A96E'; }}
                                >
                                    Browse Collection
                                </button>
                            </div>
                            {displayedProducts[0]?.images?.[0]?.url && (
                                <div
                                    className="hidden md:block shrink-0 overflow-hidden"
                                    style={{ width: '260px', position: 'relative' }}
                                >
                                    <img
                                        src={displayedProducts[0].images[0].url}
                                        alt="Featured"
                                        className="w-full h-full object-cover"
                                        style={{ opacity: 0.45, filter: 'grayscale(20%) brightness(0.8)' }}
                                    />
                                    {/* inner left fade */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(to right, #1a1410 0%, transparent 40%)',
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── BROWSE COLLECTION ── */}
                    <div className="mb-28" ref={browseRef}>
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.38em] mb-2 font-medium" style={{ color: '#C9A96E' }}>
                                    The Archive
                                </p>
                                <h2 className="text-[2.4rem] font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a', lineHeight: 1.1 }}>
                                    Browse Collection
                                </h2>
                            </div>
                            {displayedProducts.length > 0 && (
                                <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: '#B5ADA3' }}>
                                    {displayedProducts.length} pieces
                                </span>
                            )}
                        </div>

                        {browseProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-14">
                                {browseProducts.map((product, idx) => {
                                    const imageUrl = product.images?.[0]?.url || '/snitch_editorial_warm.png';
                                    const isAnimating = animatingIndices.has(idx);
                                    return (
                                        <div
                                            key={product._id}
                                            className={`product-card group cursor-pointer flex flex-col ${isAnimating ? 'animate-slide-bottom' : 'opacity-0'}`}
                                            onClick={() => handleProductClick(product._id)}
                                            style={{ animationDelay: `${(idx % 8) * 0.07}s` }}
                                        >
                                            <div
                                                className="overflow-hidden mb-4"
                                                style={{
                                                    aspectRatio: '4/5',
                                                    backgroundColor: '#ede9e3',
                                                    borderRadius: '4px',
                                                    boxShadow: '0 2px 16px rgba(27,28,26,0.07)',
                                                }}
                                            >
                                                <img src={imageUrl} alt={product.title} className="product-card-img w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h3
                                                    className="product-title text-[1.1rem] leading-snug transition-colors duration-300"
                                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                                                >
                                                    {product.title}
                                                </h3>
                                                <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: '#8A7E73' }}>
                                                    {product.description}
                                                </p>
                                                <span className="price-tag text-[10px] uppercase tracking-[0.22em] font-semibold mt-1" style={{ color: '#1b1c1a' }}>
                                                    {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-28 text-center">
                                <p className="text-[9px] uppercase tracking-[0.35em] mb-4" style={{ color: '#C9A96E' }}>Coming Soon</p>
                                <h2 className="text-2xl font-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                    No pieces available.
                                </h2>
                                <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: '#7A6E63' }}>
                                    We are preparing our next collection. Please check back soon.
                                </p>
                            </div>
                        )}

                        {/* Infinite scroll trigger */}
                        {visibleProducts.length < displayedProducts.length && (
                            <div ref={loadingRef} className="py-16 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#e4e2df', borderTopColor: '#C9A96E' }} />
                                    <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: '#B5ADA3' }}>
                                        {visibleProducts.length} of {displayedProducts.length}
                                    </p>
                                </div>
                            </div>
                        )}

                        {visibleProducts.length >= displayedProducts.length && displayedProducts.length > 0 && (
                            <div className="pt-12 text-center">
                                <div className="section-divider mb-6" />
                                <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: '#B5ADA3' }}>
                                    All {displayedProducts.length} pieces shown
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    FOOTER
                ══════════════════════════════════════════ */}
                <footer style={{ borderTop: '1px solid #e0dbd3', backgroundColor: '#f2ede7' }}>
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-20 py-14">
                        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
                            <div style={{ maxWidth: '280px' }}>
                                <span
                                    className="text-sm font-medium tracking-[0.38em] uppercase"
                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}
                                >
                                    ASCEND.
                                </span>
                                <p className="text-xs leading-relaxed mt-3" style={{ color: '#7A6E63' }}>
                                    Premium fashion crafted for every season. Seamless shopping, exceptional quality delivered to your door.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-[9px] uppercase tracking-[0.28em] font-semibold mb-4" style={{ color: '#C9A96E' }}>Company</h3>
                                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                                    {['About Us', 'Privacy', 'Terms', 'Returns', 'Contact', 'Sitemap'].map((link) => (
                                        <li key={link}>
                                            <a
                                                href="#"
                                                className="text-xs"
                                                style={{ color: '#7A6E63', transition: 'color 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#7A6E63'}
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #ddd8d1', paddingTop: '20px' }}>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <span className="text-[10px] uppercase tracking-[0.35em]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#B5ADA3' }}>
                                    ASCEND. © {new Date().getFullYear()}
                                </span>
                                <div className="flex gap-6">
                                    {['Facebook', 'Instagram', 'LinkedIn', 'Google'].map((social) => (
                                        <a
                                            key={social}
                                            href="#"
                                            className="text-xs"
                                            style={{ color: '#B5ADA3', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#B5ADA3'}
                                        >
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
