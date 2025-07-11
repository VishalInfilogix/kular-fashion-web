"use client";

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface CartButtonsProps {
  productsLength: number;
  onPlaceOrder: () => void;
  isPlacingOrder?: boolean;
  isAddressAndPaymentSelected?: boolean;
}

const CartButtons = ({ 
  productsLength, 
  onPlaceOrder,
  isPlacingOrder = false,
  isAddressAndPaymentSelected = true
}: CartButtonsProps) => {
  return (
    <div className="mt-4">
      <motion.div whileHover={{ scale: productsLength > 0 ? 1.05 : 1 }}>
        <Button 
          className="w-full rounded-none uppercase"
          disabled={productsLength === 0 || isPlacingOrder}
          onClick={onPlaceOrder}
        >
          {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
        </Button>
      </motion.div>
    </div>
  );
};

export default CartButtons;