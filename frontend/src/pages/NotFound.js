import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEOHead from "../components/SEOHead";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center py-20">
      <SEOHead
        title="Page Not Found - Orgainse Consulting"
        description="The page you're looking for could not be found. Return to Orgainse Consulting homepage for AI project management services."
        canonical="https://orgainse.com/404"
        noindex={true}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Page Not Found
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              The page you're looking for doesn't exist. Let's get you back on track with our AI consulting services.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              data-testid="notfound-home-link"
              to="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowRight className="mr-3 h-5 w-5" />
              Back to Homepage
            </Link>

            <div className="text-sm text-slate-500 mt-6">
              <p>Popular pages:</p>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                <Link to="/services" className="text-orange-600 hover:text-orange-700 font-medium">Services</Link>
                <Link to="/about" className="text-orange-600 hover:text-orange-700 font-medium">About</Link>
                <Link to="/contact" className="text-orange-600 hover:text-orange-700 font-medium">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
