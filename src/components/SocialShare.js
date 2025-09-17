import React from 'react';
import { Share2, Twitter, Linkedin, Facebook, Mail, Link, MessageCircle, Send } from 'lucide-react';

const SocialShare = ({ 
  url = window.location.href, 
  title = "AI Project Management Service | Orgainse Consulting",
  description = "Transform your business with AI-powered project management. 340% ROI, 25% faster delivery.",
  hashtags = "AI,ProjectManagement,DigitalTransformation,PMaaS"
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);

  const shareData = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    description: encodeURIComponent(description),
    hashtags: encodeURIComponent(hashtags)
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${shareData.url}&text=${shareData.title}&hashtags=${shareData.hashtags}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareData.url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareData.url}&quote=${shareData.title}`,
    email: `mailto:?subject=${shareData.title}&body=${shareData.description}%0A%0A${shareData.url}`,
    whatsapp: `https://wa.me/?text=${shareData.title}%20${shareData.url}`,
    telegram: `https://t.me/share/url?url=${shareData.url}&text=${shareData.title}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      {/* Share Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        aria-label="Share this page"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]">
          {/* Twitter */}
          <button
            onClick={() => handleShare('twitter')}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Twitter className="h-4 w-4 mr-3 text-blue-500" />
            Share on Twitter
          </button>

          {/* LinkedIn */}
          <button
            onClick={() => handleShare('linkedin')}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <Linkedin className="h-4 w-4 mr-3 text-blue-700" />
            Share on LinkedIn
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleShare('facebook')}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors"
          >
            <Facebook className="h-4 w-4 mr-3 text-blue-800" />
            Share on Facebook
          </button>

          {/* Email */}
          <button
            onClick={() => handleShare('email')}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Mail className="h-4 w-4 mr-3 text-gray-600" />
            Share via Email
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Link className="h-4 w-4 mr-3 text-gray-600" />
            {copySuccess ? 'Link Copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default SocialShare;