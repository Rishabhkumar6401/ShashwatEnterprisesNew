import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { getAllBrands } from '@/store/admin/brands-slice'; // Adjust path based on your structure
import { getAllCategories } from '@/store/admin/category-slice';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "@/components/Loader";
const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: 0,
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Adjust based on your requirement
  const [hasMore, setHasMore] = useState(true);

  const { productList } = useSelector((state) => state.adminProducts);
  const { categoriesList } = useSelector((state) => state.category);
  const { brandsList } = useSelector((state) => state.brands);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const fetchProducts = useCallback(() => {
    if (!hasMore) return; // Don't fetch if no more items to load

    dispatch(fetchAllProducts({ page: currentPage, limit: itemsPerPage })).then((data) => {
      if (data?.payload?.success && data.payload.data.length < itemsPerPage) {
        setHasMore(false); // No more products to load
      }
    });
  }, [currentPage, dispatch, hasMore, itemsPerPage]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop + 100 >=
      document.documentElement.scrollHeight || !hasMore) return;
    setCurrentPage((prev) => prev + 1); // Load next page
  }, [hasMore]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  function onSubmit(event) {
    event.preventDefault();

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
            window.location.reload();
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            setImageFile(null);
            setFormData(initialFormData);
            window.location.href="/admin/products"
            toast({
              title: "Product added successfully",
            });
          }
        });
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        window.location.reload();
      }
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview")
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }
  
  function markInStock(productId) {
    dispatch(editProduct({ id: productId, formData: { salePrice: 0 } }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          window.location.reload();
          toast({
            title: "Product marked as in stock",
          });
        }
      });
  }
  
  const markOutOfStock = (productId) => {
    dispatch(editProduct({ id: productId, formData: { salePrice: 10 } }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts()); // Fetch updated product list
          window.location.reload();
          toast({
            title: "Product marked as out of stock",
          });
        } else {
          toast({
            title: "Failed to mark product as out of stock",
            description: data?.payload?.message || "Something went wrong.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Error marking product as out of stock:", error);
        toast({
          title: "Error",
          description: "Failed to mark product as out of stock.",
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
    dispatch(getAllBrands());
    dispatch(getAllCategories());
  }, [dispatch]);

  // Update the registerFormControls to include the beats
  const UpdatedaddProductFormElements = addProductFormElements.map((control) => {
    if (control.name === "brand") {
      return {
        ...control,
        options: brandsList.map((brand) => ({
          id: brand.brandName,
          label: brand.brandName,
        })),
      };
    }
    else if (control.name === "category") {
      return {
        ...control,
        options: categoriesList.map((category) => ({
          id: category.categoryName,
          label: category.categoryName,
        })),
      };
    }
    return control;
  });

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)} size="sm">
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                key={productItem._id}
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
                markInStock={markInStock} // Pass the function
                markOutOfStock={markOutOfStock}
              />
            ))
          : null}
      </div>
      {hasMore && <div className="text-center py-4"><Loader /></div>}
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={UpdatedaddProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
