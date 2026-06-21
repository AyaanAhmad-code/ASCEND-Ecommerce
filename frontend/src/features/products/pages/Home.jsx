import React, { useEffect } from 'react';
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

    useEffect(() => {
        handleGetAllProducts(query);
    }, [query]);

    return (
        <>
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <div
                className="min-h-screen selection:bg-[#C9A96E]/30"
                style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
            >

                <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
                    {/* ── Hero / Header ── */}
                    <div className="pt-20 pb-20 text-center flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-[0.24em] font-medium mb-6" style={{ color: '#C9A96E' }}>
                            The Collection
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

                    {/* ── Product Grid ── */}
                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 pb-32">
                            {products.map(product => {
                                const imageUrl = product.images && product.images.length > 0
                                    ? product.images[ 0 ].url
                                    : '/snitch_editorial_warm.png'; // Fallback

                                return (
                                    <div
                                        onClick={() => navigate(`/product/${product._id}`)}
                                        key={product._id} className="group cursor-pointer flex flex-col">
                                        {/* Image Container */}
                                        <div className="aspect-[4/5] overflow-hidden mb-6" style={{ backgroundColor: '#f5f3f0' }}>
                                            <img
                                                src={imageUrl}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex flex-col gap-2">
                                            <h3
                                                className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                                            >
                                                {product.title}
                                            </h3>

                                            <p
                                                className="text-[12px] line-clamp-2 leading-relaxed"
                                                style={{ color: '#7A6E63' }}
                                            >
                                                {product.description}
                                            </p>

                                            <div className="mt-2">
                                                <span
                                                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                                                    style={{ color: '#1b1c1a' }}
                                                >
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
                </div>

                {/* ── Footer ── */}
                <footer className="border-t" style={{ borderColor: '#e4e2df', backgroundColor: '#fefdfb' }}>
                    <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 py-16">
                        {/* Main Footer Grid */}
                        <div className="mb-12">
                            {/* Company */}
                            <div>
                                <h3
                                    className="text-xs uppercase tracking-[0.2em] font-medium mb-6"
                                    style={{ color: '#C9A96E' }}
                                >
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

                        {/* Footer Divider */}
                        <div style={{ borderTop: '1px solid #e4e2df', paddingTop: '24px' }}>
                            {/* Brand Statement */}
                            <div className="mb-8">
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: '#1b1c1a', fontFamily: "'Cormorant Garamond', serif" }}
                                >
                                    The ASCEND Experience
                                </h4>
                                <p className="text-xs leading-relaxed max-w-2xl" style={{ color: '#7A6E63' }}>
                                    We blend digital convenience with modern retail. Shop anytime online through our curated collection, or visit a store to feel premium fabrics and find the perfect fit. Seamless omnichannel shopping—order online and pickup in-store, or enjoy doorstep delivery. Whether casual or formal, ASCEND crafts pieces for every season and occasion.
                                </p>
                            </div>

                            {/* Bottom Links & Copyright */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <span
                                    className="text-[10px] uppercase tracking-[0.35em]"
                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}
                                >
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