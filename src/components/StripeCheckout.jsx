
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed Badge import as its usage in JSX was removed
import { Loader2, CreditCard } from "lucide-react"; // Removed CheckCircle, AlertCircle as their usage in JSX was removed
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// New imports for React Query and Toast notifications
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Import security utilities as specified in the outline
import { checkRateLimit, sanitizeInput, isValidEmail, isValidUrl, generateCSRFToken } from "./utils/security";

export default function StripeCheckout({
  amount,
  itemType, // New prop: identifies the type of item being purchased (e.g., 'credit_pack', 'subscription', 'model_unlock')
  itemDescription,
  onSuccess, // Callback function to execute on successful payment (after redirection and server-side processing)
  children // React children, typically a button or element that triggers the checkout flow
}) {
  const [isLoading, setIsLoading] = useState(false); // Renamed from isProcessing to isLoading
  const [showConfirm, setShowConfirm] = useState(false); // Retained to control the confirmation dialog visibility
  // Removed: const [error, setError] = useState(null); // Error handling now uses react-hot-toast

  // Fetch user data using react-query for automatic caching and re-fetching
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000, // User data considered fresh for 5 minutes
    // Add error handling for the query if user data is critical for rendering.
  });

  const handleCheckout = async () => {
    // Ensure user is logged in before proceeding
    if (!user?.email) {
      toast.error('Please log in to continue with your purchase.');
      return;
    }

    // Security: Basic input validation for critical payment details
    if (!amount || amount <= 0) {
      toast.error('Invalid payment amount. Please provide a positive amount.');
      return;
    }

    if (!itemType || !itemDescription) {
      toast.error('Payment details are incomplete. Please specify item type and description.');
      return;
    }

    // Security: Implement rate limiting to prevent abuse or brute-force attempts
    // Allows 5 checkout attempts per user email within a 60-second window
    if (!checkRateLimit(`checkout_${user.email}`, 5, 60000)) {
      toast.error('Too many checkout attempts. Please wait a moment before trying again.');
      return;
    }

    setIsLoading(true); // Set loading state to true while processing

    try {
      // Security: Sanitize user-provided item description before sending to backend/database
      // This helps prevent XSS or other injection attacks
      const sanitizedDescription = sanitizeInput(itemDescription);

      // Create a payment record in Base44 with initial 'pending' status
      const payment = await base44.entities.Payment.create({
        user_email: user.email,
        amount: parseFloat(amount), // Ensure amount is stored as a number
        currency: "USD", // Hardcoded currency for now
        payment_type: itemType, // Use the new itemType prop for categorization
        item_description: sanitizedDescription,
        status: "pending",
        // Removed fields like subscription_tier, credits_added, model_unlocked
        // as they are no longer passed as direct props to this component.
        // If needed, this component should be refactored to accept them in a structured 'metadata' prop.
      });

      // Call a utility function to create a Stripe Checkout Session.
      // IMPORTANT SECURITY NOTE: In a production environment, this function
      // should *always* make an API call to your backend server.
      // Your backend server, not the client, should directly interact with the Stripe API
      // using your Stripe Secret Key to protect sensitive API keys.
      const checkoutUrl = await createStripeCheckoutSession({
        amount: amount,
        itemType: itemType,
        itemDescription: sanitizedDescription,
        userEmail: user.email,
        paymentId: payment.id, // Pass the generated payment ID for tracking
        // Construct success and cancel URLs, embedding the payment_id for post-redirect processing
        successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
        cancelUrl: `${window.location.origin}/payment-cancelled?payment_id=${payment.id}`
      });

      // Redirect the user to the Stripe Checkout page
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('Checkout error:', error);
      // Display a user-friendly error message using react-hot-toast
      toast.error(error.message || 'Failed to initiate checkout. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state regardless of success or failure
    }
  };

  return (
    <>
      {/* Wrapper element that, when clicked, opens the confirmation dialog */}
      <div onClick={() => setShowConfirm(true)}>
        {children} {/* Renders the trigger element (e.g., a button) */}
      </div>

      {/* Confirmation Dialog component */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-gray-900 border-2 border-blue-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-400 flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Review your purchase before proceeding to Stripe checkout
            </DialogDescription>
          </DialogHeader>

          <Card className="bg-gray-800 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-white">{itemDescription}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-3xl font-bold">
                <span className="text-gray-400">Total:</span>
                <span className="text-green-400">${amount?.toFixed(2) || '0.00'}</span> {/* Display formatted amount */}
              </div>

              {/* The following conditional blocks for displaying credits, subscription tier,
                  and model unlock details have been removed because the corresponding props
                  (creditsToAdd, subscriptionTier, modelToUnlock) are no longer passed to this component.
                  If these details are still required, they should be passed as part of itemDescription or a new 'details' prop. */}

              {/* Error display block removed, errors are now handled by react-hot-toast */}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  disabled={isLoading} // Disable if a checkout process is ongoing
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckout} // Trigger the checkout process
                  disabled={isLoading || !user?.email} // Disable if loading or user is not logged in
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                >
                  {isLoading ? ( // Show loading spinner if processing
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : ( // Show "Pay with Stripe" otherwise
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay with Stripe
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Stripe
              </p>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * createStripeCheckoutSession
 * This function is a client-side representation of what should ideally be an API call
 * to your backend server. The backend would then securely communicate with Stripe.
 *
 * SECURITY: Direct calls to Stripe API from client-side with secret keys are unsafe.
 * This function simulates that interaction but must be replaced by a proper backend endpoint
 * that creates the Stripe Checkout Session.
 *
 * @param {object} data - Object containing details needed to create a Stripe Checkout Session.
 * @returns {Promise<string>} A promise that resolves with the Stripe checkout URL.
 * @throws {Error} If required data is missing or validation fails, or if the API call fails.
 */
async function createStripeCheckoutSession(data) {
  const {
    amount,
    itemType,
    itemDescription,
    userEmail,
    paymentId,
    successUrl,
    cancelUrl
  } = data;

  // Security: Server-side validation of input data is crucial. This is client-side pre-validation.
  if (!amount || amount <= 0 || !itemType || !userEmail) {
    throw new Error('Missing or invalid required checkout data for session creation.');
  }

  // Security: Validate email format to ensure it's a legitimate email
  if (typeof userEmail !== 'string' || !isValidEmail(userEmail)) {
    throw new Error('Invalid email address format provided.');
  }

  // Security: Validate redirect URLs to prevent open redirect vulnerabilities
  if (typeof successUrl !== 'string' || !isValidUrl(successUrl)) {
    throw new Error('Invalid success URL provided.');
  }
  if (typeof cancelUrl !== 'string' || !isValidUrl(cancelUrl)) {
    throw new Error('Invalid cancel URL provided.');
  }

  // TODO: Replace this `fetch` call with an actual API call to your backend server.
  // The backend should receive these details, securely call the Stripe API,
  // and return the Stripe Checkout Session URL.
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Security: Include a CSRF token if your backend framework utilizes them for protection
      'X-CSRF-Token': generateCSRFToken() // Placeholder: ensure `generateCSRFToken()` is implemented to provide a valid token
    },
    body: JSON.stringify({
      amount: amount,
      itemType: itemType,
      itemDescription: itemDescription,
      userEmail: userEmail,
      paymentId: paymentId,
      successUrl: successUrl,
      cancelUrl: cancelUrl
    })
  });

  if (!response.ok) {
    // Attempt to parse error message from response, or provide a generic one
    const errorData = await response.json().catch(() => ({ message: 'Unknown error during checkout session creation.' }));
    throw new Error(errorData.message || 'Failed to create Stripe checkout session. Please contact support.');
  }

  const { url } = await response.json(); // Expecting a JSON response with a 'url' field
  // Final validation of the received URL to ensure it's valid before redirecting
  if (!url || typeof url !== 'string' || !isValidUrl(url)) {
    throw new Error('Invalid checkout URL received from the server.');
  }
  return url;
}
