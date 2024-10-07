import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";

import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { searchResults } = useSelector((state) => state.shopSearch);
  const { productList, productDetails, currentPage, hasMore, isLoading } = useSelector(
    (state) => state.shopProducts
  );
   
  

  const { user } = useSelector((state) => state.auth);

  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();
  useEffect(() => {
    if (keyword && keyword.trim() !== "" && keyword.trim().length > 3) {
      setTimeout(() => {
        setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
        dispatch(getSearchResults(keyword));
      }, 1000);
    } else {
      setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
      dispatch(resetSearchResults());
    }
  }, [keyword]);

  function handleAddtoCart(getCurrentProductId) {
    // Get current cart items
    let getCartItems = cartItems.items || [];

    // Check if the item is already in the cart
    const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
    );

    // If the item is already in the cart, increment the quantity
    if (indexOfCurrentItem > -1) {
        // Increment the quantity of the existing item
        dispatch(
            updateCartItemQuantity({
                userId: user?.id,
                productId: getCurrentProductId,
                quantity: getCartItems[indexOfCurrentItem].quantity + 1,
            })
        );
    } else {
        // If the item is not in the cart, add it
        dispatch(
            addToCart({
                userId: user?.id,
                productId: getCurrentProductId,
                quantity: 1,
            })
        );
    }

    // Dispatch the fetchCartItems action after adding/updating
    dispatch(fetchCartItems(user?.id));

    // Notify the user
    
}

function handleUpdateQuantity(productId, value) {
  let getCartItems = cartItems.items || [];
  const cartItem = getCartItems.find((item) => item.productId === productId);

  if (!cartItem) {
    toast({
      title: "Product not found in the cart",
      variant: "destructive",
    });
    return;
  }

  // Now we will check `searchResults` instead of `productList`
  const product = searchResults.find((item) => item._id === productId);
  if (!product) {
    toast({
      title: "Product details not found",
      variant: "destructive",
    });
    return;
  }

  // const getTotalStock = product.totalStock; // Uncomment if totalStock logic needed
  let newQuantity = value;

  if (newQuantity < 1) {
    dispatch(deleteCartItem({ userId: user?.id, productId })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
      } else {
        toast({
          title: "Failed to delete cart item",
          variant: "destructive",
        });
      }
    });
    return;
  }

  dispatch(
    updateCartQuantity({
      userId: user?.id,
      productId,
      quantity: newQuantity,
    })
  ).then((data) => {
    if (data?.payload?.success) {
      dispatch(fetchCartItems(user?.id));
    } else {
      toast({
        title: "Failed to update cart item",
        variant: "destructive",
      });
    }
  });
}



  function handleGetProductDetails(getCurrentProductId) {
   
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  

  return (
    <div className="container mx-auto md:px-6 px-4 py-8 mt-16">
      <div className="flex justify-center mb-8">
        <div className="w-full flex items-center">
          <Input
            value={keyword}
            name="keyword"
            onChange={(event) => setKeyword(event.target.value)}
            className="py-6"
            placeholder="Search Products..."
          />
        </div>
      </div>
      {!searchResults.length ? (
        <h1 className="text-5xl font-extrabold">No result found!</h1>
      ) : null}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {searchResults.map((item) => (
          <ShoppingProductTile
            product={item}
            handleGetProductDetails={handleGetProductDetails}
            handleAddtoCart={handleAddtoCart}
            cartItems={cartItems}
            handleUpdateQuantity={handleUpdateQuantity}
          />
        ))}
      </div>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default SearchProducts;
