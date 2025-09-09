import {Helmet} from 'react-helmet-async'
import React, { useState } from "react";
import { motion } from 'framer-motion';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card'
import {Carousel, CarouselContent, CarouselItem} from '@/components/ui/carousel'
import {Wrench, Tag, Package, Star, Truck, Shield, Users, Settings} from 'lucide-react'
// import heroPhoto from '@/assets/pages/hero-photo.jpg'
import heroPhoto from '@/assets/images/industrial-bg.jpg'
import heroTechnical from "@/assets/pages/hero-technical.jpg";
import heroPhotoMobile from "@/assets/pages/hero-photo-mobile.jpg";
import bearing from "@/assets/pages/product-bearing.jpg";
import hose from "@/assets/pages/product-hose.jpg";
import hexnuts from "@/assets/pages/product-hexnuts.jpg";
import steam_couplers from "@/assets/images/steam_couplers.jpg";
import polishing_wheels from "@/assets/images/polishing_wheels.jpg";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  // State for selected product category
  const [selectedCategory, setSelectedCategory] = useState('hydraulic-hose');

  // Animation variants
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 60 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Note: Using CSS background-attachment: fixed for parallax effect
  // This provides better performance and browser compatibility

  // Features Cards Animation variants
  const featuresContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const featureCard = {
    initial: { 
      opacity: 0, 
      y: 60,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      }
    }
  };

  const featureCardHover = {
    scale: 1.05,
    y: -5,
    transition: { 
      duration: 0.3, 
      ease: "easeInOut" 
    }
  };

  // Product Grid Animation variants
  const productImageTransition = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: { duration: 0.4, ease: "easeInOut" }
  };

  const productDescriptionTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: "easeInOut" }
  };

  const productButtonHover = {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeInOut" }
  };

  const productButtonActive = {
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeInOut" }
  };

  // Our Passion Section Animation variants
  const passionContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const passionText = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const passionIcon = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        type: "spring",
        stiffness: 200
      }
    }
  };

  const floatingStats = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Carousel Animation variants
  const carouselItem = {
    initial: { opacity: 0, x: 50 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  const carouselCardHover = {
    scale: 1.03,
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" }
  };

  // Micro-interactions
  const buttonPress = {
    scale: 0.95,
    transition: { duration: 0.1, ease: "easeInOut" }
  };

  const iconHover = {
    rotate: 5,
    scale: 1.1,
    transition: { duration: 0.2, ease: "easeInOut" }
  };

  // Product category data
  const productCategories = {
    'hydraulic-hose': {
      name: 'Hydraulic Hose',
      image: hose,
      description: 'High-performance hydraulic hoses designed for industrial applications. Our hydraulic hoses feature reinforced construction with multiple layers of high-tensile steel wire braid or spiral reinforcement, ensuring maximum durability under extreme pressure conditions. Perfect for construction equipment, agricultural machinery, and industrial hydraulic systems.'
    },
    'steam-couplers': {
      name: 'Steam Couplers',
      image: steam_couplers,
      description: 'Premium steam couplers engineered for high-temperature and high-pressure steam applications. These precision-engineered couplers feature advanced sealing technology with heat-resistant materials and corrosion-resistant coatings. Ideal for power plants, steam systems, and industrial processes requiring reliable steam connections.'
    },
    'polishing-wheels': {
      name: 'Polishing Wheels',
      image: polishing_wheels,
      description: 'Professional-grade polishing wheels for metal finishing and surface preparation. Our polishing wheels come in various grit sizes and materials, from aggressive cutting wheels to fine finishing wheels. Perfect for automotive refinishing, metal fabrication, and industrial surface finishing applications.'
    }
  };

  const selectedProduct = productCategories[selectedCategory];

  return (
    <motion.main 
      className="overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
       <Helmet>
         <title>Wikramasooriya Enterprises | Industrial Spare Parts</title>
         <meta
           name="description"
           content="Discover high‑quality industrial spare parts with island‑wide delivery and expert support."
         />
         <link rel="canonical" href="/" />
       </Helmet>

      {/* Hero */}
      <section 
        className="relative overflow-hidden h-[60vh] md:h-[72vh]"
      >
        {/* Desktop Background Image */}
        <div 
          className="hidden md:block absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroPhoto})`,
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Mobile Background Image */}
        <picture className="md:hidden">
          <source media="(max-width: 768px)" srcSet={heroPhotoMobile} />
          <img
            src={heroPhotoMobile}
            alt="Industrial spare parts on a workbench"
            className="w-full h-full object-cover"
          />
        </picture>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />
        
        {/* Content that scrolls over the background */}
        <div className="relative z-20 h-full container mx-auto flex items-end pb-12">
          <motion.div 
            className="max-w-2xl"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1 
              className="font-display text-4xl md:text-5xl leading-tight"
              variants={staggerItem}
            >
              Discover the Perfect Solution
            </motion.h1>
            <motion.p 
              className="mt-3 text-lg text-black"
              variants={staggerItem}
            >
              Professional, reliable, and island‑wide. From bearings to hoses
              and fasteners, we deliver quality parts on time.
            </motion.p>
            <motion.div 
              className="mt-6 flex flex-wrap gap-3"
              variants={staggerItem}
            >
              <Button variant="outline" asChild>
                <a href="/products">Browse Products</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto py-14">
        <motion.div 
          className="grid md:grid-cols-3 gap-6"
          variants={featuresContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={featureCard}
            whileHover={featureCardHover}
            className="cursor-pointer"
          >
            <Card className="hover:shadow-2xl transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-primary" />
                  <CardTitle>High Quality Industrial Tools</CardTitle>
                </div>
                <CardDescription>
                  Trusted components sourced from reputable manufacturers.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
          
          <motion.div
            variants={featureCard}
            whileHover={featureCardHover}
            className="cursor-pointer"
          >
            <Card className="hover:shadow-2xl transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <CardTitle>Unbeatable Prices</CardTitle>
                </div>
                <CardDescription>
                  Competitive pricing with consistent availability.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
          
          <motion.div
            variants={featureCard}
            whileHover={featureCardHover}
            className="cursor-pointer"
          >
            <Card className="hover:shadow-2xl transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle>Direct Importing</CardTitle>
                </div>
                <CardDescription>
                  Island‑wide distribution with flexible logistics.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* What we are */}
      <section className='container mx-auto pb-10'>
        <div className='flex-1'>
          <span className='font-display text-2xl md:text-5xl mb-4'>
            What we are import... Wickramasooriya Enterprises
          </span>

          {/* Interactive Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[20%,40%,40%] gap-4 my-16">
            {/* First Grid - Buttons */}
            <div className="space-y-3">
              {Object.entries(productCategories).map(([key, category]) => (
                <motion.div
                  key={key}
                  whileHover={productButtonHover}
                  whileTap={productButtonActive}
                >
                  <Button
                    variant={selectedCategory === key ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto py-3 px-4 transition-all duration-200 ${
                      selectedCategory === key 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => setSelectedCategory(key)}
                  >
                    <span className="font-medium">{category.name}</span>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Second Grid - Image */}
            <div className="flex items-center justify-center">
              <motion.div 
                className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg"
                key={selectedCategory}
                variants={productImageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
            </div>

            {/* Third Grid - Description */}
            <div className="flex items-center">
              <motion.div 
                className="space-y-4"
                key={`${selectedCategory}-desc`}
                variants={productDescriptionTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground">
                  {selectedProduct.name}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {selectedProduct.description}
                </p>
                {/* <Button variant="outline" size="sm" className="mt-2">
                  Learn More
                </Button> */}
              </motion.div>
            </div>
          </div>
        </div>

        {/* <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <img
              src={heroTechnical}
              alt="Technical support team"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="font-display text-3xl mb-4">Who We Are</h2>
            <p className="text-muted-foreground mb-4">
              With over 30 years of experience, we are your trusted partner for
              industrial spare parts. Our team is dedicated to providing the
              best solutions for your needs.
            </p>
            <p className="text-muted-foreground">
              We specialize in bearings, hydraulic hoses, fasteners, and more,
              ensuring you get the right parts when you need them.
            </p>
          </div>
        </div> */}
      </section>

      

      {/* Our Passion Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={passionContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Content */}
            <motion.div className="space-y-6" variants={passionText}>
              <motion.div 
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  whileHover={iconHover}
                  transition={{ duration: 0.2 }}
                >
                  <Star className="w-4 h-4" />
                </motion.div>
                Excellence in Service
              </motion.div>
              
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                variants={passionText}
              >
                Our Passion for Top Notch Industrial Tools
              </motion.h2>
              
              <motion.p 
                className="text-lg text-gray-600 leading-relaxed"
                variants={passionText}
              >
                Discover our commitment to delivering top-quality products at unbeatable prices, 
                paired with exceptional customer service. We specialize in importing industrial 
                spare parts and consumables, serving leading companies across the island.
              </motion.p>
              
              <motion.p 
                className="text-lg text-gray-600 leading-relaxed"
                variants={passionText}
              >
                Our extensive distribution network and fabrication capabilities ensure your 
                industrial needs are met efficiently.
              </motion.p>
              
              <motion.div 
                className="grid grid-cols-2 gap-6 pt-4"
                variants={passionContainer}
              >
                <motion.div 
                  className="flex items-center gap-3"
                  variants={passionText}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"
                    variants={passionIcon}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Truck className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Fast Delivery</h4>
                    <p className="text-sm text-gray-600">Island-wide coverage</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-3"
                  variants={passionText}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"
                    variants={passionIcon}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Shield className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality Assured</h4>
                    <p className="text-sm text-gray-600">Top-grade materials</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-3"
                  variants={passionText}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"
                    variants={passionIcon}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Users className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Expert Support</h4>
                    <p className="text-sm text-gray-600">24/7 assistance</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-3"
                  variants={passionText}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"
                    variants={passionIcon}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Settings className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Custom Solutions</h4>
                    <p className="text-sm text-gray-600">Tailored to your needs</p>
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-4"
                variants={passionText}
              >
                <motion.div
                  whileHover={productButtonHover}
                  whileTap={buttonPress}
                >
                  <Button asChild className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-hover transition-colors duration-200 font-semibold">
                    <Link to="/products">Explore Products</Link>
                  </Button>
                </motion.div>
                {/* Removed Contact Sales button */}
              </motion.div>
            </motion.div>
            
            {/* Image */}
            <motion.div 
              className="relative overflow-hidden"
              variants={passionText}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <img 
                  src={heroTechnical} 
                  alt="Industrial Tools and Equipment"
                  className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
                />
              </motion.div>
              
              {/* Floating Elements */}
              <motion.div 
                className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              ></motion.div>
              <motion.div 
                className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              ></motion.div>
              
              {/* Stats Overlay */}
              <motion.div 
                className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg"
                variants={floatingStats}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-gray-600">Happy Clients</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg"
                variants={floatingStats}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                animate={{
                  y: [-5, 5, -5],
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }
                }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured products carousel */}
      <section className="container mx-auto pb-12 px-4">
        <motion.div 
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl">Featured products</h2>
          <motion.a 
            href="/products" 
            className="underline"
            whileHover={{ scale: 1.05 }}
            whileTap={buttonPress}
            transition={{ duration: 0.2 }}
          >
            View all
          </motion.a>
        </motion.div>
        <div className="overflow-hidden">
          <Carousel>
            <CarouselContent>
              {[
                { img: bearing, title: "Ball Bearings" },
                { img: hose, title: "Hydraulic Hose" },
                { img: hexnuts, title: "Hex Nuts & Bolts" },
              ].map((p, index) => (
                <CarouselItem
                  key={p.title}
                  className="basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    variants={carouselItem}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div
                      whileHover={carouselCardHover}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden">
                        <CardContent className="p-0">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <img
                              src={p.img}
                              alt={`${p.title} catalog image`}
                              className="w-full h-48 object-cover rounded-t-lg"
                              loading="lazy"
                            />
                          </motion.div>
                          <div className="p-4">
                            <div className="font-medium">{p.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Price on request
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* CTA
      <section className="container mx-auto pb-20">
        <div className="rounded-xl border p-8 md:p-10 bg-gradient-to-br from-accent/10 to-secondary/10">
          <h3 className="font-display text-2xl">Ready to source your parts?</h3>
          <p className="text-muted-foreground mt-2">
            Send us your part numbers or application details. We'll recommend
            the right solution.
          </p>
          <div className="mt-5 flex gap-3">
            <Button variant="hero" asChild>
              <a href="/contact">Get a quote</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/products">Explore catalog</a>
            </Button>
          </div>
        </div>
      </section> */}
    </motion.main>
  );
};

export default Index;
