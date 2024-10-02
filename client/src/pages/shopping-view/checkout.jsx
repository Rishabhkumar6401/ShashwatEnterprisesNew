import Address from "@/components/shopping-view/address";
import img from "../../assets/account.webp";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice"; 
import { clearCart } from "@/store/shop/cart-slice"; 
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { clearCartFromDB } from "@/store/shop/cart-slice"; // Import the thunk to clear cart from DB

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

      function handlePlaceOrder() {
        if (cartItems.length === 0) {
          toast({
            title: "Your cart is empty. Please add items to proceed",
            variant: "destructive",
          });
          return;
        }
        if (currentSelectedAddress === null) {
          toast({
            title: "Please select one address to proceed.",
            variant: "destructive",
          });
          return;
        }
      
        // Check if Geolocation API is available
        if (!navigator.geolocation) {
          toast({
            title: "Geolocation is not supported by your browser.",
            variant: "destructive",
          });
          return;
        }
      
        // Get the current location of the user
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
      
            const salesmanId = localStorage.getItem('salesmanId') || null;
      
            const orderData = {
              userId: user?.id,
              salesmanId: salesmanId || null,
              cartId: cartItems?._id,
              cartItems: cartItems.items.map((singleCartItem) => ({
                productId: singleCartItem?.productId,
                title: singleCartItem?.title,
                image: singleCartItem?.image,
                price: singleCartItem?.salePrice > 0
                  ? singleCartItem?.salePrice
                  : singleCartItem?.price,
                quantity: singleCartItem?.quantity,
              })),
              addressInfo: {
                addressId: currentSelectedAddress?._id,
                shopName: user?.userName,
                address: currentSelectedAddress?.address,
                phone: currentSelectedAddress?.phone,
                notes: currentSelectedAddress?.notes,
              },
              orderStatus: "pending",
              paymentMethod: "cash-on-delivery",
              paymentStatus: "pending",
              totalAmount: totalCartAmount,
              orderDate: new Date(),
              orderUpdateDate: new Date(),
              // Add the current location to the order
              location: {
                latitude,
                longitude,
              },
            };
      
            setIsLoading(true); // Start loading
      
            // Dispatch the order creation request
            dispatch(createNewOrder(orderData)).then((data) => {
              setIsLoading(false); // End loading
              console.log(data);
              if (data?.payload?.success) {
                toast({
                  title: "Order placed successfully! An email has been sent to the admin.",
                  variant: "success",
                });
                // Clear the cart both from the database and state
                dispatch(clearCartFromDB(user?.id)); // Call the thunk to clear the cart from DB
                dispatch(clearCart()); // Clear the cart in Redux state
                // Redirect to Order Success Page
                navigate("/shop/orderSuccess");
              } else {
                toast({
                  title: "Order placement failed. Please try again.",
                  variant: "destructive",
                });
              }
            });
          },
          (error) => {
            toast({
              title: "Unable to retrieve your location. Please enable location permissions.",
              variant: "destructive",
            });
          }
        );
      }
      

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">₹{totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button onClick={handlePlaceOrder} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Placing Order...
                </div>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
