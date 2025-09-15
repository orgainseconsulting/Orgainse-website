import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle,
  AlertCircle,
  Loader,
  ExternalLink
} from 'lucide-react';

const GoogleCalendarBooking = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('slots'); // slots, booking, confirmation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Slots state
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Booking state
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service_type: 'Free Consultation',
    message: ''
  });
  
  // Confirmation state
  const [bookingResult, setBookingResult] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';
  const api_url = '/api';

  // Fetch available time slots when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableSlots();
    }
  }, [isOpen]);

  // Fetch available time slots from organization calendar
  const fetchAvailableSlots = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.get(`${API_BASE_URL}/api/calendar/available-slots`, {
        params: { 
          duration: 30
        }
      });
      
      setAvailableSlots(response.data.slots || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      if (error.response?.status === 503) {
        setError('Organization calendar not available. Please try again later or contact support.');
      } else {
        setError('Failed to load available time slots. Please try again.');
      }
      setIsLoading(false);
    }
  };

  // Handle slot selection
  const selectSlot = (slot) => {
    setSelectedSlot(slot);
    setStep('booking');
  };

  // Handle booking form submission
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const bookingRequest = {
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        company: bookingData.company,
        service_type: bookingData.service_type,
        start_datetime: selectedSlot.start_datetime,
        end_datetime: selectedSlot.end_datetime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        message: bookingData.message
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/calendar/book-consultation`,
        bookingRequest
      );

      setBookingResult(response.data);
      setStep('confirmation');
      setSuccess('Consultation booked successfully!');
    } catch (error) {
      console.error('Booking failed:', error);
      if (error.response?.status === 503) {
        setError('Organization calendar not available. Please try again later or contact support.');
      } else {
        setError(
          error.response?.data?.detail || 
          'Failed to book consultation. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDateTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-orange-600" />
              Book Free Consultation
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-4 space-x-2">
            {['slots', 'booking', 'confirmation'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === stepName ? 'bg-orange-600 text-white' :
                  ['slots', 'booking', 'confirmation'].indexOf(step) > index ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {['slots', 'booking', 'confirmation'].indexOf(step) > index ? 
                    <CheckCircle className="h-4 w-4" /> : index + 1
                  }
                </div>
                {index < 2 && (
                  <div className={`w-12 h-1 ml-2 ${
                    ['slots', 'booking', 'confirmation'].indexOf(step) > index ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Step 1: Available Slots */}
          {step === 'slots' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Available Time</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
                  <p className="text-gray-600">Loading available time slots...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => selectSlot(slot)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-orange-700">
                          {formatDateTime(slot.start_datetime)}
                        </div>
                        <div className="text-sm text-gray-600">30 minutes</div>
                      </div>
                      <Clock className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No available slots found for the next 7 days.</p>
                  <Button 
                    onClick={fetchAvailableSlots}
                    variant="outline"
                  >
                    Refresh Slots
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Booking Form */}
          {step === 'booking' && selectedSlot && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h3>
              
              {/* Selected Time Display */}
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <div className="font-semibold text-orange-900">
                      {formatDateTime(selectedSlot.start_datetime)}
                    </div>
                    <div className="text-sm text-orange-700">30-minute consultation</div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={bookingData.name}
                      onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                      required
                      className="w-full"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                      required
                      className="w-full"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                      className="w-full"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="h-4 w-4 inline mr-1" />
                      Company
                    </label>
                    <Input
                      type="text"
                      value={bookingData.company}
                      onChange={(e) => setBookingData({...bookingData, company: e.target.value})}
                      className="w-full"
                      placeholder="Your company name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    value={bookingData.service_type}
                    onChange={(e) => setBookingData({...bookingData, service_type: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Free Consultation">Free Consultation</option>
                    <option value="AI Strategy Session">AI Strategy Session</option>
                    <option value="Digital Transformation">Digital Transformation</option>
                    <option value="Project Management">Project Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Message
                  </label>
                  <Textarea
                    value={bookingData.message}
                    onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                    className="w-full"
                    rows={3}
                    placeholder="Tell us about your specific needs or questions..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('slots')}
                    className="flex-1"
                  >
                    ← Back to Slots
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !bookingData.name || !bookingData.email}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirmation' && bookingResult && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your consultation has been successfully scheduled and added to your calendar.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-4">Meeting Details:</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Client:</strong> {bookingResult.name}</p>
                  <p><strong>Service:</strong> {bookingResult.service_type}</p>
                  <p><strong>Date & Time:</strong> {formatDateTime(bookingResult.start_datetime)}</p>
                  <p><strong>Duration:</strong> 30 minutes</p>
                  <p><strong>Timezone:</strong> {bookingResult.timezone}</p>
                </div>
              </div>

              <div className="space-y-3">
                {bookingResult.html_link && (
                  <a
                    href={bookingResult.html_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Google Calendar
                  </a>
                )}
                
                {bookingResult.meet_link && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Google Meet Link:</strong>
                    </p>
                    <a
                      href={bookingResult.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 underline break-all"
                    >
                      {bookingResult.meet_link}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 text-sm text-gray-600">
                <p>📧 You'll receive a confirmation email with all the details.</p>
                <p>📅 Calendar reminders will be sent 24 hours and 15 minutes before the meeting.</p>
              </div>

              <Button
                onClick={onClose}
                className="mt-6 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarBooking;