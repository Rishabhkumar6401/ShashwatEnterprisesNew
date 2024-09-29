import { Fragment, useEffect } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { getAllBrands } from "@/store/admin/brands-slice";
import { getAllCategories } from "@/store/admin/category-slice";

function ProductFilter({ filters, handleFilter }) {
  const dispatch = useDispatch();

  // Fetch brands and categories from Redux store
  const { brandsList } = useSelector((state) => state.brands);
  const { categoriesList } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getAllBrands()); // Fetch brands when component mounts
    dispatch(getAllCategories()); // Fetch categories when component mounts
  }, [dispatch]);

  // Prepare filter options by combining dynamic brands and categories
  const filterOptions = {
    brand: brandsList.map((brand) => ({
      id: brand.brandName, 
      label: brand.brandName,
      imageUrl: brand.imageUrl, // Include imageUrl if needed
    })),
    category: categoriesList.map((category) => ({
      id: category.categoryName,
      label: category.categoryName,
      imageUrl: category.imageUrl, // Include imageUrl if needed
    })),
  };

  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-extrabold">Filters</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-base font-bold">{keyItem}</h3>
              <div className="grid gap-2 mt-2">
                {filterOptions[keyItem].map((option) => (
                  <Label
                    key={option.id}
                    className="flex font-medium items-center gap-2"
                  >
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[keyItem] &&
                        filters[keyItem].indexOf(option.id) > -1
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
