import {Helmet} from 'react-helmet-async'
import React from "react";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card'
import {Carousel, CarouselContent, CarouselItem} from '@/components/ui/carousel'
import {Wrench, Tag, Package} from 'lucide-react'
import heroPhoto from '@/assets/pages/hero-photo.jpg'
import heroTechnical from "@/assets/pages/hero-technical.jpg";
import heroPhotoMobile from "@/assets/pages/hero-photo-mobile.jpg";
import bearing from "@/assets/pages/product-bearing.jpg";
import hose from "@/assets/pages/product-hose.jpg";
import hexnuts from "@/assets/pages/product-hexnuts.jpg";
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <main>
      <Helmet>
        <title>Wikramasooriya Enterprises | Industrial Spare Parts</title>
        <meta
          name="description"
          content="Discover high‑quality industrial spare parts with island‑wide delivery and expert support."
        />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <picture>
          <source media="(max-width: 768px)" srcSet={heroPhotoMobile} />
          <img
            src={heroPhoto}
            alt="Industrial spare parts on a workbench"
            className="w-full h-[60vh] md:h-[72vh] object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute inset-0 container mx-auto flex items-end pb-12">
          <div className="max-w-2xl animate-enter">
            <h1 className="font-display text-4xl md:text-5xl leading-tight">
              Discover the Perfect Solution
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Professional, reliable, and island‑wide. From bearings to hoses
              and fasteners, we deliver quality parts on time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="hero" asChild>
                <a href="/contact">Request a Quote</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/products">Browse Products</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto py-14">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5" />
                <CardTitle>High Quality Industrial Tools</CardTitle>
              </div>
              <CardDescription>
                Trusted components sourced from reputable manufacturers.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5" />
                <CardTitle>Unbeatable Prices</CardTitle>
              </div>
              <CardDescription>
                Competitive pricing with consistent availability.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5" />
                <CardTitle>Direct Importing</CardTitle>
              </div>
              <CardDescription>
                Island‑wide distribution with flexible logistics.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Featured products carousel */}
      <section className="container mx-auto pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Featured products</h2>
          <a href="/products" className="underline">
            View all
          </a>
        </div>
        <Carousel>
          <CarouselContent>
            {[
              { img: bearing, title: "Ball Bearings" },
              { img: hose, title: "Hydraulic Hose" },
              { img: hexnuts, title: "Hex Nuts & Bolts" },
            ].map((p) => (
              <CarouselItem
                key={p.title}
                className="basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <Card className="mr-4">
                  <CardContent className="p-0">
                    <img
                      src={p.img}
                      alt={`${p.title} catalog image`}
                      className="w-full h-48 object-cover rounded-t-lg"
                      loading="lazy"
                    />
                    <div className="p-4">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Price on request
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* CTA */}
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
      </section>
    </main>
  );
};

export default Index;
