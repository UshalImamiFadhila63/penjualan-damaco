const PURCHASE_ORDER_STATUSES = Object.freeze([
  'PO_RECEIVED',
  'DEALER_VERIFIED',
  'AWAITING_PAYMENT',
  'PAID',
  'SHIPPED',
  'RECEIVED',
  'COMPLETED',
]);

class InvalidStatusTransitionError extends Error {
  constructor(currentStatus, requestedStatus) {
    super(`Invalid purchase order status transition: ${currentStatus} -> ${requestedStatus}`);
    this.name = 'InvalidStatusTransitionError';
    this.statusCode = 409;
  }
}

async function transitionPurchaseOrderStatus(pool, {
  purchaseOrderId,
  toStatus,
  changedBy = null,
  notes = null,
}) {
  const targetIndex = PURCHASE_ORDER_STATUSES.indexOf(toStatus);
  if (targetIndex < 0) throw new InvalidStatusTransitionError('UNKNOWN', toStatus);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.execute(
      'SELECT id, status FROM purchase_orders WHERE id = ? FOR UPDATE',
      [purchaseOrderId]
    );
    if (!orders.length) {
      const error = new Error('Purchase order not found.');
      error.statusCode = 404;
      throw error;
    }
    const currentStatus = orders[0].status;
    if (PURCHASE_ORDER_STATUSES.indexOf(currentStatus) + 1 !== targetIndex) {
      throw new InvalidStatusTransitionError(currentStatus, toStatus);
    }

    await connection.execute('UPDATE purchase_orders SET status = ? WHERE id = ?', [toStatus, purchaseOrderId]);
    await connection.execute(
      `INSERT INTO status_histories
         (entity_type, entity_id, from_status, to_status, changed_by, notes)
       VALUES ('PURCHASE_ORDER', ?, ?, ?, ?, ?)`,
      [purchaseOrderId, currentStatus, toStatus, changedBy, notes]
    );
    await connection.commit();
    return { id: Number(purchaseOrderId), fromStatus: currentStatus, toStatus };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  PURCHASE_ORDER_STATUSES,
  InvalidStatusTransitionError,
  transitionPurchaseOrderStatus,
};
