import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-yellow-500/50 bg-gray-900 max-w-md">
          <CardContent className="p-12 text-center">
            <XCircle className="w-24 h-24 text-yellow-400 mx-auto mb-6" />

            <h1 className="text-3xl font-bold text-yellow-400 mb-4">
              Payment Cancelled
            </h1>

            <p className="text-lg text-gray-300 mb-8">
              No worries! Your payment was cancelled and you haven't been charged.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => navigate(-1)}
                className="w-full gold-gradient text-black hover:opacity-90"
                size="lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("Dashboard"))}
                variant="outline"
                className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                Return to Dashboard
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Questions? Contact support@bodigi-digital.com
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}