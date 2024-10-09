import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShops, updateRole, deleteShop } from '@/store/admin/shops-slice'; // Redux actions
import { useToast } from '../../components/ui/use-toast';

const Shops = () => {
  const { shops, isLoading } = useSelector((state) => state.shops); // Redux state
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const [selectedRole, setSelectedRole] = useState({});

  // Fetch shops when component mounts
  useEffect(() => {
    dispatch(fetchShops()); // Dispatch fetchShops action to get all shops
  }, [dispatch]);

  const handleRoleChange = (shopId, role) => {
    setSelectedRole({ ...selectedRole, [shopId]: role });
    dispatch(updateRole({ shopId, role }))
      .then((data) => {
        if (data?.payload?.success) {
          toast({
            title: 'Role updated successfully!',
          });
        }
      });
  };

  const handleDeleteShop = (shopId) => {
    const confirmed = window.confirm('Are you sure you want to delete this shop?');
    if (confirmed) {
      dispatch(deleteShop(shopId))
        .then((data) => {
          if (data?.payload?.success) {
            toast({
              title: 'Shop deleted successfully!',
            });
          }
        });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Shops & Salesmen</h2>
     

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="grid gap-4">
          {shops?.length > 0 ? (
            shops.map((shop) => (
              <li key={shop._id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
                <div>
                  <p className="font-medium">{shop.userName}</p>
                  <p className="text-sm text-gray-600">{shop.phoneNo}</p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    className="p-2 border rounded-md"
                    value={selectedRole[shop._id] || shop.role}
                    onChange={(e) => handleRoleChange(shop._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="salesman">Salesman</option>
                    {/* <option value="admin">Admin</option> */}
                  </select>

                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteShop(shop._id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p>No shops or salesmen found</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Shops;
