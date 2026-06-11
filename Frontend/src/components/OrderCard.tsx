const OrderCard = ({ order }: any) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'in-progress':
        return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'ready':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'served':
        return 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30';
      default:
        return 'bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/30';
    }
  };

  return (
    <div className='card border border-[var(--tertiary)] hover:border-[var(--primary)]/50 transition-all duration-300'>
      <div className='flex items-start justify-between mb-4'>
        <div>
          <h3 className='text-2xl font-bold text-[var(--text)]'>Table {order.tableNumber || order.table || 'N/A'}</h3>
          <p className='text-[var(--text-secondary)] text-xs mt-1'>ID: {order.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
          {order.status || 'Pending'}
        </span>
      </div>

      {/* Order Items */}
      <div className='space-y-2 mb-4 pb-4 border-b border-[var(--tertiary)]'>
        {order.items?.map((item: any, idx: number) => (
          <div key={idx} className='flex items-center justify-between text-sm'>
            <span className='text-[var(--text-secondary)]'>
              <span className='font-semibold text-[var(--text)]'>{item.quantity}x</span> {item.menuItem?.name || item.name || 'Item'}
            </span>
            <span className='text-[var(--text)] font-medium'>£{(item.menuItem?.price || item.price || 0).toFixed(2)}</span>
          </div>
        )) || (
          <p className='text-[var(--text-secondary)] text-sm'>No items</p>
        )}
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        <button className='flex-1 px-3 py-2 rounded-lg bg-[var(--primary)] text-black font-semibold text-sm hover:bg-yellow-500 transition'>
          ✓ Start
        </button>
        <button className='flex-1 px-3 py-2 rounded-lg border border-[var(--tertiary)] text-[var(--text)] font-semibold text-sm hover:bg-[var(--tertiary)]/50 transition'>
          Details
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
