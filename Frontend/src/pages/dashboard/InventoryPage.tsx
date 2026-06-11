import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../socket';

import {
  Package,
  Search,
  Activity,
  RefreshCw,
  Edit2,
  Save,
  X,
  Plus,
  Minus
} from 'lucide-react';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const InventoryPage = () => {

  const { user } = useAuth();

  const [inventory, setInventory] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [selectedBranch, setSelectedBranch] =
    useState('ALL');

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editQty, setEditQty] =
    useState<number>(0);

  const [savingId, setSavingId] =
    useState<string | null>(null);

  /**
   * FETCH INVENTORY
   */
  const fetchInventory =
    async () => {

      try {

        const res =
          await api.get(
            '/inventory'
          );

        setInventory(
          res.data.inventory ||
          res.data.data ||
          res.data ||
          []
        );

      } catch (error) {

        console.error(
          'Inventory fetch failed',
          error
        );

      } finally {

        setLoading(false);
      }
    };

  /**
   * SOCKETS
   */
  useEffect(() => {

    fetchInventory();

    if (user?.branchId) {

      socket.emit(
        'join_branch',
        user.branchId
      );
    }

    socket.on(
      'inventory:updated',
      fetchInventory
    );

    return () => {

      socket.off(
        'inventory:updated',
        fetchInventory
      );
    };

  }, [user?.branchId]);

  /**
   * EDIT
   */
  const startEdit =
    (item: any) => {

      setEditingId(
        item.id
      );

      setEditQty(
        item.quantity
      );
    };

  const cancelEdit =
    () => {

      setEditingId(null);

      setEditQty(0);
    };

  /**
   * SAVE EDIT
   */
  const saveEdit =
    async (
      item: any
    ) => {

      try {

        setSavingId(
          item.id
        );

        await api.patch(
          `/inventory/${item.id}`,
          {
            quantity:
              editQty
          }
        );

        setInventory(
          prev =>
            prev.map(i =>
              i.id === item.id
                ? {
                    ...i,
                    quantity:
                      editQty
                  }
                : i
            )
        );

        setEditingId(null);

      } catch (error) {

        console.error(
          'Failed to update quantity',
          error
        );

      } finally {

        setSavingId(null);
      }
    };

  /**
   * REORDER
   */
  const createReorderRequest =
    async (
      inventoryId: string,
      itemName: string
    ) => {

      const quantity =
        prompt(
          `Enter reorder quantity for ${itemName}`
        );

      if (!quantity) return;

      try {

        await api.post(
          '/reorder-requests',
          {
            inventoryId,

            quantity:
              Number(quantity),

            note:
              `Restock request for ${itemName}`
          }
        );

        alert(
          'Reorder request submitted'
        );

      } catch (error) {

        console.error(
          'Failed to create reorder request',
          error
        );
      }
    };

  /**
   * BRANCHES
   */
  const branches =
    Array.from(
      new Set(
        inventory.map(
          item =>
            item.branch?.city ||
            item.branch?.name
        )
      )
    );

  /**
   * FILTERS
   */
  const filteredInventory =
    inventory.filter(item => {

      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const branchName =
        item.branch?.city ||
        item.branch?.name;

      const matchesBranch =
        selectedBranch === 'ALL'
          ? true
          : branchName ===
            selectedBranch;

      return (
        matchesSearch &&
        matchesBranch
      );
    });

  const criticalStock =
    inventory.filter(
      i =>
        i.quantity <=
        i.criticalLevel
    );

  const lowStock =
    inventory.filter(
      i =>
        i.quantity >
          i.criticalLevel &&
        i.quantity <=
          i.minimumLevel
    );

  const healthyStock =
    inventory.filter(
      i =>
        i.quantity >
        i.minimumLevel
    );

  /**
   * STATUS
   */
  const getStockStatus =
    (item: any) => {

      if (
        item.quantity <=
        item.criticalLevel
      ) {

        return {
          label:
            'CRITICAL',

          color:
            'text-red-500',

          bg:
            'bg-red-500/10',

          border:
            'border-red-500/20'
        };
      }

      if (
        item.quantity <=
        item.minimumLevel
      ) {

        return {
          label:
            'LOW',

          color:
            'text-amber-500',

          bg:
            'bg-amber-500/10',

          border:
            'border-amber-500/20'
        };
      }

      return {
        label:
          'HEALTHY',

        color:
          'text-emerald-500',

        bg:
          'bg-emerald-500/10',

        border:
          'border-emerald-500/20'
      };
    };

  const getStockBarWidth =
    (item: any) => {

      const max =
        item.minimumLevel * 3;

      return Math.min(
        100,

        Math.round(
          (
            item.quantity /
            max
          ) * 100
        )
      );
    };

  /**
   * LOADING
   */
  if (loading) {

    return (
      <div className='flex h-[60vh] items-center justify-center'>

        <div className='animate-pulse flex flex-col items-center'>

          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4'></div>

          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>
            Scanning Asset Cluster
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='pb-20 space-y-12'>

      {/* HEADER */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>

        <div>

          <div className='flex items-center gap-2 mb-4'>

            <Package className='w-4 h-4 text-[var(--primary)]' />

            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>
              Material Logistics & Assets
            </p>
          </div>

          <h1 className='text-5xl font-bold text-white tracking-tight'>
            Stock & Supplies
          </h1>
        </div>

        <button
          onClick={fetchInventory}
          className='w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-[var(--primary)]'
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* STATS */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>

        {[
          {
            label: 'Total Items',
            value: inventory.length,
            color: 'text-white'
          },

          {
            label: 'Critical',
            value: criticalStock.length,
            color: 'text-red-500'
          },

          {
            label: 'Low Stock',
            value: lowStock.length,
            color: 'text-amber-500'
          },

          {
            label: 'Healthy',
            value: healthyStock.length,
            color: 'text-emerald-500'
          }
        ].map((stat, i) => (

          <div
            key={i}
            className='card bg-[#0B0B0B] border-white/5 p-6 flex justify-between items-center'
          >

            <span className='text-[10px] uppercase tracking-[0.2em] font-black text-white/40'>
              {stat.label}
            </span>

            <span
              className={`text-4xl font-black tracking-tighter ${stat.color}`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
      {/* INVENTORY HEALTH */}
<div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>

  {/* HEALTH CHART */}
  <div className='xl:col-span-2 card bg-[#0B0B0B] border border-white/5 rounded-3xl p-8'>

    <div className='flex items-center justify-between mb-8'>

      <div>
        <p className='text-[10px] uppercase tracking-[0.35em] text-[var(--primary)] font-black mb-3'>
          Inventory Intelligence
        </p>

        <h2 className='text-2xl font-bold text-white'>
          Stock Health Distribution
        </h2>
      </div>

      <div className='w-14 h-14 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center'>
        <Activity className='w-6 h-6 text-[var(--primary)]' />
      </div>
    </div>

    <div className='h-[320px]'>

      <ResponsiveContainer
        width='100%'
        height='100%'
      >

        <PieChart>

          <Pie
            data={[
              {
                name: 'Healthy',
                value:
                  healthyStock.length
              },

              {
                name: 'Low',
                value:
                  lowStock.length
              },

              {
                name: 'Critical',
                value:
                  criticalStock.length
              }
            ]}

            cx='50%'
            cy='50%'
            innerRadius={85}
            outerRadius={120}
            paddingAngle={5}
            dataKey='value'
          >

            <Cell fill='#D4AF37' />

            <Cell fill='#F59E0B' />

            <Cell fill='#EF4444' />

          </Pie>

          <Tooltip />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* QUICK HEALTH SUMMARY */}
  <div className='card bg-[#0B0B0B] border border-white/5 rounded-3xl p-8 flex flex-col justify-between'>

    <div>

      <p className='text-[10px] uppercase tracking-[0.35em] text-[var(--primary)] font-black mb-3'>
        System Status
      </p>

      <h2 className='text-2xl font-bold text-white mb-10'>
        Inventory Overview
      </h2>

      <div className='space-y-6'>

        <div className='flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10'>

          <div>
            <p className='text-sm text-white/50'>
              Healthy Assets
            </p>

            <p className='text-3xl font-black text-emerald-500'>
              {healthyStock.length}
            </p>
          </div>

          <div className='w-4 h-4 rounded-full bg-emerald-500'></div>
        </div>

        <div className='flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10'>

          <div>
            <p className='text-sm text-white/50'>
              Low Stock
            </p>

            <p className='text-3xl font-black text-amber-500'>
              {lowStock.length}
            </p>
          </div>

          <div className='w-4 h-4 rounded-full bg-amber-500'></div>
        </div>

        <div className='flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10'>

          <div>
            <p className='text-sm text-white/50'>
              Critical Assets
            </p>

            <p className='text-3xl font-black text-red-500'>
              {criticalStock.length}
            </p>
          </div>

          <div className='w-4 h-4 rounded-full bg-red-500'></div>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* SEARCH + FILTERS */}
      <div className='flex flex-col lg:flex-row gap-4'>

        <div className='relative max-w-md w-full'>

          <Search className='absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20' />

          <input
            type='text'
            placeholder='Search inventory...'
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className='w-full bg-[#0B0B0B] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white'
          />
        </div>

        {user?.role ===
          'INVENTORY_MANAGER' && (

          <select
            value={selectedBranch}
            onChange={(e) =>
              setSelectedBranch(
                e.target.value
              )
            }
            className='bg-[#0B0B0B] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white'
          >
            <option value='ALL'>
              All Branches
            </option>

            {branches.map(branch => (

              <option
                key={branch}
                value={branch}
              >
                {branch}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* INVENTORY TABLE */}
      <div className='card bg-[#0B0B0B] border-white/5 p-0 overflow-hidden'>

        <div className='overflow-x-auto'>

          <table className='w-full'>

            <thead>

              <tr className='border-b border-white/5'>

                <th className='p-6 text-left text-[10px] uppercase tracking-[0.3em] text-white/20'>
                  Item
                </th>

                <th className='p-6 text-left text-[10px] uppercase tracking-[0.3em] text-white/20'>
                  Branch
                </th>

                <th className='p-6 text-left text-[10px] uppercase tracking-[0.3em] text-white/20'>
                  Stock Level
                </th>

                <th className='p-6 text-left text-[10px] uppercase tracking-[0.3em] text-white/20'>
                  Quantity
                </th>

                <th className='p-6 text-left text-[10px] uppercase tracking-[0.3em] text-white/20'>
                  Status
                </th>

                <th className='p-6 text-right text-[10px] uppercase tracking-[0.3em] text-white/20'>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className='divide-y divide-white/[0.03]'>

              {filteredInventory.map(item => {

                const status =
                  getStockStatus(item);

                const barWidth =
                  getStockBarWidth(item);

                const isEditing =
                  editingId ===
                  item.id;

                return (

                  <tr key={item.id}>

                    <td className='p-6'>

                      <p className='font-bold text-white'>
                        {item.name}
                      </p>
                    </td>

                    <td className='p-6'>

                      <p className='text-white/70 font-medium'>
                        {item.branch?.city ||
                          item.branch?.name ||
                          'Unknown'}
                      </p>
                    </td>

                    <td className='p-6 min-w-[160px]'>

                      <div className='h-1.5 bg-white/5 rounded-full overflow-hidden'>

                        <div
                          className={`h-full rounded-full ${
                            item.quantity <=
                            item.criticalLevel
                              ? 'bg-red-500'
                              : item.quantity <=
                                item.minimumLevel
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          style={{
                            width:
                              `${barWidth}%`
                          }}
                        />
                      </div>
                    </td>

                    <td className='p-6'>

                      {isEditing ? (

                        <div className='flex items-center gap-2'>

                          <button
                            onClick={() =>
                              setEditQty(
                                q =>
                                  Math.max(
                                    0,
                                    q - 1
                                  )
                              )
                            }
                          >
                            <Minus size={12} />
                          </button>

                          <input
                            type='number'
                            value={editQty}
                            onChange={e =>
                              setEditQty(
                                Number(
                                  e.target.value
                                )
                              )
                            }
                            className='w-20 bg-white/5 border border-[var(--primary)]/30 rounded-lg px-3 py-1.5 text-sm text-white text-center'
                          />

                          <button
                            onClick={() =>
                              setEditQty(
                                q => q + 1
                              )
                            }
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                      ) : (

                        <p className='text-lg font-black text-white'>

                          {item.quantity}

                          <span className='text-[10px] text-white/30 ml-1'>
                            {item.unit}
                          </span>
                        </p>
                      )}
                    </td>

                    <td className='p-6'>

                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${status.bg} ${status.border} ${status.color}`}>
                        {status.label}
                      </span>
                    </td>

                    <td className='p-6 text-right'>

                      <div className='flex items-center justify-end gap-2'>

                        {user?.role ===
                          'INVENTORY_MANAGER' && (

                          <>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() =>
                                    saveEdit(item)
                                  }
                                  className='px-4 py-2 rounded-xl bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2'
                                >
                                  <Save size={11} />
                                  Save
                                </button>

                                <button
                                  onClick={
                                    cancelEdit
                                  }
                                  className='px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40'
                                >
                                  <X size={11} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  startEdit(item)
                                }
                                className='px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-white/40 text-[9px] uppercase tracking-widest flex items-center gap-2'
                              >
                                <Edit2 size={11} />
                                Edit
                              </button>
                            )}
                          </>
                        )}

                        {item.quantity <=
                          item.minimumLevel && (

                          <button
                            onClick={() =>
                              createReorderRequest(
                                item.id,
                                item.name
                              )
                            }
                            className='px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] uppercase tracking-widest flex items-center gap-2'
                          >
                            <Activity size={11} />
                            Reorder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;