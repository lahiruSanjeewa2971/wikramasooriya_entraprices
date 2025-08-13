import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

const AuthLayout = ({ 
  title, 
  subtitle, 
  children 
}) => {
  return (
    <>
      <Helmet>
        <title>{title} - Wikramasooriya Enterprises</title>
        <meta name="description" content={subtitle} />
      </Helmet>
      
      <div className="min-h-screen flex">
        {/* Left side - Industrial Background */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div 
            className="w-full bg-cover bg-center bg-no-repeat relative"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-primary/80"></div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center items-center h-full p-12 text-white">
              <div className="max-w-md text-center">
                <h1 className="text-4xl font-bold mb-6">
                  Wikramasooriya Enterprises
                </h1>
                <p className="text-xl text-primary-foreground/90 mb-8">
                  Professional Industrial Spare Parts & Equipment Supplier
                </p>
                <div className="space-y-4 text-sm text-primary-foreground/80">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>Trusted by 1000+ Industrial Clients</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>Premium Quality Components</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>24/7 Technical Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-8">
            {/* Back to Home Link */}
            <div className="text-left">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-2xl font-bold text-primary">
                Wikramasooriya Enterprises
              </h1>
              <p className="text-muted-foreground">Industrial Spare Parts Supplier</p>
            </div>

            {/* Form Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">{title}</h2>
              {subtitle && (
                <p className="mt-2 text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {/* Form Content */}
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
